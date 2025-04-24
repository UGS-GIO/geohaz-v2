import { useContext } from 'react';
import { Layout } from '@/components/custom/layout';
import ThemeSwitch from '@/components/theme-switch';
import { TopNav } from '@/components/top-nav';
import { MapFooter } from '@/components/custom/map/map-footer';
import { cn } from '@/lib/utils';
import MapContainer from './components/map-container';
import Sidebar from '@/components/sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { ExtendedGeometry, SearchCombobox, SearchSourceConfig } from '@/components/sidebar/filter/search-combobox';
import { MapContext } from '@/context/map-provider';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { zoomToExtent } from '@/lib/sidebar/filter/util';
import { PROD_POSTGREST_URL, MASQUERADE_GEOCODER_URL } from '@/lib/constants';
import * as turf from '@turf/turf';
import { convertBbox } from '@/lib/mapping-utils';
import { highlightSearchResult, removeGraphics } from '@/lib/util/highlight-utils';
import { point as turfPoint } from '@turf/helpers';

interface Suggestion {
  text: string;
  magicKey: string;
  isCollection?: boolean;
}

export default function Map() {
  const { isCollapsed } = useSidebar();
  const { view } = useContext(MapContext);

  const searchConfig: SearchSourceConfig[] = [
    // --- Masquerade Geocoder Configuration ---
    {
      type: 'masquerade',
      url: MASQUERADE_GEOCODER_URL,
      sourceName: 'Address Search',
      displayField: 'text',
      outSR: 4326 // Request WGS84
    },
    // --- PostgREST Fault Search Configuration ---
    {
      type: 'postgREST',
      url: PROD_POSTGREST_URL,
      functionName: "search_fault_data",
      searchTerm: "search_term",
      sourceName: 'Faults',
      crs: 'EPSG:26912', // EPSG:26912
      displayField: "concatnames", // Field in PostgREST result features
      headers: {
        'Accept-Profile': 'hazards',
        'Accept': 'application/geo+json', // Ensure server returns GeoJSON features
      }
    },
  ];

  // Handler for Masquerade Suggestion Selection
  const handleSuggestionSelect = async (
    suggestion: Suggestion,
    sourceConfig: SearchSourceConfig,
    sourceIndex: number
  ) => {
    if (sourceConfig.type !== 'masquerade' || !view) {
      return;
    }

    view.graphics.removeAll();

    // findAddressCandidates
    try {
      const params = new URLSearchParams();
      params.set('magicKey', suggestion.magicKey);
      params.set('outFields', '*');
      params.set('maxLocations', '1');
      params.set('outSR', JSON.stringify({ wkid: sourceConfig.outSR ?? 4326 }));
      params.set('f', 'json');

      const candidatesUrl = `${sourceConfig.url}/findAddressCandidates?${params.toString()}`;
      const response = await fetch(candidatesUrl, { method: 'GET', headers: sourceConfig.headers });

      if (!response.ok) {
        throw new Error(`findAddressCandidates failed: ${response.status}`);
      }

      const data = await response.json();

      if (data?.candidates?.length > 0) {
        const bestCandidate = data.candidates[0];

        // --- Format Candidate into GeoJSON Feature ---
        const pointGeom = turfPoint([bestCandidate.location.x, bestCandidate.location.y]).geometry;
        const feature: Feature<Geometry, GeoJsonProperties> = {
          type: "Feature",
          geometry: pointGeom,
          properties: {
            ...bestCandidate.attributes, // Include attributes from geocoder
            matchAddress: bestCandidate.address, // Add matched address
            score: bestCandidate.score,
            // Use the specific displayField requested by the source if needed,
            // otherwise default to address for display consistency post-selection
            [sourceConfig.displayField || 'address']: bestCandidate.address
          }
        };
        handleSearchSelect(feature, sourceConfig.url, sourceIndex);

      } else {
        console.warn("No candidates found for magicKey:", suggestion.magicKey);
      }
    } catch (error) {
      console.error("Error fetching/processing address candidates:", error);
      // Handle error appropriately (e.g., show notification)
    }
  };


  // PostgREST results or finalized Candidate)
  const handleSearchSelect = (
    searchResult: Feature<Geometry, GeoJsonProperties> | null,
    _sourceUrl: string,
    sourceIndex: number
  ) => {
    const geom = searchResult?.geometry;
    const sourceConfigWrapper = searchConfig[sourceIndex];
    const sourceConfig = sourceConfigWrapper;

    if (!geom || !view || !sourceConfig) {
      console.warn("No geometry, view, or valid source config for single feature select.", { geom, view, sourceConfig });
      return;
    }
    view.graphics.removeAll();

    try {
      let sourceCRS: string | undefined | null = null;

      if (sourceConfig.type === 'postgREST') {

        // use CRS from config if provided
        sourceCRS = sourceConfig.crs;
        if (sourceCRS) {
          console.log(`Using configured CRS for PostgREST source: ${sourceCRS}`);
        } else {
          // fallback: check for embedded CRS in the geometry
          sourceCRS = (geom as ExtendedGeometry).crs?.properties?.name;
          if (sourceCRS) {
            console.log("Using embedded CRS from PostgREST feature:", sourceCRS);
          } else {
            sourceCRS = "EPSG:26912";
            console.warn(`No CRS configured or embedded for PostgREST source ${sourceIndex}. Assuming ${sourceCRS}. This could be incorreect!`);
          }
        }
      } else if (sourceConfig.type === 'masquerade') {
        sourceCRS = `EPSG:${sourceConfig.outSR ?? 4326}`; // Default to WGS84 if not specified
        console.log(`Using requested CRS for Masquerade source: ${sourceCRS}`);
      } else {
        console.error(`Unknown source config type at index ${sourceIndex}`);
        return;
      }

      if (!sourceCRS) {
        console.error(`Could not determine source CRS for index ${sourceIndex}. Aborting selection.`);
        return;
      }

      if (!(geom as ExtendedGeometry).crs && sourceCRS) {
        (geom as ExtendedGeometry).crs = { type: "name", properties: { name: sourceCRS } };
      } else if ((geom as ExtendedGeometry).crs && sourceCRS && (geom as ExtendedGeometry).crs?.properties?.name !== sourceCRS) {
        // Optional: Overwrite embedded CRS if config CRS is different (config takes priority)
        console.warn(`Overwriting embedded CRS (${(geom as ExtendedGeometry).crs?.properties?.name}) with configured CRS (${sourceCRS})`);
        (geom as ExtendedGeometry).crs = { type: "name", properties: { name: sourceCRS } };
      }

      highlightSearchResult(searchResult as Feature<ExtendedGeometry, GeoJsonProperties>, view, false);

      const featureBbox = turf.bbox(geom);
      if (!featureBbox || !featureBbox.every(isFinite)) {
        console.error("Invalid bounding box calculated by turf.bbox:", featureBbox);
        return;
      }


      let [xmin, ymin, xmax, ymax] = featureBbox;
      const targetCRS = "EPSG:4326";
      if (sourceCRS.toUpperCase() !== targetCRS && sourceCRS.toUpperCase() !== 'WGS84') {
        console.log(`Converting bbox from ${sourceCRS} to ${targetCRS}`);
        try {
          [xmin, ymin, xmax, ymax] = convertBbox([xmin, ymin, xmax, ymax], sourceCRS, targetCRS);
        } catch (bboxError) {
          console.error("Error converting bounding box:", bboxError);
          return;
        }
      }

      // --- Zoom ---
      console.log(`Zooming to ${targetCRS} extent:`, { xmin, ymin, xmax, ymax });
      zoomToExtent(xmin, ymin, xmax, ymax, view); // Use the WGS84 bbox

    } catch (error) {
      console.error("Error processing single feature selection:", error);
    }
  };

  // PostgREST Enter key
  const handleCollectionSelect = (
    collection: FeatureCollection<Geometry, GeoJsonProperties> | null,
    _sourceUrl: string | null,
    _sourceIndex: number
  ) => {
    if (!collection?.features?.length || !view) {
      console.warn("No features/view for collection select.");
      return;
    }
    removeGraphics(view);

    try {
      // Calculate overall bbox for the collection using Turf
      const collectionBbox = turf.bbox(collection);
      let [xmin, ymin, xmax, ymax] = collectionBbox;
      [xmin, ymin, xmax, ymax] = convertBbox([xmin, ymin, xmax, ymax]);

      if (!collectionBbox.every(isFinite)) {
        console.error("Invalid bounding box calculated for collection");
        return;
      }

      zoomToExtent(xmin, ymin, xmax, ymax, view);

      // Highlight all features in the collection
      collection.features.forEach(feature => {
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
          <Layout.Header className='flex items-center justify-between px-4 md:px-6'>
            <TopNav className="hidden md:block md:w-auto w-1/12" />
            <div className='flex items-center w-full md:w-1/3 md:ml-auto space-x-2'>
              <div className="flex-1 min-w-0">
                <SearchCombobox
                  config={searchConfig.map(c => ({ config: c }))}
                  onFeatureSelect={handleSearchSelect}
                  onCollectionSelect={handleCollectionSelect}
                  onSuggestionSelect={handleSuggestionSelect}
                  className="w-full"
                />
              </div>
              <div className="flex-shrink-0">
                <ThemeSwitch />
              </div>
            </div>
          </Layout.Header>

          {/* ===== Map ===== */}
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