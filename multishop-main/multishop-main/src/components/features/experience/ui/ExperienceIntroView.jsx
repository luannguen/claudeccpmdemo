import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useExperiencePlayer } from '../hooks/useExperiencePlayer';

export default function ExperienceIntroView({ experience, strategy, onCTA, onSkip }) {
  const { videoRef, autoplayBlocked } = useExperiencePlayer(experience);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="relative w-full max-w-screen-sm mx-auto flex-1 flex items-center justify-center">
        {/* Poster Fallback */}
        {autoplayBlocked && experience?.poster_url && (
          <img src={experience.poster_url} alt="poster" className="absolute inset-0 w-full h-full object-cover" onLoad={() => {
            // fire-and-forget event
            import('@/components/shared/events/EventBus').then(m => m.eventBus.publish('fallback_used', { id: experience?.id }));
          }} />
        )}

        {/* Player - HTML5 */}
        {strategy?.type === 'html5' && (
          <video
            ref={videoRef}
            src={strategy.url}
            poster={experience?.poster_url || undefined}
            playsInline
            muted
            className="w-full h-full object-contain bg-black"
            controls={autoplayBlocked}
          />
        )}

        {/* Player - YouTube */}
        {strategy?.type === 'youtube' && (
          <iframe
            src={`https://www.youtube.com/embed/${strategy.id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
            className="w-full h-full min-h-[300px] aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Intro"
          />
        )}

        {/* Player - Vimeo */}
        {strategy?.type === 'vimeo' && (
          <iframe
            src={`https://player.vimeo.com/video/${strategy.id}?autoplay=1&muted=1&playsinline=1`}
            className="w-full h-full min-h-[300px] aspect-video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video Intro"
          />
        )}

        {/* Unsupported */}
        {strategy?.type === 'none' && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <Icon.MonitorPlay size={32} className="text-white/80" />
            <p className="text-sm text-white/80">Video URL không hợp lệ hoặc chưa được cấu hình.</p>
          </div>
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <button onClick={onSkip} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm flex items-center gap-2 min-h-[44px]">
            <Icon.CornerDownLeft size={16} /> Bỏ qua
          </button>
          <button onClick={onCTA} className="px-4 py-2 rounded-lg bg-[#7CB342] hover:bg-[#689F38] text-sm font-medium flex items-center gap-2 min-h-[44px]">
            <Icon.ArrowRight size={16} /> Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}