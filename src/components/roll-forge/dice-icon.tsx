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
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M12 8v8m-4-4h8" />
      <path d="M8 16h8" />
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
