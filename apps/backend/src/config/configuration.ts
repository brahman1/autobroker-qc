export default () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;
  const useMockStripe = process.env.USE_MOCK_STRIPE !== 'false';

  if (isProduction && !jwtSecret) {
    throw new Error('JWT_SECRET est obligatoire en production');
  }
  if (isProduction && !useMockStripe && (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) {
    throw new Error('Les secrets Stripe sont obligatoires en production');
  }

  return {
  port: parseInt(process.env.APP_PORT, 10) || 3001,
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  jwt: {
    secret: jwtSecret || 'super-secret-key-pour-le-developpement',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock',
    useMock: useMockStripe,
    depositAmountCents: parseInt(process.env.DEPOSIT_AMOUNT_CENTS || '60000', 10),
  },
  sftp: {
    host: process.env.SFTP_HOST || '', port: parseInt(process.env.SFTP_PORT || '22', 10), username: process.env.SFTP_USERNAME || '', password: process.env.SFTP_PASSWORD || '', remotePath: process.env.SFTP_REMOTE_PATH || '',
  },
  };
};
