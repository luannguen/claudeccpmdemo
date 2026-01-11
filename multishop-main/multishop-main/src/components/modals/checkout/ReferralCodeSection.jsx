/**
 * ReferralCodeSection - Hiển thị referral code trong checkout
 * UI Layer - Presentation only
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Input } from '@/components/ui/input';

export default function ReferralCodeSection({ 
  referralCode, 
  referrer, 
  onApplyCustomCode, 
  onRemove,
  isValidating 
}) {
  const [customCode, setCustomCode] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  
  const handleApplyCustom = () => {
    if (customCode.trim()) {
      onApplyCustomCode(customCode.trim());
      setShowCustomInput(false);
      setCustomCode('');
    }
  };
  
  if (referralCode && referrer) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon.Gift size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Được giới thiệu bởi {referrer.name}
                </p>
                <Badge variant="outline" className="bg-white text-green-700 border-green-300 mt-1">
                  Mã: {referralCode}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={onRemove} 
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-red-600"
            >
              <Icon.XCircle size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (showCustomInput) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Nhập mã giới thiệu (nếu có):</p>
            <div className="flex gap-2">
              <Input 
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="VD: ABC1234"
                className="flex-1"
                maxLength={10}
              />
              <Button 
                onClick={handleApplyCustom}
                disabled={!customCode.trim() || isValidating}
                size="sm"
              >
                {isValidating ? <Icon.Spinner size={16} /> : 'Áp dụng'}
              </Button>
              <Button 
                onClick={() => setShowCustomInput(false)}
                variant="ghost"
                size="sm"
              >
                Hủy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Button 
      onClick={() => setShowCustomInput(true)}
      variant="outline"
      className="w-full gap-2"
    >
      <Icon.Tag size={16} />
      Có mã giới thiệu?
    </Button>
  );
}