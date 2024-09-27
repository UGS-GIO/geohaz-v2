import { useState } from "react"
import { Link } from "@/components/custom/link"
import { Facebook, Twitter, Instagram, Github } from "lucide-react"
import { MapCoordinates } from "@/pages/dashboard/components/map-coordinates"
import { Switch } from "@/components/ui/switch"

const MapFooter = () => {
    const [format, setFormat] = useState<'DM' | 'DMS'>('DMS')

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
                <span className="text-sm text-muted-foreground">DM</span>
                <Switch
                    checked={format === 'DMS'}
                    onCheckedChange={(checked) => setFormat(checked ? 'DMS' : 'DM')}
                    aria-label="Toggle coordinate format"
                />
                <span className="text-sm text-muted-foreground">DMS</span>
                <span className="text-sm">
                    <MapCoordinates format={format} />
                </span>
            </div>
        </>
    )
}

export { MapFooter }