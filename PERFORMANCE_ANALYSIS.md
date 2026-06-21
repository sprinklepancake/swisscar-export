# 🚀 Website Performance Analysis Report
**Website:** https://swissexportcar.ch/en  
**Framework:** Nuxt 3.x with Vue 3  
**Date:** June 2025

---

## ⚠️ CRITICAL PERFORMANCE ISSUES IDENTIFIED

### 1. **Client-Side Data Fetching on Homepage (HIGH IMPACT)**
**Location:** `/pages/index.vue` lines 453-458

```javascript
onMounted(async () => {
  await Promise.all([
    fetchFeaturedCars(),
    fetchFilterOptions(),
    fetchStats()
  ])
})
```

**Problem:**
- All data fetching happens in `onMounted()` which is **client-side only**
- This causes:
  - Slow First Contentful Paint (FCP)
  - Poor Largest Contentful Paint (LCP)
  - Waterfall loading pattern
  - Blank content during initial load

**Solution:** Use Nuxt's `useFetch` or `useAsyncData` for server-side rendering:
```typescript
// In pages/index.vue
const { data: featuredCars } = await useFetch('/api/cars/featured', {
  params: { limit: 20 },
  lazy: false, // Block navigation until loaded
  server: true, // Fetch on server
  getCachedData: key => useNuxtData(key).data.value
})
```

---

### 2. **Inefficient API Calls with Fallback Chains (MEDIUM IMPACT)**
**Location:** `/pages/index.vue` lines 462-486, 558-591

```javascript
const fetchFeaturedCars = async () => {
  try {
    data = await $fetch('/api/cars/featured', { params: { limit: 20 } })
  } catch (error1) {
    const response = await $fetch('/api/cars', {
      params: { featured: true, limit: 20, status: 'active' }
    })
    data = response?.cars || response || []
  }
}
```

**Problem:**
- Multiple sequential API calls with try-catch fallbacks
- Each failed attempt adds latency
- No caching strategy implemented

**Solution:** 
- Implement proper error handling with single endpoint
- Add API response caching with `swr` (stale-while-revalidate)
- Use Nitro server-level caching

---

### 3. **No Image Optimization (HIGH IMPACT)**
**Location:** Throughout the app - car images are loaded directly from Supabase/storage

**Problem:**
- Images are not optimized (no WebP/AVIF conversion)
- No lazy loading implementation
- No responsive image sizes (`srcset`)
- Large images block rendering

**Evidence:** Line 215-219 in `/pages/index.vue`:
```vue
<img 
  :src="car.images && car.images[0] ? car.images[0] : '/placeholder-car.jpg'" 
  :alt="`${car.make} ${car.model}`"
  class="w-full h-full object-cover"
>
```

**Solution:**
```vue
<NuxtImg
  :src="car.images[0]"
  :alt="`${car.make} ${car.model}`"
  format="webp"
  quality="80"
  loading="lazy"
  class="w-full h-full object-cover"
/>
```

Also enable in `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'ipx', // or cloudinary/cloudflare
    domains: ['your-supabase-domain.supabase.co']
  }
})
```

---

### 4. **Heavy CSS Animations Without Optimization (MEDIUM IMPACT)**
**Location:** `/pages/index.vue` lines 5-12, `/assets/css/main.css`

```vue
<div class="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
```

**Problem:**
- Multiple animated elements with `blur-xl` filters
- `mix-blend-multiply` is GPU-intensive
- Can cause layout thrashing on mobile devices

**Solution:**
- Use `will-change: transform` for animated elements
- Reduce blur intensity on mobile
- Consider using CSS containment: `contain: layout style paint`

---

### 5. **Missing SSR/Prerendering Configuration (HIGH IMPACT)**
**Location:** `/nuxt.config.ts` lines 50-71

```typescript
routeRules: {
  '/': { prerender: true },
  '/admin': { ssr: false },
  '/en/admin': { ssr: false },
  // ... more routes with ssr: false
}
```

**Problem:**
- Only homepage (`/`) is prerendered
- Cars listing page (`/cars`) is NOT prerendered or cached
- Admin routes disable SSR entirely (acceptable for admin)

**Solution:**
```typescript
routeRules: {
  '/': { prerender: true },
  '/**': { ssr: true }, // Enable SSR for all other routes
  '/api/**': { 
    cors: true,
    cache: { maxAge: 300 } // 5 minute cache for API
  },
  '/cars': { 
    ssr: true,
    cache: { maxAge: 60 } // Cache car listings for 1 minute
  },
  '/cars/**': { 
    ssr: true,
    cache: { maxAge: 120 } // Cache individual car pages for 2 minutes
  }
}
```

---

### 6. **Inefficient Filtering Logic (MEDIUM IMPACT)**
**Location:** `/pages/cars/index.vue` lines 643-689

```typescript
const filteredCars = computed(() => {
  let result = [...cars.value]
  
  if (filters.value.make) result = result.filter(c => c.make?.toLowerCase().includes(filters.value.make.toLowerCase()))
  if (filters.value.model) result = result.filter(c => { /* ... */ })
  // ... 25+ filter conditions
})
```

**Problem:**
- Client-side filtering of ALL cars downloaded from API
- No server-side filtering/pagination
- Computed property recalculates on every filter change
- Array spread `[...cars.value]` creates new array each time

**Solution:**
Move filtering to server-side API:
```typescript
// In /server/api/cars/index.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const supabase = getSupabaseAdmin()
  
  let dbQuery = supabase.from('cars').select('*', { count: 'exact' })
  
  // Apply filters server-side
  if (query.make) dbQuery = dbQuery.eq('make', query.make)
  if (query.priceMin) dbQuery = dbQuery.gte('price', query.priceMin)
  // ... etc
  
  // Add pagination
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  dbQuery = dbQuery.range((page - 1) * limit, page * limit - 1)
  
  const { data, error } = await dbQuery
  return { data, total: count }
})
```

---

### 7. **No Component Lazy Loading (LOW-MEDIUM IMPACT)**
**Location:** Components are imported globally

**Problem:**
- All components loaded in initial bundle
- Large JavaScript payload
- Slow Time to Interactive (TTI)

**Solution:**
```vue
<!-- Lazy load heavy components -->
<script setup lang="ts">
const ChatSystem = defineAsyncComponent(() => import('~/components/ChatSystem.vue'))
const BidForm = defineAsyncComponent(() => import('~/components/BidForm.vue'))
</script>
```

---

### 8. **Excessive Watchers and Reactive Dependencies (MEDIUM IMPACT)**
**Location:** `/pages/cars/index.vue` lines 813-828

```typescript
watch(
  () => route.query,
  (nq) => {
    // Updates filters
    if (Object.keys(nq).length > 0) applyFilters()
  }
)
```

**Problem:**
- Deep watchers on route changes
- Triggers full filter recalculation
- Can cause infinite loops if not careful

**Solution:**
- Use debounced watchers
- Only watch specific query parameters
- Use URL state management libraries like `useRouteQuery` from VueUse

---

### 9. **Large Bundle Size Indicators**
**Evidence:**
- 1583 lines in `/pages/cars/[id].vue`
- 908 lines in `/pages/cars/index.vue`
- 735 lines in `/pages/index.vue`
- Complex template logic with many v-if/v-for

**Recommendation:**
- Split large components into smaller composables
- Extract repeated logic into utilities
- Use tree-shaking friendly imports

---

### 10. **Missing Performance Headers**
**Location:** `/nuxt.config.ts`

**Add:**
```typescript
headers: {
  'Cache-Control': 'public, max-age=300, s-maxage=600',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'self' ..."
}
```

---

## 📊 RECOMMENDED PRIORITY ORDER

### 🔴 Critical (Do First)
1. **Implement Server-Side Rendering with useAsyncData** - Will improve FCP by 40-60%
2. **Add Image Optimization** - Will reduce page weight by 50-70%
3. **Enable Route Caching** - Will reduce server load and improve TTFB

### 🟡 High Priority
4. **Move Filtering to Server-Side** - Will reduce client processing
5. **Fix API Call Patterns** - Will reduce latency
6. **Optimize CSS Animations** - Will improve mobile performance

### 🟢 Medium Priority
7. **Lazy Load Components** - Will reduce initial bundle size
8. **Add Performance Monitoring** - Track Core Web Vitals
9. **Implement Service Worker** - Enable offline caching

---

## 🛠️ QUICK WINS (Can be done in 1-2 hours)

1. **Add `loading="lazy"` to all images**
2. **Enable Gzip/Brotli compression** (check hosting config)
3. **Add `rel="preload"` for critical fonts**
4. **Minify CSS/JS in production** (should be automatic in Nuxt)
5. **Add `<link rel="preconnect">` for Supabase domain**

---

## 📈 EXPECTED IMPROVEMENTS

After implementing these changes:

| Metric | Current (Estimated) | Target | Improvement |
|--------|---------------------|--------|-------------|
| First Contentful Paint | 2.5-4.0s | <1.5s | 50-60% faster |
| Largest Contentful Paint | 3.5-5.0s | <2.5s | 40-50% faster |
| Time to Interactive | 4.0-6.0s | <3.0s | 40-50% faster |
| Total Bundle Size | ~500KB+ | ~250KB | 50% smaller |
| Lighthouse Score | 60-75 | 90+ | +20-30 points |

---

## 🔧 NEXT STEPS

1. Run Lighthouse audit to get baseline metrics
2. Implement server-side data fetching first
3. Add @nuxt/image module
4. Configure route caching rules
5. Test on real mobile devices with slow 3G

Would you like me to help implement any of these fixes?
