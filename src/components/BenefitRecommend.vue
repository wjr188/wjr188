<template>
  <div class="recommend-tab">
    <!-- 横幅轮播 -->
    <div class="banner-wrapper">
      <van-swipe :autoplay="2000" lazy-render>
        <van-swipe-item v-for="(banner, i) in banners" :key="i">
          <img
            v-lazy="banner"
            class="banner-img"
            alt="banner"
          />
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="section-title">大家都在玩</div>

    <div class="app-list">
      <div
        v-for="(item, index) in appList"
        :key="index"
        class="cyber-card"
      >
        <img v-lazy="item.icon" class="app-icon" />
        <div class="app-info">
          <div class="app-name">{{ item.name }}</div>
          <div class="app-desc">下载次数: {{ item.downloads.toLocaleString() }}</div>
          <div class="app-desc">{{ item.desc }}</div>
        </div>
        <van-button
          size="small"
          round
          class="download-button"
        >
          立即下载
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AppItem {
  name: string
  downloads: number
  desc: string
  icon: string
}

const banners = [
  'https://picsum.photos/1200/400?random=1',
  'https://picsum.photos/1200/400?random=2',
  'https://picsum.photos/1200/400?random=3'
]

const appList: AppItem[] = [
  {
    name: "AI直播",
    downloads: 488155,
    desc: "AI直播 性感少妇 萌妹 应有尽有",
    icon: "/static/icons/ai-live.png"
  },
  {
    name: "澳门葡京",
    downloads: 636845,
    desc: "澳门葡京",
    icon: "/static/icons/aomen.png"
  },
  {
    name: "PG娱乐城",
    downloads: 212784,
    desc: "PG娱乐 真人德州扑克",
    icon: "/static/icons/pg.png"
  },
  {
    name: "小黄书",
    downloads: 858458,
    desc: "你的性福笔记",
    icon: "/static/icons/xiaohuangshu.png"
  },
  {
    name: "萝莉岛",
    downloads: 623889,
    desc: "全球最大萝莉资源平台",
    icon: "/static/icons/luolid.png"
  },
  {
    name: "海角社区",
    downloads: 555389,
    desc: "全球最大原创乱伦平台",
    icon: "/static/icons/haijiao.png"
  },
  {
    name: "TikTok成人版",
    downloads: 963425,
    desc: "成人版抖音",
    icon: "/static/icons/tiktok.png"
  },
  {
    name: "Pornhub中文版",
    downloads: 396865,
    desc: "全球最大成人网站",
    icon: "/static/icons/pornhub.png"
  }
]
</script>

<style scoped>
.recommend-tab {
  padding: 3.2vw;
  background: #1a1a1a;
  min-height: 100vh;
  color: #00f5d4;
  font-family: 'Orbitron', 'Roboto', sans-serif;
}

.banner-wrapper {
  border: 0.5vw solid #00f5d4;
  border-radius: 2.1vw;
  overflow: hidden;
  box-shadow: 0 0 3.2vw #00f5d4;
  margin-bottom: 4.3vw;
}

.banner-img {
  display: block;
  width: 100%;
  height: 42.6vw;
  object-fit: cover;
  border-radius: 2.1vw;
}

.section-title {
  font-size: 4.3vw;
  font-weight: bold;
  color: #00f5d4;
  text-shadow: 0 0 1vw #00f5d4;
  margin: 3.2vw 0 2.1vw;
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 3.7vw;
}

.cyber-card {
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border: 0.3vw solid #00f5d4;
  box-shadow: 0 0 2.1vw #00f5d4;
  padding: 2.7vw;
  border-radius: 2.1vw;
}

.app-icon {
  width: 12.8vw;
  height: 12.8vw;
  border-radius: 1.6vw;
  flex-shrink: 0;
  border: 0.3vw solid #00f5d4;
}

.app-info {
  flex: 1;
  margin-left: 2.7vw;
}

.app-name {
  font-size: 4vw;
  font-weight: bold;
  color: #00f5d4;
  text-shadow: 0 0 1vw #00f5d4;
}

.app-desc {
  font-size: 3.2vw;
  color: #aaa;
  margin-top: 0.5vw;
}

.download-button {
  background: transparent;
  border: 0.3vw solid #00f5d4;
  color: #00f5d4;
  font-weight: bold;
  box-shadow: 0 0 1.6vw #00f5d4;
}
</style>
