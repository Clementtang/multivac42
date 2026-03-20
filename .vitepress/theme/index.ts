import DefaultTheme from "vitepress/theme";
import "@fontsource-variable/noto-sans-tc";
import "@fontsource-variable/jetbrains-mono";
import "./style.css";
import Layout from "./Layout.vue";
import ArticleList from "./components/ArticleList.vue";
import ArticleCard from "./components/ArticleCard.vue";
import XEmbed from "./components/XEmbed.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("ArticleList", ArticleList);
    app.component("ArticleCard", ArticleCard);
    app.component("XEmbed", XEmbed);
  },
};
