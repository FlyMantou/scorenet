<template>
  <div>
    <HHScoreController
      :current-progress="currentProgress"
      :max-progress="maxProgress"
      :controller-width="width"
      :controller-height="height"
      :hide-state="hide"
      @onProgressChanged="onControllerProgressChanged"
      @onPlayStateChanged="onControllerPlayStateChanged"
      @onStop="onControllerStop"
      @onFullStateChanged="onControllerFullStateChanged"
      @onDirectionStateChanged="onControllerDirectionStateChanged"
      @onPagePerStateChanged="onControllerPagePerStateChanged"
      @onCursorStateChanged="onControllerCursorStateChanged"
      @onMuted="onControllerMuted"
    />

    <div @click="handleClick">点击</div>
  </div>
</template>

<script>
  import HHScoreController from "../../components/ScorePlayer/controller";

  export default {
    name: "test",
    components: {HHScoreController},
    data() {
      return {
        currentProgress: 50,
        maxProgress: 100,
        width: 500,
        height: 80,
        hide: false,
      }
    },
    methods:{
      onControllerProgressChanged(progress){
        console.log("onProgressChanged-->"+progress);
      },
      onControllerPlayStateChanged(state){
        console.log("onPlayStateChanged-->"+state);
      },
      onControllerStop(){
        console.log("onStop-->");
      },
      onControllerFullStateChanged(state){
        console.log("onFullStateChanged-->"+state);
      },
      onControllerDirectionStateChanged(state){
        console.log("onDirectionStateChanged-->"+state);
      },
      onControllerPagePerStateChanged(state){
        console.log("onPagePerStateChanged-->"+state);
      },
      onControllerCursorStateChanged(state){
        console.log("onCursorStateChanged-->"+state);
      },
      onControllerMuted(state){
        console.log("onMuted-->"+state);
      },
      handleClick(){
        this.hide = !this.hide;
      }
    }
  }
</script>

<style scoped>

</style>
