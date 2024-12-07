import { useContext, useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Feature, Geometry, GeoJsonProperties } from "geojson"
import { Button } from "@/components/ui/button"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"
import { GenericPopup } from "./generic-popup"
import { RelatedTable } from "@/lib/types/mapping-types"
import proj4 from 'proj4';
import { MapContext } from "@/context/map-provider"
import { highlightFeature, fetchWfsGeometry, convertBbox } from '@/lib/mapping-utils';
import Extent from "@arcgis/core/geometry/Extent"
import { useGetPopupButtons } from "@/hooks/use-get-popup-buttons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ITEMS_PER_PAGE_OPTIONS = [1, 5, 10, 25, 50, Infinity] // 'Infinity' for 'All'

export interface ExtendedFeature extends Feature<Geometry, GeoJsonProperties> {
    namespace: string;
}

interface LayerContentProps {
    groupLayerTitle: string
    layerTitle: string
    features: ExtendedFeature[]
    popupFields?: Record<string, string>
    relatedTables?: RelatedTable[]
}

interface SidebarInsetWithPaginationProps {
    layerContent: LayerContentProps[]
    onSectionChange: (layerTitle: string) => void
}

interface PopupPaginationProps {
    currentPage: number
    totalPages: number
    handlePageChange: (page: number) => void
    itemsPerPage: number
    onItemsPerPageChange: (size: number) => void
}

const PopupPagination = ({ currentPage, totalPages, handlePageChange, itemsPerPage, onItemsPerPageChange }: PopupPaginationProps) => {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Select
                    value={`${itemsPerPage}`}
                    onValueChange={(value) => onItemsPerPageChange(value === "Infinity" ? Infinity : Number(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={itemsPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={`${option}`}>
                                {option === Infinity ? "All" : option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                    <ChevronFirst className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                    <ChevronLast className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

const LayerCard = ({
    layer,
    buttons,
    handleZoomToFeature
}: {
    layer: LayerContentProps,
    buttons: React.ReactNode[] | null,
    handleZoomToFeature: (feature: ExtendedFeature) => Promise<void>
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0])
    const [currentPage, setCurrentPage] = useState(1)

    // Calculate total pages based on items per page
    const totalPages = useMemo(() =>
        Math.ceil(layer.features.length / itemsPerPage),
        [layer.features, itemsPerPage]
    )

    // Paginate features for this layer
    const paginatedFeatures = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return layer.features.slice(startIndex, startIndex + itemsPerPage)
    }, [layer.features, currentPage, itemsPerPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const PopupButtons = ({ feature }: { feature: ExtendedFeature }) => (
        <div className="flex justify-start gap-2">
            <Button onClick={() => handleZoomToFeature(feature)} variant={'secondary'}>
                Zoom to Feature
            </Button>
            {buttons && buttons.map((button) => button)}
        </div>
    )

    return (
        <Card
            id={`section-${layer.layerTitle !== '' ? layer.layerTitle : layer.groupLayerTitle}`}
            className="w-full"
        >
            <CardHeader>
                <CardTitle>
                    {layer.groupLayerTitle}
                    {layer.layerTitle && ` - ${layer.layerTitle}`}
                </CardTitle>
                {layer.features.length > ITEMS_PER_PAGE_OPTIONS[0] && (
                    <PopupPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {paginatedFeatures.map((feature, idx) => (
                    <div
                        key={idx}
                        className={`
                            space-y-4 
                            p-4 
                            rounded-lg 
                            ${idx % 2 === 0 ? 'bg-secondary/10' : 'bg-secondary/5'}
                            border 
                            border-secondary/20
                        `}
                    >
                        {/* <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-foreground">
                                Feature {idx + 1}
                                {layer.layerTitle && ` - ${layer.layerTitle}`}
                            </h4>
                            <Separator decorative className="bg-secondary" />
                        </div> */}

                        <PopupButtons feature={feature} />

                        <GenericPopup
                            feature={feature}
                            layout={layer.popupFields &&
                                Object.keys(layer.popupFields).length > 5 ? "grid" : "stacked"}
                            popupFields={layer.popupFields || {}}
                            relatedTable={layer.relatedTables}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

const PopupContentWithPagination = ({ layerContent, onSectionChange }: SidebarInsetWithPaginationProps) => {
    const { view } = useContext(MapContext)
    const buttons = useGetPopupButtons()

    const sectionIds = useMemo(
        () => layerContent.map(layer => `section-${layer.layerTitle !== '' ? layer.layerTitle : layer.groupLayerTitle}`),
        [layerContent]
    )

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries.filter(entry => entry.isIntersecting)

                if (visibleSections.length > 0) {
                    const topmostSection = visibleSections.reduce((prev, current) => {
                        return (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current;
                    });

                    const sectionTitle = topmostSection.target.id.replace('section-', '');
                    onSectionChange(sectionTitle);
                }
            },
            {
                root: null, // Use the viewport as the root
                rootMargin: '0px 0px -50% 0px', // 50% of the section must be visible
                threshold: 0 // Trigger as soon as any part of the section enters the viewport
            }
        )

        sectionIds.forEach((id) => {
            const element = document.getElementById(id)
            if (element) {
                observer.observe(element)
            }
        })

        return () => observer.disconnect()
    }, [sectionIds, onSectionChange])

    // Define coordinate systems
    proj4.defs("EPSG:26912", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs");
    proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

    const handleZoomToFeature = async (feature: ExtendedFeature) => {
        const wfsGeometry = await fetchWfsGeometry({
            namespace: feature.namespace,
            featureId: feature.id!.toString()
        });

        highlightFeature(wfsGeometry.features[0], view!, {
            fillColor: [0, 0, 0, 0],
            outlineColor: [255, 255, 0, 1],
            outlineWidth: 4,
            pointSize: 12
        });

        if (feature.bbox) {
            const bbox = convertBbox(feature.bbox)

            view?.goTo({
                target: new Extent({
                    xmin: bbox[0],
                    ymin: bbox[1],
                    xmax: bbox[2],
                    ymax: bbox[3],
                    spatialReference: { wkid: 4326 }
                })
            });
        }
    }

    // If no layers, return null
    if (layerContent.length === 0) return null;

    return (
        <div className="flex flex-1 flex-col gap-4 px-2 overflow-y-auto select-text h-full scrollable-container">
            {layerContent.map((layer, layerIndex) => (
                <LayerCard
                    key={layerIndex}
                    layer={layer}
                    buttons={buttons}
                    handleZoomToFeature={handleZoomToFeature}
                />
            ))}
        </div>
    )
}

export { PopupContentWithPagination }