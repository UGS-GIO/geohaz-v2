import { createLazyFileRoute } from '@tanstack/react-router'
import { Layout } from '@/components/custom/layout';
import { HeroSection } from '@/components/custom/hero-section';
import { Image } from '@/components/ui/image';
import { MapFooter } from '@/components/custom/map/map-footer';

export const Route = createLazyFileRoute('/hazards/report/newreport/')({
  component: ReportSummaryPage,
})
function ReportSummaryPage() {

  const footerContent = (
    <MapFooter />
  );

  return (
    <Layout>
      <Layout.Header className='p-0 md:px-0' sticky>
        <HeroSection
          image={<Image src="https://geology.utah.gov/wp-content/uploads/geologic-hazards-banner-alstrom-point-1920px.jpg" alt="Hero" className="w-full h-48 object-cover" />}
          logoSrc="../../assets/logo_main.png"
          title="Utah Geological Survey"
          subtitle="Geological Hazards Portal"
          overlayText="Geological Hazards Report"
        />
      </Layout.Header>

      <Layout.Body>
        {/*
          The body is the main scrollable area.
          You can place any content here. For this example, we map over the report data.
        */}
        {/* TODO: Add the report summary content here. Incorporate loaderdata */}
      </Layout.Body>

      <Layout.Footer dynamicContent={footerContent} />
    </Layout>
  )
}