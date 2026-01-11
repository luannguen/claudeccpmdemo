import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useExperience } from '@/components/features/experience/hooks/useExperience';
import ExperienceIntroView from '@/components/features/experience/ui/ExperienceIntroView';

export default function ExperiencePage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const navigate = useNavigate();
  
  // Force enable intro - this page is only accessed via QR scan
  const { experience, strategy, isLoading, computeCta } = useExperience(code, { forceEnable: true });
  const [ecardSlug, setEcardSlug] = useState(null);

  // Pre-compute the slug for skip/fallback
  useEffect(() => {
    const fetchSlug = async () => {
      if (experience?.owner_user_id) {
        try {
          const { experienceRepository } = await import('@/components/features/experience/data/experienceRepository');
          const slug = await experienceRepository.findEcardSlugByOwnerUserId(experience.owner_user_id);
          setEcardSlug(slug);
        } catch (err) {
          console.error('Failed to fetch slug:', err);
        }
      }
    };
    fetchSlug();
  }, [experience?.owner_user_id]);

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Icon.AlertCircle className="text-yellow-500 mx-auto mb-2" size={48} />
          <p>Thiếu mã trải nghiệm.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Icon.Spinner size={48} className="text-[#7CB342]" />
      </div>
    );
  }

  const onSkip = async () => {
    // Skip → E-Card view with slug
    if (ecardSlug) {
      navigate(createPageUrl(`EcardView?slug=${ecardSlug}`));
    } else if (experience?.owner_user_id) {
      // Try to get slug now
      try {
        const { experienceRepository } = await import('@/components/features/experience/data/experienceRepository');
        const slug = await experienceRepository.findEcardSlugByOwnerUserId(experience.owner_user_id);
        if (slug) {
          navigate(createPageUrl(`EcardView?slug=${slug}`));
          return;
        }
      } catch (err) {
        console.error('Skip: failed to get slug', err);
      }
      // Fallback to home
      navigate(createPageUrl('Home'));
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  // Experience not found or inactive → redirect to E-Card (no white screen)
  if (!experience || !experience.is_active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-black text-white">
        <Icon.AlertCircle size={48} className="text-yellow-500" />
        <p className="text-center">Trải nghiệm không khả dụng hoặc đã hết hạn.</p>
        <button 
          onClick={onSkip} 
          className="px-4 py-2 rounded-lg bg-[#7CB342] text-white hover:bg-[#689F38] min-h-[44px]"
        >
          Đi tới E‑Card
        </button>
      </div>
    );
  }

  const onCTA = async () => {
    const target = await computeCta();
    if (target.type === 'external') {
      window.open(target.url, '_blank', 'noopener,noreferrer');
    } else if (target.type === 'page') {
      const url = createPageUrl(target.params ? `${target.page}?${target.params}` : target.page);
      navigate(url);
    }
  };

  return (
    <ExperienceIntroView experience={experience} strategy={strategy} onCTA={onCTA} onSkip={onSkip} />
  );
}