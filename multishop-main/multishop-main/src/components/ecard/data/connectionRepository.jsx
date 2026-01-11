/**
 * Connection Repository - Data Access Layer
 * Handles all connection data operations
 */

import { base44 } from '@/api/base44Client';
import { CONNECTION_STATUS, CONNECTION_METHODS, CARE_LEVELS, DEFAULT_THEME_COLOR, DESIGN_TEMPLATES } from '../types';

/**
 * Get or create initiator profile (helper)
 * Auto-creates profile for new users who connect
 * NOTE: Uses base44.auth.me() instead of User.filter to avoid permission issues
 */
const getOrCreateInitiatorProfile = async (initiatorId) => {
  // Try to find existing profile
  const profiles = await base44.entities.EcardProfile.filter({
    user_id: initiatorId
  });
  
  if (profiles.length > 0) {
    return profiles[0];
  }
  
  // Create a basic profile for the new user using current user info
  try {
    // Use auth.me() instead of User.filter to avoid permission denied
    const currentUser = await base44.auth.me();
    
    if (!currentUser || currentUser.id !== initiatorId) {
      console.error('Current user mismatch or not found');
      return null;
    }
    
    const slug = `${currentUser.email.split('@')[0]}-${Date.now()}`.toLowerCase();
    
    const newProfile = await base44.entities.EcardProfile.create({
      user_id: initiatorId,
      public_url_slug: slug,
      display_name: currentUser.full_name || currentUser.email.split('@')[0],
      email: currentUser.email,
      design_template: DESIGN_TEMPLATES?.[0] || 'minimal',
      theme_color: DEFAULT_THEME_COLOR || '#7CB342',
      is_public: true,
      view_count: 0,
      contact_visibility: {
        phone: true,
        email: true,
        website: true,
        address: false
      },
      social_links: [],
      custom_fields: []
    });
    
    console.log('✅ Auto-created profile for new user:', currentUser.email);
    return newProfile;
  } catch (error) {
    console.error('Failed to auto-create initiator profile:', error);
    return null;
  }
};

/**
 * Increment connection count
 */
const incrementConnectionCount = async (profileId) => {
  const profiles = await base44.entities.EcardProfile.filter({ id: profileId });
  if (profiles && profiles[0]) {
    await base44.entities.EcardProfile.update(profileId, {
      connection_count: (profiles[0].connection_count || 0) + 1
    });
  }
};

/**
 * Create bidirectional connection (QR scan / link share)
 * FIXED: Check for duplicates properly using both user IDs
 * FIXED: Auto-create initiator profile if not exists
 */
export const createBidirectionalConnection = async (initiatorId, targetProfile) => {
  // Validate input
  if (!initiatorId) {
    throw new Error('Initiator ID is required');
  }
  if (!targetProfile || !targetProfile.user_id) {
    throw new Error('Target profile is required');
  }
  
  // Check self-connection early
  if (initiatorId === targetProfile.user_id) {
    throw new Error('SELF_CONNECTION');
  }
  
  // CRITICAL: Check existing connection A -> B by BOTH user IDs
  const existingAB = await base44.entities.UserConnection.filter({
    initiator_user_id: initiatorId,
    target_user_id: targetProfile.user_id
  });

  // If A->B exists, ensure B->A also exists
  if (existingAB.length > 0) {
    const existingBA = await base44.entities.UserConnection.filter({
      initiator_user_id: targetProfile.user_id,
      target_user_id: initiatorId
    });
    
    if (existingBA.length === 0) {
      // Create missing reverse connection B->A
      // Get or create initiator profile
      const initiatorProfile = await getOrCreateInitiatorProfile(initiatorId);
      // Get email from current auth user (avoid User.filter permission issues)
      const currentUser = await base44.auth.me();
      const initiatorEmail = currentUser?.email || null;
      
      if (initiatorProfile) {
        // VALIDATION: Ensure initiator target_name is never null
        const initiatorName = initiatorProfile.display_name || 
                              initiatorEmail?.split('@')[0] || 
                              'Người dùng';
        
        await base44.entities.UserConnection.create({
          initiator_user_id: targetProfile.user_id,
          target_user_id: initiatorId,
          target_name: initiatorName,
          target_avatar: initiatorProfile.profile_image_url || null,
          target_title: initiatorProfile.title_profession || null,
          target_company: initiatorProfile.company_name || null,
          target_slug: initiatorProfile.public_url_slug || null,
          target_email: initiatorEmail,
          status: CONNECTION_STATUS.ACCEPTED,
          connection_method: CONNECTION_METHODS.QR_SCAN,
          care_level: CARE_LEVELS.NORMAL,
          connected_date: new Date().toISOString(),
          gift_count: 0
        });
      }
    }
    
    return { connection: existingAB[0], isNew: false };
  }
  
  // Check existing reverse connection B -> A (in case A->B was deleted but B->A still exists)
  const existingBA = await base44.entities.UserConnection.filter({
    initiator_user_id: targetProfile.user_id,
    target_user_id: initiatorId
  });
  
  if (existingBA.length > 0) {
    // Get target email from profile (avoid User.filter permission issues)
    const targetEmail = targetProfile.email || null;

    // VALIDATION: Ensure target_name is never null
    const targetName = targetProfile.display_name || 
                       targetEmail?.split('@')[0] || 
                       'Người dùng';

    // Create missing A -> B connection only
    const connectionAB = await base44.entities.UserConnection.create({
      initiator_user_id: initiatorId,
      target_user_id: targetProfile.user_id,
      target_name: targetName,
      target_avatar: targetProfile.profile_image_url || null,
      target_title: targetProfile.title_profession || null,
      target_company: targetProfile.company_name || null,
      target_slug: targetProfile.public_url_slug || null,
      target_email: targetEmail,
      status: CONNECTION_STATUS.ACCEPTED,
      connection_method: CONNECTION_METHODS.QR_SCAN,
      care_level: CARE_LEVELS.NORMAL,
      connected_date: new Date().toISOString(),
      gift_count: 0
    });
    
    return { connection: connectionAB, isNew: false };
  }

  // Get initiator's profile and email first (auto-create if not exists)
  const initiatorProfile = await getOrCreateInitiatorProfile(initiatorId);
  
  // Get target email from profile (avoid User.filter permission issues)
  const targetEmail = targetProfile.email || null;
  
  // Get initiator email from current auth user
  const currentUser = await base44.auth.me();
  const initiatorEmail = currentUser?.email || null;
  
  // VALIDATION: Ensure target_name is never null
  const targetName = targetProfile.display_name || 
                     targetEmail?.split('@')[0] || 
                     'Người dùng';

  // Create connection A -> B
  const connectionAB = await base44.entities.UserConnection.create({
    initiator_user_id: initiatorId,
    target_user_id: targetProfile.user_id,
    target_name: targetName,
    target_avatar: targetProfile.profile_image_url || null,
    target_title: targetProfile.title_profession || null,
    target_company: targetProfile.company_name || null,
    target_slug: targetProfile.public_url_slug || null,
    target_email: targetEmail,
    status: CONNECTION_STATUS.ACCEPTED,
    connection_method: CONNECTION_METHODS.QR_SCAN,
    care_level: CARE_LEVELS.NORMAL,
    connected_date: new Date().toISOString(),
    gift_count: 0
  });

  // Create connection B -> A
  if (initiatorProfile) {
    // VALIDATION: Ensure initiator target_name is never null
    const initiatorName = initiatorProfile.display_name || 
                          initiatorEmail?.split('@')[0] || 
                          'Người dùng';
    
    await base44.entities.UserConnection.create({
      initiator_user_id: targetProfile.user_id,
      target_user_id: initiatorId,
      target_name: initiatorName,
      target_avatar: initiatorProfile.profile_image_url || null,
      target_title: initiatorProfile.title_profession || null,
      target_company: initiatorProfile.company_name || null,
      target_slug: initiatorProfile.public_url_slug || null,
      target_email: initiatorEmail,
      status: CONNECTION_STATUS.ACCEPTED,
      connection_method: CONNECTION_METHODS.QR_SCAN,
      care_level: CARE_LEVELS.NORMAL,
      connected_date: new Date().toISOString(),
      gift_count: 0
    });

    // Tăng connection_count cho cả 2 profiles
    await incrementConnectionCount(initiatorProfile.id);
    await incrementConnectionCount(targetProfile.id);
    
    // Send notification to target user
    if (targetEmail) {
      try {
        const { NotificationServiceFacade } = await import('../../features/notification');
        await NotificationServiceFacade.notifyNewConnection({
          recipientEmail: targetEmail,
          actorName: initiatorProfile.display_name,
          actorEmail: initiatorEmail,
          connectionId: connectionAB.id,
          targetUserId: initiatorId
        });
        console.log('✅ Connection notification sent to:', targetEmail);
      } catch (err) {
        console.error('❌ Failed to send connection notification:', err);
      }
    }
  }

  return { connection: connectionAB, isNew: true };
};

/**
 * List connections for user
 * OPTIMIZED: Single query with sort, limited fields
 */
export const listConnections = async (userId) => {
  // Query with sort to get most recent first, limit to reasonable number
  return base44.entities.UserConnection.filter(
    {
      initiator_user_id: userId,
      status: CONNECTION_STATUS.ACCEPTED
    },
    '-connected_date', // Sort by connected_date descending
    100 // Limit to 100 connections for performance
  );
};

/**
 * Update care level
 */
export const updateCareLevel = async (connectionId, newLevel) => {
  return base44.entities.UserConnection.update(connectionId, {
    care_level: newLevel
  });
};

/**
 * Accept connection request
 */
export const acceptRequest = async (connectionId) => {
  return base44.entities.UserConnection.update(connectionId, {
    status: CONNECTION_STATUS.ACCEPTED
  });
};

/**
 * Delete connection and associated chat messages
 * Deletes ONLY the initiator's side - preserves other user's connection and chat history
 */
export const deleteConnection = async (connectionId, initiatorId, targetUserId) => {
  // Delete the connection record
  await base44.entities.UserConnection.delete(connectionId);
  
  // Note: We DO NOT delete chat messages here
  // Reason: The other user still has their connection and should see the chat history
  // Messages use sender_user_id + receiver_user_id, not connection_id
  
  return { success: true };
};

/**
 * Delete connection bidirectionally (when user explicitly wants to remove all traces)
 * This also deletes all chat messages between the 2 users
 */
export const deleteConnectionFull = async (initiatorId, targetUserId) => {
  // Delete A -> B connection
  const connectionsAB = await base44.entities.UserConnection.filter({
    initiator_user_id: initiatorId,
    target_user_id: targetUserId
  });
  for (const conn of connectionsAB) {
    await base44.entities.UserConnection.delete(conn.id);
  }
  
  // Delete B -> A connection
  const connectionsBA = await base44.entities.UserConnection.filter({
    initiator_user_id: targetUserId,
    target_user_id: initiatorId
  });
  for (const conn of connectionsBA) {
    await base44.entities.UserConnection.delete(conn.id);
  }
  
  // Delete all chat messages between these 2 users
  const messagesAB = await base44.entities.ConnectionMessage.filter({
    sender_user_id: initiatorId,
    receiver_user_id: targetUserId
  });
  for (const msg of messagesAB) {
    await base44.entities.ConnectionMessage.delete(msg.id);
  }
  
  const messagesBA = await base44.entities.ConnectionMessage.filter({
    sender_user_id: targetUserId,
    receiver_user_id: initiatorId
  });
  for (const msg of messagesBA) {
    await base44.entities.ConnectionMessage.delete(msg.id);
  }
  
  return { success: true, deletedMessages: messagesAB.length + messagesBA.length };
};