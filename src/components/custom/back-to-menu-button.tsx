import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/custom/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';



const BackToMenuButton = () => {

    const { setCurrentContent } = useSidebar();
    const handleBackToMenu = () => {
        setCurrentContent(null)
    }
    return (
        <Button onClick={handleBackToMenu} variant="ghost" className={cn('md:hidden justify-start flex-none')}>
            <ArrowLeft />&nbsp;Back to menu
        </Button>
    )
}

export { BackToMenuButton }