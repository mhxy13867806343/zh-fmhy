<template>
  <component :is="iconComponent" :size="size" />
</template>

<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
  }>(),
  {
    size: 18
  }
)

const iconComponent = computed(() => {
  return (LucideIcons as Record<string, any>)[props.name] || LucideIcons.Box
})
</script>
