import type { SVGProps } from 'react';
import Image from 'next/image';

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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path
        d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2Z"
        fill="url(#grad1)"
      />
      <path d="M12 6V18" stroke="hsl(var(--card-foreground))" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12H18" stroke="hsl(var(--card-foreground))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

const imageUrls: Record<number, string> = {
    2: 'https://i.imgur.com/ThNplfp.png',
    4: 'https://i.imgur.com/73h49tp.png',
    6: 'https://i.imgur.com/dkGJq1L.png',
    8: 'https://i.imgur.com/jwo6kIg.png',
    10: 'https://i.imgur.com/RAIzuDQ.png',
    12: 'https://i.imgur.com/CNxNse1.png',
    20: 'https://i.imgur.com/QcuW5V7.png',
    100: 'https://i.imgur.com/qm8T3ZH.png',
}

interface DiceIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  sides: number;
  width?: number;
  height?: number;
}

export function DiceIcon({ sides, className, width = 20, height = 20, ...props }: DiceIconProps) {
  const imageUrl = imageUrls[sides];

  if (imageUrl) {
    return (
        <Image
            src={imageUrl}
            alt={`d${sides}`}
            width={width}
            height={height}
            className={className}
            unoptimized
        />
    )
  }
  
  // Fallback to SVG for dice without custom images
  switch (sides) {
    case 0: // For Fudge Dice (dF)
      return <DF {...props} className={className} />;
    default:
      // Default to d6 SVG if no image and no specific SVG
      return <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
        >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>;
  }
}
