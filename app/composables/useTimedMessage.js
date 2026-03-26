import { ref } from 'vue'

export function useTimedMessage(duration = 3000) {
  const visible = ref(false)
  const show = () => {
    visible.value = true
    setTimeout(() => { visible.value = false }, duration)
  }
  return { visible, show }
}
