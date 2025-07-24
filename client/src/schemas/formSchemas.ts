import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'We need to know what to call you ;)')
    .min(2, 'Your name cannot be so short!')
    .regex(/^[A-Za-z\s]+$/, 'We suggest using English for internal purposes'),
  lastName: z
    .string()
    .min(1, 'We need to know what to call you ;)')
    .min(2, 'Your name cannot be so short!')
    .regex(/^[A-Za-z\s]+$/, 'We suggest using English for internal purposes'),
  phone: z
    .string()
    .min(1, 'We need a way to contact you ;)')
    .regex(/^(050|051|052|053|054|055|056|057|058|059)-?(\d)([0-9]{6})$/, 'Invalid phone number'),
  email: z
    .string()
    .min(1, 'Please provide an email, thanks!')
    .email('Invalid email format')
    .regex(
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,8}(?:\.[a-z]{2})?)$/,
      'Invalid email format',
    ),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Job Interest Schema
export const JobInterestSchema = z.object({
  categoryId: z.string().min(1, 'Please select a job category!'),
  roleIds: z.array(z.string()).min(1, 'Please select a job role!'),
  locationId: z.string().min(1, 'Please select a location!'),
  skills: z.array(z.string()).min(1, 'Please add at least one skill!'),
});

export type JobInterest = z.infer<typeof JobInterestSchema>;

// Notification Schema
export const NotificationSchema = z.object({
  email: z.boolean(),
  phone: z.boolean(),
  call: z.boolean(),
  sms: z.boolean(),
  whatsapp: z.boolean(),
});

export type NotificationSettings = z.infer<typeof NotificationSchema>;
