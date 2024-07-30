import { useEffect, useState, useRef } from 'react';
import { IconChevronsLeft, IconMenu2, IconX } from '@tabler/icons-react';
import { Layout } from './custom/layout';
import { Button } from './custom/button';
import Nav from './nav';
import { cn } from '@/lib/utils';
import { sidelinks } from '@/data/sidelinks';

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  className,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const [navOpened, setNavOpened] = useState(false);
  const transitionDuration = 700; // Duration in milliseconds
  const isTransitioning = useRef(false); // Ref to manage transition state

  /* Make body not scrollable when navBar is opened */
  useEffect(() => {
    if (navOpened) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [navOpened]);

  const handleMenuClick = () => {
    // debounce the click event to prevent multiple clicks
    if (isTransitioning.current) return; // Prevent action if a transition is active
    isTransitioning.current = true; // Set the transition flag
    setNavOpened(!navOpened);

    // change the content after a setTimeout has been completed
    setTimeout(() => {
      setIsCollapsed((prev) => !prev);
      isTransitioning.current = false; // Reset the transition flag
    }, transitionDuration);
  };

  return (
    <aside
      className={cn(
        `fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh ${isCollapsed ? 'md:w-14' : 'md:w-[36rem]'
        }`,
        className
      )}
    >
      {/* Overlay in mobile */}
      <div
        onClick={() => setNavOpened(false)}
        className={`absolute inset-0 transition-[opacity] delay-100 duration-${transitionDuration} ${navOpened ? 'h-svh opacity-50' : 'h-0 opacity-0'
          } w-full bg-black md:hidden`}
      />

      <Layout fixed className={navOpened ? 'h-svh' : ''}>
        {/* Header */}
        <Layout.Header
          sticky
          className='z-50 flex justify-between px-4 py-3 shadow-sm md:px-4'
        >
          <div className={`flex items-center ${!isCollapsed ? 'gap-2' : ''}`}>
            <img
              src='/logo_main.png'
              alt='Utah Geological Survey Logo'
              className={`transition-all ${isCollapsed ? 'h-6 w-6' : 'h-8 w-[1.75rem]'}`}
            />
            <div
              className={`flex flex-col justify-end truncate ${isCollapsed ? 'invisible w-0' : 'visible w-auto'
                }`}
            >
              <span className='font-medium'>Geological Hazards Portal</span>
              <span className='text-sm'>Utah Geological Survey</span>
            </div>
          </div>

          {/* Toggle Button in mobile */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            aria-label='Toggle Navigation'
            aria-controls='sidebar-menu'
            aria-expanded={navOpened}
            onClick={handleMenuClick}
          >
            {navOpened ? <IconX /> : <IconMenu2 />}
          </Button>
        </Layout.Header>

        {/* Navigation links */}
        <Nav
          id='sidebar-menu'
          className={`z-40 h-full flex-1 ${navOpened ? 'max-h-screen' : 'max-h-0 py-0 md:max-h-screen md:py-2'
            }`}
          closeNav={() => setNavOpened(!navOpened)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          links={sidelinks}
        />

        {/* Scrollbar width toggle button */}
        <Button
          onClick={() => setIsCollapsed((prev) => !prev)}
          size='icon'
          variant='outline'
          className='absolute -right-5 top-1/2 z-50 hidden rounded-full md:inline-flex'
        >
          <IconChevronsLeft
            stroke={1.5}
            className={`h-5 w-5 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </Button>
      </Layout>
    </aside>
  );
}
