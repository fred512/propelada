export const useMatchTimer = () => {
  // useState persiste entre navegações no Nuxt 3
  const timerRunning = useState('timer_running', () => false)
  const timerStartTime = useState('timer_start_time', () => '--:--')
  const timerBaseSeconds = useState('timer_base_seconds', () => 0) // segundos acumulados antes do último start
  const timerStartedAt = useState('timer_started_at', () => null) // timestamp do último start

  // Segundos atuais calculados em tempo real
  const timerSeconds = useState('timer_seconds', () => 0)

  let timerInterval = null

  const formatTimer = computed(() => {
    const m = Math.floor(timerSeconds.value / 60)
    const s = timerSeconds.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

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
    } else {
      if (currentTime) timerStartTime.value = currentTime
      timerStartedAt.value = Date.now()
      timerRunning.value = true
      _startInterval()
    }
  }

  const resetTimer = () => {
    clearInterval(timerInterval)
    timerRunning.value = false
    timerSeconds.value = 0
    timerBaseSeconds.value = 0
    timerStartedAt.value = null
  }

  // Chama ao montar o componente: retoma o intervalo se estava rodando
  const resumeIfRunning = () => {
    if (timerRunning.value && timerStartedAt.value) {
      timerSeconds.value = timerBaseSeconds.value + Math.floor((Date.now() - timerStartedAt.value) / 1000)
      _startInterval()
    }
  }

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
