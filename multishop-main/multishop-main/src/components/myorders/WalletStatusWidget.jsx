/**
 * WalletStatusWidget - Widget hiển thị trạng thái ví trên order detail
 * UI Layer
 */

import React from 'react';
import { Wallet, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletStatusCard from '@/components/preorder/escrow/WalletStatusCard';
import TransactionList from '@/components/preorder/escrow/TransactionList';
import { useOrderWallet, useWalletTransactions } from '@/components/hooks/useEscrow';

export default function WalletStatusWidget({ orderId, orderNumber }) {
  const { data: wallet, isLoading: loadingWallet } = useOrderWallet(orderId);
  const { data: transactions, isLoading: loadingTx } = useWalletTransactions(wallet?.id);

  if (!orderId) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          Xem ví escrow
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ví Escrow - #{orderNumber}</DialogTitle>
        </DialogHeader>

        {loadingWallet ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !wallet ? (
          <div className="text-center py-12">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có ví escrow</p>
          </div>
        ) : (
          <Tabs defaultValue="status">
            <TabsList className="w-full">
              <TabsTrigger value="status" className="flex-1">Trạng thái</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Giao dịch</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="mt-4">
              <WalletStatusCard wallet={wallet} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <div className="bg-white rounded-xl border">
                <TransactionList 
                  transactions={transactions || []} 
                  isLoading={loadingTx}
                  maxItems={20}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}