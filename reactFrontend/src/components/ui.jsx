export const Icon = ({ d, className = 'w-5 h-5', strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export const Icons = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-8.5z',
  briefcase: 'M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M4 7h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm8 5h.01',
  calendar: 'M8 3v3m8-3v3M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  wallet: 'M3 8h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm0 0V6a2 2 0 012-2h14a2 2 0 012 2v2M16 13h.01',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  mail: 'M4 6h16v12H4V6zm0 0l8 7 8-7',
  lock: 'M7 10V8a5 5 0 0110 0v2M6 10h12v10H6V10z',
  building: 'M4 21h16M6 21V5a1 1 0 011-1h10a1 1 0 011 1v16M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01',
  clock: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
  rupee: 'M8 6h8M8 10h8M8 6c4 0 6 2 6 4s-2 4-6 4m0 0L16 20',
  copy: 'M8 8h10v12H8V8zm-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v2',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  logout: 'M15 16l4-4m0 0l-4-4m4 4H8m4 8H6a2 2 0 01-2-2V6a2 2 0 012-2h6',
  search: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
  rocket: 'M5 15l4-1 7-7 2 2-7 7-1 4-5-5zm9-9l2-2 3 3-2 2',
  shield: 'M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z',
  flame: 'M12 3s4 4 4 8a4 4 0 01-8 0c0-2 2-4 4-8zm0 8v8',
  moon: 'M20 14.5A8.5 8.5 0 119.5 4 7 7 0 0020 14.5z',
  camera: 'M4 8h3l2-2h6l2 2h3v12H4V8zm8 9a4 4 0 100-8 4 4 0 000 8z',
  infinity: 'M7 12c0-2 1.5-4 4-4 3.5 0 5 4 7 4s4-2 4-4-1.5-4-4-4-3.5 4-7 4-4-2-4-4 1.5-4 4-4',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9zM3 12h18',
  file: 'M7 3h7l5 5v13H7V3zM14 3v5h5',
  trash: 'M4 7h16M9 7V5h6v2m-8 0l1 12h8l1-12',
  edit: 'M4 16.5V20h3.5L19 8.5 15.5 5 4 16.5z',
  chart: 'M4 19h16M7 16v-5m5 5V8m5 8v-7',
  arrowRight: 'M5 12h14m0 0l-5-5m5 5l-5 5',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  filter: 'M4 6h16M7 12h10M10 18h4',
  chevron: 'M6 9l6 6 6-6',
  save: 'M5 5h10l4 4v10H5V5zm4 0v5h6V5',
  download: 'M12 4v10m0 0l-4-4m4 4l4-4M5 18h14',
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7L19 5M5 19l1.3-1.3M17.7 17.7L19 19M5 5l1.3 1.3M12 8a4 4 0 100 8 4 4 0 000-8z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  spark: 'M12 3l1.5 6L20 10.5 13.5 12 12 18l-1.5-6L4 10.5 10.5 9 12 3z',
};

export const SvgIcon = ({ name, className = 'w-5 h-5', strokeWidth = 1.8 }) => (
  <Icon d={Icons[name] || Icons.spark} className={className} strokeWidth={strokeWidth} />
);

export const Logo = ({ compact = false, light = false }) => (
  <div className="flex items-center gap-2.5">
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="url(#bmLogo)" />
      <path
        d="M10 8.5h6.4c3.3 0 5.5 1.9 5.5 4.7 0 1.9-1.1 3.4-2.9 4.1 2.1.6 3.4 2.3 3.4 4.5 0 3.1-2.4 5.2-6.1 5.2H10V8.5zm4.1 6.7h2.2c1.5 0 2.4-.8 2.4-1.9s-.9-1.8-2.4-1.8h-2.2v3.7zm0 7.6h2.6c1.7 0 2.7-.9 2.7-2.1s-1-2-2.7-2h-2.6v4.1z"
        fill="#fff"
      />
      <defs>
        <linearGradient id="bmLogo" x1="4" y1="2" x2="28" y2="30">
          <stop stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
    {!compact && (
      <span className={`text-[22px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        BookMe
      </span>
    )}
  </div>
);

export const Field = ({
  label,
  icon,
  type = 'text',
  className = '',
  inputClassName = '',
  ...props
}) => (
  <label className={`block ${className}`}>
    {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
          <SvgIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
      )}
      <input
        type={type}
        className={`bm-input ${icon ? '' : '!pl-4'} ${inputClassName}`}
        {...props}
      />
    </div>
  </label>
);

export const TextArea = ({ label, icon, className = '', ...props }) => (
  <label className={`block ${className}`}>
    {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-3 text-slate-400">
          <SvgIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
      )}
      <textarea
        className={`bm-input min-h-[96px] resize-none ${icon ? '' : '!pl-4'}`}
        {...props}
      />
    </div>
  </label>
);

export const Banner = ({ type = 'error', children }) => {
  const styles = {
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    info: 'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {children}
    </div>
  );
};

export const Spinner = ({ className = 'h-10 w-10 border-violet-500' }) => (
  <div className={`animate-spin rounded-full border-[3px] border-slate-200 border-t-current ${className}`} />
);

export const EmptyState = ({ icon = 'clipboard', title, subtitle }) => (
  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <SvgIcon name={icon} className="h-7 w-7" />
    </div>
    <p className="text-base font-semibold text-slate-600">{title}</p>
    {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
  </div>
);
