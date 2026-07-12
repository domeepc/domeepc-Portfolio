import { useRef } from 'react';
import { ExternalLink, GitBranch, Globe } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { repos } from '@/lib/data';

function onCardEnter(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { y: -6, duration: 0.2, ease: 'power2.out' });
}

function onCardLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: 'power2.out' });
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
      defaults: { ease: 'power2.out' },
    });

    tl.from('.projects-header', { opacity: 0, y: 30, duration: 0.6 }, 0)
      .from('.project-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1 }, 0)
      .from('.projects-cta', { opacity: 0, y: 20, duration: 0.6 }, 0.7);
  }, { scope: containerRef });

  return (
    <section id="projects" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        {/* Section header */}
        <div className="projects-header text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Projects
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Things I've <span className="gradient-text">Built</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            A selection of projects from web apps to embedded firmware — each one a new challenge.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.name}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              className="project-card group"
            >
              <Card className="h-full flex flex-col bg-card border-border glow-border transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-violet-300 transition-colors">
                      {repo.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                          title="Live site"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="View on GitHub"
                      >
                        <GitBranch size={14} />
                      </a>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {repo.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 mt-auto">
                  <div className="flex items-center justify-between">
                    {/* Language badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {repo.language}
                      </span>
                    </div>

                    {/* Updated */}
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(repo.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Live badge */}
                  {repo.homepage && (
                    <div className="mt-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-green-500/30 text-green-400 bg-green-500/10 gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="projects-cta text-center mt-12">
          <a
            href="https://github.com/domeepc?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 gap-2"
            >
              <ExternalLink size={16} />
              View All Repositories
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
