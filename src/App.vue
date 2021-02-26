<template>
  <div id="app">
    <router-view />
  </div>
</template>


<script>
export default {};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body {
  width: 100%;
  height: 100%;
}
#app {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(182, 182, 182, 0.5);
}
</style>