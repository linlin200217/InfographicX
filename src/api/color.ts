import httpClient from './index';

/**
 * 颜色方案接口响应类型
 */
export interface ColorScheme {
  theme_colors: number[][];
  background_color: number[];
  first_level_color: number[];
  first_level_font: string;
  second_level_color: number[];
  second_level_font: string;
  text_color: number[];
  text_font: string;
}

/**
 * 根据知识内容生成颜色方案
 * @param knowledgeContent - 知识内容
 * @returns 颜色方案
 */
export const generateColorScheme = async (
  knowledgeContent: any
): Promise<ColorScheme> => {
  const response = await httpClient.post<ColorScheme>('/color', {
 knowledgeContent
  });

  return response.data;
};