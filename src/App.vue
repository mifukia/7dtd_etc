<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-6 sm:py-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
        7 Days to Die レシピ計算機
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            アイテム選択
          </h2>
          <div class="mb-4">
            <div class="flex flex-col space-y-2 mb-3">
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  name="selectionType"
                  value="select"
                  v-model="selectionType"
                  class="form-radio h-4 w-4 text-blue-600"
                />
                <span class="ml-2">ドロップダウンから選択</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  type="radio"
                  name="selectionType"
                  value="search"
                  v-model="selectionType"
                  class="form-radio h-4 w-4 text-blue-600"
                />
                <span class="ml-2">テキストで検索</span>
              </label>
            </div>

            <!-- ドロップダウン選択 -->
            <div v-if="selectionType === 'select'" class="mb-3">
              <label
                for="itemSelect"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                アイテムを選択
              </label>
              <select
                id="itemSelect"
                v-model="selectedItem"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">アイテムを選択してください</option>
                <option v-for="item in items" :key="item.name" :value="item">
                  {{ getTranslatedName(item.name) }}
                </option>
              </select>
            </div>

            <!-- テキスト検索 -->
            <div v-else class="mb-3">
              <label
                for="searchInput"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                アイテム名を入力
              </label>
              <input
                type="text"
                id="searchInput"
                v-model="searchQuery"
                placeholder="アイテム名を入力してください"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
              />
              <div v-if="filteredItems.length > 0" class="space-y-1">
                <button
                  v-for="item in filteredItems"
                  :key="item.name"
                  @click="selectItem(item)"
                  class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors duration-150"
                >
                  {{ getTranslatedName(item.name) }}
                </button>
              </div>
              <div v-else-if="searchQuery" class="text-gray-500 text-sm">
                該当するアイテムが見つかりません
              </div>
            </div>

            <div class="mb-3">
              <label
                for="quantity"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                個数
              </label>
              <input
                type="number"
                id="quantity"
                v-model="quantity"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- 選択されたアイテムの表示 -->
            <div v-if="selectedItem" class="bg-blue-50 p-3 rounded-md">
              <strong class="text-blue-800">選択中のアイテム:</strong>
              <span class="ml-2">{{
                getTranslatedName(selectedItem.name)
              }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            必要な素材
          </h2>
          <div v-if="requiredMaterials.length > 0" class="space-y-2">
            <div
              v-for="material in requiredMaterials"
              :key="material.name"
              class="flex justify-between items-center p-2 bg-gray-50 rounded-md"
            >
              <span>{{ getTranslatedName(material.name) }}</span>
              <span class="text-gray-600">× {{ material.quantity }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500">アイテムを選択して計算してください</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      items: [],
      selectedItem: null,
      quantity: 1,
      requiredMaterials: [],
      translations: {},
      selectionType: "select",
      searchQuery: "",
    };
  },
  async created() {
    try {
      const translationsResponse = await axios.get("/translations.json");
      this.translations = translationsResponse.data;

      const recipesResponse = await axios.get("/recipes.json");
      const recipes = recipesResponse.data;

      this.items = recipes.recipes.recipe
        .filter((recipe) => recipe.ingredient)
        .map((recipe) => ({
          name: recipe["@_name"],
          materials: Array.isArray(recipe.ingredient)
            ? recipe.ingredient.map((ing) => ({
                name: ing["@_name"],
                count: parseInt(ing["@_count"]),
              }))
            : [
                {
                  name: recipe.ingredient["@_name"],
                  count: parseInt(recipe.ingredient["@_count"]),
                },
              ],
        }));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return [];
      const query = this.searchQuery.toLowerCase();
      return this.items
        .filter((item) => {
          const translatedName = this.getTranslatedName(
            item.name
          ).toLowerCase();
          const originalName = item.name.toLowerCase();
          return translatedName.includes(query) || originalName.includes(query);
        })
        .slice(0, 10);
    },
  },
  watch: {
    selectedItem: {
      handler(newVal) {
        if (newVal) {
          this.calculateMaterials();
        } else {
          this.requiredMaterials = [];
        }
      },
      immediate: true,
    },
    quantity: {
      handler() {
        if (this.selectedItem) {
          this.calculateMaterials();
        }
      },
      immediate: true,
    },
  },
  methods: {
    selectItem(item) {
      this.selectedItem = item;
      this.searchQuery = "";
    },
    calculateMaterials() {
      if (!this.selectedItem) return;

      this.requiredMaterials = this.selectedItem.materials.map((material) => ({
        name: material.name,
        quantity: material.count * this.quantity,
      }));
    },
    getTranslatedName(name) {
      return this.translations[name] || name;
    },
  },
};
</script>

<style>
/* カスタムスタイルが必要な場合はここに追加 */
</style>
