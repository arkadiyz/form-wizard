export interface Translations {
  // Steps
  steps: {
    personalInfo: string;
    jobInterest: string;
    notifications: string;
    confirmation: string;
  };

  // Fields
  fields: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };

  // Buttons
  buttons: {
    next: string;
    back: string;
    submit: string;
    clear: string;
  };

  // Validation messages
  validation: {
    required: string;
    email: string;
    phone: string;
    minLength: string;
    englishOnly: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    steps: {
      personalInfo: 'Personal Information',
      jobInterest: 'Job Interest',
      notifications: 'Notifications',
      confirmation: 'Confirmation',
    },
    fields: {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      email: 'Email',
    },
    buttons: {
      next: 'Next',
      back: 'Back',
      submit: 'Submit',
      clear: 'Clear',
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      phone: 'Invalid phone number',
      minLength: 'Minimum {count} characters required',
      englishOnly: 'We suggest using English for internal purposes',
    },
  },
  he: {
    steps: {
      personalInfo: 'מידע אישי',
      jobInterest: 'עניין תעסוקתי',
      notifications: 'התראות',
      confirmation: 'אישור',
    },
    fields: {
      firstName: 'שם פרטי',
      lastName: 'שם משפחה',
      phone: 'טלפון',
      email: 'אימייל',
    },
    buttons: {
      next: 'הבא',
      back: 'חזור',
      submit: 'שלח',
      clear: 'נקה',
    },
    validation: {
      required: 'שדה זה נדרש',
      email: 'אנא הכנס כתובת מייל תקינה',
      phone: 'מספר טלפון לא תקין',
      minLength: 'נדרשים לפחות {count} תווים',
      englishOnly: 'אנו ממליצים להשתמש באנגלית למטרות פנימיות',
    },
  },
};

export const useTranslation = (locale: string = 'en') => {
  const t = translations[locale] || translations.en;

  const translate = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = t;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    // Simple parameter replacement
    if (params) {
      return value.replace(
        /\{(\w+)\}/g,
        (match, paramKey) => params[paramKey]?.toString() || match,
      );
    }

    return value;
  };

  return { t: translate, translations: t };
};
