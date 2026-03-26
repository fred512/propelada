import { ref, computed } from 'vue'

export function useTableSort(data, defaultKey = 'classificacao', defaultDir = 'asc') {
  const sortKey = ref(defaultKey)
  const sortDir = ref(defaultDir)

  const setSort = (key) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = key === 'd' ? 'asc' : 'desc'
    }
  }

  const sortIndicator = (key) => {
    if (sortKey.value !== key) return '↕'
    return sortDir.value === 'asc' ? '▲' : '▼'
  }

  const sortedData = computed(() => {
    const arr = [...data.value]
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1

    return arr.sort((a, b) => {
      const av = key === 'jogador' ? (a[key] || '').toLowerCase() : (parseFloat(a[key]) || 0)
      const bv = key === 'jogador' ? (b[key] || '').toLowerCase() : (parseFloat(b[key]) || 0)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  })

  return { sortKey, sortDir, sortedData, setSort, sortIndicator }
}
