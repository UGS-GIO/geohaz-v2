import * as React from "react"
import { useMemo, useState, useEffect, useRef } from "react"
import { Feature, GeoJsonProperties, Geometry } from "geojson"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarProvider, SidebarMenuSubButton } from "@/components/ui/sidebar"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, RotateCcw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { SidebarInsetWithPagination } from "./sidebar-inset-with-pagination"

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
    const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set())
    const carouselRef = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()

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

    const handleGroupClick = (group: string) => {
        setActiveGroup(group)
        setShowSidebar(true)
        setActiveLayer(null)
        scrollToCarouselItem(`group-${group}`)
    }

    const handleLayerClick = (layer: string) => {
        setActiveLayer(layer)
        setShowSidebar(false)
        scrollToCarouselItem(`layer-${layer}`)
        const selectedLayer = layerContent.find(item => item.layerTitle === layer)
        if (selectedLayer) {
            setSelectedFeatures(new Set(selectedLayer.features.map(f => f.id as string)))
        }
    }

    const toggleFeature = (featureId: string) => {
        setSelectedFeatures(prev => {
            const newSet = new Set(prev)
            if (newSet.has(featureId)) {
                newSet.delete(featureId)
            } else {
                newSet.add(featureId)
            }
            return newSet
        })
    }

    const toggleAllFeaturesInLayer = (layer: PopupContent) => {
        setSelectedFeatures(prev => {
            const newSet = new Set(prev)
            const layerFeatureIds = new Set(layer.features.map(f => f.id as string))
            const allSelected = layer.features.every(f => prev.has(f.id as string))

            if (allSelected) {
                layerFeatureIds.forEach(id => newSet.delete(id))
            } else {
                layerFeatureIds.forEach(id => newSet.add(id))
            }

            return newSet
        })
    }

    const toggleAllFeaturesInGroup = (group: string) => {
        setSelectedFeatures(prev => {
            const newSet = new Set(prev)
            const groupLayers = layerContent.filter(layer => layer.groupLayerTitle === group)
            const groupFeatureIds = new Set(groupLayers.flatMap(layer => layer.features.map(f => f.id as string)))
            const allSelected = groupLayers.every(layer =>
                layer.features.every(f => prev.has(f.id as string))
            )

            if (allSelected) {
                groupFeatureIds.forEach(id => newSet.delete(id))
            } else {
                groupFeatureIds.forEach(id => newSet.add(id))
            }

            return newSet
        })
    }

    const handleCheckboxClick = (
        e: React.MouseEvent<HTMLDivElement>,
        item: PopupContent | string
    ) => {
        e.stopPropagation()
        if (typeof item === 'string') {
            toggleAllFeaturesInGroup(item)
        } else {
            toggleAllFeaturesInLayer(item)
        }
    }

    const resetDisplayState = () => {
        setSelectedFeatures(new Set())
        setActiveGroup(null)
        setActiveLayer(null)
        setShowSidebar(false)
    }

    useEffect(() => {
        if (isMobile) setShowSidebar(false)
    }, [activeGroup, isMobile])

    useEffect(() => {
        if (layerContent.length > 0) {
            const firstGroup = layerContent[0].groupLayerTitle
            setActiveGroup(firstGroup)
            setShowSidebar(true)
        }
    }, [layerContent])


    // replace with popup templates
    const featureContent = (feature: Feature<Geometry, GeoJsonProperties>) => {
        return (
            feature.properties &&
            Object.entries(feature.properties).map(([key, value], propIdx) => (
                <div key={propIdx} className="flex flex-col">
                    <p className="font-bold underline text-primary">{key}</p>
                    <p
                        className="max-w-full break-words"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                        {String(value)}
                    </p>
                </div>
            ))
        )
    }

    return (
        <Drawer container={container} modal={false}>
            <DrawerTrigger asChild>
                <Button ref={drawerTriggerRef} size="sm" className="hidden">Open Drawer</Button>
            </DrawerTrigger>

            <DrawerContent className={cn(
                'max-w-4xl',
                isCollapsed ? 'md:ml-[15rem]' : 'md:ml-[38rem]',
                'mb-10 z-10 max-h-[85vh] overflow-hidden'
            )}>
                <DrawerHeader className="flex justify-between items-center">
                    <DrawerTitle>Hazards in Your Region</DrawerTitle>
                    <Button variant="ghost" size="icon" onClick={resetDisplayState}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </DrawerHeader>

                <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
                    <header className="border-b overflow-hidden h-12">
                        <Carousel className="w-full h-full relative px-8">
                            <CarouselContent className="-ml-2 px-4" ref={carouselRef}>
                                {Object.entries(groupedLayers).map(([groupTitle, layers], groupIdx) => (
                                    <React.Fragment key={`parent-group-${groupIdx}`}>
                                        <CarouselItem key={`group-${groupIdx}`} className="pl-2 basis-auto" data-id={`group-${groupTitle}`}>
                                            <button
                                                className={cn(
                                                    "px-3 py-2 text-sm font-bold transition-all",
                                                    activeGroup === groupTitle ? "border-b-2 border-primary" : "text-secondary-foreground"
                                                )}
                                                onClick={() => !isMobile && handleGroupClick(groupTitle)}
                                            >
                                                {groupTitle}{
                                                    layers && layers.length > 0 && layers[0] !== '' && (
                                                        ":"
                                                    )
                                                }
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
                                                        onClick={() => handleLayerClick(layer)}
                                                    >
                                                        {layer}
                                                    </button>
                                                </CarouselItem>
                                            ))
                                        }
                                    </React.Fragment>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    </header>

                    <div className="flex overflow-hidden pt-2">
                        {showSidebar && !isMobile && (
                            <SidebarProvider className="min-h-full">
                                <Sidebar collapsible="none" className="hidden md:flex pl-2">
                                    <SidebarContent>
                                        {Object.entries(groupedLayers).map(([groupTitle]) => {
                                            return (
                                                <SidebarGroup key={groupTitle} className="gap-2 border border-secondary rounded">
                                                    <SidebarGroupLabel
                                                        className="!h-auto !min-h-0 px-2 py-1"
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="text-xs leading-tight">{groupTitle}</span>
                                                        </div>
                                                    </SidebarGroupLabel>
                                                    <SidebarGroupContent>
                                                        <SidebarMenu>
                                                            {layerContent
                                                                .filter((layer) => layer.groupLayerTitle === groupTitle)
                                                                .map((item) => (
                                                                    <Collapsible
                                                                        key={item.layerTitle}
                                                                        defaultOpen={false}
                                                                        className="group/collapsible"
                                                                    >
                                                                        <SidebarMenuItem>
                                                                            <CollapsibleTrigger asChild>
                                                                                <div
                                                                                    className="flex items-center w-full cursor-pointer px-3 py-2"
                                                                                    onClick={() => {
                                                                                        setActiveLayer(item.layerTitle)
                                                                                        scrollToCarouselItem(`layer-${item.layerTitle}`)
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        onClick={(e) => handleCheckboxClick(e, item)}
                                                                                        className="mr-2 flex-shrink-0"
                                                                                    >
                                                                                        <Checkbox
                                                                                            checked={item.features.every(f => selectedFeatures.has(f.id as string))}
                                                                                        />
                                                                                    </div>
                                                                                    <span className="text-sm">
                                                                                        {item.layerTitle === '' ? groupTitle : item.layerTitle}
                                                                                    </span>
                                                                                    <Badge variant="outline" className="ml-2">{item.features.length}</Badge>
                                                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                                                </div>
                                                                            </CollapsibleTrigger>
                                                                        </SidebarMenuItem>
                                                                        <CollapsibleContent>
                                                                            <SidebarMenuSub>
                                                                                {item.features && item.features.length > 0 && item.features.map((feature) => (
                                                                                    <SidebarMenuSubItem key={feature.id}>
                                                                                        <SidebarMenuSubButton
                                                                                            size={"md"}
                                                                                            isActive={selectedFeatures.has(feature.id as string)}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation()
                                                                                                toggleFeature(feature.id as string)
                                                                                            }}
                                                                                        >
                                                                                            <div className="flex items-center">
                                                                                                <Checkbox
                                                                                                    checked={selectedFeatures.has(feature.id as string)}
                                                                                                />

                                                                                                <span className="ml-2 text-xs">{`Feature ${feature.id?.toString().split('.')[1]}`}</span>
                                                                                            </div>
                                                                                        </SidebarMenuSubButton>
                                                                                    </SidebarMenuSubItem>
                                                                                ))}
                                                                            </SidebarMenuSub>
                                                                        </CollapsibleContent>
                                                                    </Collapsible>
                                                                ))}
                                                        </SidebarMenu>
                                                    </SidebarGroupContent>
                                                </SidebarGroup>
                                            )
                                        })}
                                    </SidebarContent>
                                </Sidebar>
                                {/* <SidebarInset className="min-h-full">
                                    <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                                        {layerContent.map((layer) => (
                                            <React.Fragment key={layer.layerTitle}>
                                                {layer.features.some(feature => selectedFeatures.has(feature.id as string)) && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold mb-4">
                                                            {layer.groupLayerTitle}{layer.layerTitle === '' ? '' : ` - ${layer.layerTitle}`}
                                                        </h3>
                                                        {layer.features
                                                            .filter(feature => selectedFeatures.has(feature.id as string))
                                                            .map((feature, idx) => (
                                                                <Accordion key={idx} type="multiple">
                                                                    <AccordionItem value={`Feature ${feature.id?.toString().split('.')[1]}`}>
                                                                        <AccordionHeader>
                                                                            <AccordionTrigger>
                                                                                <h3 className="text-md font-medium text-left">
                                                                                    {`Feature ${feature.id?.toString().split('.')[1]}`}
                                                                                </h3>
                                                                            </AccordionTrigger>
                                                                        </AccordionHeader>

                                                                        <AccordionContent className="p-2 border-b mb-2">
                                                                            <div className="ml-2 grid grid-cols-3 gap-4">
                                                                                {featureContent(feature)}
                                                                            </div>
                                                                        </AccordionContent>
                                                                    </AccordionItem>
                                                                </Accordion>
                                                            ))}
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </SidebarInset> */}
                                <SidebarInsetWithPagination
                                    layerContent={layerContent}
                                    selectedFeatures={selectedFeatures}
                                />
                            </SidebarProvider>
                        )}

                        {!showSidebar && (
                            <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                                {layerContent.map((layer) => (
                                    <React.Fragment key={layer.layerTitle}>
                                        {(layer.features.some(feature => selectedFeatures.has(feature.id as string)) || layer.layerTitle === activeLayer) && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">
                                                    {layer.groupLayerTitle} - {layer.layerTitle}
                                                </h3>
                                                {layer.features
                                                    .filter(feature => selectedFeatures.has(feature.id as string) || layer.layerTitle === activeLayer)
                                                    .map((feature, idx) => (
                                                        <Accordion key={idx} type="multiple">
                                                            <AccordionItem value={`Feature ${feature.id?.toString().split('.')[1]}`}>
                                                                <AccordionHeader>
                                                                    <AccordionTrigger>
                                                                        <h3 className="text-md font-medium text-left">
                                                                            {`Feature ${feature.id?.toString().split('.')[1]}`}
                                                                        </h3>
                                                                    </AccordionTrigger>
                                                                </AccordionHeader>

                                                                <AccordionContent className="p-2 border-b mb-2">
                                                                    <div className="ml-2 grid grid-cols-3 gap-4">
                                                                        {featureContent(feature)}
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    ))}
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
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