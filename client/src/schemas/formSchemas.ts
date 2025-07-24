import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'We need to know what to call you ;)')
    .min(2, 'Your name cannot be so short!')
    .regex(/^[A-Za-z]+$/, 'We suggest using English for internal purposes'),
  lastName: z
    .string()
    .min(1, 'We need to know what to call you ;)')
    .min(2, 'Your name cannot be so short!')
    .regex(/^[A-Za-z]+$/, 'We suggest using English for internal purposes'),
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
