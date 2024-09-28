import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { RefObject, useCallback, useMemo } from 'react';
import { convertDDToDMS } from "@/lib/mapping-utils";
import { ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    hiddenTriggerRef: RefObject<HTMLDivElement>,
    selectedCoordinates: {
        x: number;
        y: number;
    }
}

const MapContextMenu = ({ hiddenTriggerRef, selectedCoordinates }: Props) => {
    const { isDecimalDegrees } = useMapCoordinates();

    // Function to convert coordinates based on current setting
    const formattedCoordinates = useMemo(() => {
        const { x, y } = selectedCoordinates;
        return isDecimalDegrees
            ? { x: x.toFixed(3), y: y.toFixed(3) }
            : { x: convertDDToDMS(x), y: convertDDToDMS(y) };
    }, [selectedCoordinates, isDecimalDegrees]);

    // Copy coordinates to clipboard
    const handleCopyCoordinates = useCallback(() => {
        const coordsString = `${formattedCoordinates.y}, ${formattedCoordinates.x}`;
        navigator.clipboard.writeText(coordsString);
    }, [formattedCoordinates]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {/* Hidden div for manually triggering the context menu */}
                <div ref={hiddenTriggerRef} className="hidden" />
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    className={cn('px-2 py-1 cursor-pointer')}
                    onSelect={handleCopyCoordinates}
                >
                    Coordinates: {formattedCoordinates.x}, {formattedCoordinates.y}&nbsp;&nbsp;&nbsp;<ClipboardCopy className="h-4 w-4" />
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export { MapContextMenu };