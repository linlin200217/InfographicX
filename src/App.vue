<template>


  <div class = "h-screen w-screen max-h-screen max-w-screen flex flex-col flex-nowrap">
    <div class ="h-1/16 w-full p-2">
      <Header @upload-success="handleUploadSuccess"></Header>  
    </div>
    <div class = "h-15/16 w-full flex flex-row flex-nowrap">
      <div class = "h-full w-1/4 p-2"> 
        <Alignment></Alignment>
      </div>
      <div class = "h-full w-3/4 flex flex-row flex-nowrap">
        <div class = "h-full w-2/3 flex flex-col flex-nowrap">
          <div class ="h-10/11 w-full p-2">
            <!-- <Canva ref="canvaRef"></Canva> -->
            <Canva ref="canvaRef" @objectSelected="handleObjectSelected"></Canva>
          </div>  
          <div class ="h-1/11 w-full p-2">
            <Modification @draw-click="handleDrawClick" @draw-text="handleDrawText" @save-as-image="handleSaveAsImage"></Modification>
          </div>  
        </div>
        <div class = "h-full w-1/3 flex flex-col flex-nowrap">
          <div class = "h-1/6 w-full p-2">
            <Color></Color>
          </div>
          <div class = "h-3/6 w-full py-1 px-2">
            <Layout></Layout>
          </div>
          <div class = "h-1/24 w-full p-2">
            <Submission @submit-success="handleSubmitSuccess"></Submission>
          </div>
          <div class = "h-7/24 w-full p-2">
            <Layer
              :selectedObject="selectedObject"
              @updateOpacity="handleOpacityUpdate"
              @delete="handleDelete"
              @updateFontSize="handleFontSizeUpdate"
              @updateFontFamily="handleFontFamilyUpdate"
              @updateColor="handleColorUpdate"
              @updateText="handleTextUpdate"
            ></Layer>
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
  import { useUploadStore } from './stores/uploadStore'
  import { useLayoutStore } from './stores/layout'
  import { submitLayout } from './api/layout'
  import { ref } from 'vue';
  // 使用 Pinia store
  const uploadStore = useUploadStore()
  const layoutStore = useLayoutStore()

  const canvaRef = ref<InstanceType<typeof Canva> | null>(null);
  const selectedObject = ref(null);

  const handleUploadSuccess = (result: any) => {
    console.log(result);
    // 直接更新 store 中的数据
    uploadStore.uploadResult = result;
  }
  const handleDrawClick = (type: string) => {
    console.log('drawLine');
    canvaRef.value?.drawClick(type);
  }
  const handleDrawText = () => {
    console.log('drawText');
    canvaRef.value?.drawText();
  }
  const handleSaveAsImage = () => {
    console.log('saveAsImage');
    canvaRef.value?.saveAsImage();
  }
  const handleSubmitSuccess = () => {
    selectedObject.value = null;
    console.log('submit success');
    canvaRef.value?.updateCanva();
  }

  const handleObjectSelected = (object) => {
    selectedObject.value = object;
  };

  const handleOpacityUpdate = (opacity) => {
    if (canvaRef.value) {
      canvaRef.value.updateObjectOpacity(opacity);
    }
  };

  const handleDelete = () => {
    if (canvaRef.value) {
      canvaRef.value.deleteSelectedObject();
      selectedObject.value = null;
    }
  };

  const handleFontSizeUpdate = (fontSize) => {
    if (canvaRef.value) {
      canvaRef.value.updateObjectFontSize(fontSize);
    }
  };

  const handleFontFamilyUpdate = (fontFamily) => {
    if (canvaRef.value) {
      canvaRef.value.updateObjectFontFamily(fontFamily);
    }
  };

  const handleColorUpdate = (color) => {
    if (canvaRef.value) {
      canvaRef.value.updateObjectColor(color);
    }
  };

  const handleTextUpdate = (text) => {
    if (canvaRef.value) {
      canvaRef.value.updateObjectText(text);
    }
  };

</script>

<style  lang="css">

</style>