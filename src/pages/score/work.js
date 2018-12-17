function exe() {
  var per= performance.now();
  while (true){
    let now = performance.now();
    if (now*1000000-per*1000000>=469900) {
      //console.log("onpause执行")
      per = now;
      postMessage();
    }
  }
}
exe();

