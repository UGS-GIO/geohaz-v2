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
import { qFaultsWMSTitle } from './data/layers';
import { signOut } from '@/lib/auth'; // Add this import
import { useAuth } from '@/context/auth-provider'; // Add this import
import { Button } from '@/components/ui/button'; // Add this import
import { Badge } from '@/components/ui/badge'; // Add this import
import { LogOut } from 'lucide-react'; // Add this import

export default function Map() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth(); // Add this line

  const searchConfig: SearchSourceConfig[] = [
    defaultMasqueradeConfig,
    {
      type: 'postgREST',
      url: PROD_POSTGREST_URL,
      functionName: "search_fault_data",
      layerName: qFaultsWMSTitle,
      searchTerm: "search_term",
      sourceName: 'Faults',
      crs: 'EPSG:26912',
      displayField: "concatnames",
      headers: {
        'Accept-Profile': 'hazards',
        'Accept': 'application/geo+json',
      }
    },
  ];

  // Add this function
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* Add auth indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-background/95 backdrop-blur-sm">
            {user?.email}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-background/95 backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Sidebar />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${
          isCollapsed ? 'md:ml-14' : 'md:ml-[32rem]'
        } h-full`}
      >
        <Layout>
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

          <Layout.Body className="min-h-0"> {/* Add min-h-0 for the map fix */}
            <MapContainer />
          </Layout.Body>

          <Layout.Footer className={cn('hidden md:flex z-10')} dynamicContent={<MapFooter />} />
        </Layout>
      </main>
    </div>
  )
}