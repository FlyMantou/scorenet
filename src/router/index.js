import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('@/pages/index/index'),
    },
    {
      path: '/score/:id',
      name:
        'Score',
      component:
        () => import('@/pages/player/player'),
    }
  ],

})

