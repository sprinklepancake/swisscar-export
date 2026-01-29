// frontend/server/api/typenschein/create-index.post.ts
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    const filePath = path.join(process.cwd(), '..', 'Typenscheine_Dataset', 'typenscheine_full_data_de_cleaned.json', 'typenscheine_full_data_de_cleaned_v2_fixed.json')
    const indexPath = path.join(process.cwd(), 'assets', 'typenschein-index.json')
    
    console.log('Source file path:', filePath)
    console.log('Index file path:', indexPath)
    
    // Create assets directory if it doesn't exist
    const assetsDir = path.dirname(indexPath)
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true })
    }
    
    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 500,
        statusMessage: `Source file not found: ${filePath}`
      })
    }

    // Use dynamic import for CommonJS module
    const streamJson = await import('stream-json')
    const streamArray = await import('stream-json/streamers/StreamArray.js')

    return new Promise((resolve, reject) => {
      const index: { [key: string]: any } = {}
      let processedCount = 0
      
      console.log('Starting to create typenschein index...')
      
      const pipeline = fs.createReadStream(filePath)
        .pipe(streamJson.parser())
        .pipe(streamArray.streamArray())
      
      pipeline.on('data', ({ value }) => {
        if (value.Nr && value.BaseData_DE) {
          index[value.Nr] = {
            Typenbezeichnung: value.BaseData_DE?.Typenbezeichnung,
            Fahrzeugart: value.BaseData_DE?.Fahrzeugart,
            Karosserieform: value.BaseData_DE?.Karosserieform,
            Treibstoffcode: value.BaseData_DE?.Treibstoffcode,
            Antrieb: value.BaseData_DE?.Antrieb,
            Zylinder: value.BaseData_DE?.Zylinder,
            Ccm: value.BaseData_DE?.Ccm,
            Kw: value.BaseData_DE?.Kw,
            'Leergewicht kg': value.BaseData_DE?.['Leergewicht kg'],
            'Gesamtgewicht kg': value.BaseData_DE?.['Gesamtgewicht kg'],
            Sitplätze: value.BaseData_DE?.Sitplätze
          }
          processedCount++
          
          if (processedCount % 10000 === 0) {
            console.log(`Processed ${processedCount} records...`)
          }
        }
      })
      
      pipeline.on('end', () => {
        console.log(`Finished processing. Writing index with ${Object.keys(index).length} entries...`)
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
        console.log(`Successfully created index at: ${indexPath}`)
        
        resolve({
          success: true,
          message: 'Index created successfully',
          entries: Object.keys(index).length,
          filePath: indexPath
        })
      })
      
      pipeline.on('error', (error) => {
        console.error('Error creating index:', error)
        reject(createError({
          statusCode: 500,
          statusMessage: 'Error creating index: ' + error.message
        }))
      })
    })
    
  } catch (error: any) {
    console.error('Index creation failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Index creation failed: ' + error.message
    })
  }
})