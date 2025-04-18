export interface Visualization {
  is_visualization: boolean; // 是否存在可视化
  type: 'pie_chart' | 'bar_chart' | 'line_chart' | 'timeline' | 'icon_array' | 'textual' | null;
  data: Array<{
    key: string;
    value: number;
  }>;
}

export interface Knowledge {
  knowledge_content: string;
  data_insight: string;
  first_level_highlight: string;
  second_level_highlight: string;
  icon_keyword: string;
  visualization: Visualization;
}

export interface RelatedSubtask {
  title: string | null;
  relation: string | null;
}

export interface GroupData {
  subtask_title: string;
  subtask_content: string;
  subtask_relation: string;
  related_subtask: RelatedSubtask;
  knowledges: Knowledge[];
}

export interface ConnectionPath {
  d: string;
}

export interface ConnectionLabel {
  x: number;
  y: number;
  text: string;
}

export interface Connection {
  sourceIndex: number;
  targetIndex: number;
} 