import * as dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV! || 'development';

export const PORT: number = parseInt(process.env.PORT!);

export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;

export const DATABASE: {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
} = {
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT!),
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
};
