import { betterAuth } from 'better-auth';
import { username, openAPI, admin } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({
    host: process.env.HOSTNAME,
    port: 5432,
    database: 'auth',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), openAPI(), admin()],
  hooks: {},
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(','),
});
