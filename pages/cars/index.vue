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
              <TypeaheadSelect
                v-model="filters.make"
                :options="carMakes"
                :placeholder="$t('any_make')"
                @change="onMakeChange"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-red-800 mb-2">{{ $t('model_label') }}</label>
              <TypeaheadSelect
                v-model="filters.model"
                :options="filteredModels"
                :placeholder="$t('any_model')"
                :disabled="!filters.make"
              />
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
              <img 
                :src="car.images[0] || '/placeholder-car.jpg'" 
                :alt="`${car.make} ${car.model}`" 
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              >
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
import { carMakes, makeModels } from '~/constants/carData'

const { t } = useI18n()
const route = useRoute()

useHead({
  title: t('cars_page.title') || 'Browse Export Cars',
  meta: [{ name: 'description', content: t('cars_page.description') || 'Browse quality Swiss vehicles at affordable export prices' }]
})

// ─── Static data (other arrays remain) ─────────────────────────────────────────────

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
  // Read URL params first
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

  // Then fetch cars
  try {
    const response = await $fetch('/api/cars')
    cars.value = response as any[]
  } catch (error) {
    console.error('Failed to fetch cars:', error)
  }

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