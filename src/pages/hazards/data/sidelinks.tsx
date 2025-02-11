import { ExternalLink, FileText, House, Info as InfoIcon, Layers as LayersIcon, Settings } from 'lucide-react'
import Info from '@/components/sidebar/info'
import Layers from '@/components/sidebar/layers'
import MapConfigurations from '@/pages/hazards/components/sidebar/map-configurations/map-configurations'
import ReportGenerator from '@/pages/hazards/components/sidebar/report-generator'

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
    label: '',
    icon: <FileText className='stroke-foreground' />,
    component: ReportGenerator,


  },
  {
    title: 'Utah Geology Homepage',
    label: '',
    href: 'https://geology.utah.gov/',
    icon: <ExternalLink className='stroke-foreground' />,
    // This link is external and does not need a component
  }
];
