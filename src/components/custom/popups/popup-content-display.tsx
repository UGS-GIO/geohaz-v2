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

        // Handle full FeatureCollection response
        if ('type' in rasterSource && rasterSource.type === 'FeatureCollection') {
            return rasterSource.features[0]?.properties?.GRAY_INDEX;
        }

        // Handle features array response
        if (Array.isArray(rasterSource.features)) {
            return rasterSource.features[0]?.properties?.GRAY_INDEX;
        }

        return null;
    };

    const rasterValue = getRasterValue();

    // Loading and error states
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    // If we only have raster data and no feature
    if (!feature && rasterValue !== null) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col">
                    <p className="font-bold underline text-primary">Raster Value</p>
                    <p className="break-words">{rasterValue?.toFixed(4) ?? "No data"}</p>
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
        const linkConfig = linkFields?.[field];

        if (linkConfig) {
            const hrefs = linkConfig.transform
                ? linkConfig.transform(value)
                : [{ label: value, href: `${linkConfig.baseUrl}${value}` }];

            return (
                <>
                    {hrefs.map((item, index) => (
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
                    ))}
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

    const getRelatedTableValues = () => {
        if (!data?.length) return [[{ label: "No data available", value: "No data available" }]];

        const groupedValues: LabelValuePair[][] = [];
        relatedTables?.forEach((table) => {
            const targetField = properties[table.targetField];

            data.forEach((entry) => {
                entry?.forEach((item: Record<string, any>) => {
                    if (item[table.matchingField] === targetField && item.labelValuePairs) {
                        // Each item's labelValuePairs becomes its own group
                        groupedValues.push([...item.labelValuePairs]);
                    }
                });
            });
        });

        return groupedValues.length
            ? groupedValues
            : [[{ label: "No data available", value: "No data available" }]];
    };

    const baseFeatureEntries = popupFields ? Object.entries(popupFields) : Object.entries(properties);
    const featureEntries = rasterValue !== null
        ? [...baseFeatureEntries, ['Raster Value', rasterValue.toFixed(4)]]
        : baseFeatureEntries;

    const { urlContent, longTextContent, regularContent } = featureEntries.reduce<{
        urlContent: JSX.Element[];
        longTextContent: JSX.Element[];
        regularContent: JSX.Element[];
    }>(
        (acc, [label, field]) => {
            const fieldConfig = popupFields ? field : { field, type: 'string' as const };

            // Special handling for raster value
            const value = label === 'Raster Value'
                ? rasterValue
                : properties[fieldConfig.field];

            const processedValue = processFieldValue(fieldConfig, value);

            if (!processedValue && processedValue !== '0') return acc;

            const content = (
                <div key={label} className="flex flex-col" style={applyColor(fieldConfig.field, processedValue)}>
                    <p className="font-bold underline text-primary">{label}</p>
                    <p className="break-words">
                        {createLink(processedValue, fieldConfig.field)}
                    </p>
                </div>
            );

            if (urlPattern.test(processedValue) || linkFields?.[fieldConfig.field]) {
                acc.urlContent.push(content);
            } else if (String(processedValue).split(/\s+/).length > 20) {
                acc.longTextContent.push(content);
            } else {
                acc.regularContent.push(content);
            }

            return acc;
        },
        { urlContent: [], longTextContent: [], regularContent: [] }
    );

    type ContentProps = { longRelatedContent: JSX.Element[]; regularRelatedContent: JSX.Element[] };
    const { longRelatedContent, regularRelatedContent } = (relatedTables || []).reduce<ContentProps>((acc, table, index) => {
        const groupedValues = getRelatedTableValues();

        const content = (
            <div key={index} className="flex flex-col space-y-2">
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

        acc[totalWords > 20 ? 'longRelatedContent' : 'regularRelatedContent'].push(content);
        return acc;
    }, { longRelatedContent: [], regularRelatedContent: [] });

    const useGridLayout = layout === "grid" || regularContent.length > 5;

    return (
        <div className="space-y-4">
            {(longTextContent.length > 0 || longRelatedContent.length > 0) && (
                <div className="space-y-4 col-span-full">
                    {longTextContent}
                    {longRelatedContent}
                </div>
            )}

            <div className={useGridLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                {regularContent}
                {regularRelatedContent}
            </div>

            {urlContent.length > 0 && (
                <div className="space-y-4 col-span-full">
                    {urlContent}
                </div>
            )}
        </div>
    );
};

export { PopupContentDisplay };