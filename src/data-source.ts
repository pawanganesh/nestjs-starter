import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfig } from './orm-config';

export const AppDataSource = new DataSource(TypeOrmConfig as DataSourceOptions);
