<template>
  <div>
    <h1>Vehicle Data Test</h1>
    <input v-model="searchMarke" placeholder="Search brand..." @input="searchVehicles" />
    <div v-if="vehicles.length">
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
        <h3>{{ vehicle.marke }} {{ vehicle.typ }}</h3>
        <p>Typenschein: {{ vehicle.typengenehmigung_nr }}</p>
        <p>Fuel: {{ vehicle.treibstoff }}</p>
        <p>Power: {{ vehicle.kw }} kW</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const searchMarke = ref('');
const vehicles = ref([]);

const searchVehicles = async () => {
  const { data } = await $fetch('/api/vehicles/search', {
    method: 'POST',
    body: { marke: searchMarke.value }
  });
  vehicles.value = data.vehicles;
};
</script>