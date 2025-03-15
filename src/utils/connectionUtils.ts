import type { GroupData, Connection, ConnectionPath, ConnectionLabel } from '../types';

/**
 * 计算连线路径
 * @param connections 连接关系
 * @param dashedRefs 虚线框DOM引用
 * @param containerRect 容器矩形区域
 * @returns 路径和标签信息
 */
export const calculateConnections = (
  connections: Connection[],
  dashedRefs: HTMLElement[],
  containerRect: DOMRect
): { paths: ConnectionPath[], labels: ConnectionLabel[] } => {
  // 按同一源组分组，便于计算多条连线的水平偏移
  const grouped: Record<number, { targetIndex: number }[]> = {};
  connections.forEach(conn => {
    if (!grouped[conn.sourceIndex]) {
      grouped[conn.sourceIndex] = [];
    }
    grouped[conn.sourceIndex].push({ targetIndex: conn.targetIndex });
  });

  const paths: ConnectionPath[] = [];
  const labels: ConnectionLabel[] = [];
  const baseHorizontalOffset = 25; // 基础水平偏移
  const horizontalOffsetStep = 5;  // 同源组内额外的水平偏移
  const r = 10;                    // 圆角半径

  connections.forEach(conn => {
    const sourceEl = dashedRefs[conn.sourceIndex];
    const targetEl = dashedRefs[conn.targetIndex];
    if (!sourceEl || !targetEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const groupConnections = grouped[conn.sourceIndex];
    const order = groupConnections.findIndex(item => item.targetIndex === conn.targetIndex);
    const horizontalOffsetThis = baseHorizontalOffset + order * horizontalOffsetStep;

    // 起点：源虚线框下1/3处（高度的 2/3）
    const sourceX = sourceRect.right - containerRect.left;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height * (2 / 3);

    // 终点：目标虚线框上1/3处（高度的 1/3）
    const targetX = targetRect.right - containerRect.left;
    const targetY = targetRect.top - containerRect.top + targetRect.height * (1 / 3);

    const horizontalEnd = sourceX + horizontalOffsetThis;

    // 上拐角（外弧）
    const topArc = `
      M ${sourceX} ${sourceY}
      L ${horizontalEnd - r} ${sourceY}
      A ${r} ${r} 0 0 1 ${horizontalEnd} ${sourceY + r}
    `;
    // 下拐角（外弧）
    const bottomArc = `
      L ${horizontalEnd} ${targetY - r}
      A ${r} ${r} 0 0 1 ${horizontalEnd - r} ${targetY}
      L ${targetX} ${targetY}
    `;
    paths.push({ d: (topArc + bottomArc).trim() });

    // 计算 label 位置：取下拐角中点并上移 5 像素
    const labelX = ((horizontalEnd + r) + targetX) / 2 + 7;
    const labelY = targetY - 10;
    labels.push({ x: labelX, y: labelY, text: '' });
  });

  return { paths, labels };
};

/**
 * 查找连接关系
 * @param data 组数据
 * @returns 连接关系数组
 */
export const findConnections = (data: GroupData[]): Connection[] => {
  const connections: Connection[] = [];

  data.forEach((group, targetIndex) => {
    if (group.related_subtask && group.related_subtask.title) {
      const sourceIndex = data.findIndex(
        (g) => g.subtask_title === group.related_subtask!.title
      );
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        connections.push({ sourceIndex, targetIndex });
      }
    }
  });

  return connections;
}; 