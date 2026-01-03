import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import profileImage from '@/assets/ali.png';
import resumePdf from '@/assets/Ali_Oudah_Resum.pdf';
import { Button } from '@/components/ui/button';
import LiveStatus from '@/components/LiveStatus';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';
import {
  siHtml5,
  siCss,
  siJavascript,
  siReact,
  siTypescript,
} from 'simple-icons';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { name: 'HTML5', icon: siHtml5 },
  { name: 'CSS3', icon: siCss },
  { name: 'JavaScript', icon: siJavascript },
  { name: 'React', icon: siReact },
  { name: 'TypeScript', icon: siTypescript },
];

const About = () => {
  const CITY = 'Kuwait City';
  const TIMEZONE = 'Asia/Kuwait';

  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const headingWordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const headingWords = useMemo(
    () => [
      { text: 'Crafting' },
      { text: 'Immersive' },
      { text: 'Digital', highlight: true },
      { text: 'Experiences', highlight: true, suffix: '.' },
    ],
    []
  );

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Section fade in
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Image slide in from left
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -80, filter: 'blur(10px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Content fade in
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, filter: 'blur(5px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      );

      // Heading stagger reveal (words)
      if (prefersReducedMotion) {
        gsap.set(headingWordRefs.current.filter(Boolean), { yPercent: 0, opacity: 1 });
      } else {
        gsap.fromTo(
          headingWordRefs.current.filter(Boolean),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
          }
        );
      }

      // Skills stagger animation
      gsap.fromTo(
        skillsRef.current?.children || [],
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: skillsRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative mx-auto lg:mx-0 w-full max-w-[400px] md:max-w-[420px]">
            <div className="relative w-full flex items-end justify-center">
              {/* Composite lighting: glow is CSS-generated, image stays fully transparent (no bg). */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[560px] md:h-[560px] blur-[80px] bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.40)_0%,transparent_70%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -z-10 left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[440px] md:h-[440px] rounded-full border border-primary/20 opacity-30"
              />
              <img
                src={profileImage}
                alt="Ali Oudah - Web Developer"
                className="relative z-10 w-full h-auto select-none pointer-events-none origin-bottom scale-[1.06]"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  maskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                  filter: 'sepia(0.2) brightness(0.9)',
                }}
              />
            </div>

            <div className="mt-6 flex justify-center lg:justify-start">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <LiveStatus city={CITY} timeZone={TIMEZONE} />
                <SpotifyNowPlaying />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="text-center lg:text-left flex flex-col justify-center h-full"
          >
            <span className="inline-flex w-fit mx-auto lg:mx-0 items-center rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              ABOUT ME
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-6">
              {headingWords.map((word, index) => (
                <span key={`${word.text}-${index}`} className="inline-block overflow-hidden align-bottom">
                  <span
                    ref={(el) => {
                      headingWordRefs.current[index] = el;
                    }}
                    className={
                      word.highlight
                        ? 'inline-block highlight-text font-medium'
                        : 'inline-block'
                    }
                  >
                    {word.text}
                    {word.suffix ?? ''}
                  </span>
                  {index < headingWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed md:leading-loose mb-10">
              I'm a creative web developer with a passion for building{' '}
              <strong className="font-semibold text-foreground">immersive, high-performance</strong>{' '}
              websites and applications. With expertise in{' '}
              <strong className="font-semibold text-foreground">modern frontend technologies</strong> and{' '}
              <strong className="font-semibold text-foreground">animation libraries</strong>, I bring
              designs to life with <strong className="font-semibold text-foreground">smooth interactions</strong>{' '}
              and <strong className="font-semibold text-foreground">stunning visual effects</strong>.
            </p>

            {/* CTA */}
            <div className="flex justify-center lg:justify-start mb-2">
              <Button
                variant="outline"
                className="bg-transparent border-foreground/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                asChild
              >
                <a href={resumePdf} download="Ali_Oudah_Resume.pdf">
                  Download CV
                </a>
              </Button>
            </div>

            {/* Skills grid */}
            <div ref={skillsRef} className="flex flex-wrap justify-center lg:justify-start gap-6 mt-8">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="group flex flex-col items-center gap-2 cursor-default"
                  style={{ ['--tech-color' as unknown as keyof CSSProperties]: `#${skill.icon.hex}` } as CSSProperties}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    className="tech-icon h-7 w-7"
                  >
                    <path d={skill.icon.path} fill={`#${skill.icon.hex}`} />
                  </svg>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/80 transition-colors duration-300 group-hover:text-[color:var(--tech-color)]">
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into the next section (Projects) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-b from-transparent to-background z-10" />
    </section>
  );
};

export default About;
