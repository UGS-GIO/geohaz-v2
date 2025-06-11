import { createLazyFileRoute } from '@tanstack/react-router';
import Report from '@/pages/hazards/report';

export const Route = createLazyFileRoute('/hazards-review/report/$aoi')({
  component: Report
});