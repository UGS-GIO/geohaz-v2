import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
interface ReadMoreProps {
    children: React.ReactNode;
}

const ReadMore = ({ children }: ReadMoreProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to top when collapsing
        if (!isExpanded && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [isExpanded]);

    // Function to handle button click
    const handleButtonClick = () => {
        setIsExpanded(!isExpanded); // Toggle internal state
    };

    return (
        <div className="flex flex-col h-full">
            <div
                id='super-easy-to-see-id'
                ref={contentRef}
                className={`transition-all duration-200 ease-in-out flex-grow ${isExpanded ? 'overflow-auto' : 'overflow-hidden'}`}
                style={{ boxSizing: 'border-box' }}
            >
                {children}
            </div>

            <div className="flex justify-center mt-4">
                <Button variant="ghost" onClick={handleButtonClick} className="w-full border-2 border-secondary">
                    <span>{isExpanded ? 'Read less' : 'Read more'}</span>
                </Button>
            </div>

        </div>
    );
};

export { ReadMore };
