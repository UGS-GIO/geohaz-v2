import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../@/components/ui/button';

const ReadMore = ({ children }: { children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState('255px');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (contentRef.current) {
                setHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '255px');
            }
        };
        updateHeight();
    }, [isExpanded]);

    useEffect(() => {
        const handleResize = () => {
            if (isExpanded && contentRef.current) {
                setHeight(`${contentRef.current.scrollHeight}px`);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

    return (
        <div>
            <div
                ref={contentRef}
                className="transition-max-height duration-500 ease-in-out overflow-hidden"
                style={{ maxHeight: height }}
            >
                {children}
            </div>
            <Button variant="link" className="flex items-center mt-4" onClick={() => setIsExpanded(!isExpanded)}>
                <span>{isExpanded ? 'Read less' : 'Read more'}</span>
            </Button>
        </div>
    );
};

export { ReadMore };
