import { Layout } from '@/components/custom/layout'
import { SearchBar } from '@/components/search-bar'
import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { MapFooter } from '@/components/custom/map/map-footer'
import { cn } from '@/lib/utils'
import MapContainer from '@/components/custom/map/map-container'

export default function Map() {
  return (
    <Layout>

      {/* ===== Top Heading ===== */}
      <Layout.Header>
        <TopNav />
        <div className='ml-auto flex items-center space-x-4'>
          <SearchBar />
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
  )
}

