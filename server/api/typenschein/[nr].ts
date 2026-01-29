// frontend/server/api/typenschein/[nr].ts
import fs from 'fs'
import path from 'path'
import readline from 'readline'

// Simple in-memory index
let typenscheinData: Map<string, any> | null = null

async function loadTypenscheinData(): Promise<Map<string, any>> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), '..', 'Typenscheine_Dataset', 'typenscheine_full_data_de_cleaned.json', 'typenscheine_full_data_de_cleaned_v2_fixed.json')
    
    console.log('Loading typenschein data into memory...')
    const dataMap = new Map<string, any>()
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' })
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

    let lineNumber = 0

    rl.on('line', (line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed === '[' || trimmed === ']') {
        lineNumber++
        return
      }
      
      let jsonLine = trimmed
      if (jsonLine.endsWith(',')) jsonLine = jsonLine.slice(0, -1)
      
      try {
        const obj = JSON.parse(jsonLine)
        if (obj.Nr && obj.BaseData_DE) {
          dataMap.set(obj.Nr, {
            Nr: obj.Nr,
            BaseData_DE: obj.BaseData_DE
          })
        }
      } catch (e) {
        // Skip invalid JSON
      }
      
      lineNumber++
      
      if (lineNumber % 10000 === 0) {
        console.log(`Loaded ${lineNumber} lines, ${dataMap.size} typenscheins in memory...`)
      }
    })

    rl.on('close', () => {
      console.log(`Data loaded! ${dataMap.size} typenscheins in memory`)
      resolve(dataMap)
    })

    rl.on('error', reject)
  })
}

export default defineEventHandler(async (event) => {
  const { nr } = event.context.params!
  
  try {
    // Load data on first request
    if (!typenscheinData) {
      typenscheinData = await loadTypenscheinData()
    }

    console.log(`Instant search for Typenschein: ${nr}`)
    
    const result = typenscheinData?.get(nr)
    
    if (!result) {
      console.log(`Typenschein ${nr} not found`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Typenschein not found'
      })
    }

    console.log(`Found Typenschein: ${result.BaseData_DE?.Typenbezeichnung}`)
    
    return result
    
  } catch (error: any) {
    console.error('Error fetching typenschein:', error)
    
    if (error.statusCode === 404) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error: ' + error.message
    })
  }
})