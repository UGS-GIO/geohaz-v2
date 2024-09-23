import { Layout } from '@/components/custom/layout'
import { SearchBar } from '@/components/search-bar'
import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
// import { UserNav } from '@/components/user-nav'
import MapContainer from './components/map-container'
import { PopupDrawer } from '@/components/custom/popup-drawer'

export default function Dashboard() {
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header>
        <TopNav />
        <div className='ml-auto flex items-center space-x-4'>
          <SearchBar />
          <ThemeSwitch />
          {/* <UserNav /> */}
        </div>
      </Layout.Header>

      {/* ===== Main ===== */}
      <Layout.Body>
        <MapContainer />
      </Layout.Body>
    </Layout>
  )
}

