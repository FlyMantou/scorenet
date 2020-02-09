<template>
  <div class="score-item-conteiner" @click="openScore">
    <a>
    <img class="score-img" :src="imgUrl" @error="defImg()"/>
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
          scoreId:this.score_id,
          defaultImg: require("../assets/img/default.png")
        }
      },
      methods:{
        openScore(){
          if (this.scoreId!=null){
            this.$router.push({name:'Score',params:{id:this.scoreId}})
          }
        },
        defImg(){
          let img = event.srcElement;
          img.src = this.defaultImg;
          img.onerror = null; //防止闪图
        }
      }
    }

</script>

<style scoped>
  .score-item-conteiner{
    width: 150px;
    height: 170px;
    padding: 10px;
    color: white;
  }
  a:hover{
    cursor:pointer
  }
  .score-img{
    width: 150px;
    height: 150px;
    max-width: 100%;
    max-height: 100%;
    background-clip: padding-box;
    box-sizing: border-box;
    border: 1px solid rgba(0,0,0,0.2);
    border-radius: 20px;
    background-size: auto;
  }
</style>
