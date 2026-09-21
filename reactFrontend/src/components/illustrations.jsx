const SoftBlob = ({ children, className = '' }) => (
  <div className={`relative hidden h-44 w-52 shrink-0 md:block ${className}`}>
    <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100" />
    <div className="absolute inset-4 rounded-[32px] bg-white/50 backdrop-blur-sm" />
    <div className="absolute inset-0 flex items-center justify-center">{children}</div>
  </div>
);

export const ProfileIllustration = () => (
  <SoftBlob>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="28" y="30" width="64" height="62" rx="14" fill="#EDE9FE" />
      <rect x="36" y="22" width="48" height="18" rx="9" fill="#7C5CFF" />
      <circle cx="60" cy="31" r="5" fill="#FDE68A" />
      <rect x="42" y="52" width="14" height="12" rx="3" fill="#C4B5FD" />
      <rect x="64" y="52" width="14" height="12" rx="3" fill="#C4B5FD" />
      <rect x="42" y="70" width="14" height="12" rx="3" fill="#DDD6FE" />
      <circle cx="71" cy="76" r="8" fill="#A78BFA" />
      <path d="M71 73v6M68 76h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </SoftBlob>
);

export const ServicesIllustration = () => (
  <SoftBlob>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="34" y="26" width="52" height="68" rx="12" fill="#F5F3FF" />
      <rect x="42" y="20" width="36" height="14" rx="7" fill="#C4B5FD" />
      <rect x="44" y="46" width="32" height="6" rx="3" fill="#DDD6FE" />
      <rect x="44" y="58" width="24" height="6" rx="3" fill="#EDE9FE" />
      <circle cx="78" cy="78" r="16" fill="#7C5CFF" />
      <path d="M72 78l4 4 8-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </SoftBlob>
);

export const AvailabilityIllustration = () => (
  <SoftBlob>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="26" y="32" width="68" height="56" rx="14" fill="#EDE9FE" />
      <rect x="34" y="24" width="16" height="16" rx="8" fill="#7C5CFF" />
      <rect x="70" y="24" width="16" height="16" rx="8" fill="#A78BFA" />
      <circle cx="76" cy="78" r="18" fill="#FDE68A" />
      <path d="M76 70v9l6 3" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </SoftBlob>
);

export const BookingsIllustration = () => (
  <SoftBlob>
    <svg width="130" height="120" viewBox="0 0 130 120" fill="none">
      <circle cx="48" cy="46" r="16" fill="#C4B5FD" />
      <circle cx="78" cy="46" r="16" fill="#A78BFA" />
      <rect x="30" y="68" width="70" height="28" rx="14" fill="#EDE9FE" />
      <rect x="86" y="22" width="28" height="28" rx="10" fill="#7C5CFF" />
      <path d="M95 29v8M91 36h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </SoftBlob>
);

export const PaymentsIllustration = () => (
  <SoftBlob>
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="28" y="38" width="64" height="42" rx="12" fill="#EDE9FE" />
      <circle cx="48" cy="59" r="10" fill="#7C5CFF" />
      <rect x="64" y="52" width="20" height="6" rx="3" fill="#C4B5FD" />
      <rect x="64" y="62" width="14" height="6" rx="3" fill="#DDD6FE" />
      <path d="M78 28c10 8 14 18 8 32" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="88" cy="28" r="8" fill="#F5D0FE" />
    </svg>
  </SoftBlob>
);

export const DashboardHeroArt = () => (
  <div className="relative hidden h-full min-h-[240px] w-full max-w-sm md:block">
    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#f4e9ff] via-[#f7f1ff] to-[#e8fbf3]" />
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 280" fill="none">
      <circle cx="270" cy="70" r="46" fill="#E9D5FF" opacity="0.7" />
      <circle cx="80" cy="210" r="36" fill="#DDD6FE" opacity="0.8" />
      <ellipse cx="210" cy="230" rx="90" ry="18" fill="#D8B4FE" opacity="0.35" />
      <rect x="150" y="86" width="108" height="132" rx="54" fill="#C4B5FD" />
      <rect x="166" y="108" width="76" height="92" rx="38" fill="#7C5CFF" />
      <circle cx="204" cy="78" r="28" fill="#F5D0FE" />
      <circle cx="194" cy="74" r="3" fill="#1E1B4B" />
      <circle cx="214" cy="74" r="3" fill="#1E1B4B" />
      <path d="M194 86c6 6 14 6 20 0" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
      <path d="M132 168c18-28 42-34 72-20" stroke="#A78BFA" strokeWidth="10" strokeLinecap="round" />
      <path d="M276 168c-18-28-42-34-72-20" stroke="#A78BFA" strokeWidth="10" strokeLinecap="round" />
    </svg>
  </div>
);

export const FeatureIcon = ({ tone, children }) => {
  const tones = {
    lavender: 'bg-violet-100 text-violet-600',
    mint: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
      {children}
    </div>
  );
};
