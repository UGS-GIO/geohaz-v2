import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    // You can add any custom props here if needed
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
    ({ className, src, alt, width, height, ...props }, ref) => {
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState(false);

        // This handler is called when the image successfully loads
        const handleLoad = () => {
            setIsLoading(false);
            setError(false);
        };

        // This handler is called if the image fails to load
        const handleError = () => {
            setIsLoading(false);
            setError(true);
        };

        // Use an effect to reset loading state if the src changes
        React.useEffect(() => {
            setIsLoading(true);
            setError(false);
        }, [src]);

        // If there's an error, you can render a placeholder or nothing
        if (error) {
            return (
                <div
                    ref={ref as React.ForwardedRef<HTMLDivElement>}
                    className={cn(
                        'flex items-center justify-center bg-muted text-muted-foreground',
                        className
                    )}
                    style={{ width, height }}
                >
                    <p>!</p>
                </div>
            );
        }

        return (
            <div
                className="relative overflow-hidden"
                style={{ width, height }} // Reserve space to prevent layout shift
            >
                {/* The Skeleton placeholder */}
                {isLoading && (
                    <Skeleton className="absolute inset-0 h-full w-full" />
                )}

                {/* The actual image tag */}
                <img
                    ref={ref}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={cn(
                        'transition-opacity duration-300',
                        isLoading ? 'opacity-0' : 'opacity-100',
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
Image.displayName = 'Image';

export { Image };