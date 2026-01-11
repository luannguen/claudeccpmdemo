/**
 * Connection Group Repository
 * Data layer - CRUD for ConnectionGroup entity
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Get all groups for current user
 */
async function getGroups() {
  const groups = await base44.entities.ConnectionGroup.list('-created_date', 100);
  return groups || [];
}

/**
 * Create a new group
 */
async function createGroup(name, color = '#7CB342', icon = 'Users', description = '') {
  return base44.entities.ConnectionGroup.create({
    name,
    color,
    icon,
    description,
    member_count: 0,
    is_default: false
  });
}

/**
 * Update a group
 */
async function updateGroup(groupId, updates) {
  return base44.entities.ConnectionGroup.update(groupId, updates);
}

/**
 * Delete a group
 */
async function deleteGroup(groupId) {
  // First, remove group from all connections
  const connections = await base44.entities.UserConnection.filter({
    group_ids: { $contains: groupId }
  });
  
  // Update each connection to remove this group
  for (const conn of (connections || [])) {
    const newGroupIds = (conn.group_ids || []).filter(id => id !== groupId);
    await base44.entities.UserConnection.update(conn.id, { group_ids: newGroupIds });
  }
  
  return base44.entities.ConnectionGroup.delete(groupId);
}

/**
 * Add connection to group
 */
async function addConnectionToGroup(connectionId, groupId) {
  const connection = await base44.entities.UserConnection.filter({ id: connectionId });
  if (!connection?.length) return null;
  
  const currentGroups = connection[0].group_ids || [];
  if (currentGroups.includes(groupId)) return connection[0];
  
  const result = await base44.entities.UserConnection.update(connectionId, {
    group_ids: [...currentGroups, groupId]
  });
  
  // Update member count
  await incrementMemberCount(groupId, 1);
  
  return result;
}

/**
 * Remove connection from group
 */
async function removeConnectionFromGroup(connectionId, groupId) {
  const connection = await base44.entities.UserConnection.filter({ id: connectionId });
  if (!connection?.length) return null;
  
  const currentGroups = connection[0].group_ids || [];
  const newGroups = currentGroups.filter(id => id !== groupId);
  
  const result = await base44.entities.UserConnection.update(connectionId, {
    group_ids: newGroups
  });
  
  // Update member count
  await incrementMemberCount(groupId, -1);
  
  return result;
}

/**
 * Get connections by group
 */
async function getConnectionsByGroup(groupId, userEmail) {
  const connections = await base44.entities.UserConnection.filter({
    created_by: userEmail,
    group_ids: { $contains: groupId }
  }, '-created_date', 500);
  
  return connections || [];
}

/**
 * Increment member count for a group
 */
async function incrementMemberCount(groupId, amount) {
  const group = await base44.entities.ConnectionGroup.filter({ id: groupId });
  if (!group?.length) return null;
  
  const currentCount = group[0].member_count || 0;
  return base44.entities.ConnectionGroup.update(groupId, {
    member_count: Math.max(0, currentCount + amount)
  });
}

/**
 * Bulk add connections to group
 */
async function bulkAddToGroup(connectionIds, groupId) {
  const results = [];
  for (const connId of connectionIds) {
    const result = await addConnectionToGroup(connId, groupId);
    results.push(result);
  }
  return results;
}

export const connectionGroupRepository = {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addConnectionToGroup,
  removeConnectionFromGroup,
  getConnectionsByGroup,
  incrementMemberCount,
  bulkAddToGroup
};