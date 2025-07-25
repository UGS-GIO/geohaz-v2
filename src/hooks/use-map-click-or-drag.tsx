import { useState } from 'react';

const DRAG_THRESHOLD = 5; // Pixels

interface UseMapClickOrDragProps {
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useMapClickOrDrag({ onClick }: UseMapClickOrDragProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Don't check for drag if the mouse button isn't pressed
        if (e.buttons !== 1) return;

        const distance = Math.sqrt(
            Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2)
        );
        if (distance > DRAG_THRESHOLD) {
            setIsDragging(true);
        }
    };

    const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) {
            onClick(e);
        }
        setIsDragging(false); // Reset for next interaction
    };

    return {
        isDragging,
        clickOrDragHandlers: {
            onMouseDown,
            onMouseMove,
            onMouseUp,
        },
    };
}