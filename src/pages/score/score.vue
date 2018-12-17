<template>
  <div>
    <div>
      <canvas id="canvas"></canvas>
    </div>
    <div class="container" style="position: fixed;bottom: 0;width: 100%">
      <AudioView style="width: 640px;text-align: center;margin:0 auto" v-on:onprogress="onprogress" v-on:onplay="onplay"
                 v-on:onended="onended" v-on:onpause="onpause" :audio_url="audio_url"></AudioView>
      <!--<button id="btn-play">播放</button>
      <button id="btn-stop">停止</button>-->
    </div>
  </div>


</template>

<script>
  import {getScore, getScoreData} from "../../axios/score";
  import $ from 'jquery'
  import AudioView from "../../components/AudioView";
  import * as workerTimers from 'worker-timers';

  export default {
    name: "score",
    components: {AudioView},
    data() {
      return {
        scoreId: this.$route.params.id,
        scoreInfo: {},
        scoreData: {},
        canvasData: {
          canvas: {},
          ctx: {},
          imgArr: [],
          noteSeq: [],
          tempSeq:[],
          blueTick: 0,
          redTick: 0,
          currentTime: -1,
          lastBlueRect: [0, 0, 0, 0],
          lastRedRect: [0, 0, 0, 0],
          skipBlue: false,
          skipRed: false,
          pageHeight: 0,
          pageWidth: 0,
          canvasWidth: 1280,
          canvasHeight: 0,
          pageNum: 0,
          scale: 1
        },
        audioData: {
          currentTick: 0,
          time: {},
          isPlay: false,
        },
        currentMs:-1,
        currentSeqIndex:0,
        startTime:0,
        timeSeq:[],
        timeIndex:0
      }
    },
    computed: {
      audio_url() {
        // return encodeURI("http://yulindb.myhuanghai.com/score/水木年华+在他乡+C调+20180713/水木年华+在他乡+C调+20180713.mp3").replace(/\+/g, '%2B');
        return encodeURI("http://yulindb.myhuanghai.com/score/比较大的大提琴/比较大的大提琴.mp3").replace(/\+/g, '%2B');
      }
    },
    watch:{
      currentMs:function(val){
        console.log("currentMs-->"+val)
        if (this.canvasData.noteSeq[val]){
          this.draw(val);
        }
      }
    },
    methods: {
      onplay() {
        console.log("onplay");
        this.audioData.isPlay = true;
        this.startLoop();
      },
      loop(x,instance){
        let _this = instance;
        setTimeout(function () {
          if (_this.audioData.isPlay){
            _this.currentMs = _this.timeSeq[_this.timeIndex];
            let delay = 0;
            if (_this.timeSeq.length>_this.timeIndex+1) {
              delay = _this.timeSeq[_this.timeIndex+1];
            }else {
              _this.audioData.isPlay = false;
            }
            _this.timeIndex++;
            let offset = new Date().getTime()-_this.startTime;
            _this.loop(delay-offset,instance)
          }
        },x);
      },
      startLoop() {

     //   this.canvasData.tempSeq = this.canvasData.noteSeq.slice();
       // this.canvasData.tempSeq.reverse();
       // console.log(this.canvasData.tempSeq);
        this.startTime = new Date().getTime();
        this.loop(0,this);
      //  let _this = this;
        /*let now = new Date().getTime()
        console.log(now);
        this.audioData.time = workerTimers.setInterval(() => {
          // do something many times
          let temp = new Date().getTime()
          console.log(temp-now);
          now = temp;
          _this.currentMs ++;
        }, 1);*/




       /* let time = new Date().getTime();
        console.log(time);
        _this.audioData.time = setInterval(function () {
          let temp = new Date().getTime();
          if ((temp-time)>0){
            _this.currentMs += temp -time;
          }
          time = temp;
        },1);*/
        /*setTimeout(function () {
          let i=0;
          while (i++<1000){
            let offset = performance.now() - startTime;
            console.log(offset)
          }
        },0)*/
        /*_this.audioData.time = setInterval(function () {
          let offset = performance.now() - startTime;
          console.log(offset)
          if (offset >= (0.0004699 * _this.audioData.currentTick)) {
            _this.audioData.currentTick++;
            console.log("tick++")
            setTimeout(function () {
              if (_this.canvasData.noteSeq[_this.audioData.currentTick * 256 / 960]) {
                _this.draw(_this.audioData.currentTick)
              }
            }, 0)
          }
        }, 0)*/
        console.log("继续执行")

       /* console.log("startLoop执行")
        let _this = this;
        _this.audioData.time = setInterval(function () {
          _this.audioData.currentTick += 64;
          if (_this.canvasData.noteSeq[_this.audioData.currentTick]) {
            _this.draw(_this.audioData.currentTick)
          }
        }, 112);*/

      },
      onpause() {
        console.log("onpause执行")
       // workerTimers.clearInterval(this.audioData.time)
        this.audioData.isPlay = false;
      },
      onended() {
        console.log("onended执行")
      },
      onprogress() {
        console.log("onprogress")
      },
      getScoreInfo() {
        getScore(this.scoreId).then(r => {
          console.log(r)
          this.scoreInfo = r.data.data
        })
      },
      getScoreData() {
        getScoreData(this.scoreId).then(r => {
          console.log(r)
          this.scoreData = r.data.data
          this.initScorePlayer();
        })
      },

      replaceColor(imageData, x, y, sourceColor, w, h, replaceColor) {
        x = x || 0,
          y = y || 0,
          w = x + w || imageData.width,
          h = y + h || imageData.height;
        if (x < 0 || y < 0 || w > imageData.width || h > imageData.height) {
          throw new Error("error params!");
        }
        console.log("imageData.width:" + imageData.width);
        console.log("x:" + x);
        console.log("y:" + y);
        console.log("w:" + w);
        console.log("h:" + h);
        for (let j = y; j < h; j++) {
          for (let i = x; i < w; i++) {
            console.log("i:" + i);
            let k = j * imageData.width + i,
              r = imageData.data[4 * k],
              g = imageData.data[4 * k + 1],
              b = imageData.data[4 * k + 2];
            if (r == sourceColor.r && g == sourceColor.g && b == sourceColor.b) {
              if (replaceColor) {
                imageData.data[4 * k] = replaceColor.r;
                imageData.data[4 * k + 1] = replaceColor.g;
                imageData.data[4 * k + 2] = replaceColor.b;
                imageData.data[4 * k + 3] = 255;
              } else {
                imageData.data[4 * k + 3] = 0;
              }
            }
          }
        }
        return imageData;
      },
      draw(ms) {
        //this.canvasData.ctx.clearRect(0, 0, this.canvasData.canvasWidth, this.canvasData.canvasHeight * this.canvasData.pageNum);
        for (let x = 0; x < this.canvasData.imgArr.length; x++) {
          //this.canvasData.ctx.drawImage(this.canvasData.imgArr[x], 0, this.canvasData.canvasHeight * x, this.canvasData.canvasWidth, this.canvasData.canvasHeight);
        }
        //当前时间：cms,转换为tick公式为：cms*960/(qms*1000)
        let screenHeight = document.documentElement.clientHeight;
        let scrollHeight = document.documentElement.scrollTop;
        let topY = 0.2 * screenHeight + scrollHeight;
        let bottomY = 0.7 * screenHeight + scrollHeight;
     //   console.log("screenHeight-->" + screenHeight);
     //   console.log("scrollHeight-->" + scrollHeight);
     //   console.log("topY-->" + topY);
     //   console.log("bottomY-->" + bottomY);
        //let tick = parseInt((parseInt(cms)) * 960 * 1000 / (MIDI.Player.qms) * 256 / 960);
        //let tick = (parseInt(cms)*256/960);
        // console.log(tick);
        // console.log(noteSeq[tick]);
        if (this.canvasData.noteSeq[ms]) {
          let tempArr = this.canvasData.noteSeq[ms];
          for (let x = 0; x < tempArr.length; x++) {
            let obj = tempArr[x];

            if (obj.staff === 1) {
              //ctx.clearRect(lastBlueRect[0],lastBlueRect[1],lastBlueRect[2],lastBlueRect[3]);
              // console.log("staff-->"+obj.staff);
              let itemY = (obj.t + (obj.b - obj.t) / 2) / 2;
              // console.log("itemY-->"+itemY);
              // console.log("t-->"+obj.t);
              // console.log("b-->"+obj.b);
              if (itemY >= topY && itemY <= bottomY) {

              } else {
                if (itemY - 0.4 * screenHeight > 0) {
                  // console.log("滚动-->"+(itemY-0.4*screenHeight));
                  //$.scrollTo(0,itemY-0.4*screenHeight);
                  $('html,body').animate({scrollTop: itemY - 0.4 * screenHeight}, 500);
                }
              }
              this.canvasData.blueTick = ms;
            } else if (obj.staff === 2) {
              //ctx.clearRect(lastRedRect[0],lastRedRect[1],lastRedRect[2],lastRedRect[3]);
              this.canvasData.redTick = ms;
            }
          }
        }

        if (this.canvasData.noteSeq[this.canvasData.blueTick]) {//画蓝线框
          let tempArr = this.canvasData.noteSeq[this.canvasData.blueTick];
          for (let x = 0; x < tempArr.length; x++) {
            let obj = tempArr[x];
            if (obj.staff === 1) {
              this.canvasData.ctx.fillStyle = "rgba(36,183,237,0.5)";
              this.canvasData.ctx.fillRect(obj.l, obj.t, obj.r - obj.l, obj.b - obj.t);
              this.canvasData.lastBlueRect[0] = obj.l;
              this.canvasData.lastBlueRect[1] = obj.t;
              this.canvasData.lastBlueRect[2] = obj.r - obj.l;
              this.canvasData.lastBlueRect[3] = obj.b - obj.t;
            }
          }
        }
        if (this.canvasData.noteSeq[this.canvasData.redTick]) {//画红线框
          let tempArr = this.canvasData.noteSeq[this.canvasData.redTick];
          for (let x = 0; x < tempArr.length; x++) {
            let obj = tempArr[x];
            if (obj.staff === 2) {
              this.canvasData.ctx.fillStyle = "rgba(234,51,27,0.5)";
              this.canvasData.ctx.fillRect(obj.l, obj.t, obj.r - obj.l, obj.b - obj.t);
              this.canvasData.lastRedRect[0] = obj.l;
              this.canvasData.lastRedRect[1] = obj.t;
              this.canvasData.lastRedRect[2] = obj.r - obj.l;
              this.canvasData.lastRedRect[3] = obj.b - obj.t;
            }
          }
        }
      },
      initScorePlayer() {
        this.canvasData.canvas = $('#canvas')[0];
        this.canvasData.ctx = this.canvasData.canvas.getContext('2d');
        const imgPathArr = [];
        let imgArrTemp = this.scoreInfo.pngpath.split('#');
        imgArrTemp = imgArrTemp.sort();
        // const pageHeight = this.ScoreData.pageHeight
        for (let a = 0; a < imgArrTemp.length; a++) {
          imgPathArr[a] = encodeURI("http://yulindb.myhuanghai.com/score/" + imgArrTemp[a] + "?x-oss-process=style/test1").replace(/\+/g, '%2B');
        }
        console.log(imgPathArr);

        this.canvasData.pageHeight = this.scoreData.pageHeight;
        this.canvasData.pageWidth = this.scoreData.pageWidth;
        this.canvasData.pageNum = this.scoreData.pageNum;
        this.canvasData.scale = this.canvasData.pageWidth / 1280;
        this.canvasData.canvasWidth = 1280;
        this.canvasData.canvasHeight = this.canvasData.pageHeight / this.canvasData.scale;
        this.canvasData.canvas.width = 1280;
        this.canvasData.canvas.height = this.canvasData.pageHeight / this.canvasData.scale * this.canvasData.pageNum;
        $('#canvas').css("width", "640px");
        $('#canvas').css("height", "" + this.canvasData.pageHeight / this.canvasData.scale * this.canvasData.pageNum / 2);

        for (let x = 0; x < this.scoreData.noteItemList.length; x++) {
          let item = this.scoreData.noteItemList[x];
          let obj = new Object;
          obj.staff = item.staff;
          obj.ms = item.ms;
          if (item.box) {
            obj.l = item.box.left / this.canvasData.scale;
            obj.r = item.box.right / this.canvasData.scale;
            obj.t = item.box.top / this.canvasData.scale;
            obj.b = item.box.bottom / this.canvasData.scale;
          }
          if (this.canvasData.noteSeq[item.ms]) {
            this.canvasData.noteSeq[item.ms].push(obj);
          } else {
            let arr = [];
            arr.push(obj);
            this.canvasData.noteSeq[item.ms] = arr;
          }
        }
        console.log(this.canvasData.noteSeq)

        //记录时间线：
        for(let x=0;x<this.canvasData.noteSeq.length;x++){
          if (this.canvasData.noteSeq[x]){
            this.timeSeq.push(x);
          }
        }
        console.log(this.timeSeq);
        let imgArrInstance = this.canvasData.imgArr;
        let ctxInstance = this.canvasData.ctx;
        let pageHeightInstance = this.canvasData.pageHeight;
        let canvasWidthInstance = this.canvasData.canvasWidth;
        let scaleInstance = this.canvasData.scale;
        //画底图
        let currentIndex = -1;
        for (let x = 0; x < imgPathArr.length; x++) {
          let img = new Image();
          img.onload = (function (img) {
            imgArrInstance.push(img);
            console.log(img.width);
            //img = instance.replaceColor(img, 0, 0,{r:255,g:255,b:255},img.width,img.height,{r:0,g:0,b:0})
            console.log(x);
            ctxInstance.drawImage(img, 0, pageHeightInstance / scaleInstance * x, canvasWidthInstance, pageHeightInstance / scaleInstance);
            //let imgdata = ctx.getImageData(0,0,1280,pageHeight * x)
            // let newImgdata = instance.replaceColor(imgdata, 0, 0,{r:255,g:255,b:255},imgdata.width,imgdata.height,{r:0,g:0,b:0})
            // ctx.putImageData(newImgdata)
            currentIndex = x;
          }).bind(img, img);
          let mytime = setInterval(function () {
            if (currentIndex === x) {
              clearInterval(mytime)
            }
          }, 500);
          img.src = imgPathArr[x];
        }
        console.log(imgArrInstance)
        this.draw(0);
        // this.startLoop();
      }
    }
    ,
    created() {
      this.getScoreInfo()
      this.getScoreData()
    }
    ,
    mounted() {


    }
  }
</script>

<style scoped>

</style>
