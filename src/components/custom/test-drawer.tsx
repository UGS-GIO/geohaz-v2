import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Feature } from "geojson";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { PopupContentWithPagination } from "./popup-content-with-pagination";

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
}

export default function TestDrawer({
    container,
    popupContent,
    drawerTriggerRef,
}: CombinedSidebarDrawerProps) {
    const { isCollapsed } = useSidebar();
    const carouselRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [activeLayer, setActiveLayer] = useState<string>("");
    const [isCarouselControllingScroll, setIsCarouselControllingScroll] = useState(false);

    const layerContent = useMemo(() => popupContent, [popupContent]);

    const groupedLayers = useMemo(() => {
        const layers = layerContent.map((item) => item.layerTitle);
        setActiveLayer(layers[0]);
        return layerContent.reduce((acc, item) => {
            const { groupLayerTitle, layerTitle } = item;
            if (!acc[groupLayerTitle]) acc[groupLayerTitle] = [];
            acc[groupLayerTitle].push(layerTitle);
            return acc;
        }, {} as Record<string, string[]>);
    }, [layerContent]);

    const handleCarouselClick = useCallback(
        (layerTitle: string) => {
            const element = document.getElementById(`page-${layerTitle}`);
            if (element) {
                setIsCarouselControllingScroll(true); // Indicate that the carousel is controlling the scroll
                element.scrollIntoView({ behavior: "smooth", block: "start" });

                setTimeout(() => {
                    setIsCarouselControllingScroll(false);
                }, 1000); // Adjust delay if necessary

                setActiveLayer(layerTitle); // Set the active layer based on the clicked carousel item
            }
        },
        []
    );

    const handleScroll = useCallback(
        (event: React.UIEvent<HTMLDivElement>) => {
            if (isCarouselControllingScroll) return;

            const scrollTarget = event.currentTarget;
            const elements = Array.from(scrollTarget.querySelectorAll("[id^='page-']"))
                .filter((el): el is HTMLElement => el instanceof HTMLElement);

            let closestElement: HTMLElement | null = null;
            let minDistance = Infinity;

            elements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const distanceFromTop = Math.abs(rect.top);

                if (distanceFromTop < minDistance) {
                    minDistance = distanceFromTop;
                    closestElement = element;
                }
            });

            if (closestElement !== null) {
                const closestElementTyped = closestElement as HTMLElement;
                const layerTitle = closestElementTyped.id.replace("page-", "");
                setActiveLayer(layerTitle);
            }
        },
        [isCarouselControllingScroll]
    );

    const setContainerRef = useCallback((node: HTMLDivElement | null) => {
        containerRef.current = node;
    }, []);

    return (
        <Drawer container={container} modal={false}>
            <DrawerTrigger asChild>
                <Button ref={drawerTriggerRef} size="sm" className="hidden">Open Drawer</Button>
            </DrawerTrigger>

            <DrawerContent className={cn('max-w-4xl mb-10 z-10 max-h-[85vh] overflow-hidden', isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]')}>
                <DrawerHeader className="flex justify-between items-center">
                    <DrawerTitle>Hazards in Your Region</DrawerTitle>
                </DrawerHeader>

                <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
                    <header className="border-b overflow-hidden h-12">
                        <Carousel className="w-full h-full relative px-8">
                            <CarouselContent className="-ml-2 px-4" ref={carouselRef}>
                                {Object.entries(groupedLayers).map(([_, layers], groupIdx) => (
                                    <React.Fragment key={`parent-group-${groupIdx}`}>
                                        {layers.map((layer, layerIdx) => (
                                            <CarouselItem key={`layer-${layerIdx}`} className="pl-2 basis-auto" data-id={`layer-${layer}`}>
                                                <button
                                                    className={cn("px-3 py-2 text-sm font-bold transition-all text-secondary-foreground", {
                                                        'underline text-primary': activeLayer === layer,
                                                    })}
                                                    onClick={() => handleCarouselClick(layer)}
                                                >
                                                    {layer}
                                                </button>
                                            </CarouselItem>
                                        ))}
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
                                layerContent={layerContent}
                                handleScroll={handleScroll}
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

export { TestDrawer };