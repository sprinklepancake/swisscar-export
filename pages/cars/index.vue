<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <!-- Hero Section -->
    <section class="relative py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-red-800 mb-4 text-shadow">
            {{ $t('cars_page.title') }}
          </h1>
          <p class="text-xl text-red-700 max-w-3xl mx-auto">
            {{ $t('cars_page.subtitle') }}
          </p>
        </div>

        <!-- Active Filter Badges -->
        <div v-if="activeFilters.length > 0" class="mb-6">
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="filter in activeFilters" 
              :key="filter.key"
              class="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm flex items-center"
            >
              {{ filter.label }}
              <button @click="removeFilter(filter.key)" class="ml-2 hover:text-red-900 text-lg">×</button>
            </span>
            <button 
              @click="resetFilters" 
              class="text-red-700 hover:text-red-900 text-sm font-medium flex items-center"
            >
              {{ $t('cars_page.reset_filters') }}
            </button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="glass rounded-3xl p-6 mb-8 border border-red-200 shadow-2xl backdrop-blur-lg">
          <!-- Basic Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Make Filter -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('make_label') }}</label>
              <select v-model="filters.make" @change="onMakeChange" class="search-input">
                <option value="">{{ $t('any_make') }}</option>
                <option v-for="make in carMakes" :key="make" :value="make">{{ make }}</option>
              </select>
            </div>
            
            <!-- Model Filter (dependent on make) -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('model_label') }}</label>
              <select v-model="filters.model" :disabled="!filters.make" class="search-input">
                <option value="">{{ $t('any_model') }}</option>
                <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
              </select>
            </div>
            
            <!-- Price Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('price_range_label') }}</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-700 text-sm font-semibold">CHF</span>
                  <input v-model.number="filters.priceMin" type="number" :placeholder="$t('min_price')" 
                        class="search-input pl-10">
                </div>
                <span class="text-red-700 self-center">-</span>
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-700 text-sm font-semibold">CHF</span>
                  <input v-model.number="filters.priceMax" type="number" :placeholder="$t('max_price')" 
                        class="search-input pl-10">
                </div>
              </div>
            </div>
          </div>

          <!-- Second Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Year Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('year_range_label') }}</label>
              <div class="flex gap-2">
                <select v-model="filters.yearMin" class="search-input">
                  <option value="">{{ $t('min_year') }}</option>
                  <option v-for="year in yearOptions" :key="'min-' + year" :value="year">{{ year }}</option>
                </select>
                <span class="text-red-700 self-center">-</span>
                <select v-model="filters.yearMax" class="search-input">
                  <option value="">{{ $t('max_year') }}</option>
                  <option v-for="year in yearOptions" :key="'max-' + year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <!-- Mileage Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('mileage_label') }}</label>
              <div class="flex gap-2">
                <input v-model.number="filters.mileageMin" type="number" :placeholder="$t('min_mileage')" 
                      class="search-input">
                <span class="text-red-700 self-center">-</span>
                <input v-model.number="filters.mileageMax" type="number" :placeholder="$t('max_mileage')" 
                      class="search-input">
              </div>
            </div>

            <!-- Fuel Type Filter -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('fuel_type_label') }}</label>
              <select v-model="filters.fuelType" class="search-input">
                <option value="">{{ $t('any_fuel') }}</option>
                <option v-for="type in fuelTypes" :key="type.value" :value="type.value">
                  {{ type.label }} ({{ getFuelTypeCount(type.value) }})
                </option>
              </select>
            </div>
          </div>

          <!-- Third Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Body Type -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('body_type_label') }}</label>
              <select v-model="filters.bodyType" class="search-input">
                <option value="">{{ $t('any_body_type') }}</option>
                <option v-for="type in bodyTypes" :key="type.value" :value="type.value">
                  {{ type.label }} ({{ getBodyTypeCount(type.value) }})
                </option>
              </select>
            </div>

            <!-- Transmission Type -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('transmission_label') }}</label>
              <select v-model="filters.transmission" class="search-input">
                <option value="">{{ $t('any_transmission') }}</option>
                <option v-for="type in transmissionTypes" :key="type.value" :value="type.value">
                  {{ type.label }} ({{ getTransmissionCount(type.value) }})
                </option>
              </select>
            </div>

            <!-- Drive Type -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('drive_type_label') }}</label>
              <select v-model="filters.driveType" class="search-input">
                <option value="">{{ $t('any_drive_type') }}</option>
                <option v-for="type in driveTypes" :key="type.value" :value="type.value">
                  {{ type.label }} ({{ getDriveTypeCount(type.value) }})
                </option>
              </select>
            </div>
          </div>

          <!-- Fourth Filters Row -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <!-- Power Range -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('power_label') }}</label>
              <div class="flex gap-2">
                <input v-model.number="filters.powerMin" type="number" :placeholder="$t('min_power')" class="search-input">
                <span class="text-red-700 self-center">-</span>
                <input v-model.number="filters.powerMax" type="number" :placeholder="$t('max_power')" class="search-input">
              </div>
            </div>

            <!-- Condition -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('condition_label') }}</label>
              <select v-model="filters.condition" class="search-input">
                <option value="">{{ $t('any_condition') }}</option>
                <option v-for="condition in conditions" :key="condition.value" :value="condition.value">
                  {{ condition.label }} ({{ getConditionCount(condition.value) }})
                </option>
              </select>
            </div>

            <!-- Accident Status -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('accident_status_label') }}</label>
              <select v-model="filters.accidentStatus" class="search-input">
                <option value="">{{ $t('any_status') }}</option>
                <option value="no_accident">{{ $t('no_accident_vehicle') }} ({{ getAccidentCount(false) }})</option>
                <option value="accident">{{ $t('accident_vehicle') }} ({{ getAccidentCount(true) }})</option>
              </select>
            </div>
          </div>

          <!-- Advanced Filters Toggle -->
          <div class="mb-4">
            <button @click="showAdvancedFilters = !showAdvancedFilters" class="text-red-700 hover:text-red-800 text-sm font-medium flex items-center">
              {{ showAdvancedFilters ? $t('hide_advanced_filters') : $t('show_advanced_filters') }}
              <svg class="w-4 h-4 ml-1 transition-transform" :class="{ 'rotate-180': showAdvancedFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <!-- Advanced Filters (Collapsible) -->
          <div v-if="showAdvancedFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-6 bg-red-100/30 rounded-xl border border-red-200">
            <!-- Color -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('exterior_color_label') }}</label>
              <select v-model="filters.colorExterior" class="search-input">
                <option value="">{{ $t('any_color') }}</option>
                <option v-for="color in exteriorColors" :key="color.value" :value="color.value">
                  {{ color.label }} ({{ getExteriorColorCount(color.value) }})
                </option>
              </select>
            </div>

            <!-- Interior Color -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('interior_color_label') }}</label>
              <select v-model="filters.colorInterior" class="search-input">
                <option value="">{{ $t('any_color') }}</option>
                <option v-for="color in interiorColors" :key="color.value" :value="color.value">
                  {{ color.label }} ({{ getInteriorColorCount(color.value) }})
                </option>
              </select>
            </div>

            <!-- Doors -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('doors_label') }}</label>
              <select v-model="filters.doors" class="search-input">
                <option value="">{{ $t('any_doors') }}</option>
                <option v-for="door in doorOptions" :key="door" :value="door">{{ door }} {{ $t('doors') }}</option>
              </select>
            </div>

            <!-- Seats -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('seats_label') }}</label>
              <select v-model="filters.seats" class="search-input">
                <option value="">{{ $t('any_seats') }}</option>
                <option v-for="seat in seatOptions" :key="seat" :value="seat">{{ seat }} {{ $t('seats') }}</option>
              </select>
            </div>

            <!-- Warranty -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('warranty_label') }}</label>
              <select v-model="filters.withWarranty" class="search-input">
                <option value="">{{ $t('any_warranty') }}</option>
                <option value="true">{{ $t('with_warranty') }} ({{ getWarrantyCount(true) }})</option>
                <option value="false">{{ $t('without_warranty') }} ({{ getWarrantyCount(false) }})</option>
              </select>
            </div>

            <!-- Valid Inspection -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('inspection_label') }}</label>
              <select v-model="filters.validInspection" class="search-input">
                <option value="">{{ $t('any_inspection') }}</option>
                <option value="true">{{ $t('valid_inspection') }} ({{ getInspectionCount(true) }})</option>
                <option value="false">{{ $t('no_valid_inspection') }} ({{ getInspectionCount(false) }})</option>
              </select>
            </div>

            <!-- Cylinders -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('cylinders_label') }}</label>
              <select v-model="filters.cylinders" class="search-input">
                <option value="">{{ $t('any_cylinders') }}</option>
                <option v-for="cyl in cylinderOptions" :key="cyl" :value="cyl">{{ cyl }} {{ $t('cylinders') }}</option>
              </select>
            </div>

            <!-- Engine Size -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('engine_size_label') }}</label>
              <input v-model="filters.engineSize" type="text" :placeholder="$t('engine_size_placeholder')" class="search-input">
            </div>

            <!-- Seller Type -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('seller_type_label') }}</label>
              <select v-model="filters.sellerType" class="search-input">
                <option value="">{{ $t('any_seller') }}</option>
                <option v-for="type in sellerTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <!-- Canton -->
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('canton_label') }}</label>
              <select v-model="filters.canton" class="search-input">
                <option value="">{{ $t('any_canton') }}</option>
                <option v-for="canton in cantons" :key="canton" :value="canton">{{ canton }}</option>
              </select>
            </div>

            <!-- Equipment Section -->
            <div class="col-span-full">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('equipment_features_label') }}</label>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-4 bg-white/50 rounded-lg border border-red-200">
                <label v-for="feature in equipmentFeatures" :key="feature.value" class="flex items-center text-sm">
                  <input type="checkbox" v-model="filters.equipment" :value="feature.value" class="mr-2 text-red-600 rounded">
                  {{ $t(`equipment.${feature.value}`) || feature.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div class="text-sm text-red-700">
              {{ $t('cars_page.showing_results', { count: filteredCars.length, total: cars.length }) }}
            </div>
            <div class="flex gap-2">
              <button @click="resetFilters" class="secondary-button">
                {{ $t('reset_filters') }}
              </button>
              <button @click="applyFilters" class="search-button">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                {{ $t('search_button') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Sorting & View Options -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div class="text-red-700">
            {{ $t('cars_page.showing_results', { count: filteredCars.length, total: cars.length }) }}
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-red-700 whitespace-nowrap">{{ $t('cars_page.sort_by') }}</span>
              <select 
                v-model="sortBy" 
                @change="applySorting"
                class="sort-select"
              >
                <option value="date-desc">{{ $t('sort_options.newest_first') }}</option>
                <option value="price-asc">{{ $t('cars_page.sort_options.price_asc') }}</option>
                <option value="price-desc">{{ $t('cars_page.sort_options.price_desc') }}</option>
                <option value="year-desc">{{ $t('cars_page.sort_options.year_desc') }}</option>
                <option value="year-asc">{{ $t('sort_options.oldest_first') }}</option>
                <option value="mileage-asc">{{ $t('cars_page.sort_options.mileage_asc') }}</option>
                <option value="mileage-desc">{{ $t('sort_options.high_mileage_first') }}</option>
                <option value="power-desc">{{ $t('cars_page.sort_options.power_desc') }}</option>
                <option value="power-asc">{{ $t('sort_options.low_power_first') }}</option>
              </select>
            </div>
            
            <!-- View Toggle -->
            <div class="flex bg-red-100 rounded-lg p-1">
              <button @click="viewMode = 'grid'" :class="['view-toggle', { 'active': viewMode === 'grid' }]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button @click="viewMode = 'list'" :class="['view-toggle', { 'active': viewMode === 'list' }]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Car Listings Grid/List -->
        <div :class="['gap-6', viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col']">
          <div v-for="car in paginatedCars" :key="car.id" :class="['car-card group', viewMode === 'list' && 'flex']">
            <!-- Car Image with Status Badge -->
            <div :class="['car-image', viewMode === 'list' && 'w-1/3']">
              <img :src="car.images[0] || '/placeholder-car.jpg'" :alt="`${car.make} ${car.model}`" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent"></div>
              <div class="car-status" :class="getStatusClass(car.status)">
                {{ $t(`status_${car.status}`) }}
              </div>
              <div class="car-badge">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div v-if="car.isFeatured" class="absolute top-4 left-4 bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">
                ⭐ {{ $t('featured') }}
              </div>
              <div v-if="car.exportDocuments" class="absolute top-14 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                📄 {{ $t('export_ready') }}
              </div>
              <div v-if="car.withWarranty" class="absolute top-24 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                🛡️ {{ $t('with_warranty') }}
              </div>
              <div v-if="car.validInspection" class="absolute top-32 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                ✅ {{ $t('valid_inspection') }}
              </div>
            </div>
            
            <!-- Car Details -->
            <div :class="['p-6', viewMode === 'list' && 'w-2/3']">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="text-xl font-bold text-red-900 group-hover:text-red-700 transition-colors duration-200">
                    {{ car.make }} {{ car.model }}
                  </h3>
                  <p class="text-red-700 text-sm">{{ car.year }} • {{ formatNumber(car.mileage) }} km • {{ car.power }} {{ $t('power_ps') }}</p>
                  <p v-if="car.engineSize" class="text-red-600 text-xs">{{ car.engineSize }} • {{ car.cylinders }} {{ $t('cylinders') }}</p>
                </div>
                <span class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                  {{ $t('currency.chf') }} {{ formatNumber(car.price || car.startingPrice) }}
                  <span v-if="car.status === 'auction'" class="block text-sm text-red-600 text-right">{{ $t('starting_price') }}</span>
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-2 mb-4 text-sm text-red-700">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  {{ formatFuelType(car.fuelType) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  {{ formatTransmission(car.transmission) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                  </svg>
                  {{ formatBodyType(car.bodyType) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                  </svg>
                  {{ formatCondition(car.condition) }}
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-red-600 text-sm">{{ formatColor(car.colorExterior) }} • {{ formatDriveType(car.driveType) }} • {{ car.canton }}</p>
                <p v-if="car.sellerType" class="text-red-500 text-xs">{{ formatSellerType(car.sellerType) }}</p>
              </div>
              
              <!-- Equipment Highlights -->
              <div v-if="car.equipment && car.equipment.length > 0" class="mb-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(equip, index) in car.equipment.slice(0, 3)" :key="index" class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    {{ getEquipmentLabel(equip) }}
                  </span>
                  <span v-if="car.equipment.length > 3" class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    +{{ car.equipment.length - 3 }} {{ $t('more') }}
                  </span>
                </div>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-red-600 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ car.city }}, {{ car.canton }}
                </span>
                
                <NuxtLink :to="`/cars/${car.id}`" class="car-button">
                  {{ $t('view_details') }}
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-12">
          <div class="flex space-x-2">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="currentPage = page"
              :class="['page-button', { 'active': currentPage === page }]"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- No Results Message -->
        <div v-if="filteredCars.length === 0" class="text-center py-12">
          <div class="glass p-8 rounded-2xl border border-red-200">
            <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-xl font-bold text-red-800 mb-2">{{ $t('cars_page.no_results_title') }}</h3>
            <p class="text-red-700 max-w-md mx-auto">{{ $t('cars_page.no_results_message') }}</p>
            <button 
              @click="resetFilters"
              class="mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200"
            >
              {{ $t('cars_page.reset_filters') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '#app'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

// SEO Meta
useHead({
  title: t('cars_page.title') || 'Browse Export Cars',
  meta: [
    { 
      name: 'description', 
      content: t('cars_page.description') || 'Browse quality Swiss vehicles at affordable export prices'
    }
  ]
})

// Import the same data structures from CarListingForm
const carMakes = [
  // German
  'Volkswagen', 'Audi', 'Mercedes-Benz', 'BMW', 'Opel', 'Porsche', 'Smart', 'Maybach',
  // Japanese
  'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Lexus', 'Infiniti', 'Acura', 'Daihatsu', 'Isuzu',
  // American
  'Ford', 'Chevrolet', 'Cadillac', 'Jeep', 'Dodge', 'Chrysler', 'Tesla', 'Buick', 'Lincoln', 'GMC', 'Ram',
  // Korean
  'Hyundai', 'Kia', 'Genesis', 'SsangYong',
  // French
  'Renault', 'Peugeot', 'Citroën', 'DS Automobiles',
  // Italian
  'Fiat', 'Alfa Romeo', 'Lancia', 'Ferrari', 'Lamborghini', 'Maserati', 'Pagani',
  // British
  'Land Rover', 'Jaguar', 'Mini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren', 'Lotus', 'MG', 'Caterham',
  // Swedish
  'Volvo', 'Polestar', 'Koenigsegg',
  // Czech
  'Skoda',
  // Spanish
  'Seat', 'Cupra',
  // Chinese
  'BYD', 'Geely', 'Nio', 'XPeng', 'Li Auto', 'Hongqi', 'Chery', 'Great Wall', 'MG', 'Lynk & Co',
  // Other European
  'Dacia', 'Renault Samsung', 'Lada', 'Tatra',
  // Motorcycle brands
  'AB', 'Kawasaki', 'Yamaha', 'KTM', 'Ducati', 'Harley-Davidson', 'BMW Motorrad', 'Triumph', 
  'Aprilia', 'Moto Guzzi', 'Husqvarna', 'Royal Enfield', 'Benelli', 'MV Agusta',
  // ATV/UTV/Snowmobile brands
  'Polaris', 'Can-Am', 'Sea-Doo', 'Ski-Doo', 'Arctic Cat', 'Honda Power Sports', 'Yamaha Motor',
  // Commercial vehicles
  'MAN', 'Scania', 'Volvo Trucks', 'Iveco', 'Mercedes-Benz Trucks', 'DAF', 'Renault Trucks',
  // Other manufacturers
  'Caterpillar', 'John Deere', 'Kubota',
  // Generic fallback
  'Other'
]

const makeModels = {
  // Volkswagen
  'Volkswagen': [
    'Golf', 'Passat', 'Tiguan', 'Polo', 'T-Roc', 'T-Cross', 'Touareg', 'Arteon', 'Touran', 
    'Sharan', 'Caddy', 'Transporter', 'Caravelle', 'California', 'Multivan', 'ID.3', 'ID.4', 
    'ID.5', 'ID.7', 'Amarok', 'Scirocco', 'Beetle', 'Up', 'Fox', 'Lupo', 'Vento', 'Derby', 'Other'
  ],
  // ... (include all the same makeModels from CarListingForm)
  'Other': ['Custom', 'Unknown', 'Vintage', 'Classic', 'Modified', 'Kit Car', 'Other']
}

// Cars data - will be populated from API
const cars = ref([])

// In cars page index.vue - Update onMounted section
onMounted(async () => {
  try {
    const response = await $fetch('/api/cars')
    cars.value = response
  } catch (error) {
    console.error('Failed to fetch cars:', error)
    // Use sample data...
  }

  // Read ALL query parameters from URL
  const query = route.query
  
  if (query.make) filters.value.make = query.make as string
  if (query.model) filters.value.model = query.model as string
  if (query.priceMin) filters.value.priceMin = Number(query.priceMin)
  if (query.priceMax) filters.value.priceMax = Number(query.priceMax)
  if (query.yearMin) filters.value.yearMin = query.yearMin as string
  if (query.yearMax) filters.value.yearMax = query.yearMax as string
  if (query.mileageMin) filters.value.mileageMin = Number(query.mileageMin)
  if (query.mileageMax) filters.value.mileageMax = Number(query.mileageMax)
  if (query.fuelType) filters.value.fuelType = query.fuelType as string
  if (query.transmission) filters.value.transmission = query.transmission as string
  if (query.bodyType) filters.value.bodyType = query.bodyType as string
  if (query.driveType) filters.value.driveType = query.driveType as string
  if (query.condition) filters.value.condition = query.condition as string
  if (query.accidentStatus) filters.value.accidentStatus = query.accidentStatus as string
  if (query.colorExterior) filters.value.colorExterior = query.colorExterior as string
  if (query.colorInterior) filters.value.colorInterior = query.colorInterior as string
  if (query.doors) filters.value.doors = query.doors as string
  if (query.seats) filters.value.seats = query.seats as string
  if (query.cylinders) filters.value.cylinders = query.cylinders as string
  if (query.engineSize) filters.value.engineSize = query.engineSize as string
  if (query.withWarranty) filters.value.withWarranty = query.withWarranty as string
  if (query.validInspection) filters.value.validInspection = query.validInspection as string
  if (query.sellerType) filters.value.sellerType = query.sellerType as string
  if (query.canton) filters.value.canton = query.canton as string
  if (query.equipment) {
    const equipment = query.equipment
    filters.value.equipment = Array.isArray(equipment) ? equipment : [equipment] as string[]
  }
  
  // Apply sorting from URL if present
  if (query.sort) sortBy.value = query.sort as string
  
  // Trigger search automatically when coming from landing page with filters
  if (Object.keys(query).length > 0) {
    applyFilters()
  }
})
// Watch for route changes (if user uses browser back/forward)
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.make) filters.value.make = newQuery.make as string
    if (newQuery.model) filters.value.model = newQuery.model as string
    if (newQuery.priceMin) filters.value.priceMin = Number(newQuery.priceMin)
    if (newQuery.priceMax) filters.value.priceMax = Number(newQuery.priceMax)
    if (newQuery.yearMin) filters.value.yearMin = newQuery.yearMin as string
    if (newQuery.yearMax) filters.value.yearMax = newQuery.yearMax as string
    if (newQuery.fuelType) filters.value.fuelType = newQuery.fuelType as string
    if (newQuery.transmission) filters.value.transmission = newQuery.transmission as string
    if (newQuery.bodyType) filters.value.bodyType = newQuery.bodyType as string
    if (newQuery.condition) filters.value.condition = newQuery.condition as string
    
    if (Object.keys(newQuery).length > 0) {
      applyFilters()
    }
  }
)


// Extended Filters
const filters = ref({
  make: '',
  model: '',
  priceMin: null,
  priceMax: null,
  yearMin: '',
  yearMax: '',
  mileageMin: null,
  mileageMax: null,
  fuelType: '',
  transmission: '',
  bodyType: '',
  driveType: '',
  powerMin: null,
  powerMax: null,
  condition: '',
  accidentStatus: '',
  colorExterior: '',
  colorInterior: '',
  doors: '',
  seats: '',
  cylinders: '',
  engineSize: '',
  withWarranty: '',
  validInspection: '',
  sellerType: '',
  canton: '',
  equipment: [],
  status: '',
  exportDocuments: '',
  isFeatured: ''
})

const sortBy = ref('date-desc')
const currentPage = ref(1)
const itemsPerPage = 6
const showAdvancedFilters = ref(false)
const viewMode = ref('grid')

// Watch for sortBy changes
watch(sortBy, () => {
  console.log('SortBy changed to:', sortBy.value)
  applySorting()
})

// Filter options with counts - matching CarListingForm
const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' }
]

const transmissionTypes = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'semi_automatic', label: 'Semi-Automatic' }
]

const bodyTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'liftback', label: 'Liftback' },
  { value: 'station_wagon', label: 'Station Wagon' },
  { value: 'suv', label: 'SUV / Off-road' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'cabriolet', label: 'Cabriolet' },
  { value: 'roadster', label: 'Roadster' },
  { value: 'targa', label: 'Targa' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'van', label: 'Van' },
  { value: 'mpv', label: 'MPV' },
  { value: 'pickup', label: 'Pick-up Truck' },
  { value: 'compact', label: 'Compact Car' },
  { value: 'subcompact', label: 'Subcompact Car' },
  { value: 'microcar', label: 'Microcar' },
  { value: 'limousine', label: 'Limousine' },
  { value: 'sports_car', label: 'Sports Car' },
  { value: 'supercar', label: 'Supercar' },
  { value: 'hypercar', label: 'Hypercar' },
  { value: 'muscle_car', label: 'Muscle Car' },
  { value: 'hot_hatch', label: 'Hot Hatch' },
  { value: 'gt_car', label: 'Grand Tourer' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'naked_bike', label: 'Naked Bike' },
  { value: 'sport_bike', label: 'Sport Bike' },
  { value: 'cruiser', label: 'Cruiser' },
  { value: 'touring', label: 'Touring Motorcycle' },
  { value: 'adventure', label: 'Adventure Motorcycle' },
  { value: 'dual_sport', label: 'Dual Sport' },
  { value: 'motocross', label: 'Motocross' },
  { value: 'supermoto', label: 'Supermoto' },
  { value: 'cafe_racer', label: 'Café Racer' },
  { value: 'chopper', label: 'Chopper' },
  { value: 'bobber', label: 'Bobber' },
  { value: 'atv', label: 'ATV / Quad' },
  { value: 'utv', label: 'UTV / Side-by-Side' },
  { value: 'snowmobile', label: 'Snowmobile' },
  { value: 'personal_watercraft', label: 'Personal Watercraft' },
  { value: 'jet_ski', label: 'Jet Ski' },
  { value: 'truck', label: 'Truck' },
  { value: 'lorry', label: 'Lorry' },
  { value: 'box_truck', label: 'Box Truck' },
  { value: 'flatbed_truck', label: 'Flatbed Truck' },
  { value: 'dump_truck', label: 'Dump Truck' },
  { value: 'bus', label: 'Bus' },
  { value: 'minibus', label: 'Minibus' },
  { value: 'coach', label: 'Coach' },
  { value: 'tractor', label: 'Tractor' },
  { value: 'construction_vehicle', label: 'Construction Vehicle' },
  { value: 'agricultural_vehicle', label: 'Agricultural Vehicle' },
  { value: 'other', label: 'Other' }
]

const driveTypes = [
  { value: 'fwd', label: 'Front-wheel drive' },
  { value: 'rwd', label: 'Rear-wheel drive' },
  { value: 'awd', label: 'All-wheel (4x4)' }
]

const conditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
]

const exteriorColors = [
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'silver', label: 'Silver' },
  { value: 'gray', label: 'Gray' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'brown', label: 'Brown' }
]

const interiorColors = [
  { value: 'black', label: 'Black' },
  { value: 'beige', label: 'Beige' },
  { value: 'brown', label: 'Brown' },
  { value: 'gray', label: 'Gray' }
]

const doorOptions = [2, 3, 4, 5]
const seatOptions = [2, 4, 5, 7, 8]
const cylinderOptions = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16]

const sellerTypes = [
  { value: 'private', label: 'Private Seller' },
  { value: 'dealer', label: 'Car Dealer' },
  { value: 'business', label: 'Business' }
]

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

const cantons = ['Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura']

// Generate year options (last 30 years)
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let year = currentYear; year >= currentYear - 30; year--) {
    years.push(year)
  }
  return years
})

// Filter models based on selected make
const filteredModels = computed(() => {
  if (!filters.value.make) return []
  return makeModels[filters.value.make as keyof typeof makeModels] || []
})

// Reset model when make changes
const onMakeChange = () => {
  filters.value.model = ''
}

// Apply sorting
// Replace the current applySorting function with this:
const applySorting = () => {
  console.log('Applying sorting:', sortBy.value)
  currentPage.value = 1 // Reset to first page when sorting changes
  
  // Force Vue to recompute filteredCars by triggering a reactive update
  // We do this by reassigning the cars array (creates a new reference)
  cars.value = [...cars.value]
}

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
}

// Reset all filters
const resetFilters = () => {
  filters.value = {
    make: '',
    model: '',
    priceMin: null,
    priceMax: null,
    yearMin: '',
    yearMax: '',
    mileageMin: null,
    mileageMax: null,
    fuelType: '',
    transmission: '',
    bodyType: '',
    driveType: '',
    powerMin: null,
    powerMax: null,
    condition: '',
    accidentStatus: '',
    colorExterior: '',
    colorInterior: '',
    doors: '',
    seats: '',
    cylinders: '',
    engineSize: '',
    withWarranty: '',
    validInspection: '',
    sellerType: '',
    canton: '',
    equipment: [],
    status: '',
    exportDocuments: '',
    isFeatured: ''
  }
  sortBy.value = 'price-asc'
  currentPage.value = 1
  showAdvancedFilters.value = false
}

// Active filters for badges
const activeFilters = computed(() => {
  const active = []
  
  if (filters.value.make) active.push({ key: 'make', label: `Make: ${filters.value.make}` })
  if (filters.value.model) active.push({ key: 'model', label: `Model: ${filters.value.model}` })
  if (filters.value.priceMin) active.push({ key: 'priceMin', label: `Min Price: CHF ${filters.value.priceMin}` })
  if (filters.value.priceMax) active.push({ key: 'priceMax', label: `Max Price: CHF ${filters.value.priceMax}` })
  if (filters.value.yearMin) active.push({ key: 'yearMin', label: `Min Year: ${filters.value.yearMin}` })
  if (filters.value.yearMax) active.push({ key: 'yearMax', label: `Max Year: ${filters.value.yearMax}` })
  if (filters.value.fuelType) active.push({ key: 'fuelType', label: `Fuel: ${formatFuelType(filters.value.fuelType)}` })
  if (filters.value.transmission) active.push({ key: 'transmission', label: `Transmission: ${formatTransmission(filters.value.transmission)}` })
  if (filters.value.bodyType) active.push({ key: 'bodyType', label: `Body: ${formatBodyType(filters.value.bodyType)}` })
  if (filters.value.driveType) active.push({ key: 'driveType', label: `Drive: ${formatDriveType(filters.value.driveType)}` })
  if (filters.value.condition) active.push({ key: 'condition', label: `Condition: ${formatCondition(filters.value.condition)}` })
  if (filters.value.accidentStatus) active.push({ key: 'accidentStatus', label: `Accident: ${filters.value.accidentStatus === 'accident' ? 'Yes' : 'No'}` })
  if (filters.value.equipment.length > 0) active.push({ key: 'equipment', label: `Equipment: ${filters.value.equipment.length} features` })
  if (filters.value.cylinders) active.push({ key: 'cylinders', label: `Cylinders: ${filters.value.cylinders}` })
  if (filters.value.sellerType) active.push({ key: 'sellerType', label: `Seller: ${formatSellerType(filters.value.sellerType)}` })
  if (filters.value.canton) active.push({ key: 'canton', label: `Canton: ${filters.value.canton}` })
  
  return active
})

const removeFilter = (key: string) => {
  if (key === 'equipment') {
    filters.value.equipment = []
  } else {
    filters.value[key] = key.includes('Min') || key.includes('Max') ? null : ''
  }
}

// Count functions for filter options
const getFuelTypeCount = (fuelType: string) => {
  return cars.value.filter(car => car.fuelType === fuelType).length
}

const getBodyTypeCount = (bodyType: string) => {
  return cars.value.filter(car => car.bodyType === bodyType).length
}

const getTransmissionCount = (transmission: string) => {
  return cars.value.filter(car => car.transmission === transmission).length
}

const getDriveTypeCount = (driveType: string) => {
  return cars.value.filter(car => car.driveType === driveType).length
}

const getConditionCount = (condition: string) => {
  return cars.value.filter(car => car.condition === condition).length
}

const getAccidentCount = (hasAccident: boolean) => {
  return cars.value.filter(car => car.hasAccident === hasAccident).length
}

const getExteriorColorCount = (color: string) => {
  return cars.value.filter(car => car.colorExterior === color).length
}

const getInteriorColorCount = (color: string) => {
  return cars.value.filter(car => car.colorInterior === color).length
}

const getWarrantyCount = (withWarranty: boolean) => {
  return cars.value.filter(car => car.withWarranty === withWarranty).length
}

const getInspectionCount = (validInspection: boolean) => {
  return cars.value.filter(car => car.validInspection === validInspection).length
}

const getEquipmentLabel = (equipmentValue: string) => {
  const feature = equipmentFeatures.find(f => f.value === equipmentValue)
  return feature ? feature.label : equipmentValue
}

// Formatting functions
const formatFuelType = (fuelType: string) => {
  const types: Record<string, string> = {
    'petrol': 'Petrol',
    'diesel': 'Diesel',
    'electric': 'Electric',
    'hybrid': 'Hybrid',
    'lpg': 'LPG',
    'cng': 'CNG'
  }
  return types[fuelType] || fuelType
}

const formatTransmission = (transmission: string) => {
  const types: Record<string, string> = {
    'manual': 'Manual',
    'automatic': 'Automatic',
    'semi_automatic': 'Semi-Automatic'
  }
  return types[transmission] || transmission
}

const formatBodyType = (bodyType: string) => {
  const type = bodyTypes.find(t => t.value === bodyType)
  return type ? type.label : bodyType
}

const formatDriveType = (driveType: string) => {
  const types: Record<string, string> = {
    'fwd': 'Front-wheel drive',
    'rwd': 'Rear-wheel drive',
    'awd': 'All-wheel drive'
  }
  return types[driveType] || driveType
}

const formatCondition = (condition: string) => {
  const types: Record<string, string> = {
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  }
  return types[condition] || condition
}

const formatColor = (color: string) => {
  const allColors = [...exteriorColors, ...interiorColors]
  const colorObj = allColors.find(c => c.value === color)
  return colorObj ? colorObj.label : color
}

const formatSellerType = (sellerType: string) => {
  const types: Record<string, string> = {
    'private': 'Private Seller',
    'dealer': 'Car Dealer',
    'business': 'Business'
  }
  return types[sellerType] || sellerType
}

// Computed properties
const filteredCars = computed(() => {
    console.log('🔄 Computing filteredCars. sortBy:', sortBy.value, 'cars count:', cars.value.length)
  let result = [...cars.value]
  
  // Apply filters
  if (filters.value.make) {
    result = result.filter(car => 
      car.make.toLowerCase().includes(filters.value.make.toLowerCase())
    )
  }
  
  if (filters.value.model) {
    result = result.filter(car => {
      const carModel = car.model?.toLowerCase() || ''
      const filterModel = filters.value.model.toLowerCase()
      
      return carModel === filterModel || 
             carModel.includes(filterModel) ||
             normalizeModelName(carModel).includes(normalizeModelName(filterModel))
    })
  }
  
  if (filters.value.priceMin) {
    result = result.filter(car => {
      const carPrice = car.price || car.startingPrice || 0
      return carPrice >= filters.value.priceMin
    })
  }
  
  if (filters.value.priceMax) {
    result = result.filter(car => {
      const carPrice = car.price || car.startingPrice || Infinity
      return carPrice <= filters.value.priceMax
    })
  }
  
  if (filters.value.yearMin) {
    result = result.filter(car => car.year >= parseInt(filters.value.yearMin))
  }
  
  if (filters.value.yearMax) {
    result = result.filter(car => car.year <= parseInt(filters.value.yearMax))
  }
  
  if (filters.value.mileageMin) {
    result = result.filter(car => car.mileage >= filters.value.mileageMin)
  }
  
  if (filters.value.mileageMax) {
    result = result.filter(car => car.mileage <= filters.value.mileageMax)
  }
  
  if (filters.value.fuelType) {
    result = result.filter(car => 
      car.fuelType.toLowerCase() === filters.value.fuelType.toLowerCase()
    )
  }
  
  if (filters.value.transmission) {
    result = result.filter(car => 
      car.transmission.toLowerCase() === filters.value.transmission.toLowerCase()
    )
  }

  if (filters.value.bodyType) {
    result = result.filter(car => 
      car.bodyType.toLowerCase() === filters.value.bodyType.toLowerCase()
    )
  }

  if (filters.value.driveType) {
    result = result.filter(car => 
      car.driveType.toLowerCase() === filters.value.driveType.toLowerCase()
    )
  }

  if (filters.value.powerMin) {
    result = result.filter(car => car.power >= filters.value.powerMin)
  }

  if (filters.value.powerMax) {
    result = result.filter(car => car.power <= filters.value.powerMax)
  }
  
  if (filters.value.condition) {
    result = result.filter(car => 
      car.condition.toLowerCase() === filters.value.condition.toLowerCase()
    )
  }

  if (filters.value.accidentStatus) {
    const hasAccident = filters.value.accidentStatus === 'accident'
    result = result.filter(car => car.hasAccident === hasAccident)
  }

  if (filters.value.colorExterior) {
    result = result.filter(car => 
      car.colorExterior.toLowerCase() === filters.value.colorExterior.toLowerCase()
    )
  }

  if (filters.value.colorInterior) {
    result = result.filter(car => 
      car.colorInterior.toLowerCase() === filters.value.colorInterior.toLowerCase()
    )
  }

  if (filters.value.doors) {
    result = result.filter(car => car.doors === parseInt(filters.value.doors))
  }

  if (filters.value.seats) {
    result = result.filter(car => car.seats === parseInt(filters.value.seats))
  }

  if (filters.value.cylinders) {
    result = result.filter(car => car.cylinders === parseInt(filters.value.cylinders))
  }

  if (filters.value.engineSize) {
    result = result.filter(car => 
      car.engineSize?.toLowerCase().includes(filters.value.engineSize.toLowerCase())
    )
  }

  if (filters.value.withWarranty !== '') {
    const withWarranty = filters.value.withWarranty === 'true'
    result = result.filter(car => car.withWarranty === withWarranty)
  }

  if (filters.value.validInspection !== '') {
    const validInspection = filters.value.validInspection === 'true'
    result = result.filter(car => car.validInspection === validInspection)
  }

  if (filters.value.sellerType) {
    result = result.filter(car => 
      car.sellerType.toLowerCase() === filters.value.sellerType.toLowerCase()
    )
  }

  if (filters.value.canton) {
    result = result.filter(car => 
      car.canton.toLowerCase().includes(filters.value.canton.toLowerCase())
    )
  }

  if (filters.value.equipment.length > 0) {
    result = result.filter(car => 
      filters.value.equipment.every(equip => car.equipment.includes(equip))
    )
  }
  
  if (filters.value.status) {
    result = result.filter(car => 
      car.status.toLowerCase() === filters.value.status.toLowerCase()
    )
  }
  
  if (filters.value.exportDocuments !== '') {
    const exportDocs = filters.value.exportDocuments === 'true'
    result = result.filter(car => car.exportDocuments === exportDocs)
  }
  
  if (filters.value.isFeatured === 'true') {
    result = result.filter(car => car.isFeatured === true)
  }
  
// In the filteredCars computed property, update the switch statement:
switch (sortBy.value) {
  case 'price-asc':
    return result.sort((a, b) => {
      const priceA = a.price || a.startingPrice || 0
      const priceB = b.price || b.startingPrice || 0
      return priceA - priceB
    })
  case 'price-desc':
    return result.sort((a, b) => {
      const priceA = a.price || a.startingPrice || 0
      const priceB = b.price || b.startingPrice || 0
      return priceB - priceA
    })
  case 'year-desc':
    return result.sort((a, b) => b.year - a.year)
  case 'year-asc':
    return result.sort((a, b) => a.year - b.year)
  case 'mileage-asc':
    return result.sort((a, b) => a.mileage - b.mileage)
  case 'mileage-desc':
    return result.sort((a, b) => b.mileage - a.mileage)
  case 'power-desc':
    return result.sort((a, b) => (b.power || 0) - (a.power || 0))
  case 'power-asc':
    return result.sort((a, b) => (a.power || 0) - (b.power || 0))
  case 'date-desc':
    // Assuming higher ID = newer listing
    return result.sort((a, b) => b.id - a.id)
  case 'date-asc':
    return result.sort((a, b) => a.id - b.id)
  default:
    // Default sorting: featured first, then by newest
    return result.sort((a, b) => {
      // Featured listings first
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      // Then by newest
      return b.id - a.id
    })
}
})

const paginatedCars = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCars.value.slice(start, start + itemsPerPage)
})

// Helper method for model name normalization
const normalizeModelName = (modelName) => {
  if (!modelName) return ''
  return modelName
    .replace(/[^a-z0-9]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim()
    .toLowerCase()
}

const totalPages = computed(() => 
  Math.ceil(filteredCars.value.length / itemsPerPage)
)

// Format numbers with thousands separators
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'status-available'
    case 'auction':
      return 'status-reserved'
    case 'sold':
      return 'status-sold'
    default:
      return 'status-available'
  }
}
</script>

<style scoped>
.car-card {
  @apply glass rounded-2xl overflow-hidden border border-red-200 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl;
}

.car-image {
  @apply relative h-48 bg-gradient-to-r from-red-100 to-red-200 overflow-hidden;
}

.car-status {
  @apply absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold;
}

.car-badge {
  @apply absolute bottom-4 left-4 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white;
}

.car-button {
  @apply inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transform hover:scale-105 transition-all duration-200 text-sm;
}

.search-input {
  @apply w-full p-3 rounded-xl bg-white/90 border border-red-300 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200;
}

.search-input:focus {
  @apply bg-white shadow-lg;
}

.search-button {
  @apply px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center whitespace-nowrap;
}

.secondary-button {
  @apply px-6 py-3 bg-white/90 text-red-800 rounded-xl font-semibold hover:bg-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center whitespace-nowrap border border-red-300;
}

.sort-select {
  @apply bg-white/90 border border-red-300 text-red-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm;
  min-width: 180px;
}

.view-toggle {
  @apply p-2 rounded-md text-red-600 hover:text-white transition-colors duration-200;
}

.view-toggle.active {
  @apply bg-red-600 text-white;
}

.page-button {
  @apply w-10 h-10 flex items-center justify-center rounded-lg bg-white/90 border border-red-300 text-red-800 hover:bg-red-600 hover:text-white transition-colors duration-200;
}

.page-button.active {
  @apply bg-gradient-to-r from-red-600 to-red-800 border-transparent text-white;
}

.status-available {
  @apply bg-green-100 text-green-800;
}

.status-reserved {
  @apply bg-yellow-100 text-yellow-800;
}

.status-sold {
  @apply bg-red-100 text-red-800;
}

.glass {
  @apply bg-white/70 backdrop-blur-md border border-red-200;
}

/* Add to both files for consistency */
.search-input {
  @apply w-full p-3 rounded-xl bg-white/90 border border-red-300 text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 backdrop-blur-sm transition-all duration-200;
}

.search-input:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.search-input:focus {
  @apply bg-white shadow-lg;
}

.search-button {
  @apply px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center whitespace-nowrap;
}
</style>