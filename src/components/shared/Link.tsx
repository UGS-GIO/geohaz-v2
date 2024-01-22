import React from 'react';

interface LinkProps {
    text: string;
    href: string;
}

// Cannot change the color of CalciteLink, so we have to make our own
// https://community.esri.com/t5/calcite-design-system-questions/changing-style-of-calcite-link/m-p/1356171

// A basic link that imitates CalciteLink
const Link: React.FC<LinkProps> = ({ text, href }) => (
    <div className='text-start mx-2 mb-1'>
        <a className="group text-orange-500 relative inline-block focus:outline-none focus:ring-1 focus:ring-orange-500" href={href} aria-label={text} target='_blank' rel="noreferrer">
            <span className="relative">
                {text}
                <span className="absolute inset-x-0 bottom-0 h-px bg-orange-500 opacity-50"></span>
                <span className="absolute inset-x-0 bottom-0 h-px bg-orange-500 w-0 group-hover:w-full transition-all duration-500 ease-in-out"></span>
            </span>
        </a>
    </div>
);

export default Link;