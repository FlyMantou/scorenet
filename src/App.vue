<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  @font-face {
    font-family:fz;
    src: url('assets/fonts/font.ttf');
  }
#app {
  text-align: center;
  width: 100%;
  height: 100%;
  font-family: 'fz';
}
html,body{
  height: 100%;
}
</style>
