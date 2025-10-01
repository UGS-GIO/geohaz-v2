import Map from '@/pages/hazards';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const hazardsSearchSchema = z.object({});

export const Route = createFileRoute('/_map/hazards/')({
  component: () => <Map />,
  validateSearch: hazardsSearchSchema,
});