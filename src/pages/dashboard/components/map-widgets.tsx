import React, { useContext } from 'react';
import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import useArcGISWidget from '@/hooks/use-arcgis-widget';
import Feature from "@arcgis/core/widgets/Feature.js";
import Expand from '@arcgis/core/widgets/Expand';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import { MapContext } from '@/context/map-provider';
import Legend from '@arcgis/core/widgets/Legend';
import Search from '@arcgis/core/widgets/Search';
import Extent from "@arcgis/core/geometry/Extent.js";
import SearchSource from "@arcgis/core/widgets/Search/SearchSource.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import { fetchQFaultResults, fetchQFaultSuggestions } from '@/lib/mapping-utils';
import { GetResultsHandlerType } from '@/lib/types/mapping-types';

// Base type for common widget configuration properties
interface BaseWidgetConfig {
    id: string;
    view: __esri.View;
}

// Specific widget configuration types extending the base type

interface CoordinateFeatureConfig extends BaseWidgetConfig {
    graphic: {
        popupTemplate: {
            content: string;
        };
    };
    map: __esri.Map | undefined;
    spatialReference: __esri.SpatialReference | undefined;
}

interface BasemapExpandConfig extends BaseWidgetConfig {
    content: BasemapGallery;
}

interface LegendExpandConfig extends BaseWidgetConfig {
    expanded: boolean;
    content: Legend;
}

interface SearchExpandConfig extends BaseWidgetConfig {
    content: Search;
}

// Union type for all widget configurations
export type WidgetConfig = CoordinateFeatureConfig | BasemapExpandConfig | LegendExpandConfig | SearchExpandConfig;

// ArcGISWidgetProps type using the WidgetConfig union
// interface ArcGISWidgetProps {
//     WrappedWidget: new (args: any) => __esri.Widget;
//     position: string;
//     config?: WidgetConfig;
// }


const MapWidgets: React.FC = () => {
    const { view, isMobile } = useContext(MapContext);
    const qFaultsUrl = 'https://pgfeatureserv-souochdo6a-wm.a.run.app/functions/postgisftw.search_fault_data/items.json';

    const coordinateFeatureConfig: CoordinateFeatureConfig = {
        id: 'coordinate-feature-widget',
        view: view!,
        graphic: {
            popupTemplate: {
                content: isMobile ? '' : 'Mouse over the map to update the coordinates.',
            },
        },
        map: view?.map,
        spatialReference: view?.spatialReference,
    };

    const basemapExpandConfig: BasemapExpandConfig = {
        id: 'basemap-gallery-expand',
        view: view!,
        content: new BasemapGallery({
            view: view!,
            container: document.createElement('div'),
            id: 'basemap-gallery-widget',
        }),
    };

    const legendExpandConfig: LegendExpandConfig = {
        id: 'legend-expand',
        view: view!,
        expanded: !isMobile,
        content: new Legend({
            view: view!,
            container: document.createElement('div'),
            id: 'legend-widget',
        }),
    };

    const searchExpandConfig: SearchExpandConfig = {
        id: 'search-expand',
        view: view!,
        content: new Search({
            view: view!,
            container: document.createElement('div'),
            id: 'search-widget',
            popupEnabled: false,
            allPlaceholder: 'Address, place, or fault',
            includeDefaultSources: false,
            sources: [
                {
                    url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
                    singleLineFieldName: 'SingleLine',
                    outFields: ['RegionAbbr'],
                    name: 'Location Search',
                    placeholder: 'Address or place',
                    maxResults: 1000,
                    filter: {
                        geometry: new Extent({
                            xmin: -114.05015918679902,
                            ymin: 37.00019802842964,
                            xmax: -109.07096511303821,
                            ymax: 42.00611147170977,
                            spatialReference: {
                                wkid: 4326,
                            },
                        }),
                    },
                } as __esri.LocatorSearchSourceProperties,
                new SearchSource({
                    placeholder: 'ex: Wasatch Fault Zone',
                    name: 'Fault Search',
                    getSuggestions: (params) => fetchQFaultSuggestions(params, qFaultsUrl),
                    getResults: async (params: GetResultsHandlerType) => fetchQFaultResults(params, qFaultsUrl),
                    resultSymbol: new SimpleLineSymbol({
                        color: 'red',
                        width: 2,
                    }),
                } as __esri.LayerSearchSourceProperties),
            ],
        }),
    };

    useArcGISWidget([
        { WrappedWidget: Home, position: 'top-left' },
        { WrappedWidget: Locate, position: 'top-left' },
        {
            WrappedWidget: Feature,
            position: isMobile ? 'top-right' : 'bottom-right',
            config: coordinateFeatureConfig,
        },
        {
            WrappedWidget: Expand,
            position: isMobile ? 'top-left' : 'top-right',
            config: basemapExpandConfig,
        },
        { WrappedWidget: Expand, position: 'top-left', config: legendExpandConfig },
        { WrappedWidget: Expand, position: 'top-right', config: searchExpandConfig },
    ]);

    return null;
};

export default MapWidgets;
