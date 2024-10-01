import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import { useSidebar } from '@/hooks/use-sidebar';

export default function AppShell() {
  const { isCollapsed } = useSidebar();
  return (
    <div className='relative h-full overflow-hidden bg-background'>
      <Sidebar />
      <main
        id='content'
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-[36rem]'} h-full`}
      >
        <Outlet />
      </main>
    </div>
  )
}
