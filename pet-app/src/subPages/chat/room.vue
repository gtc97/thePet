<template>
  <view class="page-chat">
    <!-- 消息列表 -->
    <scroll-view class="msg-list" scroll-y :scroll-into-view="scrollTo" :scroll-with-animation="true">
      <view v-for="msg in messages" :key="msg.id" :id="'msg-'+msg.id"
        class="msg-item" :class="{ mine: msg.senderId === userId }">
        <image class="msg-avatar" :src="msg.sender?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="msg-bubble" :class="{ mine: msg.senderId === userId }">
          <image v-if="msg.type === 'image'" :src="msg.content" mode="widthFix" class="msg-image" @tap="previewImage(msg.content)" />
          <text v-else class="msg-text">{{ msg.content }}</text>
        </view>
      </view>
      <view id="msg-bottom" />
    </scroll-view>

    <!-- 输入栏 -->
    <view class="input-bar">
      <input class="chat-input" v-model="inputText" placeholder="输入消息..." @confirm="handleSend" />
      <view class="send-btn" @tap="handleSend"><text>发送</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getChatRoom, getMessages, sendMessage } from '@/api/chat';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const userId = ref(userStore.userInfo?.id || 0);
const roomId = ref(0);
const messages = ref([]);
const inputText = ref('');
const scrollTo = ref('');

onLoad(async (options) => {
  const roomRes = await getChatRoom(options.orderId);
  roomId.value = roomRes.data.id;
  const msgRes = await getMessages(roomId.value);
  messages.value = msgRes.data?.list || [];
  scrollTo.value = 'msg-bottom';
  // 简单的轮询（小程��中WebSocket受限时的fallback）
  setInterval(pollMessages, 5000);
});

async function pollMessages() {
  try {
    const res = await getMessages(roomId.value);
    if (res.data?.list) messages.value = res.data.list;
  } catch { /* ignore */ }
}

async function handleSend() {
  const text = inputText.value.trim();
  if (!text) return;
  try {
    await sendMessage(roomId.value, text);
    // 乐观更新
    messages.value.push({
      id: Date.now(), roomId: roomId.value, senderId: userId.value,
      content: text, type: 'text', createdAt: new Date().toISOString(),
      sender: { id: userId.value, nickname: '我', avatar: userStore.userInfo?.avatar },
    });
    inputText.value = '';
    scrollTo.value = 'msg-bottom';
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' });
  }
}

function previewImage(url) {
  uni.previewImage({ urls: [url] });
}
</script>

<style scoped lang="scss">
.page-chat { display: flex; flex-direction: column; height: 100vh; background: var(--bg-page); }
.msg-list { flex: 1; padding: 20rpx 24rpx; }
.msg-item { display: flex; margin-bottom: 24rpx; }
.msg-item.mine { flex-direction: row-reverse; }
.msg-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #e8e8e8; flex-shrink: 0; }
.msg-bubble { max-width: 70%; padding: 16rpx 20rpx; border-radius: 16rpx; background: #fff; margin: 0 12rpx; }
.msg-bubble.mine { background: var(--theme-primary-light); }
.msg-text { font-size: var(--font-md); line-height: 1.6; word-break: break-all; }
.msg-image { width: 300rpx; border-radius: 8rpx; }
.input-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; border-top: 1rpx solid var(--border-color); gap: 12rpx; }
.chat-input { flex: 1; height: 72rpx; background: var(--bg-page); border-radius: 36rpx; padding: 0 24rpx; font-size: var(--font-md); }
.send-btn { padding: 12rpx 28rpx; background: var(--theme-primary); color: #fff; border-radius: 36rpx; font-size: var(--font-sm); }
</style>
