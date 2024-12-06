import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

const StreetsIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        id="streetsIcon"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 24 24"
        className={cn('stroke-foreground h-5 w-5', className)}
    >
        <circle strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' strokeMiterlimit={10} cx="12" cy="11.99" r="10.02" />
        <polyline strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' points="7.59 3.5 7.59 9.48 2.37 9.48" />
        <polyline strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' points="12.75 2.44 12.75 9.48 21.24 9.48" />
        <polyline strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' points="3.12 14.73 11.55 14.73 11.55 21.35" />
        <polyline strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' points="21.19 14.73 16.71 14.73 16.71 20.15" />
    </svg>
);

const TopoIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        id="topoIcon"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 24 24"
        className={cn('stroke-foreground h-5 w-5', className)}
    >
        <circle strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' strokeMiterlimit={10} cx="12" cy="12" r="10" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M19.68 7.77s-5.77 3.08.12 9.07" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M17.09 3.74s-10 6.88-2.68 17.7" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M8.63 2.84s2.35 4.14-.75 6.49-3.01 3.95-.66 11.2" />
    </svg>
);

const SatelliteIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        id="satelliteIcon"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 24 24"
        className={cn('stroke-foreground h-5 w-5', className)}
    >
        <circle strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' strokeMiterlimit={10} cx="12" cy="12" r="10" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M17.26 12.26c1.43-1.43 1.43-3.75 0-5.18s-3.75-1.43-5.18 0l5.18 5.18Z" />
        <line strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' x1="13.36" y1="10.97" x2="14.38" y2="9.95" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M9.74 10.99s-.69 4.08 3.69 3.62" />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' d="M6.35 12.99s-.94 5.58 5.04 4.95" />
    </svg>
);

const HybridIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        id="hybridIcon"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 24 24"
        className={cn('stroke-foreground h-5 w-5', className)}
    >
        <circle strokeLinecap='round' strokeLinejoin='round' strokeWidth='2px' fill='none' strokeMiterlimit={10} cx="12" cy="12" r="10" />
        <path d="M12.01,22.96c-6.05,0-10.97-4.92-10.97-10.97S5.96,1.02,12.01,1.02s10.97,4.92,10.97,10.97-4.92,10.97-10.97,10.97ZM12.01,2.92C7.01,2.92,2.95,6.99,2.95,11.99s4.07,9.06,9.06,9.06,9.06-4.07,9.06-9.06S17,2.92,12.01,2.92Z" />
        <path d="M9.02,12.08c-.99,0-1.58-.39-1.91-.74-.83-.89-.65-2.15-.62-2.29.09-.54.6-.91,1.15-.82.54.09.91.6.82,1.14-.02.17,0,.49.11.6.09.09.35.13.68.1.54-.06,1.04.34,1.1.89.06.55-.34,1.04-.89,1.1-.15.02-.3.02-.43.02Z" />
        <path d="M6.83,15.18c-1.23,0-1.95-.47-2.35-.9-1.02-1.08-.79-2.64-.76-2.82.09-.54.61-.92,1.15-.82.54.09.91.6.82,1.15-.03.2-.05.82.25,1.13.27.28.82.29,1.23.25.54-.06,1.04.34,1.1.89.06.55-.34,1.04-.89,1.1-.19.02-.38.03-.55.03Z" />
        <path d="M12.01,22.77c-.55,0-1-.45-1-1V2.39c0-.55.45-1,1-1s1,.45,1,1v19.38c0,.55-.45,1-1,1Z" />
        <path d="M21.21,10.82h-3.57c-.55,0-1-.45-1-1v-5.37c0-.55.45-1,1-1s1,.45,1,1v4.37h2.57c.55,0,1,.45,1,1s-.45,1-1,1Z" />
        <path d="M17.63,20.79c-.55,0-1-.45-1-1v-5.14c0-.55.45-1,1-1h3.96c.55,0,1,.45,1,1s-.45,1-1,1h-2.96v4.14c0,.55-.45,1-1,1Z" />
    </svg >
);



export { StreetsIcon, TopoIcon, SatelliteIcon, HybridIcon };