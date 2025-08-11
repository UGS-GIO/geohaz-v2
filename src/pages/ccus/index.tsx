import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { MapFooter } from '@/components/custom/map/map-footer'
import { cn } from '@/lib/utils'
import MapContainer from './components/map-container'
import Sidebar from '@/components/sidebar'
import { useSidebar } from '@/hooks/use-sidebar'
import { PROD_POSTGREST_URL } from '@/lib/constants'
import { wellWithTopsLayerName, wellWithTopsWMSTitle } from '@/pages/ccus/data/layers'
import { SearchCombobox, SearchSourceConfig, defaultMasqueradeConfig, handleCollectionSelect, handleSearchSelect, handleSuggestionSelect } from '@/components/sidebar/filter/search-combobox'

export default function Map() {
  const { isCollapsed } = useSidebar();

  const searchConfig: SearchSourceConfig[] = [
    defaultMasqueradeConfig,
    {
      type: 'postgREST',
      url: `${PROD_POSTGREST_URL}/${wellWithTopsLayerName}`,
      sourceName: 'API #',
      crs: 'EPSG:4326',
      displayField: 'api',
      layerName: wellWithTopsWMSTitle,
      params: {
        select: 'shape,api',
        targetField: 'api',
      },
      headers: {
        'Accept': 'application/geo+json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'emp',
      },
    },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Sidebar />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-[32rem]'} h-full`}
      >
        <Layout>
          {/* ===== Top Heading ===== */}
          <Layout.Header className='flex items-center justify-between px-4 md:px-6'>
            <TopNav className="hidden md:block md:w-auto" />
            <div className='flex items-center flex-1 min-w-0 md:flex-initial md:w-1/3 md:ml-auto space-x-2'>
              <div className="flex-1 min-w-0">
                <SearchCombobox
                  config={searchConfig}
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

