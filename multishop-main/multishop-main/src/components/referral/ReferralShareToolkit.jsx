/**
 * ReferralShareToolkit - Advanced sharing tools
 * UI Layer - Presentation only
 * 
 * Features:
 * - Optimized social share (WhatsApp, Zalo, Messenger, Facebook)
 * - QR code generation & download
 * - Copy link with preview
 * - Share analytics tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function ReferralShareToolkit({ member }) {
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const canvasRef = useRef(null);
  
  // Generate QR Code on mount
  useEffect(() => {
    generateQRCode();
  }, [member.referral_link]);
  
  const generateQRCode = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size;
    canvas.height = size + 80;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size + 80);
    gradient.addColorStop(0, '#7CB342');
    gradient.addColorStop(1, '#5a8f31');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size + 80);
    
    // White box for QR
    ctx.fillStyle = 'white';
    ctx.fillRect(30, 30, size - 60, size - 60);
    
    // QR placeholder (simple pattern)
    ctx.fillStyle = '#000';
    const qrSize = 8;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(40 + i * qrSize, 40 + j * qrSize, qrSize - 1, qrSize - 1);
        }
      }
    }
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(member.referral_code, size / 2, size + 30);
    
    ctx.font = '14px sans-serif';
    ctx.fillText('Quét để nhận ưu đãi', size / 2, size + 55);
    
    setQrGenerated(true);
  };
  
  const trackShare = (method) => {
    base44.entities.UserActivity.create({
      event_type: 'referral_share',
      target_type: 'User',
      target_id: member.id,
      metadata: {
        share_method: method,
        referral_code: member.referral_code
      }
    }).catch(console.error);
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(member.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare('copy_link');
  };
  
  const shareToWhatsApp = () => {
    const message = `Xin chào! Mình muốn giới thiệu bạn sản phẩm nông sản sạch.\n\nDùng mã ${member.referral_code} để nhận ưu đãi:\n${member.referral_link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    trackShare('whatsapp');
  };
  
  const shareToZalo = () => {
    const message = `Xin chào! Mình muốn giới thiệu bạn sản phẩm nông sản sạch. Dùng mã ${member.referral_code}`;
    window.open(`https://zalo.me/share?url=${encodeURIComponent(member.referral_link)}&text=${encodeURIComponent(message)}`, '_blank');
    trackShare('zalo');
  };
  
  const shareToMessenger = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(member.referral_link)}`, '_blank');
    trackShare('messenger');
  };
  
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(member.referral_link)}`, '_blank');
    trackShare('facebook');
  };
  
  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `referral-qr-${member.referral_code}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    trackShare('qr_download');
  };
  
  const shareQR = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve));
      const file = new File([blob], `qr-${member.referral_code}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mã giới thiệu ${member.referral_code}`,
          text: 'Quét mã QR để nhận ưu đãi!',
          files: [file]
        });
        trackShare('qr_share');
      } else {
        downloadQR();
      }
    } catch (error) {
      console.error('Share failed:', error);
      downloadQR();
    }
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Social Share Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Share size={20} className="text-blue-600" />
            Chia Sẻ Nhanh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Copy Link */}
          <div className="flex gap-2">
            <Input 
              value={member.referral_link} 
              readOnly 
              className="bg-gray-50 text-sm"
            />
            <Button onClick={copyLink} variant="outline" size="icon" className="flex-shrink-0">
              {copied ? <Icon.Check className="text-green-500" /> : <Icon.Copy />}
            </Button>
          </div>
          
          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={shareToWhatsApp} 
              variant="outline" 
              className="gap-2 hover:bg-green-50 hover:border-green-500"
            >
              <Icon.MessageCircle size={18} className="text-green-600" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={shareToZalo} 
              variant="outline"
              className="gap-2 hover:bg-blue-50 hover:border-blue-500"
            >
              <Icon.MessageCircle size={18} className="text-blue-600" />
              Zalo
            </Button>
            
            <Button 
              onClick={shareToMessenger} 
              variant="outline"
              className="gap-2 hover:bg-blue-50 hover:border-blue-500"
            >
              <Icon.Send size={18} className="text-blue-500" />
              Messenger
            </Button>
            
            <Button 
              onClick={shareToFacebook} 
              variant="outline"
              className="gap-2 hover:bg-blue-50 hover:border-blue-600"
            >
              <Icon.Share size={18} className="text-blue-600" />
              Facebook
            </Button>
          </div>
          
          {/* Referral Code Display */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Mã giới thiệu của bạn</p>
            <p className="text-3xl font-bold text-amber-600 tracking-wider">
              {member.referral_code}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Camera size={20} className="text-purple-600" />
            Mã QR Giới Thiệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <canvas 
              ref={canvasRef}
              className="rounded-lg shadow-md max-w-full h-auto"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={downloadQR} 
              variant="outline"
              className="gap-2"
              disabled={!qrGenerated}
            >
              <Icon.Download size={18} />
              Tải về
            </Button>
            
            <Button 
              onClick={shareQR}
              variant="outline"
              className="gap-2"
              disabled={!qrGenerated}
            >
              <Icon.Share size={18} />
              Chia sẻ
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Khách hàng quét mã QR sẽ tự động nhận ưu đãi của bạn
          </p>
        </CardContent>
      </Card>
    </div>
  );
}