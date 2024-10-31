import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Feature, Geometry, GeoJsonProperties } from "geojson"
import { GenericPopup } from "./popups/generic-popup"
import { RelatedTable } from "@/lib/types/mapping-types"
import { Button } from "@/components/ui/button"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, Infinity] // 'Infinity' for 'All'

interface SidebarInsetWithPaginationProps {
    layerContent: {
        groupLayerTitle: string
        layerTitle: string
        features: Feature<Geometry, GeoJsonProperties>[]
        popupFields?: Record<string, string>
        relatedTables?: RelatedTable[]
    }[]
    selectedFeatures: Set<string>
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
        <div className="flex items-center justify-between px-4 py-2 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">

                <div className="flex-shrink-0">
                    <Select
                        value={`${itemsPerPage}`}
                        onValueChange={(value) => {
                            onItemsPerPageChange(value === "Infinity" ? Infinity : Number(value));
                        }}
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
                </div>

                {showPagination && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronFirst className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronLast className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export function SidebarInsetWithPagination({ layerContent, selectedFeatures }: SidebarInsetWithPaginationProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5)
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
            <div>
                <div className="space-y-4">
                    {paginatedFeatures.map((feature, idx) => {
                        return (
                            <div
                                className="border p-4 rounded"
                                key={idx}
                                onClick={() =>
                                    console.log("this will eventually zoom and highlight the user to the spot")
                                }
                            >
                                <GenericPopup
                                    key={idx}
                                    feature={feature}
                                    layout="grid"
                                    popupFields={popupFields}
                                    relatedTable={relatedTables}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <SidebarInset className="min-h-full">
            <div className="flex flex-1 flex-col gap-4 px-2 overflow-y-auto select-text">
                {layerContent.map((layer) => {
                    const features = layer.features.filter((feature) =>
                        selectedFeatures.has(feature.id as string)
                    )

                    return (
                        <React.Fragment key={layer.layerTitle}>
                            {features.length > 0 && (
                                <div>
                                    <div className="sticky top-0 bg-background z-10 p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-primary">
                                                {layer.groupLayerTitle}
                                                {layer.layerTitle === "" ? "" : ` - ${layer.layerTitle}`}
                                            </h3>
                                        </div>
                                        {features.length > ITEMS_PER_PAGE_OPTIONS[0] && (
                                            <div className="flex justify-between items-center">
                                                {/* Pagination */}
                                                <PopupPagination
                                                    showPagination={features.length > itemsPerPage}
                                                    currentPage={paginationStates[layer.layerTitle] || 1}
                                                    totalPages={Math.ceil(features.length / itemsPerPage)}
                                                    handlePageChange={(page) => handlePageChange(layer.layerTitle, page)}
                                                    itemsPerPage={itemsPerPage}
                                                    onItemsPerPageChange={setItemsPerPage}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {
                                        renderPaginatedFeatures(
                                            layer.features.filter((feature) =>
                                                selectedFeatures.has(feature.id as string)
                                            ),
                                            layer.popupFields || {},
                                            layer.relatedTables || [],
                                            layer.layerTitle
                                        )
                                    }
                                </div>
                            )
                            }
                        </React.Fragment>
                    )
                })}
            </div >
        </SidebarInset >
    )
}
