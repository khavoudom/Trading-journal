import { TrendingUp } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-green/3 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-green/4 blur-3xl" />
      </div>

      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative">
        <div className="max-w-sm animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-accent to-accent/60 shadow-lg shadow-accent/20 flex items-center justify-center mb-6">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text leading-tight mb-3">
            Track your
            <br />
            trading journey
          </h2>
          <p className="text-sm text-text2 leading-relaxed">
            Log every trade, analyze your performance, and build better habits. Your complete
            trading journal in one place.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { label: 'Real-time analytics', desc: 'Track win rates, P&L, and streak metrics' },
              { label: 'Trade planning', desc: 'Define your strategy and stick to your rules' },
              { label: 'Portfolio insights', desc: 'Visualize your growth over time' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-5 h-5 rounded-full bg-green-subtle flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text2">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

export function AuthFormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xl shadow-black/20 p-8">
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        <p className="text-sm text-text2 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function MobileAuthHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
      {icon}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        <p className="text-sm text-text2 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
