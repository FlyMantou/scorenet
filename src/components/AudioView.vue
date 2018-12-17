<template>
  <div>
    <audio style="width: 100%" :src="audioUrl" v-on:progress="$emit('onprogress')" v-on:ended="$emit('onended')" v-on:play="$emit('onplay')" v-on:pause="$emit('onpause')" controls="controls"></audio>
  </div>
</template>

<script>
    export default {
        name: "AudioView",
      data(){
          return{
            audioUrl:this.audio_url
          }
      },
      props:['audio_url']
    }
</script>


<style scoped>

</style>
