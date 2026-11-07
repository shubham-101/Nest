export const Logo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className="shrink-0" aria-label="Nest logo">
    <defs>
      <linearGradient id="logo-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="512" y2="512">
        <stop offset="0" stopColor="#2dd4bf" />
        <stop offset=".55" stopColor="#0f766e" />
        <stop offset="1" stopColor="#7c4dff" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="110" fill="url(#logo-g)" />
    <g>
      {/* bird */}
      <circle cx="352" cy="176" r="40" fill="#ffffff" />
      <path d="M388 176l28 10-28 12z" fill="#f59e0b" />
      <circle cx="364" cy="166" r="8" fill="#1f2937" />
      <path d="M320 132l-38-22 24 46z" fill="#ffffff" opacity=".9" />
      {/* eggs */}
      <g transform="translate(256 300)">
        <ellipse cx="-58" cy="0" rx="34" ry="42" fill="#ffffff" />
        <ellipse cx="0" cy="-14" rx="36" ry="44" fill="#ffd166" />
        <ellipse cx="58" cy="0" rx="34" ry="42" fill="#ffffff" />
      </g>
      {/* nest bowl */}
      <path d="M108 316c-4 78 64 124 148 124s152-46 148-124c-34 14-86 22-148 22s-114-8-148-22z" fill="#8a4b16" />
      <path d="M130 350c46 34 206 34 252 0" fill="none" stroke="#6b3410" strokeWidth="16" strokeLinecap="round" />
    </g>
  </svg>
);