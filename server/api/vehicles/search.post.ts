import { getVehicleDatabasePath } from '~/utils/db-path'
import sqlite3 from 'sqlite3';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { query, limit = 50 } = body;

    if (!query || query.trim().length < 2) {
      return { results: [] };
    }

    const dbPath = getVehicleDatabasePath();
    const searchQuery = '%' + query + '%';

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('Database error:', err);
          reject({ error: 'Database connection failed' });
          return;
        }

        const sql = `
          SELECT * FROM vehicle_data 
          WHERE name LIKE ? OR 
                model LIKE ? OR 
                make LIKE ? OR 
                year LIKE ?
          LIMIT ?
        `;

        db.all(sql, [searchQuery, searchQuery, searchQuery, searchQuery, limit], (err, rows) => {
          db.close();
          if (err) {
            console.error('Query error:', err);
            reject({ error: 'Query failed' });
            return;
          }
          resolve({ results: rows });
        });
      });
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return { error: 'Search failed', details: error.message };
  }
});