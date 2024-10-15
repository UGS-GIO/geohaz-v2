import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/custom/button';
import { Drawer as VaulDrawer } from 'vaul';
import { MapContext } from '@/context/map-provider';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { useMapInteractions } from '@/hooks/use-map-interactions';

import * as React from "react"
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import { Bar, BarChart, ResponsiveContainer } from "recharts"

const data = [
    { goal: 400 }, { goal: 300 }, { goal: 200 }, { goal: 300 },
    { goal: 200 }, { goal: 278 }, { goal: 189 }, { goal: 239 },
    { goal: 300 }, { goal: 200 }, { goal: 278 }, { goal: 189 },
    { goal: 349 },
];

function TestDrawer({ container, drawerTriggerRef }: { container: HTMLDivElement | null, drawerTriggerRef: React.RefObject<HTMLButtonElement> }) {
    const { isCollapsed } = useSidebar();
    const [goal, setGoal] = useState(350);
    const [snap, setSnap] = useState<number | string | null>(0);
    const snapPoints = [0.2, 0.5, 0.8];
    const { visibleLayers } = useMapInteractions();
    const [layerContent, setLayerContent] = useState<string>("");

    // Trigger function to fetch visible layers when drawer is opened
    const handleDrawerOpen = () => {
        const layerInfo = visibleLayers.map(layer => layer.title).join(', ');
        setLayerContent(layerInfo ? `Visible layers: ${layerInfo}` : 'No visible layers');
    };

    useEffect(() => {
        const triggerBtn = drawerTriggerRef.current;
        if (triggerBtn) {
            triggerBtn.addEventListener('click', handleDrawerOpen);
        }

        return () => {
            if (triggerBtn) {
                triggerBtn.removeEventListener('click', handleDrawerOpen);
            }
        };
    }, [drawerTriggerRef, visibleLayers]);

    function onClick(adjustment: number) {
        setGoal(Math.max(200, Math.min(400, goal + adjustment)));
    }

    const triggerBtn = (
        <button ref={drawerTriggerRef} className="hidden">
            Open Dialog
        </button>
    );

    return (
        <Drawer snapPoints={snapPoints} modal={false} container={container} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
            <DrawerTrigger asChild>
                {triggerBtn}
            </DrawerTrigger>
            <DrawerContent className={cn('max-w-4xl', isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]', 'mb-10 z-10')}>
                <DrawerHeader>
                    <DrawerTitle>Move Goal</DrawerTitle>
                    <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                </DrawerHeader>

                {/* Add layer content here */}
                <div className="p-4 pb-0">
                    <div className="mb-4">
                        <h4 className="font-bold">Map Layers</h4>
                        <p>{layerContent}</p>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full"
                            onClick={() => onClick(-10)}
                            disabled={goal <= 200}
                        >
                            <MinusIcon className="h-4 w-4" />
                            <span className="sr-only">Decrease</span>
                        </Button>
                        <div className="flex-1 text-center">
                            <div className="text-7xl font-bold tracking-tighter">{goal}</div>
                            <div className="text-[0.70rem] uppercase text-muted-foreground">Calories/day</div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full"
                            onClick={() => onClick(10)}
                            disabled={goal >= 400}
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span className="sr-only">Increase</span>
                        </Button>
                    </div>

                    <div className="mt-3 h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <Bar
                                    dataKey="goal"
                                    style={{ fill: "hsl(var(--foreground))", opacity: 0.9 }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export { TestDrawer };
