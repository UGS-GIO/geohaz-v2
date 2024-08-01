// import { Link } from 'react-router-dom'
// import { IconChevronDown } from '@tabler/icons-react'
// import { Button, buttonVariants } from './custom/button'
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from './ui/collapsible'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from './ui/tooltip'
// import { cn } from '@/lib/utils'
// import useCheckActiveNav from '@/hooks/use-check-active-nav'
// import { SideLink } from '@/data/sidelinks'
// import { Suspense, lazy, useEffect } from 'react'
// import { useSidebar } from '@/context/sidebar-provider'

// interface NavProps {
//   isCollapsed: boolean
//   links: SideLink[]
//   closeNav: () => void
//   setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
// }

// export default function Nav({
//   links,
//   isCollapsed,
//   setIsCollapsed,
//   closeNav,
// }: NavProps) {
//   const { currentContent, setCurrentContent } = useSidebar()

//   useEffect(() => {
//     if (isCollapsed) {
//       setCurrentContent(null)
//     }
//   }, [isCollapsed])

//   const renderLink = (link: SideLink) => {
//     const key = `${link.componentPath}`

//     if (isCollapsed)
//       return (
//         <NavLinkIcon
//           {...link}
//           key={key}
//           closeNav={closeNav}
//           setCurrentContent={setCurrentContent}
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//         />
//       )

//     if (link.sub)
//       return (
//         <NavLinkDropdown
//           {...link}
//           key={key}
//           closeNav={closeNav}
//           setCurrentContent={setCurrentContent}
//         />
//       )

//     return (
//       <NavLink
//         {...link}
//         key={key}
//         closeNav={closeNav}
//         setCurrentContent={setCurrentContent}
//       />
//     )
//   }

//   const handleBackToMenu = () => {
//     setCurrentContent(null)
//   }

//   const DynamicComponent = currentContent?.componentPath
//     ? lazy(() => import(`${currentContent.componentPath}`))
//     : null

//   return (
//     <div
//       data-collapsed={isCollapsed}
//       className={cn(
//         'group border-b bg-background py-2 transition-[max-height,padding] duration-500 data-[collapsed=true]:py-2 md:border-none',
//         className
//       )}
//     >
//       <TooltipProvider delayDuration={0}>
//         {currentContent ? (
//           <div className="p-4">
//             <Button onClick={handleBackToMenu} variant="outline" className="mb-4">
//               Back to Menu
//             </Button>
//             <div>
//               <Suspense fallback={<div>Loading...</div>}>
//                 {DynamicComponent ? (
//                   <DynamicComponent />
//                 ) : (
//                   <div>No component to load</div>
//                 )}
//               </Suspense>
//             </div>
//           </div>
//         ) : (
//           <nav className='grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
//             {links.map(renderLink)}
//           </nav>
//         )}
//       </TooltipProvider>
//     </div>
//   )
// }

// interface NavLinkProps extends SideLink {
//   subLink?: boolean
//   closeNav: () => void
//   isCollapsed?: boolean
//   setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>
//   setCurrentContent: (content: SideLink) => void
// }

// function NavLink({
//   title,
//   icon,
//   label,
//   componentPath,
//   href,
//   closeNav,
//   subLink = false,
//   setIsCollapsed,
//   setCurrentContent,
// }: NavLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav()

//   const handleClick = () => {
//     if (!href) {
//       setCurrentContent({ title, icon, label, componentPath })
//     }
//   }

//   const linkContent = (
//     <>
//       <div className='mr-2'>{icon}</div>
//       {title}
//       {label && (
//         <div className='ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground'>
//           {label}
//         </div>
//       )}
//     </>
//   )

//   return href ? (
//     <Link
//       to={href}
//       className={cn(
//         buttonVariants({
//           variant: 'ghost',
//           size: 'sm',
//         }),
//         'h-12 justify-start text-wrap rounded-none px-6',
//         subLink && 'h-10 w-full border-l border-l-slate-500 px-2'
//       )}
//       aria-current={checkActiveNav(componentPath) ? 'page' : undefined}
//     >
//       {linkContent}
//     </Link>
//   ) : (
//     <button
//       onClick={handleClick}
//       className={cn(
//         buttonVariants({
//           variant: 'ghost',
//           size: 'sm',
//         }),
//         'h-12 justify-start text-wrap rounded-none px-6',
//         subLink && 'h-10 w-full border-l border-l-slate-500 px-2'
//       )}
//       aria-current={checkActiveNav(componentPath) ? 'page' : undefined}
//     >
//       {linkContent}
//     </button>
//   )
// }

// function NavLinkDropdown({
//   title,
//   icon,
//   label,
//   sub,
//   closeNav,
//   setCurrentContent,
// }: NavLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav()

//   const isChildActive = !!sub?.find((s) => checkActiveNav(s.componentPath))

//   return (
//     <Collapsible defaultOpen={isChildActive}>
//       <CollapsibleTrigger
//         className={cn(
//           buttonVariants({ variant: 'ghost', size: 'sm' }),
//           'group h-12 w-full justify-start rounded-none px-6'
//         )}
//       >
//         <div className='mr-2'>{icon}</div>
//         {title}
//         {label && (
//           <div className='ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground'>
//             {label}
//           </div>
//         )}
//         <span
//           className={cn(
//             'ml-auto transition-all group-data-[state="open"]:-rotate-180'
//           )}
//         >
//           <IconChevronDown stroke={1} />
//         </span>
//       </CollapsibleTrigger>
//       <CollapsibleContent>
//         {sub?.map((item) => (
//           <NavLink
//             key={item.componentPath}
//             {...item}
//             subLink
//             closeNav={closeNav}
//             setCurrentContent={setCurrentContent}
//           />
//         ))}
//       </CollapsibleContent>
//     </Collapsible>
//   )
// }

// function NavLinkIcon({
//   icon,
//   title,
//   componentPath,
//   closeNav,
//   setCurrentContent,
//   isCollapsed,
//   setIsCollapsed,
// }: NavLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav()

//   const handleClick = () => {
//     setIsCollapsed(true)
//     setCurrentContent({ title, icon, componentPath })
//     closeNav()
//   }

//   return (
//     <button
//       onClick={handleClick}
//       className={cn(
//         buttonVariants({
//           variant: 'ghost',
//           size: 'sm',
//         }),
//         'h-12 w-12 justify-center rounded-none'
//       )}
//       aria-current={checkActiveNav(componentPath) ? 'page' : undefined}
//     >
//       {icon}
//     </button>
//   )
// }

// function NavLinkIconDropdown({
//   icon,
//   title,
//   sub,
//   closeNav,
//   setCurrentContent,
//   setIsCollapsed,
//   isCollapsed,
// }: NavLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav()

//   const isChildActive = !!sub?.find((s) => checkActiveNav(s.componentPath))

//   const handleClick = () => {
//     setIsCollapsed(true)
//     setCurrentContent({ title, icon, componentPath: '' })
//     closeNav()
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger
//         asChild
//         className={cn(
//           buttonVariants({
//             variant: 'ghost',
//             size: 'sm',
//           }),
//           'h-12 w-12 justify-center rounded-none'
//         )}
//       >
//         <button
//           onClick={handleClick}
//           aria-current={checkActiveNav(componentPath) ? 'page' : undefined}
//         >
//           {icon}
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent>
//         <DropdownMenuLabel>{title}</DropdownMenuLabel>
//         {sub?.map((item) => (
//           <DropdownMenuItem
//             key={item.componentPath}
//             onClick={() => setCurrentContent(item)}
//           >
//             <div className='mr-2'>{item.icon}</div>
//             {item.title}
//           </DropdownMenuItem>
//         ))}
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={closeNav}>Close</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
