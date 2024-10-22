import * as React from "react"
import { useMemo, useState, useEffect, useRef } from "react"
import { Feature, GeoJsonProperties, Geometry } from "geojson"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider } from "@/components/ui/sidebar"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, Minus, Plus } from "lucide-react"

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
    const [sidebarInsetContent, setSidebarInsetContent] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
    const carouselRef = useRef<HTMLDivElement>(null)


    const layerContent = useMemo(() => popupContent, [popupContent])

    const groupedLayers = useMemo(() => {
        return layerContent.reduce((acc, item) => {
            const { groupLayerTitle, layerTitle } = item
            if (!acc[groupLayerTitle]) acc[groupLayerTitle] = []
            acc[groupLayerTitle].push(layerTitle)
            return acc
        }, {} as Record<string, string[]>)
    }, [layerContent])

    const scrollToCarouselItem = (itemId: string) => {
        if (carouselRef.current) {
            const item = carouselRef.current.querySelector(`[data-id="${itemId}"]`)
            if (item) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }

    const handleGroupClick = (group: string, hasSublayers: boolean) => {
        setActiveGroup(group)
        console.log('Group:', group);
        console.log('Has sublayers:', hasSublayers);

        setShowSidebar(hasSublayers)

        // Set the first layer of the group as active
        const firstLayerInGroup = layerContent.find(layer => layer.groupLayerTitle === group)
        if (firstLayerInGroup) {
            setActiveLayer(firstLayerInGroup.layerTitle)
        }

        scrollToCarouselItem(`group-${group}`)
    }

    const handleLayerClick = (layer: string, hasSublayers: boolean) => {
        console.log('Layer123:', layer);

        setActiveLayer(layer)
        setShowSidebar(hasSublayers)
        setSidebarInsetContent(null); // Ensure we're not showing just one feature
        scrollToCarouselItem(`layer-${layer}`)
    }

    const activeLayerContent = useMemo(() => {
        return layerContent.find((layer) => layer.layerTitle === activeLayer)
    }, [layerContent, activeLayer])

    const isMobile = () => window.innerWidth < 768

    useEffect(() => {
        if (isMobile()) setShowSidebar(false)
    }, [activeGroup])

    // Set initial active group and layer
    useEffect(() => {
        if (layerContent.length > 0) {
            const firstGroup = layerContent[0].groupLayerTitle
            const firstLayer = layerContent[0].layerTitle

            console.log('First group:', firstGroup);
            console.log('First layer:', firstLayer);

            if (firstLayer !== '') {
                setActiveGroup(firstGroup)
                setActiveLayer(firstLayer)
                setShowSidebar(true)
            } else {
                setActiveGroup(firstGroup)
                setActiveLayer(null)
                setShowSidebar(false)
            }
        }
    }, [layerContent])

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
                            <CarouselContent className="-ml-2 px-4" ref={carouselRef}>
                                {Object.entries(groupedLayers).map(([groupTitle, layers], groupIdx) => {
                                    const hasSublayers = layers && layers.length > 0 && layers[0] !== ''
                                    return (
                                        <React.Fragment key={`parent-group-${groupIdx}`}>
                                            <CarouselItem key={`group-${groupIdx}`} className="pl-2 basis-auto" data-id={`group-${groupTitle}`}>
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
                                                    <CarouselItem key={`layer-${groupIdx}-${layerIdx}`} className="pl-2 basis-auto" data-id={`layer-${layer}`}>
                                                        <button
                                                            className={cn(
                                                                "px-3 py-2 text-sm transition-all",
                                                                activeLayer === layer ? "border-b-2 border-primary" : "text-secondary-foreground"
                                                            )}
                                                            onClick={() => handleLayerClick(layer, false)}
                                                        >
                                                            {layer}
                                                        </button>
                                                    </CarouselItem>
                                                ))
                                            }
                                        </React.Fragment>
                                    )
                                })}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    </header>

                    <div className="flex overflow-hidden pt-2">
                        {showSidebar && !isMobile() && (
                            <SidebarProvider>
                                <Sidebar collapsible="none" className="hidden md:flex pl-2">
                                    <SidebarContent>
                                        <SidebarGroupContent>
                                            <SidebarGroup>
                                                <SidebarMenu>
                                                    {layerContent
                                                        .filter((layer) => layer.groupLayerTitle === activeGroup)
                                                        .map((item) => (
                                                            <Collapsible
                                                                key={item.layerTitle}
                                                                defaultOpen={true}
                                                                className="group/collapsible"
                                                            >
                                                                <SidebarMenuItem>
                                                                    <CollapsibleTrigger asChild>
                                                                        <SidebarMenuButton
                                                                            size={'lg'}
                                                                            isActive={item.layerTitle === activeLayer}
                                                                            onClick={() => {
                                                                                setActiveLayer(item.layerTitle)
                                                                                scrollToCarouselItem(`group-${item.layerTitle}`)
                                                                            }}
                                                                        >
                                                                            {item.layerTitle}{" "}
                                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                                        </SidebarMenuButton>
                                                                    </CollapsibleTrigger>
                                                                    {item.features && item.features.length > 0 && (
                                                                        <CollapsibleContent>
                                                                            <SidebarMenuSub>
                                                                                {item.features.map((feature) => (
                                                                                    <SidebarMenuSubItem key={feature.id}>
                                                                                        <SidebarMenuSubButton
                                                                                            size={"md"} asChild
                                                                                            onClick={() => setSidebarInsetContent(feature)}
                                                                                            isActive={sidebarInsetContent?.id === feature.id}
                                                                                        >
                                                                                            <span>{`Feature ${feature.id?.toString().split('.')[1]}`}</span>
                                                                                        </SidebarMenuSubButton>
                                                                                    </SidebarMenuSubItem>
                                                                                ))}
                                                                            </SidebarMenuSub>
                                                                        </CollapsibleContent>
                                                                    )}
                                                                </SidebarMenuItem>
                                                            </Collapsible>
                                                        ))}
                                                </SidebarMenu>
                                            </SidebarGroup>
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
                                                {sidebarInsetContent ? (
                                                    <div key={sidebarInsetContent?.id} className="p-2">
                                                        <p>ID: {sidebarInsetContent?.id}</p>
                                                        <div className="ml-2 grid grid-cols-3 gap-4"> {/* Adjust the number of columns by changing grid-cols-3 */}
                                                            {sidebarInsetContent?.properties &&
                                                                Object.entries(sidebarInsetContent?.properties).map(([key, value], propIdx) => (
                                                                    <div key={propIdx} className="flex flex-col">
                                                                        <p className="font-bold underline">{key}</p>
                                                                        <p>{String(value)}</p>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
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
                            <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                                {activeLayerContent && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                            {activeLayerContent.layerTitle}
                                        </h3>
                                        {activeLayerContent.features && activeLayerContent.features.length > 0 ? (
                                            activeLayerContent.features.map((feature, idx) => (
                                                <div key={idx} className="p-2 border-b mb-2">
                                                    <p>ID: {feature.id}</p>
                                                    <div className="ml-2 grid grid-cols-3 gap-4"> {/* Adjust the number of columns by changing grid-cols-3 */}
                                                        {feature.properties &&
                                                            Object.entries(feature.properties).map(([key, value], propIdx) => (
                                                                <div key={propIdx} className="flex flex-col">
                                                                    <p className="font-bold underline">{key}</p>
                                                                    <p>{String(value)}</p>
                                                                </div>
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