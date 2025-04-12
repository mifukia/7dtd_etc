const fs = require("fs");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");

async function convertXmlToJson() {
  try {
    // XMLファイルをダウンロード
    const response = await axios.get(
      "https://raw.githubusercontent.com/CollinHerber/7dtd-dignity-config-files/master/recipes.xml"
    );
    const xmlData = response.data;

    // XMLをパース（オプションを追加）
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
    });
    const jsonData = parser.parse(xmlData);

    // JSONファイルとして保存（Vueアプリケーションのpublicディレクトリに保存）
    fs.writeFileSync(
      "./public/recipes.json",
      JSON.stringify(jsonData, null, 2)
    );
    console.log("XMLをJSONに変換して保存しました。");
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

convertXmlToJson();
