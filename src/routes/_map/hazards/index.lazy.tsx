import { createLazyFileRoute } from '@tanstack/react-router';
import Map from '@/pages/hazards';

export const Route = createLazyFileRoute('/_map/hazards/')({
  component: () => <Map />,
});