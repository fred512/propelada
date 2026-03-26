import { ref, computed } from 'vue'

export function usePagination(sourceData, defaultPerPage = 10) {
  const currentPage = ref(1)
  const itemsPerPage = ref(defaultPerPage)

  const totalPages = computed(() => Math.max(1, Math.ceil(sourceData.value.length / itemsPerPage.value)))

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return sourceData.value.slice(start, start + itemsPerPage.value)
  })

  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
  }

  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
  }

  return { currentPage, itemsPerPage, totalPages, paginatedData, nextPage, prevPage }
}
