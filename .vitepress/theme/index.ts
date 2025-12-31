import DefaultTheme from 'vitepress/theme'
import './style.css'
import ArticleList from './components/ArticleList.vue'
import ArticleCard from './components/ArticleCard.vue'
import ArticleNav from './components/ArticleNav.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ArticleList', ArticleList)
    app.component('ArticleCard', ArticleCard)
    app.component('ArticleNav', ArticleNav)
  }
}
