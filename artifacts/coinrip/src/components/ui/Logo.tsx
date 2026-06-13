export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="46" fill="#12121A" stroke="#E2FF00" strokeWidth="8" />
      <path d="M 20 50 L 40 30 L 60 70 L 80 50" stroke="#FF3366" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 30 50 L 50 30 L 70 70 L 90 50" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}