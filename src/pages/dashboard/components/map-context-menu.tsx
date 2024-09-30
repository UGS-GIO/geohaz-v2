import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { RefObject, useCallback, useContext, useMemo } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertDDToDMS, removeGraphics } from '@/lib/mapping-utils';
import { MapContext } from '@/context/map-provider';

interface Props {
    hiddenTriggerRef: RefObject<HTMLDivElement>,
    coordinates: { x: string; y: string }
}

const MapContextMenu = ({ hiddenTriggerRef, coordinates }: Props) => {
    const { isDecimalDegrees } = useMapCoordinates();
    const { view } = useContext(MapContext);

    // Function to convert coordinates based on current setting
    const formattedCoordinates = useMemo(() => {
        const { x, y } = coordinates;
        return isDecimalDegrees
            ? { x: Number(x).toFixed(3), y: Number(y).toFixed(3) }
            : { x: convertDDToDMS(Number(x)), y: convertDDToDMS(Number(y)) };
    }, [coordinates, isDecimalDegrees]);

    // Copy coordinates to clipboard
    const handleCopyCoordinates = useCallback(() => {
        const coordsString = `${coordinates.y}, ${coordinates.x}`;
        navigator.clipboard.writeText(coordsString);
    }, [coordinates]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {/* Hidden div for manually triggering the context menu */}
                <div ref={hiddenTriggerRef} className="hidden" />
            </ContextMenuTrigger>
            <ContextMenuContent onInteractOutside={() => view && removeGraphics(view)}>
                <ContextMenuItem
                    className={cn('px-2 py-1 cursor-pointer')}
                    onSelect={handleCopyCoordinates}
                >
                    Coordinates: {formattedCoordinates.y}, {formattedCoordinates.x}&nbsp;&nbsp;&nbsp;<ClipboardCopy className="h-4 w-4" />
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export { MapContextMenu };