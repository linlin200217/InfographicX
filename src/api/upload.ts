import httpClient from './index';


/**
 * 上传PDF文件和问题
 * @param file - PDF文件
 * @param question - 用户问题
 * @returns 上传结果
 */
export const uploadPdfWithQuestion = async (
  file: File,
  question: string
): Promise<any> => {
  // 创建表单数据
  const formData = new FormData();
  formData.append('file', file);
  formData.append('question', question);

  // 发送请求
  const response = await httpClient.post<any>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};