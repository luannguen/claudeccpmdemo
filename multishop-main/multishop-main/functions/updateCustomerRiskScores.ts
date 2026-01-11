/**
 * updateCustomerRiskScores - Scheduled function (Daily 4AM)
 * 
 * Recalculate risk scores cho customers
 * Update trust tiers
 * Flag high-risk cases
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const asServiceRole = base44.asServiceRole;

    const results = {
      profiles_updated: 0,
      high_risk_flagged: [],
      blacklist_recommended: [],
      errors: []
    };

    // Get all risk profiles
    const profiles = await asServiceRole.entities.CustomerRiskProfile.filter({});

    for (const profile of profiles) {
      try {
        const orderStats = profile.order_stats || {};
        const preorderStats = profile.preorder_stats || {};
        
        let riskScore = 0;
        const riskFactors = [];
        const riskFlags = [];

        // Factor 1: Cancel rate (max 30)
        const cancelRate = orderStats.total_orders > 0 
          ? (orderStats.cancelled_orders / orderStats.total_orders) * 100 
          : 0;
        
        if (cancelRate >= 50) {
          riskScore += 30;
          riskFlags.push('high_cancel_rate');
          riskFactors.push({
            factor: 'cancel_rate',
            weight: 30,
            description: `Tỉ lệ hủy: ${cancelRate.toFixed(1)}%`,
            detected_at: new Date().toISOString()
          });
        } else if (cancelRate >= 30) {
          riskScore += 15;
        }

        // Factor 2: Disputes (max 20)
        if (orderStats.disputes_opened >= 3) {
          riskScore += 20;
          riskFlags.push('dispute_abuse');
          riskFactors.push({
            factor: 'disputes',
            weight: 20,
            description: `${orderStats.disputes_opened} disputes`,
            detected_at: new Date().toISOString()
          });
        }

        // Factor 3: Refunds (max 15)
        if (orderStats.refunds_requested >= 5) {
          riskScore += 15;
          riskFlags.push('refund_abuse');
        }

        // Factor 4: Multiple devices (max 10)
        const deviceCount = (profile.device_fingerprints || []).length;
        if (deviceCount >= 3) {
          riskScore += 10;
          riskFlags.push('multi_device');
        }

        // Factor 5: Multiple addresses (max 10)
        const addressCount = (profile.shipping_addresses || []).length;
        if (addressCount >= 5) {
          riskScore += 10;
          riskFlags.push('multi_address');
        }

        // Factor 6: Preorder cancel rate (max 15)
        if (preorderStats.cancel_rate_preorder >= 30) {
          riskScore += 15;
          riskFlags.push('bulk_then_cancel');
        }

        // Determine risk level
        let riskLevel = 'low';
        if (riskScore >= 60) {
          riskLevel = 'critical';
        } else if (riskScore >= 40) {
          riskLevel = 'high';
        } else if (riskScore >= 20) {
          riskLevel = 'medium';
        }

        // Trust score (inverse)
        let trustScore = Math.max(0, 100 - riskScore);
        
        // Boost for completed orders
        if (orderStats.completed_orders >= 25) {
          trustScore = Math.min(100, trustScore + 20);
        } else if (orderStats.completed_orders >= 10) {
          trustScore = Math.min(100, trustScore + 10);
        }

        // Trust tier
        let trustTier = 'new';
        if (orderStats.completed_orders >= 25 && trustScore >= 80) {
          trustTier = 'vip';
        } else if (orderStats.completed_orders >= 10 && trustScore >= 60) {
          trustTier = 'trusted';
        } else if (orderStats.completed_orders >= 3 && trustScore >= 40) {
          trustTier = 'basic';
        }

        // Restrictions
        const restrictions = {};
        if (riskLevel === 'critical') {
          restrictions.require_manual_approval = true;
          restrictions.require_full_payment = true;
          restrictions.max_preorder_quantity = 5;
          restrictions.max_active_preorders = 2;
        } else if (riskLevel === 'high') {
          restrictions.require_full_payment = true;
          restrictions.max_preorder_quantity = 10;
          restrictions.max_active_preorders = 5;
        }

        // Update profile
        await asServiceRole.entities.CustomerRiskProfile.update(profile.id, {
          risk_score: riskScore,
          risk_level: riskLevel,
          risk_flags: riskFlags,
          risk_factors: riskFactors,
          trust_score: trustScore,
          trust_tier: trustTier,
          restrictions,
          risk_updated_at: new Date().toISOString()
        });

        results.profiles_updated++;

        // Flag high risk
        if (riskLevel === 'high' || riskLevel === 'critical') {
          results.high_risk_flagged.push({
            customer_email: profile.customer_email,
            risk_level: riskLevel,
            risk_score: riskScore
          });
        }

        // Recommend blacklist for extreme cases
        if (riskScore >= 80 && !profile.is_blacklisted) {
          results.blacklist_recommended.push({
            customer_email: profile.customer_email,
            risk_score: riskScore,
            reasons: riskFlags
          });
        }

      } catch (error) {
        results.errors.push({
          customer_email: profile.customer_email,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      summary: {
        profiles_updated: results.profiles_updated,
        high_risk_flagged: results.high_risk_flagged.length,
        blacklist_recommended: results.blacklist_recommended.length,
        errors: results.errors.length
      },
      details: results,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});