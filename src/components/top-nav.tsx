import { useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/custom/button';
import { IconMenu } from '@tabler/icons-react';
import { MapContext } from '@/context/map-provider';

type BasemapType = {
  title: string;
  basemapStyle: string;
  isActive: boolean;
  type: 'short' | 'long';
};

const basemapList: BasemapType[] = [
  { title: 'Streets', basemapStyle: 'streets', isActive: true, type: 'short' },
  { title: 'Topographic', basemapStyle: 'topo', isActive: false, type: 'short' },
  { title: 'Satellite', basemapStyle: 'satellite', isActive: false, type: 'short' },
  { title: 'Hybrid', basemapStyle: 'hybrid', isActive: false, type: 'short' },
  { title: 'Streets Relief', basemapStyle: 'streets-relief-vector', isActive: false, type: 'long' },
  { title: 'Terrain', basemapStyle: 'terrain', isActive: false, type: 'long' },
];

interface TopNavProps extends React.HTMLAttributes<HTMLElement> { }

interface BasemapProps {
  links: BasemapType[];
  trigger: React.ReactNode | string;
  onBasemapChange: (basemapStyle: string) => void;
}

const BasemapDropdown = ({ links, trigger, onBasemapChange }: BasemapProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start">
        {links.map(({ title, basemapStyle, isActive }) => (
          <DropdownMenuItem key={`${title}-${basemapStyle}`} asChild>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', !isActive ? 'text-muted-foreground' : 'underline')}
              onClick={() => onBasemapChange(basemapStyle)}
            >
              {title}
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function TopNav({ className, ...props }: TopNavProps) {
  const { view } = useContext(MapContext);
  const [basemaps, setBasemaps] = useState(basemapList);

  const handleBasemapChange = (basemapStyle: string) => {
    if (!view) return;
    view.map.basemap = basemapStyle as unknown as __esri.Basemap;

    // Update the active status across all basemaps
    setBasemaps((prevBasemaps) =>
      prevBasemaps.map((basemap) => ({
        ...basemap,
        isActive: basemap.basemapStyle === basemapStyle,
      }))
    );
  };

  // Check if any long-type basemap is active
  const isLongActive = basemaps.some(({ type, isActive }) => type === 'long' && isActive);

  const mobileTrigger = (
    <Button size="icon" variant="outline">
      <IconMenu />
    </Button>
  );
  const desktopTrigger = (
    <Button className={`text-stone-400 ${isLongActive ? 'text-primary-foreground underline' : ''} focus-visible:outline-none`} variant="ghost">
      More
    </Button>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <BasemapDropdown
          links={basemaps.filter(({ type }) => type === 'short')}
          trigger={mobileTrigger}
          onBasemapChange={handleBasemapChange}
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
        {basemaps
          .filter(({ type }) => type === 'short')
          .map(({ title, basemapStyle, isActive }) => (
            <Button
              variant="ghost"
              key={`${title}-${basemapStyle}`}
              onClick={() => handleBasemapChange(basemapStyle)}
              className={`text-sm font-medium transition-colors hover:text-primary-foreground ${isActive ? 'underline' : 'text-muted-foreground'}`}
            >
              {title}
            </Button>
          ))}
        <BasemapDropdown
          links={basemaps.filter(({ type }) => type === 'long')}
          trigger={desktopTrigger}
          onBasemapChange={handleBasemapChange}
        />
      </nav>
    </>
  );
}

export { TopNav };
