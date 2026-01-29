<!-- pages/admin.vue - FIXED VERSION -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading admin panel...</p>
      </div>
    </div>
    
    <!-- Not Admin -->
    <div v-else-if="!isAdmin" class="flex items-center justify-center min-h-screen">
      <div class="text-center p-8 max-w-md">
        <div class="text-red-500 text-6xl mb-4">🚫</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
        <p class="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
        <div class="space-y-3">
          <button 
            @click="goToHome" 
            class="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Homepage
          </button>
          <div v-if="!authenticated">
            <p class="text-gray-500 text-sm mb-2">Not logged in?</p>
            <button 
              @click="goToLogin" 
              class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Admin Dashboard -->
    <div v-else class="p-4 md:p-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600 mt-1">Welcome back, {{ adminData?.name }}</p>
          </div>
          <div class="flex items-center mt-4 md:mt-0">
            <div class="mr-4 text-right">
              <p class="font-semibold">{{ adminData?.name }}</p>
              <p class="text-sm text-gray-500">Admin • {{ adminData?.funds || 0 }} CHF</p>
            </div>
            <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {{ adminData?.name?.charAt(0) || 'A' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Users" 
          :value="stats.totalUsers" 
          icon="👥"
          color="blue"
        />
        <StatCard 
          title="Active Listings" 
          :value="stats.activeListings" 
          icon="🚗"
          color="green"
        />
        <StatCard 
          title="Unverified Users" 
          :value="stats.unverifiedUsers" 
          icon="⏳"
          color="yellow"
        />
        <StatCard 
          title="Today's Revenue" 
          :value="`${stats.todaysRevenue} CHF`" 
          icon="💰"
          color="purple"
        />
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            @click="activeTab = 'users'"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">👥</div>
            <p class="font-medium">Manage Users</p>
          </button>
          <button 
            @click="activeTab = 'listings'"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">🚗</div>
            <p class="font-medium">Manage Listings</p>
          </button>
          <button 
            @click="activeTab = 'funds'"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">💰</div>
            <p class="font-medium">Manage Funds</p>
          </button>
          <button 
            @click="refreshData"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">🔄</div>
            <p class="font-medium">Refresh</p>
          </button>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              :class="activeTab === tab.id 
                ? 'border-red-600 text-red-700 bg-red-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>
        
        <!-- Tab Content -->
        <div class="p-6">
          <!-- Users Tab -->
          <div v-if="activeTab === 'users'">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">User Management</h2>
              <div class="flex space-x-2 mt-2 md:mt-0">
                <input
                  v-model="userSearch"
                  type="text"
                  placeholder="Search users..."
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full md:w-auto"
                />
                <select
                  v-model="userFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Users</option>
                  <option value="buyer">Buyers</option>
                  <option value="seller">Sellers</option>
                  <option value="admin">Admins</option>
                  <option value="banned">Banned</option>
                  <option value="unverified">Unverified Users</option>
                  <option value="verified">Verified Users</option>
                </select>
              </div>
            </div>
            
            <div v-if="filteredUsers.length === 0" class="text-center py-8">
              <div class="text-gray-400 text-6xl mb-4">👥</div>
              <p class="text-gray-500">No users found</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funds</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                    <td class="px-4 py-4">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {{ user.name?.charAt(0) || 'U' }}
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                          <div class="text-xs text-gray-400 mt-1">
                            Joined {{ formatDate(user.createdAt) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <span class="px-3 py-1 text-xs font-semibold rounded-full" :class="roleClasses(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="space-y-1">
                        <span class="px-2 py-1 text-xs rounded-full block w-fit" 
                          :class="user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                          {{ user.banned ? 'Banned' : 'Active' }}
                        </span>
                        <span class="px-2 py-1 text-xs rounded-full block w-fit"
                          :class="user.verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'">
                          {{ user.verified ? 'Verified' : 'Unverified' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <span class="font-bold text-gray-900">{{ user.funds || 0 }} CHF</span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-if="!user.verified"
                          @click="verifyUser(user.id)"
                          class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Verify
                        </button>
                        <button
                          v-if="user.verified"
                          @click="unverifyUser(user.id)"
                          class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                        >
                          Unverify
                        </button>
                        <button
                          v-if="!user.banned && user.id !== adminData?.id"
                          @click="banUser(user.id)"
                          class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Ban
                        </button>
                        <button
                          v-if="user.banned"
                          @click="unbanUser(user.id)"
                          class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Unban
                        </button>
                        <button
                          @click="editUserFunds(user)"
                          class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                        >
                          Funds
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <button
                        @click="viewUserTransactions(user)"
                        class="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Listings Tab -->
          <div v-else-if="activeTab === 'listings'">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Listing Management</h2>
              <div class="flex space-x-2 mt-2 md:mt-0">
                <input
                  v-model="listingSearch"
                  type="text"
                  placeholder="Search listings..."
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full md:w-auto"
                />
                <select
                  v-model="listingFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Listings</option>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                  <option value="auction">Auctions</option>
                  <option value="normal">Normal Listings</option>
                </select>
              </div>
            </div>
            
            <div v-if="listings.length === 0" class="text-center py-8">
              <div class="text-gray-400 text-6xl mb-4">🚗</div>
              <p class="text-gray-500">No listings found</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="listing in filteredListings" :key="listing.id" 
                   class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div class="flex flex-col md:flex-row md:items-center justify-between">
                  <div class="mb-4 md:mb-0 md:flex-1">
                    <h3 class="font-semibold text-lg">{{ listing.title || 'No Title' }}</h3>
                    <p class="text-gray-600 text-sm">{{ listing.description?.substring(0, 100) }}...</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {{ listing.type || 'normal' }}
                      </span>
                      <span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {{ listing.status || 'active' }}
                      </span>
                      <span class="px-2 py-1 text-xs font-bold">
                        {{ listing.price || 0 }} CHF
                      </span>
                      <span v-if="listing.auction" class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Auction
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                      Posted by: {{ listing.sellerName || 'Unknown' }} • 
                      {{ formatDate(listing.createdAt) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      v-if="listing.status !== 'sold'"
                      @click="markAsSold(listing.id)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 whitespace-nowrap"
                    >
                      Mark Sold
                    </button>
                    <button
                      @click="removeListing(listing.id)"
                      class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Funds Tab -->
          <div v-else-if="activeTab === 'funds'">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Funds Management</h2>
            
            <div class="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 class="font-semibold text-gray-900 mb-4">Quick Fund Adjustment</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                  <select
                    v-model="selectedUserForFunds"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choose a user...</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.name }} ({{ user.role }}) - {{ user.funds || 0 }} CHF
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Amount (CHF)</label>
                  <input
                    v-model="fundsAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div class="flex space-x-3">
                  <button
                    @click="addFunds"
                    :disabled="!selectedUserForFunds || !fundsAmount"
                    class="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Add Funds
                  </button>
                  <button
                    @click="removeFunds"
                    :disabled="!selectedUserForFunds || !fundsAmount"
                    class="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Remove Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Settings Tab -->
          <div v-else-if="activeTab === 'settings'">
            <h2 class="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Listing Fees Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h3 class="font-semibold text-gray-900 mb-4">Listing Fees</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Normal Listing Fee (CHF)</label>
                    <input
                      v-model="settings.normalListingFee"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">Fee for regular car listings</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Auction Listing Fee (CHF)</label>
                    <input
                      v-model="settings.auctionListingFee"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">Fee for auction listings</p>
                  </div>
                  <button
                    @click="updateListingFees"
                    :disabled="updatingSettings"
                    class="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <svg v-if="updatingSettings" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ updatingSettings ? 'Updating...' : 'Update Listing Fees' }}
                  </button>
                </div>
              </div>
              
              <!-- Feature Settings Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Feature Settings
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Feature Price (CHF)</label>
                    <input
                      v-model="featureSettings.price"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">Price for temporary feature</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Feature Duration (days)</label>
                    <input
                      v-model="featureSettings.durationDays"
                      type="number"
                      min="0"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">0 = permanent until sold/removed</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Listings Per Free Feature</label>
                    <input
                      v-model="featureSettings.listingsPerFreeFeature"
                      type="number"
                      min="1"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">Users get 1 free feature for every X listings</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Permanent Feature Price (CHF)</label>
                    <input
                      v-model="featureSettings.permanentFeaturePrice"
                      type="number"
                      step="5"
                      min="0"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p class="text-xs text-gray-500 mt-1">One-time payment for permanent feature</p>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-gray-900">Allow Permanent Features</p>
                      <p class="text-sm text-gray-500">Users can pay for permanent featuring</p>
                    </div>
                    <button
                      @click="toggleFeatureSetting('allowPermanentFeature')"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      :class="featureSettings.allowPermanentFeature ? 'bg-green-600' : 'bg-gray-300'"
                    >
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="featureSettings.allowPermanentFeature ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  
                  <button
                    @click="updateFeatureSettings"
                    :disabled="updatingFeatureSettings"
                    class="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <svg v-if="updatingFeatureSettings" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ updatingFeatureSettings ? 'Updating...' : 'Update Feature Settings' }}
                  </button>
                </div>
              </div>
              
              <!-- User Settings Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
                  </svg>
                  User Settings
                </h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-900">Require Verification</p>
                      <p class="text-sm text-gray-500">Users must be verified to bid/sell</p>
                    </div>
                    <button
                      @click="toggleSetting('requireIdVerification')"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      :class="settings.requireIdVerification ? 'bg-green-600' : 'bg-gray-300'"
                    >
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="settings.requireIdVerification ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-900">Free First 6 Months</p>
                      <p class="text-sm text-gray-500">New sellers get free listings</p>
                    </div>
                    <button
                      @click="toggleSetting('freeFirstSixMonths')"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      :class="settings.freeFirstSixMonths ? 'bg-green-600' : 'bg-gray-300'"
                    >
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="settings.freeFirstSixMonths ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-900">Auto-Expire Features</p>
                      <p class="text-sm text-gray-500">Remove featured status after duration</p>
                    </div>
                    <button
                      @click="toggleSetting('autoExpireFeatures')"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      :class="settings.autoExpireFeatures ? 'bg-green-600' : 'bg-gray-300'"
                    >
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="settings.autoExpireFeatures ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-900">Email Notifications</p>
                      <p class="text-sm text-gray-500">Send email alerts for important actions</p>
                    </div>
                    <button
                      @click="toggleSetting('emailNotifications')"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      :class="settings.emailNotifications ? 'bg-green-600' : 'bg-gray-300'"
                    >
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                      />
                    </button>
                  </div>
                  
                  <button
                    @click="updateUserSettings"
                    :disabled="updatingUserSettings"
                    class="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <svg v-if="updatingUserSettings" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ updatingUserSettings ? 'Updating...' : 'Update User Settings' }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Stats & Info Section -->
            <div class="mt-8 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Feature Statistics</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div class="text-2xl font-bold text-yellow-600">{{ featureStats?.activeFeaturedCars || 0 }}</div>
                  <p class="text-sm text-gray-600 mt-1">Active Featured Cars</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div class="text-2xl font-bold text-green-600">{{ featureStats?.permanentFeatures || 0 }}</div>
                  <p class="text-sm text-gray-600 mt-1">Permanent Features</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ featureStats?.freeFeaturesUsed || 0 }}</div>
                  <p class="text-sm text-gray-600 mt-1">Free Features Used</p>
                </div>
                <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ featureStats?.featureRevenue || 0 }} CHF</div>
                  <p class="text-sm text-gray-600 mt-1">Total Feature Revenue</p>
                </div>
              </div>
              
              <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="font-medium text-gray-900">Feature System Info</h4>
                    <p class="text-sm text-gray-600">Users earn 1 free feature for every {{ featureSettings.listingsPerFreeFeature }} listings</p>
                  </div>
                  <button
                    @click="refreshFeatureStats"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Refresh Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Funds Modal -->
    <div v-if="showEditFundsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Edit Funds</h3>
          <button @click="closeEditFundsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600">User: <span class="font-semibold">{{ editingUser?.name }}</span></p>
            <p class="text-sm text-gray-600">Email: <span class="font-semibold">{{ editingUser?.email }}</span></p>
            <p class="text-sm text-gray-600">Current Balance: <span class="font-semibold text-lg">{{ editingUser?.funds || 0 }} CHF</span></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Balance (CHF)</label>
            <input
              v-model="newFundsAmount"
              type="number"
              step="0.01"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              @click="closeEditFundsModal"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="updateUserFunds"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Update Funds
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Transactions Modal -->
    <div v-if="showUserTransactionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Transaction History</h3>
            <p class="text-sm text-gray-600">
              {{ viewingUser?.name }} ({{ viewingUser?.email }}) • 
              Role: {{ viewingUser?.role }} • 
              Current Balance: {{ viewingUser?.funds || 0 }} CHF
            </p>
          </div>
          <button @click="closeUserTransactionsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Filters -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-2">Transaction Type</label>
              <select
                v-model="transactionFilters.type"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                @change="loadUserTransactions"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="refund">Refunds</option>
                <option value="payment">Payments</option>
                <option value="listing_fee">Listing Fees</option>
                <option value="auction_fee">Auction Fees</option>
                <option value="feature_payment">Feature Payments</option>
                <option value="permanent_feature_payment">Permanent Features</option>
                <option value="bid_payment">Bid Payments</option>
                <option value="admin_adjustment">Admin Adjustments</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-2">Status</label>
              <select
                v-model="transactionFilters.status"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                @change="loadUserTransactions"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-2">From Date</label>
              <input
                v-model="transactionFilters.startDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                @change="loadUserTransactions"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-2">To Date</label>
              <input
                v-model="transactionFilters.endDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                @change="loadUserTransactions"
              />
            </div>
          </div>
          <div class="mt-3 flex justify-between">
            <div class="text-sm text-gray-600">
              Showing {{ userTransactions.length }} transactions
            </div>
            <button
              @click="resetTransactionFilters"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <!-- Loading -->
        <div v-if="loadingUserTransactions" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p class="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="userTransactions.length === 0" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-gray-400 text-4xl mb-4">💰</div>
            <p class="text-gray-500">No transactions found</p>
            <p class="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
        
        <!-- Transactions List -->
        <div v-else class="flex-1 overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Amount</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in userTransactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(transaction.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full" :class="getTransactionTypeClass(transaction.type)">
                    {{ formatTransactionType(transaction.type) }}
                  </span>
                  <p v-if="transaction.admin" class="text-xs text-gray-500 mt-1">
                    By: {{ transaction.admin.name }}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm font-semibold" :class="getTransactionAmountClass(transaction.type)">
                    {{ getTransactionAmountPrefix(transaction.type) }}{{ Math.abs(transaction.amount) }} CHF
                  </div>
                  <div class="text-xs text-gray-500">
                    Change: {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }} CHF
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <div class="font-medium">{{ transaction.newBalance }} CHF</div>
                  <div class="text-xs text-gray-500">
                    {{ transaction.previousBalance }} → {{ transaction.newBalance }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <div>{{ transaction.description }}</div>
                  <div v-if="transaction.metadata" class="text-xs text-gray-500 mt-1">
                    <span v-if="transaction.metadata.carMake">
                      {{ transaction.metadata.carMake }} {{ transaction.metadata.carModel }}
                    </span>
                    <span v-if="transaction.metadata.listingType">
                      • {{ transaction.metadata.listingType }}
                    </span>
                    <span v-if="transaction.metadata.featureType">
                      • {{ transaction.metadata.featureType }} feature
                    </span>
                  </div>
                  <div v-if="transaction.referenceId" class="text-xs text-gray-400 mt-1">
                    Ref: {{ transaction.referenceId }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full" :class="getTransactionStatusClass(transaction.status)">
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex space-x-1">
                    <button
                      v-if="transaction.type !== 'refund' && transaction.amount < 0"
                      @click="issueRefund(transaction)"
                      class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      title="Issue Refund"
                    >
                      Refund
                    </button>
                    <button
                      @click="viewTransactionDetails(transaction)"
                      class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      title="View Details"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Transaction Summary -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <p class="text-gray-600 text-sm">Total Deposits</p>
              <p class="text-lg font-bold text-green-600">+{{ userTransactionSummary?.totalDeposits || 0 }} CHF</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">Total Payments</p>
              <p class="text-lg font-bold text-red-600">-{{ userTransactionSummary?.totalPayments || 0 }} CHF</p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">Net Change</p>
              <p class="text-lg font-bold" :class="userTransactionSummary?.netChange >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ userTransactionSummary?.netChange >= 0 ? '+' : '' }}{{ userTransactionSummary?.netChange || 0 }} CHF
              </p>
            </div>
            <div class="text-center">
              <p class="text-gray-600 text-sm">Total Transactions</p>
              <p class="text-lg font-bold text-gray-800">{{ userTransactionSummary?.transactionCount || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex justify-end">
          <button
            @click="closeUserTransactionsModal"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Transaction Details Modal -->
    <div v-if="showTransactionDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Transaction Details</h3>
          <button @click="closeTransactionDetailsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedTransaction" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">Transaction ID</p>
              <p class="font-medium text-gray-900">#{{ selectedTransaction.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Reference</p>
              <p class="font-medium text-gray-900">{{ selectedTransaction.referenceId || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Date & Time</p>
              <p class="font-medium text-gray-900">{{ formatDateTime(selectedTransaction.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Type</p>
              <p class="font-medium">
                <span :class="getTransactionTypeClass(selectedTransaction.type)" class="px-2 py-1 rounded text-sm">
                  {{ formatTransactionType(selectedTransaction.type) }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Change Amount</p>
              <p class="text-xl font-bold" :class="getTransactionAmountClass(selectedTransaction.type)">
                {{ getTransactionAmountPrefix(selectedTransaction.type) }}{{ Math.abs(selectedTransaction.amount) }} CHF
              </p>
              <p class="text-sm text-gray-600">
                Change: {{ selectedTransaction.amount > 0 ? '+' : '' }}{{ selectedTransaction.amount }} CHF
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Status</p>
              <p>
                <span :class="getTransactionStatusClass(selectedTransaction.status)" class="px-2 py-1 rounded text-sm">
                  {{ selectedTransaction.status }}
                </span>
              </p>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-600">Description</p>
            <p class="font-medium text-gray-900 mt-1">{{ selectedTransaction.description }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <p class="text-sm text-gray-600">Previous Balance</p>
              <p class="font-medium text-gray-900">{{ selectedTransaction.previousBalance }} CHF</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">New Balance</p>
              <p class="font-medium text-gray-900">{{ selectedTransaction.newBalance }} CHF</p>
            </div>
          </div>
          
          <div v-if="selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0" 
               class="border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-600 mb-2">Metadata</p>
            <pre class="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">{{ JSON.stringify(selectedTransaction.metadata, null, 2) }}</pre>
          </div>
          
          <div v-if="selectedTransaction.admin" class="border-t border-gray-200 pt-4">
            <p class="text-sm text-gray-600">Processed By</p>
            <p class="font-medium text-gray-900">
              {{ selectedTransaction.admin.name }} ({{ selectedTransaction.admin.email }})
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="closeTransactionDetailsModal"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              v-if="selectedTransaction.type !== 'refund' && selectedTransaction.amount < 0"
              @click="issueRefund(selectedTransaction)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Issue Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stat Card Component
const StatCard = defineComponent({
  props: {
    title: String,
    value: [String, Number],
    icon: String,
    color: String
  },
  setup(props) {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    }
    
    return () => h('div', { class: 'bg-white rounded-xl shadow p-4' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [
          h('p', { class: 'text-gray-500 text-sm' }, props.title),
          h('p', { class: 'text-2xl font-bold text-gray-900 mt-1' }, props.value)
        ]),
        h('div', { 
          class: `w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[props.color as keyof typeof colorClasses] || 'bg-gray-100'}` 
        }, [
          h('span', { class: 'text-xl' }, props.icon)
        ])
      ])
    ])
  }
})

// Main Admin Component
const loading = ref(true)
const isAdmin = ref(false)
const authenticated = ref(false)
const adminData = ref<any>(null)
const users = ref<any[]>([])
const listings = ref<any[]>([])
const activeTab = ref('users')
const userSearch = ref('')
const userFilter = ref('all')
const listingSearch = ref('')
const listingFilter = ref('all')

const stats = ref({
  totalUsers: 0,
  activeListings: 0,
  unverifiedUsers: 0,
  todaysRevenue: 0
})

const settings = ref({
  normalListingFee: 7.5,
  auctionListingFee: 10,
  requireIdVerification: true,
  freeFirstSixMonths: true,
  autoExpireFeatures: true,
  emailNotifications: true
})

const selectedUserForFunds = ref('')
const fundsAmount = ref('')
const showEditFundsModal = ref(false)
const editingUser = ref<any>(null)
const newFundsAmount = ref('')

// Feature settings
const featureSettings = ref({
  price: 5,
  durationDays: 7,
  listingsPerFreeFeature: 10,
  permanentFeaturePrice: 50,
  allowPermanentFeature: true
})

const featureStats = ref({
  activeFeaturedCars: 0,
  permanentFeatures: 0,
  freeFeaturesUsed: 0,
  featureRevenue: 0
})

const updatingFeatureSettings = ref(false)
const updatingUserSettings = ref(false)
const updatingSettings = ref(false)

// Transaction viewing state
const showUserTransactionsModal = ref(false)
const showTransactionDetailsModal = ref(false)
const viewingUser = ref<any>(null)
const selectedTransaction = ref<any>(null)
const userTransactions = ref([])
const loadingUserTransactions = ref(false)
const userTransactionSummary = ref(null)

// Transaction filters
const transactionFilters = ref({
  type: '',
  status: '',
  startDate: '',
  endDate: '',
  limit: 50
})

const tabs = [
  { id: 'users', label: 'Users' },
  { id: 'listings', label: 'Listings' },
  { id: 'funds', label: 'Funds' },
  { id: 'settings', label: 'Settings' }
]

const filteredUsers = computed(() => {
  let filtered = users.value
  
  // Search
  if (userSearch.value) {
    const search = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  }
  
  // Filter
  if (userFilter.value === 'buyer') {
    filtered = filtered.filter(user => user.role === 'buyer')
  } else if (userFilter.value === 'seller') {
    filtered = filtered.filter(user => user.role === 'seller')
  } else if (userFilter.value === 'admin') {
    filtered = filtered.filter(user => user.role === 'admin')
  } else if (userFilter.value === 'banned') {
    filtered = filtered.filter(user => user.banned)
  } else if (userFilter.value === 'unverified') {
    filtered = filtered.filter(user => !user.verified)
  } else if (userFilter.value === 'verified') {
    filtered = filtered.filter(user => user.verified)
  }
  
  return filtered
})

const filteredListings = computed(() => {
  let filtered = listings.value
  
  // Search
  if (listingSearch.value) {
    const search = listingSearch.value.toLowerCase()
    filtered = filtered.filter(listing => 
      listing.title?.toLowerCase().includes(search) ||
      listing.description?.toLowerCase().includes(search) ||
      listing.sellerName?.toLowerCase().includes(search)
    )
  }
  
  // Filter by type
  if (listingFilter.value === 'auction') {
    filtered = filtered.filter(listing => listing.auction)
  } else if (listingFilter.value === 'normal') {
    filtered = filtered.filter(listing => !listing.auction)
  }
  
  // Filter by status
  if (listingFilter.value === 'active') {
    filtered = filtered.filter(listing => listing.status === 'active')
  } else if (listingFilter.value === 'sold') {
    filtered = filtered.filter(listing => listing.status === 'sold')
  } else if (listingFilter.value === 'pending') {
    filtered = filtered.filter(listing => listing.status === 'pending')
  }
  
  return filtered
})

// Transaction Functions
const viewUserTransactions = async (user: any) => {
  viewingUser.value = user
  showUserTransactionsModal.value = true
  await loadUserTransactions()
}

const closeUserTransactionsModal = () => {
  showUserTransactionsModal.value = false
  viewingUser.value = null
  userTransactions.value = []
  userTransactionSummary.value = null
  resetTransactionFilters()
}

const viewTransactionDetails = (transaction: any) => {
  selectedTransaction.value = transaction
  showTransactionDetailsModal.value = true
}

const closeTransactionDetailsModal = () => {
  showTransactionDetailsModal.value = false
  selectedTransaction.value = null
}

const loadUserTransactions = async () => {
  if (!viewingUser.value) return
  
  loadingUserTransactions.value = true
  try {
    const query: any = { ...transactionFilters.value }
    
    // Add userId filter for admin view
    query.userId = viewingUser.value.id
    
    // Clean up empty values
    if (!query.type) delete query.type
    if (!query.status) delete query.status
    if (!query.startDate) delete query.startDate
    if (!query.endDate) delete query.endDate
    
    const { data } = await useFetch('/api/admin/transactions', {
      credentials: 'include',
      query: query
    })
    
    if (data.value?.success) {
      userTransactions.value = data.value.transactions
      
      // Calculate summary
      calculateTransactionSummary()
    }
  } catch (error) {
    console.error('Failed to load user transactions:', error)
  } finally {
    loadingUserTransactions.value = false
  }
}

const resetTransactionFilters = () => {
  transactionFilters.value = {
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    limit: 50
  }
}

const calculateTransactionSummary = () => {
  const summary = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalPayments: 0,
    totalRefunds: 0,
    totalListingFees: 0,
    totalFeatureFees: 0,
    totalBidPayments: 0,
    transactionCount: userTransactions.value.length,
    netChange: 0
  }
  
  userTransactions.value.forEach((transaction: any) => {
    const amount = parseFloat(transaction.amount)
    
    switch (transaction.type) {
      case 'deposit':
        summary.totalDeposits += amount
        summary.netChange += amount
        break
      case 'refund':
        summary.totalRefunds += amount
        summary.netChange += amount
        break
      case 'withdrawal':
      case 'payment':
        summary.totalWithdrawals += Math.abs(amount)
        summary.netChange += amount
        break
      case 'listing_fee':
      case 'auction_fee':
        summary.totalListingFees += Math.abs(amount)
        summary.netChange += amount
        break
      case 'feature_payment':
      case 'permanent_feature_payment':
        summary.totalFeatureFees += Math.abs(amount)
        summary.netChange += amount
        break
      case 'bid_payment':
        summary.totalBidPayments += Math.abs(amount)
        summary.netChange += amount
        break
    }
  })
  
  userTransactionSummary.value = summary
}

const issueRefund = async (transaction: any) => {
  if (!confirm(`Issue refund for ${Math.abs(transaction.amount)} CHF?\n\nTransaction: ${transaction.description}`)) {
    return
  }
  
  try {
    const reason = prompt('Enter refund reason:', 'Admin refund')
    if (!reason) return
    
    const { data } = await useFetch(`/api/admin/transactions/${transaction.id}/refund`, {
      method: 'POST',
      credentials: 'include',
      body: { reason }
    })
    
    if (data.value?.success) {
      alert('✅ Refund issued successfully!')
      await loadUserTransactions()
      await loadAdminData()
    } else {
      alert('❌ Failed to issue refund')
    }
  } catch (error: any) {
    console.error('Refund error:', error)
    alert('❌ Failed to issue refund: ' + (error.data?.message || error.message))
  }
}

const formatTransactionType = (type: string) => {
  const typeMap: Record<string, string> = {
    'deposit': 'Deposit',
    'withdrawal': 'Withdrawal',
    'refund': 'Refund',
    'payment': 'Payment',
    'feature_payment': 'Feature',
    'permanent_feature_payment': 'Premium Feature',
    'free_feature': 'Free Feature',
    'listing_fee': 'Listing Fee',
    'auction_fee': 'Auction Fee',
    'bid_payment': 'Bid Payment',
    'admin_adjustment': 'Admin Adjustment'
  }
  return typeMap[type] || type
}

const getTransactionTypeClass = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'refund':
      return 'bg-green-100 text-green-800'
    case 'withdrawal':
    case 'payment':
    case 'listing_fee':
    case 'auction_fee':
    case 'feature_payment':
    case 'permanent_feature_payment':
    case 'bid_payment':
      return 'bg-red-100 text-red-800'
    case 'free_feature':
      return 'bg-blue-100 text-blue-800'
    case 'admin_adjustment':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTransactionAmountClass = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'refund':
      return 'text-green-600 font-semibold'
    case 'withdrawal':
    case 'payment':
    case 'listing_fee':
    case 'auction_fee':
    case 'feature_payment':
    case 'permanent_feature_payment':
    case 'bid_payment':
      return 'text-red-600 font-semibold'
    default:
      return 'text-gray-600'
  }
}

const getTransactionAmountPrefix = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'refund':
      return '+'
    case 'withdrawal':
    case 'payment':
    case 'listing_fee':
    case 'auction_fee':
    case 'feature_payment':
    case 'permanent_feature_payment':
    case 'bid_payment':
      return '-'
    default:
      return ''
  }
}

const getTransactionStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const checkAdminAccess = async () => {
  try {
    console.log('🔄 Checking admin access...')
    
    const { data, error } = await useFetch('/api/admin/check', {
      credentials: 'include'
    })
    
    if (error.value) {
      console.error('❌ Admin check error:', error.value)
      isAdmin.value = false
      authenticated.value = false
      return
    }
    
    console.log('✅ Admin check response:', data.value)
    
    if (data.value?.isAdmin) {
      isAdmin.value = true
      authenticated.value = true
      adminData.value = data.value.user
      await loadAdminData()
    } else {
      isAdmin.value = false
      authenticated.value = data.value?.authenticated || false
    }
  } catch (error) {
    console.error('❌ Failed to check admin access:', error)
    isAdmin.value = false
    authenticated.value = false
  } finally {
    loading.value = false
  }
}

const loadAdminData = async () => {
  try {
    console.log('📊 Loading admin data...')
    
    const { data: settingsData, error: settingsError } = await useFetch('/api/admin/settings', {
      credentials: 'include'
    })
    
    if (settingsError.value) {
      console.error('❌ Failed to load settings:', settingsError.value)
    } else if (settingsData.value?.success) {
      const loadedSettings = settingsData.value.settings
      
      settings.value = {
        normalListingFee: loadedSettings.listingFees?.normalListingFee || 7.5,
        auctionListingFee: loadedSettings.listingFees?.auctionListingFee || 10,
        requireIdVerification: loadedSettings.userSettings?.requireIdVerification !== false,
        freeFirstSixMonths: loadedSettings.userSettings?.freeFirstSixMonths !== false,
        autoExpireFeatures: loadedSettings.userSettings?.autoExpireFeatures !== false,
        emailNotifications: loadedSettings.userSettings?.emailNotifications !== false
      }
      
      featureSettings.value = {
        price: loadedSettings.featureSettings?.price || 5,
        durationDays: loadedSettings.featureSettings?.durationDays || 7,
        listingsPerFreeFeature: loadedSettings.featureSettings?.listingsPerFreeFeature || 10,
        permanentFeaturePrice: loadedSettings.featureSettings?.permanentFeaturePrice || 50,
        allowPermanentFeature: loadedSettings.featureSettings?.allowPermanentFeature !== false
      }
      
      console.log('⚙️ Settings loaded:', loadedSettings)
    } else {
      console.log('⚠️ Using default settings (API not available)')
    }
    
    const { data: usersData, error: usersError } = await useFetch('/api/admin/users', {
      credentials: 'include'
    })
    
    if (usersError.value) {
      console.error('❌ Failed to load users:', usersError.value)
      users.value = []
    } else if (usersData.value?.success) {
      users.value = usersData.value.users
      console.log(`📊 Loaded ${users.value.length} users`)
    } else {
      console.error('❌ Failed to load users:', usersData.value)
      users.value = []
    }
    
    const { data: listingsData, error: listingsError } = await useFetch('/api/admin/listings', {
      credentials: 'include'
    })
    
    if (listingsError.value) {
      console.error('❌ Failed to load listings:', listingsError.value)
      listings.value = []
    } else if (listingsData.value?.success) {
      listings.value = listingsData.value.listings
      console.log(`📊 Loaded ${listings.value.length} listings`)
    } else {
      console.error('❌ Failed to load listings:', listingsData.value)
      listings.value = []
    }
    
    const { data: statsData, error: statsError } = await useFetch('/api/admin/stats', {
      credentials: 'include'
    })
    
    if (statsError.value) {
      console.error('❌ Failed to load stats:', statsError.value)
      stats.value = {
        totalUsers: 0,
        activeListings: 0,
        unverifiedUsers: 0,
        todaysRevenue: 0
      }
    } else if (statsData.value?.success) {
      stats.value = statsData.value.stats
      console.log('📊 Stats loaded:', stats.value)
    } else {
      console.error('❌ Failed to load stats:', statsData.value)
      stats.value = {
        totalUsers: 0,
        activeListings: 0,
        unverifiedUsers: 0,
        todaysRevenue: 0
      }
    }
    
    const { data: featureStatsData, error: featureStatsError } = await useFetch('/api/admin/feature-stats', {
      credentials: 'include'
    })
    
    if (featureStatsError.value) {
      console.error('❌ Failed to load feature stats:', featureStatsError.value)
      featureStats.value = {
        activeFeaturedCars: 0,
        permanentFeatures: 0,
        freeFeaturesUsed: 0,
        featureRevenue: 0
      }
    } else if (featureStatsData.value?.success) {
      featureStats.value = featureStatsData.value.stats
      console.log('📊 Feature stats loaded:', featureStats.value)
    } else {
      console.error('❌ Failed to load feature stats:', featureStatsData.value)
      featureStats.value = {
        activeFeaturedCars: 0,
        permanentFeatures: 0,
        freeFeaturesUsed: 0,
        featureRevenue: 0
      }
    }
    
    console.log('✅ All admin data loaded successfully!')
    
  } catch (error) {
    console.error('❌ Failed to load admin data:', error)
    users.value = []
    listings.value = []
    stats.value = {
      totalUsers: 0,
      activeListings: 0,
      unverifiedUsers: 0,
      todaysRevenue: 0
    }
    featureStats.value = {
      activeFeaturedCars: 0,
      permanentFeatures: 0,
      freeFeaturesUsed: 0,
      featureRevenue: 0
    }
  }
}

const refreshData = async () => {
  await loadAdminData()
}

const roleClasses = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800'
    case 'seller': return 'bg-green-100 text-green-800'
    case 'buyer': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const verifyUser = async (userId: number) => {
  if (!confirm('Verify this user?')) return
  
  try {
    const { data } = await useFetch(`/api/admin/users/${userId}/verify`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].verified = true
      }
      alert('✅ User verified successfully!')
    } else {
      alert('❌ Failed to verify user')
    }
  } catch (error) {
    console.error('Failed to verify user:', error)
    alert('❌ Failed to verify user')
  }
}

const unverifyUser = async (userId: number) => {
  if (!confirm('Unverify this user?')) return
  
  try {
    const { data } = await useFetch(`/api/admin/users/${userId}/unverify`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].verified = false
      }
      alert('✅ User unverified successfully!')
    } else {
      alert('❌ Failed to unverify user')
    }
  } catch (error) {
    console.error('Failed to unverify user:', error)
    alert('❌ Failed to unverify user')
  }
}

const banUser = async (userId: number) => {
  if (!confirm('Are you sure you want to ban this user?')) return
  
  try {
    const { data } = await useFetch(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].banned = true
      }
      alert('✅ User banned successfully!')
    } else {
      alert('❌ Failed to ban user')
    }
  } catch (error) {
    console.error('Failed to ban user:', error)
    alert('❌ Failed to ban user')
  }
}

const unbanUser = async (userId: number) => {
  try {
    const { data } = await useFetch(`/api/admin/users/${userId}/unban`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].banned = false
      }
      alert('✅ User unbanned successfully!')
    } else {
      alert('❌ Failed to unban user')
    }
  } catch (error) {
    console.error('Failed to unban user:', error)
    alert('❌ Failed to unban user')
  }
}

const removeListing = async (listingId: number) => {
  if (!confirm('Are you sure you want to remove this listing?')) return
  
  try {
    const { data } = await useFetch(`/api/admin/listings/${listingId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      listings.value = listings.value.filter(l => l.id !== listingId)
      alert('✅ Listing removed successfully!')
    } else {
      alert('❌ Failed to remove listing')
    }
  } catch (error) {
    console.error('Failed to remove listing:', error)
    alert('❌ Failed to remove listing')
  }
}

const markAsSold = async (listingId: number) => {
  try {
    const { data } = await useFetch(`/api/admin/listings/${listingId}/sold`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (data.value?.success) {
      const listingIndex = listings.value.findIndex(l => l.id === listingId)
      if (listingIndex !== -1) {
        listings.value[listingIndex].status = 'sold'
      }
      alert('✅ Listing marked as sold!')
    } else {
      alert('❌ Failed to update listing')
    }
  } catch (error) {
    console.error('Failed to mark as sold:', error)
    alert('❌ Failed to update listing')
  }
}

const editUserFunds = (user: any) => {
  editingUser.value = user
  newFundsAmount.value = user.funds || 0
  showEditFundsModal.value = true
}

const closeEditFundsModal = () => {
  showEditFundsModal.value = false
  editingUser.value = null
  newFundsAmount.value = ''
}

const updateUserFunds = async () => {
  if (!editingUser.value) return
  
  try {
    const { data } = await useFetch(`/api/admin/users/${editingUser.value.id}/funds`, {
      method: 'POST',
      credentials: 'include',
      body: { 
        amount: parseFloat(newFundsAmount.value),
        description: 'Admin manual adjustment' 
      }
    })
    
    if (data.value?.success) {
      const userIndex = users.value.findIndex(u => u.id === editingUser.value.id)
      if (userIndex !== -1) {
        users.value[userIndex].funds = parseFloat(newFundsAmount.value)
      }
      
      if (viewingUser.value?.id === editingUser.value.id) {
        await loadUserTransactions()
      }
      
      closeEditFundsModal()
      alert('✅ Funds updated successfully!')
    } else {
      alert('❌ Failed to update funds')
    }
  } catch (error: any) {
    console.error('Failed to update funds:', error)
    alert('❌ Failed to update funds: ' + (error.data?.message || error.message))
  }
}

const addFunds = async () => {
  if (!selectedUserForFunds.value || !fundsAmount.value) {
    alert('⚠️ Please select a user and enter amount')
    return
  }
  
  try {
    const user = users.value.find(u => u.id == selectedUserForFunds.value)
    if (!user) return
    
    const newAmount = (user.funds || 0) + parseFloat(fundsAmount.value)
    
    const { data } = await useFetch(`/api/admin/users/${selectedUserForFunds.value}/funds`, {
      method: 'POST',
      credentials: 'include',
      body: { amount: newAmount }
    })
    
    if (data.value?.success) {
      await loadAdminData()
      selectedUserForFunds.value = ''
      fundsAmount.value = ''
      alert('✅ Funds added successfully!')
    } else {
      alert('❌ Failed to add funds')
    }
  } catch (error) {
    console.error('Failed to add funds:', error)
    alert('❌ Failed to add funds')
  }
}

const removeFunds = async () => {
  if (!selectedUserForFunds.value || !fundsAmount.value) {
    alert('⚠️ Please select a user and enter amount')
    return
  }
  
  try {
    const user = users.value.find(u => u.id == selectedUserForFunds.value)
    if (!user) return
    
    const newAmount = Math.max(0, (user.funds || 0) - parseFloat(fundsAmount.value))
    
    const { data } = await useFetch(`/api/admin/users/${selectedUserForFunds.value}/funds`, {
      method: 'POST',
      credentials: 'include',
      body: { amount: newAmount }
    })
    
    if (data.value?.success) {
      await loadAdminData()
      selectedUserForFunds.value = ''
      fundsAmount.value = ''
      alert('✅ Funds removed successfully!')
    } else {
      alert('❌ Failed to remove funds')
    }
  } catch (error) {
    console.error('Failed to remove funds:', error)
    alert('❌ Failed to remove funds')
  }
}

const toggleSetting = (settingName: string) => {
  settings.value[settingName] = !settings.value[settingName]
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const goToHome = () => {
  navigateTo('/')
}

const goToLogin = () => {
  navigateTo('/login')
}

onMounted(() => {
  checkAdminAccess()
})
</script>