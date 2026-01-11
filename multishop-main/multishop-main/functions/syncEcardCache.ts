/**
 * syncEcardCache - Backend function to sync EcardCache data
 * Called by scheduled task every hour OR on-demand when cache is stale
 * 
 * Endpoint: POST /syncEcardCache
 * Payload: { user_email?: string } - If provided, sync specific user; otherwise sync caller
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = body.user_email || user.email;

    // Security: Only admin can sync other users
    if (targetEmail !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ========== FETCH ALL DATA IN PARALLEL ==========
    
    const [
      ecardProfiles,
      userPosts,
      shopProducts,
      connections,
      giftsReceived,
      giftsSent,
      existingCache
    ] = await Promise.all([
      // EcardProfile
      base44.asServiceRole.entities.EcardProfile.filter({ created_by: targetEmail }),
      
      // UserPost count
      base44.asServiceRole.entities.UserPost.filter({ 
        created_by: targetEmail, 
        status: 'active' 
      }),
      
      // ShopProduct count
      base44.asServiceRole.entities.ShopProduct.filter({ 
        created_by: targetEmail, 
        status: 'active' 
      }).catch(() => []),
      
      // UserConnection (top 20, sorted by recent)
      base44.asServiceRole.entities.UserConnection.filter({ 
        created_by: targetEmail 
      }),
      
      // GiftTransaction received
      base44.asServiceRole.entities.GiftTransaction.filter({ 
        to_user_email: targetEmail 
      }).catch(() => []),
      
      // GiftTransaction sent
      base44.asServiceRole.entities.GiftTransaction.filter({ 
        from_user_email: targetEmail 
      }).catch(() => []),
      
      // Existing cache
      base44.asServiceRole.entities.EcardCache.filter({ user_email: targetEmail })
    ]);

    // ========== PROCESS DATA ==========

    const profile = ecardProfiles[0] || null;
    
    // Profile snapshot
    const profileSnapshot = profile ? {
      display_name: profile.display_name,
      avatar_url: profile.profile_image_url,
      slug: profile.public_url_slug,
      title: profile.title_profession,
      company: profile.company_name
    } : { display_name: targetEmail.split('@')[0] };

    // Stats
    const stats = {
      post_count: userPosts.length,
      product_count: shopProducts.length,
      connection_count: connections.length,
      gifts_received_count: giftsReceived.length,
      gifts_sent_count: giftsSent.length,
      view_count: profile?.view_count || 0
    };

    // Enrich connections (top 20)
    const sortedConnections = connections
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 20);

    // Batch fetch EcardProfiles for connections
    const connectionEmails = sortedConnections.map(c => c.target_user_email).filter(Boolean);
    const connectionProfiles = connectionEmails.length > 0
      ? await base44.asServiceRole.entities.EcardProfile.filter({})
          .then(all => all.filter(p => connectionEmails.includes(p.created_by)))
      : [];

    const profileMap = {};
    connectionProfiles.forEach(p => {
      profileMap[p.created_by] = p;
    });

    const connectionsPreview = sortedConnections.map(conn => {
      const targetProfile = profileMap[conn.target_user_email];
      return {
        id: conn.id,
        target_user_email: conn.target_user_email,
        display_name: targetProfile?.display_name || conn.target_user_email?.split('@')[0] || 'Unknown',
        avatar_url: targetProfile?.profile_image_url || null,
        slug: targetProfile?.public_url_slug || null,
        care_level: conn.care_level || 'normal',
        connected_at: conn.created_date
      };
    });

    // Gifts summary (recent 5 each)
    const formatGift = (g) => ({
      id: g.id,
      product_name: g.product_name,
      product_image: g.product_image,
      from_email: g.from_user_email,
      to_email: g.to_user_email,
      status: g.status,
      created_date: g.created_date
    });

    const giftsSummary = {
      recent_received: giftsReceived
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5)
        .map(formatGift),
      recent_sent: giftsSent
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5)
        .map(formatGift)
    };

    // ========== UPSERT CACHE ==========

    const cacheData = {
      profile_snapshot: profileSnapshot,
      stats,
      connections_preview: connectionsPreview,
      gifts_summary: giftsSummary,
      last_synced_at: new Date().toISOString()
    };

    let result;
    if (existingCache.length > 0) {
      // Update existing
      result = await base44.asServiceRole.entities.EcardCache.update(
        existingCache[0].id,
        {
          ...cacheData,
          sync_version: (existingCache[0].sync_version || 0) + 1
        }
      );
    } else {
      // Create new
      result = await base44.asServiceRole.entities.EcardCache.create({
        user_id: user.id,
        user_email: targetEmail,
        ...cacheData,
        sync_version: 1
      });
    }

    return Response.json({
      success: true,
      cache_id: result.id,
      stats,
      connections_count: connectionsPreview.length,
      synced_at: cacheData.last_synced_at
    });

  } catch (error) {
    console.error('syncEcardCache error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});