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
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

export function SidebarInsetWithPagination({ layerContent, selectedFeatures }: SidebarInsetWithPaginationProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [currentPage, setCurrentPage] = useState(1)

    const handlePageChange = (page: number, totalPages: number = Math.ceil(selectedFeatures.size / itemsPerPage)
    ) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page)
    }

    const renderPaginatedFeatures = (features: Feature<Geometry, GeoJsonProperties>[], layerTitle: string, popupFields: Record<string, string>, relatedTables: RelatedTable[]) => {
        const totalPages = Math.ceil(features.length / itemsPerPage)
        const paginatedFeatures = features.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )

        return (
            <>
                {paginatedFeatures.map((feature, idx) => {
                    return (
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
                                    <GenericPopup feature={feature} layout="grid" layerTitle={layerTitle} popupFields={popupFields} relatedTable={relatedTables} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )
                })}

                {features.length > itemsPerPage && (
                    // only show pagination if there are more than itemsPerPage features
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
            </>
        )
    }

    return (
        <SidebarInset className="min-h-full">
            <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                {layerContent.map((layer) => {

                    const features = layer.features.filter((feature) =>
                        selectedFeatures.has(feature.id as string)
                    )

                    return (
                        <React.Fragment key={layer.layerTitle}>
                            {layer.features.some((feature) =>
                                selectedFeatures.has(feature.id as string)
                            ) && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-primary">
                                                {layer.groupLayerTitle}
                                                {layer.layerTitle === "" ? "" : ` - ${layer.layerTitle}`}
                                            </h3>
                                            {features.length > itemsPerPage && (
                                                <div>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            setItemsPerPage(value === "Infinity" ? layer.features.length : parseInt(value, 10))
                                                            setCurrentPage(1) // Reset to the first page when itemsPerPage changes
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
                                            )
                                            }

                                            {/* Select Component */}
                                        </div>


                                        {renderPaginatedFeatures(
                                            layer.features.filter((feature) => {
                                                return selectedFeatures.has(feature.id as string)
                                            }),
                                            layer.layerTitle,
                                            layer.popupFields || {},
                                            layer.relatedTables || []
                                        )
                                        }
                                    </div>
                                )}
                        </React.Fragment>
                    )
                })}
            </div>
        </SidebarInset>
    )
}
