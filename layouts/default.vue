<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <!-- Navigation Header -->
    <header class="relative z-50 bg-white backdrop-blur-lg border-b border-red-200 shadow-sm">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div class="flex justify-between items-center h-16 sm:h-20 lg:h-28">

          <!-- Logo -->
          <NuxtLink :to="localePath('/')" class="flex items-center space-x-2 sm:space-x-3 group shrink-0">
            <img
              src="../assets/images/swiss.svg"
              :alt="t('logo_alt')"
              class="w-10 h-10 sm:w-14 sm:h-14 lg:w-20 lg:h-20 object-contain group-hover:scale-105 transition-transform duration-300"
            >
            <div class="flex flex-col">
              <span class="text-base sm:text-xl lg:text-3xl font-bold text-red-800 group-hover:text-red-600 transition-colors duration-200 leading-tight">
                {{ t('company_name') }}
              </span>
              <span class="hidden sm:block text-xs sm:text-sm lg:text-lg text-red-500 -mt-0.5">{{ t('company_tagline') }}</span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center justify-center flex-1 mx-4 lg:mx-12">
            <div class="flex items-center space-x-1 lg:space-x-4 xl:space-x-6">
              <NuxtLink :to="localePath('/')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                {{ t('home') }}
              </NuxtLink>

              <NuxtLink :to="localePath('/cars')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                {{ t('browse_cars') }}
              </NuxtLink>

              <NuxtLink
                v-if="auth.user?.role === 'seller'"
                :to="localePath('/sell')"
                class="nav-link nav-link-primary"
              >
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ t('export_your_car') }}
              </NuxtLink>

              <NuxtLink :to="localePath('/shipping')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                {{ t('shipping') }}
              </NuxtLink>

              <NuxtLink :to="localePath('/contact')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ t('contact') }}
              </NuxtLink>
            </div>
          </nav>

          <!-- Desktop Right Actions -->
          <div class="hidden md:flex items-center space-x-2 lg:space-x-3 shrink-0">
            <!-- Language Switcher -->
            <select
              v-model="locale"
              @change="handleLanguageChange"
              class="lang-switcher bg-white border border-red-300 text-red-700 rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-500 transition-colors"
            >
              <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                {{ loc.code.toUpperCase() }}
              </option>
            </select>

            <!-- Loading skeleton -->
            <div v-if="!auth.isInitialized" class="flex space-x-2">
              <div class="w-20 h-9 bg-red-100 rounded-xl animate-pulse"></div>
              <div class="w-20 h-9 bg-red-100 rounded-xl animate-pulse"></div>
            </div>

            <template v-else-if="auth.user">
              <!-- Messages -->
              <NuxtLink :to="localePath('/messages')" class="nav-link relative">
                <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {{ unreadCount }}
                </span>
              </NuxtLink>

              <!-- Dashboard (seller) -->
              <NuxtLink v-if="auth.user?.role === 'seller'" :to="localePath('/dashboard')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                {{ t('dashboard') }}
              </NuxtLink>

              <!-- Profile Avatar -->
              <NuxtLink :to="localePath('/profile')" class="relative group">
                <div class="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {{ (auth.user?.name || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white shadow-sm"></div>
              </NuxtLink>

              <!-- Logout -->
              <button @click="handleLogout" class="nav-link nav-link-danger">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                {{ t('logout') }}
              </button>
            </template>

            <template v-else>
              <NuxtLink :to="localePath('/login')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                {{ t('auth.login_button') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/register')" class="nav-link nav-link-primary">
                {{ t('auth.signup_link') }}
              </NuxtLink>
            </template>
          </div>

          <!-- Mobile: Messages + Hamburger -->
          <div class="flex md:hidden items-center gap-1">
            <NuxtLink v-if="auth.user" :to="localePath('/messages')" class="relative p-2 rounded-xl text-red-700 hover:bg-red-50">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>

            <button
              @click="toggleMobileMenu"
              class="p-2.5 rounded-xl bg-red-700 text-white hover:bg-red-800 active:bg-red-900 transition-colors duration-200 shadow-md"
              :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
            >
              <svg v-if="mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t border-red-100 bg-white shadow-xl"
        >
          <div class="flex flex-col py-2">

            <!-- Main links -->
            <NuxtLink :to="localePath('/')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              {{ t('home') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/cars')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              {{ t('browse_cars') }}
            </NuxtLink>

            <NuxtLink
              v-if="auth.user?.role === 'seller'"
              :to="localePath('/sell')"
              class="mobile-nav-link-featured"
              @click="closeMobileMenu"
            >
              <svg class="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ t('export_your_car') }}
            </NuxtLink>

            <NuxtLink v-if="auth.user?.role === 'seller'" :to="localePath('/dashboard')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              {{ t('dashboard') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/shipping')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              {{ t('shipping') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/contact')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {{ t('contact') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/messages')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span>{{ t('messages.title') }}</span>
              <span v-if="unreadCount > 0" class="ml-auto bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>

            <!-- Language Switcher -->
            <div class="px-4 py-3 bg-red-50 border-t border-red-100">
              <label class="block text-xs font-semibold text-red-700 mb-1.5 uppercase tracking-wider">{{ t('language') || 'Language' }}</label>
              <select
                v-model="locale"
                @change="handleLanguageChange; closeMobileMenu()"
                class="w-full bg-white border-2 border-red-300 text-red-800 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option v-for="loc in locales" :key="loc.code" :value="loc.code">
                  {{ loc.code.toUpperCase() }}
                </option>
              </select>
            </div>

            <!-- Auth Section -->
            <div class="border-t border-red-100">
              <div v-if="!auth.isInitialized" class="px-4 py-4">
                <div class="flex gap-3">
                  <div class="w-8 h-8 bg-red-100 rounded-full animate-pulse shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-red-100 rounded animate-pulse"></div>
                    <div class="h-4 bg-red-100 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>

              <template v-else-if="auth.user">
                <NuxtLink :to="localePath('/profile')" class="mobile-nav-link" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{ t('profile.my_profile') }}
                  <span class="ml-auto text-xs text-red-500 font-medium">{{ auth.user?.name }}</span>
                </NuxtLink>
                <button @click="handleLogout" class="mobile-nav-link w-full text-left text-red-700 hover:bg-red-100 hover:text-red-900">
                  <svg class="w-5 h-5 mr-3 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  {{ t('logout') }}
                </button>
              </template>

              <template v-else>
                <NuxtLink :to="localePath('/login')" class="mobile-nav-link" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  {{ t('auth.login_button') }}
                </NuxtLink>
                <div class="px-3 py-2">
                  <NuxtLink
                    :to="localePath('/register')"
                    class="flex items-center justify-center w-full bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold py-3 px-4 rounded-xl hover:from-red-800 hover:to-red-900 transition-all duration-200 shadow-md text-sm"
                    @click="closeMobileMenu"
                  >
                    <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    {{ t('auth.signup_link') }}
                  </NuxtLink>
                </div>
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
    <footer class="relative z-10 bg-white border-t border-red-200 shadow-sm">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-10 lg:py-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          <!-- Company Info -->
          <div class="col-span-1 sm:col-span-2">
            <div class="flex items-center space-x-3 mb-5">
              <img
                src="../assets/images/swiss.svg"
                :alt="t('logo_alt')"
                class="w-10 h-10 lg:w-14 lg:h-14 object-contain"
              >
              <div>
                <span class="text-lg lg:text-2xl font-bold text-red-800">{{ t('company_name') }}</span>
                <div class="text-xs lg:text-sm text-red-600 font-medium">{{ t('company_tagline_full') }}</div>
              </div>
            </div>
            <p class="text-red-700 mb-5 max-w-md leading-relaxed text-sm lg:text-base">
              {{ t('footer_description') }}
            </p>
            <div class="flex space-x-3">
              <a href="#" class="social-link" :aria-label="t('social.twitter')">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="social-link" :aria-label="t('social.facebook')">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="social-link" :aria-label="t('social.instagram')">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-red-800 font-bold mb-4 text-sm lg:text-lg">{{ t('export_services') }}</h3>
            <ul class="space-y-2">
              <li><NuxtLink :to="localePath('/cars')" class="footer-link">{{ t('browse_cars') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/sell')" class="footer-link">{{ t('export_your_car') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/shipping')" class="footer-link">{{ t('shipping_calculator') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/documentation')" class="footer-link">{{ t('export_documentation') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/about')" class="footer-link">{{ t('about_us') }}</NuxtLink></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="text-red-800 font-bold mb-4 text-sm lg:text-lg">{{ t('support_info') }}</h3>
            <ul class="space-y-2">
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
        <div class="border-t border-red-200 mt-8 lg:mt-12 pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <p class="text-red-600 text-xs sm:text-sm text-center sm:text-left">
            &copy; 2025 {{ t('company_name') }}. {{ t('all_rights_reserved') }}
          </p>
          <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">
            <span class="text-red-600 text-xs sm:text-sm font-medium">
              🇨🇭 {{ t('swiss_quality') }} • {{ t('worldwide_export') }}
            </span>
            <div class="flex items-center space-x-1.5">
              <div class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span class="text-red-600 text-xs sm:text-sm font-medium">{{ t('export_active') }}</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-2 h-2 rounded-full animate-pulse" :class="auth.user ? 'bg-green-500' : 'bg-gray-400'"></div>
              <span class="text-xs sm:text-sm font-medium" :class="auth.user ? 'text-green-600' : 'text-gray-500'">
                {{ auth.user ? t('auth.logged_in') : t('auth.logged_out') }}
              </span>
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
    closeMobileMenu()
    await nextTick()
    await navigateTo(localePath('/'))
  } catch (error) {
    console.error('Logout failed:', error)
    auth.user.value = null
    auth.isInitialized.value = true
    closeMobileMenu()
    await navigateTo(localePath('/'))
  }
}

const handleLanguageChange = async () => {
  const route = useRoute()
  const newLocale = locale.value as string
  const cleanPath = route.fullPath.replace(
    new RegExp(`^/(${locales.value.map(l => l.code).join('|')})`),
    ''
  )
  window.location.assign(`/${newLocale}${cleanPath}`)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

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
/* ============================================================
   DESKTOP NAV LINKS
   ============================================================ */
.nav-link {
  @apply flex items-center text-red-700 hover:text-red-900 font-medium transition-all duration-200 rounded-xl hover:bg-red-50 px-3 py-2 whitespace-nowrap text-sm lg:text-base;
}

.nav-link-primary {
  @apply bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 shadow-md;
}

/* Override text-red-700 for primary variant */
.nav-link.nav-link-primary {
  color: white !important;
}

.nav-link-danger {
  @apply hover:bg-red-100 hover:text-red-900;
}

/* ============================================================
   MOBILE NAV LINKS
   ============================================================ */
.mobile-nav-link {
  @apply flex items-center text-red-800 font-medium transition-all duration-200 px-5 py-3.5 hover:bg-red-50 hover:text-red-900 text-sm w-full;
}

/* Featured "Sell Car" button in mobile menu */
.mobile-nav-link-featured {
  @apply flex items-center font-semibold transition-all duration-200 mx-3 my-1 px-4 py-3.5 rounded-xl text-sm;
  background: linear-gradient(to right, #b91c1c, #991b1b);
  color: white;
}

.mobile-nav-link-featured:hover {
  background: linear-gradient(to right, #991b1b, #7f1d1d);
}

/* ============================================================
   FOOTER
   ============================================================ */
.footer-link {
  @apply text-red-600 hover:text-red-900 transition-colors duration-200 font-medium text-sm lg:text-base;
}

.social-link {
  @apply w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-700 hover:text-white hover:bg-red-700 transition-all duration-300 shadow hover:shadow-lg hover:scale-105;
}

/* ============================================================
   LANGUAGE SELECT — hide default arrow, show custom one
   ============================================================ */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b91c1c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem !important;
}
</style>