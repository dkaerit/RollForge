import type { SVGProps } from 'react';

const D2 = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 10h18" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
    </svg>
)

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

const D100 = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z"/>
        <path d="M12 2v20"/>
        <path d="M22 12H2"/>
        <path d="m20 20-4-4"/>
        <path d="m4 20 4-4"/>
        <path d="m4 4 4 4"/>
        <path d="m20 4-4 4"/>
    </svg>
);

const DF = (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2Z" 
      fill="currentColor"
      stroke="none"
      className="text-muted-foreground/30"
      />
      <path d="M12 7V17" stroke="hsl(var(--background))" />
      <path d="M7 12H17" stroke="hsl(var(--background))" />
    </svg>
  );

interface DiceIconProps extends SVGProps<SVGSVGElement> {
  sides: number;
}

export function DiceIcon({ sides, ...props }: DiceIconProps) {
  switch (sides) {
    case 0:
      return <DF {...props} />;
    case 2:
      return <D2 {...props} />;
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
    case 100:
      return <D100 {...props} />;
    default:
      return <D6 {...props} />;
  }
}
