/**
 * Tester Dashboard Service - Data layer cho Tester Portal
 * Architecture: Service Layer (theo AI-CODING-RULES)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== TESTER STATS ==========

export async function getTesterStats(testerEmail) {
  try {
    const [profile, features] = await Promise.all([
      base44.entities.TesterProfile.filter({ user_email: testerEmail }),
      base44.entities.Feature.list('-created_date', 500)
    ]);

    const testerProfile = profile[0] || null;
    
    // Collect all test cases assigned to tester
    const allTestCases = [];
    features.forEach(f => {
      if (f.test_cases) {
        f.test_cases.forEach(tc => {
          if (tc.assigned_tester === testerEmail || tc.tester_email === testerEmail) {
            allTestCases.push({ ...tc, featureId: f.id, featureName: f.name, featureVersion: f.version });
          }
        });
      }
    });

    const stats = {
      total: allTestCases.length,
      pending: allTestCases.filter(tc => tc.status === 'pending').length,
      passed: allTestCases.filter(tc => tc.status === 'passed').length,
      failed: allTestCases.filter(tc => tc.status === 'failed').length,
      ready_for_retest: allTestCases.filter(tc => tc.status === 'ready_for_retest').length,
      blocked: allTestCases.filter(tc => tc.status === 'blocked').length,
      skipped: allTestCases.filter(tc => tc.status === 'skipped').length
    };

    const dashboardStats = {
      readyForRetest: allTestCases.filter(tc => tc.status === 'ready_for_retest'),
      pendingTests: allTestCases.filter(tc => tc.status === 'pending'),
      recentlyTested: allTestCases
        .filter(tc => tc.tested_at)
        .sort((a, b) => new Date(b.tested_at) - new Date(a.tested_at))
        .slice(0, 10)
    };

    const assignedFeatures = features.filter(f => 
      testerProfile?.assigned_features?.includes(f.id) ||
      f.assigned_testers?.includes(testerEmail)
    );

    return success({
      profile: testerProfile,
      stats,
      dashboardStats,
      assignedFeatures,
      allTestCases
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== COMPARISON & INSIGHTS ==========

export async function getTestComparison(testerEmail, compareWith = 'team_average') {
  try {
    const allProfiles = await base44.entities.TesterProfile.list('-total_tests_completed', 100);
    const myProfile = allProfiles.find(p => p.user_email === testerEmail);
    
    if (!myProfile) {
      return failure('Profile not found', ErrorCodes.NOT_FOUND);
    }

    const teamAvg = {
      total_tests: Math.round(allProfiles.reduce((sum, p) => sum + (p.total_tests_completed || 0), 0) / allProfiles.length),
      total_bugs: Math.round(allProfiles.reduce((sum, p) => sum + (p.total_bugs_found || 0), 0) / allProfiles.length),
      pass_rate: Math.round(
        allProfiles.reduce((sum, p) => {
          const total = p.total_tests_completed || 1;
          return sum + ((p.total_passed || 0) / total * 100);
        }, 0) / allProfiles.length
      )
    };

    const myPassRate = myProfile.total_tests_completed > 0
      ? Math.round((myProfile.total_passed / myProfile.total_tests_completed) * 100)
      : 0;

    const comparison = {
      tests_vs_avg: (myProfile.total_tests_completed || 0) - teamAvg.total_tests,
      bugs_vs_avg: (myProfile.total_bugs_found || 0) - teamAvg.total_bugs,
      pass_rate_vs_avg: myPassRate - teamAvg.pass_rate,
      rank: allProfiles.findIndex(p => p.user_email === testerEmail) + 1,
      total_testers: allProfiles.length
    };

    return success({
      myProfile,
      teamAvg,
      comparison,
      leaderboard: allProfiles.slice(0, 10)
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== TIME TRACKING ==========

export async function getTestTimeStats(testerEmail) {
  try {
    const features = await base44.entities.Feature.list('-created_date', 500);
    
    const testHistory = [];
    features.forEach(f => {
      if (f.test_cases) {
        f.test_cases.forEach(tc => {
          if ((tc.tester_email === testerEmail || tc.assigned_tester === testerEmail) && tc.test_history) {
            tc.test_history.forEach(h => {
              if (h.tester_email === testerEmail) {
                testHistory.push({
                  ...h,
                  testCaseId: tc.id,
                  testCaseTitle: tc.title,
                  featureName: f.name
                });
              }
            });
          }
        });
      }
    });

    // Group by day
    const byDay = {};
    testHistory.forEach(h => {
      const day = new Date(h.timestamp).toISOString().split('T')[0];
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(h);
    });

    const dailyStats = Object.entries(byDay).map(([date, tests]) => ({
      date,
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length
    })).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

    return success({ dailyStats, testHistory });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== SUGGESTED TESTS ==========

export async function getSuggestedTests(testerEmail) {
  try {
    const profile = await base44.entities.TesterProfile.filter({ user_email: testerEmail });
    const features = await base44.entities.Feature.list('-priority', 500);
    
    const suggestions = [];
    
    features.forEach(f => {
      if (!f.test_cases) return;
      
      f.test_cases.forEach(tc => {
        // Suggest high priority pending tests
        if (tc.status === 'pending' && !tc.assigned_tester && f.priority === 'critical') {
          suggestions.push({
            testCase: tc,
            featureId: f.id,
            featureName: f.name,
            reason: 'High priority critical feature',
            score: 10
          });
        }
        
        // Suggest ready for retest
        if (tc.status === 'ready_for_retest' && (tc.assigned_tester === testerEmail || !tc.assigned_tester)) {
          suggestions.push({
            testCase: tc,
            featureId: f.id,
            featureName: f.name,
            reason: 'Developer fixed - ready for retest',
            score: 9
          });
        }
      });
    });

    suggestions.sort((a, b) => b.score - a.score);

    return success(suggestions.slice(0, 10));
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  getTesterStats,
  getTestComparison,
  getTestTimeStats,
  getSuggestedTests
};