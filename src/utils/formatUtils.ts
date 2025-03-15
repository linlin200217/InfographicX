/**
 * 应用文本格式化工具
 * @param type 格式化类型：'H1', 'H2', 'Icon'
 * @param selectedText 选中的文本
 * @param parentElement 父元素
 * @returns 格式化后的元素和状态
 */
export const applyTextFormat = (type: string, selectedText: string, parentElement: Element | null) => {
  const result = {
    element: null as HTMLElement | null,
    isRemoved: false,
    formattedText: selectedText
  };

  if (type === 'H1') {
    const isRedBold = parentElement?.classList?.contains('font-bold') && parentElement?.classList?.contains('text-red-600');
    if (isRedBold) {
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      result.element = normalSpan;
      result.isRemoved = true;
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-red-600');
      result.element = span;
    }
  } else if (type === 'H2') {
    const isBlackBold = parentElement?.classList?.contains('font-bold') && !parentElement?.classList?.contains('text-red-600');
    if (isBlackBold) {
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      result.element = normalSpan;
      result.isRemoved = true;
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-black');
      result.element = span;
    }
  } else if (type === 'Icon') {
    if (!parentElement) return result;
    
    const hasBackground = parentElement.classList.contains('bg-[#FFFBBC]');
    const isBold = parentElement.classList.contains('font-bold');
    const isRed = parentElement.classList.contains('text-red-600');
    const isBlack = parentElement.classList.contains('text-black');
    
    if (hasBackground) {
      parentElement.classList.remove('bg-[#FFFBBC]');
      result.isRemoved = true;
      return result;
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('bg-[#FFFBBC]');
      if (isBold) span.classList.add('font-bold');
      if (isRed) span.classList.add('text-red-600');
      if (isBlack) span.classList.add('text-black');
      result.element = span;
    }
  }

  return result;
};

/**
 * 从HTML内容中提取纯文本
 * @param htmlContent HTML内容
 * @returns 纯文本内容
 */
export const extractTextFromHtml = (htmlContent: string): string => {
  // 如果内容为空，直接返回空字符串
  if (!htmlContent || htmlContent.trim() === '') {
    return '';
  }
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // 移除所有的脚本标签
    const scripts = tempDiv.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode?.removeChild(scripts[i]);
    }
    
    // 移除所有的样式标签
    const styles = tempDiv.getElementsByTagName('style');
    for (let i = styles.length - 1; i >= 0; i--) {
      styles[i].parentNode?.removeChild(styles[i]);
    }
    
    return tempDiv.textContent || '';
  } catch (error) {
    console.error('提取文本时出错:', error);
    // 如果出错，尝试使用简单的正则表达式移除HTML标签
    return htmlContent.replace(/<[^>]*>/g, '');
  }
}; 