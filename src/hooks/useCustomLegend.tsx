import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import { useContext } from "react";
import Legend from "@arcgis/core/widgets/Legend";
import LegendViewModel from "@arcgis/core/widgets/Legend/LegendViewModel.js";
import { MapContext } from "../contexts/MapProvider";
import { useQuery } from "@tanstack/react-query";

interface UseCustomLegendProps {
    layerId: string;
}

interface FindLegendElementProps {
    view: __esri.MapView | __esri.SceneView | undefined;
    layerId: string;
}


async function findLegendElements({ view, layerId }: FindLegendElementProps) {
    console.log('FIND LEGEND ELEMENTS', view, layerId);

    let foundLayer: __esri.Layer | __esri.Sublayer | undefined = undefined;

    const legend = new Legend({
        view: view,
        viewModel: new LegendViewModel({
            view: view
        })
    });

    if (legend.viewModel.activeLayerInfos.length === 0) {
        return [];
    }

    const activeLayerInfos = legend.viewModel.activeLayerInfos;

    const foundLegendElements = await new Promise<__esri.LegendElement[]>((resolve, reject) => {
        const flatActiveLayerInfos = activeLayerInfos.flatten((layerInfo) => {
            return layerInfo.children || []
        });

        for (const layerInfo of flatActiveLayerInfos) {
            const handle = reactiveUtils.watch(
                () => layerInfo.legendElements,
                (legendElements) => {
                    handle.remove();
                    resolve(legendElements || []);
                }
            );

            if (layerInfo.layer.id === layerId) {
                foundLayer = layerInfo.layer;
            }
        }
    });

    console.log('FOUND LEGEND ELEMENTS', foundLegendElements);

    return foundLegendElements;
}

const useCustomLegend = ({ layerId }: UseCustomLegendProps) => {
    const { view } = useContext(MapContext);

    // Use the useQuery hook to fetch the legend elements
    const { isPending, error, data: legendElements } = useQuery({
        queryKey: ['legend'],
        queryFn: () => findLegendElements({ view, layerId }),
        enabled: layerId !== undefined && view !== undefined
    })

    // console.log('LEGEND ELEMENTS', legendElements);


    // if (error) {
    //     console.error('Error fetching legend data:', error);
    //     return <p>Error fetching legend information</p>;
    // }

    // Handle the legend elements here
    // ...

    return { legendElements, layerId };
};

export default useCustomLegend;

