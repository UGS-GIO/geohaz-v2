import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface NavSkeletonProps {
    className?: string;
}

export function NavSkeleton({ className }: NavSkeletonProps) {
    return (
        <div className={cn('flex flex-1 overflow-hidden', className)}>
            {/* Skeleton for the Left Icon Bar (Desktop) */}
            <div className='hidden md:flex flex-col items-center gap-4 pt-2 border-r p-2'>
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className='h-10 w-10 rounded' />
                ))}
            </div>

            {/* Skeleton for the Right Content/Links Area */}
            <div className='w-full p-4 md:py-2 md:px-6'>
                <div className='grid gap-5'>
                    {/* Simulate two standard nav links */}
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className='flex items-center gap-3'>
                            <Skeleton className='h-6 w-6 shrink-0 rounded-sm' />
                            <Skeleton className='h-4 w-4/5' />
                        </div>
                    ))}

                    {/* Simulate a dropdown/collapsible section */}
                    <div className='space-y-3 pt-2'>
                        {/* Trigger */}
                        <div className='flex items-center gap-3'>
                            <Skeleton className='h-6 w-6 shrink-0 rounded-sm' />
                            <Skeleton className='h-4 w-full' />
                        </div>
                        {/* Indented sub-links */}
                        <div className='pl-9 space-y-3'>
                            <Skeleton className='h-3 w-11/12' />
                            <Skeleton className='h-3 w-4/5' />
                        </div>
                    </div>

                    {/* Simulate two more standard links */}
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className='flex items-center gap-3 pt-2'>
                            <Skeleton className='h-6 w-6 shrink-0 rounded-sm' />
                            <Skeleton className='h-4 w-3/4' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}