<template>
  <div class="table-pagination">
    <div class="items-per-page">
      <span>linhas por página:</span>
      <select :value="itemsPerPage" @change="$emit('update:itemsPerPage', Number($event.target.value))">
        <option :value="10">10</option>
        <option :value="25">25</option>
        <option :value="50">50</option>
      </select>
    </div>
    <div class="pagination-info">
      {{ rangeStart }}-{{ rangeEnd }} de {{ total }}
    </div>
    <div class="pagination-controls">
      <ChevronLeft :size="20" @click="$emit('prev')" :class="{ disabled: currentPage === 1 }" />
      <ChevronRight :size="20" @click="$emit('next')" :class="{ disabled: currentPage === totalPages }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  total: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
})

defineEmits(['update:itemsPerPage', 'prev', 'next'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.itemsPerPage)))
const rangeStart = computed(() => ((props.currentPage - 1) * props.itemsPerPage) + 1)
const rangeEnd = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.total))
</script>

<style scoped>
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page select {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-controls svg {
  cursor: pointer;
  transition: opacity 0.2s;
  color: var(--primary-color);
}

.pagination-controls svg.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .table-pagination {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
