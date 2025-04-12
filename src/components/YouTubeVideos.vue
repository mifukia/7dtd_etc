<template>
  <div class="mt-8">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-pink-600 mb-2">7DTD 関連動画</h2>
      <p class="text-gray-600">最新の動画をチェックしましょう</p>
    </div>

    <!-- カテゴリ選択 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          class="px-4 py-2 rounded-xl transition-colors duration-200"
          :class="[
            selectedCategory === category.id
              ? 'bg-pink-500 text-white'
              : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 動画一覧 -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"
      ></div>
    </div>
    <div v-else>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="video in currentVideos"
          :key="video.id.videoId"
          class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-pink-100 hover:shadow-xl transition-shadow duration-200"
        >
          <a
            :href="'https://www.youtube.com/watch?v=' + video.id.videoId"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="video.snippet.thumbnails.medium.url"
              :alt="video.snippet.title"
              class="w-full h-48 object-cover rounded-t-2xl"
            />
          </a>
          <div class="p-4">
            <h3 class="font-semibold mb-2 line-clamp-2">
              {{ video.snippet.title }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ formatDate(video.snippet.publishedAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- もっと見るボタン -->
      <div v-if="hasMoreVideos" class="text-center mt-6">
        <button
          @click="loadMoreVideos"
          :disabled="loading"
          class="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-colors duration-200"
        >
          もっと見る
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "YouTubeVideos",
  data() {
    return {
      categories: [
        {
          id: "beginner",
          name: "初心者",
          query: "7DTD 初心者",
        },
        {
          id: "building",
          name: "建築",
          query: "7DTD 建築",
        },
        {
          id: "update",
          name: "アップデート",
          query: "7DTD 最新 アップデート",
        },
      ],
      selectedCategory: "beginner",
      videos: {
        beginner: [],
        building: [],
        update: [],
      },
      totalResults: {
        beginner: 0,
        building: 0,
        update: 0,
      },
      nextPageToken: {
        beginner: null,
        building: null,
        update: null,
      },
      lastFetchTime: {
        beginner: null,
        building: null,
        update: null,
      },
      loading: false,
      error: null,
      apiKey: "AIzaSyDorUHDVTRixEYb3alM26rOfGTj8mwnp0o",
      maxResults: 6,
      fetchInterval: 5 * 60 * 1000,
      rateLimit: {
        maxRequests: 10,
        timeWindow: 60 * 60 * 1000,
        requestCount: 0,
        lastResetTime: null,
      },
      cacheConfig: {
        browserCacheTime: 24 * 60 * 60 * 1000,
        serverCacheTime: 5 * 60 * 1000,
      },
    };
  },
  computed: {
    currentVideos() {
      return this.videos[this.selectedCategory];
    },
    currentTotalResults() {
      return this.totalResults[this.selectedCategory];
    },
    currentNextPageToken() {
      return this.nextPageToken[this.selectedCategory];
    },
    hasMoreVideos() {
      return this.currentNextPageToken !== null;
    },
  },
  async created() {
    await this.fetchVideos();
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      if (this.videos[categoryId].length === 0) {
        this.fetchVideos();
      }
    },
    async fetchVideos() {
      try {
        const now = Date.now();
        if (
          this.rateLimit.lastResetTime &&
          now - this.rateLimit.lastResetTime > this.rateLimit.timeWindow
        ) {
          this.rateLimit.requestCount = 0;
          this.rateLimit.lastResetTime = now;
        }

        if (this.rateLimit.requestCount >= this.rateLimit.maxRequests) {
          this.error =
            "リクエスト制限に達しました。しばらく時間をおいて再度お試しください。";
          return;
        }

        if (
          this.lastFetchTime[this.selectedCategory] &&
          now - this.lastFetchTime[this.selectedCategory] <
            this.cacheConfig.serverCacheTime
        ) {
          return;
        }

        this.loading = true;
        this.error = null;

        const category = this.categories.find(
          (c) => c.id === this.selectedCategory
        );
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q: category.query,
              type: "video",
              maxResults: this.maxResults,
              key: this.apiKey,
              order: category.id === "update" ? "date" : "viewCount",
              relevanceLanguage: "ja",
              regionCode: "JP",
            },
            headers: {
              "Cache-Control": `max-age=${
                this.cacheConfig.browserCacheTime / 1000
              }`,
            },
          }
        );

        this.videos[this.selectedCategory] = response.data.items;
        this.totalResults[this.selectedCategory] =
          response.data.pageInfo.totalResults;
        this.nextPageToken[this.selectedCategory] = response.data.nextPageToken;
        this.lastFetchTime[this.selectedCategory] = now;
        this.rateLimit.requestCount++;
      } catch (error) {
        console.error("Error fetching videos:", error);
        if (error.response && error.response.status === 429) {
          this.error =
            "リクエストが多すぎます。しばらく時間をおいて再度お試しください。";
        } else {
          this.error =
            "動画の取得に失敗しました。しばらく時間をおいて再度お試しください。";
        }
      } finally {
        this.loading = false;
      }
    },
    async loadMoreVideos() {
      if (!this.currentNextPageToken) return;

      try {
        this.loading = true;
        const category = this.categories.find(
          (c) => c.id === this.selectedCategory
        );
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q: category.query,
              type: "video",
              maxResults: this.maxResults,
              key: this.apiKey,
              order: category.id === "update" ? "date" : "viewCount",
              pageToken: this.currentNextPageToken,
              relevanceLanguage: "ja",
              regionCode: "JP",
            },
          }
        );

        this.videos[this.selectedCategory] = [
          ...this.videos[this.selectedCategory],
          ...response.data.items,
        ];
        this.nextPageToken[this.selectedCategory] = response.data.nextPageToken;
      } catch (error) {
        console.error("Error loading more videos:", error);
        this.error = "追加の動画の読み込みに失敗しました。";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
/* カスタムスタイルが必要な場合はここに追加 */
</style>
