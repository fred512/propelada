const STORAGE_KEY = 'propelada_timer'

export const useMatchTimer = () => {
  // useState persiste entre navegações no Nuxt 3
  const timerRunning = useState('timer_running', () => false)
  const timerStartTime = useState('timer_start_time', () => '--:--')
  const timerBaseSeconds = useState('timer_base_seconds', () => 0)
  const timerStartedAt = useState('timer_started_at', () => null)
  const timerSeconds = useState('timer_seconds', () => 0)

  let timerInterval = null

  const formatTimer = computed(() => {
    const m = Math.floor(timerSeconds.value / 60)
    const s = timerSeconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const _saveToStorage = () => {
    if (!process.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      running: timerRunning.value,
      startTime: timerStartTime.value,
      baseSeconds: timerBaseSeconds.value,
      startedAt: timerStartedAt.value,
    }))
  }

  const _clearStorage = () => {
    if (!process.client) return
    localStorage.removeItem(STORAGE_KEY)
  }

  const _startInterval = () => {
    clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      timerSeconds.value = timerBaseSeconds.value + Math.floor((Date.now() - timerStartedAt.value) / 1000)
    }, 1000)
  }

  const toggleTimer = (currentTime) => {
    if (timerRunning.value) {
      clearInterval(timerInterval)
      timerBaseSeconds.value = timerSeconds.value
      timerRunning.value = false
      _clearStorage()
    } else {
      if (currentTime) timerStartTime.value = currentTime
      timerStartedAt.value = Date.now()
      timerRunning.value = true
      _saveToStorage()
      _startInterval()
    }
  }

  const resetTimer = () => {
    clearInterval(timerInterval)
    timerRunning.value = false
    timerSeconds.value = 0
    timerBaseSeconds.value = 0
    timerStartedAt.value = null
    _clearStorage()
  }

  // Chama ao montar o componente: restaura do localStorage (sobrevive F5) ou retoma via useState (SPA)
  const resumeIfRunning = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const { running, startTime, baseSeconds, startedAt } = JSON.parse(stored)
          if (running && startedAt) {
            timerRunning.value = true
            timerStartTime.value = startTime || timerStartTime.value
            timerBaseSeconds.value = baseSeconds || 0
            timerStartedAt.value = startedAt
            timerSeconds.value = timerBaseSeconds.value + Math.floor((Date.now() - timerStartedAt.value) / 1000)
            _startInterval()
            return
          }
        } catch {}
      }
    }
    // Fallback: retoma via useState (caso localStorage não esteja disponível)
    if (timerRunning.value && timerStartedAt.value) {
      timerSeconds.value = timerBaseSeconds.value + Math.floor((Date.now() - timerStartedAt.value) / 1000)
      _startInterval()
    }
  }

  // Chamado no onUnmounted: limpa apenas o intervalo, não o estado
  const cleanup = () => {
    clearInterval(timerInterval)
  }

  return {
    timerRunning,
    timerSeconds,
    timerStartTime,
    formatTimer,
    toggleTimer,
    resetTimer,
    resumeIfRunning,
    cleanup,
  }
}
