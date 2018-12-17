<template>
  <div class="score-item-conteiner" @click="openScore">
    <a>
    <img class="score-img" :src="imgUrl"/>
    {{scoreName}}</a>
  </div>

</template>

<script>
    export default {
      name: "score-item",
      props: ['img_url','score_name','score_id'],
      data() {
        return {
          getList:[],
          imgUrl: this.img_url,
          scoreName: this.score_name,
          scoreId:this.score_id
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
