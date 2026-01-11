import React from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import ExperienceIntroView from '@/components/features/experience/ui/ExperienceIntroView';
import { useExperiencePreview } from '@/components/features/ecard/hooks/useExperiencePreview';
import { Icon } from '@/components/ui/AnimatedIcon';

export default function ExperienceTestPlayModal({ profile, isOpen = true, onClose }) {
  const { data, isLoading } = useExperiencePreview(profile);
  const experience = data?.experience;
  const strategy = data?.strategy;

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} title="Xem thử Intro" maxWidth="md" showControls={false} enableDrag={true} enableResize={false}>
      <div className="relative">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-gray-600">
            <Icon.Spinner size={24} className="text-[#7CB342]" />
          </div>
        )}
        {!isLoading && !experience && (
          <div className="p-6 text-center text-sm text-gray-600">Chưa có cấu hình Intro để xem thử.</div>
        )}
        {experience && (
          <div className="-m-4">
            <ExperienceIntroView
              experience={experience}
              strategy={strategy}
              onCTA={onClose}
              onSkip={onClose}
            />
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}