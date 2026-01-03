import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: '3D Interactive Web',
    description: 'Frontend development with 3D elements and Spline integration',
    image: '/assets/project-1-20260104.png',
    tech: ['React', 'Spline', 'GSAP'],
  },
  {
    id: 2,
    title: 'Gaming UI Platform',
    description: 'Next-level gaming interface with immersive 3D design',
    image: '/assets/project-2-20260104.png',
    tech: ['React', 'Three.js', 'Tailwind'],
  },
  {
    id: 3,
    title: '3D Animated Portfolio',
    description: 'My own personal portfolio',
    image: '/assets/project-3-20260104.png',
    tech: ['Vite', 'React', 'TypeScript', 'Tailwind', 'GSAP'],
    githubUrl: 'https://github.com/vstq5/Ali-Oudah-Portfolio',
  },
  {
    id: 4,
    title: 'Gaming Website',
    description: 'Modern gaming website with dynamic visuals',
    image: '/assets/project-4-20260104.png',
    tech: ['HTML5', 'CSS3', 'JS'],
  },
  {
    id: 5,
    title: 'Web Animation Tools',
    description: 'Building fast, reliable results with top animation tools',
    image: '/assets/project-5-20260104.png',
    tech: ['React', 'GSAP', 'Framer'],
  },
  {
    id: 6,
    title: 'Playlist Downloader',
    description: 'A service to download tracks and playlists from Spotify, YouTube, and SoundCloud',
    image: '/assets/project-6-20260104.png',
    tech: ['TypeScript', 'Python', 'CSS'],
    githubUrl: 'https://github.com/vstq5/playlist_downloader',
  },
];

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headingWordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const headingWords = useMemo(
    () => [
      { text: 'Featured' },
      { text: 'Projects', highlight: true },
    ],
    []
  );

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // Header animation - simplified
      gsap.fromTo(
        headerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
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
            stagger: 0.07,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Cards stagger animation - optimized with simpler transforms
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 flex flex-col items-center">
          <span className="text-primary text-sm uppercase tracking-widest">Portfolio</span>
          <div className="relative mt-4">
            {/* Ambient spotlight */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[220px] rounded-full bg-primary/10 opacity-[0.15] blur-[100px]" />
            <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-light">
              {headingWords.map((word, index) => (
                <span key={`${word.text}-${index}`} className="inline-block overflow-hidden align-bottom">
                  <span
                    ref={(el) => {
                      headingWordRefs.current[index] = el;
                    }}
                    className={
                      word.highlight
                        ? 'inline-block text-primary font-medium'
                        : 'inline-block'
                    }
                  >
                    {word.text}
                  </span>
                  {index < headingWords.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* Projects grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="group glass-card overflow-hidden border border-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange-sm hover:border-primary/30 will-change-transform"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-foreground/20 hover:bg-primary hover:border-primary"
                  >
                    <ExternalLink size={18} />
                  </Button>
                  {project.githubUrl ? (
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-foreground/20 hover:bg-secondary hover:border-secondary hover:text-secondary-foreground"
                      asChild
                    >
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} on GitHub`}
                      >
                        <Github size={18} />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-foreground/20 hover:bg-secondary hover:border-secondary hover:text-secondary-foreground"
                    >
                      <Github size={18} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {project.description}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 rounded-full border border-border/50 bg-muted/60 text-foreground/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
