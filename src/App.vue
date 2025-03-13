<template>


  <div class = "h-screen w-screen max-h-screen max-w-screen flex flex-col flex-nowrap">
    <div class ="h-1/16 w-full p-2">
      <Header @upload-success="handleUploadSuccess"></Header>  
    </div>
    <div class = "h-15/16 w-full flex flex-row flex-nowrap">
      <div class = "h-full w-1/4 p-2"> 
        <Alignment :data="data" :title="title"></Alignment>
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
  import { ref } from 'vue'

 /*
  const title = ref<string>('xxxxx');
  const data = ref<any>([
    {
      "subtask_title": "Pre-War Factors Leading to World War II",
      "subtask_content": "The devastation of the Great War (as World War I was known at the time) had greatly destabilized Europe, and in many respects World War II grew out of issues left unresolved by that earlier conflict. In particular, political and economic instability in Germany, and lingering resentment over the harsh terms imposed by the Versailles Treaty, fueled the rise to power of Adolf Hitler and National Socialist German Workers’ Party, abbreviated as NSDAP in German and the Nazi Party in English.",
      "subtask_relation": "Generalization",
      "related_subtask": {
        "title": null,
        "relation": null
      },
      "knowledges": [
        {
          "knowledge_content": "Political and economic instability in Germany fueled the rise to power of Adolf Hitler.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "Political and economic instability",
          "second_level_highlight": null,
          "icon_keyword": "Germany"
        }
      ]
    },
    {
      "subtask_title": "Hitler's Rise to Power and Initial Aggression",
      "subtask_content": "After becoming Chancellor of Germany in 1933, Hitler swiftly consolidated power, anointing himself Führer (supreme leader) in 1934. Obsessed with the idea of the superiority of the “pure” German race, which he called “Aryan,” Hitler believed that war was the only way to gain the necessary “Lebensraum,” or living space, for the German race to expand. In the mid-1930s, he secretly began the rearmament of Germany, a violation of the Versailles Treaty. After signing alliances with Italy and Japan against the Soviet Union, Hitler sent troops to occupy Austria in 1938 and the following year annexed Czechoslovakia.",
      "subtask_relation": "Elaboration",
      "related_subtask": {
        "title": "Pre-War Factors Leading to World War II",
        "relation": "Similarity"
      },
      "knowledges": [
        {
          "knowledge_content": "Hitler became Chancellor of Germany in 1933.",
          "data_insight": "Value",
          "first_level_highlight": "1933",
          "second_level_highlight": null,
          "icon_keyword": "Chancellor"
        },
        {
          "knowledge_content": "Hitler anointed himself Führer in 1934.",
          "data_insight": "Value",
          "first_level_highlight": "1934",
          "second_level_highlight": null,
          "icon_keyword": "Führer"
        },
        {
          "knowledge_content": "Troops occupied Austria in 1938.",
          "data_insight": "Value",
          "first_level_highlight": "1938",
          "second_level_highlight": null,
          "icon_keyword": "Austria"
        },
        {
          "knowledge_content": "Czechoslovakia was annexed in 1939.",
          "data_insight": "Value",
          "first_level_highlight": "1939",
          "second_level_highlight": null,
          "icon_keyword": "Czechoslovakia"
        }
      ]
    },
    {
      "subtask_title": "The Outbreak of World War II",
      "subtask_content": "In late August 1939, Hitler and Soviet leader Joseph Stalin signed the German-Soviet Nonaggression Pact. Hitler had long planned an invasion of Poland, a nation to which Great Britain and France had guaranteed military support if it were attacked by Germany. The pact with Stalin meant that Hitler would not face a war on two fronts once he invaded Poland. On September 1, 1939, Hitler invaded Poland from the west; two days later, France and Britain declared war on Germany, beginning World War II.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "Pre-War Factors Leading to World War II",
        "relation": "Contrast"
      },
      "knowledges": [
        {
          "knowledge_content": "On September 1, 1939, Hitler invaded Poland.",
          "data_insight": "Value",
          "first_level_highlight": "September 1, 1939",
          "second_level_highlight": "Hitler invaded Poland",
          "icon_keyword": "invasion"
        },
        {
          "knowledge_content": "France and Britain declared war on Germany two days later.",
          "data_insight": "Trend",
          "first_level_highlight": "two days later",
          "second_level_highlight": "France and Britain declared war",
          "icon_keyword": "declaration"
        }
      ]
    },
    {
      "subtask_title": "German-Soviet Invasion of Poland",
      "subtask_content": "On September 17, Soviet troops invaded Poland from the east. Under attack from both sides, Poland fell quickly, and by early 1940 Germany and the Soviet Union had divided control over the nation, according to a secret protocol appended to the Nonaggression Pact.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "Pre-War Factors Leading to World War II",
        "relation": "Similarity"
      },
      "knowledges": [
        {
          "knowledge_content": "On September 17, Soviet troops invaded Poland from the east.",
          "data_insight": "Trend",
          "first_level_highlight": "September 17",
          "second_level_highlight": null,
          "icon_keyword": "invasion"
        },
        {
          "knowledge_content": "By early 1940, Germany and the Soviet Union had divided control over Poland.",
          "data_insight": "Trend",
          "first_level_highlight": "early 1940",
          "second_level_highlight": null,
          "icon_keyword": "control"
        }
      ]
    },
    {
      "subtask_title": "Significant Battles in Europe (1940-41)",
      "subtask_content": "On April 9, 1940, Germany simultaneously invaded Norway and occupied Denmark, and on May 10, German forces swept through Belgium and the Netherlands in what became known as “blitzkrieg.” Three days later, Hitler’s troops crossed the Meuse River and struck French forces at Sedan, leading to the evacuation of the British Expeditionary Force from Dunkirk and eventually the German occupation of France.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "German-Soviet Invasion of Poland",
        "relation": "Contrast"
      },
      "knowledges": [
        {
          "knowledge_content": "Germany simultaneously invaded Norway and occupied Denmark on April 9, 1940.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "April 9, 1940",
          "second_level_highlight": null,
          "icon_keyword": "Germany"
        },
        {
          "knowledge_content": "German forces swept through Belgium and the Netherlands on May 10.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "May 10",
          "second_level_highlight": null,
          "icon_keyword": "German forces"
        },
        {
          "knowledge_content": "Hitler’s troops crossed the Meuse River and struck French forces at Sedan, leading to the evacuation from Dunkirk.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "Sedan",
          "second_level_highlight": null,
          "icon_keyword": "Hitler"
        }
      ]
    },
    {
      "subtask_title": "America's Entry into World War II",
      "subtask_content": "On December 7, 1941, 360 Japanese aircraft attacked the major U.S. naval base at Pearl Harbor in Hawaii, leading to a declaration of war by the United States on Japan on December 8, with Germany and the other Axis Powers declaring war on the United States shortly thereafter.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "Significant Battles in Europe (1940-41)",
        "relation": "Contrast"
      },
      "knowledges": [
        {
          "knowledge_content": "360 Japanese aircraft attacked Pearl Harbor.",
          "data_insight": "Value",
          "first_level_highlight": "360",
          "second_level_highlight": null,
          "icon_keyword": "aircraft"
        }
      ]
    },
    {
      "subtask_title": "Turning Points in the Pacific",
      "subtask_content": "After a long string of Japanese victories, the U.S. Pacific Fleet won the Battle of Midway in June 1942, which proved to be a turning point in the war in the Pacific. Allied forces began aggressive counterattacks against Japan, moving closer to their ultimate goal of invading mainland Japan.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": null,
        "relation": null
      },
      "knowledges": [
        {
          "knowledge_content": "Battle of Midway in June 1942.",
          "data_insight": "Value",
          "first_level_highlight": "June 1942",
          "second_level_highlight": "Battle of Midway",
          "icon_keyword": "victories"
        },
        {
          "knowledge_content": "A turning point in the war in the Pacific.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "turning point",
          "second_level_highlight": null,
          "icon_keyword": "war"
        }
      ]
    },
    {
      "subtask_title": "Significant Battles Leading to Allied Victory",
      "subtask_content": "Operation Torch in November 1942 saw the Allies invade French North Africa. The Battle of Stalingrad from August 1942 to February 1943 became a turning point on the Eastern Front. The D-Day invasion on June 6, 1944, marked the start of the liberation of Western Europe from Nazi control.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "Turning Points in the Pacific",
        "relation": "Contrast"
      },
      "knowledges": [
        {
          "knowledge_content": "The D-Day invasion on June 6, 1944, marked the start of the liberation of Western Europe from Nazi control.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "June 6, 1944",
          "second_level_highlight": "liberation",
          "icon_keyword": "D-Day"
        },
        {
          "knowledge_content": "The Battle of Stalingrad from August 1942 to February 1943 became a turning point on the Eastern Front.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "August 1942 to February 1943",
          "second_level_highlight": "turning point",
          "icon_keyword": "Stalingrad"
        },
        {
          "knowledge_content": "Operation Torch in November 1942 saw the Allies invade French North Africa.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "November 1942",
          "second_level_highlight": "invade",
          "icon_keyword": "Operation Torch"
        }
      ]
    },
    {
      "subtask_title": "End of World War II",
      "subtask_content": "Germany surrendered on May 8, 1945, following the intense battles and the fall of Berlin, and Japan's formal surrender occurred on September 2, 1945, marking the official end of World War II.",
      "subtask_relation": "Temporal",
      "related_subtask": {
        "title": "Turning Points in the Pacific",
        "relation": "Similarity"
      },
      "knowledges": [
        {
          "knowledge_content": "Germany surrendered on May 8, 1945.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "May 8, 1945",
          "second_level_highlight": null,
          "icon_keyword": "surrender"
        },
        {
          "knowledge_content": "Japan's formal surrender occurred on September 2, 1945.",
          "data_insight": "Textual_Statement",
          "first_level_highlight": "September 2, 1945",
          "second_level_highlight": null,
          "icon_keyword": "surrender"
        }
      ]
    }
  ]);
  */


  const title = ref<string>('');
  const data = ref<any>([]);


  

  const handleUploadSuccess = (result: any) => {
    console.log(result);
    title.value =  result.title;
    data.value = result.data;
  }

</script>

<style scoped> 
</style>