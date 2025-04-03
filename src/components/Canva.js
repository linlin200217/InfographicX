import * as fabric from "fabric";

// 创建单例实例
let instance = null;

export class CanvasDrawer {
  constructor(canvas,styleStore) {
    if (instance) {
      return instance;
    }
    instance = this;
    this.styleStore = styleStore
    this.canvas = canvas;
    this.isDrawing = true;
    this.startPoint = { x: 0, y: 0 };
    this.currentLine = null;
    this.currentRect = null;
    this.currentText = null;
    this.drawingDoneFn = null;
    this.currentColor = '#000000';
    this.currentLineStyle = 'solid';
    this.currentRadius = 0;
    this.currentWidth = 2;
    
    // 添加键盘事件监听
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }


  // 处理键盘事件
  handleKeyDown(e) {
    if (e.key === 'Delete' || (e.key === 'Backspace' && e.ctrlKey)) {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.remove(activeObject);
        this.canvas.renderAll();
      }
    }
  }

  drawingDone(fn) {
    this.drawingDoneFn = fn;
  }

  // 禁用所有现有对象的选中功能
  disableSelection() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.generatedFromData || (obj !== this.currentLine && obj !== this.currentRect)) {
        obj.selectable = false;
      }
    });
  }

  // 恢复所有对象的选中功能
  enableSelection() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.generatedFromData) {
        obj.selectable = obj.originalSelectable !== undefined ? obj.originalSelectable : true;
      } else {
        obj.selectable = true;
      }
    });
  }

  // 开始绘制
  startDrawing(e) {
    this.isDrawing = true;
    const pointer = this.canvas.getPointer(e.e);
    this.startPoint = { x: pointer.x, y: pointer.y };
    
    if (this.type === 'line') {
      this.currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: this.currentColor,
        strokeWidth: this.currentWidth,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        hasRotatingPoint: false,
        hasScalingX: true,
        hasScalingY: true,
        hasMovingPoint: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        lockUniScaling: false,
        lockSkewingX: false,
        lockSkewingY: false,
        strokeDashArray: this.currentLineStyle === 'dashed' ? [5, 5] : null,
        id: `vis-${Date.now()}`,
        tooltipText: `VG${Math.random(0,1).toFixed(6)}, visualization`,
        tooltipType: "visualization",
      });
      this.canvas.add(this.currentLine);
    } else if (this.type === 'rectLine') {
      this.currentRect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        stroke: this.currentColor,
        strokeWidth: this.currentWidth,
        fill: 'transparent',
        selectable: true,
        hasControls: true,
        hasBorders: true,
        strokeDashArray: this.currentLineStyle === 'dashed' ? [5, 5] : null,
        strokeUniform: true,
        radius: this.currentRadius,
        // rx: this.currentRadius,
        // ry: this.currentRadius,
        id: `vis-${Date.now()}`,
        tooltipText: `VG${Math.random(0,1).toFixed(6)}, visualization`,
        tooltipType: "drawRect",
      });
      this.canvas.add(this.currentRect);
    } 
    else if (this.type === 'text') {
      this.currentText = new fabric.Textbox('输入文本', {
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 30,
        text: '输入文本',
        fontSize: 14,
        fontFamily: this.styleStore.textFont,
        id: `text-${Date.now()}`,
        tooltipText: `VG${Math.random(0,1).toFixed(6)}, text`,
        tooltipType: "text",

        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingY: true,
        generatedFromData: true,
      });
      this.currentText.setCoords();
      this.canvas.add(this.currentText);
      this.canvas.renderAll();
    }
  }

  // 绘制过程
  drawing(e) {
    if (!this.isDrawing) return;
    
    const pointer = this.canvas.getPointer(e.e);
    
    if (this.type === 'line' && this.currentLine) {
      this.currentLine.set({
        x2: pointer.x,
        y2: pointer.y,
        strokeDashArray: this.currentLineStyle === 'dashed' ? [5, 5] : null,
        strokeWidth: this.currentWidth,
        selectable: true,
        hasControls: true,
        hasBorders: true
      });
    } else if (this.type === 'rectLine' && this.currentRect) {
      const width = pointer.x - this.startPoint.x;
      const height = pointer.y - this.startPoint.y;
      
      this.currentRect.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? this.startPoint.x : pointer.x,
        top: height > 0 ? this.startPoint.y : pointer.y,
        strokeDashArray: this.currentLineStyle === 'dashed' ? [5, 5] : null,
        strokeWidth: this.currentWidth,
        rx: this.currentRadius,
        ry: this.currentRadius,
        selectable: true,
        hasControls: true,
      });
    } 
    // else if (this.type === 'text' && this.currentText) {
    //   const width = pointer.x - this.startPoint.x;
    //   const height = pointer.y - this.startPoint.y;
      
    //   this.currentText.set({
    //     text: '输入文本',
    //     width: Math.abs(width),
    //     height: Math.abs(height),
    //     left: width > 0 ? this.startPoint.x : pointer.x,
    //     top: height > 0 ? this.startPoint.y : pointer.y,
    //     selectable: true,
    //     hasControls: true,
    //     hasBorders: true,
    //   });
    // } 
    
    this.canvas.renderAll();
  }

  // 结束绘制
  endDrawing() {
    this.isDrawing = false;
    this.canvas.defaultCursor = 'default';
    
    // 恢复选中
    this.enableSelection();
    
    // 确保当前绘制的对象保持可选中和可操作状态
    if (this.currentLine) {
      this.currentLine.set({
        selectable: true,
        hasControls: true,
        hasBorders: true,
        hasRotatingPoint: false,
        hasScalingX: true,
        hasScalingY: true,
        hasMovingPoint: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        lockUniScaling: false,
        lockSkewingX: false,
        lockSkewingY: false,
        generatedFromData: true,
      });
      this.currentLine.setCoords();
    }
    
    if (this.currentRect) { 
      this.currentRect.set({
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingY: false,
        lockScalingX: false,
        generatedFromData: true,
      });
      this.currentRect.setCoords();
      this.canvas.setActiveObject(this.currentRect);
      this.canvas.renderAll();
      
    }
    if (this.currentText) {
      this.currentText.set({
        selectable: true,
        hasControls: false,
        hasBorders: true,
        generatedFromData: true,
      });
      this.currentText.setCoords();
    }

    
    // 清除当前对象引用
    this.currentLine = null;
    this.currentRect = null;
    // this.currentText = null;
    setTimeout(() => {
        this.canvas.setActiveObject(this.currentText);  // 选中对象
        this.currentText.enterEditing(); 
        this.currentText.hiddenTextarea.selectionStart = 0;
        this.currentText.hiddenTextarea.selectionEnd = 4;
        this.currentText.hiddenTextarea.focus();    // 强制聚焦
        this.currentText = null;
    }, 100);
    // 移除事件监听器
    this.canvas.off('mouse:down');
    this.canvas.off('mouse:move');
    this.canvas.off('mouse:up');

    // 在绘制完成时触发事件
    if (this.drawingDoneFn) {
      this.drawingDoneFn();
    }
  }

  // 初始化绘制功能
  initDrawing(params) {
    if (!this.canvas) return;
    
    this.type = params.type;
    if(params.lineStyle){
      this.currentLineStyle = params.lineStyle;
    }
    if (params.color) {
      this.currentColor = params.color;
    }
    if (params.radius !== undefined) {
      this.currentRadius = params.radius;
    }
    if (params.width !== undefined) {
      this.currentWidth = params.width;
    }

    // 保存原始的可选中状态并禁用选中
    this.canvas.getObjects().forEach((obj) => {
      if (obj.generatedFromData) {
        obj.originalSelectable = obj.selectable;
      }
    });
    this.disableSelection();
    
    // 设置鼠标样式并绑定事件
    this.canvas.defaultCursor = 'crosshair';
    this.canvas.on('mouse:down', (e) => this.startDrawing(e));
    this.canvas.on('mouse:move', (e) => this.drawing(e));
    this.canvas.on('mouse:up', () => this.endDrawing());
  }

  // 清理方法
  dispose() {
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 移除画布事件监听
    this.canvas.off('mouse:down');
    this.canvas.off('mouse:move');
    this.canvas.off('mouse:up');
  }
}

