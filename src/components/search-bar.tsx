import { useContext, useEffect, useRef } from 'react';
import { MapContext } from '@/context/map-provider';
import Search from '@arcgis/core/widgets/Search';
import Extent from '@arcgis/core/geometry/Extent';
import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import { fetchQFaultResults, fetchQFaultSuggestions } from '@/lib/mapping-utils';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { GetResultsHandlerType } from '@/lib/types/mapping-types';

function SearchBar() {
  const { view } = useContext(MapContext);
  const searchDivRef = useRef<HTMLDivElement | null>(null);

  const qFaultsUrl = 'https://pgfeatureserv-souochdo6a-wm.a.run.app/functions/postgisftw.search_fault_data/items.json';

  useEffect(() => {
    let searchWidget: __esri.widgetsSearch;
    if (view && searchDivRef.current) {
      console.log("Creating search widget");
      console.log("View:", view);

      searchWidget = new Search({
        view: view,
        container: searchDivRef.current,
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




      });

      console.log("Search widget:", searchWidget);
    } else {
      console.log("View or searchDivRef.current is not available");
    }

    return () => {
      if (searchWidget && searchWidget.destroy) {
        searchWidget.destroy();
      }
    }
  }, [view]);

  return <div ref={searchDivRef}></div>;

}

export { SearchBar }