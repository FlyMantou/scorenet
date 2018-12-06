<template>
    <el-container class="container" direction="vertical">
      <el-header class="header">乐谱列表展示</el-header>
      <el-main class="main">
        <score-item v-for="item in itemList" v-bind:key="item" class="score" :img-url="item.scoreimgurls" :score-name="item.scorename" :score-id="item.id"></score-item>
      </el-main>
      <el-footer class="footer">make by huanghai   1165441461@qq.com</el-footer>
    </el-container>

</template>

<script>
import ScoreItem from "../../components/score-item";
import {getScore, getScoreList} from "../../axios/score";
export default {
  name: 'HelloWorld',
  components: {ScoreItem},
  data () {
    return {
      imgUrl: "",
      scoreName: "",
      itemList: []
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
    this.getList();
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
  text-align: center;
  background-color: bisque;
  height: auto;
}
.header{
  background-color: #409EFF;
  height: 200px;
}
.main{
  width: 1300px;
  margin: 0 auto;
  background: chocolate;
}
.footer{
  background-color: black;
  color: white;
  height: 200px;
}
</style>
