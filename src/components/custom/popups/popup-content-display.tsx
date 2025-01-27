import { Button } from "@/components/ui/button";
import { useRelatedTable } from "@/hooks/use-related-table";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import { ExternalLink } from "lucide-react";
import { LayerContentProps } from "@/components/custom/popups/popup-content-with-pagination";
import { Link } from "@/components/custom/link";

type PopupContentDisplayProps = {
    layer: LayerContentProps;
    feature?: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
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
            const value = label === 'Raster Value' ? field : (popupFields ? properties[field] : field);

            if (value === undefined || value === null) return acc;

            // Apply color if needed
            const colorStyle = applyColor(field, value);

            const content = (
                <div key={label} className="flex flex-col" style={colorStyle}>
                    <p className="font-bold underline text-primary">{label}</p>
                    <p className="break-words">
                        {typeof value === 'string' ? createLink(value, field) : value}
                    </p>
                </div>
            );

            if (typeof value === 'string' && (urlPattern.test(value) || linkFields?.[field])) {
                acc.urlContent.push(content);
            } else if (typeof value === 'string' && value.split(/\s+/).length > 20) {
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