// scripts/import-typenscheine.mjs
// Run this ONCE from your local machine to import your JSON file into Supabase.
//
// SETUP:
//   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env
//   2. Set TYPENSCHEIN_FILE to the path of your local JSON file
//   3. Run: node scripts/import-typenscheine.mjs
//
// The script reads the JSON in streaming mode to avoid memory issues with large files,
// then batches upserts directly into Supabase - no server needed.

import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config() // load .env

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// ⬇️ SET THIS to the path of your JSON file:
const TYPENSCHEIN_FILE = process.env.TYPENSCHEIN_FILE ||
  path.join(process.cwd(), '..', 'Typenscheine_Dataset', 'typenscheine_full_data_de_cleaned.json', 'typenscheine_full_data_de_cleaned_v2_fixed.json')

const BATCH_SIZE = 500

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

if (!fs.existsSync(TYPENSCHEIN_FILE)) {
  console.error(`❌ File not found: ${TYPENSCHEIN_FILE}`)
  console.error('   Set TYPENSCHEIN_FILE env variable to the correct path.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function upsertBatch(batch) {
  const { error } = await supabase
    .from('typenschein_cache')
    .upsert(batch, { onConflict: 'nr' })
  if (error) throw new Error(error.message)
}

async function main() {
  console.log(`📂 Reading from: ${TYPENSCHEIN_FILE}`)
  console.log(`🔗 Connecting to Supabase: ${SUPABASE_URL}`)

  const fileStream = fs.createReadStream(TYPENSCHEIN_FILE, { encoding: 'utf8' })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let batch = []
  let total = 0
  let skipped = 0

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === '[' || trimmed === ']') continue

    let jsonLine = trimmed
    if (jsonLine.endsWith(',')) jsonLine = jsonLine.slice(0, -1)

    try {
      const obj = JSON.parse(jsonLine)
      if (obj.Nr && obj.BaseData_DE) {
        batch.push({
          nr: obj.Nr,
          data: obj,
          typenbezeichnung: obj.BaseData_DE?.Typenbezeichnung || null,
          fahrzeugart: obj.BaseData_DE?.Fahrzeugart || null,
        })

        if (batch.length >= BATCH_SIZE) {
          await upsertBatch(batch)
          total += batch.length
          batch = []
          if (total % 5000 === 0) console.log(`  ✅ Imported ${total.toLocaleString()} records...`)
        }
      } else {
        skipped++
      }
    } catch {
      skipped++
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    await upsertBatch(batch)
    total += batch.length
  }

  console.log(`\n🎉 Done! Imported ${total.toLocaleString()} records. Skipped ${skipped} invalid lines.`)
}

main().catch(err => {
  console.error('❌ Import failed:', err.message)
  process.exit(1)
})
