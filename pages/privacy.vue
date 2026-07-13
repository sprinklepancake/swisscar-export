<!-- pages/privacy.vue
     Privacy Policy — drafted to meet Swiss nFADP (Art. 19) transparency duties
     and to align with the EU GDPR for buyers/sellers in the EU markets you serve.
     REPLACE every [BRACKETED] placeholder before going live, and have a lawyer
     confirm the retention periods and the Swiss-representative question if you
     process large volumes of EU/Swiss data. -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
    <div class="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <h1 class="text-3xl sm:text-4xl font-bold text-red-800 mb-2">Privacy Policy</h1>
      <p class="text-sm text-gray-500 mb-8">Last updated: 13 July 2026</p>

      <div class="max-w-none text-gray-800 space-y-6 leading-relaxed text-sm sm:text-base">
        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">1. Who is responsible</h2>
          <p>
            The controller responsible for processing your personal data is
            SwissCarExport, [ADDRESS], Switzerland. For any data-protection
            question or to exercise your rights, contact us at
            <strong>[DATA PROTECTION EMAIL]</strong>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">2. What data we collect</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> name, email address, phone number, password (stored securely by our authentication provider), account type (buyer/seller), and language preference.</li>
            <li><strong>Seller / business data:</strong> company name, business type, tax ID, and address, where you provide them.</li>
            <li><strong>Identity documents:</strong> if you upload an ID document for verification, we process it to confirm your identity. This is sensitive data and is processed only with your explicit consent.</li>
            <li><strong>Listing data:</strong> vehicle details, photos, price and location you publish.</li>
            <li><strong>Messages:</strong> the content of chats you exchange with other users through the platform.</li>
            <li><strong>Wallet &amp; transactions:</strong> your balance, listing fees, and transaction history.</li>
            <li><strong>Technical data:</strong> IP address, browser information and server logs generated when you use the site.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">3. Why we process it and on what basis</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>To provide the marketplace</strong> (accounts, listings, messaging, wallet) — performance of our contract with you.</li>
            <li><strong>To verify identity and prevent fraud/abuse</strong> — your consent (for ID documents) and our legitimate interest in a trustworthy platform.</li>
            <li><strong>To process listing fees and keep records</strong> — performance of contract and our legal accounting obligations.</li>
            <li><strong>To secure the site and diagnose problems</strong> — our legitimate interest in a safe, working service.</li>
            <li><strong>To comply with legal obligations</strong> where the law requires it.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">4. How long we keep it</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> for as long as your account is active, and up to 12 months after you close it, unless a longer period is legally required.</li>
            <li><strong>Identity documents:</strong> until verification is complete and then deleted, or at most 90 days, unless we must keep them for a legal reason.</li>
            <li><strong>Transaction and invoice records:</strong> 10 years, as required by the Swiss Code of Obligations.</li>
            <li><strong>Server logs:</strong> up to 90 days.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">5. Who we share it with</h2>
          <p>
            We use trusted service providers who process data on our behalf: Supabase
            (database, authentication and file storage) and Render (hosting). Your listing
            details and public profile information are visible to other users of the platform.
            Your contact details are shared with a counterparty only as needed to complete a
            transaction. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">6. International transfers</h2>
          <p>
            Some providers may process data outside Switzerland or the EU/EEA. Where they do,
            we rely on adequacy decisions or appropriate safeguards (such as standard
            contractual clauses) to protect your data.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">7. Your rights</h2>
          <p>
            You have the right to access, correct, delete, restrict, or object to the
            processing of your personal data, and to receive it in a portable form. To
            exercise any of these, email <strong>[DATA PROTECTION EMAIL]</strong>; we will
            respond within 30 days. You may also lodge a complaint with the Swiss Federal
            Data Protection and Information Commissioner (FDPIC), or, if you are in the EU,
            your local data protection authority.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">8. Cookies</h2>
          <p>
            We use only strictly necessary cookies: a session cookie to keep you logged in
            and a cookie that remembers your language choice. These are required for the site
            to work and do not need consent. We do not currently use advertising or analytics
            cookies. If we add analytics in the future, we will ask for your consent first and
            update this policy.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">9. Security</h2>
          <p>
            We take reasonable technical and organisational measures to protect your data,
            including access controls and encrypted connections. No system is perfectly
            secure, but we work to keep your information safe and will notify you and the
            authorities of a serious data breach as required by law.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-red-800 mb-2">10. Changes</h2>
          <p>
            We may update this policy. The "last updated" date shows the latest version, and
            we will notify you of significant changes.
          </p>
        </section>
      </div>

      <NuxtLink to="/" class="inline-block mt-10 text-red-700 hover:text-red-900 font-medium">← Back to home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Privacy Policy — SwissCarExport' })
</script>