import { useState } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Feature, Geometry, GeoJsonProperties } from "geojson"
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
    selectedFeatures: Set<string>
}

interface PopupPaginationProps {
    currentPage: number
    totalPages: number
    handlePageChange: (page: number) => void
}

const PopupPagination = ({ currentPage, totalPages, handlePageChange }: PopupPaginationProps) => {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(currentPage - 1)
                        }}
                    />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(index + 1)
                            }}
                            isActive={currentPage === index + 1}
                        >
                            {index + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {totalPages > 5 && <PaginationEllipsis />}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(currentPage + 1)
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export function SidebarInsetWithPagination({ layerContent, selectedFeatures }: SidebarInsetWithPaginationProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [paginationStates, setPaginationStates] = useState<{ [layerTitle: string]: number }>({})

    const handlePageChange = (layerTitle: string, page: number, totalPages: number) => {
        if (page >= 1 && page <= totalPages) {
            setPaginationStates((prevState) => ({
                ...prevState,
                [layerTitle]: page,
            }))
        }
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
                                            {features.length > ITEMS_PER_PAGE_OPTIONS[0] && (
                                                <div className="flex justify-end mt-4">
                                                    {/* Items Per Page Select */}
                                                    < Select
                                                        onValueChange={(value) => {
                                                            setItemsPerPage(
                                                                value === "Infinity"
                                                                    ? features.length
                                                                    : parseInt(value, 10)
                                                            )
                                                            setPaginationStates((prevState) => ({
                                                                ...prevState,
                                                                [layer.layerTitle]: 1, // Reset to page 1 when itemsPerPage changes
                                                            }))
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={itemsPerPage} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                                                <SelectItem key={option} value={option.toString()}>
                                                                    {option === Infinity ? "All" : option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                        {features.length > itemsPerPage && (
                                            <div className="flex justify-between items-center">
                                                {/* Pagination */}
                                                <PopupPagination
                                                    currentPage={paginationStates[layer.layerTitle] || 1}
                                                    totalPages={Math.ceil(features.length / itemsPerPage)}
                                                    handlePageChange={(page) =>
                                                        handlePageChange(
                                                            layer.layerTitle,
                                                            page,
                                                            Math.ceil(features.length / itemsPerPage)
                                                        )
                                                    }
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
