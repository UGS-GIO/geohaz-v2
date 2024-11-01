import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { Feature, Geometry, GeoJsonProperties } from "geojson"
import { Button } from "@/components/ui/button"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"
import { GenericPopup } from "./popups/generic-popup"
import { RelatedTable } from "@/lib/types/mapping-types"

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, Infinity] // 'Infinity' for 'All'

interface SidebarInsetWithPaginationProps {
    layerContent: {
        groupLayerTitle: string
        layerTitle: string
        features: Feature<Geometry, GeoJsonProperties>[]
        popupFields?: Record<string, string>
        relatedTables?: RelatedTable[]
    }[]
}

interface PopupPaginationProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (size: number) => void;
    showPagination: boolean;
}

const PopupPagination = ({ currentPage, totalPages, handlePageChange, itemsPerPage, onItemsPerPageChange, showPagination }: PopupPaginationProps) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 w-full bg-background">
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

                {showPagination && (
                    <>
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
                    </>
                )}
            </div>
        </div>
    )
}

function PopupContentWithPagination({ layerContent }: SidebarInsetWithPaginationProps) {
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0])
    const [paginationStates, setPaginationStates] = useState<{ [layerTitle: string]: number }>({})

    const handlePageChange = (layerTitle: string, page: number) => {
        setPaginationStates((prevState) => ({
            ...prevState,
            [layerTitle]: page,
        }))
    }

    const renderPaginatedFeatures = (
        features: Feature<Geometry, GeoJsonProperties>[],
        popupFields: Record<string, string>,
        relatedTables: RelatedTable[],
        layerTitle: string
    ) => {
        const currentPage = paginationStates[layerTitle] || 1
        const paginatedFeatures = features.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )

        return (
            <div className="scroll-smooth">
                <div className="space-y-4">
                    {paginatedFeatures.map((feature, idx) => (
                        <div className="border p-4 rounded space-y-2" key={idx}>
                            <GenericPopup
                                feature={feature}
                                layout="grid"
                                popupFields={popupFields}
                                relatedTable={relatedTables}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 px-2 overflow-y-auto select-text min-h-full">
            {layerContent.map((layer) => {
                const features = layer.features

                return (
                    <React.Fragment key={layer.layerTitle}>
                        {features.length > 0 && (
                            <div id={`page-${layer.layerTitle}`}>
                                <div className="sticky top-0 bg-background z-10 p-4">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-lg font-semibold text-primary">
                                            {layer.groupLayerTitle}
                                            {layer.layerTitle && ` - ${layer.layerTitle}`}
                                        </h3>
                                        <PopupPagination
                                            showPagination={features.length > itemsPerPage}
                                            currentPage={paginationStates[layer.layerTitle] || 1}
                                            totalPages={Math.ceil(features.length / itemsPerPage)}
                                            handlePageChange={(page) => handlePageChange(layer.layerTitle, page)}
                                            itemsPerPage={itemsPerPage}
                                            onItemsPerPageChange={setItemsPerPage}
                                        />
                                    </div>
                                </div>
                                {renderPaginatedFeatures(features, layer.popupFields || {}, layer.relatedTables || [], layer.layerTitle)}
                            </div>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export { PopupContentWithPagination }