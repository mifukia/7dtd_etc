<template>
  <div class="container mt-5">
    <h1 class="mb-4">7 Days to Die レシピ計算機</h1>

    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">アイテム選択</h5>
            <div class="mb-3">
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
            <button class="btn btn-primary" @click="calculateMaterials">
              計算
            </button>
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
  methods: {
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
