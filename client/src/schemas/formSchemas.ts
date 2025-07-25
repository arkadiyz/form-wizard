import { z } from 'zod';

// Custom validation functions
const validateIsraeliPhone = (phone: string): boolean => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Check if it's exactly 10 digits and starts with Israeli prefix
  return digits.length === 10 && /^(050|051|052|053|054|055|056|057|058|059)/.test(digits);
};

const validateStrongEmail = (email: string): boolean => {
  // More comprehensive email validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

const validateNameLength = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

// Enhanced Personal Info Schema
export const PersonalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, '🙋‍♀️ We need to know what to call you!')
    .refine(validateNameLength, 'Name must be between 2-50 characters')
    .regex(
      /^[A-Za-z\s'-]+$/,
      '📝 Please use English letters only (A-Z, spaces, hyphens, apostrophes)',
    )
    .transform((str) => str.trim())
    .refine((name) => !name.includes('  '), 'Please avoid multiple spaces'),

  lastName: z
    .string()
    .min(1, '👥 Last name is required')
    .refine(validateNameLength, 'Last name must be between 2-50 characters')
    .regex(
      /^[A-Za-z\s'-]+$/,
      '📝 Please use English letters only (A-Z, spaces, hyphens, apostrophes)',
    )
    .transform((str) => str.trim())
    .refine((name) => !name.includes('  '), 'Please avoid multiple spaces'),

  phone: z
    .string()
    .min(1, '📱 We need a way to contact you!')
    .refine(validateIsraeliPhone, '📞 Please enter a valid Israeli mobile number (050-1234567)')
    .transform((phone) => {
      // Normalize phone format
      const digits = phone.replace(/\D/g, '');
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }),

  email: z
    .string()
    .min(1, '📧 Email address is required')
    .max(254, 'Email address is too long')
    .refine(validateStrongEmail, '✉️ Please enter a valid email address')
    .transform((email) => email.toLowerCase().trim())
    .refine((email) => {
      // Block common temporary email domains
      const tempDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
      return !tempDomains.some((domain) => email.endsWith(domain));
    }, 'Please use a permanent email address'),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Enhanced Job Interest Schema
export const JobInterestSchema = z.object({
  categoryId: z.string().min(1, '🎯 Please select a job category that interests you!'),

  roleIds: z
    .array(z.string())
    .min(1, '💼 Please select at least one job role!')
    .max(5, 'Please select no more than 5 job roles to focus your search'),

  locationId: z.string().min(1, "📍 Please tell us where you'd like to work!"),

  skills: z
    .array(z.string())
    .min(1, '⚡ Please add at least one skill!')
    .max(10, 'Please select up to 10 most relevant skills')
    .refine((skills) => {
      // Ensure no duplicate skills
      return new Set(skills).size === skills.length;
    }, 'Please remove duplicate skills'),

  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'expert']).optional(),

  salaryExpectation: z
    .number()
    .min(0, 'Salary cannot be negative')
    .max(100000, 'Please enter a realistic salary expectation')
    .optional(),
});

export type JobInterest = z.infer<typeof JobInterestSchema>;

// Enhanced Notification Schema
export const NotificationSchema = z
  .object({
    email: z.boolean().default(true),
    phone: z.boolean().default(false),
    call: z.boolean().default(false),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // At least one notification method must be enabled
      return Object.values(data).some((value) => value === true);
    },
    {
      message: '📲 Please enable at least one notification method to stay updated!',
      path: ['email'], // Show error on email field
    },
  );

export type NotificationSettings = z.infer<typeof NotificationSchema>;

// Complete Form Schema
export const CompleteFormSchema = z.object({
  personalInfo: PersonalInfoSchema,
  jobInterest: JobInterestSchema,
  notifications: NotificationSchema,
});

export type CompleteFormData = z.infer<typeof CompleteFormSchema>;

// Validation utilities
export const validateStep = (step: 'personal' | 'job' | 'notifications', data: unknown) => {
  switch (step) {
    case 'personal':
      return PersonalInfoSchema.safeParse(data);
    case 'job':
      return JobInterestSchema.safeParse(data);
    case 'notifications':
      return NotificationSchema.safeParse(data);
    default:
      return { success: false, error: { issues: [{ message: 'Invalid step' }] } };
  }
};

// Form completion validation
export const validateCompleteForm = (data: unknown) => {
  return CompleteFormSchema.safeParse(data);
};
