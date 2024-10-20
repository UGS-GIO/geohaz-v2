"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { Feature } from "geojson"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
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
    const [open, setOpen] = React.useState(false)
    const [activeGroup, setActiveGroup] = useState<string | null>(null)
    const [activeLayer, setActiveLayer] = useState<string | null>(null)
    const [snap, setSnap] = useState<number | string | null>(0);
    const snapPoints = [0.2, 0.5, 0.8];
    const { isCollapsed } = useSidebar();

    const layerContent = useMemo(() => popupContent, [popupContent])

    const groupedTitles = useMemo(
        () => Array.from(new Set(layerContent.map(({ groupLayerTitle }) => groupLayerTitle))),
        [layerContent]
    )

    const filteredContent = useMemo(
        () => layerContent.filter((layer) => layer.groupLayerTitle === activeGroup),
        [layerContent, activeGroup]
    )

    useEffect(() => {
        if (filteredContent.length > 0) {
            setActiveLayer(filteredContent[0].layerTitle)
        }
    }, [filteredContent])

    const activeLayerContent = useMemo(
        () => filteredContent.find((layer) => layer.layerTitle === activeLayer),
        [filteredContent, activeLayer]
    )

    const handleGroupChange = (title: string) => {
        setActiveGroup(title)
        const firstLayerInGroup = layerContent.find((layer) => layer.groupLayerTitle === title)
        if (firstLayerInGroup) {
            setActiveLayer(firstLayerInGroup.layerTitle)
        }
    }

    return (
        <Drawer
            snapPoints={snapPoints}
            modal={false}
            container={container}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
        >
            <DrawerTrigger asChild>
                <Button ref={drawerTriggerRef} size="sm">
                    Open Drawer
                </Button>
            </DrawerTrigger>
            <DrawerContent className={cn('max-w-4xl', isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]', 'mb-10 z-10 h-[75vh]')}>
                <DrawerHeader>
                    <DrawerTitle>Hazards in Your Region</DrawerTitle>
                    <DrawerDescription>Explore hazards in your region by category.</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-1 overflow-hidden">
                    <SidebarProvider className="items-start">
                        <Sidebar collapsible="none" className="hidden md:flex">
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {filteredContent.map((item) => (
                                                <SidebarMenuItem key={item.layerTitle}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={item.layerTitle === activeLayer}
                                                        onClick={() => setActiveLayer(item.layerTitle)}
                                                    >
                                                        <a href="#">
                                                            <span>{item.layerTitle}</span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </Sidebar>
                        <main className="flex flex-1 flex-col overflow-hidden">
                            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                                <Carousel className="w-full max-w-xs">
                                    <CarouselContent>
                                        {groupedTitles.map((title, idx) => (
                                            <CarouselItem key={idx}>
                                                <Button
                                                    variant={activeGroup === title ? "default" : "outline"}
                                                    className="w-full"
                                                    onClick={() => handleGroupChange(title)}
                                                >
                                                    {title}
                                                </Button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </header>
                            <div className="flex-1 overflow-y-auto p-4">
                                {activeLayerContent && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">{activeLayerContent.layerTitle}</h3>
                                        {activeLayerContent.features.map((feature, featureIdx) => (
                                            <div key={featureIdx} className="p-2 border-b mb-2">
                                                <p className="font-semibold">ID: {feature.id}</p>
                                                {feature.properties && (
                                                    <div className="ml-2">
                                                        {Object.entries(feature.properties).map(([key, value], propIdx) => (
                                                            <p key={propIdx} className="text-sm">
                                                                <span className="font-medium">{key}:</span> {value}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </main>
                    </SidebarProvider>
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