import { useEffect, useRef, useState } from 'react';
import { experienceRepository } from '../data/experienceRepository';
import { eventBus } from '@/components/shared/events/EventBus';

export function useExperiencePlayer(experience) {
  const videoRef = useRef(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [viewCountSent, setViewCountSent] = useState(false);

  useEffect(() => {
    let timer;
    const el = videoRef.current;
    if (!el) return;

    eventBus.publish('experience_loaded', { id: experience?.id });

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAutoplayBlocked(true);
      return;
    }

    const conn = (typeof navigator !== 'undefined' && (navigator.connection || navigator.mozConnection || navigator.webkitConnection)) || null;
    if (conn && (conn.saveData || /2g/i.test(String(conn.effectiveType || '')))) {
      setAutoplayBlocked(true);
      return;
    }

    let playTimeout;

    const tryPlay = async () => {
      try {
        await el.play();
        if (playTimeout) { clearTimeout(playTimeout); playTimeout = undefined; }
        setAutoplayBlocked(false);
        timer = setTimeout(() => {
          if (!viewCountSent) {
            experienceRepository.incrementView(experience?.id);
            eventBus.publish('experience_view_incremented', { id: experience?.id });
            setViewCountSent(true);
          }
        }, 3000);
      } catch (err) {
        setAutoplayBlocked(true);
        eventBus.publish('autoplay_blocked', { id: experience?.id });
        eventBus.publish('experience_error', { id: experience?.id, message: err?.message || 'play_failed' });
      }
    };

    // Set attributes
    el.muted = true;
    el.playsInline = true;

    const startPlay = () => {
      playTimeout = setTimeout(() => setAutoplayBlocked(true), 1500);
      tryPlay();
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          startPlay();
        }
      }, { threshold: 0.25 });
      io.observe(el);
    } else {
      startPlay();
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (playTimeout) clearTimeout(playTimeout);
    };
  }, [experience?.id]);

  return { videoRef, autoplayBlocked };
}

export default useExperiencePlayer;