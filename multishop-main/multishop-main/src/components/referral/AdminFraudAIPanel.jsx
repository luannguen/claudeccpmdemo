/**
 * AdminFraudAIPanel - AI-powered fraud detection dashboard
 * UI Layer - Presentation only
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

function FraudScoreBar({ score }) {
  const level = score < 30 ? 'low' : score < 60 ? 'medium' : 'high';
  const config = {
    low: { color: 'bg-green-500', text: 'Thấp', textColor: 'text-green-600' },
    medium: { color: 'bg-amber-500', text: 'Trung bình', textColor: 'text-amber-600' },
    high: { color: 'bg-red-500', text: 'Cao', textColor: 'text-red-600' }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Fraud Score</span>
        <Badge className={config[level].color}>{config[level].text}</Badge>
      </div>
      <Progress value={score} className={`h-3 ${config[level].color}`} />
      <p className={`text-2xl font-bold ${config[level].textColor}`}>{score}/100</p>
    </div>
  );
}

function SuspiciousPattern({ pattern, severity }) {
  const severityConfig = {
    low: { icon: Icon.Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    medium: { icon: Icon.AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    high: { icon: Icon.AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
  };
  
  const config = severityConfig[severity] || severityConfig.low;
  const IconComp = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}
    >
      <IconComp size={18} className={config.color} />
      <p className="text-sm flex-1">{pattern}</p>
    </motion.div>
  );
}

export default function AdminFraudAIPanel({ 
  member, 
  allMembers = [], 
  allCustomers = [], 
  allOrders = [] 
}) {
  // AI Analysis
  const fraudAnalysis = useMemo(() => {
    const patterns = [];
    let riskScore = 0;
    
    // 1. Same address analysis
    const memberCustomers = allCustomers.filter(c => c.referrer_id === member.id);
    const addressGroups = {};
    memberCustomers.forEach(c => {
      const addr = c.address || 'unknown';
      addressGroups[addr] = (addressGroups[addr] || 0) + 1;
    });
    
    Object.entries(addressGroups).forEach(([addr, count]) => {
      if (count >= 3 && addr !== 'unknown') {
        patterns.push({
          text: `${count} khách cùng địa chỉ: ${addr.substring(0, 30)}...`,
          severity: count >= 5 ? 'high' : 'medium'
        });
        riskScore += count >= 5 ? 20 : 10;
      }
    });
    
    // 2. Phone analysis
    const phoneGroups = {};
    memberCustomers.forEach(c => {
      const phone = c.phone || 'unknown';
      phoneGroups[phone] = (phoneGroups[phone] || 0) + 1;
    });
    
    Object.entries(phoneGroups).forEach(([phone, count]) => {
      if (count >= 2 && phone !== 'unknown') {
        patterns.push({
          text: `SĐT ${phone} có ${count} khách hàng`,
          severity: 'high'
        });
        riskScore += 25;
      }
    });
    
    // 3. COD cancellation rate
    const memberOrders = allOrders.filter(o => o.referrer_id === member.id);
    const codOrders = memberOrders.filter(o => o.payment_method === 'cod');
    const cancelledCOD = codOrders.filter(o => o.order_status === 'cancelled');
    
    if (codOrders.length > 0) {
      const cancelRate = (cancelledCOD.length / codOrders.length) * 100;
      if (cancelRate > 30) {
        patterns.push({
          text: `${cancelRate.toFixed(0)}% đơn COD bị hủy (${cancelledCOD.length}/${codOrders.length})`,
          severity: cancelRate > 50 ? 'high' : 'medium'
        });
        riskScore += cancelRate > 50 ? 20 : 10;
      }
    }
    
    // 4. End-of-month spike
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthOrders = memberOrders.filter(o => o.created_date?.startsWith(currentMonth));
    const endOfMonth = new Date().getDate() >= 25;
    
    if (endOfMonth && thisMonthOrders.length > 0) {
      const last5Days = thisMonthOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.getDate() >= 25;
      });
      
      const spikeRate = (last5Days.length / thisMonthOrders.length) * 100;
      if (spikeRate > 70) {
        patterns.push({
          text: `${spikeRate.toFixed(0)}% đơn tập trung 5 ngày cuối tháng`,
          severity: 'high'
        });
        riskScore += 15;
      }
    }
    
    // 5. Rapid customer acquisition
    const recentCustomers = memberCustomers.filter(c => {
      const days = Math.floor((new Date() - new Date(c.referred_date || c.created_date)) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    
    if (recentCustomers.length >= 10) {
      patterns.push({
        text: `Tuyển ${recentCustomers.length} khách trong 7 ngày qua (bất thường)`,
        severity: 'medium'
      });
      riskScore += 10;
    }
    
    return {
      riskScore: Math.min(100, riskScore),
      patterns,
      level: riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high'
    };
  }, [member, allCustomers, allOrders]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Shield size={20} className="text-blue-600" />
            AI Fraud Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FraudScoreBar score={fraudAnalysis.riskScore} />
          
          {fraudAnalysis.patterns.length === 0 ? (
            <div className="text-center py-6 text-green-600">
              <Icon.ShieldCheck size={48} className="mx-auto mb-2" />
              <p className="font-semibold">Không phát hiện dấu hiệu bất thường</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Dấu hiệu đáng chú ý:</p>
              {fraudAnalysis.patterns.map((pattern, i) => (
                <SuspiciousPattern key={i} pattern={pattern.text} severity={pattern.severity} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}