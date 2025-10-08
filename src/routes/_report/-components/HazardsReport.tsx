import { useState, useEffect, useRef } from 'react'
import { ReportLayout } from '../-components/layouts/ReportLayout'
import { SectionTabs, Section } from '../-components/layouts/SectionTabs'
import { FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
import ThemeSwitch from '@/components/theme-switch'
import { Link } from '@/components/custom/link'
import { useGetPageInfo } from '@/hooks/use-get-page-info'

interface HazardsReportProps {
    polygon: string
}

interface HazardGroup {
    id: string
    name: string
    hazards: Array<{
        code: string
        name: string
        introText: string
        units: Array<{
            HazardUnit: string
            UnitName: string
            Description: string
            HowToUse: string
        }>
        references: string[]
    }>
}

export function HazardsReport({ polygon }: HazardsReportProps) {
    const [loading, setLoading] = useState(true)
    const [hazardGroups, setHazardGroups] = useState<HazardGroup[]>([])
    const [coverPageData, setCoverPageData] = useState<any>(null)
    const [activeSection, setActiveSection] = useState('cover')
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
    const { data: pageInfo, isLoading: isInfoLoading } = useGetPageInfo();

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

                // Step 1: Load groupings first
                const groupings = await queryGroupingAsync(flatUnitCodes);

                // Step 2: Use groupings to get unique hazard groups, then load everything else
                const [
                    hazardIntroText,
                    hazardUnitText,
                    hazardReferences,
                    reportTextRows,
                    groupTexts,
                ] = await Promise.all([
                    queryIntroTextAsync(flatUnitCodes),
                    queryHazardUnitTableAsync(flatUnitCodes),
                    queryReferenceTableAsync(flatUnitCodes),
                    queryReportTextTableAsync(),
                    queryGroupTextAsync(Array.from(new Set(groupings.map((g: any) => g.HazardGroup)))),
                ]);

                // Organize data by groups
                const groupMap: { [key: string]: HazardGroup } = {}

                groupTexts.forEach((gt: any) => {
                    groupMap[gt.HazardGroup] = {
                        id: gt.HazardGroup.toLowerCase().replace(/\s+/g, '-'),
                        name: gt.HazardGroup,
                        hazards: []
                    }
                })

                // Group hazards by their group
                groupings.forEach((g: any) => {
                    const intro = hazardIntroText.find((h: any) => h.Hazard === g.HazardCode)
                    const units = hazardUnitText.filter((u: any) => u.HazardUnit.startsWith(g.HazardCode))
                    const refs = hazardReferences.filter((r: any) => r.Hazard === g.HazardCode)

                    if (groupMap[g.HazardGroup]) {
                        groupMap[g.HazardGroup].hazards.push({
                            code: g.HazardCode,
                            name: units[0]?.HazardName || g.HazardCode,
                            introText: intro?.Text || '',
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

                setHazardGroups(Object.values(groupMap).filter(g => g.hazards.length > 0))
                setCoverPageData({ reportTextRows, date: new Date() })
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

    // Build sections for tabs
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

    // Intersection observer to update active section on scroll
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
                { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
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
            <div className="flex items-center justify-center h-screen bg-background">
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
                <div className="flex items-center justify-between w-full px-6 py-3 bg-background border-b border-border">
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
                <div className="container mx-auto px-4 py-8 bg-background">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">
                        Geologic Hazards Assessment
                    </h2>
                    <p className="text-muted-foreground">
                        Area of Interest Analysis • Generated {new Date().toLocaleDateString()}
                    </p>
                </div>
            }
            tabs={
                <SectionTabs
                    sections={sections}
                    activeSection={activeSection}
                    onSectionChange={scrollToSection}
                />
            }
            footer={
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground bg-background border-t border-border px-6 py-3">
                    <span>Utah Geological Survey</span>
                    <span>Generated: {new Date().toLocaleString()}</span>
                </div>
            }
        >
            <div className="space-y-12 bg-background">
                {/* Cover Page */}
                <section
                    id="cover"
                    ref={el => sectionRefs.current['cover'] = el}
                    className="min-h-screen flex items-center justify-center"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-bold text-foreground">Geologic Hazards Report</h1>
                        <p className="text-xl text-muted-foreground">
                            Area of Interest Assessment
                        </p>
                        <p className="text-muted-foreground">
                            Generated: {coverPageData?.date.toLocaleDateString()}
                        </p>
                    </div>
                </section>

                {/* Summary Page */}
                <section
                    id="summary"
                    ref={el => sectionRefs.current['summary'] = el}
                    className="space-y-6"
                >
                    <h2 className="text-3xl font-bold border-b border-border pb-2 text-foreground">Summary</h2>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            This report identifies the following hazard groups within your area of interest:
                        </p>
                        <ul className="space-y-2">
                            {hazardGroups.map(group => (
                                <li key={group.id} className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">{group.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        ({group.hazards.length} hazard{group.hazards.length !== 1 ? 's' : ''})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Hazard Group Sections */}
                {hazardGroups.map(group => (
                    <section
                        key={group.id}
                        id={group.id}
                        ref={el => sectionRefs.current[group.id] = el}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-bold border-b border-border pb-2 text-foreground">{group.name}</h2>

                        {group.hazards.map(hazard => (
                            <div key={hazard.code} className="space-y-6">
                                <h3 className="text-2xl font-semibold text-foreground">{hazard.name}</h3>

                                {/* Map Placeholder */}
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-card-foreground">Location Map</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                                            <p className="text-muted-foreground">
                                                Map screenshot for {hazard.name} will be inserted here
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Introduction Text */}
                                {hazard.introText && (
                                    <div className="prose prose-sm max-w-none text-foreground">
                                        <div dangerouslySetInnerHTML={{ __html: hazard.introText }} />
                                    </div>
                                )}

                                {/* Units */}
                                {hazard.units.length > 0 && (
                                    <div className="space-y-4">
                                        {hazard.units.map(unit => (
                                            <Card key={unit.HazardUnit} className="bg-card border-border">
                                                <CardHeader>
                                                    <CardTitle className="text-lg text-card-foreground">{unit.UnitName}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {unit.Description && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-card-foreground">Description</h4>
                                                            <div
                                                                className="prose prose-sm max-w-none text-sm text-card-foreground"
                                                                dangerouslySetInnerHTML={{ __html: unit.Description }}
                                                            />
                                                        </div>
                                                    )}
                                                    {unit.HowToUse && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-card-foreground">How to Use This Information</h4>
                                                            <div
                                                                className="prose prose-sm max-w-none text-sm text-card-foreground"
                                                                dangerouslySetInnerHTML={{ __html: unit.HowToUse }}
                                                            />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {/* References */}
                                {hazard.references.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">References</h4>
                                        <div className="prose prose-sm max-w-none text-sm space-y-2 text-foreground">
                                            {hazard.references.map((ref, idx) => (
                                                <div key={idx} dangerouslySetInnerHTML={{ __html: ref }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </ReportLayout>
    )
}