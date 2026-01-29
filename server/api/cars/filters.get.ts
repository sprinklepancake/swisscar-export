// server/api/cars/filters.get.ts
import { Car } from '~/server/database/models'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    // Get all active cars
    const cars = await Car.findAll({
      where: { status: 'active' },
      attributes: [
        'make', 'model', 'fuelType', 'transmission', 'bodyType', 
        'condition', 'driveType', 'sellerType', 'colorExterior', 
        'colorInterior', 'doors', 'seats', 'cylinders', 'equipment',
        'canton', 'year', 'price', 'withWarranty', 'validInspection',
        'hasAccident'
      ]
    })
    
    // Extract unique values
    const makes = [...new Set(cars.map(car => car.make).filter(Boolean))].sort()
    
    // Create make-model relationships
    const makeModels: Record<string, string[]> = {}
    cars.forEach(car => {
      if (car.make && car.model) {
        if (!makeModels[car.make]) {
          makeModels[car.make] = []
        }
        if (!makeModels[car.make].includes(car.model)) {
          makeModels[car.make].push(car.model)
        }
      }
    })
    
    // Sort models alphabetically for each make
    Object.keys(makeModels).forEach(make => {
      makeModels[make].sort()
    })
    
    // Get filter options with counts
    const getOptionsWithCounts = (field: string, labelTransformer?: (val: string) => string) => {
      const counts: Record<string, number> = {}
      
      cars.forEach(car => {
        const value = car[field]
        if (value !== null && value !== undefined && value !== '') {
          const key = typeof value === 'string' ? value.toLowerCase() : value
          counts[key] = (counts[key] || 0) + 1
        }
      })
      
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({
          value,
          label: labelTransformer 
            ? labelTransformer(value)
            : typeof value === 'string' 
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : value.toString(),
          count
        }))
    }
    
    // Get array field options (like equipment)
    const getArrayOptionsWithCounts = (field: string) => {
      const counts: Record<string, number> = {}
      
      cars.forEach(car => {
        const items = car[field]
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (item) {
              const key = item.toLowerCase()
              counts[key] = (counts[key] || 0) + 1
            }
          })
        }
      })
      
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([value, count]) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count
        }))
    }
    
    // Get unique values for numeric fields
    const getNumericOptions = (field: string) => {
      const values = [...new Set(cars.map(car => car[field]).filter(val => val !== null && val !== undefined))]
        .sort((a, b) => a - b)
      return values
    }
    
    // Define standard options from Car model
    const driveTypes = [
      { value: 'fwd', label: 'Front-wheel drive' },
      { value: 'rwd', label: 'Rear-wheel drive' },
      { value: 'awd', label: 'All-wheel (4x4)' }
    ]
    
    const sellerTypes = [
      { value: 'private', label: 'Private Seller' },
      { value: 'dealer', label: 'Car Dealer' },
      { value: 'business', label: 'Business' }
    ]
    
    const doorOptions = [2, 3, 4, 5]
    const seatOptions = [2, 4, 5, 7, 8]
    const cylinderOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16]
    
    // Get colors with common names
    const getColorOptions = (field: string) => {
      const colorMap: Record<string, string> = {
        'black': 'Black',
        'white': 'White',
        'silver': 'Silver',
        'gray': 'Gray',
        'grey': 'Grey',
        'blue': 'Blue',
        'red': 'Red',
        'green': 'Green',
        'brown': 'Brown',
        'beige': 'Beige',
        'yellow': 'Yellow',
        'orange': 'Orange',
        'purple': 'Purple',
        'gold': 'Gold',
        'bronze': 'Bronze'
      }
      
      const counts: Record<string, number> = {}
      
      cars.forEach(car => {
        const color = car[field]
        if (color) {
          const colorLower = color.toLowerCase()
          // Try to match with known color names
          const matchedColor = Object.keys(colorMap).find(key => 
            colorLower.includes(key)
          ) || colorLower
          
          const displayName = colorMap[matchedColor] || 
            colorLower.charAt(0).toUpperCase() + colorLower.slice(1)
          
          counts[displayName] = (counts[displayName] || 0) + 1
        }
      })
      
      return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, count]) => ({
          value: label.toLowerCase(),
          label: `${label} (${count})`,
          count
        }))
    }
    
    // Common equipment options
    const equipmentFeatures = [
      { value: 'air_conditioning', label: 'Air Conditioning' },
      { value: 'navigation', label: 'Navigation System' },
      { value: 'parking_sensors', label: 'Parking Sensors' },
      { value: 'rear_camera', label: 'Rear Camera' },
      { value: 'leather_seats', label: 'Leather Seats' },
      { value: 'sunroof', label: 'Sunroof' },
      { value: 'xenon_lights', label: 'Xenon Headlights' },
      { value: 'led_lights', label: 'LED Headlights' },
      { value: 'alloy_wheels', label: 'Alloy Wheels' },
      { value: 'cruise_control', label: 'Cruise Control' },
      { value: 'bluetooth', label: 'Bluetooth' },
      { value: 'android_auto', label: 'Android Auto' },
      { value: 'apple_carplay', label: 'Apple CarPlay' },
      { value: 'heated_seats', label: 'Heated Seats' },
      { value: 'electric_seats', label: 'Electric Seats' },
      { value: 'panorama_roof', label: 'Panorama Roof' },
      { value: 'towbar', label: 'Towbar' },
      { value: 'isofix', label: 'Isofix' }
    ]
    
    // Swiss cantons
    const cantons = [
      'Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 
      'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 
      'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 
      'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 
      'Geneva', 'Jura'
    ]
    
    // Get cantons with counts
    const cantonCounts: Record<string, number> = {}
    cars.forEach(car => {
      if (car.canton) {
        const canton = car.canton
        cantonCounts[canton] = (cantonCounts[canton] || 0) + 1
      }
    })
    
    const cantonOptions = cantons
      .map(canton => ({
        value: canton,
        label: `${canton} (${cantonCounts[canton] || 0})`,
        count: cantonCounts[canton] || 0
      }))
      .filter(option => option.count > 0)
      .sort((a, b) => b.count - a.count)
    
    return {
      makes,
      makeModels,
      fuelTypes: getOptionsWithCounts('fuelType'),
      transmissionTypes: getOptionsWithCounts('transmission'),
      bodyTypes: getOptionsWithCounts('bodyType'),
      conditions: getOptionsWithCounts('condition'),
      driveTypes,
      sellerTypes,
      exteriorColors: getColorOptions('colorExterior'),
      interiorColors: getColorOptions('colorInterior'),
      doorOptions,
      seatOptions,
      cylinderOptions,
      equipmentFeatures,
      cantons: cantonOptions,
      
      // Special boolean filters with counts
      warrantyCount: cars.filter(car => car.withWarranty).length,
      noWarrantyCount: cars.filter(car => !car.withWarranty).length,
      inspectionCount: cars.filter(car => car.validInspection).length,
      noInspectionCount: cars.filter(car => !car.validInspection).length,
      accidentCount: cars.filter(car => car.hasAccident).length,
      noAccidentCount: cars.filter(car => !car.hasAccident).length,
      
      // Year range
      minYear: Math.min(...cars.map(car => car.year).filter(year => year > 0)) || 2000,
      maxYear: Math.max(...cars.map(car => car.year).filter(year => year > 0)) || new Date().getFullYear(),
      
      // Price range
      minPrice: Math.min(...cars.map(car => car.price || 0).filter(price => price > 0)) || 0,
      maxPrice: Math.max(...cars.map(car => car.price || 0).filter(price => price > 0)) || 100000,
      
      // Mileage range (if you need it)
      minMileage: Math.min(...cars.map(car => car.mileage || 0).filter(mileage => mileage > 0)) || 0,
      maxMileage: Math.max(...cars.map(car => car.mileage || 0).filter(mileage => mileage > 0)) || 300000
    }
  } catch (error) {
    console.error('Error fetching filter options:', error)
    
    // Return comprehensive fallback data
    return {
      makes: [],
      makeModels: {},
      fuelTypes: [],
      transmissionTypes: [],
      bodyTypes: [],
      conditions: [],
      driveTypes: [],
      sellerTypes: [],
      exteriorColors: [],
      interiorColors: [],
      doorOptions: [],
      seatOptions: [],
      cylinderOptions: [],
      equipmentFeatures: [],
      cantons: [],
      warrantyCount: 0,
      noWarrantyCount: 0,
      inspectionCount: 0,
      noInspectionCount: 0,
      accidentCount: 0,
      noAccidentCount: 0,
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      minPrice: 0,
      maxPrice: 100000,
      minMileage: 0,
      maxMileage: 300000
    }
  }
})