import { Button } from "@/components/ui/button";
import { useRelatedTable } from "@/hooks/use-related-table";
import { RelatedTable } from "@/lib/types/mapping-types";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import { ExternalLink } from "lucide-react";

type ReusablePopupProps = {
    feature: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
    popupFields?: Record<string, string>;
    relatedTable?: RelatedTable[];
};

const GenericPopup = ({ feature, relatedTable, popupFields, layout }: ReusablePopupProps) => {
    const relatedTables = relatedTable || [];
    const { data, isLoading, error } = useRelatedTable(relatedTables);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    const properties = feature.properties || {};
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;

    const getRelatedValues = (field: string) => {
        if (!data || data.length === 0) return ["No data available"];
        const matchedValues: string[] = [];
        relatedTables.forEach((table) => {
            const targetField = properties[table.targetField];
            const matchingField = table.matchingField;
            data.forEach((entry) => {
                entry?.find((item: Record<string, string>) => {
                    const value = item[matchingField];
                    if (value && value === targetField) {
                        matchedValues.push(item.Description);
                    }
                });
                if (entry && entry?.[matchingField] === field) {
                    matchedValues.push(entry.Description || "N/A");
                }
            });
        });
        return matchedValues.length > 0 ? matchedValues : ["N/A"];
    };

    const renderValue = (value: string) => {
        if (urlPattern.test(value)) {
            return (
                <Button
                    className="px-0 h-auto whitespace-normal text-left font-normal inline-flex items-start max-w-full"
                    variant={'link'}
                    onClick={() => window.open(value, '_blank')}
                >
                    <span className="break-all inline-block">{value}</span>
                    <ExternalLink className="flex-shrink-0 ml-1 mt-1" size={16} />
                </Button>
            );
        }
        return value ?? "N/A";
    };

    const featureEntries = popupFields ? Object.entries(popupFields) : Object.entries(properties);

    const { urlContent, longTextContent, regularContent } = featureEntries.reduce<{
        urlContent: JSX.Element[];
        longTextContent: JSX.Element[];
        regularContent: JSX.Element[];
    }>(
        (acc, [label, field]) => {
            const value = popupFields ? properties[field] : field;
            if (!value) return acc;

            const content = (
                <div key={label} className="flex flex-col">
                    <p className="font-bold underline text-primary">{label}</p>
                    <p className="break-words">
                        {renderValue(value)}
                    </p>
                </div>
            );

            if (urlPattern.test(value)) {
                acc.urlContent.push(content);
            } else if (String(value).split(/\s+/).length > 20) {
                acc.longTextContent.push(content);
            } else {
                acc.regularContent.push(content);
            }

            return acc;
        },
        { urlContent: [], longTextContent: [], regularContent: [] }
    );

    const { longRelatedContent, regularRelatedContent } = relatedTables.reduce<{
        longRelatedContent: JSX.Element[];
        regularRelatedContent: JSX.Element[];
    }>(
        (acc, table, index) => {
            const values = getRelatedValues(table.targetField);
            const content = (
                <div key={index} className="flex flex-col">
                    <p className="font-bold underline text-primary">
                        {properties[table.fieldLabel]}
                    </p>
                    <p className="break-words">
                        {values.join(", ")}
                    </p>
                </div>
            );

            const totalWords = values.join(", ").split(/\s+/).length;
            if (totalWords > 20) {
                acc.longRelatedContent.push(content);
            } else {
                acc.regularRelatedContent.push(content);
            }

            return acc;
        },
        { longRelatedContent: [], regularRelatedContent: [] }
    );

    const useGridLayout = layout === "grid" || regularContent.length > 5;
    const regularContainerClass = useGridLayout ? "grid grid-cols-2 gap-4" : "space-y-4";

    return (
        <div className="space-y-4">
            {(longTextContent.length > 0 || longRelatedContent.length > 0) && (
                <div className="space-y-4 col-span-full">
                    {longTextContent}
                    {longRelatedContent}
                </div>
            )}

            <div className={regularContainerClass}>
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

export { GenericPopup };