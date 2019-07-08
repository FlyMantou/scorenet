<template>
  <div>
    <HHScorePlayer
      :img-path-arr="imgPathArr"
      :audio-path="audioPath"
      :cursor-path="cursorPath"
      :player-width="playerWidth"
      :player-height="playerHeight"
      :direction-state="directionTemp"
      :page-per-screen="page"/>
    <div @click="testClick">按钮</div>
  </div>
</template>

<script>
  import HHScorePlayer from "../../components/ScorePlayer/index";
  //import HHScorePlayer from "hhscoreplayer";
  import {getScoreById} from "../../axios/score";

  export default {
    name: 'Score',
    components: { HHScorePlayer },
    data() {
      return {
        imgPathArr: [],
        audioPath: '',
        cursorPath: '',
        playerWidth: 1000,
        playerHeight: 600,
        directionTemp: 0,
        page: 2
      }
    },
    mounted() {
      console.log(this.$route.params.id)
     // if (this.$route.params.id) {
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
     // }
    },
    methods: {
      initScorePlayerData(pngFiles,audioPath,cursorPath) {
        this.imgPathArr = pngFiles;
        this.audioPath = audioPath;
        this.cursorPath = cursorPath
      },
      testClick(){
        console.log("testClick");
        this.$router.push({name:'Index'});
      }
    }
  }
</script>

<style scoped>

</style>
