// Data layer for Experience entity (no UI imports)
import { base44 } from "@/api/base44Client";
import { isValidUrl } from '../domain/rules';

export const experienceRepository = {
  async resolveByCode(code) {
    if (!code) return null;
    const list = await base44.entities.Experience.filter({ code, is_active: true }, undefined, 1);
    return Array.isArray(list) && list.length ? list[0] : null;
  },
  async incrementView(id) {
    if (!id) return;
    const list = await base44.entities.Experience.filter({ id }, undefined, 1);
    const exp = Array.isArray(list) && list.length ? list[0] : null;
    if (!exp) return;
    await base44.entities.Experience.update(id, { view_count: (exp.view_count || 0) + 1 });
  },
  mapToStrategy(videoUrl) {
    if (!videoUrl) return { type: 'none' };
    if (!isValidUrl(videoUrl)) return { type: 'none' };
    const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/i;
    const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i;
    if (yt.test(videoUrl)) return { type: 'youtube', id: videoUrl.match(yt)[1], url: videoUrl };
    if (vimeo.test(videoUrl)) return { type: 'vimeo', id: videoUrl.match(vimeo)[1], url: videoUrl };
    return { type: 'html5', url: videoUrl };
  },
  async findEcardSlugByOwnerUserId(owner_user_id) {
    if (!owner_user_id) return null;
    const profiles = await base44.entities.EcardProfile.filter({ user_id: owner_user_id }, undefined, 1);
    return Array.isArray(profiles) && profiles[0]?.public_url_slug ? profiles[0].public_url_slug : null;
  },
  async resolveById(id) {
    if (!id) return null;
    const list = await base44.entities.Experience.filter({ id }, undefined, 1);
    return Array.isArray(list) && list.length ? list[0] : null;
  },
  async upsert(data) {
    if (data?.id) {
      const updated = await base44.entities.Experience.update(data.id, data);
      return updated;
    }
    const created = await base44.entities.Experience.create(data);
    return created;
  }
};

export default experienceRepository;