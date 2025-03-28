import httpClient from './index';



export const layoutRequest = async (
  type: string,
  parserResult: any,
  infographicSize: [number, number]
): Promise<string[]> => {
  const response = await httpClient.post<string[]>(`/layout?type=${type}`, {
    parser_result: parserResult,
    infographic_size: infographicSize
  });

  return response.data;
};

export const submitLayout = async (type: string, layout: any,parser_result: any) => {
  const response = await httpClient.post<string[]>(`/submit?type=${type}`, {
    layout: layout,
    parser_result: parser_result
  });

  return response.data;
};