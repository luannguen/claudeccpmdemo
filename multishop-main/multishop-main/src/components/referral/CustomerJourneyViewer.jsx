/**
 * CustomerJourneyViewer - Visualize customer journey
 * UI Layer - Presentation only
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { useCustomerJourney } from '@/components/hooks/useReferralGamification';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

function TimelineEvent({ event, isLast }) {
  const IconComp = Icon[event.icon] || Icon.Circle;
  
  const typeColors = {
    referred: 'bg-blue-500',
    order: 'bg-green-500',
    engagement: 'bg-purple-500'
  };
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${typeColors[event.type] || 'bg-gray-400'} flex items-center justify-center`}>
          <IconComp size={18} className="text-white" />
        </div>
        {!isLast && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
      </div>
      
      <div className="flex-1 pb-8">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm text-gray-600">{event.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {format(new Date(event.date), 'dd/MM/yyyy HH:mm')}
        </p>
      </div>
    </div>
  );
}

function CustomerInsightCard({ insights }) {
  const statusConfig = {
    new: { label: 'Khách mới', color: 'bg-blue-100 text-blue-700', icon: Icon.UserPlus },
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700', icon: Icon.CheckCircle },
    loyal: { label: 'Khách trung thành', color: 'bg-purple-100 text-purple-700', icon: Icon.Heart }
  };
  
  const status = statusConfig[insights.status] || statusConfig.new;
  const StatusIcon = status.icon;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Icon.ShoppingCart size={24} className="mx-auto mb-1 text-blue-600" />
        <p className="text-2xl font-bold">{insights.totalOrders}</p>
        <p className="text-xs text-gray-500">Đơn hàng</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Icon.DollarSign size={24} className="mx-auto mb-1 text-green-600" />
        <p className="text-2xl font-bold">{(insights.totalSpent / 1000).toFixed(0)}K</p>
        <p className="text-xs text-gray-500">Tổng chi</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <Icon.Calendar size={24} className="mx-auto mb-1 text-purple-600" />
        <p className="text-2xl font-bold">{insights.daysSinceReferred}</p>
        <p className="text-xs text-gray-500">Ngày tham gia</p>
      </div>
      
      <div className={`rounded-lg p-3 text-center ${status.color}`}>
        <StatusIcon size={24} className="mx-auto mb-1" />
        <p className="text-sm font-semibold">{status.label}</p>
      </div>
    </div>
  );
}

export default function CustomerJourneyViewer({ customerId, customerName }) {
  const { data, isLoading } = useCustomerJourney(customerId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-100 rounded-lg" />
            <div className="h-24 bg-gray-100 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.MapPin size={20} className="text-blue-600" />
          Hành Trình: {customerName || data.customer?.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights */}
        <CustomerInsightCard insights={data.insights} />
        
        {/* Timeline */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Icon.Clock size={18} className="text-gray-600" />
            Dòng Thời Gian
          </h4>
          
          {data.timeline.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Chưa có hoạt động</p>
          ) : (
            <div className="space-y-1">
              {data.timeline.map((event, index) => (
                <TimelineEvent 
                  key={index} 
                  event={event} 
                  isLast={index === data.timeline.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}