import { LayerUrlProvider } from '@/context/layer-url-provider';
import { MapProvider } from '@/context/map-provider';
import { SidebarProvider } from '@/context/sidebar-provider';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

const mapSearchSchema = z.object({
    zoom: z.coerce.number().optional().default(7),
    lat: z.coerce.number().optional().default(39.5),
    lon: z.coerce.number().optional().default(-112),
    filters: z.record(z.string()).optional(),
    tab: z.string().optional().default('info'),
    sidebar_collapsed: z.coerce.boolean().optional().default(false),
    coordinate_format: z.enum(['dd', 'dms']).optional(),
    layers: z.preprocess((val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return undefined; }
        }
        return val;
    }, z.object({
        selected: z.array(z.string()).optional(),
        hidden: z.array(z.string()).optional(),
    }).optional())
}).strip()

export type MapSearch = z.infer<typeof mapSearchSchema>

export const Route = createFileRoute('/_map')({
    validateSearch: mapSearchSchema.parse,
    component: () => (
        <LayerUrlProvider>
            <SidebarProvider>
                <MapProvider>
                    <Outlet />
                </MapProvider>
            </SidebarProvider>
        </LayerUrlProvider>
    ),
})