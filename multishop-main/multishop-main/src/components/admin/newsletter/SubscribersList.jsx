import React from 'react';
import { Mail } from 'lucide-react';
import SubscriberCard from './SubscriberCard';

export default function SubscribersList({ subscribers, isLoading, onUpdateStatus, onDelete }) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl">
        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Chưa có subscribers nào</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subscribers.map((subscriber) => (
        <SubscriberCard
          key={subscriber.id}
          subscriber={subscriber}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}