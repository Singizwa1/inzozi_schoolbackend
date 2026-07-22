require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

const getPrefix = () => {
  if (nodeEnv === 'test') return 'TEST';
  if (nodeEnv === 'production') return 'PROD';
  return 'DEV';
};

const env = getPrefix();


const development = process.env.DATABASE_URL
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      dialectOptions: { 
        ssl: false 
      },
    }
  : {
      username: process.env[`${env}_USERNAME`] || 'postgres',
      password: process.env[`${env}_PASSWORD`] || '',
      database: process.env[`${env}_DATABASE`] || 'inzozi_db',
      host: process.env[`${env}_HOST`] || 'localhost',
      port: process.env[`${env}_PORT`] ? parseInt(process.env[`${env}_PORT`], 10) : 5432,
      dialect: 'postgres',
      dialectOptions: {},
    };

const test = {
  username: process.env.TEST_USERNAME || 'postgres',
  password: process.env.TEST_PASSWORD || '',
  database: process.env.TEST_DATABASE || 'inzozi_test',
  host: process.env.TEST_HOST || 'localhost',
  port: process.env.TEST_PORT ? parseInt(process.env.TEST_PORT, 10) : 5432,
  dialect: 'postgres',
  dialectOptions: {},
};

const production = process.env.DATABASE_URL
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      dialectOptions: { 
        ssl: { 
          rejectUnauthorized: false 
        } 
      },
    }
  : {
      username: process.env.PROD_USERNAME || 'postgres',
      password: process.env.PROD_PASSWORD || '',
      database: process.env.PROD_DATABASE || 'inzozi_prod',
      host: process.env.PROD_HOST || 'localhost',
      port: process.env.PROD_PORT ? parseInt(process.env.PROD_PORT, 10) : 5432,
      dialect: 'postgres',
      dialectOptions: {},
    };

module.exports = {
  development,
  test,
  production,
};