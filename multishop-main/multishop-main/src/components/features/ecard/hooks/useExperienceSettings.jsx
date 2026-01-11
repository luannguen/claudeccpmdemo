import { useMutation, useQueryClient } from '@tanstack/react-query';
import { experienceRepository } from '../../experience/data/experienceRepository';
import { updateProfile as updateEcardProfile, regenerateQRCode } from '@/components/ecard/data/ecardRepository';

function generateCode(slug) {
  return `${slug}-${Math.random().toString(36).slice(2,8)}`.toLowerCase();
}

export function useExperienceSettings(profile) {
  const qc = useQueryClient();

  const saveIntro = useMutation({
    mutationFn: async ({ enableIntro, video_url, poster_url, cta_mode = 'ECARD', cta_custom_url }) => {
      if (!profile?.id) throw new Error('Missing profile');

      if (!enableIntro) {
        await updateEcardProfile(profile.id, { qr_mode: 'DIRECT' });
        // Regenerate QR to point to InviteAccept instead of Experience
        await regenerateQRCode({ ...profile, qr_mode: 'DIRECT', experience_id: null });
        return { profileUpdated: true };
      }

      let expId = profile.experience_id;
      let expCode;
      if (expId) {
        const updated = await experienceRepository.upsert({ id: expId, video_url, poster_url, cta_mode, cta_custom_url, is_active: true });
        expCode = updated?.code;
      } else {
        const code = generateCode(profile.public_url_slug || 'exp');
        const created = await experienceRepository.upsert({
          owner_user_id: profile.user_id,
          code,
          video_url,
          poster_url,
          cta_mode,
          cta_custom_url,
          is_active: true
        });
        expId = created?.id;
        expCode = created?.code;
      }

      // Update profile and regenerate QR to point to Experience page
      await updateEcardProfile(profile.id, { experience_id: expId, qr_mode: 'INTRO' });
      // Force regenerate QR code to use Experience link
      await regenerateQRCode({ ...profile, experience_id: expId, qr_mode: 'INTRO' });
      
      return { profileUpdated: true, expId, expCode };
    },
    onSuccess: () => {
      qc.invalidateQueries();
    }
  });

  const saveToggles = useMutation({
    mutationFn: async ({ show_posts, show_shop, show_contact }) => {
      if (!profile?.id) throw new Error('Missing profile');
      await updateEcardProfile(profile.id, { show_posts, show_shop, show_contact });
    },
    onSuccess: () => qc.invalidateQueries()
  });

  return { saveIntro, saveToggles };
}

export default useExperienceSettings;