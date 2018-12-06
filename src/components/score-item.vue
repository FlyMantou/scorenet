<template>
  <div class="score-item-conteiner" @click="openScore">
    <img class="score-img" :src="imgUrl"/>
    <a>{{scoreName}}</a>
  </div>

</template>

<script>
    export default {
      name: "score-item",
      props: ['img-url','score-name','score-id'],
      data() {
        return {
          getList:[],
          imgUrl: this.img-url,
          scoreName: this.score-name,
          scoreId:this.score-id
        }
      },
      methods:{
        openScore(){
          if (this.scoreId!=null){
            this.$router.push({name:'Score',params:{id:this.scoreId}})
          }
        }
      }
    }

</script>

<style scoped>
  .score-item-conteiner{
    width: 150px;
    height: 170px;
    padding: 20px;
  }
  a:hover{
    cursor:pointer
  }
  .score-img{
    width: 150px;
    height: 150px;
  }
</style>
