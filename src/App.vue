<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
    <div class="container mx-auto px-4 py-6 sm:py-8">
      <!-- キービジュアル -->
      <div class="relative mb-12 rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg"
          alt="7DTD Key Visual"
          class="w-full h-64 sm:h-96 object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end"
        >
          <div class="p-8 text-white">
            <h1 class="text-4xl sm:text-5xl font-bold mb-2">
              7DTD レシピ計算機
            </h1>
            <p class="text-lg sm:text-xl text-pink-200">
              ゾンビサバイバルに必要な素材を簡単に計算
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-pink-600 mb-2">レシピ計算</h2>
        <p class="text-gray-600">必要な素材を簡単に計算しましょう</p>
      </div>
      <RecipeCalculator />
      <YouTubeVideos />
      <!-- フッター -->
      <footer class="mt-12 mb-8 text-center">
        <div
          class="inline-flex items-center gap-2 bg-pink-100/50 px-4 py-2 rounded-full"
        >
          <span class="text-pink-600">🎮</span>
          <p class="text-sm text-pink-700">
            このサイトは個人が趣味で作った非公式ツールです
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import YouTubeVideos from "./components/YouTubeVideos.vue";
import RecipeCalculator from "./components/RecipeCalculator.vue";

export default {
  name: "App",
  components: {
    RecipeCalculator,
    YouTubeVideos,
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&display=swap");

body {
  font-family: "M PLUS Rounded 1c", sans-serif;
}

/* カスタムスタイルが必要な場合はここに追加 */
</style>
