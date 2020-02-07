<template>
  <div>
    <HHScorePlayer
      :img-path-prop="imgPathArr"
      :audio-path-prop="audioPath"
      :cursor-path-prop="cursorPath"
      :width-prop="playerWidth"
      :height-prop="playerHeight"
      :direction-prop="directionTemp"
      :page-prop="page"
      :auto-direction-prop="autoDirection"
      :is-lock-prop="0"
    />
    <div @click="testClick">按钮</div>
  </div>
</template>

<script>
  import HHScorePlayer from "../../components/ScorePlayer/hhscoreplayer";
/*  import HHScorePlayer from "hhscoreplayer"*/
  import {getScoreById} from "../../axios/score";

  export default {
    name: 'Score',
    components: { HHScorePlayer },
    data() {
      return {
        imgPathArr: [],//要加载的图片的地址集合，按页面顺序排序，集合大小视为乐谱页面数
        audioPath: '',//要加载的音频地址，仅支持mp3文件
        cursorPath: '',//要加载的光标文件地址，编码后的光标文件
        playerWidth: 800,//自定义播放器宽度
        playerHeight: 600,//自定义播放器高度
        directionTemp: 0,//自定义横版还是竖版显示，只有当autoDirection为false的时候生效
        page: 2,//自定义横版展示页面数，只有当autoDirection为false的时候生效
        autoDirection: true,//自动根据宽高设置版式
      }
    },
    mounted() {
      console.log(this.$route.params.id)
      //this.getData();
      const pngFiles = [];
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/1.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/2.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/3.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/4.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/5.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/6.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/7.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/8.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
     // pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/7.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/8.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/9.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
     // pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/10.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
     // pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/parse/11.png?x-oss-process=style/test1').replace(/\+/g, '%2B'))
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/score/36/34/千里之外_0001.png?x-oss-process=style/test1').replace(/\+/g, '%2B'));
      //pngFiles.push(encodeURI('https://ypk-user-upload.oss-cn-hangzhou.aliyuncs.com/sheet_files/74ff42c0-d2ae-11e9-9d90-85055167b993.png').replace(/\+/g, '%2B'));
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/score/36/34/千里之外_0002.png?x-oss-process=style/test1').replace(/\+/g, '%2B'));
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/score/36/34/千里之外_0003.png?x-oss-process=style/test1').replace(/\+/g, '%2B'));
      //pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/score/36/34/千里之外_0004.png?x-oss-process=style/test1').replace(/\+/g, '%2B'));
     // pngFiles.push(encodeURI('http://yulindb.myhuanghai.com/score/36/34/千里之外_0005.png?x-oss-process=style/test1').replace(/\+/g, '%2B'));
      let cursorPath = encodeURI('http://yulindb.myhuanghai.com/parse/1.cur').replace(/\+/g, '%2B');
      //let cursorPath = encodeURI('http://yulindb.oss-cn-beijing.aliyuncs.com/score/36/34/song.cur').replace(/\+/g, '%2B');
      this.initScorePlayerData(pngFiles,"http://yulindb.myhuanghai.com/parse/1.mp3",cursorPath)
    },
    methods: {
      initScorePlayerData(pngFiles,audioPath,cursorPath) {
        this.imgPathArr = pngFiles;
        this.audioPath = audioPath;
        this.cursorPath = cursorPath
      },
      getData(){
        getScoreById(this.$route.params.id).then(response => {
          console.log(response)
          const files = response.data.data.assets[0].files
          const pngFiles = []
          let audioPath = ''
          let cursorPath = ''
          for (let x = 0; x < files.length; x++) {
            const file = files[x]
            if (file.type === 'png') {
              pngFiles.push(encodeURI('http://yulindb.myhuanghai.com' + file.ossPath + '?x-oss-process=style/test1').replace(/\+/g, '%2B'))
            } else if (file.type === 'mp3') {
              audioPath = encodeURI('http://yulindb.myhuanghai.com' + file.ossPath).replace(/\+/g, '%2B')
            } else if (file.type === 'cur') {
              cursorPath = encodeURI('http://yulindb.myhuanghai.com' + file.ossPath).replace(/\+/g, '%2B')
            }
          }
          pngFiles.sort()
          this.initScorePlayerData(pngFiles, audioPath, cursorPath)
        })
      },
      testClick(){
        console.log("testClick");
        this.playerWidth = 800;
        this.playerHeight = 480;
        //this.$router.push({name:'Index'});
        //this.getData();
      }
    }
  }
</script>

<style scoped>

</style>
