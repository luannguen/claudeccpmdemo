import { useQuery } from '@tanstack/react-query';
import { experienceRepository } from '@/components/features/experience/data/experienceRepository';

export function useExperiencePreview(profile) {
  return useQuery({
    queryKey: ['experience-preview', profile?.experience_id],
    enabled: !!profile?.experience_id,
    queryFn: async () => {
      const exp = await experienceRepository.resolveById(profile.experience_id);
      const strategy = experienceRepository.mapToStrategy(exp?.video_url);
      return { experience: exp, strategy };
    }
  });
}

export default useExperiencePreview;