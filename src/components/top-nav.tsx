import { useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/custom/button';
import { MapContext } from '@/context/map-provider';
import { BasemapIcon } from '@/assets/basemap-icons';
import Basemap from "@arcgis/core/Basemap.js";

type BasemapType = {
  title: string;
  basemapStyle: string;
  isActive: boolean;
  type: 'short' | 'long';
  customBasemap?: __esri.Basemap;
};

const topoBasemapOptions = {
  portalItem: {
    id: "7378ae8b471940cb9f9d114b67cd09b8"
  }
};

export const basemapList: BasemapType[] = [
  { title: 'Relief', basemapStyle: 'topo', isActive: true, type: 'short' },
  { title: 'Streets', basemapStyle: 'streets', isActive: false, type: 'short' },
  { title: 'Satellite', basemapStyle: 'satellite', isActive: false, type: 'short' },
  { title: 'Hybrid', basemapStyle: 'hybrid', isActive: false, type: 'short' },
  { title: 'Terrain', basemapStyle: 'terrain', isActive: false, type: 'long' },
  { title: 'Topographic', basemapStyle: 'contours', isActive: false, type: 'long', customBasemap: new Basemap(topoBasemapOptions) },
];

interface TopNavProps extends React.HTMLAttributes<HTMLElement> { }

interface BasemapProps {
  links: BasemapType[];
  trigger: React.ReactNode | string;
  onBasemapChange: (basemapStyle: string, customBasemap?: __esri.Basemap) => void;
  activeBasemap: string | __esri.Basemap;
}

const BasemapDropdown = ({ links, trigger, onBasemapChange, activeBasemap }: BasemapProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start">
        {links.map(({ title, basemapStyle, customBasemap }) => {
          const isActive = customBasemap ?
            activeBasemap === customBasemap :
            activeBasemap === basemapStyle;

          return (
            <DropdownMenuItem key={`${title}-${basemapStyle}`} asChild>
              <Button
                variant="ghost"
                className={cn('w-full justify-start', !isActive ? 'text-muted-foreground' : 'underline')}
                onClick={() => onBasemapChange(basemapStyle, customBasemap)}
              >
                {title}
              </Button>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function TopNav({ className, ...props }: TopNavProps) {
  const { view } = useContext(MapContext);
  const [activeBasemap, setActiveBasemap] = useState<string | __esri.Basemap>(
    basemapList.find(b => b.isActive)!.basemapStyle
  );

  const handleBasemapChange = (basemapStyle: string, customBasemap?: __esri.Basemap) => {
    if (!view) return;

    if (customBasemap) {
      view.map.basemap = customBasemap;
      setActiveBasemap(customBasemap);
    } else {
      view.map.basemap = basemapStyle as unknown as __esri.Basemap;
      setActiveBasemap(basemapStyle);
    }
  };

  // Check if any long-type basemap is active
  const isLongActive = basemapList
    .filter(({ type }) => type === 'long')
    .some(({ customBasemap, basemapStyle }) =>
      customBasemap ? activeBasemap === customBasemap : activeBasemap === basemapStyle
    );

  const mobileTrigger = (
    <Button size="icon" variant="outline">
      <BasemapIcon />
    </Button>
  );

  const desktopTrigger = (
    <Button
      className={cn(
        'text-stone-400',
        isLongActive && 'text-primary-foreground underline',
        'focus-visible:outline-none'
      )}
      variant="ghost"
    >
      More
    </Button>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <BasemapDropdown
          links={basemapList.filter(({ type }) => type === 'short')}
          trigger={mobileTrigger}
          onBasemapChange={handleBasemapChange}
          activeBasemap={activeBasemap}
        />
      </div>

      {/* Desktop */}
      <nav
        className={cn(
          'hidden items-center space-x-4 md:flex lg:space-x-6',
          className
        )}
        {...props}
      >
        {basemapList
          .filter(({ type }) => type === 'short')
          .map(({ title, basemapStyle, customBasemap }) => {
            const isActive = customBasemap ?
              activeBasemap === customBasemap :
              activeBasemap === basemapStyle;

            return (
              <Button
                variant="ghost"
                key={`${title}-${basemapStyle}`}
                onClick={() => handleBasemapChange(basemapStyle, customBasemap)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-foreground',
                  isActive ? 'underline' : 'text-muted-foreground'
                )}
              >
                {title}
              </Button>
            );
          })}
        <BasemapDropdown
          links={basemapList.filter(({ type }) => type === 'long')}
          trigger={desktopTrigger}
          onBasemapChange={handleBasemapChange}
          activeBasemap={activeBasemap}
        />
      </nav>
    </>
  );
}

export { TopNav };