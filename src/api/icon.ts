import httpClient from './index';


/**
 * 根据关键词和颜色列表生成图标
 * @param keyword - 关键词
 * @param colorlist - 颜色列表
 * @param coordinates - 坐标
 * @returns 图标
 */
export const generateIcon = async (
  keyword: string,
  colorlist: number[][],
  coordinates: number[][]
): Promise<string[]> => {
  const response = await httpClient.post<string[]>('/icon', {
    keyword,
    colorlist,
    coordinates
  });

  return response.data;
};