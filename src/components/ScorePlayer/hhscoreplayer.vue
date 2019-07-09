<template>
  <div ref="container" id="score-player">
    <canvas id="canvas" ref="canvas" :width="playerWidth" :height="playerHeight"
            style="background-color: #6f7180;display: block"></canvas>
    <!--<canvas id="canvas" ref="canvas" width="800" height="340" style="display: block"/>-->
    <div style="position: absolute;bottom: 0">
      <HHScoreController
        :current-progress="currentProgress"
        :max-progress="maxProgress"
        :controller-width="playerWidth"
        :time-text-value="timeText"
        :play-state-value="isPlay"
        :controller-height="controllerHeight"
        :hide-state="hideState"
        :full-state-value="fullState"
        :direction-state-value="direction"
        @onProgressChanged="onControllerProgressChanged"
        @onPlayStateChanged="onControllerPlayStateChanged"
        @onStop="onControllerStop"
        @onFullStateChanged="onControllerFullStateChanged"
        @onDirectionStateChanged="onControllerDirectionStateChanged"
        @onPagePerStateChanged="onControllerPagePerStateChanged"
        @onCursorStateChanged="onControllerCursorStateChanged"
        @onMuted="onControllerMuted"
      ></HHScoreController>
    </div>
    <!--<div class="loading">
      <span class="loading-text">www.yunpuku.com ©copyright 云谱库</span>
    </div>-->

  </div>
</template>

<script>

  import 'yuki-createjs'
  import leftImgImport from '@/assets/img/left.png'
  import leftPressImgImport from '@/assets/img/left_p.png'
  import rightImgImport from '@/assets/img/right.png'
  import rightPressImgImport from '@/assets/img/right_p.png'
  import loadImgImport from '@/assets/img/load.png'
  import HHScoreController from "../../components/ScorePlayer/controller";
  import $ from 'jquery'
  /* 配置常量*/
  const controllerHeight = 10;
  let ls = 0.1;
  let rs = 0.1;
  const cs = 0.02;
  const bgColor = '#333333';
  /* 配置变量*/
  let isChangePage = false;
  let isChangeController = false;
  let isControllerShow = true;
  let isAudioLoadComplete = false;
  /* 实例变量*/
  let canvas;
  let stage;
  let soundInstance;
  let loadObj;
  let images = {};
  const bitmapArr = [];
  const noteSeq = [];
  let scoredata;
  let scoreCallback;
  let barrange;
  let uiContainer;
  let scoreContainer;
  let scoreScreenContainer;
  let playContainer;
  let cursorContainer;
  let cursorPlayer;
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
      imgPathArr: Array,
      audioPath: String,
      cursorPath: String,
      playerWidth: Number,
      playerHeight: Number,
      pagePerScreen: Number,
      directionState: Number,
    },
    data() {
      return {
        direction: 0,
        pagePer: 2,
        currentProgress: 0,
        maxProgress: 100,
        controllerHeight: 80,
        hideState: false,
        timeText: '00:00 / 00:00',
        fullState: false,
        isLoadComplete: false,
        isPlay: false,
        isCursor: true,
        showCursor: true,
        volume: 100,
        assets: {
          leftImgPath: leftImgImport,
          leftPressImgPath: leftPressImgImport,
          rightImgPath: rightImgImport,
          rightPressImgPath: rightPressImgImport,
          loadImgPath: loadImgImport,
        }
      }
    },
    watch: {
      directionState(val) {
        //监听方向改变
        if (val !== 0 && val !== 1) {
          val = 0;
        }
        this.direction = val;
        this.initUI();
      },
      playerWidth(val) {
        console.log('watch:playerWidth-->' + val);
        this.controller.width = val;
      },
      playerHeight(val) {
        console.log('watch:playerHeight-->' + val);
        this.controller.height = val;
      },
      pagePerScreen(val) {
        console.log('watch:pagePerScreen-->' + val);
        this.pagePer = val;
        if (this.isLoadComplete) {
          this.initUI();
        }
      },
      imgPathArr(val) {
        console.log('watch:imgPathArr-->' + val);
        // TODO 监听图片路径改变
        this.imgPathArr = val;
        this.loadImageResource();
      },
      audioPath(val) {
        console.log('watch:audioPath-->' + val);
        // TODO 监听音频路径改变
        this.audioPath = val;
        this.loadMp3Resource();
      },
      cursorPath(val) {
        console.log('watch:cursorpath-->' + val);
        this.cursorPath = val;
        this.loadCursorResource();
      }
    },
    mounted() {
      const _this = this;
      canvas = this.$refs.canvas;
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
      $(this.$refs.container).mouseenter(function () {
        console.log("hover1");
        _this.hideState = false;
      });
      $(this.$refs.container).mouseleave(function () {
        console.log("hover2");
        _this.hideState = true;
      });

      this.initPlayer(function (event) {
        if (event.type === 'onImgLoadProgress') { // 乐谱图片加载进度
          const progress = event.value * 100;
        } else if (event.type === 'onImgLoadComplete') { // 乐谱图片加载完成

        } else if (event.type === 'onAudioLoadProgress') { // 音频加载进度
          const progress = parseInt(event.value * 100);
          _this.timeText = ('正在加载音频，请稍后，当前进度：' + progress + '%');
        } else if (event.type === 'onAudioLoadComplete') { // 音频加载完成
          soundInstance = event.value;
          _this.timeText = ('00:00 / ' + _this.formatTime(soundInstance.duration / 1000));
        } else if (event.type === 'onInitUiComplete') { // 初始化UI完成

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
        } else if (event.type === 'onEndPlay') { // 音频播放中
          console.log('事件:' + event.type + ',值:' + event.value);
          if (soundInstance) {
            _this.isPlay = false
          }
        } else if (event.type === 'onExitFullScreen') { // 退出全屏
          console.log('事件:' + event.type + ',值:' + event.value);
          _this.controller.width = event.value / 2;
          _this.controller.height = 30;
          this.fullState = false;
          if (soundInstance) {
            _this.timeText = (_this.formatTime(soundInstance.position / 1000) + ' / ' + _this.formatTime(soundInstance.duration / 1000));
          }
        } else if (event.type === 'onOpenFullScreen') { // 打开全屏
          console.log('事件:' + event.type + ',值:' + event.value);
          _this.controller.width = event.value / 2;
          _this.controller.height = 30;
          this.fullState = true;
          if (soundInstance) {
            _this.timeText = (_this.formatTime(soundInstance.position / 1000) + ' / ' + _this.formatTime(soundInstance.duration / 1000));
          }
        }
      })
    },
    methods: {
      onControllerProgressChanged(progress) {
        //progress为百分比
        console.log("onProgressChanged-->" + progress);
        if (soundInstance) {
          soundInstance.position = progress;
          if (this.isPlay) {
            if (cursorPlayer) {
              cursorPlayer.stopPlay();
              cursorPlayer.startPlay(soundInstance.position)
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
          this.openFullScreen(canvas);
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
      },
      onControllerCursorStateChanged(state) {
        console.log("onCursorStateChanged-->" + state);
      },
      onControllerMuted(state) {
        console.log("onMuted-->" + state);
      },
      handleDirectionChange() {
        if (this.direction === 0) {
          this.direction = 1;
          this.initUI();
        } else {
          this.direction = 0;
          this.initUI();
        }
      },
      handlePagePerChange() {
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
      handleCursorChange() {
        if (this.showCursor) {
          this.showCursor = false;
          this.changeCursor(1);
        } else {
          this.showCursor = true;
          this.changeCursor(0);
        }
      },
      handleVolumeChange() {

      },
      initPlayer(callback) {
        let _this = this;
        console.log('initPlayer');
        scoreCallback = callback;
        initStageWidth = canvas.width * 2;
        initStageHeight = canvas.height * 2;
        stageWidth = initStageWidth;
        stageHeight = initStageHeight;
        stage = new createjs.Stage(canvas);
        scoreContainer = new createjs.Container();
        uiContainer = new createjs.Container();
        playContainer = new createjs.Container();
        cursorContainer = new createjs.Container();
        scoreScreenContainer = new createjs.Container();
        scoreScreenContainer.addChild(scoreContainer);
        stage.addChild(scoreScreenContainer);
        stage.addChild(uiContainer);
        loadObj = this.createLoading((stageWidth - 256) / 4, (stageHeight - 256) / 4);
        stage.addChild(loadObj.loadingConteiner);
        loadObj.show();
        createjs.Touch.enable(stage);
        createjs.Ticker.framerate = 60;
        createjs.Ticker.addEventListener('tick', this.onFrame)
        // this.loadImageResource()
        // this.loadMp3Resource()
        // this.loadCursorResource()
      },
      loadImageResource() {
        let _this = this;
        if (!_this.imgPathArr) {
          return;
        }
        _this.isLoadComplete = false;
        pageNum = 0;
        currentPage = 1;
        console.log('loadImageResource');
        const imgArr = this.imgPathArr;
        const loader = new createjs.LoadQueue(false);// 这里一共可以是3个参数 第一个是是否用XHR模式加载 第二个是基础路径  第三个是跨域
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
        console.log(createjs.Sound);
        if (!this.audioPath) {
          return
        }
        console.log('loadMp3Resource');
        const audioPath = this.audioPath;
        if (audioPath) {
          createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
          createjs.Sound.alternateExtensions = ['mp3'];
          createjs.Sound.on('fileload', this.onAudioLoadComplete);
          createjs.Sound.on('progress', this.onAudioLoadProgress);

          createjs.Sound.registerSound(audioPath, 'sound', 3);
        }
      },
      loadCursorResource() {
        if (!this.cursorPath) {
          return;
        }
        console.log('loadCursorResource');
        const _this = this;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.cursorPath, true);
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
        console.log("evt.item-->"+evt.item);
        // 这是单个文件加载完成的事件，把它保存到一个地方之后可以直接拿来创建对象
      },
      onImgLoadProgress(event) {
        scoreCallback({type: 'onImgLoadProgress', value: event.progress});
        if (loadObj) {
          if (parseInt(event.progress * 100) === 100) {
            loadObj.hide();
          } else {
            loadObj.update("加载乐谱："+parseInt(event.progress * 100));
          }
        }
      },
      onAudioLoadProgress(event) {
        scoreCallback({type: 'onAudioLoadProgress', value: event.progress});
        const pro = parseInt(event.progress * 100);
        this.timeText = 'load audio:' + pro + '%';
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
        // event.currentTarget.removeEventListener("complete", onAudioLoadComplete);
        isAudioLoadComplete = true;
        if (soundInstance == null) {
          soundInstance = createjs.Sound.createInstance('sound');
          //soundInstance = createjs.Sound.play('sound', { interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1 })
          //soundInstance.paused = true
        }
        this.timeText = '00:00 / ' + this.formatTime(soundInstance.duration / 1000);

        soundInstance.on('complete', function (event) {
          console.log('complete-->' + event);
          console.log('soundInstance.paused-->' + soundInstance.paused);
          soundInstance.paused = true;
          console.log('soundInstance.paused-->' + soundInstance.paused);
          soundInstance.position = 0;
          scoreCallback({type: 'onEndPlay', value: soundInstance});

          // playContainer.getChildAt(0).visible = true;
          // playContainer.getChildAt(1).visible = false;
          _this.isPlay = false
        });
        soundInstance.on('loop', function (event) {
          console.log('loop-->' + event);
          _this.pauseAudio();
        });
        soundInstance.on('failed', function (event) {
          console.log('failed-->' + event)
        });
        scoreCallback({type: 'onAudioLoadComplete', value: soundInstance})
      },
      resetUI() {
        ls = rs = 0.1;
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
        console.log('initUI');
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
        console.log(images);
        console.log(pageNum);
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

        uiContainer.addChild(leftBtn);
        uiContainer.addChild(rightBtn);
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
        if (state === 0) { // 正常显示光标
          cursorContainer.visible = true;
        } else if (state === 1) { // 禁用光标
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
              scoreCallback({type: 'onChangePage', value: currentPage})
              uiContainer.getChildByName('pageText').text = currentPage + '/' + pageNum
            });
          } else if (this.direction === 1) {
            createjs.Tween.get(scoreContainer).to({y: -(page - 1) * scoreImgHeightOnScreen}, 500).call(function () {
              isChangePage = false
              currentPage = page
              scoreCallback({type: 'onChangePage', value: currentPage})
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
        for (let x = 0; x < scoredata.noteItemList.length; x++) {
          const item = scoredata.noteItemList[x]
          const obj = {}
          obj.staff = item.staff
          obj.ms = item.ms
          obj.page = item.page
          if (item.box) {
            obj.l = item.box.left
            obj.r = item.box.right
            obj.t = item.box.top
            obj.b = item.box.bottom
          }

          if (noteSeq[item.ms]) {
            noteSeq[item.ms].push(obj)
          } else {
            const arr = []
            arr.push(obj)
            noteSeq[item.ms] = arr
          }
        }

        const timeSeq = []

        // 记录时间线：
        for (let x = 0; x < noteSeq.length; x++) {
          if (noteSeq[x]) {
            timeSeq.push(x)
          }
        }
        cursorPlayer = this.createCursorPlayer(timeSeq, cursorContainer)
      },
      createCursorPlayer(timeSeq, cursorContainer) {
        const _this = this;
        const cursorPlayer = {};
        let timeout;
        let isCursorPlay = false;
        let blueTick = 0, redTick = 0, currentMs = -1, nextMs = 0,
          startTime = 0, timeIndex = 0;

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

        function caclOffsetAndStartPlay(ms) {
          _this.isCursor = false
          // 转到进度，并更新光标位置
          const currentTime = ms;// 拖拽之后的当前时间点（音频文件播放的当前毫秒值）
          let offTime = 0;
          for (let x = 0; x < timeSeq.length; x++) { // 遍历数组找出距离当前时间点或之后一个光标，并记录
            const ms = timeSeq[x];
            if (ms >= currentTime) {
              timeIndex = x;
              offTime = ms - currentTime;
              currentMs = timeSeq[x - 1];
              break
            }
          }
          _this.isCursor = true;
          startLoop(offTime, ms)
        }

        /**
         * 光标走谱的时间计算递归循环
         * @param x
         */
        function loop(x) {
          timeout = setTimeout(function () {
            if (isCursorPlay && _this.isCursor) {
              currentMs = timeSeq[timeIndex];
              if (noteSeq[currentMs]) {
                cursorPlayer.drawNoteItem(currentMs)
              }
              nextMs = 0;
              if (timeSeq.length > timeIndex + 1) {
                nextMs = timeSeq[timeIndex + 1]
              } else {
                // isPlay = false;
              }
              timeIndex++;
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

        /**
         * 绘制光标
         * @param ms
         */
        cursorPlayer.drawNoteItem = function (ms) {
          if (noteSeq[ms]) {
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
                      const shape = _this.createRect('#0072E3', 0.5, p.x + obj.l / scale, p.y + obj.t / scale, (obj.r - obj.l) / scale, (obj.b - obj.t) / scale);
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
                      const shape = _this.createRect('#FF5151', 0.5, p.x + obj.l / scale, p.y + obj.t / scale, (obj.r - obj.l) / scale, (obj.b - obj.t) / scale)
                      shape.name = 'redTick' + redTick;
                      cursorContainer.addChild(shape)
                    }
                  }
                }
              }
            }
          }
        };
        cursorPlayer.drawNoteItem(0);

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
          console.log('text-->' + obj.text.textAlign)
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
        }
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
      formatTime(_seconds) {
        if (_seconds < 0) {
          _seconds = 0
        }
        _seconds = parseInt(_seconds)
        let result = ''
        const seconds = parseInt(_seconds % 60)
        const mins = parseInt(_seconds % 3600 / 60)
        const hours = parseInt(_seconds / 3600)

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
      initVolumeController(callback) {
        const obj = {}
        obj.value = 0
        let tag = false, dy = 0, bottom = 0, bgbottom = 0
        $('.vo-progress_btn').mousedown(function (e) {
          dy = -e.pageY - bottom
          tag = true
        })
        $(document).mouseup(function (e) {
          console.log('mouseup')
          tag = false
        })
        $(document).mousemove(function (e) { // 鼠标移动
          if (tag) {
            bottom = -e.pageY - dy
            console.log('bottom-->' + bottom)
            console.log('dy-->' + dy)
            console.log('e.pageY-->' + e.pageY)
            if (bottom <= 0) {
              bottom = 0
            } else if (bottom > 70) {
              bottom = 70
            }
            $('.vo-progress_btn').css('bottom', bottom)
            $('.vo-progress_bar').height(bottom)
            obj.value = bottom / 70
            callback({value: bottom / 70})
          }
        })
        $('.volume-controller').click(function (e) { // 鼠标点击
          console.log('click')
          if (!tag) {
            bgbottom = $('.vo-progress_bg').offset().top
            console.log('bgbottom-->' + bgbottom)
            console.log('e.pageY-->' + e.pageY)
            bottom = 74 - (e.pageY - bgbottom)
            if (bottom <= 0) {
              bottom = 0
            } else if (bottom > 70) {
              bottom = 70
            }
            console.log('click-->' + bottom)
            $('.vo-progress_btn').css('bottom', bottom)
            $('.vo-progress_bar').height(bottom)
            obj.value = bottom / 70
            callback({value: bottom / 70})
          }
        })
        obj.setValue = function (value) {
          bottom = 70 * value
          obj.value = value
          $('.vo-progress_btn').css('bottom', 70 * value);
          $('.vo-progress_bar').height(70 * value)
        };

        return obj
      },
    },
    beforeDestroy() {
      this.stopPlay();
      //createjs.Sound.removeAllSounds();
      createjs.Ticker.removeEventListener("click");
    }
  }
</script>

<style scoped>

  #score-player{
    position: relative;
    overflow: hidden;
  }

  .loading{
    position: absolute;
    top: 0;
  }
  .loading-text{
    font-size: 20px;
    color: black;
    font-weight: bolder;
    font-family: "Alibaba Sans",serif;
  }
</style>
