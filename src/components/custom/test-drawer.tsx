import { useMemo, useState, useEffect } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/custom/button';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Feature } from 'geojson';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PopupContent {
    features: Feature[];
    visible: boolean;
    groupLayerTitle: string;
    layerTitle: string;
}

function TestDrawer({ container, popupContent, drawerTriggerRef }: {
    container: HTMLDivElement | null,
    popupContent: PopupContent[],
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
}) {
    const { isCollapsed } = useSidebar();
    const [snap, setSnap] = useState<number | string | null>(0);
    const snapPoints = [0.2, 0.5, 0.8];

    const layerContent = useMemo(() =>
        popupContent.length ? popupContent : [],
        [popupContent]
    );

    // Initialize activeTab state
    const [activeTab, setActiveTab] = useState<string>('');

    // Update activeTab whenever layerContent changes
    useEffect(() => {
        if (layerContent.length > 0) {
            setActiveTab(layerContent[0].groupLayerTitle);
        }
    }, [layerContent]);

    const filteredContent = useMemo(() => {
        return layerContent.filter(layer => layer.groupLayerTitle === activeTab);
    }, [layerContent, activeTab]);

    const triggerBtn = (
        <button ref={drawerTriggerRef} className="hidden">
            Open Dialog
        </button>
    );

    // Create unique tabs based on groupLayerTitle
    const tabsHeadList = Array.from(new Set(popupContent.map(({ groupLayerTitle }) => groupLayerTitle)))
        .map(title => ({
            id: title,
            value: title,
            label: title
        }));

    return (
        <Drawer snapPoints={snapPoints} modal={false} container={container} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
            <DrawerTrigger asChild>
                {triggerBtn}
            </DrawerTrigger>
            <DrawerContent className={cn('max-w-4xl', isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]', 'mb-10 z-10')}>
                <DrawerHeader>
                    <DrawerTitle>Hazards in Your Region </DrawerTitle>
                    <DrawerDescription>
                        <ScrollArea>
                            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                                <div className="w-full relative h-10 justify-center flex overflow-x-auto
                                ">
                                    <TabsList className="flex absolute h-10">
                                        {tabsHeadList.map(({ id, value, label }) => (
                                            <TabsTrigger key={id} value={value}>
                                                {label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>
                            </Tabs>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 overflow-y-scroll h-20">
                    {filteredContent.length > 0 ? (
                        filteredContent.map((layer, index) => {

                            return (
                                <div key={index}>
                                    <h3>{layer.layerTitle}</h3>
                                    {
                                        layer.features.map((feature, index) => (
                                            <div key={index}>
                                                <p>{feature.id}</p>
                                                {/* render all properties*/}
                                                {/* TODO: use popuptemplates that include an array of properties to display */}
                                                {
                                                    feature.properties && Object.entries(feature.properties).map(([key, value], index) => (
                                                        <div key={index}>
                                                            <p>{key}: {value}</p>
                                                        </div>
                                                    ))
                                                }

                                            </div>
                                        ))

                                    }
                                </div>
                            )
                        })
                    ) : (
                        <p>No data available for this tab.</p>
                    )}
                </div>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export { TestDrawer };
