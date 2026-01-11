/**
 * Cleanup Chat Sessions CRON Job
 * 
 * Deletes expired chat sessions (>3 days old)
 * Run daily via CRON
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate cutoff date (3 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 3);

    // Find expired sessions
    const allSessions = await base44.asServiceRole.entities.ChatSession.filter({});
    const expiredSessions = allSessions.filter(s => 
      new Date(s.expires_at) < new Date() || 
      new Date(s.created_date) < cutoffDate
    );

    // Delete expired sessions
    let deleted = 0;
    for (const session of expiredSessions) {
      await base44.asServiceRole.entities.ChatSession.delete(session.id);
      deleted++;
    }

    // Log cleanup
    console.log(`Cleanup: Deleted ${deleted} expired chat sessions`);

    return Response.json({
      success: true,
      deleted,
      cutoffDate: cutoffDate.toISOString(),
      remainingSessions: allSessions.length - deleted
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});