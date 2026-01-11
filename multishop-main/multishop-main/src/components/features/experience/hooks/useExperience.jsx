import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { experienceRepository } from '../data/experienceRepository';
import { getCtaTarget } from '../domain/rules';
import { isIntroEnabledForUser } from '../domain/featureFlags';

export function useExperience(code, { userId, userRole, forceEnable } = {}) {
  const isEnabled = isIntroEnabledForUser({ userId, userRole, forceEnable });
  
  const { data: experience, isLoading, error } = useQuery({
    queryKey: ['experience', code],
    queryFn: () => experienceRepository.resolveByCode(code),
    enabled: !!code && isEnabled,
  });

  const strategy = useMemo(() => experienceRepository.mapToStrategy(experience?.video_url), [experience]);

  const computeCta = async () => {
    const slug = await experienceRepository.findEcardSlugByOwnerUserId(experience?.owner_user_id);
    return getCtaTarget(experience, slug);
  };

  return { experience, strategy, isLoading, error, computeCta };
}

export default useExperience;