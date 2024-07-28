import { Database, Info as InfoIcon, Layers as LayersIcon, Route, Settings } from 'lucide-react'
import Info from '../components/sidebar/info'
import Layers from '../components/sidebar/layers'
import React from 'react'
import MapConfigurations from '@/components/sidebar/map-configurations'
import GeologicalUnitSearch from '@/components/sidebar/geological-unit-search'

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
    title: 'Info',
    label: '',
    icon: <InfoIcon />,
    component: Info, // Direct component reference
    componentPath: 'src/components/sidebar/info.tsx',
  },
  {
    title: 'Layers',
    label: '',
    icon: <LayersIcon />,
    component: Layers, // Direct component reference
  },
  {
    title: 'Map Configurations',
    label: '9',
    icon: <Settings />,
    component: MapConfigurations, // Direct component reference
  },
  {
    title: 'Geological Unit Search',
    label: '',
    icon: <Database size={18} />,
    component: GeologicalUnitSearch, // Direct component reference
  },
  {
    title: 'Utah Geology Homepage',
    label: 'we can route outside the app by providing an href attribute',
    href: 'https://geology.utah.gov/',
    icon: <Route size={18} />,
    // This link is external and does not need a component
  }
];
