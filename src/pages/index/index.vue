<template>
    <el-container class="container" direction="vertical">
      <el-header class="header" height="10vh">乐谱部落</el-header>
      <el-main class="main">
        <score-item v-for="(item, index) in itemList" v-bind:key="index" class="score" :img_url="'http://yulindb.myhuanghai.com'+item.score.coverimagefilepath"
                    :score_name="item.score.scorename"
                    :score_id="item.score.id"></score-item>
      </el-main>
      <el-footer class="footer" height="6vh">一起谱写律动的青春！</el-footer>
    </el-container>

</template>

<script>
import ScoreItem from "../../components/score-item";
import {getScore, getScoreList,parse,getParse} from "../../axios/score";
export default {
  name: 'Index',
  components: {ScoreItem},
  data () {
    return {
      imgUrl: "",
      scoreName: "",
      itemList: [],
      parseId: 0
    }
  },
  methods:{
    getList(){
      getScoreList().then(r=>{
        console.log(r)
        this.itemList = r.data.data
      })
    },
  },
  created(){

  },
  mounted(){
    this.getList();
    /*parse('ypk-editor-sheet-upload/xml-files/1.xml','ypk-editor-sheet-upload/midi-files/1.mid').then(r=>{
      console.log(r)
      if (r.data.status===0){
        this.parseId = r.data.data;
      }
    })*/
    /*let _this = this
    let interval = setInterval(function () {
      if (_this.parseId!==0){
        getParse(_this.parseId).then(r=>{
          console.log(r)
          if (r.data.data.status === 2){
            clearInterval(interval)
          }
        })
      }

    },1000)*/
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .score{
    float: left;
    position: relative;
  }
.container{
  width: 100%;
  height: 100%;
  text-align: center;
  background-image: url("../../assets/img/bg.png");
}
.header{
  background-color: rgba(60, 60, 60, 0.65);
  color: white;
  text-align: center;
  line-height: 10vh;
  font-size: 4vh;
}
.main{
  width: 100vw;
  margin: 0 auto;
}
  .main::-webkit-scrollbar {
    display: none;
  }
.footer{
  background-color: rgba(60, 60, 60, 0.65);
  color: white;
  line-height: 6vh;
  font-size: 2vh;
}
</style>
