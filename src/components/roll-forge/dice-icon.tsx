import type { SVGProps } from 'react';

const D4 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2 2 21h20L12 2z" />
  </svg>
);

const D6 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
);

const D8 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 2 10 10-10 10-10-10L12 2z" />
  </svg>
);

const D10 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2 3 10l9 12 9-12-9-8z" />
  </svg>
);

const D12 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2.5 21.5 9.5 17 21.5 7 21.5 2.5 9.5Z" />
  </svg>
);

const D20 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2 6.5 7 2 12l4.5 5L12 22l5.5-5 4.5-5-4.5-5L12 2z" />
  </svg>
);

interface DiceIconProps extends SVGProps<SVGSVGElement> {
  sides: number;
}

export function DiceIcon({ sides, ...props }: DiceIconProps) {
  switch (sides) {
    case 4:
      return <D4 {...props} />;
    case 6:
      return <D6 {...props} />;
    case 8:
      return <D8 {...props} />;
    case 10:
      return <D10 {...props} />;
    case 12:
      return <D12 {...props} />;
    case 20:
      return <D20 {...props} />;
    default:
      return <D6 {...props} />;
  }
}
