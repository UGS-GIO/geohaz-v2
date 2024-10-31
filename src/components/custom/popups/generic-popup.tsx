import { useRelatedTable } from "@/hooks/use-related-table";
import { RelatedTable } from "@/lib/types/mapping-types";
import { Feature, Geometry, GeoJsonProperties } from "geojson";

type ReusablePopupProps = {
    feature: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
    popupFields?: Record<string, string>;
    relatedTable?: RelatedTable[];
};

const GenericPopup = ({ feature, relatedTable, popupFields, }: ReusablePopupProps) => {
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

    // Generate content for the properties of the feature
    // default to properties if popupFields is not provided
    const featureContent = (
        popupFields && Object.keys(popupFields).length > 0
            ? Object.entries(popupFields)
            : Object.entries(properties)
    ).map(([label, field]) => {
        const value = popupFields && Object.keys(popupFields).length > 0
            ? properties[field]
            : field; // In case we're iterating over `properties`
        return (
            value && (
                <div key={label} className="flex flex-col">
                    <p className="font-bold underline text-primary">{label}</p>
                    <p className="break-words">
                        {value ?? "N/A"}
                    </p>
                </div>
            )
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
            {featureContent}
            {relatedContent}
        </div>
    );
};

export { GenericPopup };
