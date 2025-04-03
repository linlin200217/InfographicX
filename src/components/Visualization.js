import { onMounted, ref, watch } from "vue";
import * as d3 from "d3";

export const drawChart = (visualization, width, height, themeColors) => {
  console.log(visualization, width, height, themeColors, "g103====");
  const d3svg = d3.create("svg").attr("width", width).attr("height", height);

  // 获取容器尺寸
  const containerWidth = width || 60;
  const containerHeight = height || 60;

  // 清空容器
  // d3.select(chartContainer.value).html("");

  // 创建响应式 SVG，设置 viewBox 保证 SVG 内内容按比例缩放
  // const svg = d3.select(chartContainer.value)
  //               .append("svg")
  //               .attr("width", "100%")
  //               .attr("height", "100%")
  //               .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
  //               .attr("preserveAspectRatio", "xMidYMid meet");

  const svg = d3svg;

  // 计算图表的有效绘制区域（容器中间80%）
  const effectiveWidth = containerWidth * 0.9;
  const effectiveHeight = containerHeight * 0.9;
  const offsetX = containerWidth * 0.05;
  const offsetY = containerHeight * 0.05;

  // 在 SVG 中添加一个组，用于将图表绘制在中心80%的区域内
  const chartGroup = svg.append("g").attr("transform", `translate(${offsetX},${offsetY})`);

  const inputData = visualization;
  const colorPalette = themeColors.map((item) => {
    return `rgb(${item.join(",")})`;
  });

  // 如果不需要可视化或没有指定类型，则显示提示文字
  if (!inputData.is_visualization || !inputData.type) {
    return;
  }

  const type = inputData.type;

  if (type === "pie_chart") {
    const data = inputData.data;
    const radius = (Math.min(effectiveWidth, effectiveHeight) / 2) * 0.85;
    // 在有效区域中居中显示饼图
    const g = chartGroup.append("g").attr("transform", `translate(${effectiveWidth / 2},${effectiveHeight / 2})`);
    const pie = d3
      .pie()
      .value((d) => d.value)
      .startAngle(0)
      .endAngle(2 * Math.PI);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const arcs = g.selectAll("arc").data(pie(data)).enter().append("g").attr("class", "arc");
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colorPalette[i % colorPalette.length])
      .attr("stroke", (d, i) => colorPalette[i % colorPalette.length])
      .attr("stroke-width", 2);
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => d.data.key);
    return arcs;
  } else if (type === "bar_chart") {
    const data = inputData.data;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = effectiveWidth - margin.left - margin.right;
    const chartHeight = effectiveHeight - margin.top - margin.bottom;
    const svgBar = chartGroup.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, chartWidth])
      .padding(0.1);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);
    // 每个 bar 的宽度
    const barWidth = x.bandwidth();
    // 根据 bar 的宽度动态计算一个合适的字体大小（例如 15% 的 bar 宽度，最小6px）
    const fontSize = Math.max(6, barWidth * 0.15);

    // 绘制 x 轴（移除刻度线，只保留轴线和文字）
    const xAxis = d3
      .axisBottom(x)
      .tickSize(0)
      .tickFormat((d) => d);
    const xAxisGroup = svgBar.append("g").attr("transform", `translate(0,${chartHeight})`).call(xAxis);
    xAxisGroup
      .selectAll("text")
      .style("font-size", fontSize + "px")
      .attr("textLength", barWidth)
      .attr("lengthAdjust", "spacingAndGlyphs");
    // 绘制 y 轴（移除刻度线，只保留轴线和文字）
    const yAxis = d3
      .axisLeft(y)
      .tickSize(0)
      .tickFormat(() => "");
    svgBar.append("g").call(yAxis);

    // 绘制柱状图
    svgBar
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.key) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", barWidth)
      .attr("height", (d) => chartHeight - y(d.value))
      .attr("fill", (d, i) => colorPalette[i % colorPalette.length])
      .attr("stroke", (d, i) => colorPalette[i % colorPalette.length])
      .attr("stroke-width", 1);
    return svgBar;
  } else if (type === "line_chart") {
    const data = inputData.data.slice().sort((a, b) => +a.key - +b.key);
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = effectiveWidth - margin.left - margin.right;
    const chartHeight = effectiveHeight - margin.top - margin.bottom;
    const svgLine = chartGroup.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.key))
      .range([0, chartWidth]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);
    const line = d3
      .line()
      .x((d) => x(d.key))
      .y((d) => y(d.value));
    svgLine
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorPalette[0])
      .attr("stroke-width", 2)
      .attr("d", line);
    svgLine
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.key))
      .attr("cy", (d) => y(d.value))
      .attr("r", 2)
      .attr("fill", colorPalette[0]);
    // 绘制 x、y 轴，仅显示轴线
    const xAxis = d3
      .axisBottom(x)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickFormat(() => "");
    const xAxisGroup = svgLine.append("g").attr("transform", `translate(0,${chartHeight})`).call(xAxis);
    const yAxis = d3
      .axisLeft(y)
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickFormat(() => "");
    const yAxisGroup = svgLine.append("g").call(yAxis);
    return svgLine;
  } else if (type === "single_pie_chart") {
    const data = inputData.data;
    const primary = data[0];
    const remaining = 100 - primary.value;
    const pieData = [
      { key: primary.key, value: primary.value },
      { key: "remaining", value: remaining },
    ];
    const radius = (Math.min(effectiveWidth, effectiveHeight) / 2) * 0.8;
    const g = chartGroup.append("g").attr("transform", `translate(${effectiveWidth / 2},${effectiveHeight / 2})`);
    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const arcs = g.selectAll("arc").data(pie(pieData)).enter().append("g").attr("class", "arc");
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => (d.data.key === "remaining" ? "transparent" : colorPalette[i % colorPalette.length]))
      .attr("stroke", (d, i) => (d.data.key === "remaining" ? "transparent" : colorPalette[i % colorPalette.length]))
      .attr("stroke-width", 2);
    return arcs;
    //   arcs.append("text")
    //       .attr("transform", d => `translate(${arc.centroid(d)})`)
    //       .attr("text-anchor", "middle")
    //       .text(d => d.data.key === "remaining" ? "" : d.data.key);
  } else if (type === "pictographs") {
    const data = inputData.data;
    const highlightItem = data.find((d) => d.key === "highlight");
    const totalItem = data.find((d) => d.key === "total");
    const highlight = highlightItem ? +highlightItem.value : 0;
    const total = totalItem ? +totalItem.value : 0;
    if (total > 20) {
      chartGroup
        .append("text")
        .attr("x", effectiveWidth / 2)
        .attr("y", effectiveHeight / 2)
        .attr("text-anchor", "middle")
        .text("数据过多");
    } else {
      const cols = Math.ceil(Math.sqrt(total));
      const rows = Math.ceil(total / cols);
      const cellWidth = effectiveWidth / cols;
      const cellHeight = effectiveHeight / rows;
      const iconRadius = 0.4 * Math.min(cellWidth, cellHeight);
      for (let i = 0; i < total; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = cellWidth * col + cellWidth / 2;
        const cy = cellHeight * row + cellHeight / 2;
        chartGroup
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", iconRadius)
          .attr("fill", i < highlight ? colorPalette[0] : "lightgray")
          .attr("stroke", i < highlight ? colorPalette[0] : "lightgray")
          .attr("stroke-width", 1);
      }
    }
    return chartGroup;
  }
};
