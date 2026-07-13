<!-- pages/impressum.vue
     Legal notice (Impressum) required for Swiss commercial websites.
     REPLACE every [BRACKETED] placeholder with your real company details
     before going live. Company name must match your trade-register entry. -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <div class="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 class="text-3xl sm:text-4xl font-bold text-red-800 mb-2">Legal Notice (Impressum)</h1>
      <p class="text-sm text-gray-500 mb-8">Last updated: 13 July 2026</p>

      <div class="prose prose-sm sm:prose-base max-w-none text-gray-800 space-y-6 leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-red-800">Website operator</h2>
          <p>
            SwissCarExport &nbsp;[confirm exact registered name + legal form, e.g. SwissCarExport GmbH]<br>
            [STREET AND NUMBER]<br>
            [POSTAL CODE] [CITY]<br>
            Switzerland
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800">Contact</h2>
          <p>
            Email: [CONTACT EMAIL]<br>
            Phone: [PHONE NUMBER]
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800">Commercial register</h2>
          <p>
            Company registration number (UID): [CHE-XXX.XXX.XXX]<br>
            Registered office: [CANTON / CITY]<br>
            Represented by: [FULL NAME(S) OF OWNER / MANAGING DIRECTOR]
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800">VAT</h2>
          <p>VAT number: [CHE-XXX.XXX.XXX MWST] (or state "Not VAT-registered" if applicable)</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800">Hosting</h2>
          <p>
            This website is hosted by Render Services, Inc. and uses Supabase Inc. for
            database, authentication and file storage. Data may be processed on their
            infrastructure. See our <NuxtLink to="/privacy" class="text-red-600 hover:underline">Privacy Policy</NuxtLink> for details.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800">Disclaimer</h2>
          <p>
            SwissCarExport operates an online marketplace that connects sellers and buyers
            of used vehicles for export from Switzerland. We are not a party to the sale
            contracts concluded between users. See our
            <NuxtLink to="/terms" class="text-red-600 hover:underline">Terms of Service</NuxtLink> for the full terms.
          </p>
        </section>
      </div>

      <NuxtLink to="/" class="inline-block mt-10 text-red-700 hover:text-red-900 font-medium">← Back to home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Legal Notice (Impressum) — SwissCarExport' })
</script>