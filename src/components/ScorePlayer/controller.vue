<template>
<div ref="container">
  <div
    class="score-controller"
    :style="{ width: controllerWidth+'px', height: controllerHeight+'px' }">
    <div class="slider" ref="slider">
      <div class="process" :style="{width:seekWidth}"></div>
      <div class="thunk" ref="trunk" :style="{left}">
        <div class="block"></div>
      </div>
    </div>
    <i
      :class="{ 'play-btn': true, 'play-active': playState===1 }"
      title="播放/暂停"
      style="float: left;margin-left: 20px"
      @click="handlePlay"></i>
    <i class="stop-btn" title="停止" style="float: left;margin-left: 20px" @click="handleStop"></i>
    <div class="time" style="float: left;margin-left: 20px">
      <span>{{ timeText }}</span>
    </div>
    <i :class="{ 'full-btn': true, 'full-active': fullState===1 }" title="全屏" style="float: right;margin-right: 20px" @click="handleFullScreen"></i>
    <i :class="{'key-btn-v': directionState===0, 'key-btn-h': directionState===1}" title="横竖屏" style="float: right;margin-right: 20px" @click="handleDirectionChange"></i>
    <i :class="{'page-btn-1': pagePerState===1, 'page-btn-2': pagePerState===2,'page-btn-3': pagePerState===3}" title="切换横屏页数" style="float: right;margin-right: 20px" @click="handlePagePerChange"></i>
    <i
      :class="{'cursor-btn': cursorState===0,'cursor-prevent': cursorState===1}"
      title="光标"
      style="float: right;margin-right: 20px"
      @click="handleCursorChange"></i>
    <i class="volume-btn" title="音量" style="float: right;margin-right: 20px" @click="handleVolumeChange">
    </i>
  </div>
</div>
</template>

<script>
  import $ from 'jquery'
  export default {
    name: "HHScoreController",
    props: {
      currentProgress: Number,
      maxProgress: Number,//时间的ms值，自动转换时间并显示
      controllerWidth: Number,//时间的ms值，自动转换时间并显示
      controllerHeight: Number,//时间的ms值，自动转换时间并显示
      timeTextValue: String,//时间的ms值，自动转换时间并显示
      hideState: Boolean,
      playStateValue: Boolean,
      directionStateValue: Number,
      pagePerStateValue: Number,
      cursorStateValue: Number,
    },
    data(){
      return{
        playState: 0,
        fullState: 0,
        timeText: '00:00/00:00',
        directionState: 0,
        pagePerState: 1,
        cursorState: 0,
        mute: 0,
        slider:null,        //滚动条DOM元素
        thunk:null,         //拖拽DOM元素
        progress: 0,
        max: 100,
        min: 0,
      }
    },
    watch: {
      currentProgress(val){
        this.progress = val;
      },
      maxProgress(val){
        this.max = val;
      },
      timeTextValue(val){
        this.timeText = val;
      },
      hideState(val){
        console.log("hideState-->"+val);
        let _this = this;
        if (val){//隐藏
          _this.addAnim(this.$refs.container, "slideOutDown",function () {
            _this.$refs.container.style = 'display: none;';
          })
        } else {//显示
          _this.$refs.container.style = '';
          _this.addAnim(this.$refs.container, "slideInUp");
        }
      },
      playStateValue(val){
        if (val){
          this.playState = 0;
        } else {
          this.playState = 1;
        }
      }
    },
    mounted(){
      this.slider = this.$refs.slider;
      this.thunk = this.$refs.trunk;
      let _this = this;
      this.thunk.onmousedown = function (e) {
        let width = parseInt(_this.seekWidth);
        let disX = e.clientX;
        document.onmousemove = function(e){
          // value, left, width
          // 当value变化的时候，会通过计算属性修改left，width

          // 拖拽的时候获取的新width
          let newWidth = e.clientX - disX + width;
          // 拖拽的时候得到新的百分比
          let scale = newWidth / _this.slider.offsetWidth;
          _this.progress = Math.ceil((_this.max - _this.min) * scale + _this.min);
          _this.progress = Math.max(_this.progress,_this.min);
          _this.progress = Math.min(_this.progress,_this.max);
        };
        document.onmouseup = function(){
          _this.$emit("onProgressChanged",_this.progress);
          document.onmousemove = document.onmouseup = null;
        };
        return false;
      }

    },
    methods:{
      handlePlay() {
        this.$emit("onPlayStateChanged",this.playState);
      },
      handleStop() {
        this.$emit("onStop");
      },
      handleFullScreen() {
        if (this.fullState === 0) {
          this.fullState = 1;
        }else {
          this.fullState = 0;
        }
        this.$emit("onFullStateChanged",this.fullState);
      },
      handleDirectionChange() {
        if (this.directionState === 0) {
          this.directionState = 1;
        }else {
          this.directionState = 0;
        }
        this.$emit("onDirectionStateChanged",this.directionState);
      },
      handlePagePerChange(){
        if (this.pagePerState === 1) {
          this.pagePerState = 2;
        }else if (this.pagePerState === 2) {
          this.pagePerState = 3;
        }else {
          this.pagePerState = 1;
        }
        this.$emit("onPagePerStateChanged",this.pagePerState);
      },
      handleCursorChange() {
        if (this.cursorState === 0) {
          this.cursorState = 1;
        } else {
          this.cursorState = 0;
        }
        this.$emit("onCursorStateChanged",this.cursorState);
      },
      handleVolumeChange() {
        if (this.mute === 0){
          this.mute = 1;
        } else {
          this.mute = 0;
        }
        this.$emit("onMuted",this.mute);
      },
      addAnim(element, animate, callback){
        element.classList.add('animated', animate)
        function handleAnimationEnd() {
          element.classList.remove('animated', animate)
          element.removeEventListener('animationend', handleAnimationEnd)
          if (typeof callback === 'function') callback()
        }
        element.addEventListener('animationend', handleAnimationEnd)
      }
    },
    computed: {
      scale(){
        return (this.progress - this.min) / (this.max - this.min);
      },
      seekWidth(){
        if(this.slider){
          return this.slider.offsetWidth * this.scale + 'px';
        }else{
          return 0 + 'px'
        }
      },
      left(){
        if(this.slider){
          return this.slider.offsetWidth * this.scale -  this.thunk.offsetWidth/2  + 'px';
        }else{
          return 0 + 'px'
        }
      }
    }
  }
</script>

<style scoped>
  /*进度条组件*/
  .box{margin:100px auto 0;width:80%}
  .clear:after{content:'';display:block;clear:both}
  .slider{position:relative;margin:20px 20px;width:auto;height:5px;padding-right:10px;background:#e4e7ed;border-radius:5px;cursor:pointer}
  .slider .process{position:absolute;left:0;top:0;width:112px;height:5px;border-radius:5px;background:#409eff}
  .slider .thunk{position:absolute;left:100px;top:-4px;width:10px;height:10px}
  .slider .block{width:10px;height:10px;border-radius:50%;border:2px solid #409eff;background:rgba(255,255,255,1);transition:.2s all}
  .slider .block:hover{transform:scale(1.1);opacity:.6}

  .play-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/play.png");
    background-size: cover;
  }

  .play-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/play_p.png")
  }

  .play-active {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/pause.png")
  }

  .play-active:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/pause_p.png")
  }

  .page-btn-1{
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/page.png");
    background-size: cover;
  }
  .page-btn-2{
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/page.png");
    background-size: cover;
  }
  .page-btn-3{
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/page.png");
    background-size: cover;
  }
  .score-controller{
    background-color:rgba(0,0,0,0.8);
    position: relative;
    padding-top: 3px;
    z-index: 20;
  }
  .stop-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/stop.png");
    background-size: cover;
  }

  .stop-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/stop_p.png")
  }

  .time {
    font-size: 15px;
    color: #EEEEEE;
  }

  .volume-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/volume.png");
    background-size: cover;
  }

  .volume-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/volume_p.png")
  }

  .cursor-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/cursor.png");
    background-size: cover;
  }

  .cursor-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/cursor_p.png");
    background-size: cover;
  }

  .cursor-prevent {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/cursor_prevent.png");
    background-size: cover;
  }

  .cursor-prevent:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/cursor_prevent_p.png");
    background-size: cover;
  }

  .speed-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/speed.png");
    background-size: cover;
  }

  .speed-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/speed_p.png")
  }

  .key-btn-v {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/vertical.png");
    background-size: cover;
  }
  .key-btn-h {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/horizontal.png");
    background-size: cover;
  }

  .key-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/key_p.png")
  }

  .eq-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/eq.png");
    background-size: cover;
  }

  .eq-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/eq_p.png")
  }

  .loop-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/loop_one.png");
    background-size: cover;
  }

  .loop-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/loop_one_p.png")
  }

  .list-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/list.png");
    background-size: cover;
  }

  .list-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/list_p.png")
  }
  .full-btn {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/full.png");
    background-size: cover;
  }

  .full-btn:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/full_p.png")
  }

  .full-active {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/exit_full.png")
  }

  .full-active:hover {
    width: 20px;
    height: 20px;
    background-image: url("../../assets/img/exit_full_p.png")
  }

  .progress {
    position: absolute;
    width: 300px;
  }

  .progress_bg {
    height: 10px;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 5px;
    overflow: hidden;
    position: absolute;
    background-color: #f2f2f2;
  }

  .progress_bar {
    width: 0;
    height: 10px;
    border-radius: 5px;
    background: #5FB878;
    position: absolute;
  }

  .progress_btn {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    position: absolute;
    background: #fff;
    margin-left: -10px;
    top: -5px;
    cursor: pointer;
    border: 1px #ddd solid;
    box-sizing: border-box;
  }

  .progress_btn:hover {
    border-color: #F7B824;
  }

  .progress_con {
    position: relative;
  }

  .volume-controller {
    position: absolute;
    display: inline-block;
    height: 100px;
    width: 25px;
    background-color: #000;
    opacity: 0.8;
    top: -100px;
    padding-top: 10px;
    padding-bottom: 10px;
    visibility: hidden;
  }

  .vo-progress_bg {
    height: 80px;
    width: 5px;
    left: 10px;
    border: 1px solid #fff;
    opacity: 0.5;
    border-radius: 5px;
    position: absolute;
  }

  .vo-progress_bar {
    width: 5px;
    height: 0;
    left: 10px;
    border-radius: 5px;
    background: #1296DB;
    position: absolute;
    bottom: 0;
    margin-bottom: 10px;
  }

  .vo-progress_btn {
    width: 10px;
    height: 10px;
    left: 8px;
    border-radius: 10px;
    position: absolute;
    background: #fff;
    bottom: 0;
    cursor: pointer;
    border: 1px #ddd solid;
    box-sizing: border-box;
    margin-bottom: 10px;
  }

  .vo-progress_btn:hover {
    border-color: #F7B824;
  }

  .barrange_btn {
    width: 40px;
    height: 40px;
    background-image: url("../../assets/img/barrage_on.png");
    margin-top: 5px;
    background-size: cover;
  }

  .setting_btn {
    width: 30px;
    height: 30px;
    background-image: url("../../assets/img/setting.png");
    margin-top: 10px;
    background-size: cover;
  }

  .setting_btn:hover {
    width: 30px;
    height: 30px;
    background-image: url("../../assets/img/setting_p.png");
    margin-top: 10px;
    background-size: cover;
  }

  .barrange_send_input {
    float: left;
    margin-left: 20px;
    width: 300px;
    margin-top: 8px;

  }

  .like_img {
    width: 20px;
    height: 20px;
    margin-top: 15px;
    float: left;
    margin-right: 5px;
    background-image: url("../../assets/img/like.png");
    background-size: cover;
  }

  .share_img {
    width: 20px;
    height: 20px;
    margin-top: 15px;
    float: left;
    margin-right: 5px;
    background-image: url("../../assets/img/share.png");
    background-size: cover;
  }

  .down_img {
    width: 20px;
    height: 20px;
    margin-top: 15px;
    float: left;
    margin-right: 5px;
    background-image: url("../../assets/img/down.png");
    background-size: cover;
  }

  .print_img {
    width: 20px;
    height: 20px;
    margin-top: 15px;
    float: left;
    margin-right: 5px;
    background-image: url("../../assets/img/print.png");
    background-size: cover;
  }

  @-webkit-keyframes slideInUp {
    from {
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
      visibility: visible;
    }

    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes slideInUp {
    from {
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
      visibility: visible;
    }

    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
  }

  .slideInUp {
    -webkit-animation-name: slideInUp;
    animation-name: slideInUp;
  }

  @-webkit-keyframes slideOutDown {
    from {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
  }

  @keyframes slideOutDown {
    from {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }

    to {
      visibility: hidden;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
  }

  .slideOutDown {
    -webkit-animation-name: slideOutDown;
    animation-name: slideOutDown;
  }

  .animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }
</style>
