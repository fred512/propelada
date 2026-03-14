<script setup lang="ts">
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from 'radix-vue'
import { ChevronDown, ChevronUp, Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Selecione...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <SelectRoot
    :model-value="String(props.modelValue ?? '')"
    :disabled="props.disabled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <SelectTrigger
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
    >
      <SelectValue :placeholder="props.placeholder" />
      <ChevronDown class="h-4 w-4 opacity-50 shrink-0" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        position="popper"
        :side-offset="4"
      >
        <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
          <ChevronUp class="h-4 w-4" />
        </SelectScrollUpButton>

        <SelectViewport class="p-1">
          <slot>
            <SelectItem
              v-for="option in props.options"
              :key="option.value"
              :value="String(option.value)"
              class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Check class="h-4 w-4 data-[state=unchecked]:opacity-0" />
              </span>
              <SelectItemText>{{ option.label }}</SelectItemText>
            </SelectItem>
          </slot>
        </SelectViewport>

        <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
          <ChevronDown class="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
