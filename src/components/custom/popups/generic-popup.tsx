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

    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;
    const featureEntries = popupFields ? Object.entries(popupFields) : Object.entries(properties);

    const featureContent = featureEntries.map(([label, field]) => {
        const value = popupFields ? properties[field] : field;
        return (
            value && (
                <div key={label} className="flex flex-col">
                    <p className="font-bold underline text-primary">{label}</p>
                    <p className="break-words">
                        {urlPattern.test(value) ? (
                            <Button className="px-0" variant={'link'} onClick={() => window.open(value, '_blank')}>
                                {value}&nbsp;<ExternalLink size={16} />
                            </Button>
                        ) : (
                            value ?? "N/A"
                        )}
                    </p>
                </div>
            )
        );
    });

    const relatedContent = relatedTables.map((table, index) => (
        <div key={index} className="flex flex-col">
            <p className="font-bold underline text-primary">
                {properties[table.fieldLabel]}
            </p>
            <p className="break-words">
                {getRelatedValues(table.targetField).join(", ")}
            </p>
        </div>
    ));

    const useGridLayout = layout === "grid" || featureEntries.length > 5;
    const containerClass = useGridLayout ? "grid grid-cols-2 gap-4" : "space-y-4";

    return (
        <div className={containerClass}>
            {featureContent}
            {relatedContent}
        </div>
    );
};

export { GenericPopup };
