<template>
  <view class="rating-star">
    <text
      v-for="i in 5" :key="i"
      class="star"
      :class="{ filled: i <= value, interactive: interactive }"
      @tap="interactive && handleClick(i)"
    >★</text>
    <text class="star-count" v-if="showCount && count">({{ count }})</text>
  </view>
</template>

<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
});

const emit = defineEmits(['update:value']);

function handleClick(i) {
  emit('update:value', i);
}
</script>

<style scoped>
.rating-star { display: flex; align-items: center; }
.star { font-size: 36rpx; color: #DCDFE6; margin-right: 4rpx; }
.star.filled { color: #E6A23C; }
.star.interactive { cursor: pointer; }
.star-count { font-size: 24rpx; color: #909399; margin-left: 8rpx; }
</style>
