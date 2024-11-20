import { FileText, House, Info as InfoIcon, Layers as LayersIcon, Route, Settings } from 'lucide-react'
import Info from '@/components/sidebar/info'
import Layers from '@/components/sidebar/layers'
import MapConfigurations from '@/components/sidebar/map-configurations'
import ReportGenerator from '@/components/sidebar/report-generator'

export interface NavLink {
  title: string
  label?: string
  href?: string
  icon: JSX.Element
  component?: () => JSX.Element
  componentPath?: string
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Home',
    label: '',
    icon: <House className='stroke-foreground' />,
  },
  {
    title: 'Info',
    label: '',
    icon: <InfoIcon className='stroke-foreground' />,
    component: Info, // Direct component reference
    componentPath: 'src/components/sidebar/info.tsx',
  },
  {
    title: 'Layers',
    label: '',
    icon: <LayersIcon className='stroke-foreground' />,
    component: Layers, // Direct component reference
  },
  {
    title: 'Map Configurations',
    label: '',
    icon: <Settings className='stroke-foreground' />,
    component: MapConfigurations, // Direct component reference
  },
  // {
  //   title: 'Geological Unit Search',
  //   label: '',
  //   icon: <Database />,
  //   component: GeologicalUnitSearch, // Direct component reference
  // },
  {
    title: 'Report Generator',
    label: 'new!',
    icon: <FileText className='stroke-foreground' />,
    component: ReportGenerator,


  },
  {
    title: 'Utah Geology Homepage',
    label: 'we can route outside the app by providing an href attribute',
    href: 'https://geology.utah.gov/',
    icon: <Route className='stroke-foreground' />,
    // This link is external and does not need a component
  }
];
