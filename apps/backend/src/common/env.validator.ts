import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidator');

export interface EnvironmentVariables {
  // Database
  DATABASE_URL: string;
  
  // Redis
  REDIS_HOST: string;
  REDIS_PORT: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Application
  PORT: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  
  // External APIs
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
];

export function validateEnvironment(): void {
  logger.log('Validating environment variables...');
  
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended variables
  const optionalVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'WHATSAPP_TOKEN',
    'WHATSAPP_PHONE_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  for (const envVar of optionalVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  // Report results
  if (missing.length > 0) {
    logger.error('Missing required environment variables:');
    missing.forEach((v) => logger.error(`  - ${v}`));
    throw new Error('Missing required environment variables');
  }

  if (warnings.length > 0) {
    logger.warn('Missing optional environment variables:');
    warnings.forEach((v) => logger.warn(`  - ${v}`));
    logger.warn('Some features may not work without these variables');
  }

  logger.log('Environment validation successful');
}
