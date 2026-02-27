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
            <button @click="resetFilters" class="text-red-700 hover:text-red-900 text-sm font-medium flex items-center">
              {{ $t('cars_page.reset_filters') }}
            </button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="glass rounded-3xl p-6 mb-8 border border-red-200 shadow-2xl backdrop-blur-lg">
          <!-- Basic Filters Row 1 -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('make_label') }}</label>
              <select v-model="filters.make" @change="onMakeChange" class="search-input">
                <option value="">{{ $t('any_make') }}</option>
                <option v-for="make in carMakes" :key="make" :value="make">{{ make }}</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('model_label') }}</label>
              <select v-model="filters.model" class="search-input" :disabled="!filters.make">
                <option value="">{{ $t('any_model') }}</option>
                <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('price_range_label') }}</label>
              <div class="flex gap-2">
                <input v-model.number="filters.priceMin" type="number" :placeholder="$t('min_price')" class="search-input">
                <span class="text-red-700 self-center">-</span>
                <input v-model.number="filters.priceMax" type="number" :placeholder="$t('max_price')" class="search-input">
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('year_range_label') }}</label>
              <div class="flex gap-2">
                <select v-model="filters.yearMin" class="search-input">
                  <option value="">{{ $t('min_year') }}</option>
                  <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
                </select>
                <span class="text-red-700 self-center">-</span>
                <select v-model="filters.yearMax" class="search-input">
                  <option value="">{{ $t('max_year') }}</option>
                  <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Basic Filters Row 2 -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('mileage_label') }}</label>
              <div class="flex gap-2">
                <input v-model.number="filters.mileageMin" type="number" :placeholder="$t('min_mileage')" class="search-input">
                <span class="text-red-700 self-center">-</span>
                <input v-model.number="filters.mileageMax" type="number" :placeholder="$t('max_mileage')" class="search-input">
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('fuel_type_label') }}</label>
              <select v-model="filters.fuelType" class="search-input">
                <option value="">{{ $t('any_fuel') }}</option>
                <option v-for="fuel in fuelTypes" :key="fuel.value" :value="fuel.value">
                  {{ fuel.label }} ({{ getFuelTypeCount(fuel.value) }})
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('transmission_label') }}</label>
              <select v-model="filters.transmission" class="search-input">
                <option value="">{{ $t('any_transmission') }}</option>
                <option v-for="trans in transmissionTypes" :key="trans.value" :value="trans.value">
                  {{ trans.label }} ({{ getTransmissionCount(trans.value) }})
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('body_type_label') }}</label>
              <select v-model="filters.bodyType" class="search-input">
                <option value="">{{ $t('any_body_type') }}</option>
                <option v-for="body in bodyTypes" :key="body.value" :value="body.value">
                  {{ body.label }} ({{ getBodyTypeCount(body.value) }})
                </option>
              </select>
            </div>
          </div>

          <!-- Basic Filters Row 3 -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('drive_type_label') }}</label>
              <select v-model="filters.driveType" class="search-input">
                <option value="">{{ $t('any_drive_type') }}</option>
                <option v-for="drive in driveTypes" :key="drive.value" :value="drive.value">
                  {{ drive.label }} ({{ getDriveTypeCount(drive.value) }})
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('power_label') }}</label>
              <div class="flex gap-2">
                <input v-model.number="filters.powerMin" type="number" :placeholder="$t('min_power')" class="search-input">
                <span class="text-red-700 self-center">-</span>
                <input v-model.number="filters.powerMax" type="number" :placeholder="$t('max_power')" class="search-input">
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('condition_label') }}</label>
              <select v-model="filters.condition" class="search-input">
                <option value="">{{ $t('any_condition') }}</option>
                <option v-for="condition in conditions" :key="condition.value" :value="condition.value">
                  {{ condition.label }} ({{ getConditionCount(condition.value) }})
                </option>
              </select>
            </div>
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
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('exterior_color_label') }}</label>
              <select v-model="filters.colorExterior" class="search-input">
                <option value="">{{ $t('any_color') }}</option>
                <option v-for="color in exteriorColors" :key="color.value" :value="color.value">
                  {{ color.label }} ({{ getExteriorColorCount(color.value) }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('interior_color_label') }}</label>
              <select v-model="filters.colorInterior" class="search-input">
                <option value="">{{ $t('any_color') }}</option>
                <option v-for="color in interiorColors" :key="color.value" :value="color.value">
                  {{ color.label }} ({{ getInteriorColorCount(color.value) }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('doors_label') }}</label>
              <select v-model="filters.doors" class="search-input">
                <option value="">{{ $t('any_doors') }}</option>
                <option v-for="door in doorOptions" :key="door" :value="door">{{ door }} {{ $t('doors') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('seats_label') }}</label>
              <select v-model="filters.seats" class="search-input">
                <option value="">{{ $t('any_seats') }}</option>
                <option v-for="seat in seatOptions" :key="seat" :value="seat">{{ seat }} {{ $t('seats') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('warranty_label') }}</label>
              <select v-model="filters.withWarranty" class="search-input">
                <option value="">{{ $t('any_warranty') }}</option>
                <option value="true">{{ $t('with_warranty') }} ({{ getWarrantyCount(true) }})</option>
                <option value="false">{{ $t('without_warranty') }} ({{ getWarrantyCount(false) }})</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('inspection_label') }}</label>
              <select v-model="filters.validInspection" class="search-input">
                <option value="">{{ $t('any_inspection') }}</option>
                <option value="true">{{ $t('valid_inspection') }} ({{ getInspectionCount(true) }})</option>
                <option value="false">{{ $t('no_valid_inspection') }} ({{ getInspectionCount(false) }})</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('cylinders_label') }}</label>
              <select v-model="filters.cylinders" class="search-input">
                <option value="">{{ $t('any_cylinders') }}</option>
                <option v-for="cyl in cylinderOptions" :key="cyl" :value="cyl">{{ cyl }} {{ $t('cylinders') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('engine_size_label') }}</label>
              <input v-model="filters.engineSize" type="text" :placeholder="$t('engine_size_placeholder')" class="search-input">
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('seller_type_label') }}</label>
              <select v-model="filters.sellerType" class="search-input">
                <option value="">{{ $t('any_seller') }}</option>
                <option v-for="type in sellerTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('canton_label') }}</label>
              <select v-model="filters.canton" class="search-input">
                <option value="">{{ $t('any_canton') }}</option>
                <option v-for="canton in cantons" :key="canton" :value="canton">{{ canton }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('status_label') }}</label>
              <select v-model="filters.status" class="search-input">
                <option value="">{{ $t('any_status') }}</option>
                <option value="active">{{ $t('status_active') }}</option>
                <option value="auction">{{ $t('status_auction') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('export_docs_label') }}</label>
              <select v-model="filters.exportDocuments" class="search-input">
                <option value="">{{ $t('any_export_docs') }}</option>
                <option value="true">{{ $t('yes') }}</option>
                <option value="false">{{ $t('no') }}</option>
              </select>
            </div>
            <!-- Equipment -->
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
              <button @click="resetFilters" class="secondary-button">{{ $t('reset_filters') }}</button>
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
              <select v-model="sortBy" @change="applySorting" class="sort-select">
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

        <!-- ✅ Car Listings — entire card is a NuxtLink (fully clickable) -->
        <div :class="['gap-6', viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col']">
          <NuxtLink
            v-for="car in paginatedCars"
            :key="car.id"
            :to="`/cars/${car.id}`"
            :class="['car-card group', viewMode === 'list' && 'flex']"
          >
            <!-- Car Image -->
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
              <div v-if="car.isFeatured" class="absolute top-4 left-4 bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold">⭐ {{ $t('featured') }}</div>
              <div v-if="car.exportDocuments" class="absolute top-14 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">📄 {{ $t('export_ready') }}</div>
              <div v-if="car.withWarranty" class="absolute top-24 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">🛡️ {{ $t('with_warranty') }}</div>
              <div v-if="car.validInspection" class="absolute top-32 left-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">✅ {{ $t('valid_inspection') }}</div>
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
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  {{ formatFuelType(car.fuelType) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  {{ formatTransmission(car.transmission) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path></svg>
                  {{ formatBodyType(car.bodyType) }}
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path></svg>
                  {{ formatCondition(car.condition) }}
                </div>
              </div>

              <div class="mb-4">
                <p class="text-red-600 text-sm">{{ formatColor(car.colorExterior) }} • {{ formatDriveType(car.driveType) }} • {{ car.canton }}</p>
                <p v-if="car.sellerType" class="text-red-500 text-xs">{{ formatSellerType(car.sellerType) }}</p>
              </div>

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
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {{ car.city }}, {{ car.canton }}
                </span>
                <!-- ✅ span not NuxtLink — outer card is already the link -->
                <span class="car-button">
                  {{ $t('view_details') }}
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
            </div>
          </NuxtLink>
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

        <!-- No Results -->
        <div v-if="filteredCars.length === 0" class="text-center py-12">
          <div class="glass p-8 rounded-2xl border border-red-200">
            <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-xl font-bold text-red-800 mb-2">{{ $t('cars_page.no_results_title') }}</h3>
            <p class="text-red-700 max-w-md mx-auto">{{ $t('cars_page.no_results_message') }}</p>
            <button @click="resetFilters" class="mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200">
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

useHead({
  title: t('cars_page.title') || 'Browse Export Cars',
  meta: [{ name: 'description', content: t('cars_page.description') || 'Browse quality Swiss vehicles at affordable export prices' }]
})

// ─── Static data ─────────────────────────────────────────────────────────────

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

const makeModels: Record<string, string[]> = {
  'Volkswagen': [
    'Golf', 'Golf GTI', 'Golf R', 'Golf Variant', 'Passat', 'Passat Variant', 'Passat Alltrack',
    'Tiguan', 'Tiguan Allspace', 'Polo', 'T-Roc', 'T-Roc Cabriolet', 'T-Cross', 'Touareg',
    'Arteon', 'Arteon Shooting Brake', 'Touran', 'Sharan', 'Caddy', 'Caddy Maxi',
    'Transporter', 'Caravelle', 'California', 'Multivan', 'Crafter',
    'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz',
    'Amarok', 'Scirocco', 'Beetle', 'Up', 'Fox', 'Lupo', 'Vento', 'Derby',
    'Phaeton', 'Eos', 'CC', 'Other'
  ],
  'Audi': [
    'A1', 'A1 Sportback', 'A2', 'A3', 'A3 Sportback', 'A3 Limousine', 'A3 Cabriolet',
    'A4', 'A4 Avant', 'A4 Allroad', 'A4 Cabriolet',
    'A5', 'A5 Sportback', 'A5 Cabriolet', 'A5 Coupé',
    'A6', 'A6 Avant', 'A6 Allroad', 'A7', 'A7 Sportback', 'A8', 'A8 L',
    'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q4 Sportback e-tron',
    'Q5', 'Q5 Sportback', 'Q7', 'Q8', 'Q8 e-tron',
    'TT', 'TT Coupé', 'TT Roadster', 'TTS', 'TT RS', 'R8', 'R8 Spyder',
    'e-tron', 'e-tron GT', 'e-tron Sportback',
    'RS3', 'RS4', 'RS4 Avant', 'RS5', 'RS5 Sportback', 'RS6 Avant', 'RS7',
    'RS Q3', 'RS Q3 Sportback', 'RS Q8',
    'S3', 'S4', 'S4 Avant', 'S5', 'S5 Sportback', 'S6', 'S7', 'S8',
    'SQ2', 'SQ5', 'SQ7', 'SQ8', 'Allroad', 'Other'
  ],
  'Mercedes-Benz': [
    'A 160', 'A 180', 'A 200', 'A 220', 'A 250', 'A 35 AMG', 'A 45 AMG', 'A-Class',
    'B 160', 'B 180', 'B 200', 'B 220', 'B-Class',
    'C 180', 'C 200', 'C 220', 'C 250', 'C 300', 'C 350', 'C 43 AMG', 'C 63 AMG', 'C-Class',
    'CLA 180', 'CLA 200', 'CLA 220', 'CLA 250', 'CLA 35 AMG', 'CLA 45 AMG', 'CLA',
    'CLS 300', 'CLS 350', 'CLS 400', 'CLS 450', 'CLS 53 AMG', 'CLS',
    'E 200', 'E 220', 'E 250', 'E 300', 'E 350', 'E 400', 'E 43 AMG', 'E 53 AMG', 'E 63 AMG', 'E-Class',
    'S 300', 'S 350', 'S 400', 'S 450', 'S 500', 'S 560', 'S 580', 'S 63 AMG', 'S 65 AMG', 'S-Class',
    'GLA 180', 'GLA 200', 'GLA 220', 'GLA 250', 'GLA 35 AMG', 'GLA 45 AMG', 'GLA',
    'GLB 180', 'GLB 200', 'GLB 220', 'GLB 250', 'GLB 35 AMG', 'GLB',
    'GLC 200', 'GLC 220', 'GLC 250', 'GLC 300', 'GLC 350', 'GLC 43 AMG', 'GLC 63 AMG', 'GLC', 'GLC Coupé',
    'GLE 300', 'GLE 350', 'GLE 400', 'GLE 450', 'GLE 53 AMG', 'GLE 63 AMG', 'GLE', 'GLE Coupé',
    'GLS 350', 'GLS 400', 'GLS 450', 'GLS 580', 'GLS 63 AMG', 'GLS',
    'G 350', 'G 400', 'G 500', 'G 63 AMG', 'G 65 AMG', 'G-Class',
    'AMG GT', 'AMG GT C', 'AMG GT R', 'AMG GT S', 'AMG GT 4-Door',
    'SL 350', 'SL 400', 'SL 500', 'SL 55 AMG', 'SL 63 AMG', 'SL',
    'SLC 180', 'SLC 200', 'SLC 250', 'SLC 300', 'SLC 43 AMG', 'SLC',
    'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV',
    'Sprinter', 'Vito', 'V-Class', 'Citan', 'Marco Polo', 'Other'
  ],
  'BMW': [
    '116i', '118i', '120i', '120d', '125i', '128ti', '1 Series',
    '218i', '220i', '225i', '228i', '230i', 'M235i', 'M240i', '2 Series',
    '2 Series Active Tourer', '2 Series Gran Coupé', '2 Series Gran Tourer',
    '316i', '318i', '320i', '320d', '325i', '328i', '330i', '330d', '335i', '340i',
    'M3', 'M3 Competition', '3 Series',
    '418i', '420i', '420d', '425d', '428i', '430i', '440i', 'M4', 'M4 Competition', '4 Series',
    '520i', '520d', '525i', '530i', '530d', '535i', '540i', '545i', '550i',
    'M5', 'M5 Competition', '5 Series',
    '620i', '630i', '640i', '650i', 'M6', '6 Series',
    '730i', '730d', '740i', '740d', '745i', '750i', '760i', 'M760i', '7 Series',
    '840i', '840d', '850i', 'M8', '8 Series',
    'X1 sDrive', 'X1 xDrive', 'X1',
    'X2 sDrive', 'X2 xDrive', 'X2',
    'X3 sDrive', 'X3 xDrive', 'X3 M', 'X3 M40i', 'X3',
    'X4 M', 'X4 M40i', 'X4',
    'X5 sDrive', 'X5 xDrive', 'X5 M', 'X5 M50i', 'X5',
    'X6 M', 'X6 M50i', 'X6',
    'X7 xDrive', 'X7 M60i', 'X7', 'XM',
    'Z3', 'Z4 sDrive', 'Z4',
    'i3', 'i3s', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX3', 'Other'
  ],
  'Opel': [
    'Astra', 'Astra Sports Tourer', 'Corsa', 'Corsa-e', 'Insignia', 'Insignia Sports Tourer',
    'Mokka', 'Mokka-e', 'Crossland', 'Crossland X', 'Grandland', 'Grandland X',
    'Zafira', 'Zafira Life', 'Zafira Tourer',
    'Vectra', 'Vectra Caravan', 'Omega', 'Omega Caravan',
    'Agila', 'Meriva', 'Antara', 'Cascada', 'Adam',
    'Combo', 'Combo Life', 'Vivaro', 'Movano', 'Other'
  ],
  'Porsche': [
    '911 Carrera', '911 Carrera S', '911 Carrera 4', '911 Carrera 4S',
    '911 Targa 4', '911 Targa 4S', '911 Turbo', '911 Turbo S',
    '911 GT3', '911 GT3 RS', '911 GT3 Touring', '911 R', '911 Sport Classic',
    '718 Boxster', '718 Boxster S', '718 Boxster GTS', '718 Boxster Spyder',
    '718 Cayman', '718 Cayman S', '718 Cayman GTS', '718 Cayman GT4', '718 Cayman GT4 RS',
    'Cayenne', 'Cayenne S', 'Cayenne GTS', 'Cayenne Turbo', 'Cayenne Coupe', 'Cayenne E-Hybrid',
    'Macan', 'Macan S', 'Macan GTS', 'Macan Turbo', 'Macan Electric',
    'Panamera', 'Panamera 4', 'Panamera S', 'Panamera GTS', 'Panamera Turbo', 'Panamera Sport Turismo',
    'Taycan', 'Taycan 4S', 'Taycan GTS', 'Taycan Turbo', 'Taycan Turbo S', 'Taycan Cross Turismo', 'Taycan Sport Turismo',
    'Other'
  ],
  'Smart': ['ForTwo', 'ForTwo Cabrio', 'ForFour', '#1', '#3', 'EQ ForTwo', 'Other'],
  'Toyota': [
    'Yaris', 'Yaris Cross', 'Yaris GR',
    'Corolla', 'Corolla Cross', 'Corolla Touring Sports',
    'Camry', 'Prius', 'Prius+', 'Prius Plug-in',
    'RAV4', 'RAV4 Hybrid', 'RAV4 Plug-in',
    'C-HR', 'C-HR Hybrid',
    'Aygo', 'Aygo X',
    'Auris', 'Avensis', 'Avensis Touring Sports',
    'Land Cruiser', 'Land Cruiser 150', 'Land Cruiser 200', 'Land Cruiser 300',
    'Land Cruiser Prado', 'Hilux', 'Supra', 'GR86', 'GR Yaris', 'GR Corolla',
    'bZ4X', 'Proace', 'Proace City', 'Verso', 'Venza',
    'Highlander', 'Sequoia', 'Tundra', '4Runner', 'Tacoma', 'Other'
  ],
  'Honda': [
    'Civic', 'Civic Type R', 'Accord', 'Accord Tourer',
    'CR-V', 'HR-V', 'ZR-V', 'Jazz', 'Jazz Crosstar', 'e:Ny1', 'e:',
    'FR-V', 'Legend', 'NSX', 'CR-Z', 'Insight',
    'Pilot', 'Ridgeline', 'Passport', 'Element',
    'Fit', 'Stream', 'Odyssey', 'Other'
  ],
  'Nissan': [
    'Micra', 'Note', 'Juke', 'Juke NISMO',
    'Qashqai', 'Qashqai+2', 'X-Trail', 'Murano', 'Pathfinder',
    'Navara', 'Leaf', 'Leaf e+', 'Ariya',
    '370Z', '350Z', 'GT-R', 'Skyline',
    'Almera', 'Primera', 'Pulsar', 'Tiida', 'Maxima',
    'NV200', 'NV300', 'Primastar', 'Other'
  ],
  'Mazda': [
    'Mazda2', 'Mazda3', 'Mazda3 Fastback', 'Mazda6', 'Mazda6 Wagon',
    'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'CX-90',
    'MX-5', 'MX-5 RF', 'MX-30', 'RX-8', 'Other'
  ],
  'Mitsubishi': [
    'Colt', 'Lancer', 'Lancer Evo', 'Eclipse Cross', 'ASX', 'Outlander', 'Outlander PHEV',
    'L200', 'Pajero', 'Pajero Sport',
    'Space Star', 'Galant', 'Sigma', 'Other'
  ],
  'Subaru': [
    'Impreza', 'Impreza WRX', 'Impreza WRX STI',
    'Legacy', 'Legacy Touring Wagon', 'Outback', 'Forester',
    'XV', 'Crosstrek', 'BRZ', 'WRX', 'WRX STI', 'Levorg', 'Solterra', 'Other'
  ],
  'Suzuki': [
    'Swift', 'Swift Sport', 'Celerio', 'Ignis', 'Baleno',
    'SX4', 'SX4 S-Cross', 'Vitara', 'Vitara ALLGRIP', 'Across',
    'Jimny', 'Grand Vitara', 'Alto', 'Splash', 'Kizashi', 'Other'
  ],
  'Lexus': [
    'IS 200', 'IS 250', 'IS 300', 'IS 350', 'IS 300h', 'IS 500', 'IS F', 'IS',
    'ES 250', 'ES 300', 'ES 300h', 'ES 350', 'ES',
    'GS 250', 'GS 300', 'GS 350', 'GS 300h', 'GS 450h', 'GS F', 'GS',
    'LS 400', 'LS 430', 'LS 460', 'LS 500', 'LS 500h', 'LS 600h', 'LS',
    'CT 200h', 'CT',
    'NX 200t', 'NX 250', 'NX 300', 'NX 300h', 'NX 350', 'NX 350h', 'NX 450h+', 'NX',
    'RX 200t', 'RX 300', 'RX 350', 'RX 300h', 'RX 350h', 'RX 400h', 'RX 450h', 'RX 450h+', 'RX 500h', 'RX',
    'GX 460', 'GX 470', 'GX 550', 'GX',
    'LX 450', 'LX 570', 'LX 600', 'LX',
    'UX 200', 'UX 250h', 'UX 300e', 'UX',
    'RZ 300e', 'RZ 450e', 'RZ', 'LC 500', 'LC 500h', 'LC',
    'RC 200t', 'RC 300', 'RC 300h', 'RC 350', 'RC 350h', 'RC F', 'RC',
    'Other'
  ],
  'Ford': [
    'Fiesta', 'Fiesta ST', 'Fiesta Active',
    'Focus', 'Focus ST', 'Focus RS', 'Focus Active',
    'Mondeo', 'Mondeo Turnier', 'Mondeo Hybrid',
    'Puma', 'Kuga', 'Kuga Hybrid', 'Kuga PHEV', 'EcoSport', 'Edge', 'Explorer',
    'Mustang', 'Mustang Mach-E',
    'Ranger', 'Ranger Raptor', 'Ranger Wildtrak',
    'Transit', 'Transit Custom', 'Transit Connect', 'Transit Courier',
    'Galaxy', 'S-Max', 'C-Max', 'Grand C-Max', 'B-Max', 'Ka', 'Ka+',
    'Fusion', 'Flex', 'Expedition', 'F-150', 'Bronco', 'Other'
  ],
  'Chevrolet': [
    'Spark', 'Aveo', 'Cruze', 'Cruze Station Wagon',
    'Malibu', 'Impala', 'Camaro', 'Corvette', 'Corvette Stingray', 'Corvette Z06',
    'Trax', 'Equinox', 'Blazer', 'Trailblazer', 'Traverse',
    'Tahoe', 'Suburban', 'Silverado',
    'Orlando', 'Captiva', 'Volt', 'Bolt EV', 'Other'
  ],
  'Cadillac': [
    'ATS', 'CTS', 'CT4', 'CT5', 'CT6', 'ELR',
    'SRX', 'XT4', 'XT5', 'XT6', 'Escalade',
    'Lyriq', 'Celestiq', 'Other'
  ],
  'Jeep': [
    'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Grand Cherokee L',
    'Wrangler', 'Wrangler Unlimited', 'Gladiator',
    'Commander', 'Avenger', 'Patriot', 'Liberty', 'Other'
  ],
  'Dodge': [
    'Viper', 'Challenger', 'Charger', 'Durango',
    'Journey', 'Grand Caravan', 'Ram', 'Other'
  ],
  'Chrysler': ['300', '300C', 'Pacifica', 'Voyager', 'Sebring', 'PT Cruiser', 'Other'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model S Plaid', 'Model X', 'Model X Plaid', 'Cybertruck', 'Roadster', 'Other'],
  'Hyundai': [
    'i10', 'i20', 'i20 N', 'i30', 'i30 N', 'i30 Fastback', 'i30 Wagon', 'i40', 'i40 CW',
    'IONIQ', 'IONIQ 5', 'IONIQ 5 N', 'IONIQ 6',
    'Kona', 'Kona Electric', 'Kona N',
    'Tucson', 'Tucson Hybrid', 'Tucson PHEV',
    'Santa Fe', 'Santa Fe Hybrid', 'Staria',
    'Veloster', 'Veloster N', 'Accent', 'Elantra', 'Elantra N', 'Sonata',
    'Nexo', 'Other'
  ],
  'Kia': [
    'Picanto', 'Rio', 'Ceed', 'Ceed SW', 'ProCeed', 'XCeed',
    'Stinger', 'EV6', 'EV6 GT', 'EV9',
    'Stonic', 'Niro', 'Niro EV', 'Niro PHEV',
    'Sportage', 'Sportage Hybrid', 'Sportage PHEV',
    'Sorento', 'Sorento Hybrid', 'Sorento PHEV',
    'Telluride', 'Carnival', 'Soul', 'Soul EV', 'Other'
  ],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60', 'Electrified G80', 'Other'],
  'SsangYong': ['Tivoli', 'Korando', 'Rexton', 'Musso', 'XLV', 'Rodius', 'Other'],
  'Renault': [
    'Twingo', 'Twingo Electric', 'Clio', 'Clio E-Tech', 'Captur', 'Captur E-Tech',
    'Mégane', 'Mégane E-Tech', 'Mégane RS', 'Talisman', 'Talisman Grandtour', 'Laguna', 'Laguna Coupé',
    'Kadjar', 'Koleos', 'Espace', 'Scenic', 'Scenic E-Tech', 'Grand Scenic',
    'Zoe', 'Austral', 'Austral E-Tech', 'Arkana', 'Kangoo', 'Kangoo E-Tech',
    'Trafic', 'Master', 'Dokker', 'Lodgy', 'Other'
  ],
  'Peugeot': [
    '107', '108', '208', '208 GT', 'e-208',
    '308', '308 SW', '308 GT', 'e-308',
    '408', '508', '508 SW', '508 Hybrid',
    '2008', 'e-2008', '3008', '3008 Hybrid', '4008', '5008', '5008 Hybrid',
    'Partner', 'Rifter', 'Traveller', 'Expert', 'Boxer', 'Bipper', 'Other'
  ],
  'Citroën': [
    'C1', 'C2', 'C3', 'C3 Aircross', 'ë-C3',
    'C4', 'C4 Cactus', 'ë-C4',
    'C5', 'C5 Aircross', 'C5 Aircross Hybrid', 'C5 X', 'C5 X Hybrid',
    'C6', 'C8', 'Berlingo', 'ë-Berlingo',
    'Jumpy', 'Dispatch', 'SpaceTourer', 'Jumper', 'Nemo', 'Other'
  ],
  'DS Automobiles': ['DS 3', 'DS 3 Crossback', 'DS 4', 'DS 5', 'DS 7', 'DS 7 Crossback', 'DS 9', 'Other'],
  'Fiat': [
    '500', '500C', '500X', '500L', '500e', 'Panda', 'Panda 4x4', 'Panda Cross',
    'Punto', 'Grande Punto', 'Bravo', 'Tipo', 'Tipo Wagon',
    'Doblo', 'Fiorino', 'Qubo', 'Ducato', 'Scudo', 'Fullback',
    '124 Spider', 'Other'
  ],
  'Alfa Romeo': [
    'MiTo', 'Giulietta', 'Giulietta Veloce',
    'Giulia', 'Giulia Quadrifoglio',
    'Stelvio', 'Stelvio Quadrifoglio',
    'Tonale', 'Tonale PHEV', '4C', '4C Spider', '8C',
    '147', '156', '156 Sportwagon', '159', '159 Sportwagon', '166', 'Brera', 'Spider', 'GTV',
    'Other'
  ],
  'Lancia': ['Ypsilon', 'Delta', 'Thema', 'Flavia', 'Other'],
  'Ferrari': [
    'Roma', 'Roma Spider', 'Portofino', 'Portofino M',
    'F8 Tributo', 'F8 Spider', 'SF90 Stradale', 'SF90 Spider',
    '296 GTB', '296 GTS', '812 Superfast', '812 GTS', '812 Competizione',
    'GTC4Lusso', 'GTC4Lusso T', 'Purosangue',
    'California', 'California T', 'F430', '458 Italia', '488 GTB', '488 Pista',
    'LaFerrari', '599', '612', 'Other'
  ],
  'Lamborghini': [
    'Huracán', 'Huracán EVO', 'Huracán STO', 'Huracán Tecnica',
    'Urus', 'Urus S', 'Urus Performante',
    'Aventador', 'Aventador S', 'Aventador SVJ', 'Aventador LP 700-4',
    'Revuelto', 'Gallardo', 'Murcielago', 'Other'
  ],
  'Maserati': [
    'Ghibli', 'Ghibli Hybrid', 'Ghibli Trofeo',
    'Quattroporte', 'Quattroporte Trofeo',
    'Levante', 'Levante Trofeo', 'Levante Hybrid',
    'Grecale', 'Grecale Trofeo', 'Grecale Folgore',
    'GranTurismo', 'GranTurismo Folgore', 'GranCabrio', 'MC20', 'MC20 Cielo', 'Other'
  ],
  'Land Rover': [
    'Defender 90', 'Defender 110', 'Defender 130',
    'Discovery', 'Discovery 3', 'Discovery 4', 'Discovery 5',
    'Discovery Sport',
    'Freelander', 'Freelander 2',
    'Range Rover', 'Range Rover Sport', 'Range Rover Sport SVR',
    'Range Rover Velar', 'Range Rover Evoque', 'Range Rover Evoque Cabriolet',
    'Other'
  ],
  'Jaguar': [
    'E-Pace', 'F-Pace', 'F-Pace SVR', 'I-Pace',
    'XE', 'XE R-Dynamic', 'XF', 'XF Sportbrake', 'XJ',
    'F-Type', 'F-Type Convertible', 'F-Type R', 'F-Type SVR',
    'XK', 'XKR', 'S-Type', 'X-Type', 'Other'
  ],
  'Mini': [
    'Mini Hatch', 'Mini Hatch 3-door', 'Mini Hatch 5-door',
    'Mini Clubman', 'Mini Convertible', 'Mini Countryman',
    'Mini Paceman', 'Mini Coupe', 'Mini Roadster',
    'Mini Cabrio', 'Mini Electric', 'Mini Aceman',
    'Cooper', 'Cooper S', 'Cooper SE', 'JCW', 'JCW GP', 'One', 'Other'
  ],
  'Bentley': [
    'Continental GT', 'Continental GT V8', 'Continental GT Speed', 'Continental GT Convertible',
    'Flying Spur', 'Flying Spur V8', 'Flying Spur Speed',
    'Bentayga', 'Bentayga V8', 'Bentayga EWB', 'Bentayga Hybrid',
    'Mulsanne', 'Mulsanne Speed', 'Azure', 'Arnage', 'Other'
  ],
  'Rolls-Royce': [
    'Ghost', 'Ghost Extended', 'Ghost Black Badge',
    'Phantom', 'Phantom Extended', 'Phantom Drophead Coupé',
    'Wraith', 'Wraith Black Badge', 'Dawn', 'Dawn Black Badge',
    'Cullinan', 'Cullinan Black Badge', 'Spectre', 'Silver Shadow', 'Silver Spur', 'Other'
  ],
  'Aston Martin': [
    'DB11', 'DB11 V8', 'DB11 AMR', 'DB11 Volante',
    'DB12', 'DB12 Volante',
    'Vantage', 'Vantage F1 Edition', 'Vantage Roadster',
    'DBS', 'DBS Superleggera', 'DBS Volante',
    'DBX', 'DBX707',
    'Valkyrie', 'Valour', 'Vanquish', 'Rapide', 'Other'
  ],
  'McLaren': [
    '540C', '570S', '570S Spider', '570GT',
    '600LT', '600LT Spider', '620R',
    '720S', '720S Spider', '750S', '750S Spider',
    'Artura', 'GT', 'Senna', 'Senna GTR', 'P1', 'Other'
  ],
  'Lotus': ['Emira', 'Eletre', 'Elise', 'Exige', 'Evora', 'Evija', 'Other'],
  'MG': ['MG3', 'MG4', 'MG5', 'MG6', 'ZS', 'HS', 'RX5', 'GS', 'Other'],
  'Volvo': [
    'C30', 'C40', 'C40 Recharge',
    'S40', 'S60', 'S60 Recharge', 'S80', 'S90', 'S90 Recharge',
    'V40', 'V40 Cross Country', 'V50', 'V60', 'V60 Recharge', 'V60 Cross Country',
    'V70', 'V90', 'V90 Recharge', 'V90 Cross Country',
    'XC40', 'XC40 Recharge', 'XC60', 'XC60 Recharge',
    'XC70', 'XC90', 'XC90 Recharge',
    'EX30', 'EX40', 'EX90', 'Other'
  ],
  'Polestar': ['Polestar 1', 'Polestar 2', 'Polestar 3', 'Polestar 4', 'Other'],
  'Skoda': [
    'Fabia', 'Fabia Monte Carlo', 'Fabia RS',
    'Rapid', 'Rapid Spaceback',
    'Octavia', 'Octavia Combi', 'Octavia RS', 'Octavia RS 245',
    'Superb', 'Superb Combi', 'Scala',
    'Enyaq iV', 'Enyaq Coupé iV',
    'Kamiq', 'Karoq', 'Kodiaq', 'Kodiaq RS',
    'Roomster', 'Yeti', 'Citigo', 'Citigo-e iV', 'Other'
  ],
  'Seat': [
    'Ibiza', 'Ibiza FR', 'Ibiza Cupra', 'Ibiza SC',
    'Leon', 'Leon ST', 'Leon SC', 'Leon FR', 'Leon Cupra',
    'Arona', 'Arona FR', 'Ateca', 'Ateca FR', 'Ateca Cupra',
    'Tarraco', 'Tarraco FR', 'Alhambra',
    'Mii', 'Mii Electric', 'Toledo', 'Exeo', 'Exeo ST', 'Other'
  ],
  'Cupra': ['Formentor', 'Formentor e-HYBRID', 'Born', 'Born e-BOOST', 'Ateca', 'Leon', 'Leon Sportstourer', 'Terramar', 'Other'],
  'Dacia': [
    'Sandero', 'Sandero Stepway', 'Logan', 'Logan MCV', 'Logan Stepway',
    'Duster', 'Duster 4x4', 'Jogger', 'Jogger Hybrid',
    'Spring', 'Spring Electric', 'Lodgy', 'Dokker', 'Other'
  ],
  'Renault Samsung': ['SM3', 'SM5', 'SM6', 'SM7', 'QM3', 'QM5', 'QM6', 'XM3', 'Other'],
  'Lada': ['Granta', 'Vesta', 'XRAY', 'Largus', 'Niva', '4x4', 'Other'],
  'BYD': ['Atto 3', 'Han', 'Tang', 'Song Plus', 'Seal', 'Dolphin', 'Seal U', 'Sea Lion', 'Other'],
  'Geely': ['Emgrand', 'Atlas', 'Boyue', 'Tugella', 'Xingyue', 'Other'],
  'Nio': ['ET5', 'ET5T', 'ET7', 'ES6', 'ES7', 'ES8', 'EC6', 'EC7', 'EL6', 'EL7', 'EL8', 'Other'],
  'XPeng': ['P5', 'P7', 'G3', 'G6', 'G9', 'X9', 'Other'],
  'Li Auto': ['L6', 'L7', 'L8', 'L9', 'MEGA', 'Other'],
  'Kawasaki': [
    'Ninja 400', 'Ninja 650', 'Ninja 1000', 'Ninja H2', 'Ninja H2R', 'Ninja ZX-6R', 'Ninja ZX-10R',
    'Z400', 'Z650', 'Z900', 'Z900RS', 'Z1000', 'Z1000SX',
    'Versys 650', 'Versys 1000', 'Vulcan S', 'Vulcan 900', 'Eliminator', 'W800',
    'KLX 300', 'KX 450', 'Other'
  ],
  'Yamaha': [
    'MT-07', 'MT-09', 'MT-09 SP', 'MT-10', 'MT-10 SP', 'MT-125',
    'R1', 'R1M', 'R6', 'R7', 'R3', 'R125',
    'Tracer 7', 'Tracer 9', 'Tracer 9 GT',
    'TMAX 530', 'TMAX 560', 'XMAX 250', 'XMAX 300', 'NMAX 125',
    'Ténéré 700', 'Super Ténéré 1200',
    'FJR 1300', 'XSR 700', 'XSR 900', 'XJR 1300', 'Other'
  ],
  'KTM': [
    'Duke 125', 'Duke 200', 'Duke 390', 'Duke 690', 'Duke 790', 'Duke 890', 'Duke 990',
    'RC 125', 'RC 200', 'RC 390', 'RC 8',
    'Adventure 390', 'Adventure 790', 'Adventure 890', 'Adventure 1090', 'Adventure 1190', 'Adventure 1290',
    'SMC 690', 'Super Duke 1290', 'Super Duke R', '690 Enduro', 'Freeride', 'Other'
  ],
  'Ducati': [
    'Monster', 'Monster 821', 'Monster 937', 'Monster 1200',
    'Panigale V2', 'Panigale V4', 'Panigale V4R', 'Panigale V4S',
    'Scrambler', 'Scrambler Icon', 'Scrambler Desert Sled', 'Scrambler Nightshift',
    'Multistrada V2', 'Multistrada V4', 'Multistrada V4S', 'Multistrada V4 Rally',
    'Hypermotard 698', 'Hypermotard 939', 'Hypermotard 950',
    'Streetfighter V2', 'Streetfighter V4',
    'SuperSport', 'Diavel', 'XDiavel', 'Other'
  ],
  'Harley-Davidson': [
    'Sportster S', 'Iron 883', 'Iron 1200', 'Forty-Eight', 'Nightster',
    'Softail', 'Fat Boy', 'Fat Bob', 'Breakout', 'Street Bob', 'Low Rider',
    'Road Glide', 'Road King', 'Street Glide', 'Electra Glide',
    'Pan America 1250', 'Pan America Special', 'Bronx',
    'LiveWire', 'Other'
  ],
  'BMW Motorrad': [
    'S 1000 RR', 'S 1000 R', 'S 1000 XR', 'S 1000 XR Competition',
    'M 1000 RR', 'M 1000 R', 'M 1000 XR',
    'R 1250 GS', 'R 1250 GS Adventure', 'R 1250 RT', 'R 1250 R', 'R 1250 RS',
    'R 1200 GS', 'R 1200 GS Adventure', 'R 1200 RT',
    'F 900 R', 'F 900 XR', 'F 850 GS', 'F 850 GS Adventure',
    'G 310 R', 'G 310 GS', 'G 310 RR',
    'K 1600 GT', 'K 1600 GTL', 'K 1600 Grand America',
    'C 400 X', 'C 400 GT', 'CE 04', 'Other'
  ],
  'Triumph': [
    'Street Triple', 'Street Triple R', 'Street Triple RS',
    'Speed Triple', 'Speed Triple RS', 'Speed Twin',
    'Tiger 660', 'Tiger 850 Sport', 'Tiger 900', 'Tiger 1200',
    'Bonneville T100', 'Bonneville T120', 'Thruxton', 'Thruxton RS',
    'Scrambler 400X', 'Scrambler 1200', 'Scrambler 1200 XE',
    'Rocket 3', 'Rocket 3 R', 'Rocket 3 GT',
    'Daytona Moto2', 'Trident 660', 'Other'
  ],
  'Aprilia': [
    'RSV4', 'RSV4 Factory', 'RSV4 1100',
    'Tuono V4', 'Tuono V4 Factory',
    'RS 660', 'Tuono 660',
    'Shiver 900', 'Dorsoduro 900',
    'SR GT 125', 'SR GT 200', 'Other'
  ],
  'Honda Power Sports': [
    'CB500F', 'CB500X', 'CB650F', 'CB650R', 'CB1000R', 'CB1000R Black Edition',
    'CBR500R', 'CBR650R', 'CBR1000RR', 'CBR1000RR-R Fireblade',
    'Africa Twin 1000', 'Africa Twin 1100', 'CRF 300 Rally', 'CRF 1100 L',
    'NC750X', 'NC750S', 'NT1100',
    'Forza 125', 'Forza 350', 'Forza 750', 'PCX 125', 'ADV 350', 'Other'
  ],
  'Polaris': ['RZR', 'Ranger', 'General', 'Sportsman', 'Scrambler', 'ACE', 'Other'],
  'Can-Am': ['Maverick X3', 'Commander', 'Defender', 'Outlander', 'Renegade', 'Spyder', 'Ryker', 'Other'],
  'Sea-Doo': ['GTX', 'GTI', 'RXT', 'RXP', 'WAKE', 'SPARK', 'Fish Pro', 'Other'],
  'Ski-Doo': ['Summit', 'Freeride', 'MXZ', 'Renegade', 'Expedition', 'Skandic', 'Other'],
  'Arctic Cat': ['Blast', 'ZR', 'XF', 'M', 'Wildcat XX', 'Prowler Pro', 'Alterra', 'Other'],
  'MAN': ['TGE', 'TGL', 'TGM', 'TGS', 'TGX', 'Other'],
  'Scania': ['P Series', 'G Series', 'R Series', 'S Series', 'Other'],
  'Iveco': ['Daily', 'Eurocargo', 'Stralis', 'S-Way', 'Other'],
  'DAF': ['LF', 'CF', 'XF', 'XG', 'Other'],
  'Other': ['Custom', 'Unknown', 'Vintage', 'Classic', 'Modified', 'Kit Car', 'Other']
}

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

const cantons = [
  'Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug',
  'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen',
  'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden',
  'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura'
]

// ─── Reactive state ──────────────────────────────────────────────────────────

const cars = ref<any[]>([])
const viewMode = ref('grid')
const showAdvancedFilters = ref(false)
const sortBy = ref('date-desc')
const currentPage = ref(1)
const itemsPerPage = 12
const currentYear = new Date().getFullYear()

const yearOptions = computed(() => {
  const years = []
  for (let year = currentYear; year >= currentYear - 30; year--) years.push(year)
  return years
})

const filters = ref({
  make: '', model: '',
  priceMin: null as number | null, priceMax: null as number | null,
  yearMin: '', yearMax: '',
  mileageMin: null as number | null, mileageMax: null as number | null,
  fuelType: '', transmission: '', bodyType: '', driveType: '',
  powerMin: null as number | null, powerMax: null as number | null,
  condition: '', accidentStatus: '',
  colorExterior: '', colorInterior: '',
  doors: '', seats: '', cylinders: '', engineSize: '',
  withWarranty: '', validInspection: '',
  sellerType: '', canton: '',
  equipment: [] as string[],
  status: '', exportDocuments: '', isFeatured: ''
})

// Watch sortBy changes
watch(sortBy, () => {
  currentPage.value = 1
  cars.value = [...cars.value]
})

// ─── Computed ────────────────────────────────────────────────────────────────

const filteredModels = computed(() => {
  if (!filters.value.make) return []
  return makeModels[filters.value.make] || []
})

const filteredCars = computed(() => {
  let result = [...cars.value]

  if (filters.value.make) result = result.filter(c => c.make?.toLowerCase().includes(filters.value.make.toLowerCase()))
  if (filters.value.model) result = result.filter(c => { const m = c.model?.toLowerCase() || ''; const f = filters.value.model.toLowerCase(); return m === f || m.includes(f) })
  if (filters.value.priceMin) result = result.filter(c => (c.price || c.startingPrice || 0) >= filters.value.priceMin!)
  if (filters.value.priceMax) result = result.filter(c => (c.price || c.startingPrice || Infinity) <= filters.value.priceMax!)
  if (filters.value.yearMin) result = result.filter(c => c.year >= parseInt(filters.value.yearMin))
  if (filters.value.yearMax) result = result.filter(c => c.year <= parseInt(filters.value.yearMax))
  if (filters.value.mileageMin) result = result.filter(c => c.mileage >= filters.value.mileageMin!)
  if (filters.value.mileageMax) result = result.filter(c => c.mileage <= filters.value.mileageMax!)
  if (filters.value.fuelType) result = result.filter(c => c.fuelType?.toLowerCase() === filters.value.fuelType.toLowerCase())
  if (filters.value.transmission) result = result.filter(c => c.transmission?.toLowerCase() === filters.value.transmission.toLowerCase())
  if (filters.value.bodyType) result = result.filter(c => c.bodyType?.toLowerCase() === filters.value.bodyType.toLowerCase())
  if (filters.value.driveType) result = result.filter(c => c.driveType?.toLowerCase() === filters.value.driveType.toLowerCase())
  if (filters.value.powerMin) result = result.filter(c => c.power >= filters.value.powerMin!)
  if (filters.value.powerMax) result = result.filter(c => c.power <= filters.value.powerMax!)
  if (filters.value.condition) result = result.filter(c => c.condition?.toLowerCase() === filters.value.condition.toLowerCase())
  if (filters.value.accidentStatus) { const ha = filters.value.accidentStatus === 'accident'; result = result.filter(c => c.hasAccident === ha) }
  if (filters.value.colorExterior) result = result.filter(c => c.colorExterior?.toLowerCase() === filters.value.colorExterior.toLowerCase())
  if (filters.value.colorInterior) result = result.filter(c => c.colorInterior?.toLowerCase() === filters.value.colorInterior.toLowerCase())
  if (filters.value.doors) result = result.filter(c => c.doors === parseInt(filters.value.doors))
  if (filters.value.seats) result = result.filter(c => c.seats === parseInt(filters.value.seats))
  if (filters.value.cylinders) result = result.filter(c => c.cylinders === parseInt(filters.value.cylinders))
  if (filters.value.engineSize) result = result.filter(c => c.engineSize?.toLowerCase().includes(filters.value.engineSize.toLowerCase()))
  if (filters.value.withWarranty !== '') result = result.filter(c => c.withWarranty === (filters.value.withWarranty === 'true'))
  if (filters.value.validInspection !== '') result = result.filter(c => c.validInspection === (filters.value.validInspection === 'true'))
  if (filters.value.sellerType) result = result.filter(c => c.sellerType?.toLowerCase() === filters.value.sellerType.toLowerCase())
  if (filters.value.canton) result = result.filter(c => c.canton?.toLowerCase().includes(filters.value.canton.toLowerCase()))
  if (filters.value.equipment.length > 0) result = result.filter(c => filters.value.equipment.every(e => c.equipment?.includes(e)))
  if (filters.value.status) result = result.filter(c => c.status?.toLowerCase() === filters.value.status.toLowerCase())
  if (filters.value.exportDocuments !== '') result = result.filter(c => c.exportDocuments === (filters.value.exportDocuments === 'true'))
  if (filters.value.isFeatured === 'true') result = result.filter(c => c.isFeatured === true)

  switch (sortBy.value) {
    case 'price-asc': return result.sort((a, b) => (a.price || a.startingPrice || 0) - (b.price || b.startingPrice || 0))
    case 'price-desc': return result.sort((a, b) => (b.price || b.startingPrice || 0) - (a.price || a.startingPrice || 0))
    case 'year-desc': return result.sort((a, b) => b.year - a.year)
    case 'year-asc': return result.sort((a, b) => a.year - b.year)
    case 'mileage-asc': return result.sort((a, b) => a.mileage - b.mileage)
    case 'mileage-desc': return result.sort((a, b) => b.mileage - a.mileage)
    case 'power-desc': return result.sort((a, b) => (b.power || 0) - (a.power || 0))
    case 'power-asc': return result.sort((a, b) => (a.power || 0) - (b.power || 0))
    case 'date-asc': return result.sort((a, b) => a.id - b.id)
    default: return result.sort((a, b) => { if (a.isFeatured && !b.isFeatured) return -1; if (!a.isFeatured && b.isFeatured) return 1; return b.id - a.id })
  }
})

const paginatedCars = computed(() => filteredCars.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const totalPages = computed(() => Math.ceil(filteredCars.value.length / itemsPerPage))

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  if (filters.value.make) active.push({ key: 'make', label: `Make: ${filters.value.make}` })
  if (filters.value.model) active.push({ key: 'model', label: `Model: ${filters.value.model}` })
  if (filters.value.priceMin) active.push({ key: 'priceMin', label: `Min: CHF ${filters.value.priceMin}` })
  if (filters.value.priceMax) active.push({ key: 'priceMax', label: `Max: CHF ${filters.value.priceMax}` })
  if (filters.value.yearMin) active.push({ key: 'yearMin', label: `From: ${filters.value.yearMin}` })
  if (filters.value.yearMax) active.push({ key: 'yearMax', label: `To: ${filters.value.yearMax}` })
  if (filters.value.fuelType) active.push({ key: 'fuelType', label: `Fuel: ${formatFuelType(filters.value.fuelType)}` })
  if (filters.value.transmission) active.push({ key: 'transmission', label: `Gearbox: ${formatTransmission(filters.value.transmission)}` })
  if (filters.value.bodyType) active.push({ key: 'bodyType', label: `Body: ${formatBodyType(filters.value.bodyType)}` })
  if (filters.value.driveType) active.push({ key: 'driveType', label: `Drive: ${formatDriveType(filters.value.driveType)}` })
  if (filters.value.condition) active.push({ key: 'condition', label: `Condition: ${formatCondition(filters.value.condition)}` })
  if (filters.value.accidentStatus) active.push({ key: 'accidentStatus', label: `Accident: ${filters.value.accidentStatus === 'accident' ? 'Yes' : 'No'}` })
  if (filters.value.equipment.length > 0) active.push({ key: 'equipment', label: `Equipment: ${filters.value.equipment.length} selected` })
  if (filters.value.cylinders) active.push({ key: 'cylinders', label: `Cylinders: ${filters.value.cylinders}` })
  if (filters.value.sellerType) active.push({ key: 'sellerType', label: `Seller: ${formatSellerType(filters.value.sellerType)}` })
  if (filters.value.canton) active.push({ key: 'canton', label: `Canton: ${filters.value.canton}` })
  return active
})

// ─── Methods ──────────────────────────────────────────────────────────────────

const onMakeChange = () => { filters.value.model = '' }
const applyFilters = () => { currentPage.value = 1 }
const applySorting = () => { currentPage.value = 1; cars.value = [...cars.value] }

const resetFilters = () => {
  filters.value = {
    make: '', model: '', priceMin: null, priceMax: null, yearMin: '', yearMax: '',
    mileageMin: null, mileageMax: null, fuelType: '', transmission: '', bodyType: '',
    driveType: '', powerMin: null, powerMax: null, condition: '', accidentStatus: '',
    colorExterior: '', colorInterior: '', doors: '', seats: '', cylinders: '', engineSize: '',
    withWarranty: '', validInspection: '', sellerType: '', canton: '', equipment: [],
    status: '', exportDocuments: '', isFeatured: ''
  }
  sortBy.value = 'date-desc'
  currentPage.value = 1
  showAdvancedFilters.value = false
}

const removeFilter = (key: string) => {
  if (key === 'equipment') { filters.value.equipment = [] }
  else { (filters.value as any)[key] = key.includes('Min') || key.includes('Max') ? null : '' }
}

// ─── Count helpers ────────────────────────────────────────────────────────────

const getFuelTypeCount = (v: string) => cars.value.filter(c => c.fuelType === v).length
const getBodyTypeCount = (v: string) => cars.value.filter(c => c.bodyType === v).length
const getTransmissionCount = (v: string) => cars.value.filter(c => c.transmission === v).length
const getDriveTypeCount = (v: string) => cars.value.filter(c => c.driveType === v).length
const getConditionCount = (v: string) => cars.value.filter(c => c.condition === v).length
const getAccidentCount = (v: boolean) => cars.value.filter(c => c.hasAccident === v).length
const getExteriorColorCount = (v: string) => cars.value.filter(c => c.colorExterior === v).length
const getInteriorColorCount = (v: string) => cars.value.filter(c => c.colorInterior === v).length
const getWarrantyCount = (v: boolean) => cars.value.filter(c => c.withWarranty === v).length
const getInspectionCount = (v: boolean) => cars.value.filter(c => c.validInspection === v).length
const getEquipmentLabel = (v: string) => equipmentFeatures.find(f => f.value === v)?.label || v

// ─── Format helpers ───────────────────────────────────────────────────────────

const formatNumber = (n: number) => n?.toLocaleString() || '0'
const formatFuelType = (v: string) => ({ petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid', lpg: 'LPG', cng: 'CNG' }[v] || v)
const formatTransmission = (v: string) => ({ manual: 'Manual', automatic: 'Automatic', semi_automatic: 'Semi-Automatic' }[v] || v)
const formatBodyType = (v: string) => bodyTypes.find(t => t.value === v)?.label || v
const formatDriveType = (v: string) => ({ fwd: 'Front-wheel drive', rwd: 'Rear-wheel drive', awd: 'All-wheel drive' }[v] || v)
const formatCondition = (v: string) => ({ excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' }[v] || v)
const formatColor = (v: string) => [...exteriorColors, ...interiorColors].find(c => c.value === v)?.label || v
const formatSellerType = (v: string) => ({ private: 'Private Seller', dealer: 'Car Dealer', business: 'Business' }[v] || v)

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'status-available'
    case 'auction': return 'status-reserved'
    case 'sold': return 'status-sold'
    default: return 'status-available'
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const response = await $fetch('/api/cars')
    cars.value = response as any[]
  } catch (error) {
    console.error('Failed to fetch cars:', error)
  }

  const q = route.query
  if (q.make) filters.value.make = q.make as string
  if (q.model) filters.value.model = q.model as string
  if (q.priceMin) filters.value.priceMin = Number(q.priceMin)
  if (q.priceMax) filters.value.priceMax = Number(q.priceMax)
  if (q.yearMin) filters.value.yearMin = q.yearMin as string
  if (q.yearMax) filters.value.yearMax = q.yearMax as string
  if (q.mileageMin) filters.value.mileageMin = Number(q.mileageMin)
  if (q.mileageMax) filters.value.mileageMax = Number(q.mileageMax)
  if (q.fuelType) filters.value.fuelType = q.fuelType as string
  if (q.transmission) filters.value.transmission = q.transmission as string
  if (q.bodyType) filters.value.bodyType = q.bodyType as string
  if (q.driveType) filters.value.driveType = q.driveType as string
  if (q.condition) filters.value.condition = q.condition as string
  if (q.accidentStatus) filters.value.accidentStatus = q.accidentStatus as string
  if (q.colorExterior) filters.value.colorExterior = q.colorExterior as string
  if (q.colorInterior) filters.value.colorInterior = q.colorInterior as string
  if (q.doors) filters.value.doors = q.doors as string
  if (q.seats) filters.value.seats = q.seats as string
  if (q.cylinders) filters.value.cylinders = q.cylinders as string
  if (q.engineSize) filters.value.engineSize = q.engineSize as string
  if (q.withWarranty) filters.value.withWarranty = q.withWarranty as string
  if (q.validInspection) filters.value.validInspection = q.validInspection as string
  if (q.sellerType) filters.value.sellerType = q.sellerType as string
  if (q.canton) filters.value.canton = q.canton as string
  if (q.equipment) { const e = q.equipment; filters.value.equipment = Array.isArray(e) ? e as string[] : [e as string] }
  if (q.sort) sortBy.value = q.sort as string
  if (Object.keys(q).length > 0) applyFilters()
})

watch(
  () => route.query,
  (nq) => {
    if (nq.make) filters.value.make = nq.make as string
    if (nq.model) filters.value.model = nq.model as string
    if (nq.priceMin) filters.value.priceMin = Number(nq.priceMin)
    if (nq.priceMax) filters.value.priceMax = Number(nq.priceMax)
    if (nq.yearMin) filters.value.yearMin = nq.yearMin as string
    if (nq.yearMax) filters.value.yearMax = nq.yearMax as string
    if (nq.fuelType) filters.value.fuelType = nq.fuelType as string
    if (nq.transmission) filters.value.transmission = nq.transmission as string
    if (nq.bodyType) filters.value.bodyType = nq.bodyType as string
    if (nq.condition) filters.value.condition = nq.condition as string
    if (Object.keys(nq).length > 0) applyFilters()
  }
)
</script>

<style scoped>
.car-card {
  @apply glass rounded-2xl overflow-hidden border border-red-200 hover:bg-white/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl cursor-pointer;
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
.search-input:focus { @apply bg-white shadow-lg; }
.search-button {
  @apply flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 shadow-md;
}
.secondary-button {
  @apply px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200;
}
.sort-select {
  @apply p-2 rounded-lg bg-white border border-red-300 text-red-900 focus:ring-2 focus:ring-red-500 focus:border-red-500;
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