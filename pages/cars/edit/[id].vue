<!-- pages/cars/edit/[id].vue
     Every "Edit" button on the site (profile, dashboard, my-cars) linked here,
     but the page did not exist. Sellers could not correct a single detail after
     publishing — a typo in the price meant deleting the listing and paying the
     fee again. -->
<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto">
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
      </div>

      <div v-else-if="loadError" class="rounded-xl border border-red-300 bg-red-50 p-6 text-center">
        <p class="text-red-800">{{ loadError }}</p>
        <NuxtLink :to="localePath('/dashboard/my-cars')" class="inline-block mt-4 text-red-700 underline font-medium">
          {{ t('profile.my_listings.title') }}
        </NuxtLink>
      </div>

      <form v-else @submit.prevent="save" class="space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-red-800">{{ t('edit_listing.title') }}</h1>
            <p class="text-gray-600 text-sm mt-1">{{ car.year }} {{ car.make }} {{ car.model }}</p>
          </div>
          <NuxtLink :to="localePath(`/cars/${car.id}`)" class="text-sm text-red-700 underline shrink-0 mt-1">
            {{ t('messages.view') }}
          </NuxtLink>
        </div>

        <p class="text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg p-3">
          {{ t('edit_listing.fixed_fields_note') }}
        </p>

        <!-- Price -->
        <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('edit_listing.price_section') }}</h2>

          <div v-if="car.listingType === 'auction'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('auction.starting_price') }} (CHF)</label>
              <input v-model="form.startingPrice" type="number" min="0" step="50" :disabled="hasBids"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100" />
              <p v-if="hasBids" class="text-xs text-amber-700 mt-1">{{ t('edit_listing.starting_price_locked') }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('auction.reserve_price') }} (CHF)</label>
              <input v-model="form.reservePrice" type="number" min="0" step="50"
                     class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div v-else>
            <label class="block text-sm text-gray-700 mb-1">{{ t('car_details.price') }} (CHF)</label>
            <input v-model="form.price" type="number" min="0" step="50" required
                   class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </section>

        <!-- Condition -->
        <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('edit_listing.condition_section') }}</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.mileage') }} (km)</label>
              <input v-model="form.mileage" type="number" min="0" required
                     class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.condition') }}</label>
              <select v-model="form.condition" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="excellent">{{ t('condition_excellent') }}</option>
                <option value="good">{{ t('condition_good') }}</option>
                <option value="fair">{{ t('condition_fair') }}</option>
                <option value="poor">{{ t('condition_poor') }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.exportDocuments" class="w-4 h-4 rounded border-gray-300 text-red-600" />
              {{ t('car_listing_form.export_documents_available') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.withWarranty" class="w-4 h-4 rounded border-gray-300 text-red-600" />
              {{ t('car_listing_form.with_warranty') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.validInspection" class="w-4 h-4 rounded border-gray-300 text-red-600" />
              {{ t('car_listing_form.valid_inspection') }}
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.hasAccident" class="w-4 h-4 rounded border-gray-300 text-red-600" />
              {{ t('car_listing_form.accident_vehicle') }}
            </label>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.description') }}</label>
            <textarea v-model="form.description" rows="5"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
          </div>
        </section>

        <!-- Photos -->
        <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('car_listing_form.photos') }}</h2>

          <div v-if="form.images.length" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div v-for="(img, i) in form.images" :key="img + i" class="relative">
              <img :src="img" alt="" class="w-full h-20 object-cover rounded-lg" />
              <button type="button" @click="form.images.splice(i, 1)"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs">×</button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">{{ t('edit_listing.no_photos') }}</p>

          <div>
            <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="addPhotos" />
            <button type="button" @click="fileInput?.click()" :disabled="uploading"
                    class="px-4 py-2 border border-red-600 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50">
              {{ uploading ? t('car_listing_form.publishing') : t('car_listing_form.click_to_upload') }}
            </button>
            <p v-if="uploadError" class="text-sm text-red-700 mt-2">{{ uploadError }}</p>
          </div>
        </section>

        <!-- Location & contact -->
        <section class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('edit_listing.location_section') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.canton') }}</label>
              <input v-model="form.canton" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.city') }}</label>
              <input v-model="form.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.zip_code') }}</label>
              <input v-model="form.zipCode" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('car_listing_form.phone') }}</label>
              <input v-model="form.sellerPhone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
        </section>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" :disabled="saving"
                  class="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
            {{ saving ? t('profile.saving') : t('profile.actions.save_changes') }}
          </button>
          <NuxtLink :to="localePath('/dashboard/my-cars')" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            {{ t('profile.actions.cancel') }}
          </NuxtLink>
          <p v-if="message" class="text-sm" :class="messageIsError ? 'text-red-700' : 'text-green-700'">{{ message }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const auth = useAuth()
const { apiFetch } = useApiFetch()
const { compressImage } = useImageCompression()

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const message = ref('')
const messageIsError = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const car = ref<any>({})
const hasBids = computed(() => (car.value?.bidCount || 0) > 0)

const form = ref({
  price: '' as any,
  startingPrice: '' as any,
  reservePrice: '' as any,
  mileage: '' as any,
  condition: 'good',
  description: '',
  canton: '',
  city: '',
  zipCode: '',
  sellerPhone: '',
  exportDocuments: false,
  withWarranty: false,
  validInspection: false,
  hasAccident: false,
  images: [] as string[],
})

useHead({ title: t('edit_listing.title') })

onMounted(async () => {
  try {
    const data: any = await apiFetch(`/api/cars/${route.params.id}`)
    car.value = data

    const currentUser = auth.user.value
    if (currentUser && data.sellerId && data.sellerId !== currentUser.id && currentUser.role !== 'admin') {
      loadError.value = t('edit_listing.not_yours')
      return
    }

    form.value = {
      price: data.price ?? '',
      startingPrice: data.startingPrice ?? '',
      reservePrice: data.reservePrice ?? '',
      mileage: data.mileage ?? '',
      condition: data.condition || 'good',
      description: data.description || '',
      canton: data.canton || '',
      city: data.city || '',
      zipCode: data.zipCode || '',
      sellerPhone: data.sellerPhone || '',
      exportDocuments: !!data.exportDocuments,
      withWarranty: !!data.withWarranty,
      validInspection: !!data.validInspection,
      hasAccident: !!data.hasAccident,
      images: Array.isArray(data.images) ? [...data.images] : [],
    }
  } catch (err: any) {
    loadError.value = err?.data?.statusMessage || t('edit_listing.load_failed')
  } finally {
    loading.value = false
  }
})

const addPhotos = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files?.length) return

  uploading.value = true
  uploadError.value = ''
  try {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const result: any = await apiFetch('/api/upload/image', { method: 'POST', body: fd })
      if (result?.url) form.value.images.push(result.url)
    }
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || t('car_listing_form.upload_failed_generic')
  } finally {
    uploading.value = false
    target.value = ''
  }
}

const save = async () => {
  saving.value = true
  message.value = ''
  messageIsError.value = false
  try {
    await apiFetch(`/api/cars/${route.params.id}/update`, { method: 'POST', body: form.value })
    message.value = t('edit_listing.saved')
  } catch (err: any) {
    messageIsError.value = true
    message.value = err?.data?.statusMessage || t('edit_listing.save_failed')
  } finally {
    saving.value = false
  }
}
</script>
