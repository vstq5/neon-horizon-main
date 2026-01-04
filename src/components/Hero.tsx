import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  introReady?: boolean;
}

const Hero = ({ introReady = true }: HeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const shape3Ref = useRef<HTMLDivElement>(null);

  const [mountSpline, setMountSpline] = useState(false);
  const [splineReady, setSplineReady] = useState(false);

  useEffect(() => {
    if (!introReady) {
      setMountSpline(false);
      setSplineReady(false);
      return;
    }

    // Always load Spline, but defer mounting the iframe until the browser is idle.
    // This reduces the initial load spike on slower devices without disabling the model.
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const mount = () => setMountSpline(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => number }).requestIdleCallback(
        mount,
        { timeout: 1200 }
      );
    } else {
      timeoutId = window.setTimeout(mount, 250);
    }

    return () => {
      if (typeof window !== 'undefined' && idleId !== undefined && 'cancelIdleCallback' in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [introReady]);

  useEffect(() => {
    if (!introReady) return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Main content animation
      const tl = gsap.timeline();

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 50, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'filter',
        }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', force3D: true },
          '-=0.5'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out', force3D: true },
          '-=0.3'
        );

      // Floating shapes animation
      gsap.to(shape1Ref.current, {
        y: -30,
        rotation: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        force3D: true,
        overwrite: 'auto',
      });

      gsap.to(shape2Ref.current, {
        y: 20,
        rotation: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1,
        force3D: true,
        overwrite: 'auto',
      });

      gsap.to(shape3Ref.current, {
        y: -25,
        x: 15,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 2,
        force3D: true,
        overwrite: 'auto',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [introReady]);

  useEffect(() => {
    if (!mountSpline) setSplineReady(false);
  }, [mountSpline]);

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* Spline 3D Model Overlay */}
      <div
        className={`spline-container z-0 transition-opacity duration-700 ${
          splineReady ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {introReady && mountSpline && (
          <iframe
            src="https://my.spline.design/cutecomputerfollowcursor-nNmIobJtNf8Q4NuWVLZX02U6/"
            frameBorder="0"
            title="3D Background"
            loading="eager"
            fetchPriority="low"
            onLoad={() => {
              // Spline iframes can briefly render "unstable" while they settle and
              // measure the final container size (especially after the intro overlay).
              // Keep it hidden until it has a moment to stabilize, then fade it in.
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                  window.dispatchEvent(new Event('resize'));
                  window.setTimeout(() => setSplineReady(true), 150);
                });
              });
            }}
          />
        )}
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/40 via-background/50 to-background pointer-events-none" />

      {/* Floating geometric shapes */}
      <div
        ref={shape1Ref}
        className="absolute z-10 top-1/4 left-[10%] w-16 h-16 border border-primary/30 rotate-45 opacity-60 pointer-events-none"
      />
      <div
        ref={shape2Ref}
        className="absolute z-10 top-1/3 right-[15%] w-24 h-24 border border-secondary/20 rounded-full opacity-40 pointer-events-none"
      />
      <div
        ref={shape3Ref}
        className="absolute z-10 bottom-1/3 left-[20%] w-12 h-12 bg-primary/10 rotate-12 opacity-50 pointer-events-none"
      />

      {/* Background glow */}
      <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] md:w-[600px] md:h-[600px] bg-primary/5 rounded-full blur-2xl md:blur-3xl pointer-events-none" />
      <div className="absolute z-10 top-1/4 right-1/4 w-[240px] h-[240px] md:w-[400px] md:h-[400px] bg-secondary/5 rounded-full blur-2xl md:blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl pointer-events-none pt-24 md:pt-0">
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 opacity-0"
        >
          Hi, I'm{' '}
          <span className="text-primary font-medium">Ali Oudah</span>
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-muted-foreground">
            IT Specialist
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0"
        >
          Keeping systems reliable, secure, and efficient — with a passion for clean
          automation and modern digital experiences.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0">
          <Button
            size="lg"
            className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-base px-8 py-6 shadow-glow-orange-sm hover:shadow-glow-orange pointer-events-auto"
            onClick={() => {
              const element = document.querySelector('#contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contact Me
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-foreground/20 bg-transparent hover:bg-foreground/5 transition-all duration-300 text-base px-8 py-6 pointer-events-auto"
            onClick={scrollToProjects}
          >
            View Projects
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute z-20 bottom-10 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
        <ArrowDown className="text-muted-foreground" size={24} />
      </div>
    </section>
  );
};

export default Hero;
