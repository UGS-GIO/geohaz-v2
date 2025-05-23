import { Button } from "@/components/ui/button";
import { ProcessedRelatedData, useRelatedTable } from "@/hooks/use-related-table";
import { Feature, Geometry, GeoJsonProperties, FeatureCollection } from "geojson";
import { ExternalLink } from "lucide-react";
import { LayerContentProps } from "@/components/custom/popups/popup-content-with-pagination";
import { Link } from "@/components/custom/link";
import {
    FieldConfig,
    StringPopupFieldConfig,
    NumberPopupFieldConfig,
    CustomPopupFieldConfig,
    RasterValueMetadata,
    LinkFields,
    ColorCodingRecordFunction,
    RelatedTable
} from "@/lib/types/mapping-types";

type PopupContentDisplayProps = {
    layer: LayerContentProps;
    feature?: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
};

// Type guards based on the 'type' property of your discriminated union
const isNumberField = (field: FieldConfig | undefined): field is NumberPopupFieldConfig =>
    !!field && field.type === 'number';

const isStringField = (field: FieldConfig | undefined): field is StringPopupFieldConfig =>
    !!field && field.type === 'string';

const isCustomField = (field: FieldConfig | undefined): field is CustomPopupFieldConfig =>
    !!field && field.type === 'custom';

// Utility function to format numbers with significant figures
const formatWithSigFigs = (value: number, decimalPlaces: number): string => {
    if (isNaN(value)) return 'N/A';
    return Number(value.toFixed(decimalPlaces)).toString();
};

// Default transforms based on field configuration
const getDefaultTransform = (config: NumberPopupFieldConfig): ((value: number) => string) => {
    return (value: number) => {
        // Ensure value is a number, default to 0 if it's not (e.g. from Number(null))
        const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        let formatted = config.decimalPlaces
            ? formatWithSigFigs(numericValue, config.decimalPlaces)
            : numericValue.toString();

        if (config.unit) {
            formatted += ` ${config.unit}`;
        }
        return formatted;
    };
};

// Process field value with type safety - only for String or Number fields
const processFieldValue = (field: StringPopupFieldConfig | NumberPopupFieldConfig, rawValue: unknown): string => {
    if (field.type === 'number') { // Type is narrowed to NumberPopupFieldConfig
        const numberForTransform = rawValue === null ? null : Number(rawValue);
        // For getDefaultTransform, ensure a valid number is passed.
        const numberForDefault = Number(rawValue ?? 0); // Default null/undefined to 0 for display

        if (field.transform) {
            return field.transform(numberForTransform) || '';
        }
        return getDefaultTransform(field)(numberForDefault);
    }

    // field is StringPopupFieldConfig (due to function signature after number check)
    if (field.transform) {
        return field.transform(rawValue === null ? null : String(rawValue)) || '';
    }
    return String(rawValue ?? ''); // Handle null/undefined rawValue
};

const getRasterFeatureValue = (rasterSource: (FeatureCollection<Geometry, GeoJsonProperties> & RasterValueMetadata) | undefined) => {
    if (!rasterSource) return null;
    const valueField = rasterSource.valueField;
    if ('type' in rasterSource && rasterSource.type === 'FeatureCollection') {
        return rasterSource.features[0]?.properties?.[valueField];
    }
    if (Array.isArray(rasterSource.features)) {
        return rasterSource.features[0]?.properties?.[valueField];
    }
    return null;
};

const createLink = (linkFields: LinkFields | undefined, urlPattern: RegExp, value: string, fieldKey: string) => {
    if (linkFields?.['custom'] && fieldKey === 'custom' && linkFields['custom'].transform) {
        const customLinks = linkFields['custom'];
        const hrefs = customLinks.transform?.(value);
        console.log(`Custom links for`, linkFields['custom'].transform);

        return (
            <>
                {hrefs && hrefs.map((item, i) => {
                    if (item.href === null) return null;
                    console.log(`Custom link item:`, item);

                    return (
                        <div key={`${item.href}-${i}`} className="flex gap-2">
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

    const linkConfig = linkFields?.[fieldKey];
    if (linkConfig) {
        const hrefs = linkConfig.transform
            ? linkConfig.transform(value)
            : [{ label: value, href: `${linkConfig.baseUrl}${value}` }];
        return (
            <>
                {hrefs.map((item, i) => {
                    if (item.href === null) return null;
                    if (item.href === '') return <div key={`${item.href}-${i}`}><span className="break-all inline-block">{item.label}</span></div>;
                    return (
                        <div key={`${item.href}-${i}`} className="flex gap-2">
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

const applyColor = (colorCodingMap: ColorCodingRecordFunction | undefined, fieldKey: string, value: string | number) => {
    if (colorCodingMap && colorCodingMap[fieldKey]) {
        const colorFunction = colorCodingMap[fieldKey];
        return { color: colorFunction(value) };
    }
    return {};
};

const getRelatedTableValues = (groupedLayerIndex: number, data: ProcessedRelatedData[][], relatedTables: RelatedTable[] | undefined, properties: { [name: string]: any; }): LabelValuePair[][] => {
    if (!data?.length) return [[{ label: "", value: "No data available" }]];
    const groupedValues: LabelValuePair[][] = [];
    const table = relatedTables?.[groupedLayerIndex];
    if (!table) return [[{ label: "Invalid index", value: "Invalid index" }]];
    const targetField = properties[table.targetField];
    if (data[groupedLayerIndex]) {
        const tableMatches: LabelValuePair[] = [];
        (data[groupedLayerIndex] as any[]).forEach((item: any) => {
            if (String(item[table.matchingField]) === String(targetField) && item.labelValuePairs) {
                tableMatches.push(...item.labelValuePairs);
            }
        });
        if (tableMatches.length > 0) groupedValues.push(tableMatches);
    }
    return groupedValues.length ? groupedValues : [[{ label: "", value: "No data available" }]];
};
interface LabelValuePair { label: string; value: string | number; }


const shouldDisplayValue = (value: string): boolean => {
    if (value === null || value === undefined) return false; // Explicitly check null/undefined
    const trimmedValue = String(value).trim();
    if (trimmedValue === '' || trimmedValue.toLowerCase() === 'null' || trimmedValue.toLowerCase() === 'undefined') {
        return false;
    }
    return true;
};

const PopupContentDisplay = ({ feature, layout, layer }: PopupContentDisplayProps) => {
    const { relatedTables, popupFields, linkFields, colorCodingMap, rasterSource } = layer;
    const { data, isLoading, error } = useRelatedTable(relatedTables || [], feature || null);

    console.log('feature:', feature);
    console.log('layer:', layer);

    const rasterValue = getRasterFeatureValue(rasterSource);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    if (!feature && rasterValue !== null && rasterSource !== undefined) {
        let displayValue = rasterSource.transform
            ? rasterSource.transform(rasterValue)
            : rasterSource.features[0]?.properties?.[rasterSource.valueField];
        return (
            <div className="space-y-4">
                <div className="flex flex-col">
                    <p className="font-bold underline text-primary">{rasterSource?.valueLabel}</p>
                    <p className="break-words">{String(displayValue ?? 'N/A')}</p>
                </div>
            </div>
        );
    }

    if (!feature) return null;

    const properties = feature.properties || {};
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;

    const sourceEntries: Array<[string, any]> = popupFields
        ? Object.entries(popupFields)
        : Object.entries(properties);

    console.log('sourceEntries:', sourceEntries);


    const mappedFeatureEntries = sourceEntries.map(([label, configOrValue]) => {

        if (linkFields?.['custom'] && typeof configOrValue === 'object' && configOrValue !== null && 'field' in configOrValue && (configOrValue as any).field === 'custom') {
            console.log('hitting the return');

            return [label, { ...configOrValue, field: 'custom', type: 'custom' } as CustomPopupFieldConfig] as [string, FieldConfig];
        }
        return [label, configOrValue] as [string, any]; // configOrValue can be FieldConfig or primitive value
    });

    if (rasterValue !== null && rasterSource?.valueLabel) {
        mappedFeatureEntries.push([rasterSource.valueLabel, rasterValue]); // rasterValue is primitive
    }

    const contentItems: { content: JSX.Element; isLongContent: boolean; originalIndex: number; }[] = [];

    console.log('mappedFeatureEntries:', mappedFeatureEntries);


    mappedFeatureEntries.forEach(([label, entryData], index) => {
        let currentConfig: FieldConfig | undefined = undefined;
        let isRasterEntry = false;
        let valueFromPropertiesDirectly: any = undefined;

        // 1. Determine currentConfig and identify special cases (raster or direct property iteration)
        if (label === rasterSource?.valueLabel && entryData === rasterValue) {
            isRasterEntry = true;
        } else if (popupFields) {
            currentConfig = entryData as FieldConfig; // entryData is from popupFields
        } else {
            // No popupFields: 'label' is property key, 'entryData' is property value
            valueFromPropertiesDirectly = entryData;
            // Create a default StringConfig using the property key ('label') as the field identifier
            currentConfig = { field: label, type: 'string', label } as StringPopupFieldConfig;
        }

        let finalDisplayValue: string;
        // Use the 'field' from the config if available, otherwise fallback to 'label' (e.g. for raster)
        const fieldKeyForStyleAndLink = currentConfig?.field || label;

        // 2. Process value based on determined type/case
        if (isRasterEntry) {
            finalDisplayValue = rasterSource?.transform
                ? rasterSource.transform(rasterValue) || ''
                : String(rasterValue ?? '');
        } else if (currentConfig && isCustomField(currentConfig)) {
            // currentConfig is CustomPopupFieldConfig, its transform expects 'properties'
            console.log('Custom field config:', currentConfig);

            finalDisplayValue = currentConfig.transform?.(properties) || '';
        } else if (currentConfig && (isStringField(currentConfig) || isNumberField(currentConfig))) {
            // currentConfig is StringPopupFieldConfig or NumberPopupFieldConfig
            const rawValue = popupFields ? properties[currentConfig.field] : valueFromPropertiesDirectly;
            if (currentConfig.transform && rawValue === null) {
                finalDisplayValue = currentConfig.transform(null) || '';
            } else {
                finalDisplayValue = processFieldValue(currentConfig, rawValue);
            }
        } else {
            // Fallback if entryData was a primitive value and no specific config was derived
            // (e.g., iterating Object.entries(properties) and it wasn't matched above)
            finalDisplayValue = String(entryData ?? '');
        }

        // 3. Render
        if (!shouldDisplayValue(finalDisplayValue)) {
            return;
        }

        // this block is erronesously reddering popupfields and links in the same spot
        const content = (
            <div key={`feature-item-${label}-${index}`} className="flex flex-col" style={applyColor(colorCodingMap, fieldKeyForStyleAndLink, finalDisplayValue)}>
                <p className="font-bold underline text-primary">{label}</p>
                <p className="break-words">
                    {createLink(linkFields, urlPattern, finalDisplayValue, fieldKeyForStyleAndLink)}
                </p>
            </div>
        );

        const isLongContent = String(finalDisplayValue).split(/\s+/).length > 20;
        contentItems.push({ content, isLongContent, originalIndex: index });
    });

    (relatedTables || []).forEach((table, tableIndex) => {
        const groupedValues = getRelatedTableValues(tableIndex, data, relatedTables, properties);
        const relatedContent = (
            <div key={`related-${table.fieldLabel}-${tableIndex}`} className="flex flex-col space-y-2">
                <p className="font-bold underline text-primary">
                    {properties[table.fieldLabel] || table.fieldLabel}
                </p>
                {groupedValues.map((group, groupIdx) => (
                    <div key={`group-${groupIdx}`} className="flex flex-col">
                        {group.map((valueItem, valueIdx) => (
                            <div key={`value-${valueItem.label}-${valueIdx}`} className="flex flex-row gap-x-2">
                                {valueItem.label && <span className="font-bold">{valueItem.label}: </span>}
                                <span>{valueItem.value}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
        const totalWords = groupedValues.flat().map(v => String(v.value)).join(" ").split(/\s+/).length;
        contentItems.push({ content: relatedContent, isLongContent: totalWords > 20, originalIndex: 1000 + tableIndex });
    });

    const longContent = contentItems.filter(item => item.isLongContent).sort((a, b) => a.originalIndex - b.originalIndex).map(item => item.content);
    const regularContent = contentItems.filter(item => !item.isLongContent).sort((a, b) => a.originalIndex - b.originalIndex).map(item => item.content);
    const useGridLayout = layout === "grid" || regularContent.length > 5;

    return (
        <div className="space-y-4">
            {longContent.length > 0 && <div className="space-y-4 col-span-full">{longContent}</div>}
            <div className={useGridLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>{regularContent}</div>
        </div>
    );
};

export { PopupContentDisplay };