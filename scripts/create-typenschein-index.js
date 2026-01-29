// frontend/scripts/create-typenschein-index.js
import { createTypenscheinIndex } from '../server/utils/create-typenschein-index.js'

async function run() {
  try {
    console.log('Starting typenschein index creation...')
    await createTypenscheinIndex()
    console.log('Index creation completed successfully!')
  } catch (error) {
    console.error('Index creation failed:', error)
    process.exit(1)
  }
}

run()