import { Logo, SvgIcon } from './ui';
import { FeatureIcon } from './illustrations';

const FeatureCard = ({ tone, title, subtitle, icon }) => (
  <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
    <FeatureIcon tone={tone}>
      <SvgIcon name={icon} className="h-5 w-5" />
    </FeatureIcon>
    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p>
  </div>
);

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <section className="flex flex-col justify-center px-8 py-16 lg:px-16">
          <Logo />
          <h1 className="mt-14 max-w-xl text-5xl font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-[56px]">
            A calm booking desk
            <br />
            for{' '}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-400 bg-clip-text italic text-transparent">
              small businesses.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">
            Create your business profile, add services, set availability, and share one clean booking link.
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureCard tone="lavender" icon="calendar" title="Easy Setup" subtitle="Get started in minutes" />
            <FeatureCard tone="mint" icon="shield" title="Secure" subtitle="Stripe-powered payments" />
            <FeatureCard tone="amber" icon="spark" title="Fast" subtitle="Instant booking links" />
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[440px] rounded-[28px] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
