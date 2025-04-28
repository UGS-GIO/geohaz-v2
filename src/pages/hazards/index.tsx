import { Layout } from '@/components/custom/layout';
import ThemeSwitch from '@/components/theme-switch';
import { TopNav } from '@/components/top-nav';
import { MapFooter } from '@/components/custom/map/map-footer';
import { cn } from '@/lib/utils';
import MapContainer from './components/map-container';
import Sidebar from '@/components/sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { SearchCombobox, SearchSourceConfig, defaultMasqueradeConfig, handleCollectionSelect, handleSearchSelect, handleSuggestionSelect } from '@/components/sidebar/filter/search-combobox';
import { PROD_POSTGREST_URL } from '@/lib/constants';

export default function Map() {
  const { isCollapsed } = useSidebar();

  const searchConfig: SearchSourceConfig[] = [
    defaultMasqueradeConfig,
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
        'Accept': 'application/geo+json',
      }
    },
  ];

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