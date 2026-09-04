<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-3 sm:p-4">
    <div class="glass p-5 sm:p-8 rounded-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left Column (Form) -->
      <div>
        <h1 class="text-3xl font-bold text-center md:text-left text-red-800 mb-8">{{ t('auth.signup_title') }}</h1>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name and Email -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="name" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.name.label') }} *</label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.name.placeholder')"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-red-700 mb-1">{{ t('auth.email') }} *</label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.email')"
              />
            </div>
          </div>

          <!-- Role Selection -->
          <div>
            <label class="block text-sm font-medium text-red-700 mb-2">{{ t('auth.role_label') }} *</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="setRole('buyer')"
                :class="{
                  'bg-red-600 ring-2 ring-red-400 text-white': form.role === 'buyer',
                  'bg-white/80 hover:bg-white text-red-800': form.role !== 'buyer'
                }"
                class="p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-red-300"
              >
                <svg v-if="form.role === 'buyer'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ t('auth.role_buyer') }}
              </button>
              <button
                type="button"
                @click="setRole('seller')"
                :class="{
                  'bg-red-600 ring-2 ring-red-400 text-white': form.role === 'seller',
                  'bg-white/80 hover:bg-white text-red-800': form.role !== 'seller'
                }"
                class="p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-red-300"
              >
                <svg v-if="form.role === 'seller'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ t('auth.role_seller') }}
              </button>
            </div>
          </div>

          <!-- Buyer type selection (only for buyer) -->
          <div v-if="form.role === 'buyer'" class="border border-red-200 rounded-lg p-4 bg-red-50">
            <label class="block text-sm font-semibold text-red-800 mb-2">{{ t('register.buyer_type_label') }} *</label>
            <div class="space-y-2">
              <label class="flex items-center p-2 rounded hover:bg-red-100 cursor-pointer">
                <input
                  type="radio"
                  v-model="form.buyerType"
                  value="direct"
                  class="mr-2 text-red-600"
                />
                <span class="text-sm">{{ t('register.buyer_type_direct') }}</span>
              </label>
              <label class="flex items-center p-2 rounded hover:bg-red-100 cursor-pointer">
                <input
                  type="radio"
                  v-model="form.buyerType"
                  value="auction"
                  class="mr-2 text-red-600"
                />
                <span class="text-sm">{{ t('register.buyer_type_auction') }}</span>
              </label>
            </div>
          </div>

          <!-- Additional Seller Information -->
          <div v-if="form.role === 'seller'" class="space-y-4 border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 class="text-lg font-semibold text-red-800">{{ t('register.seller_info.title') }}</h3>

            <div>
              <label for="companyName" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.company_name') }}</label>
              <input
                v-model="form.companyName"
                type="text"
                id="companyName"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.seller_info.company_placeholder')"
              />
            </div>

            <div>
              <label for="businessType" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.business_type') }}</label>
              <select
                v-model="form.businessType"
                id="businessType"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">{{ t('register.seller_info.select_business_type') }}</option>
                <option value="private">{{ t('register.seller_info.private_seller') }}</option>
                <option value="dealer">{{ t('register.seller_info.car_dealer') }}</option>
                <option value="business">{{ t('register.seller_info.business') }}</option>
              </select>
            </div>

            <div>
              <label for="taxId" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.seller_info.tax_id') }}</label>
              <input
                v-model="form.taxId"
                type="text"
                id="taxId"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.seller_info.tax_id_placeholder')"
              />
            </div>
          </div>

          <!-- Country. Shown to EVERYONE: this is an export marketplace and
               most buyers are not in Switzerland. Defaulting everybody to
               'Switzerland' behind a section they never saw was wrong. -->
          <div>
            <label for="country" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.country') }} *</label>
            <select
              v-model="form.country"
              id="country"
              required
              class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option v-for="c in countries" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>

          <!-- The rest of the address. Sellers need it (their listings carry a
               pickup location); auction buyers need it for the export paperwork. -->
          <div v-if="form.role === 'seller' || (form.role === 'buyer' && form.buyerType === 'auction')" class="space-y-4">
            <div>
              <label for="streetAddress" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.street_address') }}</label>
              <input
                v-model="form.streetAddress"
                type="text"
                id="streetAddress"
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('register.location.street_address_placeholder')"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="form.country === 'Switzerland'">
                <label for="canton" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.canton') }}</label>
                <select
                  v-model="form.canton"
                  id="canton"
                  class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{{ t('register.location.select_canton') }}</option>
                  <option v-for="canton in cantons" :key="canton" :value="canton">{{ canton }}</option>
                </select>
              </div>
              <div>
                <label for="city" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.city') }}</label>
                <input
                  v-model="form.city"
                  type="text"
                  id="city"
                  class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  :placeholder="t('register.location.city_placeholder')"
                />
              </div>
              <div>
                <label for="zipCode" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.location.zip_code') }}</label>
                <input
                  v-model="form.zipCode"
                  type="text"
                  id="zipCode"
                  class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  :placeholder="t('register.location.zip_code_placeholder')"
                />
              </div>
            </div>
          </div>

          <!-- Phone Number. Only sellers must give one (theirs is published on
               their listings). Any country's number is accepted — most buyers
               here are not Swiss. -->
          <div>
            <label for="phone" class="block text-sm font-medium text-red-700 mb-1">
              {{ t('register.phone.label') }}
              <span v-if="form.role === 'seller'">*</span>
              <span v-else class="text-red-500 font-normal">({{ t('register.phone.optional') }})</span>
            </label>
            <input
              v-model="form.phone"
              type="tel"
              id="phone"
              :required="form.role === 'seller'"
              class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :placeholder="t('register.phone.placeholder')"
            />
            <p class="text-red-600 text-xs mt-1">{{ t('register.phone.international_note') }}</p>
          </div>

          <!-- ID Upload — ONLY for accounts that want to bid in auctions.
               Sellers and direct buyers never see this. -->
          <div v-if="needsIdDocument" class="border-2 border-red-300 rounded-lg p-4 bg-red-50">
            <label class="block text-sm font-semibold text-red-800 mb-1">{{ t('register.id_upload_label') }} *</label>
            <p class="text-red-700 text-xs mb-3">{{ t('register.id_upload_required_note') }}</p>
            <input
              type="file"
              @change="onIdFileChange"
              accept="image/*,application/pdf,.pdf"
              :required="needsIdDocument"
              class="block w-full text-sm text-red-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-800 hover:file:bg-red-200"
            />
            <p class="text-red-600 text-xs mt-1">{{ t('register.id_upload_help') }}</p>
            <div v-if="idFileError" class="mt-2 text-sm text-red-700 font-medium">{{ idFileError }}</div>
            <div v-else-if="idFile" class="mt-2 text-sm text-green-700">✓ {{ idFileName }}</div>
            <div class="flex items-start mt-3">
              <div class="flex items-center h-5">
                <input
                  id="idConsent"
                  v-model="form.idConsent"
                  type="checkbox"
                  :required="needsIdDocument"
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="idConsent" class="ms-2 text-sm text-red-700">
                {{ t('register.id_consent') }}
                <NuxtLink :to="localePath('/privacy')" class="text-red-800 hover:underline">{{ t('privacy_policy') }}</NuxtLink>. *
              </label>
            </div>
          </div>

          <!-- No ID needed. Say so plainly — people abandoned the form because
               they assumed a passport was coming. -->
          <div v-else class="border border-green-300 rounded-lg p-4 bg-green-50">
            <p class="text-green-900 text-sm font-semibold mb-1">{{ t('register.no_id_needed_title') }}</p>
            <p class="text-green-800 text-sm">{{ t('register.no_id_needed_body') }}</p>
          </div>

          <!-- What happens next. Only auction accounts wait for anything. -->
          <div v-if="needsIdDocument" class="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <p class="text-amber-900 text-sm font-semibold mb-1">{{ t('register.approval_notice_title') }}</p>
            <p class="text-amber-800 text-sm">{{ t('register.approval_notice_body') }}</p>
          </div>

          <!-- Passwords -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="password" class="block text-sm font-medium text-red-700 mb-1">{{ t('auth.password') }} *</label>
              <input
                v-model="form.password"
                type="password"
                id="password"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.password')"
                minlength="8"
              />
              <p class="text-red-600 text-xs mt-1">{{ t('register.password.min_length') }}</p>
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-red-700 mb-1">{{ t('register.password.confirm_label') }} *</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                id="confirmPassword"
                required
                class="w-full p-3 bg-white/80 border border-red-300 rounded-lg text-red-900 placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :placeholder="t('placeholder.password')"
              />
            </div>
          </div>

          <!-- Terms and Privacy -->
          <div class="space-y-3">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="terms"
                  v-model="form.termsAccepted"
                  type="checkbox"
                  required
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="terms" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.agree_terms') }} <NuxtLink :to="localePath('/terms')" class="text-red-800 hover:underline">{{ t('terms_of_service') }}</NuxtLink> *
              </label>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="privacy"
                  v-model="form.privacyAccepted"
                  type="checkbox"
                  required
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="privacy" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.agree_privacy') }} <NuxtLink :to="localePath('/privacy')" class="text-red-800 hover:underline">{{ t('privacy_policy') }}</NuxtLink> *
              </label>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="marketing"
                  v-model="form.marketingAccepted"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-white border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <label for="marketing" class="ms-2 text-sm text-red-700">
                {{ t('register.terms.marketing_emails') }}
              </label>
            </div>
          </div>

          <!-- Important Notice. Seller-only: the message is about publishing a
               phone number on listings and about seller fraud, and showing it to
               a buyer contradicted the "(optional)" phone label directly above. -->
          <div v-if="form.role === 'seller' || form.buyerType === 'auction'" class="bg-red-100 border border-red-300 rounded-lg p-4">
            <p v-if="form.role === 'seller'" class="text-red-700 text-sm">
              <strong>{{ t('register.important_notice.title') }}:</strong> {{ t('register.important_notice.message') }}
            </p>
            <p v-if="form.buyerType === 'auction'" class="text-red-700 text-sm mt-1 font-semibold">
              {{ t('register.auction_warning') }}
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-600 text-sm pt-2">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !form.termsAccepted || !form.privacyAccepted || (needsIdDocument && (!idFile || !form.idConsent))"
            class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 disabled:opacity-50 mt-4"
          >
            <span v-if="loading">{{ t('register.creating_account') || 'Creating account...' }}</span>
            <span v-else>{{ t('auth.signup_button') }}</span>
          </button>

          <!-- Visible on phones. The same link exists in the right-hand column,
               which is `hidden md:flex`, so mobile users had no way back. -->
          <p class="md:hidden text-center text-sm text-red-600 pt-2">
            {{ t('auth.have_account') }}
            <NuxtLink :to="localePath('/login')" class="text-red-800 hover:text-red-900 font-semibold">{{ t('auth.login_link') }}</NuxtLink>
          </p>
        </form>
      </div>

      <!-- Right Column (Visual) -->
      <div class="hidden md:flex flex-col justify-center items-center">
        <div class="bg-white/80 rounded-xl p-6 w-full h-full flex items-center justify-center border border-red-200">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 class="text-xl font-bold text-red-800 mb-2">{{ t('register.join_title') }}</h2>
            <p class="text-red-700 text-sm mb-4">
              {{
                form.role === 'buyer'
                ? t('register.buyer_message')
                : t('register.seller_message')
              }}
            </p>

            <div class="text-left text-sm text-red-600 space-y-2">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.verified_vehicles') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.export_support') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.secure_payment') }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('register.benefits.multi_language') }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 text-center text-sm text-red-600">
          {{ t('auth.have_account') }}
          <NuxtLink :to="localePath('/login')" class="text-red-800 hover:text-red-900 font-semibold">{{ t('auth.login_link') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { compressImage } = useImageCompression()

const MAX_ID_BYTES = 6 * 1024 * 1024
const ALLOWED_ID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

useHead({
  title: t('register.seo.title') || 'Create Account - SwissExportCar',
  meta: [
    {
      name: 'description',
      content: t('register.seo.description') || 'Create your SwissExportCar account to buy or sell Swiss vehicles for export'
    }
  ]
})

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'buyer' as 'buyer' | 'seller',
  buyerType: 'direct' as 'direct' | 'auction',
  companyName: '',
  businessType: '' as 'private' | 'dealer' | 'business' | '',
  canton: '',
  city: '',
  zipCode: '',
  country: 'Switzerland',
  taxId: '',
  streetAddress: '',
  termsAccepted: false,
  privacyAccepted: false,
  marketingAccepted: false,
  idConsent: false
})

const loading = ref(false)
const error = ref<string | null>(null)
const idFile = ref<File | null>(null)
const idFileName = ref('')
const idFileError = ref('')
const registered = ref(false)

const cantons = ['Zurich', 'Bern', 'Lucerne', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud', 'Valais', 'Neuchâtel', 'Geneva', 'Jura']

// The old list was Switzerland + four neighbours + "Other", which is useless
// for an EXPORT marketplace whose buyers are in the Balkans, Eastern Europe and
// Africa. Switzerland stays pinned first because that is where the cars are.
//
// Stored as ISO 3166-1 alpha-2 code + English name. The VALUE submitted is the
// English name, because that is what users.country already contains and what
// `form.country === 'Switzerland'` checks against; the code exists only so the
// LABEL can be localised. Hardcoding 70 English names in a required field would
// have been the one untranslated control on an otherwise fully translated form.
const COUNTRIES: Array<[string, string]> = [
  ['CH', 'Switzerland'],
  ['AL', 'Albania'], ['DZ', 'Algeria'], ['AM', 'Armenia'], ['AT', 'Austria'], ['AZ', 'Azerbaijan'],
  ['BE', 'Belgium'], ['BJ', 'Benin'], ['BA', 'Bosnia and Herzegovina'], ['BG', 'Bulgaria'], ['BF', 'Burkina Faso'],
  ['CM', 'Cameroon'], ['HR', 'Croatia'], ['CZ', 'Czech Republic'], ['CD', 'Democratic Republic of the Congo'], ['DK', 'Denmark'],
  ['EG', 'Egypt'], ['EE', 'Estonia'], ['FI', 'Finland'], ['FR', 'France'], ['GM', 'Gambia'], ['GE', 'Georgia'],
  ['DE', 'Germany'], ['GH', 'Ghana'], ['GR', 'Greece'], ['GN', 'Guinea'], ['HU', 'Hungary'], ['IQ', 'Iraq'],
  ['IE', 'Ireland'], ['IT', 'Italy'], ['CI', 'Ivory Coast'], ['JO', 'Jordan'], ['KZ', 'Kazakhstan'], ['KE', 'Kenya'],
  ['XK', 'Kosovo'], ['LV', 'Latvia'], ['LB', 'Lebanon'], ['LR', 'Liberia'], ['LY', 'Libya'], ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'], ['MT', 'Malta'], ['ML', 'Mali'], ['MD', 'Moldova'], ['ME', 'Montenegro'], ['MA', 'Morocco'],
  ['NL', 'Netherlands'], ['NE', 'Niger'], ['NG', 'Nigeria'], ['MK', 'North Macedonia'], ['NO', 'Norway'],
  ['PL', 'Poland'], ['PT', 'Portugal'], ['RO', 'Romania'], ['SN', 'Senegal'], ['RS', 'Serbia'], ['SK', 'Slovakia'],
  ['SI', 'Slovenia'], ['ES', 'Spain'], ['SE', 'Sweden'], ['TZ', 'Tanzania'], ['TG', 'Togo'], ['TN', 'Tunisia'],
  ['TR', 'Turkey'], ['UG', 'Uganda'], ['UA', 'Ukraine'], ['GB', 'United Kingdom'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
]

// Names come from i18n/locales/*.json (register.location.countries.<CODE>),
// generated once with Intl.DisplayNames so every locale has a real translation
// and nothing depends on the browser's ICU data at runtime — Safari < 14 has no
// Intl.DisplayNames at all, and it is exactly the older phones this audience
// uses. Sorting still uses localeCompare, which is universally supported.
const countries = computed(() => {
  const label = (code: string, fallback: string) => {
    const key = `register.location.countries.${code}`
    const translated = t(key)
    // vue-i18n returns the key itself when it cannot resolve one.
    return translated === key ? fallback : translated
  }
  const items = COUNTRIES.map(([code, name]) => ({
    value: name,          // users.country stores the English name — unchanged.
    label: label(code, name),
    pinned: code === 'CH',
  }))
  // Switzerland first (that is where the cars are), then alphabetical in the
  // reader's own language, then the catch-all.
  const rest = items.filter(c => !c.pinned)
    .sort((a, b) => a.label.localeCompare(b.label, locale.value))
  return [
    ...items.filter(c => c.pinned),
    ...rest,
    { value: 'Other', label: t('register.location.countries.other'), pinned: false },
  ]
})

// An identity document is required for ONE thing: taking part in auctions.
// Sellers and direct buyers are never asked for one — bidding is what carries
// the "don't complete the purchase → permanent ban" rule that the ID enforces.
const needsIdDocument = computed(() => form.value.role === 'buyer' && form.value.buyerType === 'auction')

const setRole = (role: 'buyer' | 'seller') => {
  form.value.role = role
  if (role === 'seller') {
    form.value.buyerType = 'direct'
  }
}

// Leaving Switzerland must drop the canton. The field is hidden by v-if but its
// value stayed in the form, so a buyer in Nigeria could be filed under canton
// "Zurich" — which is also what decides the transport leg for a listing.
watch(() => form.value.country, (country) => {
  if (country !== 'Switzerland') form.value.canton = ''
})

// Switching away from the auction option must drop whatever was already picked,
// or a stale file would be uploaded for an account that does not need one.
watch(needsIdDocument, (needed) => {
  if (!needed) {
    idFile.value = null
    idFileName.value = ''
    idFileError.value = ''
    form.value.idConsent = false
  }
})

const onIdFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  idFileError.value = ''
  idFile.value = null
  idFileName.value = ''
  if (!file) return

  // Accept ANY image plus PDF here. iPhones send image/heic and some Android
  // browsers send image/webp; checking the allow-list before compression
  // rejected those outright, which locked those users out of signing up.
  const isImage = file.type.startsWith('image/')
  if (!isImage && file.type !== 'application/pdf') {
    idFileError.value = t('register.validation.id_file_type')
    target.value = ''
    return
  }

  // Phone cameras produce 5-12 MB photos, which used to blow past the request
  // limit and fail with an unhelpful error. compressImage() also converts HEIC
  // and WebP to JPEG, which is what makes the file acceptable to the server.
  let prepared = file
  if (isImage) {
    try {
      prepared = await compressImage(file, { maxDimension: 2000, quality: 0.85, skipUnderKB: 0 })
    } catch {
      prepared = file
    }
  }

  // Now that it has been converted, check what we are actually about to send.
  if (!ALLOWED_ID_TYPES.includes(prepared.type)) {
    idFileError.value = t('register.validation.id_file_type')
    target.value = ''
    return
  }

  if (prepared.size > MAX_ID_BYTES) {
    idFileError.value = t('register.validation.id_file_size') || 'That file is too large. Please upload a document smaller than 6 MB.'
    target.value = ''
    return
  }

  idFile.value = prepared
  idFileName.value = file.name
}

const handleRegister = async () => {
  error.value = null

  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('register.validation.passwords_not_match') || 'Passwords do not match'
    return
  }
  if (form.value.password.length < 8) {
    error.value = t('register.validation.password_length') || 'Password must be at least 8 characters long'
    return
  }
  // A seller's number is published on their listings, so theirs is the only one
  // that is mandatory. Everyone else may leave it blank.
  if (form.value.role === 'seller' && !form.value.phone) {
    error.value = t('register.validation.phone_required') || 'Phone number is required'
    return
  }
  if (form.value.phone && !isPlausiblePhone(form.value.phone)) {
    error.value = t('register.validation.phone_invalid')
    return
  }
  if (!form.value.termsAccepted || !form.value.privacyAccepted) {
    error.value = t('register.validation.accept_terms') || 'Please accept the terms and privacy policy'
    return
  }
  // Auction accounts only. Everyone else signs up without a document.
  if (needsIdDocument.value && !idFile.value) {
    error.value = t('register.validation.id_required')
    return
  }
  if (needsIdDocument.value && !form.value.idConsent) {
    error.value = t('register.validation.id_consent_required') || 'Please confirm you consent to your ID document being processed.'
    return
  }

  try {
    loading.value = true

    // Only auction accounts send a document, and only if one was picked.
    let idFileMimeType: string | null = null
    let idFileBase64: string | null = null
    if (idFile.value) {
      idFileMimeType = idFile.value.type
      idFileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(idFile.value!)
      })
    }

    // Keep the '+'. Stripping every non-digit turned "+40 721 234 567" into an
    // unreachable "40721234567" for every non-Swiss user on the site.
    const cleanedPhone = normalisePhone(form.value.phone)

    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        phone: cleanedPhone,
        role: form.value.role,
        buyerType: form.value.buyerType,
        companyName: form.value.companyName,
        businessType: form.value.businessType,
        canton: form.value.canton,
        city: form.value.city,
        zipCode: form.value.zipCode,
        country: form.value.country,
        taxId: form.value.taxId,
        streetAddress: form.value.streetAddress,
        idFileBase64,
        idFileMimeType,
        marketingAccepted: form.value.marketingAccepted
      }
    })

    registered.value = true
    // navigateTo('/login') used to 404: with i18n strategy 'prefix' the real
    // route is /<locale>/login. The auction flag lets the login page show the
    // "waiting for approval" note ONLY to accounts that actually asked to bid.
    // Object form, not a raw '?a=1&b=2' string: localePath() resolves through
    // the router, and the object form is the only shape guaranteed to keep the
    // query intact across locales.
    await navigateTo(localePath({
      path: '/login',
      query: needsIdDocument.value ? { registered: '1', auction: '1' } : { registered: '1' },
    }))
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.data?.message || err.message
      || t('register.messages.registration_failed') || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.2);
}
</style>