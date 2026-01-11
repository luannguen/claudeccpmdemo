/**
 * AdvancedFraudDetection - ML-based fraud pattern detection
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const FRAUD_PATTERNS = [
  {
    id: 'duplicate_address',
    name: 'Địa chỉ trùng lặp',
    severity: 'high',
    weight: 30,
    check: (member, allCustomers) => {
      const customers = allCustomers.filter(c => c.referrer_id === member.id);
      const addresses = customers.map(c => c.address?.toLowerCase().trim());
      const duplicates = addresses.filter((a, i) => addresses.indexOf(a) !== i);
      return { detected: duplicates.length > 2, count: duplicates.length };
    }
  },
  {
    id: 'duplicate_phone',
    name: 'SĐT trùng lặp',
    severity: 'high',
    weight: 25,
    check: (member, allCustomers) => {
      const customers = allCustomers.filter(c => c.referrer_id === member.id);
      const phones = customers.map(c => c.phone?.replace(/\s/g, ''));
      const duplicates = phones.filter((p, i) => phones.indexOf(p) !== i);
      return { detected: duplicates.length > 1, count: duplicates.length };
    }
  },
  {
    id: 'sudden_spike',
    name: 'Tăng đột biến',
    severity: 'medium',
    weight: 20,
    check: (member, allCustomers, orders) => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
      
      const thisMonthOrders = orders.filter(o => 
        o.referrer_id === member.id && 
        o.created_date?.startsWith(thisMonth)
      ).length;
      
      const lastMonthOrders = orders.filter(o => 
        o.referrer_id === member.id && 
        o.created_date?.startsWith(lastMonth)
      ).length;
      
      const spike = lastMonthOrders > 0 && (thisMonthOrders / lastMonthOrders) > 5;
      return { detected: spike, thisMonth: thisMonthOrders, lastMonth: lastMonthOrders };
    }
  },
  {
    id: 'end_of_month_surge',
    name: 'Tăng đột biến cuối tháng',
    severity: 'high',
    weight: 35,
    check: (member, allCustomers, orders) => {
      const now = new Date();
      const lastThreeDays = new Date(now.setDate(now.getDate() - 3));
      
      const recentOrders = orders.filter(o => 
        o.referrer_id === member.id && 
        new Date(o.created_date) >= lastThreeDays
      ).length;
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.created_date);
        return o.referrer_id === member.id && 
          orderDate.getMonth() === new Date().getMonth();
      }).length;
      
      const surge = monthOrders > 5 && (recentOrders / monthOrders) > 0.7;
      return { detected: surge, recent: recentOrders, total: monthOrders };
    }
  },
  {
    id: 'cod_failures',
    name: 'Nhiều COD thất bại',
    severity: 'medium',
    weight: 20,
    check: (member, allCustomers, orders) => {
      const codOrders = orders.filter(o => 
        o.referrer_id === member.id && 
        o.payment_method === 'cod'
      );
      
      const failedCOD = codOrders.filter(o => 
        o.order_status === 'cancelled'
      ).length;
      
      return { detected: failedCOD >= 3, count: failedCOD };
    }
  }
];

function FraudPatternItem({ pattern, result }) {
  const severityConfig = {
    high: { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
    medium: { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertTriangle },
    low: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: CheckCircle }
  };
  
  const config = severityConfig[pattern.severity] || severityConfig.low;
  const IconComponent = config.icon;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      result.detected ? config.bgColor : 'bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <IconComponent className={`w-5 h-5 ${result.detected ? config.color : 'text-gray-400'}`} />
        <div>
          <p className="text-sm font-medium">{pattern.name}</p>
          {result.detected && (
            <p className="text-xs text-gray-600">
              {JSON.stringify(result).slice(0, 100)}
            </p>
          )}
        </div>
      </div>
      
      <Badge className={result.detected ? config.color : 'bg-green-100 text-green-700'}>
        {result.detected ? `+${pattern.weight}` : 'OK'}
      </Badge>
    </div>
  );
}

export default function AdvancedFraudDetection({ member, allMembers = [], allCustomers = [], allOrders = [] }) {
  const fraudAnalysis = useMemo(() => {
    let totalScore = 0;
    const detectedPatterns = [];
    
    FRAUD_PATTERNS.forEach(pattern => {
      const result = pattern.check(member, allCustomers, allOrders);
      if (result.detected) {
        totalScore += pattern.weight;
        detectedPatterns.push({ pattern, result });
      }
    });
    
    const riskLevel = totalScore >= 70 ? 'critical' :
                      totalScore >= 50 ? 'high' :
                      totalScore >= 30 ? 'medium' : 'low';
    
    return { totalScore, detectedPatterns, riskLevel };
  }, [member, allCustomers, allOrders]);
  
  const riskConfig = {
    critical: { label: 'Rất nguy hiểm', color: 'bg-red-600 text-white', icon: XCircle },
    high: { label: 'Nguy hiểm', color: 'bg-red-500 text-white', icon: AlertTriangle },
    medium: { label: 'Cần theo dõi', color: 'bg-amber-500 text-white', icon: AlertTriangle },
    low: { label: 'An toàn', color: 'bg-green-500 text-white', icon: CheckCircle }
  };
  
  const risk = riskConfig[fraudAnalysis.riskLevel];
  const RiskIcon = risk.icon;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon.Shield size={20} className="text-blue-600" />
            Phân Tích Gian Lận (AI)
          </CardTitle>
          <Badge className={risk.color}>
            <RiskIcon className="w-3 h-3 mr-1" />
            {risk.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Fraud Score</span>
            <span className="text-2xl font-bold">{fraudAnalysis.totalScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div 
              className={`h-full ${
                fraudAnalysis.totalScore >= 70 ? 'bg-red-500' :
                fraudAnalysis.totalScore >= 50 ? 'bg-orange-500' :
                fraudAnalysis.totalScore >= 30 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${fraudAnalysis.totalScore}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">Patterns phát hiện:</h4>
          {FRAUD_PATTERNS.map(pattern => {
            const result = pattern.check(member, allCustomers, allOrders);
            return (
              <FraudPatternItem key={pattern.id} pattern={pattern} result={result} />
            );
          })}
        </div>
        
        {fraudAnalysis.totalScore >= 50 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium mb-2">⚠️ Khuyến nghị</p>
            <p className="text-sm text-red-600">
              Thành viên này có điểm fraud cao. Nên tạm đình chỉ và xem xét kỹ hơn trước khi thanh toán hoa hồng.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}