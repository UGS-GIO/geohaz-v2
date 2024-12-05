import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Feature } from "geojson";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { ExtendedFeature, PopupContentWithPagination } from "./popup-content-with-pagination";
import { RelatedTable } from "@/lib/types/mapping-types";

interface PopupContent {
    features: Feature[];
    visible: boolean;
    groupLayerTitle: string;
    layerTitle: string;
}

interface CombinedSidebarDrawerProps {
    container: HTMLDivElement | null;
    popupContent: PopupContent[];
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    popupTitle: string;
}

function PopupDrawer({
    container,
    popupContent,
    drawerTriggerRef,
    popupTitle,
}: CombinedSidebarDrawerProps) {
    const { isCollapsed } = useSidebar();
    const carouselRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeLayerTitle, setActiveLayerTitle] = useState<string>("");

    const layerContent = useMemo(() => popupContent, [popupContent]);

    const groupedLayers = useMemo(() => {
        const layers = layerContent.map((item) => item.layerTitle || item.groupLayerTitle);

        setActiveLayerTitle(layers[0]);
        return layerContent.reduce((acc, item) => {
            const { groupLayerTitle, layerTitle } = item;
            if (!acc[groupLayerTitle]) acc[groupLayerTitle] = [];
            acc[groupLayerTitle].push(layerTitle);
            return acc;
        }, {} as Record<string, string[]>);
    }, [layerContent]);

    const handleCarouselClick = useCallback((title: string) => {
        const element = document.getElementById(`section-${title}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    const setContainerRef = useCallback((node: HTMLDivElement | null) => {
        containerRef.current = node;
    }, []);

    const onSectionChange = useCallback((layerTitle: string) => {
        // Escape layerTitle for querySelector using CSS.escape
        const escapedLayerTitle = CSS.escape(`layer-${layerTitle}`);

        // - scroll to section with setactiveLayerTitle
        setActiveLayerTitle(layerTitle);
        // - center carousel item in carousel
        const carouselItem = document.getElementById(`${escapedLayerTitle}`);
        if (carouselItem) {
            carouselItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [handleCarouselClick]);

    return (
        <Drawer container={container} modal={false}>
            <DrawerTrigger asChild>
                <Button ref={drawerTriggerRef} size="sm" className="hidden">Open Drawer</Button>
            </DrawerTrigger>

            <DrawerContent className={cn('max-w-4xl mb-10 z-10 max-h-[85vh] overflow-hidden', isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]')}>
                <DrawerHeader className="flex justify-between items-center">
                    <DrawerTitle>{popupTitle}</DrawerTitle>
                </DrawerHeader>

                <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
                    <header className="border-b overflow-hidden h-12">
                        <Carousel className="w-full h-full relative px-8">
                            <CarouselContent className="-ml-2 px-4" ref={carouselRef}>
                                {Object.entries(groupedLayers).map(([groupTitle, layerTitles], groupIdx) => (
                                    <React.Fragment key={`group-${groupIdx}`}>
                                        {layerTitles[0] === '' ? (
                                            <CarouselItem key={`group-${groupIdx}`} className="pl-2 basis-auto" id={`layer-${groupTitle}`}>
                                                <button
                                                    className={cn("px-3 py-2 text-sm font-bold transition-all text-secondary-foreground", {
                                                        'underline text-primary': activeLayerTitle === groupTitle,
                                                    })}
                                                    onClick={() => handleCarouselClick(groupTitle)}
                                                >
                                                    {groupTitle}
                                                </button>
                                            </CarouselItem>
                                        ) : (
                                            layerTitles.map((layerTitle, layerIdx) => (
                                                <CarouselItem key={`layer-${layerIdx}`} className="pl-2 basis-auto" id={`layer-${layerTitle}`}>
                                                    <button
                                                        className={cn("px-3 py-2 text-sm font-bold transition-all text-secondary-foreground", {
                                                            'underline text-primary': activeLayerTitle === layerTitle,
                                                        })}
                                                        onClick={() => handleCarouselClick(layerTitle)}
                                                    >
                                                        {layerTitle}
                                                    </button>
                                                </CarouselItem>
                                            ))
                                        )}
                                    </React.Fragment>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    </header>

                    <div className="flex overflow-hidden pt-2">
                        <div
                            ref={setContainerRef}
                            className={cn(`flex flex-1 flex-col gap-4 p-4 overflow-y-auto select-text`)}
                        >
                            <PopupContentWithPagination
                                layerContent={layerContent as unknown as { groupLayerTitle: string; layerTitle: string; features: ExtendedFeature[]; popupFields?: Record<string, string> | undefined; relatedTables?: RelatedTable[] | undefined; }[]} // TODO: fix this
                                onSectionChange={onSectionChange}
                            />
                        </div>
                    </div>
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export { PopupDrawer };