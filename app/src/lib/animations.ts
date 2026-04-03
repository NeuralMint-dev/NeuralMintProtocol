import gsap from 'gsap';
import Lenis from 'lenis';

/**
 * Default reveal easing tuned for editorial, premium-feeling entrances.
 */
export const REVEAL_EASE = 'power3.out';

/**
 * Initializes Lenis smooth scrolling driven by GSAP's ticker. Returns a cleanup
 * function that destroys the instance and detaches the ticker callback.
 */
export function initSmoothScroll(): () => void {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}

/**
 * Builds a staggered reveal timeline for a set of elements. Transform-only so
 * the animation stays on the compositor thread.
 */
export function revealTimeline(targets: gsap.TweenTarget): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: REVEAL_EASE, duration: 0.9 } });
  tl.from(targets, {
    yPercent: 18,
    autoAlpha: 0,
    stagger: 0.08,
  });
  return tl;
}
