import { Button } from "@/components/ui/button";
import { useRelatedTable } from "@/hooks/use-related-table";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import { ExternalLink } from "lucide-react";
import { LayerContentProps } from "@/components/custom/popups/popup-content-with-pagination";
import { Link } from "@/components/custom/link";
import { FieldConfig, NumberFieldConfig } from "@/lib/types/mapping-types";

type PopupContentDisplayProps = {
    layer: LayerContentProps;
    feature?: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
};

// Type guard for number fields
const isNumberField = (field: FieldConfig): field is NumberFieldConfig =>
    field.type === 'number';

// Utility function to format numbers with significant figures
const formatWithSigFigs = (value: number, decimalPlaces: number): string => {
    if (isNaN(value)) return 'N/A';
    return Number(value.toFixed(decimalPlaces)).toString();
};

// Default transforms based on field configuration
const getDefaultTransform = (config: NumberFieldConfig): ((value: number) => string) => {
    return (value: number) => {
        let formatted = config.decimalPlaces
            ? formatWithSigFigs(value, config.decimalPlaces)
            : value.toString();

        if (config.unit) {
            formatted += ` ${config.unit}`;
        }

        return formatted;
    };
};

// Process field value with type safety
const processFieldValue = (field: FieldConfig, value: unknown): string => {
    if (isNumberField(field)) {
        const numberValue = Number(value);
        if (field.transform) {
            return field.transform(numberValue);
        }
        return getDefaultTransform(field)(numberValue);
    }

    // String field
    if (field.transform) {
        return field.transform(String(value));
    }

    return String(value);
};

const PopupContentDisplay = ({ feature, layout, layer }: PopupContentDisplayProps) => {
    const { relatedTables, popupFields, linkFields, colorCodingMap, rasterSource } = layer;
    const { data, isLoading, error } = useRelatedTable(relatedTables || [], feature || null);

    // Extract raster value if it exists
    const getRasterValue = () => {
        if (!rasterSource) return null;
        const valueField = rasterSource.valueField;

        // Handle full FeatureCollection response
        if ('type' in rasterSource && rasterSource.type === 'FeatureCollection') {
            const value = rasterSource.features[0]?.properties?.[valueField];
            return value;
        }

        // Handle features array response
        if (Array.isArray(rasterSource.features)) {
            const value = rasterSource.features[0]?.properties?.[valueField];
            return value;
        }

        return null;
    };

    const rasterValue = getRasterValue();

    // Loading and error states
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    // If we only have raster data and no feature
    if (!feature && rasterValue !== null && rasterSource !== undefined) {
        let value = rasterSource.transform ? rasterSource.transform(rasterValue) : rasterSource.features[0]?.properties?.[rasterSource.valueField];
        return (
            <div className="space-y-4">
                <div className="flex flex-col">
                    <p className="font-bold underline text-primary">{rasterSource?.valueLabel}</p>
                    <p className="break-words">{value}</p>
                </div>
            </div>
        );
    }

    // Return null if no feature and no raster value
    if (!feature) return null;

    const properties = feature.properties || {};
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;

    // Helper function to apply color based on the field value
    const applyColor = (field: string, value: string | number) => {
        if (colorCodingMap && colorCodingMap[field]) {
            const colorFunction = colorCodingMap[field];
            return { color: colorFunction(value) };
        }
        return {};
    };

    const createLink = (value: string, field: string) => {
        // Check if we have a special 'custom' key in linkFields
        if (linkFields?.['custom']) {
            const customLinks = linkFields['custom'];

            if (field === 'custom' && customLinks.transform) {
                const hrefs = customLinks.transform(value);

                return (
                    <>
                        {hrefs.map((item, index) => {
                            if (item.href === null) {
                                return null;
                            }

                            return (
                                <div key={`${item.href}-${index}`} className="flex gap-2">
                                    <Link
                                        to={item.href}
                                        className="p-0 h-auto whitespace-normal text-left font-normal inline-flex items-center max-w-full gap-1"
                                        variant='primary'
                                    >
                                        <span className="break-all inline-block">{item.label}</span>
                                        <ExternalLink className="flex-shrink-0 ml-1" size={16} />
                                    </Link>
                                </div>
                            )
                        })}
                    </>
                );
            }
        }

        const linkConfig = linkFields?.[field];

        if (linkConfig) {
            const hrefs = linkConfig.transform
                ? linkConfig.transform(value)
                : [{ label: value, href: `${linkConfig.baseUrl}${value}` }];

            return (
                <>
                    {hrefs.map((item, index) => {
                        if (item.href === null) {
                            return null;
                        } else if (item.href === '') {
                            // If the href is empty, just display the label
                            return (
                                <div key={`${item.href}-${index}`} className="flex gap-2">
                                    <span className="break-all inline-block">{item.label}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={`${item.href}-${index}`} className="flex gap-2">
                                <Link
                                    to={item.href}
                                    className="p-0 h-auto whitespace-normal text-left font-normal inline-flex items-center max-w-full gap-1"
                                    variant='primary'
                                >
                                    <span className="break-all inline-block">{item.label}</span>
                                    <ExternalLink className="flex-shrink-0 ml-1" size={16} />
                                </Link>
                            </div>
                        )
                    })}
                </>
            );
        }

        if (urlPattern.test(value)) {
            return (
                <Button
                    className="p-0 h-auto whitespace-normal text-left font-normal inline-flex items-start max-w-full"
                    variant="link"
                    onClick={() => window.open(value, '_blank')}
                >
                    <span className="break-all inline-block">{value}</span>
                    <ExternalLink className="flex-shrink-0 ml-1 mt-1" size={16} />
                </Button>
            );
        }

        return value ?? "N/A";
    };

    interface LabelValuePair {
        label: string;
        value: string | number;
    }

    const getRelatedTableValues = (groupedLayerIndex: number) => {
        if (!data?.length) {
            return [[{ label: "", value: "No data available" }]];
        }

        const groupedValues: LabelValuePair[][] = [];

        // Check if the provided groupedLayerIndex is valid
        const table = relatedTables?.[groupedLayerIndex];
        if (!table) {
            return [[{ label: "Invalid index", value: "Invalid index" }]];
        }

        // Get the target value for matching for the specific table
        const targetField = properties[table.targetField];

        // Process the related table for the provided groupedLayerIndex
        if (data[groupedLayerIndex]) {
            // Create a new group for this table's matches
            const tableMatches: LabelValuePair[] = [];

            data[groupedLayerIndex].forEach((item) => {
                // Convert both to strings before comparing
                if (String(item[table.matchingField]) === String(targetField) && item.labelValuePairs) {
                    // Add these pairs to this table's matches
                    tableMatches.push(...item.labelValuePairs);
                }
            });

            // Only add non-empty matches to the grouped values
            if (tableMatches.length > 0) {
                groupedValues.push(tableMatches);
            }
        }

        return groupedValues.length
            ? groupedValues
            : [[{ label: "", value: "No data available" }]];
    };

    // Get entries from popupFields or properties
    const baseFeatureEntries = popupFields ? Object.entries(popupFields) : Object.entries(properties);

    // Use the same entries but handle special cases while preserving order
    const featureEntries = baseFeatureEntries.map(([label, field]) => {
        // For each entry in baseFeatureEntries, check if we need to replace it with a special field
        if (linkFields?.['custom'] && field.field === 'custom') {
            // If this is a custom field with linkFields['custom'], use the original entry to preserve position
            return [label, { field: 'custom', type: 'string' }];
        }
        return [label, field];
    });

    // Only add raster value at the end if it exists
    if (rasterValue !== null && rasterSource?.valueLabel) {
        featureEntries.push([`${rasterSource.valueLabel}`, rasterValue]);
    }

    const shouldDisplayValue = (value: string): boolean => {
        // Cases where we don't want to display the value:
        const isEmptyOrWhitespace = value.trim() === '';
        const isNullOrUndefined = value === 'null' || value === 'undefined';

        // We want to display the value if it's not empty/whitespace/null/undefined
        // This naturally handles '0' as a valid value to display
        return !isEmptyOrWhitespace && !isNullOrUndefined;
    };

    // Create an ordered array of content sections that maintains the original order
    // but still separates long content for better display
    const contentItems: {
        content: JSX.Element;
        isLongContent: boolean;
        originalIndex: number;
    }[] = [];

    // Process feature fields while keeping track of original order
    featureEntries.forEach(([label, field], index) => {
        // Special handling for custom field (in both linkFields and popupFields)
        if (field && field.field === 'custom') {
            const content = (
                <div key={`feature-${index}`} className="flex flex-col">
                    <p className="font-bold underline text-primary">{label}</p>
                    <div className="break-words">
                        {linkFields?.['custom']
                            ? createLink('', 'custom')  // For custom field in linkFields
                            : (popupFields && field.transform ? field.transform(properties) : '') // Regular handling if it's in popupFields
                        }
                        {linkFields?.['custom'] && field.transform && field.transform(properties)}
                    </div>
                </div>
            );

            const isLongContent = String(field.transform(properties)).split(/\s+/).length > 20;
            contentItems.push({ content, isLongContent, originalIndex: index });
            return;
        }

        const fieldConfig = popupFields ? field : { field, type: 'string' as const };

        // Special handling for raster value
        const value = label === `${rasterSource?.valueLabel}`
            ? rasterSource?.transform ? rasterSource.transform(rasterValue) : rasterValue
            : properties[fieldConfig.field];

        if (value === null || value === ' ') {
            return;
        }

        const processedValue = processFieldValue(fieldConfig, value);

        // Skip if the value shouldn't be displayed
        if (!shouldDisplayValue(processedValue)) {
            return;
        }

        const content = (
            <div key={`feature-${index}`} className="flex flex-col" style={applyColor(fieldConfig.field, processedValue)}>
                <p className="font-bold underline text-primary">{label}</p>
                <p className="break-words">
                    {createLink(processedValue, fieldConfig.field)}
                </p>
            </div>
        );

        // Check if this is long content
        const isLongContent = String(processedValue).split(/\s+/).length > 20;
        contentItems.push({ content, isLongContent, originalIndex: index });
    });

    // Process related table content
    (relatedTables || []).forEach((table, tableIndex) => {
        const groupedValues = getRelatedTableValues(tableIndex);

        const content = (
            <div key={`related-${tableIndex}`} className="flex flex-col space-y-2">
                <p className="font-bold underline text-primary">
                    {properties[table.fieldLabel] || table.fieldLabel}
                </p>
                {groupedValues.map((group, groupIdx) => (
                    <div key={groupIdx} className="flex flex-col">
                        {group.map((value, valueIdx) => (
                            <div key={valueIdx} className="flex flex-row gap-x-2">
                                {value.label && <span className="font-bold">{value.label}: </span>}
                                <span>{value.value}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );

        // Calculate total words across all groups
        const totalWords = groupedValues
            .flat()
            .map(v => String(v.value))
            .join(" ")
            .split(/\s+/).length;

        const isLongContent = totalWords > 20;
        // Use a high index for related content to ensure it comes after feature content
        contentItems.push({
            content,
            isLongContent,
            originalIndex: 1000 + tableIndex
        });
    });

    // Separate long content and regular content while preserving original order within each group
    const longContent = contentItems
        .filter(item => item.isLongContent)
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(item => item.content);

    const regularContent = contentItems
        .filter(item => !item.isLongContent)
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(item => item.content);

    const useGridLayout = layout === "grid" || regularContent.length > 5;

    return (
        <div className="space-y-4">
            {longContent.length > 0 && (
                <div className="space-y-4 col-span-full">
                    {longContent}
                </div>
            )}

            <div className={useGridLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                {regularContent}
            </div>
        </div>
    );
};

export { PopupContentDisplay };