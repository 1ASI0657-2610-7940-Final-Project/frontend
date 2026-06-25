<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  label: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const inputValue = ref('')

const syncValue = (next: string[]) => {
  emit('update:modelValue', next)
}

const addTag = () => {
  const clean = inputValue.value.trim().replace(/,/g, '')
  if (!clean) return
  if (props.modelValue.includes(clean)) {
    inputValue.value = ''
    return
  }
  syncValue([...props.modelValue, clean])
  inputValue.value = ''
}

const removeTag = (tag: string) => {
  syncValue(props.modelValue.filter((item) => item !== tag))
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
}
</script>

<template>
  <div class="form-group">
    <label class="field-label">{{ label }}</label>
    <input
      v-model="inputValue"
      :placeholder="placeholder || 'Press enter to add tags'"
      class="input-field"
      type="text"
      @keydown="onKeydown"
    />
    <div v-if="modelValue.length" class="tags-list-container">
      <span v-for="tag in modelValue" :key="tag" class="tag-pill">
        {{ tag }}
        <button type="button" class="remove-tag-btn" @click="removeTag(tag)" aria-label="Remove tag">&times;</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-label {
  font-size: 0.925rem;
  font-weight: 700;
  color: #0f172a;
}
.input-field {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  padding: 0.75rem 0.85rem;
  font-size: 0.925rem;
  font-family: inherit;
  color: #0f172a;
  transition: all 0.2s ease;
}
.input-field:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
.tags-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  color: #334155;
  font-weight: 600;
}
.remove-tag-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}
.remove-tag-btn:hover {
  color: #ef4444;
}
</style>
