import { Button } from "@/components/ui/button";
import { useRelatedTable } from "@/hooks/use-related-table";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import { ExternalLink } from "lucide-react";
import { LayerContentProps } from "@/components/custom/popups/popup-content-with-pagination";
import { Link } from "@/components/custom/link";

type PopupContentDisplayProps = {
    layer: LayerContentProps;
    feature: Feature<Geometry, GeoJsonProperties>;
    layout?: "grid" | "stacked";
};

const PopupContentDisplay = ({ feature, layout, layer }: PopupContentDisplayProps) => {
    const { relatedTables, popupFields, linkFields } = layer;
    const { data, isLoading, error } = useRelatedTable(relatedTables || []);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {String(error)}</p>;

    const properties = feature.properties || {};
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/;

    const createLink = (value: string, field: string) => {
        const linkConfig = linkFields?.[field];

        if (linkConfig) {
            const hrefs = linkConfig.transform ? linkConfig.transform(value) : [{ label: value, href: `${linkConfig.baseUrl}${value}` }];

            return (
                <>
                    {hrefs.map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <Link
                                to={item.href}
                                className="p-0 h-auto whitespace-normal text-left font-normal inline-flex items-center max-w-full gap-1"
                                variant="primary"
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

    const getRelatedTableValues = (field: string) => {
        if (!data?.length) return ["No data available"];
        const matchedValues: string[] = [];

        relatedTables?.forEach((table) => {
            const targetField = properties[table.targetField];
            data.forEach((entry) => {
                entry?.find((item: Record<string, string>) => {
                    if (item[table.matchingField] === targetField) {
                        matchedValues.push(item.Description);
                    }
                });
                if (entry?.[table.matchingField] === field) {
                    matchedValues.push(entry.Description || "N/A");
                }
            });
        });

        return matchedValues.length ? matchedValues : ["N/A"];
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
                        {createLink(value, field)}
                    </p>
                </div>
            );

            if (urlPattern.test(value) || linkFields?.[field]) {
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

    const { longRelatedContent, regularRelatedContent } = (relatedTables || []).reduce<{
        longRelatedContent: JSX.Element[];
        regularRelatedContent: JSX.Element[];
    }>(
        (acc, table, index) => {
            const values = getRelatedTableValues(table.targetField);
            const content = (
                <div key={index} className="flex flex-col">
                    <p className="font-bold underline text-primary">
                        {properties[table.fieldLabel]}
                    </p>
                    <p className="break-words">{values.join(", ")}</p>
                </div>
            );

            const totalWords = values.join(", ").split(/\s+/).length;
            acc[totalWords > 20 ? 'longRelatedContent' : 'regularRelatedContent'].push(content);
            return acc;
        },
        { longRelatedContent: [], regularRelatedContent: [] }
    );

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