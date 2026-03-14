<script setup lang="ts">
import { AvatarRoot, AvatarImage, AvatarFallback } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <AvatarRoot
    :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <AvatarImage
      v-if="props.src"
      :src="props.src"
      :alt="props.alt || ''"
      class="aspect-square h-full w-full object-cover"
    />
    <AvatarFallback
      class="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium"
    >
      {{ props.fallback || (props.alt ? props.alt.charAt(0).toUpperCase() : '?') }}
    </AvatarFallback>
  </AvatarRoot>
</template>
