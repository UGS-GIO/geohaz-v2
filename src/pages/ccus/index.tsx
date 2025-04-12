import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { MapFooter } from '@/components/custom/map/map-footer'
import { cn } from '@/lib/utils'
import MapContainer from './components/map-container'
import Sidebar from '@/components/sidebar'
import { useSidebar } from '@/hooks/use-sidebar'
// import { ExtendedGeometry } from '@/components/sidebar/filter/search-combobox'
// import { MapContext } from '@/context/map-provider'
// import { zoomToExtent, highlightSearchResult, getBoundingBox } from '@/lib/sidebar/filter/util'
// import { Feature, GeoJsonProperties } from 'geojson'
// import { useContext } from 'react'

export default function Map() {
  const { isCollapsed } = useSidebar();

  // const { view } = useContext(MapContext);

  // const searchConfig: SearchConfig[] = [
  //   {
  //     postgrest: {
  //       url: `${PROD_POSTGREST_URL}/${wellWithTopsLayerName}`,
  //       params: {
  //         targetField: 'api',
  //         displayField: 'api',
  //         select: 'shape, api',
  //       },
  //       headers: {
  //         'content-type': 'application/json',
  //         'accept-profile': 'emp',
  //         'accept': 'application/geo+json',
  //       }
  //     },
  //   }
  // ];


  // const handleSearchSelect = (searchResult: Feature<ExtendedGeometry, GeoJsonProperties> | null) => { // Added sourceUrl parameter back
  //   const geom = searchResult?.geometry;

  //   if (!geom) {
  //     console.error("No geometry found in search result");
  //     return;
  //   }

  //   if (view) {
  //     const [xmin, ymin, xmax, ymax] = getBoundingBox(geom);
  //     zoomToExtent(xmin, ymin, xmax, ymax, view);
  //     highlightSearchResult(searchResult, view); // Pass the prepared result
  //   }
  // }

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
          <Layout.Header>
            <TopNav />
            <div className='ml-auto flex items-center space-x-4'>
              {/* <SearchCombobox
                config={searchConfig}
                onSearchSelect={handleSearchSelect}
              /> */}
              Filter goes here
              <ThemeSwitch />
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




