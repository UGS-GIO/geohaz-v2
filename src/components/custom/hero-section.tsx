import ThemeSwitch from "../theme-switch";

interface HeroSectionProps {
  image: React.ReactNode;
  logoSrc: string;
  title: string;
  subtitle: string;
  overlayText: string;
}

export function HeroSection({ image, logoSrc, title, subtitle, overlayText }: HeroSectionProps) {
  return (
    <section className="w-full">
      {/* Top Bar with Logo */}
      <div className="w-full p-4 flex items-center justify-between">
        {/* Left Section: Logo and Text */}
        <div className="flex items-center">
          {/* Logo */}
          <img src={logoSrc} alt="Logo" className="h-8 md:h-12 mr-4" />

          {/* Text Next to Logo */}
          <div className="text-foreground">
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Right Section: ThemeSwitch */}
        <div className="ml-auto">
          <ThemeSwitch />
        </div>
      </div>

      <div className="relative w-full h-48 md:h-64">
        {/* Background Image */}
        {image}

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-start p-4">
          <h1 className="text-white text-7xl md:text-6xl font-semibold">
            {overlayText}
          </h1>
        </div>
      </div>
    </section>
  );
}