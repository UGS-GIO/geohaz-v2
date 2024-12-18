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
        <path fill='none' strokeWidth='2px' d="M7.47,9.21s-.35,2.08,1.88,1.85" />
        <path fill='none' strokeWidth='2px' d="M4.7,11.62s-.48,2.85,2.57,2.53" />
        <line fill='none' strokeWidth='2px' x1="12.01" y1="1.97" x2="12.01" y2="21.35" />
        <polyline strokeWidth='2px' fill='none' points="17.63 3.7 17.63 9.07 21.21 9.07" />
        <polyline strokeWidth='2px' fill='none' points="21.59 14.65 17.63 14.65 17.63 19.8" />
    </svg >
);



export { StreetsIcon, TopoIcon, SatelliteIcon, HybridIcon };