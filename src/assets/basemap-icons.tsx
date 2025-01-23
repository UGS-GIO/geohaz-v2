import React from 'react';

interface BasemapIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

const BasemapIcon: React.FC<BasemapIconProps> = () => (

    <svg xmlns="http://www.w3.org/2000/svg" width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="2.81" y="2.8" width="7.37" height="7.37" stroke-width="1.65"></rect>
        <rect x="13.82" y="2.8" width="7.37" height="7.37" stroke-width="1.65"></rect>
        <rect x="2.81" y="13.81" width="7.37" height="7.37" stroke-width="1.65"></rect>
        <rect x="13.82" y="13.81" width="7.37" height="7.37" stroke-width="1.65"></rect>
        <line x1="17.5" y1="3.25" x2="17.5" y2="10" stroke-width="2" strokeLinecap="round"></line>
        <line x1="20.18" y1="6.48" x2="17.85" y2="6.48" stroke-width="2" strokeLinecap="round"></line>
        <line x1="20.36" y1="17.37" x2="14.09" y2="17.37" stroke-width="2" strokeLinecap="round"></line>
        <line x1="17.5" y1="20.5" x2="17.5" y2="17.37" stroke-width="2" strokeLinecap="round"></line>
        <path d="M3.32,3.16s.89,4.4,6.11,5.34" stroke-width="2" strokeLinecap="round"></path>
        <path d="M3.18,18.25s3.18-2.47,6.78,0" stroke-width="2" strokeLinecap="round"></path>
    </svg>
);

export { BasemapIcon };