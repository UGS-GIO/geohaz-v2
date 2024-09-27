import { useContext, useEffect, useState } from "react"
import { Link } from "@/components/custom/link"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"
import { MapCoordinates } from "@/pages/dashboard/components/map-coordinates"
import { Switch } from "@/components/ui/switch"
import { useCoordinateFormat } from "@/hooks/use-coordinate-format"

const MapFooter = () => {
    const [format, setFormat] = useState<'DD' | 'DMS'>('DD')
    const { isDecimalDegrees, setIsDecimalDegrees } = useCoordinateFormat()

    useEffect(() => {
        if (isDecimalDegrees) {
            setFormat('DD')
        } else {
            setFormat('DMS')
        }
    }, [isDecimalDegrees])

    const handleOnCheckedChange = (setFormat: React.Dispatch<React.SetStateAction<'DD' | 'DMS'>>) => (checked: boolean) => {
        if (checked) {
            setFormat('DMS')
            setIsDecimalDegrees(false)
        } else {
            setFormat('DD')
            setIsDecimalDegrees(true)
        }
    }

    return (
        <>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Utah Geological Survey</span>
                <div className="h-4 w-px bg-border" aria-hidden="true" />
                <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                        <Link to="#">
                            <Facebook className='stroke-foreground h-5 w-5' />
                            <span className="sr-only">Facebook</span>
                        </Link>
                        <Link to="#">
                            <Twitter className='stroke-foreground h-5 w-5' />
                            <span className="sr-only">Twitter</span>
                        </Link>
                        <Link to="#">
                            <Instagram className='stroke-foreground h-5 w-5' />
                            <span className="sr-only">Instagram</span>
                        </Link>
                        <Link to="#">
                            <Github className='stroke-foreground h-5 w-5' />
                            <span className="sr-only">GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">DD</span>
                <Switch
                    checked={format === 'DMS'}
                    onCheckedChange={handleOnCheckedChange(setFormat)}
                    aria-label="Toggle coordinate format"
                    // Use the primary color for the unchecked state also
                    // This is not an on/off toggle. it toggles between DD (left) and DMS (right)
                    // ossible non-standard use of the switch component
                    className="data-[state=unchecked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">DMS</span>
                <span className="text-sm">
                    <MapCoordinates />
                </span>
            </div>
        </>
    )
}

export { MapFooter }