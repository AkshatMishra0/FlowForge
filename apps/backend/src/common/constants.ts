export const API_RATE_LIMITS = {
  // WhatsApp API rate limits
  WHATSAPP_MESSAGES_PER_SECOND: 80,
  WHATSAPP_MESSAGES_PER_MINUTE: 1000,
  
  // Razorpay API rate limits
  RAZORPAY_REQUESTS_PER_SECOND: 10,
  
  // Internal API rate limits (per user/IP)
  API_REQUESTS_PER_MINUTE: 100,
  API_REQUESTS_PER_HOUR: 1000,
  API_REQUESTS_PER_DAY: 10000,
};

export const CACHE_TTL = {
  // Cache time-to-live in seconds
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  DASHBOARD: 180, // 3 minutes - for dashboard data
  ANALYTICS: 900, // 15 minutes - for analytics data
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const MESSAGE_TEMPLATES = {
  PAYMENT_REMINDER: {
    SAME_DAY: 'payment_reminder_same_day',
    DAY_1: 'payment_reminder_day_1',
    DAY_7: 'payment_reminder_day_7',
  },
  BOOKING_REMINDER: {
    ONE_DAY_BEFORE: 'booking_reminder_1_day',
  },
  LEAD_FOLLOWUP: {
    INITIAL: 'lead_followup_initial',
    DAY_3: 'lead_followup_day_3',
    DAY_7: 'lead_followup_day_7',
  },
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export const MESSAGE_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export const QUEUE_NAMES = {
  MESSAGES: 'messages',
  PAYMENT_REMINDERS: 'payment-reminders',
  BOOKING_REMINDERS: 'booking-reminders',
  LEAD_FOLLOWUPS: 'lead-followups',
} as const;

export const SCHEDULER_INTERVALS = {
  PAYMENT_REMINDERS_CRON: '0 9 * * *', // Every day at 9 AM
  BOOKING_REMINDERS_CRON: '0 8 * * *', // Every day at 8 AM
  LEAD_FOLLOWUPS_CRON: '0 10 * * *', // Every day at 10 AM
  CLEANUP_OLD_JOBS_CRON: '0 2 * * *', // Every day at 2 AM
} as const;

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  UNAUTHORIZED: 'AUTH003',
  
  // Business logic errors
  INVOICE_NOT_FOUND: 'INV001',
  BOOKING_NOT_FOUND: 'BOOK001',
  LEAD_NOT_FOUND: 'LEAD001',
  CUSTOMER_NOT_FOUND: 'CUST001',
  
  // External API errors
  WHATSAPP_API_ERROR: 'EXT001',
  RAZORPAY_API_ERROR: 'EXT002',
  GOOGLE_CALENDAR_ERROR: 'EXT003',
  
  // Database errors
  DATABASE_ERROR: 'DB001',
  DUPLICATE_ENTRY: 'DB002',
  
  // Validation errors
  VALIDATION_ERROR: 'VAL001',
  INVALID_INPUT: 'VAL002',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: './uploads',
} as const;

export const AI_FEATURES = {
  GPT_5_1_CODEX_MAX: {
    ENABLED: true,
    MODEL_VERSION: '5.1-codex-max',
    MAX_TOKENS: 8192,
    TEMPERATURE: 0.7,
    FEATURES: ['code-generation', 'code-review', 'auto-completion', 'refactoring'],
  },
  ENABLE_FOR_ALL_CLIENTS: true,
} as const;
