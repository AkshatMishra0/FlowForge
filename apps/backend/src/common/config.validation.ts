import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsUrl,
  validateSync,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

enum StorageProvider {
  Local = 'local',
  S3 = 's3',
  Cloudinary = 'cloudinary',
}

enum EmailProvider {
  SendGrid = 'sendgrid',
  SES = 'ses',
  SMTP = 'smtp',
}

export class EnvironmentVariables {
  // Application
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsEnum(LogLevel)
  @IsOptional()
  LOG_LEVEL: LogLevel = LogLevel.Info;

  @IsNumber()
  @Min(1024)
  @Max(65535)
  @IsOptional()
  PORT: number = 4000;

  // Database
  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  @IsOptional()
  DATABASE_POOL_MIN: number = 2;

  @IsNumber()
  @IsOptional()
  DATABASE_POOL_MAX: number = 10;

  @IsNumber()
  @IsOptional()
  DATABASE_CONNECTION_TIMEOUT: number = 30000;

  // Redis
  @IsString()
  REDIS_URL: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  REDIS_DB: number = 0;

  // Cache TTL
  @IsNumber()
  @IsOptional()
  CACHE_TTL_SHORT: number = 300;

  @IsNumber()
  @IsOptional()
  CACHE_TTL_MEDIUM: number = 1800;

  @IsNumber()
  @IsOptional()
  CACHE_TTL_LONG: number = 3600;

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '30d';

  // NextAuth
  @IsUrl()
  NEXTAUTH_URL: string;

  @IsString()
  NEXTAUTH_SECRET: string;

  // Rate Limiting
  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW: number = 900000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX_REQUESTS: number = 100;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_BLOCK_DURATION: number = 3600000;

  // OAuth
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsUrl()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  // WhatsApp
  @IsString()
  @IsOptional()
  WHATSAPP_PHONE_NUMBER_ID?: string;

  @IsString()
  @IsOptional()
  WHATSAPP_ACCESS_TOKEN?: string;

  @IsString()
  @IsOptional()
  WHATSAPP_BUSINESS_ACCOUNT_ID?: string;

  @IsString()
  @IsOptional()
  WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string;

  @IsString()
  @IsOptional()
  WHATSAPP_API_VERSION: string = 'v18.0';

  @IsString()
  @IsOptional()
  WHATSAPP_PHONE_ID?: string;

  @IsString()
  @IsOptional()
  WHATSAPP_TOKEN?: string;

  // Razorpay
  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_SECRET?: string;

  @IsString()
  @IsOptional()
  RAZORPAY_WEBHOOK_SECRET?: string;

 // Email
  @IsEnum(EmailProvider)
  @IsOptional()
  EMAIL_PROVIDER: EmailProvider = EmailProvider.SMTP;

  @IsEmail()
  @IsOptional()
  SMTP_FROM_EMAIL?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM_NAME?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number;

  @IsBoolean()
  @IsOptional()
  SMTP_SECURE?: boolean;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsString()
  @IsOptional()
  SENDGRID_API_KEY?: string;

  @IsEmail()
  @IsOptional()
  SENDGRID_FROM_EMAIL?: string;

  @IsString()
  @IsOptional()
  SENDGRID_FROM_NAME?: string;

  // URLs
  @IsUrl()
  BACKEND_URL: string;

  @IsUrl()
  FRONTEND_URL: string;

  @IsUrl()
  @IsOptional()
  WORKER_URL?: string;

  // Storage
  @IsEnum(StorageProvider)
  @IsOptional()
  STORAGE_PROVIDER: StorageProvider = StorageProvider.Local;

  @IsString()
  @IsOptional()
  UPLOAD_DIR: string = './uploads';

  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number = 10485760;

  @IsString()
  @IsOptional()
  S3_BUCKET_NAME?: string;

  @IsString()
  @IsOptional()
  S3_REGION?: string;

  @IsString()
  @IsOptional()
  S3_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  S3_SECRET_ACCESS_KEY?: string;

  // Monitoring
  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  SENTRY_ENVIRONMENT?: string;

  @IsString()
  @IsOptional()
  GOOGLE_ANALYTICS_ID?: string;

  // Feature Flags
  @IsBoolean()
  @IsOptional()
  ENABLE_AI_FEATURES: boolean = false;

  @IsBoolean()
  @IsOptional()
  ENABLE_WHATSAPP_AUTOMATION: boolean = true;

  @IsBoolean()
  @IsOptional()
  ENABLE_EMAIL_NOTIFICATIONS: boolean = true;

  @IsBoolean()
  @IsOptional()
  ENABLE_SMS_NOTIFICATIONS: boolean = false;

  @IsBoolean()
  @IsOptional()
  ENABLE_ANALYTICS: boolean = true;

  @IsBoolean()
  @IsOptional()
  ENABLE_RATE_LIMITING: boolean = true;

  @IsBoolean()
  @IsOptional()
  ENABLE_SWAGGER: boolean = true;

  @IsBoolean()
  @IsOptional()
  DEBUG: boolean = false;

  @IsBoolean()
  @IsOptional()
  VERBOSE_LOGGING: boolean = false;

  @IsBoolean()
  @IsOptional()
  HOT_RELOAD: boolean = true;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS: boolean = true;

  @IsBoolean()
  @IsOptional()
  ENABLE_COMPRESSION: boolean = true;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      return `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`;
    });
    
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`
    );
  }

  return validatedConfig;
}
