<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <!-- Navigation Header -->
    <header class="relative z-50 bg-white backdrop-blur-lg border-b border-red-200 shadow-sm">
      <div class="max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div class="flex justify-between items-center h-24 lg:h-28">
          <!-- Logo - Made larger -->
          <NuxtLink :to="localePath('/')" class="flex items-center space-x-4 group">
            <img 
              src="../assets/images/swiss.svg" 
              :alt="t('logo_alt')" 
              class="w-16 h-16 lg:w-20 lg:h-20 object-contain group-hover:scale-105 transition-transform duration-300"
            >
            <div class="flex flex-col">
              <span class="text-2xl lg:text-3xl font-bold text-red-800 group-hover:text-red-600 transition-colors duration-200">
                {{ t('company_name') }}
              </span>
              <span class="text-base lg:text-lg text-red-500 -mt-1">{{ t('company_tagline') }}</span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center justify-center flex-1 mx-12">
            <!-- Main Navigation Links -->
            <div class="flex items-center space-x-8 lg:space-x-12">
              <NuxtLink :to="localePath('/')" class="nav-link">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                {{ t('home') }}
              </NuxtLink>
              
              <NuxtLink 
                v-if="!auth.user || auth.user?.role === 'buyer'"
                :to="localePath('/cars')" 
                class="nav-link"
              >
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                {{ t('browse_cars') }}
              </NuxtLink>
              
              <NuxtLink 
                v-if="auth.user?.role === 'seller'"
                :to="localePath('/sell')" 
                class="nav-link nav-link-primary"
              >
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ t('export_your_car') }}
              </NuxtLink>
              
              <NuxtLink :to="localePath('/shipping')" class="nav-link">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                {{ t('shipping') }}
              </NuxtLink>
              
              <NuxtLink :to="localePath('/contact')" class="nav-link">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ t('contact') }}
              </NuxtLink>

              <!-- Messages Link -->
              <NuxtLink :to="localePath('/messages')" class="nav-link relative">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                {{ t('messages.title') }}
                <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {{ unreadCount }}
                </span>
              </NuxtLink>
            </div>
          </nav>

          <!-- Auth & Language Section -->
          <div class="hidden md:flex items-center space-x-6">
            <!-- Language Switcher -->
            <div class="relative">
              <select 
                v-model="$i18n.locale"
                @change="handleLanguageChange"
                class="lang-switcher bg-white text-red-800 rounded-xl px-4 py-2.5 border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none text-sm font-medium shadow-sm hover:bg-red-50 transition-all duration-200"
              >
                <option 
                  v-for="locale in locales" 
                  :key="locale.code" 
                  :value="locale.code"
                  :selected="locale.code === $i18n.locale"
                  class="bg-white text-red-800"
                >
                  {{ locale.name }}
                </option>
              </select>
              <svg class="w-4 h-4 text-red-600 pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <!-- Auth Buttons -->
            <!-- Loading state -->
            <div v-if="!auth.isInitialized" class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div class="w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            
            <!-- Not authenticated state -->
            <template v-if="auth.user.value===null">
              <!-- Login Button -->
              <NuxtLink :to="localePath('/login')" class="nav-link nav-link-primary">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                {{ t('auth.login_button') }}
              </NuxtLink>
            </template>
            
            <!-- Authenticated state -->
            <template v-else-if="auth.user">
              <!-- Profile -->
              <NuxtLink 
                :to="localePath('/profile')"
                class="flex items-center group"
              >
                <div class="relative">
                  <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-red-500/25 transition-all duration-300 group-hover:scale-105">
                    {{ auth.user?.name?.charAt(0) || '?' }}
                  </div>
                  <div class="absolute -bottom-1 -right-1 bg-red-600 rounded-full w-3 h-3 border-2 border-white shadow-sm"></div>
                </div>
              </NuxtLink>
              
              <!-- Logout Button -->
              <button @click="handleLogout" class="nav-link nav-link-danger">
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                {{ t('logout') }}
              </button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="md:hidden p-3 rounded-xl bg-red-700 text-white hover:bg-red-800 transition-colors duration-200 shadow-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen" class="md:hidden py-6 border-t border-red-200 bg-white backdrop-blur-sm rounded-b-2xl mt-2 shadow-lg">
          <div class="flex flex-col space-y-1">
            <NuxtLink :to="localePath('/')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              {{ t('home') }}
            </NuxtLink>
            <NuxtLink 
              v-if="!auth.user || auth.user?.role === 'buyer'"
              :to="localePath('/cars')" 
              class="mobile-nav-link" 
              @click="closeMobileMenu"
            >
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              {{ t('browse_cars') }}
            </NuxtLink>
            <NuxtLink 
              v-if="auth.user?.role === 'seller'"
              :to="localePath('/sell')" 
              class="mobile-nav-link mobile-nav-link-primary" 
              @click="closeMobileMenu"
            >
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ t('export_your_car') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/shipping')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              {{ t('shipping') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/contact')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {{ t('contact') }}
            </NuxtLink>
            
            <!-- Messages Link for Mobile -->
            <NuxtLink :to="localePath('/messages')" class="mobile-nav-link relative" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              {{ t('messages.title') }}
              <span v-if="unreadCount > 0" class="absolute right-4 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ unreadCount }}
              </span>
            </NuxtLink>
            
            <!-- Mobile Auth Links -->
            <div class="border-t border-red-200 mt-4 pt-4">
              <!-- Loading state -->
              <div v-if="!auth.isInitialized" class="px-4 py-3">
                <div class="flex space-x-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
              
              <template v-else-if="auth.user">
                <NuxtLink :to="localePath('/profile')" class="mobile-nav-link" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{ t('profile.my_profile') }}
                </NuxtLink>
                <button @click="handleLogout" class="mobile-nav-link mobile-nav-link-danger text-left w-full">
                  <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  {{ t('logout') }}
                </button>
              </template>
              <template v-else>
                <NuxtLink :to="localePath('/login')" class="mobile-nav-link mobile-nav-link-primary" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  {{ t('auth.login_button') }}
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="relative z-10 bg-white backdrop-blur-lg border-t border-red-200 shadow-sm">
      <div class="max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <!-- Company Info -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center space-x-4 mb-6">
              <!-- Larger footer logo -->
              <img 
                src="../assets/images/swiss.svg" 
                :alt="t('logo_alt')" 
                class="w-14 h-14 object-contain"
              >
              <div>
                <span class="text-2xl font-bold text-red-800">{{ t('company_name') }}</span>
                <div class="text-sm text-red-600 font-medium">{{ t('company_tagline_full') }}</div>
              </div>
            </div>
            <p class="text-red-700 mb-6 max-w-md leading-relaxed">
              {{ t('footer_description') }}
            </p>
            <div class="flex space-x-4">
              <a href="#" class="social-link" :aria-label="t('social.twitter')">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="social-link" :aria-label="t('social.facebook')">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.367-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="social-link" :aria-label="t('social.linkedin')">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.370-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.920-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="social-link" :aria-label="t('social.instagram')">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.315.315.49.753.49 1.243 0 .49-.175.928-.49 1.243-.369.315-.807.49-1.297.49z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-red-800 font-bold mb-6 text-lg">{{ t('export_services') }}</h3>
            <ul class="space-y-3">
              <li><NuxtLink :to="localePath('/cars')" class="footer-link">{{ t('browse_cars') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/sell')" class="footer-link">{{ t('export_your_car') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/shipping')" class="footer-link">{{ t('shipping_calculator') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/documentation')" class="footer-link">{{ t('export_documentation') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/about')" class="footer-link">{{ t('about_us') }}</NuxtLink></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="text-red-800 font-bold mb-6 text-lg">{{ t('support_info') }}</h3>
            <ul class="space-y-3">
              <li><NuxtLink :to="localePath('/guide')" class="footer-link">{{ t('export_guide') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/destinations')" class="footer-link">{{ t('shipping_destinations') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/payment')" class="footer-link">{{ t('payment_methods') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/insurance')" class="footer-link">{{ t('insurance_coverage') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/support')" class="footer-link">{{ t('customer_support') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/privacy')" class="footer-link">{{ t('privacy_policy') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/terms')" class="footer-link">{{ t('terms_of_service') }}</NuxtLink></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-red-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-red-600 text-sm">
            &copy; 2025 {{ t('company_name') }}. {{ t('all_rights_reserved') }}
          </p>
          <div class="flex items-center space-x-8 mt-4 md:mt-0">
            <span class="text-red-600 text-sm flex items-center font-medium">
              🇨🇭 {{ t('swiss_quality') }} • {{ t('worldwide_export') }}
            </span>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm"></div>
              <span class="text-red-600 text-sm font-medium">{{ t('export_active') }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span class="text-green-600 text-sm font-medium">{{ auth.user ? t('auth.logged_in') : t('auth.logged_out') }}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
const { locales, locale } = useI18n()
const { t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const router = useRouter()
const auth = useAuth()
const currentUserId = computed(() => auth.user?.value?.id || 1)
const unreadCount = ref(0)

const handleLogout = async () => {
  try {
    console.log('Logout initiated, current user:', auth.user.value)
    
    await auth.logout()
    
    console.log('Logout completed, current user:', auth.user.value)
    
    // Close mobile menu if open
    closeMobileMenu()
    
    // Force a small delay to ensure state updates
    await nextTick()
    
    // Redirect to home page
    await navigateTo(localePath('/'))
    
  } catch (error) {
    console.error('Logout failed:', error)
    
    // Force clear the auth state
    auth.user.value = null
    auth.isInitialized.value = true
    
    // Close mobile menu
    closeMobileMenu()
    
    // Redirect anyway
    await navigateTo(localePath('/'))
  }
}

const handleLanguageChange = async () => {
  const route = useRoute()
  const newLocale = locale.value as string
  
  // Remove any existing locale prefix
  const cleanPath = route.fullPath.replace(
    new RegExp(`^/(${locales.value.map(l => l.code).join('|')})`), 
    ''
  )
  
  // Navigate to new URL with force reload
  window.location.assign(`/${newLocale}${cleanPath}`)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Load unread message count
const loadUnreadCount = async () => {
  try {
    const response = await $fetch('/api/chat/unread-count')
    unreadCount.value = response.count || 0
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

onMounted(() => {
  loadUnreadCount()
})
</script>

<style scoped>
.nav-link {
  @apply flex items-center text-red-700 hover:text-red-800 font-medium transition-all duration-300 rounded-xl hover:bg-red-50 whitespace-nowrap px-4 py-3;
  font-size: 0.9375rem;
  line-height: 1.2;
}

.nav-link:hover {
  @apply shadow transform hover:scale-105;
}

.nav-link-primary {
  @apply bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 shadow-lg hover:shadow-red-500/25;
}

.nav-link-danger {
  @apply hover:bg-red-100 hover:text-red-800;
}

.mobile-nav-link {
  @apply flex items-center text-red-700 hover:text-red-800 font-medium transition-all duration-300 px-4 py-3 rounded-xl hover:bg-red-50 whitespace-normal;
}

.mobile-nav-link-primary {
  @apply bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 shadow-lg;
}

.mobile-nav-link-danger {
  @apply hover:bg-red-100 hover:text-red-800;
}

.footer-link {
  @apply text-red-600 hover:text-red-800 transition-colors duration-200 font-medium;
}

.social-link {
  @apply w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-700 hover:text-white hover:bg-red-700 transition-all duration-300 shadow hover:shadow-lg hover:scale-105;
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.lang-switcher {
  min-width: 140px;
  font-size: 0.875rem;
}

@media (min-width: 1024px) {
  .nav-link {
    font-size: 1rem;
    padding: 0.875rem 1.25rem;
  }
}
</style>