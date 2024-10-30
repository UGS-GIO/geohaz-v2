import { useRelatedTable } from "@/hooks/use-related-table";
import { RelatedTable } from "@/lib/types/mapping-types";
import { Feature, Geometry, GeoJsonProperties } from "geojson";

type ReusablePopupProps = {
    feature: Feature<Geometry, GeoJsonProperties>;
    layerTitle: string;
    layout?: "grid" | "stacked";
    popupFields: Record<string, string>;
    relatedTable?: RelatedTable[];
};

const GenericPopup = ({ feature, layerTitle, relatedTable, popupFields }: ReusablePopupProps) => {
    const relatedTables = relatedTable || [];
    const { data, isLoading, error } = useRelatedTable(relatedTables);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    // Get the properties from the feature
    const properties = feature.properties || {};

    const getRelatedValues = (field: string) => {
        if (!data || data.length === 0) return ["No data available"];

        const matchedValues: string[] = [];

        // Iterate over related tables and their corresponding data
        relatedTables.forEach((table) => {
            const targetField = properties[table.targetField];
            const matchingField = table.matchingField;

            // for eaech related table, there will be an array of data
            data.forEach((entry) => {
                // Use targetField from the table configuration for dynamic matching in each entry
                entry?.find((item: Record<string, string>) => {
                    console.log('item', item);

                    if (item[matchingField] === targetField) {
                        matchedValues.push(item.Description);
                    }
                });

                if (entry?.[table.matchingField] === field) {
                    matchedValues.push(entry.Description);
                }
            });
        });

        return matchedValues.length > 0 ? matchedValues : ["N/A"];
    };

    // Generate content for the properties of the feature
    const featureContent = Object.entries(popupFields).map(([label, field]) => {
        console.log('properties', properties);

        return (
            <div key={field} className="flex flex-col">
                <p className="font-bold underline text-primary">{label}</p>
                <p className="break-words">
                    {properties[field]}
                </p>
            </div>
        );
    });

    // Render related table values separately at the end
    const relatedContent = relatedTables.map((table, index) => {
        return (
            <div key={index} className="flex flex-col">
                <p className="font-bold underline text-primary">
                    {properties[table.fieldLabel]}
                </p>
                <p className="break-words">
                    {getRelatedValues(table.targetField).join(", ")}
                </p>
            </div>
        )
    });

    // Render the popup content
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">{layerTitle}</h2>
            {featureContent}
            {relatedContent}
        </div>
    );
};

export { GenericPopup };
