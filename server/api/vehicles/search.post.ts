// server/api/vehicles/search.post.ts
import sqlite3 from 'sqlite3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { marke, typ, treibstoff, page = 1, limit = 20 } = body;

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./vehicle_data.db');
    
    let sql = 'SELECT * FROM vehicles WHERE 1=1';
    const params: any[] = [];

    if (marke) {
      sql += ' AND marke LIKE ?';
      params.push(`%${marke}%`);
    }

    if (typ) {
      sql += ' AND typ LIKE ?';
      params.push(`%${typ}%`);
    }

    if (treibstoff) {
      sql += ' AND treibstoff = ?';
      params.push(treibstoff);
    }

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
      db.close();
      
      if (err) {
        reject(createError({
          statusCode: 500,
          statusMessage: 'Database error'
        }));
      } else {
        resolve({
          vehicles: rows,
          pagination: {
            page,
            limit,
            total: rows.length
          }
        });
      }
    });
  });
});