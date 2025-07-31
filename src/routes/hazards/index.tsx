import Map from '@/pages/hazards';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const hazardsSearchSchema = z.object({
}).strip();

export const Route = createFileRoute('/hazards/')({
  component: () => <Map />,
  validateSearch: hazardsSearchSchema,
});