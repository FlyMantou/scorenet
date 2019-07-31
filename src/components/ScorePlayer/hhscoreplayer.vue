<template>
  <div ref="container" id="score-player" :style="{width:width+'px', height:height+'px'}">
    <canvas id="canvas" ref="canvas"></canvas>
    <div style="position: absolute;bottom: 0">
      <HHScoreController
        :current-progress="currentProgress"
        :max-progress="maxProgress"
        :controller-width="width"
        :time-text-value="timeText"
        :play-state-value="isPlay"
        :controller-height="controllerHeight"
        :hide-state="hideState"
        :full-state-value="fullState"
        :direction-state-value="direction"
        :page-per-state-value="pagePer"
        :cursor-state-value="cursorState"
        @onProgressChanged="onControllerProgressChanged"
        @onPlayStateChanged="onControllerPlayStateChanged"
        @onStop="onControllerStop"
        @onFullStateChanged="onControllerFullStateChanged"
        @onDirectionStateChanged="onControllerDirectionStateChanged"
        @onPagePerStateChanged="onControllerPagePerStateChanged"
        @onCursorStateChanged="onControllerCursorStateChanged"
      ></HHScoreController>
    </div>
    <div v-show="isLoadComplete">
      <div class="hor-mask" v-show="isLoadComplete" :style="{width:width+'px', height:height+'px'}">
        <div class="left-mask" @click="handlePrePage" :style="{width:width/6+'px', height:height+'px', left:'0px', top:'0px'}">
          <svg t="1564555123085" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2999"><path d="M254.890667 512L702.890667 64l60.416 60.330667-448 448L254.890667 512z m60.842666-60.757333l453.290667 453.376-60.330667 60.330666-453.376-453.376 60.416-60.330666z" p-id="3000" fill="#ffffff"></path></svg>
        </div>
        <div class="right-mask" @click="handleNextPage" :style="{width:width/6+'px', height:height+'px', left:(5*width/6)+'px', top:'0px'}">
          <svg t="1564555091300" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2230"><path d="M769.11 512l-448 448-60.417-60.33 448-448L769.11 512z m-60.758 60.672L254.891 119.467l60.586-60.416 453.12 453.376-60.33 60.33z" p-id="2231" fill="#ffffff"></path></svg>
        </div>
      </div>
    </div>


    <div ref="loading" v-show="!isLoadComplete" class="loading"
         :style="{width: loadingConWidth+'px',height:loadingConHeight+'px',left:loadingConLeft+'px',top:loadingConTop+'px'}">
      <!--<img src="../../assets/img/load.png" style="width: 100%;height: 100%"/>-->
      <div class="progress-con">
        <div class="progress" :style="{width: progressWidth+'px'}">

        </div>

      </div>
      <span :style="{color: 'white',textAlign: 'center',width: '100%',fontSize: loadingConHeight/8+'px'}">加载资源</span>
    </div>
  </div>
</template>

<script>

  import 'yuki-createjs'
  import leftImgImport from '@/assets/img/left.png'
  import leftPressImgImport from '@/assets/img/left_p.png'
  import rightImgImport from '@/assets/img/right.png'
  import rightPressImgImport from '@/assets/img/right_p.png'
  import HHScoreController from "../../components/ScorePlayer/controller";
  import $ from 'jquery'
  /* 配置常量*/
  let ls = 0.1;
  let rs = 0.1;
  const cs = 0.02;
  const bgColor = '#333333';
  /* 配置变量*/
  let isChangePage = false;
  let isAudioLoadComplete = false;
  /* 实例变量*/
  let canvas;
  let stage = null;
  let soundInstance = null;
  let loadObj = null;
  let images = {};
  const bitmapArr = [];
  const noteSeq = [];
  const measureSeq = [];
  let scoredata;
  let scoreCallback;
  let barrange;
  let uiContainer = null;
  let scoreContainer = null;
  let scoreScreenContainer = null;
  let playContainer = null;
  let cursorContainer = null;
  let cursorPlayer = null;
  /* 逻辑变量*/
  let currentPage = 1;
  let pageNum = 0;
  let initStageWidth;
  let initStageHeight;
  let stageWidth;
  let stageHeight;
  let scoreImgWidthOnScreen;
  let scoreImgHeightOnScreen;

  /*增加横竖屏*/
  export default {
    name: 'HHScorePlayer',
    components: {HHScoreController},
    props: {
      imgPathProp: Array,
      audioPathProp: String,
      cursorPathProp: String,
      widthProp: Number,
      heightProp: Number,
      pageProp: Number,
      directionProp: Number,
      autoDirectionProp: Boolean,
    },
    data() {
      return {
        width: this.widthProp,
        height: this.heightProp,
        direction: this.directionProp,
        pagePer: this.pageProp,
        currentProgress: 0,
        maxProgress: 100,
        controllerHeight: 80,
        progressWidth: 0,
        hideState: false,
        timeText: '00:00 / 00:00',
        fullState: false,
        isLoadComplete: false,
        isPlay: false,
        cursorState: 1,
        volume: 100,
        imgLoadLock: false,
        audioLoadLock: false,
        cursorLoadLock: false,
        mountLock: false,
        assets: {
          leftImgPath: leftImgImport,
          leftPressImgPath: leftPressImgImport,
          rightImgPath: rightImgImport,
          rightPressImgPath: rightPressImgImport,
        }
      }
    },
    watch: {
      autoDirectionProp(val) {
        this.autoDirectionProp = val;
        console.log("watch-->autoDirectionProp");
        this.checkAutoDirection();
        if (this.isLoadComplete) {
          this.initUI();
        }
      },
      widthProp(val) {
        console.log("watch-->widthProp");
        this.width = val;
      },
      heightProp(val) {
        console.log("watch-->heightProp");
        this.height = val;
      },
      directionProp(val) {
        console.log("watch-->directionProp");
        //监听方向改变
        if (val !== 0 && val !== 1) {
          val = 0;
        }
        this.directionProp = val;
        if (this.isLoadComplete) {
          this.initUI();
        }
      },
      pageProp(val) {
        console.log('watch:pageProp-->' + val);
        this.pageProp = val;
        if (this.isLoadComplete) {
          this.initUI();
        }
      },
      imgPathProp(val) {
        console.log('watch:imgPathProp-->' + val);
        // TODO 监听图片路径改变
        if (!this.imgLoadLock) {
          this.imgPathProp = val;
          this.loadImageResource();
        }
      },
      audioPathProp(val) {
        console.log('watch:audioPath-->' + val);
        // TODO 监听音频路径改变
        if (val === undefined || val === null || val === "") {
          return;
        }
        if (!this.audioLoadLock) {
          this.audioPathProp = val;
          this.loadMp3Resource();
        }
      },
      cursorPathProp(val) {
        console.log('watch:cursorpath-->' + val);
        if (!this.cursorLoadLock) {
          this.cursorPathProp = val;
          this.loadCursorResource();
        }
      }
    },
    computed: {
      loadingConWidth() {
        return this.height / 4;
      },
      loadingConHeight() {
        return this.height / 4;
      },
      loadingConLeft() {
        return this.width / 2 - this.height / 8;
      },
      loadingConTop() {
        return this.height / 2 - this.height / 8;
      },
    },
    beforeCreate() {
      console.log("生命周期-->beforeCreate");
    },
    beforeMount() {
      console.log("生命周期-->beforeMount");
    },
    mounted() {
      if (!this.mountLock) {
        this.mountLock = true;
        console.log("生命周期-->mounted");
        const _this = this;
        canvas = this.$refs.canvas;
        //按键事件
        document.onkeydown = function (event) {
          if (event.keyCode === 37) { // left
            _this.prePage()
          } else if (event.keyCode === 39) { // right
            _this.nextPage()
          } else if (event.keyCode === 38) { // up
            soundInstance.volume += 0.1
          } else if (event.keyCode === 40) { // down
            soundInstance.volume -= 0.1
          } else if (event.keyCode === 32) { // space
            if (soundInstance) {
              if (!_this.isPlay) {
                _this.playAudio();
              } else {
                _this.pauseAudio();
              }
            }
          }
        };
        //鼠标移入移出事件
        $(this.$refs.container).mouseenter(function () {
          _this.hideState = false;
        });
        $(this.$refs.container).mouseleave(function () {
          _this.hideState = true;
        });
        //滑轮事件
        $(this.$refs.container).bind('mousewheel DOMMouseScroll', function (event) { //on也可以 bind监听
          if (_this.direction === 1) {
            //Chorme
            let wheel = event.originalEvent.wheelDelta;
            let detal = event.originalEvent.detail;
            if (event.originalEvent.wheelDelta) { //判断浏览器IE,谷歌滚轮事件
              if (wheel > 0) { //当滑轮向上滚动时
                scoreContainer.y += (_this.height / 4);
              }
              if (wheel < 0) { //当滑轮向下滚动时
                scoreContainer.y -= (_this.height / 4);
              }
            } else if (event.originalEvent.detail) {  //Firefox滚轮事件
              if (detal > 0) { //当滑轮向下滚动时
                scoreContainer.y -= (_this.height / 4);
              }
              if (detal < 0) { //当滑轮向上滚动时
                scoreContainer.y += (_this.height / 4);
              }
            }
            event.preventDefault();
          }

        });
        //监听全屏与退出全屏事件
        window.onresize = function () {
          console.log("window.onresize");
          if (!_this.checkFull()) {//非全屏
            //console.log("_this.fullState-->" + _this.fullState);
            if (_this.fullState) {
              //退出全屏
              console.log("退出全屏:widthProp-->" + _this.widthProp);
              _this.fullState = false;
              _this.width = _this.widthProp;
              _this.height = _this.heightProp;
              _this.postInit();
              if (_this.isLoadComplete) {
                _this.initUI();
              }
            }
          } else {
            if (!_this.fullState) {
              //进入全屏
              console.log("进入全屏");
              _this.fullState = true;
              _this.width = screen.width;
              _this.height = screen.height;
              _this.postInit();
              if (_this.isLoadComplete) {
                _this.initUI();
              }

            }
          }
        };
        _this.postInit();
        this.mountLock = false;
      }


    },
    methods: {
      handlePrePage(){
        this.prePage();
      },
      handleNextPage(){
        this.nextPage();
      },
      onControllerProgressChanged(progress) {
        //progress为百分比
        console.log("onProgressChanged-->" + progress);
        if (soundInstance) {
          soundInstance.position = progress;
          this.timeText = (this.formatTime(progress / 1000) + ' / ' + this.formatTime(soundInstance.duration / 1000));
          if (cursorPlayer) {
            //跳转页面
            cursorPlayer.gotoMs(progress);
          }
          if (this.isPlay) {
            if (cursorPlayer) {
              cursorPlayer.stopPlay();
              cursorPlayer.startPlay(soundInstance.position);
            }
          }
        }
      },
      onControllerPlayStateChanged(state) {
        console.log("onPlayStateChanged-->" + state);
        if (soundInstance) {
          if (!this.isPlay) {
            this.playAudio();
          } else {
            this.pauseAudio();
          }
        }
      },
      onControllerStop() {
        console.log("onStop-->");
        this.stopPlay();
      },
      onControllerFullStateChanged(state) {
        console.log("onFullStateChanged-->" + state);
        if (this.fullState) {
          this.exitFullScreen();
        } else {
          this.openFullScreen(this.$refs.container);
        }
      },
      onControllerDirectionStateChanged(state) {
        console.log("onDirectionStateChanged-->" + state);
        if (this.direction === 0) {
          this.direction = 1;
          this.initUI();
        } else {
          this.direction = 0;
          this.initUI();
        }
      },
      onControllerPagePerStateChanged(state) {
        console.log("onPagePerStateChanged-->" + state);
        this.direction = 0;
        if (this.pagePer === 1) {
          this.pagePer = 2;
        } else if (this.pagePer === 2) {
          this.pagePer = 3;
        } else {
          this.pagePer = 1;
        }
        if (this.isLoadComplete) {
          this.initUI();
        }
      },
      onControllerCursorStateChanged(state) {
        console.log("onCursorStateChanged-->" + state);
        if (this.cursorState === 0) {
          this.cursorState = 1;
          this.changeCursor(1);
        } else if (this.cursorState === 1) {
          this.cursorState = 2;
          this.changeCursor(2);
        } else {
          this.cursorState = 0;
          this.changeCursor(0);
        }
      },
      checkAutoDirection() {
        if (this.autoDirectionProp) {
          if (this.width <= 800) {
            this.direction = 1;
          } else if (this.width <= this.height) {
            this.direction = 1;
          } else {
            this.direction = 0;
          }
          if (this.direction === 0) {
            let k = this.width / this.height;
            if (k < 1.4) {
              this.pagePer = 1;
            }
            if (k < 2.1) {
              this.pagePer = 2;
            } else {
              this.pagePer = 3;
            }
          }
        }
      },
      postInit() {
        let _this = this;
        //判断是否需要自动适应
        _this.checkAutoDirection();
        _this.initPlayer(function (event) {
          if (event.type === 'onImgLoadProgress') { // 乐谱图片加载进度
            const progress = event.value * 100;
            _this.updateLoadingProgress(progress/100);
          } else if (event.type === 'onImgLoadComplete') { // 乐谱图片加载完成

          } else if (event.type === 'onAudioLoadComplete') { // 音频加载完成
            soundInstance = event.value;
            _this.maxProgress = soundInstance.duration;
            _this.timeText = ('00:00 / ' + _this.formatTime(soundInstance.duration / 1000));
          } else if (event.type === 'onInitUiComplete') { // 初始化UI完成
            if (cursorPlayer) {
              //cursorPlayer.showAllCursor();
            }
          } else if (event.type === 'onNextPage') { // 下一页

          } else if (event.type === 'onPrePage') { // 上一页

          } else if (event.type === 'onChangePage') { // 切换页

          } else if (event.type === 'onAudioPlay') { // 音频开始播放
            _this.isPlay = true
          } else if (event.type === 'onAudioPause') { // 音频暂停播放
            _this.isPlay = false
          } else if (event.type === 'onStopPlay') { // 音频暂停播放
            _this.isPlay = false;
            _this.timeText = ('00:00 / ' + _this.formatTime(soundInstance.duration / 1000));
          } else if (event.type === 'onPlaying') { // 音频播放中
            if (soundInstance) {
              _this.timeText = (_this.formatTime(soundInstance.position / 1000) + ' / ' + _this.formatTime(soundInstance.duration / 1000));
            }
          } else if (event.type === 'onEndPlay') { // 音频播放结束
            if (soundInstance) {
              _this.isPlay = false
            }
          } else if (event.type === 'onExitFullScreen') { // 退出全屏
            this.fullState = false;
            if (soundInstance) {
              _this.timeText = (_this.formatTime(soundInstance.position / 1000) + ' / ' + _this.formatTime(soundInstance.duration / 1000));
            }
          } else if (event.type === 'onOpenFullScreen') { // 打开全屏
            this.hideState = false;
            this.fullState = true;
            if (soundInstance) {
              _this.timeText = (_this.formatTime(soundInstance.position / 1000) + ' / ' + _this.formatTime(soundInstance.duration / 1000));
            }
          }
        })
      },
      resetPlayer() {
        if (canvas != null) {
          canvas.width = this.width;
          canvas.height = this.height;
        }
      },
      initPlayer(callback) {
        this.resetPlayer();
        scoreCallback = callback;
        initStageWidth = canvas.width * 2;
        initStageHeight = canvas.height * 2;
        stageWidth = initStageWidth;
        stageHeight = initStageHeight;
        if (stage === null)
          stage = new createjs.Stage(canvas);
        if (scoreContainer === null)
          scoreContainer = new createjs.Container();
        if (uiContainer === null)
          uiContainer = new createjs.Container();
        if (playContainer === null)
          playContainer = new createjs.Container();
        if (cursorContainer === null)
          cursorContainer = new createjs.Container();
        if (scoreScreenContainer === null)
          scoreScreenContainer = new createjs.Container();
        if (loadObj === null)
          loadObj = this.createLoading((stageWidth) / 4, (stageHeight) / 4);

        createjs.Touch.enable(stage);
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener('tick', this.onFrame)
        // this.loadImageResource()
        // this.loadMp3Resource()
        // this.loadCursorResource()
      },
      loadImageResource() {
        let _this = this;
        _this.imgLoadLock = true;//上锁
        if (!_this.imgPathProp) {
          return;
        }
        _this.isLoadComplete = false;
        pageNum = 0;
        currentPage = 1;
        console.log('loadImageResource');
        const imgArr = _this.imgPathProp;
        const loader = new createjs.LoadQueue(true);// 这里一共可以是3个参数 第一个是是否用XHR模式加载 第二个是基础路径  第三个是跨域
        loader.addEventListener('fileload', _this.onImgFileLoad);
        loader.addEventListener('progress', _this.onImgLoadProgress);
        loader.addEventListener('complete', _this.onImgLoadComplete);

        const loadArr = [];
        for (let x = 0; x < imgArr.length; x++) {
          pageNum++;
          loadArr.push({src: imgArr[x], id: 'scoreImg' + x})
        }
        console.log(loadArr);
        loader.loadManifest(loadArr);
      },
      loadMp3Resource() {
        //console.log(createjs.Sound);
        if (!this.audioPathProp) {
          return
        }
        this.audioLoadLock = true;//上锁，禁止同时调用
        console.log('loadMp3Resource');
        const audioPath = this.audioPathProp;
        createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ['mp3'];
        createjs.Sound.on('fileload', this.onAudioLoadComplete);
        createjs.Sound.registerSound(audioPath, 'sound', 3);
      },
      loadCursorResource() {
        if (!this.cursorPathProp) {
          return;
        }
        this.cursorLoadLock = true;
        console.log('loadCursorResource');
        const _this = this;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.cursorPathProp, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (this.status === 200) {
            const blob = this.response;
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            // reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
            reader.onload = function (e) {
              // 转换完成，创建一个a标签用于下载
              const uint8view = new Uint8Array(e.target.result);
              const cursorData = _this.decode(uint8view);
              if (cursorData != null) {
                scoredata = cursorData;
                _this.initScoreCursor();
              }
            }
          }
        };
        xhr.send();
      },
      decode(bytes) {
        const cursorData = {};
        if (bytes[0] === 89 && bytes[1] === 85 && bytes[2] === 78 && bytes[3] === 80 && bytes[4] === 85) {
          const headLen = this.transInt2(bytes[5], bytes[6]);
          cursorData.pageNum = this.transInt2(bytes[7], bytes[8]);
          cursorData.pageWidth = this.transInt2(bytes[9], bytes[10]);
          cursorData.pageHeight = this.transInt2(bytes[11], bytes[12]);
          if (bytes[headLen + 7] === 78 && bytes[headLen + 8] === 79 && bytes[headLen + 9] === 84 && bytes[headLen + 10] === 69) {
            const noteLen = this.transInt2(bytes[headLen + 11], bytes[headLen + 12]);
            const noteNum = this.transInt2(bytes[headLen + 13], bytes[headLen + 14]);
            let noteStartIndex = headLen + 15;
            const noteStep = noteLen / noteNum;
            const notItemList = [];
            for (let x = 0; x < noteNum; x++) {
              const noteItem = {};
              noteItem.midTick = this.transInt4(bytes[noteStartIndex], bytes[noteStartIndex + 1], bytes[noteStartIndex + 2], bytes[noteStartIndex + 3]);
              noteItem.ms = this.transInt4(bytes[noteStartIndex + 4], bytes[noteStartIndex + 5], bytes[noteStartIndex + 6], bytes[noteStartIndex + 7]);
              noteItem.page = this.transInt2(bytes[noteStartIndex + 8], bytes[noteStartIndex + 9]);
              noteItem.system = this.transInt2(bytes[noteStartIndex + 10], bytes[noteStartIndex + 11]);
              noteItem.measure = this.transInt2(bytes[noteStartIndex + 12], bytes[noteStartIndex + 13]);
              noteItem.staff = this.transInt2(bytes[noteStartIndex + 14], bytes[noteStartIndex + 15]);
              noteItem.box = {
                left: this.transInt2(bytes[noteStartIndex + 16], bytes[noteStartIndex + 17]),
                top: this.transInt2(bytes[noteStartIndex + 18], bytes[noteStartIndex + 19]),
                right: this.transInt2(bytes[noteStartIndex + 20], bytes[noteStartIndex + 21]),
                bottom: this.transInt2(bytes[noteStartIndex + 22], bytes[noteStartIndex + 23])
              };
              noteItem.key = this.transInt2(bytes[noteStartIndex + 24], bytes[noteStartIndex + 25]);
              noteItem.noteType = this.transInt2(bytes[noteStartIndex + 26], bytes[noteStartIndex + 27]);
              noteItem.division = this.transInt2(bytes[noteStartIndex + 28], bytes[noteStartIndex + 29]);
              notItemList.push(noteItem);
              noteStartIndex += noteStep
            }
            cursorData.noteItemList = notItemList;
            if (bytes[noteStartIndex] === 77 && bytes[noteStartIndex + 1] === 69 && bytes[noteStartIndex + 2] === 65 && bytes[noteStartIndex + 3] === 83) {
              const measureLen = this.transInt2(bytes[noteStartIndex + 4], bytes[noteStartIndex + 5]);
              const measureNum = this.transInt2(bytes[noteStartIndex + 6], bytes[noteStartIndex + 7]);
              let measureStartIndex = noteStartIndex + 8;
              const measureStep = measureLen / measureNum;
              const measureItemList = [];
              for (let x = 0; x < measureNum; x++) {
                const measureItem = {};
                measureItem.midTick = this.transInt4(bytes[measureStartIndex], bytes[measureStartIndex + 1], bytes[measureStartIndex + 2], bytes[measureStartIndex + 3]);
                measureItem.ms = this.transInt4(bytes[measureStartIndex + 4], bytes[measureStartIndex + 5], bytes[measureStartIndex + 6], bytes[measureStartIndex + 7]);
                measureItem.page = this.transInt2(bytes[measureStartIndex + 8], bytes[measureStartIndex + 9]);
                measureItem.system = this.transInt2(bytes[measureStartIndex + 10], bytes[measureStartIndex + 11]);
                measureItem.measure = this.transInt2(bytes[measureStartIndex + 12], bytes[measureStartIndex + 13]);
                measureItem.box = {
                  left: this.transInt2(bytes[measureStartIndex + 14], bytes[measureStartIndex + 15]),
                  top: this.transInt2(bytes[measureStartIndex + 16], bytes[measureStartIndex + 17]),
                  right: this.transInt2(bytes[measureStartIndex + 18], bytes[measureStartIndex + 19]),
                  bottom: this.transInt2(bytes[measureStartIndex + 20], bytes[measureStartIndex + 21])
                };
                measureItemList.push(measureItem);
                measureStartIndex += measureStep;
              }
              cursorData.measureItemList = measureItemList;
              return cursorData;
            } else {
              console.log('光标格式错误1');
            }
          } else {
            console.log('光标格式错误2');
          }
        } else {
          console.log('光标格式错误3');
        }
      },
      transInt2(i1, i2) {
        if (i1 < 0) {
          i1 = 256 + i1;
        }
        if (i2 < 0) {
          i2 = 256 + i2;
        }
        return i1 * 256 + i2;
      },
      transInt4(i1, i2, i3, i4) {
        if (i1 < 0) {
          i1 = 256 + i1;
        }
        if (i2 < 0) {
          i2 = 256 + i2;
        }
        if (i3 < 0) {
          i3 = 256 + i3;
        }
        if (i4 < 0) {
          i4 = 256 + i4;
        }
        return i1 * 16777216 + i2 * 65536 + i3 * 256 + i4;
      },
      onFrame(event) {
        // 正在播放
        if (this.isPlay) {
          scoreCallback({type: 'onPlaying', value: soundInstance});
          this.currentProgress = soundInstance.position;
          this.maxProgress = soundInstance.duration;
          // stage.update()
        }
        // 由于每一帧刷新的时间不是固定，导致无法通过构建时间线来完成光标的判断，故采用递归时间的方式（在vuejs项目里面使用）的方法进行光标显示
        stage.update();
      },
      onImgFileLoad(evt) {
        if (evt.item.type === 'image') {
          images[evt.item.id] = evt.result;
        }
        //console.log("evt.item-->" + evt.item);
        // 这是单个文件加载完成的事件，把它保存到一个地方之后可以直接拿来创建对象
      },
      onImgLoadProgress(event) {
        scoreCallback({type: 'onImgLoadProgress', value: event.progress});
      },
      onImgLoadComplete(event) {
        scoreCallback({type: 'onImgLoadComplete', value: event});
        // 全部加载完成
        event.currentTarget.removeEventListener('fileload', this.onImgFileLoad);
        event.currentTarget.removeEventListener('progress', this.onImgLoadProgress);
        event.currentTarget.removeEventListener('complete', this.onImgLoadComplete);

        this.initUI()
      },
      onAudioLoadComplete(event) {
        const _this = this;
        createjs.Sound.removeEventListener("progress", this.onAudioLoadProgress);
        createjs.Sound.removeEventListener("fileload", this.onAudioLoadComplete);
        // event.currentTarget.removeEventListener("complete", onAudioLoadComplete);
        isAudioLoadComplete = true;
        if (soundInstance == null) {
          soundInstance = createjs.Sound.createInstance('sound');
          //soundInstance = createjs.Sound.play('sound', { interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1 })
          //soundInstance.paused = true
        }
        this.timeText = '00:00 / ' + this.formatTime(soundInstance.duration / 1000);

        soundInstance.on('complete', function (event) {
          soundInstance.paused = true;
          soundInstance.position = 0;
          scoreCallback({type: 'onEndPlay', value: soundInstance});
          _this.isPlay = false
        });
        soundInstance.on('loop', function (event) {
          console.log('loop-->' + event);
          _this.pauseAudio();
        });
        soundInstance.on('failed', function (event) {
          console.log('failed-->' + event)
        });
        this.audioLoadLock = false;//解锁，可以进行再次加载
        scoreCallback({type: 'onAudioLoadComplete', value: soundInstance})
      },
      resetUI() {
        ls = rs = 0.1;
        scoreScreenContainer.removeAllChildren();
        scoreScreenContainer.removeAllEventListeners();
        scoreScreenContainer.addChild(scoreContainer);
        stage.removeAllChildren();
        stage.removeAllEventListeners();
        stage.addChild(scoreScreenContainer);
        stage.addChild(uiContainer);
        stage.addChild(loadObj.loadingConteiner);
        scoreContainer.removeAllChildren();
        uiContainer.removeAllChildren();
        playContainer.removeAllChildren();
        cursorContainer.removeAllChildren();
        scoreContainer.removeAllEventListeners();
        uiContainer.removeAllEventListeners();
        playContainer.removeAllEventListeners();
        cursorContainer.removeAllEventListeners();
        scoreContainer.x = 0;
        scoreContainer.y = 0;
      },
      initUI() {
        const _this = this;
        this.resetUI();
        console.log('initUI-->' + stage);
        canvas.width = stageWidth;
        canvas.height = stageHeight;
        canvas.style.width = stageWidth / 2 + 'px';
        canvas.style.height = stageHeight / 2 + 'px';
        // sw = stageWidth * (1 - ls - rs - cs) / 2;
        if (_this.direction === 0) {
          scoreImgHeightOnScreen = stageHeight - 20// 乐谱显示的高度为stage高度减去控制栏2倍高度（考虑到控制栏隐藏后样式问题）
        } else if (_this.direction === 1) {//垂直模式默认横向只显示1页
          scoreImgWidthOnScreen = stageWidth * (1 - ls - rs);
        }
        // 初始化左右翻页按钮
        const leftBtn = this.createButtonSprite(this.assets.leftImgPath, this.assets.leftPressImgPath, this.assets.leftPressImgPath, 128, 128);
        leftBtn.addEventListener('click', function (event) {
          _this.prePage()
        });
        leftBtn.x = 0;
        leftBtn.y = (stageHeight - 64) / 2;
        const rightBtn = this.createButtonSprite(this.assets.rightImgPath, this.assets.rightPressImgPath, this.assets.rightPressImgPath, 128, 128)
        rightBtn.addEventListener('click', function (event) {
          _this.nextPage()
        });
        rightBtn.x = stageWidth - 128;
        rightBtn.y = (stageHeight - 64) / 2;

        // 加载乐谱图片
        //console.log(images);
        //console.log(pageNum);
        for (let x = 0; x < pageNum; x++) {
          this.putScoreToStage(x + 1, images['scoreImg' + x])
        }
        scoreScreenContainer.x = ls * stageWidth;

        let hitArea = new createjs.Shape();
        hitArea.graphics.beginFill('#000').drawRect(0, 0, scoreImgWidthOnScreen * this.pagePer + cs * stageWidth * (this.pagePer - 1), scoreImgHeightOnScreen);
        scoreScreenContainer.hitArea = hitArea;
        let pressX = 0;
        let pressY = 0;
        let x = 0;
        let y = 0;
        scoreScreenContainer.addEventListener('mousedown', function (event) {
          pressX = event.stageX;
          pressY = event.stageY;
          x = scoreContainer.x;
          y = scoreContainer.y;
        });
        scoreScreenContainer.addEventListener('pressmove', function (event) {
          if (_this.direction === 0) {
            scoreContainer.x = x + (event.stageX - pressX);
          } else if (_this.direction === 1) {
            scoreContainer.y = y + (event.stageY - pressY);
          }
        });
        scoreScreenContainer.addEventListener('pressup', function (event) {
          pressX = 0
        });
        //两边的半透明遮罩
        if (_this.direction === 0) {
          uiContainer.addChild(_this.createRect(bgColor, 0.8, 0, 0, ls * stageWidth, stageHeight));
          uiContainer.addChild(_this.createRect(bgColor, 0.8, stageWidth - ls * stageWidth, 0, ls * stageWidth, stageHeight));

        }
        //创建弹幕UI
        barrange = this.createBarrange();

        //uiContainer.addChild(leftBtn);
        //uiContainer.addChild(rightBtn);
        uiContainer.addChild(barrange.container);

        //页码显示
        const pageText = this.createText('#eeeeee', 50, '0/0', stageWidth - 100, stageHeight - 50);
        pageText.name = 'pageText';
        uiContainer.addChild(pageText);

        //换页
        this.changePage(currentPage);
        cursorContainer.name = 'cursor';
        scoreContainer.addChild(cursorContainer);

        this.isLoadComplete = true;
        _this.imgLoadLock = false; //解锁，可以进行下一次UI渲染
        scoreCallback({type: 'onInitUiComplete', value: 0})
      },
      openFullScreen(element) {
        this.requestFullScreen(element)
      },
      exitFullScreen() {
        this.exitFullscreen()
      },
      setVolume(volume) {
        if (soundInstance) {
          soundInstance.volume = volume
        }
      },
      changeCursor(state) {
        if (state === 1) { // 显示音符光标
          cursorContainer.visible = true;
          if (cursorPlayer) {
            cursorPlayer.setType(0);
          }
        } else if (state === 2) { // 显示小节光标
          cursorContainer.visible = true;
          if (cursorPlayer) {
            cursorPlayer.setType(1);
          }
        } else {// 禁用光标
          cursorContainer.visible = false;
        }
      },
      playAudio() {
        console.log('this.playAudio');
        if (isAudioLoadComplete) {
          soundInstance.play('sound', {interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1});
          //soundInstance.paused = false;
          // soundInstance.play({interrupt:Sound.INTERRUPT_ANY, loop:2, pan:0.5});
          this.isPlay = true;
          if (cursorPlayer) {
            cursorPlayer.stopPlay();
            cursorPlayer.startPlay(soundInstance.position)
          }
          scoreCallback({type: 'onAudioPlay', value: soundInstance})
        }
      },
      stopPlay() {
        if (isAudioLoadComplete) {
          if (soundInstance.position !== 0) {
            soundInstance.paused = true;
            this.isPlay = false;
            soundInstance.position = 0;
            if (cursorPlayer) {
              cursorPlayer.stopPlay()
            }
            this.currentProgress = 0;
            this.gotoPage(1);
            if (cursorPlayer) {
              cursorPlayer.drawNoteItem(0)
            }
            scoreCallback({type: 'onStopPlay', value: soundInstance})
          }
        }
      },
      pauseAudio() {
        console.log('this.pauseAudio')
        if (isAudioLoadComplete) {
          soundInstance.paused = true
          this.isPlay = false
          if (cursorPlayer) {
            cursorPlayer.stopPlay()
          }
          scoreCallback({type: 'onAudioPause', value: soundInstance})
        }
      },
      nextPage() {
        if (currentPage >= pageNum) {
          return;
        }
        console.log("currentPage-->" + currentPage);
        if (!isChangePage) {
          isChangePage = true;
          if (this.direction === 0) {
            createjs.Tween.get(scoreContainer).to({x: -(currentPage) * (scoreImgWidthOnScreen + stageWidth * cs)}, 500).call(function () {
              isChangePage = false;
              currentPage++;
              scoreCallback({type: 'onNextPage', value: currentPage});
              uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            })
          } else if (this.direction === 1) {
            createjs.Tween.get(scoreContainer).to({y: -currentPage * scoreImgHeightOnScreen}, 500).call(function () {
              isChangePage = false;
              currentPage++;
              scoreCallback({type: 'onNextPage', value: currentPage});
              uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            })
          }

        }
      },
      prePage() {
        if (currentPage <= 1) {
          return;
        }
        console.log("currentPage-->" + currentPage);
        if (!isChangePage) {
          isChangePage = true;
          if (this.direction === 0) {
            createjs.Tween.get(scoreContainer).to({x: -(currentPage - 2) * (scoreImgWidthOnScreen + stageWidth * cs)}, 500).call(function () {
              isChangePage = false;
              currentPage--;
              scoreCallback({type: 'onPrePage', value: currentPage});
              uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            })
          } else if (this.direction === 1) {
            createjs.Tween.get(scoreContainer).to({y: -(currentPage - 2) * scoreImgHeightOnScreen}, 500).call(function () {
              isChangePage = false;
              currentPage--;
              scoreCallback({type: 'onPrePage', value: currentPage});
              uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            })
          }

        }
      },
      gotoPage(page) {
        if (!isChangePage) {
          isChangePage = true;
          if (this.direction === 0) {
            createjs.Tween.get(scoreContainer).to({x: -(page - 1) * (scoreImgWidthOnScreen + stageWidth * cs)}, 500).call(function () {
              isChangePage = false
              currentPage = page
              scoreCallback({type: 'onChangePage', value: currentPage});
              if (uiContainer !== null)
                uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            });
          } else if (this.direction === 1) {
            createjs.Tween.get(scoreContainer).to({y: -(page - 1) * scoreImgHeightOnScreen}, 500).call(function () {
              isChangePage = false
              currentPage = page
              scoreCallback({type: 'onChangePage', value: currentPage});
              if (uiContainer !== null)
                uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            });
          }

        }
      },
      changePage(page) {
        if (this.direction === 0) {
          scoreContainer.x = -(page - 1) * (scoreImgWidthOnScreen + stageWidth * cs);
          scoreCallback({type: 'onChangePage', value: currentPage});
          uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum;
        } else if (this.direction === 1) {
          scoreContainer.y = -(page - 1) * scoreImgHeightOnScreen;
          scoreCallback({type: 'onChangePage', value: currentPage});
          uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum;
        }

      },
      putScoreToStage(page, img) {
        let _this = this;
        let imgWidth;
        let imgHeight;
        let imgPosX;
        let imgPosY;
        if (_this.direction === 0) {
          imgWidth = img.width * scoreImgHeightOnScreen / img.height;
          scoreImgWidthOnScreen = imgWidth;
          imgHeight = scoreImgHeightOnScreen;
          ls = rs = (stageWidth - this.pagePer * scoreImgWidthOnScreen - (this.pagePer - 1) * cs * stageWidth) / 2 / stageWidth;
          imgPosX = (page - 1) * cs * stageWidth + (page - 1) * scoreImgWidthOnScreen;
          imgPosY = 10;
        } else if (_this.direction === 1) {//垂直模式默认横向只显示1页
          imgWidth = scoreImgWidthOnScreen;
          imgHeight = img.height * scoreImgWidthOnScreen / img.width;
          scoreImgHeightOnScreen = imgHeight;
          imgPosY = (page - 1) * scoreImgHeightOnScreen;
          imgPosX = 0;
        }
        const c = document.createElement('canvas');
        c.width = imgWidth;
        c.height = imgHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        const bitmap1 = new createjs.Bitmap(c);
        bitmap1.x = imgPosX;
        bitmap1.y = imgPosY;
        bitmapArr.push(bitmap1);
        scoreContainer.addChild(bitmap1);
      },
      initScoreCursor() {
        console.log(scoredata);
        for (let x = 0; x < scoredata.noteItemList.length; x++) {
          const item = scoredata.noteItemList[x];
          const obj = {};
          obj.staff = item.staff;
          obj.ms = item.ms;
          obj.page = item.page;
          if (item.box) {
            obj.l = item.box.left;
            obj.r = item.box.right;
            obj.t = item.box.top;
            obj.b = item.box.bottom
          }

          if (noteSeq[item.ms]) {
            noteSeq[item.ms].push(obj)
          } else {
            const arr = [];
            arr.push(obj);
            noteSeq[item.ms] = arr
          }
        }

        for (let x = 0; x < scoredata.measureItemList.length; x++) {
          const item = scoredata.measureItemList[x];
          const obj = {};
          obj.ms = item.ms;
          obj.system = item.system;
          obj.page = item.page;
          if (item.box) {
            obj.l = item.box.left;
            obj.r = item.box.right;
            obj.t = item.box.top;
            obj.b = item.box.bottom
          }

          measureSeq[item.ms] = obj;

        }

        const noteTimeSeq = [];
        const measureTimeSeq = [];

        // 记录时间线：
        for (let x = 0; x < noteSeq.length; x++) {
          if (noteSeq[x]) {
            noteTimeSeq.push(x)
          }
        }
        // 记录时间线：
        for (let x = 0; x < measureSeq.length; x++) {
          if (measureSeq[x]) {
            measureTimeSeq.push(x)
          }
        }
        cursorPlayer = this.createCursorPlayer(noteTimeSeq, measureTimeSeq, cursorContainer);
        this.cursorLoadLock = false;//解锁，可以进行下一次加载
      },
      createCursorPlayer(noteTimeSeq, measureTimeSeq, cursorContainer) {
        //TODO 需要增加小节模式与动态模式
        const _this = this;
        const cursorPlayer = {};
        let type = 0;//0,音符，1，小节，2，动态光标
        let timeout;
        let isCursorPlay = false;
        let blueTick = 0, redTick = 0, measureTick = 0, currentMs = -1, nextMs = 0,
          startTime = 0, noteTimeIndex = 0, measureTimeIndex;

        cursorPlayer.setType = function (t) {
          type = t;
          cursorPlayer.gotoMs(currentMs);
        };

        cursorPlayer.startPlay = function (ms) {
          console.log('--------------startPlay---------------');
          ms = parseInt(ms);
          if (ms < 0) {
            ms = 0
          }
          isCursorPlay = true;
          caclOffsetAndStartPlay(ms)
        };
        cursorPlayer.stopPlay = function () {
          if (timeout) {
            clearTimeout(timeout)
          }
          isCursorPlay = false
        };

        function getNextCursorPosition(ms, type) {
          let timeIndex = 0;
          if (type === 0) {
            for (let x = 0; x < noteTimeSeq.length; x++) { // 遍历数组找出距离当前时间点或之后一个光标，并记录
              if (noteTimeSeq[x] >= ms) {
                timeIndex = x;
                break;
              }
            }
          } else if (type === 1) {
            for (let x = 0; x < measureTimeSeq.length; x++) { // 遍历数组找出距离当前时间点或之前一个光标，并记录
              if (measureTimeSeq[x] >= ms) {
                if (measureTimeSeq[x] !== ms) {
                  timeIndex = x - 1;
                } else {
                  timeIndex = x;
                }
                break;
              }
            }
          }

          return timeIndex;
        }

        cursorPlayer.gotoMs = function (ms) {
          if (type === 0) {
            noteTimeIndex = getNextCursorPosition(ms, 0);
            currentMs = noteTimeSeq[noteTimeIndex];
            let tempArr = noteSeq[currentMs];
            blueTick = -1;
            redTick = -1;
            for (let x = 0; x < tempArr.length; x++) {
              let obj = tempArr[x];
              console.log(obj);
              if (obj.staff === 1) {
                blueTick = currentMs;
              } else if (obj.staff === 2) {
                redTick = currentMs;
              }
            }
          } else if (type === 1) {
            measureTimeIndex = getNextCursorPosition(ms, 1);
            noteTimeIndex = getNextCursorPosition(ms, 0);
            currentMs = measureTimeSeq[measureTimeIndex];
          }
          console.log("currentMs-->" + currentMs);
          console.log("measureTimeIndex-->" + measureTimeIndex);
          cursorPlayer.drawNoteItem(currentMs);
        };

        function caclOffsetAndStartPlay(ms) {
          isCursorPlay = false;
          // 转到进度，并更新光标位置

          if (type === 0) {
            noteTimeIndex = getNextCursorPosition(ms, 0);
            currentMs = noteTimeSeq[noteTimeIndex];
          } else if (type === 1) {
            measureTimeIndex = getNextCursorPosition(ms, 1);
            currentMs = measureTimeSeq[measureTimeIndex];
          }
          let offTime = ms - currentMs;
          isCursorPlay = true;
          startLoop(offTime, ms);
        }

        /**
         * 光标走谱的时间计算递归循环
         * @param x
         */
        function loop(x) {
          timeout = setTimeout(function () {
            if (isCursorPlay) {
              currentMs = noteTimeSeq[noteTimeIndex];
              if (noteSeq[currentMs]) {
                cursorPlayer.drawNoteItem(currentMs)
              }
              nextMs = 0;
              if (noteTimeSeq.length > noteTimeIndex + 1) {
                nextMs = noteTimeSeq[noteTimeIndex + 1]
              }
              noteTimeIndex++;
              const offset = new Date().getTime() - startTime;
              loop(nextMs - offset)
            }
          }, x)
        }

        /**
         * 开始光标走谱，通过isPlay判定是否走谱
         */
        function startLoop(delay, offMs) {
          startTime = new Date().getTime() - offMs;
          loop(delay)
        }

        cursorPlayer.showAllCursor = function () {
          const scale = scoredata.pageWidth / scoreImgWidthOnScreen;
          for (let i = 0; i < noteTimeSeq.length; i++) {
            let ms = noteTimeSeq[i];
            let objArr = noteSeq[ms];
            for (let j = 0; j < objArr.length; j++) {
              let obj = objArr[j];
              if (scoreContainer.getChildAt(obj.page - 1)) {
                const p = scoreContainer.getChildAt(obj.page - 1);
                const shape = _this.createRoundRect('#0072E3', 0.5, p.x + obj.l / scale, p.y + obj.t / scale, (obj.r - obj.l) / scale, (obj.b - obj.t) / scale, 0);
                cursorContainer.addChild(shape);
              }
            }
          }
        };


        /**
         * 绘制光标
         * @param ms
         */
        cursorPlayer.drawNoteItem = function (ms) {
          if (noteSeq[ms] && type === 0) {
            cursorContainer.removeAllChildren();
            const tempArr = noteSeq[ms];
            for (let x = 0; x < tempArr.length; x++) {
              const obj = tempArr[x];
              if (obj.staff === 1) {
                blueTick = ms
              } else if (obj.staff === 2) {
                redTick = ms
              }
            }

            if (noteSeq[blueTick]) { // 画蓝线框
              const tempArr = noteSeq[blueTick];
              for (let x = 0; x < tempArr.length; x++) {
                const obj = tempArr[x];
                const scale = scoredata.pageWidth / scoreImgWidthOnScreen;

                if (obj.staff === 1) {
                  if (!cursorContainer.getChildByName('blueTick' + blueTick)) {
                    if (scoreContainer.getChildAt(obj.page - 1)) {
                      const p = scoreContainer.getChildAt(obj.page - 1);
                      //+音符宽度的五分之一
                      let offWidth = (obj.r - obj.l) / scale / 4;
                      const shape = _this.createRoundRect('#0072E3', 0.5, p.x + obj.l / scale - offWidth, p.y + obj.t / scale - offWidth, (obj.r - obj.l) / scale + offWidth, (obj.b - obj.t) / scale + offWidth, offWidth / 2);
                      shape.name = 'blueTick' + blueTick;
                      cursorContainer.addChild(shape);
                      if (_this.direction === 0) {
                        if (currentPage !== obj.page) {
                          _this.gotoPage(obj.page)
                        }
                      } else if (_this.direction === 1) {
                        //判断光标是否在显示高度的多少范围之内，不在则下一屏
                        let top = -scoreContainer.y;
                        let bottom = -scoreContainer.y + stageHeight;
                        let objY = p.y + obj.t / scale;
                        top = top + stageHeight * (1 - 0.7) / 2;
                        bottom = bottom - stageHeight * (1 - 0.7) / 2;
                        if (objY < top || objY > bottom) {
                          _this.gotoYPointScreen(objY - stageHeight * (1 - 0.6) / 2);
                        }
                      }
                    }
                  }
                }
              }
            }
            if (noteSeq[redTick]) { // 画红线框
              const tempArr = noteSeq[redTick];
              for (let x = 0; x < tempArr.length; x++) {
                const scale = scoredata.pageWidth / scoreImgWidthOnScreen;
                const obj = tempArr[x];
                if (obj.staff === 2) {
                  if (!cursorContainer.getChildByName('redTick' + redTick)) {
                    if (scoreContainer.getChildAt(obj.page - 1)) {
                      const p = scoreContainer.getChildAt(obj.page - 1);
                      let offWidth = (obj.r - obj.l) / scale / 4;
                      const shape = _this.createRoundRect('#FF5151', 0.5, p.x + obj.l / scale - offWidth, p.y + obj.t / scale - offWidth, (obj.r - obj.l) / scale + offWidth, (obj.b - obj.t) / scale + offWidth, offWidth / 2);
                      //const shape = _this.createRect('#FF5151', 0.5, p.x + obj.l / scale, p.y + obj.t / scale, (obj.r - obj.l) / scale, (obj.b - obj.t) / scale)
                      shape.name = 'redTick' + redTick;
                      cursorContainer.addChild(shape)
                      if (_this.direction === 0) {
                        if (currentPage !== obj.page) {
                          _this.gotoPage(obj.page)
                        }
                      } else if (_this.direction === 1) {
                        //判断光标是否在显示高度的多少范围之内，不在则下一屏
                        let top = -scoreContainer.y;
                        let bottom = -scoreContainer.y + stageHeight;
                        let objY = p.y + obj.t / scale;
                        top = top + stageHeight * (1 - 0.7) / 2;
                        bottom = bottom - stageHeight * (1 - 0.7) / 2;
                        if (objY < top || objY > bottom) {
                          _this.gotoYPointScreen(objY - stageHeight / 2);
                        }
                      }
                    }
                  }
                }
              }
            }
          } else if (measureSeq[ms] && type === 1) {//小节模式
            let obj = measureSeq[ms];
            console.log("小节模式")
            measureTick = ms;
            const scale = scoredata.pageWidth / scoreImgWidthOnScreen;
            if (!cursorContainer.getChildByName('measure' + measureTick)) {
              cursorContainer.removeAllChildren();
              console.log(obj);
              console.log(obj.page);
              if (scoreContainer.getChildAt(obj.page - 1)) {//获取乐谱图片是否存在
                const p = scoreContainer.getChildAt(obj.page - 1);
                const shape = _this.createRect('#00ffa7', 0.3, p.x + obj.l / scale, p.y + obj.t / scale, (obj.r - obj.l) / scale, (obj.b - obj.t) / scale);
                shape.name = 'measure' + measureTick;
                cursorContainer.addChild(shape);
                if (_this.direction === 0) {
                  if (currentPage !== obj.page) {
                    _this.gotoPage(obj.page)
                  }
                } else if (_this.direction === 1) {
                  //判断光标是否在显示高度的多少范围之内，不在则下一屏
                  let top = -scoreContainer.y;
                  let bottom = -scoreContainer.y + stageHeight;
                  let objY = p.y + obj.t / scale;
                  top = top + stageHeight * (1 - 0.7) / 2;
                  bottom = bottom - stageHeight * (1 - 0.7) / 2;
                  if (objY < top || objY > bottom) {
                    _this.gotoYPointScreen(objY - stageHeight / 2);
                  }
                }
              }
            }
          }
        };
        //cursorPlayer.drawNoteItem(0);
        return cursorPlayer
      },
      gotoYPointScreen(pointY) {
        if (!isChangePage) {
          isChangePage = true;
          createjs.Tween.get(scoreContainer).to({y: -pointY}, 500).call(function () {
            isChangePage = false;
          });
        }
      },
      createLoading(x, y) {
        const obj = {};
        obj.loadingConteiner = new createjs.Container();
        /*obj.loadImgSheet = new createjs.SpriteSheet({
          images: [this.assets.loadImgPath],
          frames: [
            [0, 0, 128, 128, 0]
          ],
          animations: {
            idle: 0
          }
        });
        obj.loadImgSprite = new createjs.Sprite(obj.loadImgSheet);
        obj.loadImgSprite.regX = 64;
        obj.loadImgSprite.regY = 64;
        obj.loadImgSprite.x = 64;
        obj.loadImgSprite.y = 64;
        createjs.Tween.get(obj.loadImgSprite, {loop: true}).to({rotation: 360}, 2000);*/
        obj.text = new createjs.Text('加载乐谱：0%', '30px Arial', '#ffffff');
        obj.text.x = 64;
        obj.text.y = 64;
        obj.text.textAlign = 'center';
        obj.text.textBaseline = 'middle';
        obj.text.maxWidth = 128;
        //obj.loadingConteiner.addChild(obj.loadImgSprite);
        obj.loadingConteiner.addChild(obj.text);
        obj.loadingConteiner.addChild(this.createRect('#ff0000', 0.01, 0, 0, 128, 128))

        obj.loadingConteiner.visible = false;
        obj.show = function () {
          obj.loadingConteiner.visible = true
        };
        obj.hide = function () {
          obj.loadingConteiner.visible = false
        };
        obj.update = function (value) {
          obj.text.text = value + '%';
          obj.text.x = 64;
          obj.text.y = 64;
        };
        obj.loadingConteiner.x = x;
        obj.loadingConteiner.y = y;
        return obj
      },
      addBarrangeMsg(msg) {
        if (barrange) {
          barrange.addMsg(msg, '#ff0000')
        }
      },
      createBarrange() {
        const obj = {};
        const queen = [];
        const rowSpaceBoolean = [true, true, true, true, true, true, true, true, true, true, true]
        obj.container = new createjs.Container();
        obj.addMsg = function (msg, color) {
          if (!msg) {
            return
          }
          queen.push(msg);
          for (let x = 0; x < rowSpaceBoolean.length; x++) {
            const b = rowSpaceBoolean[x];
            if (b) {
              addMsgToLine(color, msg, x);
              break
            }
          }
        };
        const top = 50;
        const lineSpace = 50;
        const msgMaxWidth = 200;

        function addMsgToLine(color, msg, line) {
          const text = this.createText(color, 40, msg, stageWidth, top + line * lineSpace);
          obj.container.addChild(text);
          rowSpaceBoolean[line] = false;
          createjs.Tween.get(text).to({x: -msgMaxWidth}, 8000).call(function () {
            rowSpaceBoolean[line] = true;
            obj.container.removeChild(text);
            console.log('obj.container-->' + obj.container.numChildren)
          })
        }

        return obj
      },
      createText(color, size, text, x, y) {
        const t = new createjs.Text(text, size + 'px Arial', color);
        // let t = new Text("Hello World", "20px Arial", "#ff7700");
        t.x = x;
        t.y = y;
        t.textBaseline = 'alphabetic';
        return t
      },
      createCircle(strokeClolor, fillColor, x, y, radius) {
        const g = new createjs.Graphics()
        g.setStrokeStyle(1)
        if (strokeClolor) {
          g.beginStroke(strokeClolor)
        }
        g.beginFill(fillColor)
        g.drawCircle(x, y, radius)
        return new createjs.Shape(g)
      },
      createButtonSprite(idleImgPath, overImgPath, pressImgPath, imgWidth, imgHeight) {
        const data = {
          images: [idleImgPath, overImgPath, pressImgPath],
          frames: [
            [0, 0, imgWidth, imgHeight, 0],
            [0, 0, imgWidth, imgHeight, 1],
            [0, 0, imgWidth, imgHeight, 2]
          ],
          animations: {
            idle: 0,
            over: 1,
            press: 2
          }
        };
        const sheet = new createjs.SpriteSheet(data);
        const sprite = new createjs.Sprite(sheet);
        var helper = new createjs.ButtonHelper(sprite, 'idle', 'over', 'press');
        return sprite
      },
      createRect(fillColor, alpha, x, y, w, h) {
        const rect = new createjs.Shape();
        rect.graphics.beginFill(fillColor).drawRect(x, y, w, h);
        rect.alpha = alpha;
        return rect
      },
      createRoundRect(fillColor, alpha, x, y, w, h, r) {
        const rect = new createjs.Shape();
        rect.graphics.beginFill(fillColor).drawRoundRect(x, y, w, h, r);
        rect.alpha = alpha;
        return rect
      },
      formatTime(_seconds) {
        if (_seconds < 0) {
          _seconds = 0
        }
        _seconds = parseInt(_seconds);
        let result = '';
        const seconds = parseInt(_seconds % 60);
        const mins = parseInt(_seconds % 3600 / 60);
        const hours = parseInt(_seconds / 3600);

        if (hours) {
          result = this.PadZero(hours) + ':' + this.PadZero(mins) + ':' + this.PadZero(seconds)
        } else {
          result = this.PadZero(mins) + ':' + this.PadZero(seconds)
        }
        return result
      },
      checkFull() {
        return document.fullscreenElement ||
          document.msFullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement || false
      },
      PadZero(str) {
        return new RegExp(/^\d$/g).test(str) ? '0' + str : str
      },
      requestFullScreen(ele) {
        const fullScreenEnabled = document.fullScreenEnabled || document.webkitFullScreenEnabled || document.mozFullScreenEnabled || document.msFullScreenEnabled
        const isFullScreen = document.fullScreenElement || document.webkitFullScreenElement || document.mozFullScreenElement || document.msFullScreenElement
        if (fullScreenEnabled === undefined || fullScreenEnabled) {
          if (isFullScreen === undefined) {
            if (ele.requestFullScreen) {
              ele.requestFullScreen()
            } else if (ele.webkitRequestFullScreen) {
              ele.webkitRequestFullScreen()
            } else if (ele.mozRequestFullScreen) {
              ele.mozRequestFullScreen()
            } else if (ele.msRequestFullscreen) {
              ele.msRequestFullscreen()
            } else {
              console.log('不存在进入全屏的方法！ => undefined')
            }
          } else if (isFullScreen === null) {
            if (ele.requestFullScreen) {
              ele.requestFullScreen()
            } else if (ele.webkitRequestFullScreen) {
              ele.webkitRequestFullScreen()
            } else if (ele.mozRequestFullScreen) {
              ele.mozRequestFullScreen()
            } else if (ele.msRequestFullscreen) {
              ele.msRequestFullscreen()
            } else {
              console.log('不存在进入全屏的方法！ => null')
            }
          } else {
            console.log('元素已经是全屏状态了！')
            return true
          }
        } else {
          console.log('不支持全屏模式！')
        }
      },
      exitFullscreen() {
        const fullScreenEnabled = document.fullScreenEnabled || document.webkitFullScreenEnabled || document.mozFullScreenEnabled || document.msFullScreenEnabled
        const isFullScreen = document.fullScreenElement || document.webkitFullScreenElement || document.mozFullScreenElement || document.msFullScreenElement
        if (fullScreenEnabled === undefined || fullScreenEnabled) {
          if (isFullScreen === undefined) {
            if (document.exitFullScreen) {
              document.exitFullScreen()
            } else if (document.webkitExitFullScreen) {
              document.webkitExitFullScreen()
            } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen()
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen()
            } else if (document.msCancelFullscreen) {
              document.msCancelFullscreen()
            } else {
              console.log('不存在退出全屏的方法！ => undefined')
            }
          } else if (isFullScreen !== null) {
            if (document.exitFullScreen) {
              document.exitFullScreen()
            } else if (document.webkitExitFullScreen) {
              document.webkitExitFullScreen()
            } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen()
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen()
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen()
            } else if (document.msCancelFullscreen) {
              document.msCancelFullscreen()
            } else {
              console.log('不存在退出全屏的方法！ => null')
            }
          } else {
            console.log('元素已经是非全屏状态了！')
            return true
          }
        } else {
          console.log('不支持全屏模式！')
        }
      },
      // get~ 销毁组件
      destroyElement() {
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      updateLoadingProgress(val) {
        this.progressWidth = this.loadingConWidth*val;
      }
    },
    deactivated() {
      console.log("生命周期-->deactivated");
      this.destroyElement();
    },
    beforeDestroy() {
      console.log("生命周期-->beforeDestroy");
      this.stopPlay();
      createjs.Sound.removeAllSounds();
      stage = null;
      uiContainer = null;
      scoreContainer = null;
      scoreScreenContainer = null;
      playContainer = null;
      cursorContainer = null;
      cursorPlayer = null;
      isChangePage = false;
      isAudioLoadComplete = false;
      /* 实例变量*/
      canvas = null;
      stage = null;
      soundInstance = null;
      loadObj = null;
      images = {};
      //createjs.Sound.removeAllSounds();
      createjs.Ticker.removeEventListener("tick", this.onFrame);
    }
  }
</script>

<style scoped>

  canvas {
    background-color: #6f7180;
  }

  #score-player {
    position: relative;
    /*overflow: hidden;*/
    margin: auto
  }

  .loading {
    position: absolute;
  }

  .progress-con {
    width: 100%;
    height: 20%;
    border: 1px white solid;
    border-radius: 40px;
    overflow: auto;
  }

  .progress {
    width: 20px;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    background-clip: content-box;
  }
  .hor-mask{
    position: absolute;
    top: 0;
    left: 0;
  }
  .ver-mask{
    position: absolute;
    top: 0;
    left: 0;
  }

  .left-mask{
    background-color: black;
    opacity: 0;
    position: absolute;
  }
  .left-mask:hover{
    opacity: 0.2;
  }
  .right-mask{
    background-color: black;
    opacity: 0;
    position: absolute;
  }
  .right-mask:hover{
    opacity: 0.2;
  }
  .top-mask{
    background-color: black;
    opacity: 0;
    position: absolute;
  }
  .top-mask:hover{
    opacity: 0.2;
  }
  .bottom-mask{
    background-color: black;
    opacity: 0;
    position: absolute;
  }
  .bottom-mask:hover{
    opacity: 0.2;
  }
  .icon{
    width: 20%;
    height: 100%;
    background-size: 20% 20%;
  }

</style>
