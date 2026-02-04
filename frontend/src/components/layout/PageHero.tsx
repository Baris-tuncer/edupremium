'use client';

interface PageHeroProps {
  title: string;
  subtitle?: string;
}

const PageHero = ({ title, subtitle }: PageHeroProps) => {
  return (
    <section className="relative min-h-[40vh] pt-16 overflow-hidden flex items-center justify-center">
      {/* Background Image - Library Books */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2940&auto=format&fit=crop')`,
        }}
      />

      {/* Cream Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(253,251,247,0.95) 0%, rgba(253,251,247,0.85) 50%, rgba(253,251,247,0.7) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] font-serif leading-tight tracking-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
