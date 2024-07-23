// src/components/Toolbar.tsx
import React, { lazy } from 'react';
import { CalciteAction, CalciteActionBar, CalciteActionGroup, CalciteShellPanel } from '@esri/calcite-components-react';
import { useCalciteActionBar, ActionItem } from '@/hooks/useCalciteActionBar';
import { useTheme } from '@/contexts/ThemeProvider';

const actionItems: ActionItem[] = [
  { name: 'Info', icon: 'information-f', component: lazy(() => import('@/components-legacy/SidebarComponents/archive/Info')) },
  { name: 'Layers', icon: 'layers', component: lazy(() => import('@/components-legacy/SidebarComponents/archive/Layers')) },
  { name: 'Map Configurations', icon: 'sliders-horizontal', component: lazy(() => import('@/components-legacy/SidebarComponents/archive/MapConfigurations')) },
  { name: 'Geological Unit Search', icon: 'data-magnifying-glass', component: lazy(() => import('@/components-legacy/SidebarComponents/archive/GeologicalUnitSearch')) },
];

export function Toolbar() {
  const { currentAction, actions, shellPanelCollapsed } = useCalciteActionBar(actionItems, 'Info');
  const { setTheme, theme } = useTheme();
  return (
    <CalciteShellPanel widthScale='m' slot='panel-start' position='start' collapsed={shellPanelCollapsed}>
      <CalciteActionBar slot='action-bar'>
        <CalciteActionGroup>
          {actions}
          <CalciteAction
            icon={theme === 'dark' ? 'brightness' : 'moon'}
            text="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </CalciteActionGroup>
      </CalciteActionBar>
      <React.Suspense fallback={<div>Loading...</div>}>
        {currentAction && <currentAction.component />}
      </React.Suspense>
    </CalciteShellPanel>
  );
}

export default Toolbar;
