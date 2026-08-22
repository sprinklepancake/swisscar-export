<!-- components/TypeaheadSelect.vue
     Searchable picker shared by the buyer's browse filters and the seller's
     listing form, so the two can never offer different options.

     Two things were wrong before:

     1. With an empty query it sliced the list to the first 60 options. On a
        155-make list that silently hid 95 brands from anyone who clicked the
        box without typing.
     2. It was only ever used on the buyer side. The seller form had a native
        <select> with no search, which is why sellers reported "fewer makes".

     allowCustom exists for the model field: a seller listing something the
     model list has never heard of must still be able to type it. -->
<template>
  <div class="relative">
    <input
      ref="inputEl"
      v-model="query"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="search-input w-full"
      :class="[{ 'opacity-50 cursor-not-allowed': disabled }, inputClass]"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open"
      @input="onInput"
      @focus="open = true"
      @click="open = true"
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
      tabindex="-1"
      :aria-label="'Clear'"
      @mousedown.prevent="clearSelection"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
    >×</button>

    <!-- Dropdown -->
    <ul
      v-if="open && filtered.length > 0"
      role="listbox"
      class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
    >
      <li
        v-for="(option, idx) in filtered"
        :key="option"
        role="option"
        :aria-selected="idx === highlighted"
        @mousedown.prevent="selectOption(option)"
        class="px-3 py-2 text-sm cursor-pointer transition-colors"
        :class="idx === highlighted ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'"
      >{{ option }}</li>
    </ul>

    <!-- No results. With allowCustom the typed value is still usable, so say so
         instead of implying a dead end. -->
    <div
      v-if="open && query.trim() && filtered.length === 0"
      class="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-3 py-2 text-sm text-gray-500"
    >
      <template v-if="allowCustom">Not in the list — “{{ query }}” will be used as typed.</template>
      <template v-else>No results for “{{ query }}”</template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  options: string[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  inputClass?: string
  /** Keep a typed value that is not in the option list (used for car models). */
  allowCustom?: boolean
}>(), {
  disabled: false,
  required: false,
  allowCustom: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const query = ref(props.modelValue || '')
const open = ref(false)
const highlighted = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)

// Keep query in sync if the parent resets the value externally (for example
// when the make changes and the model is cleared).
watch(() => props.modelValue, (val) => {
  if (val !== query.value) query.value = val || ''
})

// Prefix matches first, then substring matches, deduplicated.
// No cap: the list is scrollable, and hiding options is exactly the bug this
// component caused before.
const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return props.options
  const starts = props.options.filter(o => o.toLowerCase().startsWith(q))
  const contains = props.options.filter(o => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q))
  return [...starts, ...contains].filter((v, i, a) => a.indexOf(v) === i)
})

const onInput = () => {
  open.value = true
  highlighted.value = -1
  if (props.allowCustom) {
    // Every keystroke is a valid value, so the parent stays in sync as you type.
    emit('update:modelValue', query.value)
    emit('change', query.value)
    return
  }
  // Strict mode: a half-typed query is not a selection.
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
    if (props.allowCustom) {
      // Whatever they typed stands.
      if (query.value !== props.modelValue) {
        emit('update:modelValue', query.value)
        emit('change', query.value)
      }
      return
    }
    // Strict mode: an unrecognised value is not allowed to stick.
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
