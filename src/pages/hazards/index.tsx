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
import { Feature, GeoJsonProperties } from 'geojson'
import { getBoundingBox, highlightSearchResult, zoomToExtent } from '@/lib/sidebar/filter/util'
import { wellWithTopsLayerName } from '../ccus/data/layers'
import { PROD_POSTGREST_URL } from '@/lib/constants'

export default function Map() {
  const { isCollapsed } = useSidebar();
  const { view } = useContext(MapContext);

  const searchConfig: SearchConfig[] = [
    {
      postgrest: {
        url: `${PROD_POSTGREST_URL}/${wellWithTopsLayerName}`,
        params: {
          targetField: 'api',
          displayField: 'api',
          select: 'shape, api',
        },
        headers: {
          'content-type': 'application/geo+json',
          'accept-profile': 'emp',
          'accept': 'application/geo+json',
        }
      },
    },
    {
      postgrest: {
        url: PROD_POSTGREST_URL,
        functionName: "search_fault_data",
        searchTerm: "search_term",
        params: {
          displayField: "concatnames",
          searchKeyParam: "search_key",
        },
        headers: {
          'content-type': 'application/geo+json',
          'accept-profile': 'hazards',
          'accept': 'application/geo+json',
        }
      },
    },
  ];


  const handleSearchSelect = (searchResult: Feature<ExtendedGeometry, GeoJsonProperties> | null) => { // Added sourceUrl parameter back
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
                  onSearchSelect={handleSearchSelect}
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




