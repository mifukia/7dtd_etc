<template>
  <div class="container mt-5">
    <h1 class="mb-4">7 Days to Die レシピ計算機</h1>

    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">アイテム選択</h5>
            <div class="mb-3">
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  name="selectionType"
                  id="selectType"
                  value="select"
                  v-model="selectionType"
                />
                <label class="form-check-label" for="selectType">
                  ドロップダウンから選択
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  name="selectionType"
                  id="searchType"
                  value="search"
                  v-model="selectionType"
                />
                <label class="form-check-label" for="searchType">
                  テキストで検索
                </label>
              </div>
            </div>

            <!-- ドロップダウン選択 -->
            <div v-if="selectionType === 'select'" class="mb-3">
              <label for="itemSelect" class="form-label">アイテムを選択</label>
              <select
                id="itemSelect"
                class="form-select"
                v-model="selectedItem"
              >
                <option value="">アイテムを選択してください</option>
                <option v-for="item in items" :key="item.name" :value="item">
                  {{ getTranslatedName(item.name) }}
                </option>
              </select>
            </div>

            <!-- テキスト検索 -->
            <div v-else class="mb-3">
              <label for="searchInput" class="form-label"
                >アイテム名を入力</label
              >
              <input
                type="text"
                id="searchInput"
                class="form-control mb-2"
                v-model="searchQuery"
                placeholder="アイテム名を入力してください"
              />
              <div v-if="filteredItems.length > 0" class="list-group">
                <button
                  v-for="item in filteredItems"
                  :key="item.name"
                  class="list-group-item list-group-item-action"
                  @click="selectItem(item)"
                >
                  {{ getTranslatedName(item.name) }}
                </button>
              </div>
              <div v-else-if="searchQuery" class="text-muted">
                該当するアイテムが見つかりません
              </div>
            </div>

            <div class="mb-3">
              <label for="quantity" class="form-label">個数</label>
              <input
                type="number"
                id="quantity"
                class="form-control"
                v-model="quantity"
                min="1"
              />
            </div>

            <!-- 選択されたアイテムの表示 -->
            <div v-if="selectedItem" class="alert alert-info">
              <strong>選択中のアイテム:</strong>
              {{ getTranslatedName(selectedItem.name) }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">必要な素材</h5>
            <ul class="list-group" v-if="requiredMaterials.length > 0">
              <li
                class="list-group-item"
                v-for="material in requiredMaterials"
                :key="material.name"
              >
                {{ getTranslatedName(material.name) }} × {{ material.quantity }}
              </li>
            </ul>
            <p v-else class="text-muted">アイテムを選択して計算してください</p>
          </div>
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
      selectionType: "select", // 選択方法（'select' or 'search'）
      searchQuery: "", // 検索クエリ
    };
  },
  async created() {
    try {
      // 翻訳データを読み込む
      const translationsResponse = await axios.get("/translations.json");
      this.translations = translationsResponse.data;

      // レシピデータを読み込む
      const recipesResponse = await axios.get("/recipes.json");
      const recipes = recipesResponse.data;

      // JSONデータを処理してアイテムリストを作成
      this.items = recipes.recipes.recipe
        .filter((recipe) => recipe.ingredient) // ingredientを持つレシピのみをフィルタリング
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
        .slice(0, 10); // 最大10件まで表示
    },
  },
  watch: {
    // selectedItemが変更されたときに自動的に計算
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
    // quantityが変更されたときに自動的に計算
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
      this.searchQuery = ""; // 選択後は検索クエリをクリア
    },
    calculateMaterials() {
      if (!this.selectedItem) return;

      this.requiredMaterials = this.selectedItem.materials.map((material) => ({
        name: material.name,
        quantity: material.count * this.quantity,
      }));
    },
    getTranslatedName(name) {
      // 翻訳がある場合は翻訳を、ない場合は元の名前を返す
      return this.translations[name] || name;
    },
  },
};
</script>

<style>
@import "bootstrap/dist/css/bootstrap.min.css";
</style>
