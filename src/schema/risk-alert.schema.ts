import { object, string } from 'yup';

export const resolveRiskAlertSchema = object({
  body: object({
    resolutionNotes: string().optional(),
  }),
});
