// server/api/cars/filters.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseAdmin()

    const { data: cars, error } = await supabase
      .from('cars')
      .select('make, model, year, fuel_type, transmission, condition, drive_type, canton, city, listing_type, color_exterior, doors, equipment')
      .eq('status', 'active')

    if (error) throw error

    const allCars = cars || []

    const getOptions = (field: string, labelTransformer?: (v: string) => string) => {
      const counts: Record<string, number> = {}
      allCars.forEach((car: any) => {
        const value = car[field]
        if (value !== null && value !== undefined && value !== '') {
          const key = typeof value === 'string' ? value.toLowerCase() : String(value)
          counts[key] = (counts[key] || 0) + 1
        }
      })
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({
          value,
          label: labelTransformer
            ? labelTransformer(value)
            : value.charAt(0).toUpperCase() + value.slice(1),
          count,
        }))
    }

    const getArrayOptions = (field: string) => {
      const counts: Record<string, number> = {}
      allCars.forEach((car: any) => {
        const items = car[field]
        if (Array.isArray(items)) {
          items.forEach((item: string) => {
            if (item) {
              const key = item.toLowerCase()
              counts[key] = (counts[key] || 0) + 1
            }
          })
        }
      })
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1), count }))
    }

    const makes = getOptions('make')
    const years = [...new Set(allCars.map((c: any) => c.year).filter(Boolean))].sort((a, b) => b - a)

    return {
      success: true,
      filters: {
        makes,
        years,
        fuelTypes: getOptions('fuel_type'),
        transmissions: getOptions('transmission'),
        conditions: getOptions('condition'),
        driveTypes: [
          { value: 'fwd', label: 'Front-wheel drive' },
          { value: 'rwd', label: 'Rear-wheel drive' },
          { value: 'awd', label: 'All-wheel (4x4)' },
        ],
        cantons: getOptions('canton'),
        listingTypes: [
          { value: 'normal', label: 'Fixed Price' },
          { value: 'auction', label: 'Auction' },
        ],
        equipment: getArrayOptions('equipment'),
      },
    }
  } catch (error: any) {
    console.error('Error fetching filters:', error)
    return { success: false, error: 'Failed to fetch filters', filters: {} }
  }
})
