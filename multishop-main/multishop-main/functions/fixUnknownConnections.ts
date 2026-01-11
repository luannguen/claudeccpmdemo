/**
 * Fix Unknown Connections - Data Migration Script
 * ECARD-BUG-001: Fix connections với target_name = null
 * 
 * Chạy 1 lần để sửa data cũ, sau đó có thể xóa function này
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // ADMIN ONLY
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('🔍 Searching for Unknown connections...');
    
    // Find all connections with target_name = null
    const allConnections = await base44.asServiceRole.entities.UserConnection.list('-created_date', 500);
    const unknownConnections = allConnections.filter(conn => !conn.target_name);
    
    console.log(`Found ${unknownConnections.length} connections with null target_name`);
    
    const results = {
      total: unknownConnections.length,
      fixed: 0,
      failed: 0,
      errors: []
    };

    // Fix each connection
    for (const conn of unknownConnections) {
      try {
        // Try to get target profile
        const profiles = await base44.asServiceRole.entities.EcardProfile.filter({
          user_id: conn.target_user_id
        });
        
        let targetName = 'Người dùng';
        
        if (profiles.length > 0) {
          const profile = profiles[0];
          targetName = profile.display_name || 
                       profile.email?.split('@')[0] || 
                       conn.target_email?.split('@')[0] || 
                       'Người dùng';
        } else if (conn.target_email) {
          targetName = conn.target_email.split('@')[0];
        }
        
        // Update connection
        await base44.asServiceRole.entities.UserConnection.update(conn.id, {
          target_name: targetName
        });
        
        results.fixed++;
        console.log(`✅ Fixed connection ${conn.id}: "${targetName}"`);
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          connectionId: conn.id,
          error: error.message
        });
        console.error(`❌ Failed to fix connection ${conn.id}:`, error.message);
      }
    }

    console.log(`
🎯 Migration Complete:
- Total: ${results.total}
- Fixed: ${results.fixed}
- Failed: ${results.failed}
    `);

    return Response.json({
      success: true,
      message: `Fixed ${results.fixed}/${results.total} connections`,
      results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});