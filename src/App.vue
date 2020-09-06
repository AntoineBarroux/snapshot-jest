<template>
  <div id="app">
    <ExampleListComponent />
  </div>
</template>

<script>
import ExampleListComponent from "./components/ExampleListComponent";

export default {
  name: 'App',
  components: {
    ExampleListComponent
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
