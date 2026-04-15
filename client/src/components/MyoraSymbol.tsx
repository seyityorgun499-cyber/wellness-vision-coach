interface MyoraSymbolProps {
  size?: number;
  className?: string;
}

export default function MyoraSymbol({ size = 100, className = '' }: MyoraSymbolProps) {
  const r = 32;
  const sw = 11;
  const circ = 2 * Math.PI * r;
  const visiblePct = 0.72;
  const visible = circ * visiblePct;
  const gap = circ - visible;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx={44}
        cy={48}
        r={r}
        stroke="#4A5568"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${visible} ${gap}`}
        strokeDashoffset={-circ * 0.05}
        transform="rotate(-30 44 48)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 44 48"
          to="-360 44 48"
          dur="25s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx={56}
        cy={52}
        r={r}
        stroke="#4DB6AC"
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${visible} ${gap}`}
        strokeDashoffset={-circ * 0.05}
        transform="rotate(150 56 52)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 56 52"
          to="360 56 52"
          dur="30s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
