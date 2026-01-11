/**
 * ReferralQRCode Component
 * UI Layer - QR Code generator with branding
 * 
 * @module features/referral/ui/share
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralQRCode({ member }) {
  const canvasRef = useRef(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  
  useEffect(() => {
    generateQRCode();
  }, [member.referral_link]);
  
  const generateQRCode = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300;
    
    canvas.width = size;
    canvas.height = size;
    
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#7CB342');
    gradient.addColorStop(1, '#FF9800');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    const qrSize = size * 0.7;
    const qrX = (size - qrSize) / 2;
    const qrY = (size - qrSize) / 2;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    
    ctx.fillStyle = '#0F0F0F';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(member.referral_code, size / 2, size / 2);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Zero Farm', size / 2, size - 30);
    
    setQrGenerated(true);
  };
  
  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `referral-qr-${member.referral_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success('Đã tải QR code');
  };
  
  const shareQR = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      const file = new File([blob], `qr-${member.referral_code}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: 'Mã giới thiệu Zero Farm',
          text: `Sử dụng mã ${member.referral_code} để được ưu đãi!`,
          files: [file]
        });
        toast.success('Đã chia sẻ');
      } else {
        downloadQR();
      }
    } catch (error) {
      console.error('Share error:', error);
      downloadQR();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-violet-500" />
          Mã QR Giới Thiệu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <canvas 
            ref={canvasRef}
            className="rounded-2xl shadow-lg max-w-full h-auto"
            style={{ maxWidth: '300px' }}
          />
          
          <div className="flex gap-3 w-full">
            <Button onClick={downloadQR} variant="outline" className="flex-1">
              <Icon.Download size={16} />
              Tải về
            </Button>
            <Button onClick={shareQR} className="flex-1 bg-[#7CB342] hover:bg-[#5a8f31]">
              <Icon.Send size={16} />
              Chia sẻ
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500">
            Khách hàng quét mã này để tự động áp dụng mã giới thiệu của bạn
          </p>
        </div>
      </CardContent>
    </Card>
  );
}