<template>
  <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-6 p-1">
    <img src="../assets/Layout.png" alt="Layout" class="absolute top-1 left-1 w-4 h-4">
    <div class="flex">
      <div class="flex flex-col space-y-2 pl-4 relative">
        <!-- 根据推荐顺序排序图片 -->
        <div
          v-for="(img, index) in sortedImages"
          :key="img.name"
          :class="{'order-first': index === 0}"
        >
          <img
            :src="img.src"
            alt=""
            class="w-10.5 h-13 cursor-pointer"
            @click="handleImageClick(img)"
          >
        </div>
        <img
          v-if="sortedImages.length > 0"
          src="../assets/Yellowstar.png"
          alt=""
          class="absolute -top-2 left-11.5 w-5 h-5"
        >
      </div>
      <!-- 右侧框：添加canvas容器，设定唯一id -->
      <div class="ml-6 w-64 h-88 border-dotted border-2 rounded-sm border-gray-400 relative">
        <canvas id="layout-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRankStore } from '../stores/rankStore';
import * as fabric from 'fabric';

// 假数据（后端可能传入的数据，VG 和 KG 数量不固定）
const heightwidth = [1200, 628]; // [高度, 宽度]

const layoutData = {
  Type:"PortraitGrid",
  Title: [
    [0.0, 0.0],
    [628.0, 0.0],
    [0.0, 59.416850511879446],
    [628.0, 59.416850511879446]
  ],
  VG1: {
    Subtitle: [
      [0.0, 59.416850511879446],
      [628.0, 59.416850511879446],
      [0.0, 89.12527576781918],
      [628.0, 89.12527576781918]
    ],
    KG1: {
      coords: [
        [0.0, 89.12527576781918],
        [628.0, 89.12527576781918],
        [0.0, 129.8367471929072],
        [628.0, 129.8367471929072]
      ],
      Highlight: [
        [0.0, 89.12527576781918],
        [138.63931786105204, 89.12527576781918],
        [0.0, 128.73650944240546],
        [138.63931786105204, 128.73650944240546]
      ],
      Icon: [
        [486.3132693627384, 89.12527576781918],
        [567.7362122129146, 89.12527576781918],
        [486.3132693627384, 129.8367471929072],
        [567.7362122129146, 129.8367471929072]
      ],
      Vis: null
    },
    KG2: {
      coords: [
        [0.0, 129.8367471929072],
        [628.0, 129.8367471929072],
        [0.0, 153.19760060155699],
        [628.0, 153.19760060155699]
      ],
      Highlight: [
        [0.0, 129.8367471929072],
        [83.18359071663122, 129.8367471929072],
        [0.0, 169.4479808674935],
        [83.18359071663122, 169.4479808674935]
      ],
      Icon: [
        [521.3434892242184, 129.8367471929072],
        [568.0651960415179, 129.8367471929072],
        [521.3434892242184, 153.19760060155699],
        [568.0651960415179, 153.19760060155699]
      ],
      Vis: null
    },
    KG3: {
      coords: [
        [0.0, 153.19760060155699],
        [628.0, 153.19760060155699],
        [0.0, 175.80890791153348],
        [628.0, 175.80890791153348]
      ],
      Highlight: [
        [0.0, 153.19760060155699],
        [55.45572714442081, 153.19760060155699],
        [0.0, 192.80883427614327],
        [55.45572714442081, 192.80883427614327]
      ],
      Icon: [
        [518.4407410386804, 153.19760060155699],
        [563.6633556586333, 153.19760060155699],
        [518.4407410386804, 175.80890791153348],
        [563.6633556586333, 175.80890791153348]
      ],
      Vis: null
    },
    KG4: {
      coords: [
        [0.0, 175.80890791153348],
        [628.0, 175.80890791153348],
        [0.0, 221.28137123104426],
        [628.0, 221.28137123104426]
      ],
      Highlight: [
        [0.0, 175.80890791153348],
        [138.63931786105204, 175.80890791153348],
        [0.0, 215.42014158611977],
        [138.63931786105204, 215.42014158611977]
      ],
      Icon: [
        [476.1282365007458, 175.80890791153348],
        [567.0731631397674, 175.80890791153348],
        [476.1282365007458, 221.28137123104426],
        [567.0731631397674, 221.28137123104426]
      ],
      Vis: null
    },
    coords: [
      [0.0, 59.416850511879446],
      [628.0, 59.416850511879446],
      [0.0, 221.28137123104426],
      [628.0, 221.28137123104426]
    ]
  },
  VG2: {
    Subtitle: [
      [0.0, 221.28137123104426],
      [376.9819137000913, 221.28137123104426],
      [0.0, 250.98979648698398],
      [376.9819137000913, 250.98979648698398]
    ],
    KG1: {
      coords: [
        [0.0, 250.98979648698398],
        [376.9819137000913, 250.98979648698398],
        [0.0, 358.58100103764525],
        [376.9819137000913, 358.58100103764525]
      ],
      Highlight: [
        [0.0, 250.98979648698398],
        [138.63931786105204, 250.98979648698398],
        [0.0, 290.6010301615703],
        [138.63931786105204, 290.6010301615703]
      ],
      Icon: [
        [268.864286749122, 250.98979648698398],
        [376.4554912997833, 250.98979648698398],
        [268.864286749122, 358.58100103764525],
        [376.4554912997833, 358.58100103764525]
      ],
      Vis: [
        [144.03641111126842, 250.98979648698398],
        [268.864286749122, 250.98979648698398],
        [144.03641111126842, 344.63411429482613],
        [268.864286749122, 344.63411429482613]
      ]
    },
    KG2: {
      coords: [
        [0.0, 358.58100103764525],
        [376.9819137000913, 358.58100103764525],
        [0.0, 460.0330556187814],
        [376.9819137000913, 460.0330556187814]
      ],
      Highlight: [
        [0.0, 358.58100103764525],
        [83.18359071663122, 358.58100103764525],
        [0.0, 398.19223471223154],
        [83.18359071663122, 398.19223471223154]
      ],
      Icon: [
        [252.36365680902696, 358.58100103764525],
        [376.9819137000913, 358.58100103764525],
        [252.36365680902696, 452.0680654720521],
        [376.9819137000913, 452.0680654720521]
      ],
      Vis: [
        [127.74539991796264, 358.58100103764525],
        [252.36365680902696, 358.58100103764525],
        [127.74539991796264, 452.0680654720521],
        [252.36365680902696, 452.0680654720521]
      ]
    },
    KG3: {
      coords: [
        [0.0, 460.0330556187814],
        [376.9819137000913, 460.0330556187814],
        [0.0, 567.2774502228592],
        [376.9819137000913, 567.2774502228592]
      ],
      Highlight: [
        [0.0, 460.0330556187814],
        [138.63931786105204, 460.0330556187814],
        [0.0, 499.6442892933677],
        [138.63931786105204, 499.6442892933677]
      ],
      Icon: [
        [269.0660163615101, 460.0330556187814],
        [376.31041096558783, 460.0330556187814],
        [269.0660163615101, 567.2774502228592],
        [376.31041096558783, 567.2774502228592]
      ],
      Vis: [
        [144.47104889670646, 460.0330556187814],
        [269.0660163615101, 460.0330556187814],
        [144.47104889670646, 553.5026486156333],
        [269.0660163615101, 553.5026486156333]
      ]
    },
    coords: [
      [0.0, 221.28137123104426],
      [376.9819137000913, 221.28137123104426],
      [0.0, 567.2774502228593],
      [376.9819137000913, 567.2774502228593]
    ]
  },
  VG3: {
    Subtitle: [
      [376.9819137000913, 221.28137123104426],
      [628.0, 221.28137123104426],
      [376.9819137000913, 250.98979648698398],
      [628.0, 250.98979648698398]
    ],
    KG1: {
      coords: [
        [376.9819137000913, 250.98979648698398],
        [628.0, 250.98979648698398],
        [376.9819137000913, 386.9434816402505],
        [628.0, 386.9434816402505]
      ],
      Highlight: [
        [376.9819137000913, 250.98979648698398],
        [460.1655044167225, 250.98979648698398],
        [376.9819137000913, 290.6010301615703],
        [460.1655044167225, 290.6010301615703]
      ],
      Icon: [
        [540.2050268767829, 250.98979648698398],
        [628.0, 250.98979648698398],
        [540.2050268767829, 368.04976065127346],
        [628.0, 368.04976065127346]
      ],
      Vis: [
        [464.2061496411552, 250.98979648698398],
        [540.2050268767829, 250.98979648698398],
        [464.2061496411552, 386.21911541158835],
        [540.2050268767829, 386.21911541158835]
      ]
    },
    KG2: {
      coords: [
        [376.9819137000913, 386.9434816402505],
        [628.0, 386.9434816402505],
        [376.9819137000913, 567.2774502228593],
        [628.0, 567.2774502228593]
      ],
      Highlight: [
        [376.9819137000913, 386.9434816402505],
        [586.9214521753986, 386.9434816402505],
        [376.9819137000913, 426.5547153148368],
        [586.9214521753986, 426.5547153148368]
      ],
      Icon: [
        [376.9819137000913, 426.5547153148368],
        [487.96407979355894, 426.5547153148368],
        [376.9819137000913, 537.5368814083045],
        [487.96407979355894, 537.5368814083045]
      ],
      Vis: [
        [517.0178339065324, 456.2952841293917],
        [628.0, 456.2952841293917],
        [517.0178339065324, 567.2774502228593],
        [628.0, 567.2774502228593]
      ]
    },
    coords: [
      [376.9819137000913, 221.28137123104426],
      [628.0, 221.28137123104426],
      [376.9819137000913, 567.2774502228593],
      [628.0, 567.2774502228593]
    ]
  },
  VG4: {
    Subtitle: [
      [0.0, 567.2774502228593],
      [279.8415766852103, 567.2774502228593],
      [0.0, 596.985875478799],
      [279.8415766852103, 596.985875478799]
    ],
    KG1: {
      coords: [
        [0.0, 596.985875478799],
        [279.8415766852103, 596.985875478799],
        [0.0, 702.0845405689934],
        [279.8415766852103, 702.0845405689934]
      ],
      Highlight: [
        [0.0, 596.985875478799],
        [55.45572714442081, 596.985875478799],
        [0.0, 636.5971091533853],
        [55.45572714442081, 636.5971091533853]
      ],
      Icon: [
        [145.16293991544356, 596.985875478799],
        [279.8415766852103, 596.985875478799],
        [145.16293991544356, 698.0201116151582],
        [279.8415766852103, 698.0201116151582]
      ],
      Vis: null
    },
    KG2: {
      coords: [
        [0.0, 702.0845405689934],
        [279.8415766852103, 702.0845405689934],
        [0.0, 865.7444199173432],
        [279.8415766852103, 865.7444199173432]
      ],
      Highlight: [
        [0.0, 702.0845405689934],
        [279.8415766852103, 702.0845405689934],
        [0.0, 741.6957742435796],
        [279.8415766852103, 741.6957742435796]
      ],
      Icon: [
        [0.0, 741.6957742435796],
        [148.50648166346778, 741.6957742435796],
        [0.0, 853.1034874194745],
        [148.50648166346778, 853.1034874194745]
      ],
      Vis: null
    },
    KG3: {
      coords: [
        [0.0, 865.7444199173432],
        [279.8415766852103, 865.7444199173432],
        [0.0, 954.0223196465595],
        [279.8415766852103, 954.0223196465595]
      ],
      Highlight: [
        [0.0, 865.7444199173432],
        [110.91145428884163, 865.7444199173432],
        [0.0, 905.3556535919295],
        [110.91145428884163, 905.3556535919295]
      ],
      Icon: [
        [163.49322189987643, 865.7444199173432],
        [279.8415766852103, 865.7444199173432],
        [163.49322189987643, 953.0275067780588],
        [279.8415766852103, 953.0275067780588]
      ],
      Vis: null
    },
    KG4: {
      coords: [
        [0.0, 954.0223196465595],
        [279.8415766852103, 954.0223196465595],
        [0.0, 1046.5054107160204],
        [279.8415766852103, 1046.5054107160204]
      ],
      Highlight: [
        [0.0, 954.0223196465595],
        [110.91145428884163, 954.0223196465595],
        [0.0, 993.6335533211458],
        [110.91145428884163, 993.6335533211458]
      ],
      Icon: [
        [160.17007445248947, 954.0223196465595],
        [279.8415766852103, 954.0223196465595],
        [160.17007445248947, 1043.7983903387733],
        [279.8415766852103, 1043.7983903387733]
      ],
      Vis: null
    },
    coords: [
      [0.0, 567.2774502228593],
      [279.8415766852103, 567.2774502228593],
      [0.0, 1046.5054107160204],
      [279.8415766852103, 1046.5054107160204]
    ]
  },
  VG5: {
    Subtitle: [
      [279.8415766852103, 567.2774502228593],
      [628.0, 567.2774502228593],
      [279.8415766852103, 596.985875478799],
      [628.0, 596.985875478799]
    ],
    KG1: {
      coords: [
        [279.8415766852103, 596.985875478799],
        [628.0, 596.985875478799],
        [279.8415766852103, 781.3104067304361],
        [628.0, 781.3104067304361]
      ],
      Highlight: [
        [279.8415766852103, 596.985875478799],
        [628.0, 596.985875478799],
        [279.8415766852103, 636.5971091533853],
        [628.0, 636.5971091533853]
      ],
      Icon: [
        [279.8415766852103, 636.5971091533853],
        [415.33284226607856, 636.5971091533853],
        [279.8415766852103, 772.0883747342535],
        [415.33284226607856, 772.0883747342535]
      ],
      Vis: null
    },
    KG2: {
      coords: [
        [279.8415766852103, 781.3104067304361],
        [628.0, 781.3104067304361],
        [279.8415766852103, 1046.5054107160204],
        [628.0, 1046.5054107160204]
      ],
      Highlight: [
        [279.8415766852103, 781.3104067304361],
        [628.0, 781.3104067304361],
        [279.8415766852103, 820.9216404050223],
        [628.0, 820.9216404050223]
      ],
      Icon: [
        [279.8415766852103, 820.9216404050223],
        [467.4091335726728, 820.9216404050223],
        [279.8415766852103, 1008.4891972924847],
        [467.4091335726728, 1008.4891972924847]
      ],
      Vis: null
    },
    coords: [
      [279.8415766852103, 567.2774502228593],
      [628.0, 567.2774502228593],
      [279.8415766852103, 1046.5054107160204],
      [628.0, 1046.5054107160204]
    ]
  },
  VG6: {
    Subtitle: [
      [0.0, 1046.5054107160204],
      [628.0, 1046.5054107160204],
      [0.0, 1076.2138359719602],
      [628.0, 1076.2138359719602]
    ],
    KG1: {
      coords: [
        [0.0, 1076.2138359719602],
        [628.0, 1076.2138359719602],
        [0.0, 1133.5402459176387],
        [628.0, 1133.5402459176387]
      ],
      Highlight: [
        [0.0, 1076.2138359719602],
        [55.45572714442081, 1076.2138359719602],
        [0.0, 1115.8250696465466],
        [55.45572714442081, 1115.8250696465466]
      ],
      Icon: [
        [444.14050016554927, 1076.2138359719602],
        [558.7933200569064, 1076.2138359719602],
        [444.14050016554927, 1133.5402459176387],
        [558.7933200569064, 1133.5402459176387]
      ],
      Vis: null
    },
    KG2: {
      coords: [
        [0.0, 1133.5402459176387],
        [628.0, 1133.5402459176387],
        [0.0, 1168.1442908063873],
        [628.0, 1168.1442908063873]
      ],
      Highlight: [
        [0.0, 1133.5402459176387],
        [110.91145428884163, 1133.5402459176387],
        [0.0, 1173.151479592225],
        [110.91145428884163, 1173.151479592225]
      ],
      Icon: [
        [496.3261580377082, 1133.5402459176387],
        [565.5342478152054, 1133.5402459176387],
        [496.3261580377082, 1168.1442908063873],
        [565.5342478152054, 1168.1442908063873]
      ],
      Vis: null
    },
    KG3: {
      coords: [
        [0.0, 1168.1442908063873],
        [628.0, 1168.1442908063873],
        [0.0, 1200.0000000000007],
        [628.0, 1200.0000000000007]
      ],
      Highlight: [
        [0.0, 1168.1442908063873],
        [27.727863572210406, 1168.1442908063873],
        [0.0, 1207.7555244809737],
        [27.727863572210406, 1207.7555244809737]
      ],
      Icon: [
        [490.49708915687177, 1168.1442908063873],
        [554.2085075440983, 1168.1442908063873],
        [490.49708915687177, 1200.0000000000007],
        [554.2085075440983, 1200.0000000000007]
      ],
      Vis: null
    },
    coords: [
      [0.0, 1046.5054107160204],
      [628.0, 1046.5054107160204],
      [0.0, 1200.0000000000007],
      [628.0, 1200.0000000000007]
    ]
  }
};


// 使用 rankStore
const rankStore = useRankStore();

// 图片数组
const images = ref([
  { name: 'Star', src: new URL('../assets/Star.png', import.meta.url).href },
  { name: 'Grid', src: new URL('../assets/Grid.png', import.meta.url).href },
  { name: 'PortraitGrid', src: new URL('../assets/PortraitGrid.png', import.meta.url).href },
  { name: 'Portrait', src: new URL('../assets/Portrait.png', import.meta.url).href },
  { name: 'Landscape', src: new URL('../assets/Landscape.png', import.meta.url).href },
  { name: 'Spiral', src: new URL('../assets/Spiral.png', import.meta.url).href }
]);

const sortedImages = computed(() => {
  if (rankStore.rankedElements.length > 0) {
    return images.value.sort((a, b) => {
      return rankStore.rankedElements.indexOf(a.name) - rankStore.rankedElements.indexOf(b.name);
    });
  } else {
    const defaultOrder = ['PortraitGrid', 'Star', 'Spiral', 'Grid', 'Portrait', 'Landscape'];
    return images.value.sort((a, b) => {
      return defaultOrder.indexOf(a.name) - defaultOrder.indexOf(b.name);
    });
  }
});

watch(() => rankStore.rankedElements, (newRankedElements) => {
  console.log('排名已更新:', newRankedElements);
}, { deep: true });

// 存储 fabric canvas 实例
let canvasInstance: fabric.Canvas | null = null;
// 全局记录大长方形A对象，用于边界判断
let outerRect: fabric.Rect;

// 工具函数：根据给定坐标数据计算 left、top、width、height
function calcRectParams(coords: number[][], scale: number) {
  const left = coords[0][0] * scale;
  const top = coords[0][1] * scale;
  const width = (coords[1][0] - coords[0][0]) * scale;
  const height = (coords[2][1] - coords[0][1]) * scale;
  return { left, top, width, height };
}

// 辅助函数，创建矩形对象
function createRect(
  coords: number[][],
  scale: number,
  offsetX: number,
  offsetY: number,
  options: fabric.IRectOptions = {}
) {
  const params = calcRectParams(coords, scale);
  return new fabric.Rect({
    left: offsetX + params.left,
    top: offsetY + params.top,
    width: params.width,
    height: params.height,
    ...options
  });
}

// 边界约束：拖拽时确保对象不超出 outerRect
function constrainToBounds(obj: fabric.Object) {
  if (!outerRect) return;
  obj.setCoords();
  const objBounds = obj.getBoundingRect();
  const outerBounds = outerRect.getBoundingRect();
  let dx = 0, dy = 0;
  if (objBounds.left < outerBounds.left) {
    dx = outerBounds.left - objBounds.left;
  }
  if (objBounds.top < outerBounds.top) {
    dy = outerBounds.top - objBounds.top;
  }
  if (objBounds.left + objBounds.width > outerBounds.left + outerBounds.width) {
    dx = (outerBounds.left + outerBounds.width) - (objBounds.left + objBounds.width);
  }
  if (objBounds.top + objBounds.height > outerBounds.top + outerBounds.height) {
    dy = (outerBounds.top + outerBounds.height) - (objBounds.top + objBounds.height);
  }
  if (dx !== 0 || dy !== 0) {
    obj.left += dx;
    obj.top += dy;
    obj.setCoords();
  }
}

// 缩放约束：确保对象不超出 outerRect，且对于 Icon 与 Visualization 强制等比缩放
function scalingConstraint(e: fabric.TEvent<any>) {
  const obj = e.target;
  if (!obj || !outerRect) return;
  obj.setCoords();
  const objBounds = obj.getBoundingRect();
  const outerBounds = outerRect.getBoundingRect();

  // 强制等比缩放：如果对象的 tooltipType 为 'icon' 或 'visualization'
  if ((obj as any).tooltipType === 'icon' || (obj as any).tooltipType === 'visualization') {
    obj.scaleY = obj.scaleX;
    obj.setCoords();
  }
  
  if (
    objBounds.left < outerBounds.left ||
    objBounds.top < outerBounds.top ||
    (objBounds.left + objBounds.width) > (outerBounds.left + outerBounds.width) ||
    (objBounds.top + objBounds.height) > (outerBounds.top + outerBounds.height)
  ) {
    if (obj.lastValidState) {
      obj.set({
        scaleX: obj.lastValidState.scaleX,
        scaleY: obj.lastValidState.scaleY,
        left: obj.lastValidState.left,
        top: obj.lastValidState.top
      });
      obj.setCoords();
    }
  } else {
    obj.lastValidState = {
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      left: obj.left,
      top: obj.top
    };
  }
}

// 主点击处理函数
function handleImageClick(image: { name: string, src: string }) {
  console.log('点击了图片:', image.name);
  if (image.name.toLowerCase() !== layoutData.Type.toLowerCase()) {
    console.log('无对应布局数据');
    return;
  }
  
  const canvasEl = document.querySelector('#layout-canvas') as HTMLCanvasElement;
  if (!canvasEl) return;
  const parentEl = canvasEl.parentElement;
  if (!parentEl) return;
  const containerWidth = parentEl.clientWidth;
  const containerHeight = parentEl.clientHeight;
  canvasEl.width = containerWidth;
  canvasEl.height = containerHeight;
  
  if (canvasInstance) {
    canvasInstance.dispose();
    canvasInstance = null;
  }
  
  canvasInstance = new fabric.Canvas('layout-canvas', {
    selection: false,
  });
  
  const originalWidth = heightwidth[1];
  const originalHeight = heightwidth[0];
  const scaleFactor = Math.min(containerWidth / originalWidth, containerHeight / originalHeight);
  const offsetX = (containerWidth - originalWidth * scaleFactor) / 2;
  const offsetY = (containerHeight - originalHeight * scaleFactor) / 2;
  
  // 绘制大长方形A（背景矩形），不可选中
  outerRect = new fabric.Rect({
    left: offsetX,
    top: offsetY,
    width: originalWidth * scaleFactor,
    height: originalHeight * scaleFactor,
    fill: '#fff',
    selectable: false
  });
  canvasInstance.add(outerRect);
  
  // 收集各类对象（数组顺序将决定图层顺序）
  const arrVGBg: fabric.Object[] = [];
  const arrKGBg: fabric.Object[] = [];
  const arrTitle: fabric.Object[] = [];
  const arrVGSubtitle: fabric.Object[] = [];
  const arrKGVis: fabric.Object[] = [];
  const arrKGIcon: fabric.Object[] = [];
  const arrKGHighlight: fabric.Object[] = [];
  
  // Title（单个对象）
  if (layoutData.Title) {
    const titleRect = createRect(
      layoutData.Title,
      scaleFactor,
      offsetX,
      offsetY,
      {
        fill: '#D0D0D0',
        selectable: true,
        hasControls: true,
        tooltipText: 'title'
      }
    );
    arrTitle.push(titleRect);
  }
  
  // 遍历所有 VG（属性名以 "VG" 开头）
  Object.keys(layoutData).forEach(vgKey => {
    if (vgKey.startsWith('VG')) {
      const vgData = layoutData[vgKey];
      const vgIndex = vgKey.replace('VG', '');
      // VG 背景（coords 必须存在）
      if (vgData.coords) {
        const vgRect = createRect(
          vgData.coords,
          scaleFactor,
          offsetX,
          offsetY,
          {
            fill: '#E4E4E4',
            selectable: false
          }
        );
        arrVGBg.push(vgRect);
      }
      // VG Subtitle
      if (vgData.Subtitle) {
        const subRect = createRect(
          vgData.Subtitle,
          scaleFactor,
          offsetX,
          offsetY,
          {
            fill: '#D0D0D0',
            selectable: true,
            hasControls: true,
            tooltipText: `VG${vgIndex}, subtitle`
          }
        );
        arrVGSubtitle.push(subRect);
      }
      
      // 遍历 VG 内的 KG（属性名以 "KG" 开头）
      Object.keys(vgData).forEach(kgKey => {
        if (kgKey.startsWith('KG')) {
          const kgData = vgData[kgKey];
          // KG 背景
          if (kgData.coords) {
            const kgRect = createRect(
              kgData.coords,
              scaleFactor,
              offsetX,
              offsetY,
              {
                fill: '#F3F3F3',
                selectable: false
              }
            );
            arrKGBg.push(kgRect);
          }
          // KG 内部组件：顺序为 Highlight（最上层）、Icon、Vis
          // 这里先收集 Icon、Vis、Highlight分别放入对应数组
          if (kgData.Vis) {
            const visRect = createRect(
              kgData.Vis,
              scaleFactor,
              offsetX,
              offsetY,
              {
                fill: '#EEECD7',
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, visualization`,
                tooltipType: 'visualization'
              }
            );
            arrKGVis.push(visRect);
          }
          if (kgData.Icon) {
            const iconRect = createRect(
              kgData.Icon,
              scaleFactor,
              offsetX,
              offsetY,
              {
                fill: '#EED7D7',
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, icon`,
                tooltipType: 'icon'
              }
            );
            arrKGIcon.push(iconRect);
          }
          if (kgData.Highlight) {
            const highlightRect = createRect(
              kgData.Highlight,
              scaleFactor,
              offsetX,
              offsetY,
              {
                fill: '#D7E3EE',
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, highlight`
              }
            );
            arrKGHighlight.push(highlightRect);
          }
        }
      });
    }
  });
  
  // 添加到 canvas 的顺序（底层在前，上层在后）
  // 顺序：Title + VG 背景  ->  KG 背景  ->  VG Subtitle  ->  KG Visualization  ->  KG Icon  ->  KG Highlight
  arrVGBg.forEach(obj => canvasInstance.add(obj));
  arrKGBg.forEach(obj => canvasInstance.add(obj));
  arrTitle.forEach(obj => canvasInstance.add(obj));
  arrVGSubtitle.forEach(obj => canvasInstance.add(obj));
  arrKGVis.forEach(obj => canvasInstance.add(obj));
  arrKGIcon.forEach(obj => canvasInstance.add(obj));
  arrKGHighlight.forEach(obj => canvasInstance.add(obj));
  
  // 事件：拖拽时限制对象不超出 outerRect
  canvasInstance.on('object:moving', (e) => {
    const obj = e.target;
    constrainToBounds(obj);
  });
  
  // 事件：缩放时限制边界并对 icon 与 visualization 强制等比缩放
  canvasInstance.on('object:scaling', scalingConstraint);
}
</script>

<style scoped>
.order-first {
  order: -1;
  margin-bottom: 0.5rem;
}
</style>
