import httpClient from './index';


/**
 * 对信息图元素进行排名
 * @param parserResult - 解析结果
 * @param infographicSize - 信息图尺寸 [宽度, 高度]
 * @returns 排名后的元素ID列表
 */
export const rankInfographicElements = async (
  parserResult: any,
  infographicSize: [number, number]
): Promise<string[]> => {
  const response = await httpClient.post<string[]>('/rank', {
    parser_result: parserResult,
    infographic_size: infographicSize
  });

  return response.data;
};