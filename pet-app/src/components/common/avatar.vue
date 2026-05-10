<template>
  <view class="c-avatar" :class="[sizeClass]" :style="{ width: px, height: px }">
    <image v-if="validSrc" class="img" :src="src" mode="aspectFill" />
    <text v-else class="letter" :style="{ fontSize: letterSize }">{{ firstLetter }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
});

const sizeMap = { sm: 48, md: 72, lg: 120 };
const px = computed(() => (sizeMap[props.size] || 72) + 'rpx');
const letterSize = computed(() => ({ sm: '22rpx', md: '32rpx', lg: '48rpx' }[props.size] || '32rpx'));
const validSrc = computed(() => props.src && props.src.trim() && !props.src.includes('undefined'));
const firstLetter = computed(() => (props.name || '?').charAt(0));
const sizeClass = computed(() => `size-${props.size}`);
</script>

<style scoped>
.c-avatar {
  border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: linear-gradient(135deg, #FFF3E8, #F5F0EA);
  display: flex; align-items: center; justify-content: center;
}
.img { width: 100%; height: 100%; }
.letter { color: #C8956C; font-weight: 700; }
</style>
