<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'radix-vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  title?: string
  description?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

function onOpenChange(val: boolean) {
  emit('update:open', val)
  if (!val) emit('close')
}
</script>

<template>
  <DialogRoot :open="props.open" @update:open="onOpenChange">
    <!-- Trigger slot -->
    <slot name="trigger" />

    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-[2100] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        :class="cn(
          'fixed left-1/2 top-1/2 z-[2200] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-[var(--bg-secondary,#1e1e1e)] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          props.class
        )"
      >
        <!-- Header -->
        <div v-if="props.title || props.description || $slots.header" class="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle
            v-if="props.title"
            class="text-lg font-semibold leading-none tracking-tight text-foreground"
          >
            {{ props.title }}
          </DialogTitle>
          <DialogDescription
            v-if="props.description"
            class="text-sm text-muted-foreground"
          >
            {{ props.description }}
          </DialogDescription>
          <slot name="header" />
        </div>

        <slot />

        <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <slot name="footer" />
        </div>

        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X class="h-4 w-4 text-foreground" />
          <span class="sr-only">Fechar</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
