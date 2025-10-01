
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Layout } from '@/components/custom/layout'
import { HeroSection } from '@/components/custom/hero-section'
import { Image } from '@/components/ui/image'
import { MapFooter } from '@/components/custom/map/map-footer'
import ReportApp from '@/pages/hazards/report/report/ReportApp'
import { z } from 'zod'

// Empty schema - filters out ALL search params (zoom, lat, lon, tab, sidebar_collapsed, layers)
const reportSearchSchema = z.object({})

export const Route = createFileRoute('/hazards/report/newreport/')({
  component: ReportPage,
  validateSearch: (search) => {
    // Returns empty object, filtering out everything
    return reportSearchSchema.parse(search)
  },
})

type Polygon = {
  rings: number[][][]
  spatialReference: { wkid: number }
}

function ReportPage() {
  const { aoi: aoiParam } = Route.useParams()

  console.log('aoiParam:', aoiParam);


  // Parse AOI from route param (TanStack Router auto-decodes it)
  const aoi = parseAOI(aoiParam)


  const footerContent = <MapFooter />

  return (
    <Layout>
      <Layout.Header className="p-0 md:px-0" sticky>
        <HeroSection
          image={
            <Image
              src="https://geology.utah.gov/wp-content/uploads/geologic-hazards-banner-alstrom-point-1920px.jpg"
              alt="Geological Hazards"
              className="w-full h-48 object-cover"
            />
          }
          logoSrc="../../assets/logo_main.png"
          title="Utah Geological Survey"
          subtitle="Geological Hazards Portal"
          overlayText="Geological Hazards Report"
        />
      </Layout.Header>

      <Layout.Body>
        <Suspense fallback={<ReportLoadingFallback />}>
          {aoi ? (
            <ReportApp polygon={aoi} />
          ) : (
            <InvalidAOIMessage />
          )}
        </Suspense>
      </Layout.Body>

      <Layout.Footer dynamicContent={footerContent} />
    </Layout>
  )
}

function parseAOI(aoiString: string): Polygon | null {
  try {
    // TanStack Router automatically decodes URL params
    const parsed = JSON.parse(aoiString)

    // Validate that we have ONLY spatialReference and rings
    if (
      parsed &&
      Array.isArray(parsed.rings) &&
      parsed.spatialReference?.wkid &&
      parsed.rings.length > 0 &&
      Array.isArray(parsed.rings[0])
    ) {
      // Return only the parts we care about
      return {
        rings: parsed.rings,
        spatialReference: parsed.spatialReference
      }
    }

    console.error('Invalid AOI structure:', parsed)
    return null
  } catch (error) {
    console.error('Failed to parse AOI:', error)
    return null
  }
}

function ReportLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Loading Report...</p>
      </div>
    </div>
  )
}

function InvalidAOIMessage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Invalid Area of Interest
        </h2>
        <p className="text-muted-foreground mb-6">
          The area of interest could not be parsed. Please select an area on the map and try again.
        </p>
        <a
          href="/hazards"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
        >
          Go to Map
        </a>
      </div>
    </div>
  )
}