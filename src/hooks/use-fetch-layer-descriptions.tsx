const useFetchLayerDescriptions = async (): Promise<Record<string, string>> => {
    const response = await fetch(`https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Hazard_Layer_Info_t1/FeatureServer/0/query?f=json&outFields=content,title&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=1=1`)
    const data = await response.json();
    const { features } = data;

    return features.reduce((acc: Record<string, string>, feature: any) => {
        acc[feature.attributes.title] = feature.attributes.content;
        return acc;
    }, {});
}

export { useFetchLayerDescriptions };