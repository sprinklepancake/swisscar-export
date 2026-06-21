// server/api/cars/filters.get.ts - OPTIMIZED VERSION
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseAdmin()
    
    // Use DISTINCT queries instead of fetching all cars - MUCH FASTER
    const [makesData, fuelTypesData, transmissionsData, conditionsData, cantonsData] = await Promise.all([
      // Get distinct makes with counts
      supabase.rpc('get_distinct_makes', { table_name: 'cars' }),
      supabase.rpc('get_distinct_values', { table_name: 'cars', column_name: 'fuel_type' }),
      supabase.rpc('get_distinct_values', { table_name: 'cars', column_name: 'transmission' }),
      supabase.rpc('get_distinct_values', { table_name: 'cars', column_name: 'condition' }),
      supabase.rpc('get_distinct_values', { table_name: 'cars', column_name: 'canton' }),
    ])
    
    // Fallback to direct queries if RPC functions don't exist
    const makes = makesData.data || []
    const fuelTypes = fuelTypesData.data || []
    const transmissions = transmissionsData.data || []
    const conditions = conditionsData.data || []
    const cantons = cantonsData.data || []
    
    // Get year range
    const yearData = await supabase
      .from('cars')
      .select('year')
      .eq('status', 'active')
      .not('year', 'is', null)
      .order('year', { ascending: false })
    
    const years = [...new Set((yearData.data || []).map((c: any) => c.year))].sort((a, b) => b - a)

    return {
      success: true,
      filters: {
        makes: makes.map((m: any) => ({ value: m.make, label: m.make, count: m.count || 0 })),
        years,
        fuelTypes: fuelTypes.map((f: any) => ({ value: f.fuel_type, label: f.fuel_type, count: f.count || 0 })),
        transmissions: transmissions.map((t: any) => ({ value: t.transmission, label: t.transmission, count: t.count || 0 })),
        conditions: conditions.map((c: any) => ({ value: c.condition, label: c.condition, count: c.count || 0 })),
        driveTypes: [
          { value: 'fwd', label: 'Front-wheel drive' },
          { value: 'rwd', label: 'Rear-wheel drive' },
          { value: 'awd', label: 'All-wheel (4x4)' },
        ],
        cantons: cantons.map((c: any) => ({ value: c.canton, label: c.canton, count: c.count || 0 })),
        listingTypes: [
          { value: 'normal', label: 'Fixed Price' },
          { value: 'auction', label: 'Auction' },
        ],
        equipment: [], // Can be added later if needed
      },
    }
  } catch (error: any) {
    console.error('Error fetching filters:', error)
    // Return cached/static fallback on error
    return { 
      success: false, 
      error: 'Failed to fetch filters', 
      filters: {
        makes: [],
        years: [],
        fuelTypes: [],
        transmissions: [],
        conditions: [],
        driveTypes: [],
        cantons: [],
        listingTypes: [],
        equipment: [],
      }
    }
  }
})
