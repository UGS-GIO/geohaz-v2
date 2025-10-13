import { useState, useEffect, useRef } from 'react'
import { ReportLayout } from './layouts/report-layout'
import { SectionTabs, Section } from './layouts/section-tabs'
import { FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ThemeSwitch from '@/components/theme-switch'
import { Image } from '@/components/ui/image'
import { HAZARDS_REPORT_CONTENT } from '@/routes/_report/-data/hazards-content'
import { MapPlaceholder } from './shared/map-placeholder'
import { LegendCard } from './shared/legend-card'

// Import your query services
import {
    queryUnitsAsync,
    queryHazardUnitTableAsync,
    queryReferenceTableAsync,
    queryIntroTextAsync,
    queryGroupingAsync,
    queryGroupTextAsync,
    queryReportTextTableAsync,
} from '@/pages/hazards/report/report/services/QueryService'
import config from '@/pages/hazards/report/report/config'
import { HeroSection } from '@/components/custom/hero-section'
import { Link } from '@/components/custom/link'
import { useGetPageInfo } from '@/hooks/use-get-page-info'
import { ReportMap } from './shared/report-map'

interface HazardsReportProps {
    polygon: string
}

interface HazardLayer {
    code: string
    name: string
    category: string
    introText: string
    howToUse: string
    units: Array<{
        HazardUnit: string
        UnitName: string
        Description: string
        HowToUse: string
    }>
    references: string[]
}

interface HazardGroup {
    id: string
    name: string
    text: string
    layers: HazardLayer[]
}

export function HazardsReport({ polygon }: HazardsReportProps) {
    const [loading, setLoading] = useState(true)
    const [hazardGroups, setHazardGroups] = useState<HazardGroup[]>([])
    const [reportText, setReportText] = useState<any>({})
    const [activeSection, setActiveSection] = useState('cover')
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
    const { data: pageInfo, isLoading: isInfoLoading } = useGetPageInfo();
    const [groupScreenshots, setGroupScreenshots] = useState<Record<string, string>>({})


    useEffect(() => {
        const loadReportData = async () => {
            setLoading(true)
            try {
                // Query all hazard data
                const allHazardInfos = await Promise.all(
                    config.queries.map((featureClassMap: any) =>
                        queryUnitsAsync(featureClassMap, polygon)
                    )
                )

                const hazardInfos = allHazardInfos.filter(
                    ({ units }: any) => units && units.length > 0
                )

                const flatUnitCodes = Array.from(
                    new Set(
                        hazardInfos.reduce(
                            (prev: string[], { units }: any) => prev.concat(units),
                            []
                        )
                    )
                )

                const [
                    groupings,
                    hazardIntroText,
                    hazardUnitText,
                    hazardReferences,
                    reportTextRows,
                ] = await Promise.all([
                    queryGroupingAsync(flatUnitCodes),
                    queryIntroTextAsync(flatUnitCodes),
                    queryHazardUnitTableAsync(flatUnitCodes),
                    queryReferenceTableAsync(flatUnitCodes),
                    queryReportTextTableAsync(),
                ])

                // Build report text map
                const textMap: any = {}
                reportTextRows.forEach((row: any) => {
                    textMap[row.Section] = row.Text
                })
                setReportText(textMap)

                // Get unique groups
                const uniqueGroups = Array.from(new Set(groupings.map((g: any) => g.HazardGroup)))
                const groupTexts = await queryGroupTextAsync(uniqueGroups)

                // Organize by groups
                const groupMap: { [key: string]: HazardGroup } = {}

                groupTexts.forEach((gt: any) => {
                    groupMap[gt.HazardGroup] = {
                        id: gt.HazardGroup.toLowerCase().replace(/\s+/g, '-'),
                        name: gt.HazardGroup,
                        text: gt.Text || '',
                        layers: []
                    }
                })

                // Group hazards by their group
                groupings.forEach((g: any) => {
                    const intro = hazardIntroText.find((h: any) => h.Hazard === g.HazardCode)
                    // Case-insensitive match for unit codes
                    const units = hazardUnitText.filter((u: any) =>
                        u.HazardUnit.toLowerCase().includes(g.HazardCode.toLowerCase())
                    )
                    const refs = hazardReferences.filter((r: any) => r.Hazard === g.HazardCode)

                    if (groupMap[g.HazardGroup]) {
                        groupMap[g.HazardGroup].layers.push({
                            code: g.HazardCode,
                            name: units[0]?.HazardName || g.HazardCode,
                            category: g.HazardGroup,
                            introText: intro?.Text || '',
                            howToUse: units[0]?.HowToUse || '',
                            units: units.map((u: any) => ({
                                HazardUnit: u.HazardUnit,
                                UnitName: u.UnitName,
                                Description: u.Description,
                                HowToUse: u.HowToUse,
                            })),
                            references: refs.map((r: any) => r.Text)
                        })
                    }
                })

                setHazardGroups(Object.values(groupMap).filter(g => g.layers.length > 0))
            } catch (error) {
                console.error('Error loading report data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (polygon) {
            loadReportData()
        }
    }, [polygon])

    const sections: Section[] = [
        { id: 'cover', label: 'Cover', icon: <FileText className="h-4 w-4" /> },
        { id: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4" /> },
        ...hazardGroups.map(group => ({
            id: group.id,
            label: group.name,
            icon: <AlertTriangle className="h-4 w-4" />
        }))
    ]

    const scrollToSection = (sectionId: string) => {
        const element = sectionRefs.current[sectionId]
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveSection(sectionId)
        }
    }

    useEffect(() => {
        const observers = sections.map(section => {
            const element = sectionRefs.current[section.id]
            if (!element) return null

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveSection(section.id)
                    }
                },
                { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
            )

            observer.observe(element)
            return observer
        })

        return () => {
            observers.forEach(observer => observer?.disconnect())
        }
    }, [hazardGroups])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading report data...</p>
                </div>
            </div>
        )
    }

    return (
        <ReportLayout
            header={
                <div className="flex items-center justify-between w-full px-6 py-1 bg-background">
                    <div className="flex items-center gap-4">
                        <Link to="https://geology.utah.gov/" className="cursor-pointer">
                            <img
                                src='/logo_main.png'
                                alt='Utah Geological Survey Logo'
                                className="h-10 w-auto"
                            />
                        </Link>
                        <div className="flex flex-col">
                            {isInfoLoading ? (
                                <>
                                    <div className="h-5 w-48 bg-muted animate-pulse rounded mb-1" />
                                    <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                                </>
                            ) : (
                                <>
                                    <span className='font-semibold text-lg text-foreground'>{pageInfo?.appTitle}</span>
                                    <span className='text-sm text-muted-foreground'>Utah Geological Survey</span>
                                </>
                            )}
                        </div>
                    </div>
                    <ThemeSwitch />
                </div>
            }
            hero={
                <HeroSection
                    image={<Image src="https://geology.utah.gov/wp-content/uploads/geologic-hazards-banner-alstrom-point-1920px.jpg" alt="Hero" className="w-full h-48 object-cover" />}
                    overlayText="Geological Hazards Report"
                />
            }
            tabs={
                <SectionTabs
                    sections={sections}
                    activeSection={activeSection}
                    onSectionChange={scrollToSection}
                />
            }
            footer={
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                    <span>Utah Geological Survey</span>
                    <span>Generated: {new Date().toLocaleString()}</span>
                </div>
            }
        >
            <div className="space-y-12 max-w-7xl mx-auto">
                {/* Cover Page */}
                <section
                    id="cover"
                    ref={el => sectionRefs.current['cover'] = el}
                    className="min-h-screen flex flex-col justify-center space-y-8"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold">GEOLOGIC HAZARDS MAPPING AND DATA</h1>
                        <h2 className="text-3xl font-semibold">CUSTOM REPORT</h2>
                        <p className="text-lg text-muted-foreground pt-8">
                            Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                    </div>

                    {/* Static intro text */}
                    <div className="prose max-w-none text-sm space-y-4">
                        <p>{HAZARDS_REPORT_CONTENT.coverPageIntro}</p>

                        {/* Map */}
                        <ReportMap
                            title="AOI Overview Map"
                            polygon={polygon}
                            hazardCodes={hazardGroups.flatMap(g => g.layers.map(l => l.code))}
                            height={400}
                        />

                        <p className="text-xs text-muted-foreground italic">{HAZARDS_REPORT_CONTENT.disclaimer}</p>
                    </div>

                    {/* Keep dynamic intro if it exists */}
                    {reportText.Introduction && (
                        <div className="prose max-w-none text-sm">
                            <div dangerouslySetInnerHTML={{ __html: reportText.Introduction }} />
                        </div>
                    )}
                </section>

                {/* Summary Page */}
                <section
                    id="summary"
                    ref={el => sectionRefs.current['summary'] = el}
                    className="space-y-8"
                >
                    <h2 className="text-3xl font-bold border-b-2 pb-2">Report Summary</h2>

                    {/* Map and Summary side-by-side */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map - 1/3 left */}
                        <div className="lg:col-span-1">
                            <ReportMap
                                title="AOI Overview Map"
                                polygon={polygon}
                                hazardCodes={hazardGroups.flatMap(g => g.layers.map(l => l.code))}
                                height={300}
                            />
                        </div>

                        {/* Summary text - 2/3 right */}
                        <div className="lg:col-span-2 space-y-4">
                            {reportText.Top && (
                                <div className="prose max-w-none text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: reportText.Top }} />
                                </div>
                            )}

                            {/* Hazards Table */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Table 1: Mapped Geologic Hazards</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="text-left py-2">Mapped Geologic Hazards</th>
                                                <th className="text-left py-2">Hazard Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hazardGroups.flatMap(group =>
                                                group.layers.flatMap(layer =>
                                                    layer.units.map((unit, idx) => (
                                                        <tr key={`${layer.code}-${idx}`} className="border-b">
                                                            <td className="py-2">{layer.name}</td>
                                                            <td className="py-2">{unit.UnitName}</td>
                                                        </tr>
                                                    ))
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportText.Bottom && (
                        <div className="prose max-w-none text-sm">
                            <div dangerouslySetInnerHTML={{ __html: reportText.Bottom }} />
                        </div>
                    )}
                </section>

                {/* Hazard Group Sections */}
                {hazardGroups.map(group => (
                    <section
                        key={group.id}
                        id={group.id}
                        ref={el => sectionRefs.current[group.id] = el}
                        className="space-y-8 page-break-before"
                    >
                        {/* Group Header */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold border-b-2 pb-2">{group.name}</h2>

                            {/* Group intro text */}
                            {group.text && (
                                <div className="prose max-w-none text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: group.text }} />
                                </div>
                            )}

                            {/* Map + Legend side by side */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <ReportMap
                                        title={`${group.name} Group Map`}
                                        polygon={polygon}
                                        hazardCodes={group.layers.map(l => l.code)}
                                        height={400}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <LegendCard
                                        items={group.layers.map(layer => ({
                                            id: layer.code,
                                            label: layer.name,
                                            color: '#f97316'
                                        }))}
                                    />
                                </div>
                            </div>

                            {/* Summary cards of hazards in this group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.layers.map(layer => (
                                    <Card key={layer.code}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{layer.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {layer.units.map((unit, idx) => (
                                                    <li key={idx}>{unit.UnitName}</li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Individual Layer Sections */}
                        {group.layers.map(layer => (
                            <div key={layer.code} className="space-y-6 pt-8 border-t">
                                <div>
                                    <h3 className="text-2xl font-bold">{group.name}</h3>
                                    <h4 className="text-xl font-semibold text-muted-foreground">{layer.name}</h4>
                                </div>

                                {/* Intro text */}
                                {layer.introText && (
                                    <div className="prose max-w-none text-sm">
                                        <div dangerouslySetInnerHTML={{ __html: layer.introText }} />
                                    </div>
                                )}

                                {/* How to Use */}
                                {layer.howToUse && (
                                    <div className="space-y-2">
                                        <h5 className="font-semibold">How to Use This Map</h5>
                                        <div className="prose max-w-none text-sm">
                                            <div dangerouslySetInnerHTML={{ __html: layer.howToUse }} />
                                        </div>
                                    </div>
                                )}

                                {/* Map + Legend */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2">
                                        <ReportMap
                                            title={`${layer.name} Map`}
                                            polygon={polygon}
                                            hazardCodes={[layer.code]}
                                            height={400}
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <LegendCard
                                            items={layer.units.map((unit, idx) => ({
                                                id: `${layer.code}-${idx}`,
                                                label: unit.UnitName,
                                                description: unit.Description ?
                                                    unit.Description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                                                    : undefined,
                                                color: '#f97316'
                                            }))}
                                            showDescriptions={true}
                                        />
                                    </div>
                                </div>

                                {/* References */}
                                {layer.references.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="font-semibold">References</h5>
                                        <div className="prose max-w-none text-sm space-y-2">
                                            {layer.references.map((ref, idx) => (
                                                <div key={idx} dangerouslySetInnerHTML={{ __html: ref }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                ))}

                {/* Other Resources Section */}
                {reportText.OtherGeologicHazardResources && (
                    <section className="space-y-4 page-break-before">
                        <h2 className="text-3xl font-bold border-b-2 pb-2">OTHER GEOLOGIC HAZARD RESOURCES</h2>
                        <div className="prose max-w-none text-sm">
                            <div dangerouslySetInnerHTML={{ __html: reportText.OtherGeologicHazardResources }} />
                        </div>
                    </section>
                )}
            </div>
        </ReportLayout>
    )
}