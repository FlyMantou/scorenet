import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: () => import('@/pages/index/index'),
    },
    {
      path: '/score',
      name: 'Score',
      component: () => import('@/pages/score/score'),
    }
  ]
})
