<!-- components/TypeaheadSelect.vue -->
<template>
  <div class="relative">
    <input
      ref="inputEl"
      v-model="query"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="search-input w-full"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      autocomplete="off"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="confirmHighlighted"
      @keydown.escape="open = false"
    />
    <!-- Clear button -->
    <button
      v-if="query && !disabled"
      type="button"
      @mousedown.prevent="clearSelection"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
    >×</button>

    <!-- Dropdown -->
    <ul
      v-if="open && filtered.length > 0"
      class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto"
    >
      <li
        v-for="(option, idx) in filtered"
        :key="option"
        @mousedown.prevent="selectOption(option)"
        class="px-3 py-2 text-sm cursor-pointer transition-colors"
        :class="idx === highlighted ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'"
      >{{ option }}</li>
    </ul>

    <!-- No results -->
    <div
      v-if="open && query.trim() && filtered.length === 0"
      class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-3 py-2 text-sm text-gray-400"
    >
      No results for "{{ query }}"
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  options: string[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const query = ref(props.modelValue || '')
const open = ref(false)
const highlighted = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)

// Keep query in sync if parent resets the value externally
watch(() => props.modelValue, (val) => {
  if (val !== query.value) query.value = val
})

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return props.options.slice(0, 60) // show first 60 when empty
  return props.options
    .filter(o => o.toLowerCase().startsWith(q))
    .concat(
      props.options.filter(o => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q))
    )
    .filter((v, i, a) => a.indexOf(v) === i) // deduplicate
    .slice(0, 50)
})

const onInput = () => {
  open.value = true
  highlighted.value = -1
  // If query no longer matches current selection, clear the model
  if (props.modelValue && query.value !== props.modelValue) {
    emit('update:modelValue', '')
    emit('change', '')
  }
}

const selectOption = (option: string) => {
  query.value = option
  open.value = false
  highlighted.value = -1
  emit('update:modelValue', option)
  emit('change', option)
}

const clearSelection = () => {
  query.value = ''
  open.value = false
  emit('update:modelValue', '')
  emit('change', '')
  inputEl.value?.focus()
}

const onBlur = () => {
  setTimeout(() => {
    open.value = false
    // If they typed something that isn't a valid option, reset
    if (query.value && !props.options.includes(query.value)) {
      query.value = props.modelValue || ''
    }
  }, 150)
}

const moveDown = () => {
  if (!open.value) { open.value = true; return }
  highlighted.value = Math.min(highlighted.value + 1, filtered.value.length - 1)
}

const moveUp = () => {
  highlighted.value = Math.max(highlighted.value - 1, -1)
}

const confirmHighlighted = () => {
  if (highlighted.value >= 0 && filtered.value[highlighted.value]) {
    selectOption(filtered.value[highlighted.value])
  }
}
</script>