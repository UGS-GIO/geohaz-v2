import { clsx } from 'clsx';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { Button } from "@/components/ui/button";
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Feature } from "geojson";


interface PopupContent {
    features: Feature[];
    visible: boolean;
    groupLayerTitle: string;
    layerTitle: string;
}


interface VaulDrawerProps {
    popupContent: PopupContent[];
    container: HTMLDivElement | null;
    drawerTriggerRef: React.RefObject<HTMLButtonElement>;
    popupTitle: string;
}

const snapPoints = [.3, .65, 1];

export function VaulDrawer({
    container,
    drawerTriggerRef,
    popupTitle,
    popupContent
}: VaulDrawerProps) {
    const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
    const { isCollapsed } = useSidebar();

    return (
        <Drawer.Root
            snapPoints={snapPoints}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            modal={false}
        // container={container}
        >
            <Drawer.Trigger asChild>
                <Button ref={drawerTriggerRef} size="sm" className="hidden">
                    Open Drawer
                </Button>
            </Drawer.Trigger>

            {/* <Drawer.Overlay className="fixed inset-0 bg-black/40" /> */}

            <Drawer.Portal>
                <Drawer.Content
                    data-testid="content"
                    className={cn(
                        // Base styles
                        "fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 !h[100dvh]",
                        // Width and positioning
                        "max-w-4xl mx-auto left-0 right-0",
                        // Additional utilities
                        "mb-10 z-10 overflow-y-auto",
                        // Remove margin adjustments based on sidebar for desktop
                        // "md:left-1/2 md:-translate-x-1/2"
                    )}
                >
                    <Drawer.Description>
                        gnkgldnakl
                    </Drawer.Description>
                    <div
                        className={cn('flex flex-col max-w-md mx-auto w-full p-4 pt-5 h-[calc(100dvh-8vh)]', {
                            'overflow-y-auto': snap === 1,
                            'overflow-hidden': snap !== 1,
                        })}
                    >
                        <div className="flex items-center">
                            <svg
                                className="text-yellow-400 h-5 w-5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <svg
                                className="text-yellow-400 h-5 w-5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <svg
                                className="text-yellow-400 h-5 w-5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <svg
                                className="text-yellow-400 h-5 w-5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            <svg
                                className="text-yellow-400 h-5 w-5 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                        <Drawer.Title className="text-2xl mt-2 font-medium text-gray-900">The Hidden Details</Drawer.Title>
                        <p className="text-sm mt-1 text-gray-600 mb-6">40 videos, 20+ exercises</p>
                        <p className="text-gray-600">
                            The world of user interface design is an intricate landscape filled with hidden details and nuance. In
                            this course, you will learn something cool. To the untrained eye, a beautifully designed UI.
                        </p>
                        <button className="bg-black text-gray-50 mt-8 rounded-md h-[48px] flex-shrink-0 font-medium">
                            Buy for $199
                        </button>
                        <div className="mt-12">
                            <h2 className="text-xl font-medium text-gray-900">Module 01. The Details</h2>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <span className="block text-gray-900">Layers of UI</span>
                                    <span className="text-gray-600">A basic introduction to Layers of Design.</span>
                                </div>
                                <div>
                                    <span className="block text-gray-900">Typography</span>
                                    <span className="text-gray-600">The fundamentals of type.</span>
                                </div>
                                <div>
                                    <span className="block text-gray-900">UI Animations</span>
                                    <span className="text-gray-600">Going through the right easings and durations.</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12">
                            <figure>
                                <blockquote className="font-serif text-gray-900">
                                    “I especially loved the hidden details video. That was so useful, learned a lot by just reading it.
                                    Can&rsquo;t wait for more course content!”
                                </blockquote>
                                <figcaption>
                                    <span className="text-sm text-gray-600 mt-2 block">Yvonne Ray, Frontend Developer</span>
                                </figcaption>
                            </figure>
                        </div>
                        <div className="mt-12">
                            <h2 className="text-xl font-medium text-gray-900">Module 02. The Process</h2>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <span className="block text-gray-900">Build</span>
                                    <span className="text-gray-600">Create cool components to practice.</span>
                                </div>
                                <div>
                                    <span className="block text-gray-900">User Insight</span>
                                    <span className="text-gray-600">Find out what users think and fine-tune.</span>
                                </div>
                                <div>
                                    <span className="block text-gray-900">Putting it all together</span>
                                    <span className="text-gray-600">Let&apos;s build an app together and apply everything.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}