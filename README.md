# scorenet

> 基于vue-cli的曲谱网站框架

### 使用HHScorePlayer
```
npm install --save yuki-createjs
```
```
<template>
  <div>
    <HHScorePlayer :img-path-arr="imgPathArr" :audio-path="audioPath" :cursor-path="cursorPath" :player-width="playerWidth" :player-height="playerHeight" :page-per-screen="page"/>
  </div>
</template>
```

```
import HHScorePlayer from "../../components/ScorePlayer/index";
  export default {
    name: 'ScorePlayer',
    components: { HHScorePlayer },
    data() {
      return {
        imgPathArr: [],
        audioPath: '',
        cursorPath: '',
        playerWidth: 1200,
        playerHeight: 540,
        page: 2
      }
    },
    mounted() {
      this.imgPathArr = ['http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96_0001.png?x-oss-process=style/test1',
        'http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96_0002.png?x-oss-process=style/test1',
        'http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96_0003.png?x-oss-process=style/test1',
        'http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96_0004.png?x-oss-process=style/test1',
        'http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96_0005.png?x-oss-process=style/test1']
      this.audioPath = 'http://yulindb.myhuanghai.com/score/18/17/%E5%8D%83%E9%87%8C%E4%B9%8B%E5%A4%96.mp3'
      this.cursorPath = 'http://yulindb.myhuanghai.com/score/18/17/song.cur'
    },
    methods: {

    }
  }
```
