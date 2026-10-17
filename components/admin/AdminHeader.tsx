export default function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur md:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}