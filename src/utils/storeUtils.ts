import type { GroupData } from '../types';

/**
 * 同步更新本地数据和store数据
 * @param localData 本地数据引用
 * @param storeData store数据引用
 * @param groupIndex 组索引
 * @param knowledgeIndex 知识索引（可选）
 * @param field 字段名
 * @param value 新值
 */
export const syncDataUpdate = (
  localData: GroupData[],
  storeData: GroupData[] | undefined,
  groupIndex: number,
  knowledgeIndex: number | null,
  field: string,
  value: string
) => {
  if (groupIndex < 0 || groupIndex >= localData.length) return;

  if (knowledgeIndex !== null) {
    // 更新知识点相关字段
    if (knowledgeIndex < 0 || knowledgeIndex >= localData[groupIndex].knowledges.length) return;
    
    // 更新本地数据
    (localData[groupIndex].knowledges[knowledgeIndex] as any)[field] = value;
    
    // 更新store数据
    if (storeData && storeData[groupIndex] && storeData[groupIndex].knowledges[knowledgeIndex]) {
      (storeData[groupIndex].knowledges[knowledgeIndex] as any)[field] = value;
    }
  } else {
    // 更新组相关字段
    // 更新本地数据
    (localData[groupIndex] as any)[field] = value;
    
    // 更新store数据
    if (storeData && storeData[groupIndex]) {
      (storeData[groupIndex] as any)[field] = value;
    }
  }
};

/**
 * 删除组或知识点
 * @param localData 本地数据引用
 * @param storeData store数据引用
 * @param groupIndex 组索引
 * @param knowledgeIndex 知识索引（可选）
 * @returns 是否删除成功
 */
export const removeItem = (
  localData: GroupData[],
  storeData: GroupData[] | undefined,
  groupIndex: number,
  knowledgeIndex: number | null = null
): boolean => {
  if (groupIndex < 0 || groupIndex >= localData.length) return false;

  if (knowledgeIndex !== null) {
    // 删除知识点
    if (knowledgeIndex < 0 || knowledgeIndex >= localData[groupIndex].knowledges.length) return false;
    
    // 更新本地数据
    localData[groupIndex].knowledges.splice(knowledgeIndex, 1);
    
    // 更新store数据
    if (storeData && storeData[groupIndex]) {
      storeData[groupIndex].knowledges.splice(knowledgeIndex, 1);
    }
  } else {
    // 删除整个组
    // 更新本地数据
    localData.splice(groupIndex, 1);
    
    // 更新store数据
    if (storeData) {
      storeData.splice(groupIndex, 1);
    }
  }

  return true;
}; 