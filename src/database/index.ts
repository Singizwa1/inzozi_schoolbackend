import config from '../config/config';
import { Sequelize, Options } from 'sequelize';
import { AllModal } from './models';

const nodeEnv = process.env.NODE_ENV || 'development';
// @ts-ignore because config is a CommonJS object
const dbConfig = (config as any)[nodeEnv];  

let sequelizeInstance: Sequelize;

if (dbConfig.use_env_variable && process.env[dbConfig.use_env_variable]) {
  
  sequelizeInstance = new Sequelize(process.env[dbConfig.use_env_variable] as string, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: dbConfig.dialectOptions || {},
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    logging: false,
  });
} else if (dbConfig.url) {

  sequelizeInstance = new Sequelize(dbConfig.url, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: dbConfig.dialectOptions || {},
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    logging: false,
  });
} else {
  
  sequelizeInstance = new Sequelize(
    dbConfig.database!,
    dbConfig.username!,
    dbConfig.password!,
    {
      host: dbConfig.host || 'localhost',
      port: dbConfig.port || 5432,
      dialect: 'postgres',
      dialectOptions: dbConfig.dialectOptions || {},
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      logging: false,
    } as Options
  );
}

// Test connection
sequelizeInstance
  .authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err.message || err));


const models = AllModal(sequelizeInstance);
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

export type DatabaseType = typeof models & { database: Sequelize };
export const Database = { ...models, database: sequelizeInstance };
export const sequelize = sequelizeInstance;
export default sequelizeInstance;