<template>
  <div class = "h-screen w-screen max-h-screen max-w-screen flex flex-col flex-nowrap">
    <div class ="h-1/16 w-full p-2">
      <Header></Header>  
    </div>
    <div class = "h-15/16 w-full flex flex-row flex-nowrap">
      <div class = "h-full w-1/4 p-2">
        <Alignment></Alignment>
      </div>
      <div class = "h-full w-3/4 flex flex-row flex-nowrap">
        <div class = "h-full w-2/3 flex flex-col flex-nowrap">
          <div class ="h-10/11 w-full p-2">
            <Canva></Canva>
          </div>  
          <div class ="h-1/11 w-full p-2">
            <Modification></Modification>
          </div>  
        </div>
        <div class = "h-full w-1/3 flex flex-col flex-nowrap">
          <div class = "h-1/6 w-full p-2">
            <Color></Color>
          </div>
          <div class = "h-3/6 w-full p-2">
            <Layout></Layout>
          </div>
          <div class = "h-1/24 w-full p-2">
            <Submission></Submission>
          </div>
          <div class = "h-7/24 w-full p-2">
            <Layer></Layer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Header from "./components/Header.vue";
  import Alignment from "./components/Alignment.vue";
  import Layout from "./components/Layout.vue";
  import Layer from "./components/Layer.vue";
  import Modification from "./components/Modification.vue";
  import Canva from "./components/Canva.vue";
  import Color from "./components/Color.vue";
  import Submission from "./components/Submission.vue";

</script>

<style scoped> 
</style>