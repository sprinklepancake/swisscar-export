// server/utils/db-path.ts
// LEGACY FILE - SQLite is no longer used. App runs on Supabase PostgreSQL.
// These stubs prevent import errors from any files that haven't been cleaned up yet.

export function getDatabasePath(filename = 'database.sqlite') {
  console.warn('[db-path] getDatabasePath() called - app uses Supabase, not SQLite')
  return `/tmp/${filename}`
}

export function getVehicleDatabasePath() {
  console.warn('[db-path] getVehicleDatabasePath() called - vehicle data is served from Supabase')
  return '/tmp/vehicle_data.db'
}