import { useSidebar } from '@/hooks/use-sidebar'

export default function useCheckActiveNav() {
  const { currentContent } = useSidebar()

  const checkActiveNav = (nav: string) => {
    if (!currentContent) return false

    return currentContent.title === nav
  }

  return { checkActiveNav }
}
