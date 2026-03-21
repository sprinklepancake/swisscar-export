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

          <!-- Desktop Navigation — only shows at lg (1024px+) to avoid overflow -->
          <nav class="hidden lg:flex items-center justify-center flex-1 mx-4 lg:mx-12">
            <div class="flex items-center space-x-1 lg:space-x-4 xl:space-x-6">
              <NuxtLink :to="localePath('/')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                {{ t('home') }}
              </NuxtLink>

              <NuxtLink :to="localePath('/cars')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h7l2 2zM16 6l3 3-3 3V6z"></path>
                </svg>
                {{ t('cars') }}
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

          <!-- Desktop Right Actions — only shows at lg (1024px+) -->
          <div class="hidden lg:flex items-center space-x-2 lg:space-x-3 shrink-0">

            <!-- Language Switcher Dropdown -->
            <div class="relative">
              <button
                @click="langDropdownOpen = !langDropdownOpen"
                class="flex items-center gap-1.5 bg-white border border-red-300 text-red-700 rounded-xl px-3 py-2 text-sm cursor-pointer hover:border-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <span>{{ currentLang.flag }}</span>
                <span class="font-medium hidden lg:inline">{{ currentLang.name }}</span>
                <svg class="w-3.5 h-3.5 text-red-500 transition-transform" :class="langDropdownOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Backdrop to close on outside click -->
              <div v-if="langDropdownOpen" class="fixed inset-0 z-40" @click="langDropdownOpen = false"></div>
              <div
                v-if="langDropdownOpen"
                class="absolute right-0 top-full mt-1 bg-white border border-red-200 rounded-xl shadow-xl z-50 min-w-[160px] py-1 overflow-hidden"
              >
                <button
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  @click="switchLanguage(lang.code)"
                  class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-800 hover:bg-red-50 transition-colors"
                  :class="locale === lang.code ? 'bg-red-50 font-semibold' : ''"
                >
                  <span class="text-base">{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </div>

            <!-- Loading skeleton -->
            <div v-if="!auth.isInitialized" class="flex space-x-2">
              <div class="w-20 h-9 bg-red-100 rounded-xl animate-pulse"></div>
              <div class="w-20 h-9 bg-red-100 rounded-xl animate-pulse"></div>
            </div>

            <template v-else-if="currentUser">
              <!-- Messages -->
              <NuxtLink :to="localePath('/messages')" class="nav-link relative">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                {{ t('messages.title') || 'Messages' }}
                <span v-if="unreadCount > 0" class="ml-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {{ unreadCount }}
                </span>
              </NuxtLink>

              <!-- Sell Car CTA — shown to sellers and unregistered visitors -->
              <NuxtLink
                v-if="!currentUser || currentUser?.role === 'seller'"
                :to="localePath('/sell')"
                class="nav-link bg-gradient-to-r from-red-600 to-red-800 !text-white hover:from-red-700 hover:to-red-900 shadow-md"
              >
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                {{ t('sell_car') || 'Sell Your Car' }}
              </NuxtLink>

              <!-- Dashboard (seller only) -->
              <NuxtLink v-if="currentUser?.role === 'seller'" :to="localePath('/dashboard')" class="nav-link">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                {{ t('dashboard') }}
              </NuxtLink>

              <!-- Profile Avatar -->
              <NuxtLink :to="localePath('/profile')" class="relative group">
                <div class="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {{ (currentUser?.name || 'U').charAt(0).toUpperCase() }}
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

          <!-- Mobile / Tablet: Language + Messages + Hamburger (shown below lg) -->
          <div class="flex lg:hidden items-center gap-1">

            <!-- Mobile Language Switcher -->
            <div class="relative">
              <button
                @click="langDropdownOpen = !langDropdownOpen"
                class="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-xl text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-400 transition-colors"
              >
                <span class="text-base">{{ currentLang.flag }}</span>
                <svg class="w-3 h-3 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Backdrop to close on outside click -->
              <div v-if="langDropdownOpen" class="fixed inset-0 z-40" @click="langDropdownOpen = false"></div>
              <div
                v-if="langDropdownOpen"
                class="absolute right-0 top-full mt-1 bg-white border border-red-200 rounded-xl shadow-xl z-50 min-w-[180px] py-1 overflow-hidden max-h-[70vh] overflow-y-auto"
              >
                <button
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  @click="switchLanguage(lang.code)"
                  class="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-800 hover:bg-red-50 transition-colors"
                  :class="locale === lang.code ? 'bg-red-50 font-semibold' : ''"
                >
                  <span class="text-base">{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </div>

            <!-- Messages icon (if logged in) -->
            <NuxtLink v-if="currentUser" :to="localePath('/messages')" class="relative p-2 rounded-xl text-red-700 hover:bg-red-50">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>

            <!-- Hamburger -->
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

        <!-- Mobile Menu Dropdown -->
        <div
          v-if="mobileMenuOpen"
          class="lg:hidden border-t border-red-100 bg-white shadow-xl"
        >
          <div class="flex flex-col py-2">

            <!-- Main nav links -->
            <NuxtLink :to="localePath('/')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              {{ t('home') }}
            </NuxtLink>

            <NuxtLink :to="localePath('/cars')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h7l2 2zM16 6l3 3-3 3V6z"></path>
              </svg>
              {{ t('cars') }}
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

            <!-- Sell Car CTA -->
            <div class="px-3 py-2">
              <NuxtLink
                :to="localePath('/sell')"
                class="mobile-nav-link-featured"
                @click="closeMobileMenu"
              >
                <svg class="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                {{ t('sell_car') }}
              </NuxtLink>
            </div>

            <!-- Messages (mobile) -->
            <NuxtLink v-if="currentUser" :to="localePath('/messages')" class="mobile-nav-link" @click="closeMobileMenu">
              <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              {{ t('messages') }}
              <span v-if="unreadCount > 0" class="ml-auto bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>

            <!-- Auth Section -->
            <div class="border-t border-red-100 mt-1">
              <!-- Loading -->
              <div v-if="!auth.isInitialized?.value && auth.isInitialized !== undefined" class="px-4 py-4">
                <div class="flex gap-3">
                  <div class="w-8 h-8 bg-red-100 rounded-full animate-pulse shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-red-100 rounded animate-pulse"></div>
                    <div class="h-4 bg-red-100 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>

              <template v-else-if="currentUser">
                <NuxtLink :to="localePath('/profile')" class="mobile-nav-link" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{ t('profile.my_profile') }}
                  <span class="ml-auto text-xs text-red-500 font-medium">{{ currentUser?.name }}</span>
                </NuxtLink>

                <NuxtLink v-if="currentUser?.role === 'seller'" :to="localePath('/dashboard')" class="mobile-nav-link" @click="closeMobileMenu">
                  <svg class="w-5 h-5 mr-3 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  {{ t('dashboard') }}
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10 lg:mb-16">
          <!-- Brand -->
          <div class="sm:col-span-2 lg:col-span-1">
            <NuxtLink :to="localePath('/')" class="flex items-center space-x-2 mb-4 group">
              <img src="../assets/images/swiss.svg" alt="Swiss Car Export" class="w-10 h-10 object-contain">
              <span class="text-lg font-bold text-red-800 group-hover:text-red-600 transition-colors">{{ t('company_name') }}</span>
            </NuxtLink>
            <p class="text-sm text-red-700 leading-relaxed">{{ t('footer.description') }}</p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-sm font-semibold text-red-900 uppercase tracking-wider mb-4">{{ t('footer.quick_links') }}</h3>
            <ul class="space-y-2">
              <li><NuxtLink :to="localePath('/')" class="footer-link">{{ t('home') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/cars')" class="footer-link">{{ t('cars') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/shipping')" class="footer-link">{{ t('shipping') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/contact')" class="footer-link">{{ t('contact') }}</NuxtLink></li>
            </ul>
          </div>

          <!-- Account -->
          <div>
            <h3 class="text-sm font-semibold text-red-900 uppercase tracking-wider mb-4">{{ t('footer.account') }}</h3>
            <ul class="space-y-2">
              <li v-if="!currentUser"><NuxtLink :to="localePath('/login')" class="footer-link">{{ t('auth.login_button') }}</NuxtLink></li>
              <li v-if="!currentUser"><NuxtLink :to="localePath('/register')" class="footer-link">{{ t('auth.signup_link') }}</NuxtLink></li>
              <li v-if="currentUser"><NuxtLink :to="localePath('/profile')" class="footer-link">{{ t('profile.my_profile') }}</NuxtLink></li>
              <li v-if="currentUser?.role === 'seller'"><NuxtLink :to="localePath('/dashboard')" class="footer-link">{{ t('dashboard') }}</NuxtLink></li>
              <li v-if="currentUser?.role === 'seller'"><NuxtLink :to="localePath('/sell')" class="footer-link">{{ t('sell_car') }}</NuxtLink></li>
            </ul>
          </div>

          <!-- Status -->
          <div>
            <h3 class="text-sm font-semibold text-red-900 uppercase tracking-wider mb-4">{{ t('footer.status') }}</h3>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :class="currentUser ? 'bg-green-500' : 'bg-gray-400'"></div>
              <span class="text-xs sm:text-sm font-medium" :class="currentUser ? 'text-green-600' : 'text-gray-500'">
                {{ currentUser ? t('auth.logged_in') : t('auth.logged_out') }}
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
const langDropdownOpen = ref(false)
const { locales, locale } = useI18n()
const { t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
const auth = useAuth()

// auth.user is a Ref — unwrap it so template checks work correctly
const currentUser = computed(() => auth.user?.value ?? null)
const unreadCount = ref(0)

// Available languages with flags and full names
const availableLanguages = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ro', flag: '🇷🇴', name: 'Română' },
  { code: 'sr', flag: '🇷🇸', name: 'Srpski' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'bg', flag: '🇧🇬', name: 'Български' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'sq', flag: '🇦🇱', name: 'Shqip' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
]

const currentLang = computed(() => {
  return availableLanguages.find(l => l.code === locale.value) || availableLanguages[0]
})

const switchLanguage = (code: string) => {
  langDropdownOpen.value = false
  const route = useRoute()
  const cleanPath = route.fullPath.replace(
    new RegExp(`^/(${locales.value.map((l: any) => l.code).join('|')})`),
    ''
  )
  window.location.assign(`/${code}${cleanPath || '/'}`)
}

// ---------------------------------------------------------------
// FIXED: Logout — bypass readonly refs, use direct Supabase call
// + window.location.href for a hard navigation that clears all state
// ---------------------------------------------------------------
const handleLogout = async () => {
  try {
    const { $supabase } = useNuxtApp()
    if ($supabase) {
      await ($supabase as any).auth.signOut()
    }
    // Clear the auth cookie directly
    useCookie('sb-access-token').value = null
  } catch (error) {
    console.error('Logout error (non-fatal):', error)
  } finally {
    closeMobileMenu()
    // Hard navigate — clears all Vue state, guarantees a clean slate
    window.location.href = localePath('/')
  }
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
    unreadCount.value = (response as any).count || 0
  } catch (error) {
    // Silently fail — not critical
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
</style>