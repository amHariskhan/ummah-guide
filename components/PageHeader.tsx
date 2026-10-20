export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800">
      <svg
        className="absolute inset-0 h-full w-full text-white/8"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="header-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="20" y="20" width="40" height="40" />
              <rect
                x="20"
                y="20"
                width="40"
                height="40"
                transform="rotate(45 40 40)"
              />
              <circle cx="40" cy="40" r="8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#header-pattern)" />
      </svg>

      <div
        aria-hidden="true"
        className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50/80">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}