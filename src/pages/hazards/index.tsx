import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { MapFooter } from '@/components/custom/map/map-footer'
import { cn } from '@/lib/utils'
import MapContainer from './components/map-container'
import Sidebar from '@/components/sidebar'
import { useSidebar } from '@/hooks/use-sidebar'
import { ExtendedGeometry, SearchCombobox, SearchConfig } from '@/components/sidebar/filter/search-combobox'
import { useContext } from 'react'
import { MapContext } from '@/context/map-provider'
import { Feature, FeatureCollection, GeoJsonProperties } from 'geojson'
import { getBoundingBox, zoomToExtent } from '@/lib/sidebar/filter/util'
import { GEOCODE_PROXY_FUNCTION_URL, PROD_POSTGREST_URL } from '@/lib/constants'
import * as turf from '@turf/turf'
import { convertBbox } from '@/lib/mapping-utils'
import { highlightSearchResult } from '@/lib/util/highlight-utils'

export default function Map() {
  const { isCollapsed } = useSidebar();
  const { view } = useContext(MapContext);

  const searchConfig: SearchConfig[] = [
    // --- Geocode Proxy Configuration ---
    {
      restConfig: {
        isGeocodeProxy: true,
        url: GEOCODE_PROXY_FUNCTION_URL,
        sourceName: 'Address Search',
        displayField: 'matchAddress', // Top-level displayField (from geocode JSON result)
        headers: { 'Accept': 'application/geo+json' }
      }
    },
    // --- PostgREST Fault Search Configuration ---
    {
      restConfig: {
        url: PROD_POSTGREST_URL,
        functionName: "search_fault_data",
        searchTerm: "search_term",
        sourceName: 'Faults',
        displayField: "concatnames",
        headers: {
          'Accept-Profile': 'hazards',
          'Accept': 'application/geo+json',
        }
      },
    },
  ]


  const handleSearchSelect = (searchResult: Feature<ExtendedGeometry, GeoJsonProperties> | null) => {
    const geom = searchResult?.geometry;

    if (!geom) {
      console.error("No geometry found in search result");
      return;
    }

    if (view) {

      const [xmin, ymin, xmax, ymax] = getBoundingBox(geom);
      zoomToExtent(xmin, ymin, xmax, ymax, view);
      highlightSearchResult(searchResult, view);
    }
  }

  const handleCollectionSelect = (
    collection: FeatureCollection<ExtendedGeometry, GeoJsonProperties> | null,
  ) => {
    view?.graphics.removeAll();
    if (!collection?.features?.length || !view) {
      console.warn("No features in collection or map view unavailable for collection action.");
      return;
    }

    try {
      // Calculate overall bbox for the collection using Turf
      const collectionBbox = turf.bbox(collection);
      let [xmin, ymin, xmax, ymax] = collectionBbox;
      [xmin, ymin, xmax, ymax] = convertBbox([xmin, ymin, xmax, ymax]);

      if (!collectionBbox.every(isFinite)) {
        console.error("Invalid bounding box calculated for collection");
        return;
      }

      // Zoom to the extent of the entire collection using your util
      zoomToExtent(xmin, ymin, xmax, ymax, view);

      // Highlight all features in the collection
      collection.features.forEach(feature => {
        // Pass each feature individually to the highlight function
        highlightSearchResult(feature, view, false);
      });

    } catch (error) {
      console.error("Error processing feature collection selection:", error);
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Sidebar />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-[32rem]'
          } h-full`}
      >
        <Layout>

          {/* ===== Top Heading ===== */}
          <Layout.Header className='flex items-center justify-between px-4 md:px-6'>
            <TopNav className="hidden md:block md:w-auto w-1/12" />
            <div className='flex items-center w-10/12 md:w-1/4 md:ml-auto space-x-2'>
              <div className="flex-1 min-w-0 max-w-4/5">
                <SearchCombobox
                  config={searchConfig}
                  onFeatureSelect={handleSearchSelect}
                  onCollectionSelect={handleCollectionSelect}
                  className="w-full"
                />
              </div>
              <div className="w-1/12 flex-none">
                <ThemeSwitch />
              </div>
            </div>
          </Layout.Header>

          {/* ===== Main ===== */}
          <Layout.Body>
            <MapContainer />
          </Layout.Body>

          {/* ===== Footer ===== */}
          {/* no footer on mobile */}
          <Layout.Footer className={cn('hidden md:flex z-10')} dynamicContent={<MapFooter />} />

        </Layout>
      </main>
    </div>
  )
}




