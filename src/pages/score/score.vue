<template>
    <div>这是乐谱详情页{{msg}}</div>
</template>

<script>
    export default {
      name: "score",
      data(){
          return {
            msg:this.$route.query.id
          }
      }
    }
</script>

<style scoped>

</style>
