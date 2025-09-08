import { House, Info as InfoIcon, Layers as LayersIcon, Settings, ExternalLink, MessageSquare } from 'lucide-react'
import Info from '@/components/sidebar/info'
import Layers from '@/components/sidebar/layers'
import MapConfigurations from '@/pages/carbonstorage/components/sidebar/map-configurations/map-configurations'

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
  {
    title: 'Learn More',
    label: '',
    href: 'https://geology.utah.gov/energy-minerals/ccus/',
    icon: <ExternalLink className='stroke-foreground' />,
    // This link is external and does not need a component
  },
  {
    title: 'Feedback',
    label: '',
    href: 'https://forms.gle/RnwEi6a92grdqqFk9',
    icon: <MessageSquare className='text-ring' />,
  }
];
