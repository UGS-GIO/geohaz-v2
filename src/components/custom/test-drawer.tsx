"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { Feature } from "geojson"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroupContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"

interface PopupContent {
    features: Feature[]
    visible: boolean
    groupLayerTitle: string
    layerTitle: string
}

interface CombinedSidebarDrawerProps {
    container: HTMLDivElement | null
    popupContent: PopupContent[]
    drawerTriggerRef: React.RefObject<HTMLButtonElement>
}

export default function TestDrawer({
    container,
    popupContent,
    drawerTriggerRef,
}: CombinedSidebarDrawerProps) {
    const [activeGroup, setActiveGroup] = useState<string | null>(null)
    const [activeLayer, setActiveLayer] = useState<string | null>(null)
    const [showSidebar, setShowSidebar] = useState(false)
    const { isCollapsed } = useSidebar()

    const layerContent = useMemo(() => popupContent, [popupContent])

    const groupedLayers = useMemo(() => {
        return layerContent.reduce((acc, item) => {
            const { groupLayerTitle, layerTitle } = item
            if (!acc[groupLayerTitle]) acc[groupLayerTitle] = []
            acc[groupLayerTitle].push(layerTitle)
            return acc
        }, {} as Record<string, string[]>)
    }, [layerContent])

    const handleGroupClick = (group: string, hasSublayers: boolean) => {
        setActiveGroup(group)
        console.log("hasSublayers", hasSublayers);

        if (hasSublayers) { setShowSidebar(true) }
        else setShowSidebar(false)


        // check if its a groulayer with layer or if it is just a layer that is not grouped
        console.log("group", group);

        // Set the first layer of the group as active
        const firstLayerInGroup = layerContent.find(layer => layer.groupLayerTitle === group)
        if (firstLayerInGroup) {
            setActiveLayer(firstLayerInGroup.layerTitle)
        }
    }

    const handleLayerClick = (layer: string) => {
        setActiveLayer(layer)
        // setShowSidebar(false)
    }

    const activeLayerContent = useMemo(() => {
        return layerContent.find((layer) => layer.layerTitle === activeLayer)
    }, [layerContent, activeLayer])

    const isMobile = () => window.innerWidth < 768

    useEffect(() => {
        if (isMobile()) setShowSidebar(false)
    }, [activeGroup])

    return (
        <Drawer container={container} modal={false}>
            <DrawerTrigger asChild>
                <Button ref={drawerTriggerRef} size="sm" className="hidden">Open Drawer</Button>
            </DrawerTrigger>

            <DrawerContent className={cn(
                'max-w-4xl',
                isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]',
                'mb-10 z-10 h-[75vh] overflow-hidden'
            )}>
                <DrawerHeader>
                    <DrawerTitle>Hazards in Your Region</DrawerTitle>
                </DrawerHeader>

                <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
                    <header className="border-b overflow-hidden h-12">
                        <Carousel className="w-full h-full relative px-8">
                            <CarouselContent className="-ml-2 px-4">
                                {Object.entries(groupedLayers).map(([groupTitle, layers], groupIdx) => {
                                    const hasSublayers = layers && layers.length > 0 && layers[0] !== ''
                                    return (
                                        <React.Fragment key={`parent-group-${groupIdx}`}>
                                            <CarouselItem key={`group-${groupIdx}`} className="pl-2 basis-auto">
                                                <button
                                                    className={cn(
                                                        "px-3 py-2 text-sm font-bold transition-all",
                                                        activeGroup === groupTitle ? "border-b-2 border-primary" : "text-secondary-foreground"
                                                    )}
                                                    onClick={() => handleGroupClick(groupTitle, hasSublayers)}
                                                >
                                                    {groupTitle}
                                                </button>
                                            </CarouselItem>

                                            {layers && layers.length > 0 && layers
                                                .filter((layer) => layer && layer.trim() !== '')
                                                .map((layer, layerIdx) => (
                                                    <CarouselItem key={`layer-${groupIdx}-${layerIdx}`} className="pl-2 basis-auto">
                                                        <button
                                                            className={cn(
                                                                "px-3 py-2 text-sm transition-all",
                                                                activeLayer === layer ? "border-b-2 border-primary" : "text-secondary-foreground"
                                                            )}
                                                            onClick={() => handleLayerClick(layer)}
                                                        >
                                                            {layer}
                                                        </button>
                                                    </CarouselItem>
                                                ))
                                            }
                                        </React.Fragment>
                                    )
                                })}

                                {/* {layerContent
                                    .filter((item) => !item.groupLayerTitle || !groupedLayers[item.groupLayerTitle])
                                    .map((item, idx) => (
                                        <CarouselItem key={`individual-${idx}`} className="pl-2 basis-auto">
                                            <button
                                                className={cn(
                                                    "px-3 py-2 text-sm transition-all",
                                                    activeLayer === item.layerTitle ? "border-b-2 border-primary" : "text-muted-foreground"
                                                )}
                                                onClick={() => handleLayerClick(item.layerTitle)}
                                            >
                                                {item.layerTitle}
                                            </button>
                                        </CarouselItem>
                                    ))} */}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    </header>

                    <div className="flex overflow-hidden pt-2">
                        {showSidebar && !isMobile() && (
                            <SidebarProvider>
                                <Sidebar collapsible="none" className="hidden md:flex pl-2
                                ">
                                    <SidebarContent>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {layerContent
                                                    .filter((layer) => layer.groupLayerTitle === activeGroup)
                                                    .map((item) => (
                                                        <SidebarMenuItem key={item.layerTitle}>
                                                            <SidebarMenuButton
                                                                size={'lg'}
                                                                isActive={item.layerTitle === activeLayer}
                                                                onClick={() => setActiveLayer(item.layerTitle)}
                                                            >
                                                                {item.layerTitle}
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarContent>
                                </Sidebar>
                                <SidebarInset>
                                    <div className="flex flex-1 flex-col gap-4 p-4">
                                        {activeLayerContent && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">
                                                    {activeLayerContent.layerTitle}
                                                </h3>
                                                {activeLayerContent.features && activeLayerContent.features.length > 0 ? (
                                                    activeLayerContent.features.map((feature, idx) => (
                                                        <div key={idx} className="p-2 border-b mb-2">
                                                            <p>ID: {feature.id}</p>
                                                            <div className="ml-2">
                                                                {feature.properties &&
                                                                    Object.entries(feature.properties).map(([key, value], propIdx) => (
                                                                        <p key={propIdx}>
                                                                            <strong>{key}:</strong> {String(value)}
                                                                        </p>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No features available for this layer.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </SidebarInset>
                            </SidebarProvider>
                        )}
                        {!showSidebar && (
                            <div className="flex flex-1 flex-col gap-4 p-4">
                                {activeLayerContent && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                            {activeLayerContent.layerTitle}
                                        </h3>
                                        {activeLayerContent.features && activeLayerContent.features.length > 0 ? (
                                            activeLayerContent.features.map((feature, idx) => (
                                                <div key={idx} className="p-2 border-b mb-2">
                                                    <p>ID: {feature.id}</p>
                                                    <div className="ml-2">
                                                        {feature.properties &&
                                                            Object.entries(feature.properties).map(([key, value], propIdx) => (
                                                                <p key={propIdx}>
                                                                    <strong>{key}:</strong> {String(value)}
                                                                </p>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No features available for this layer.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export { TestDrawer }