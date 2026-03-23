import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const DEFAULT_LOCAL_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/careconnect';
const resolveConnectionString = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const useRemoteDb = process.env.USE_REMOTE_DB === 'true';
    if (isProduction) {
        return process.env.DATABASE_URL;
    }
    if (useRemoteDb) {
        return process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || DEFAULT_LOCAL_DATABASE_URL;
    }
    return process.env.LOCAL_DATABASE_URL || DEFAULT_LOCAL_DATABASE_URL;
};
const connectionString = resolveConnectionString();
if (!connectionString) {
    throw new Error('DATABASE_URL is required in production.');
}
const pool = new Pool({
    connectionString,
});
if (process.env.NODE_ENV !== 'production') {
    const dbMode = process.env.USE_REMOTE_DB === 'true' ? 'remote' : 'local';
    console.log(`[db] Development mode: using ${dbMode} database connection`);
}
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
export default pool;
//# sourceMappingURL=database.js.map