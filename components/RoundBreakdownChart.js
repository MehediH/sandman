import * as React from "react";
import * as d3 from "d3";

function drawChart(svgRef, data) {

  const margin = { top: 20, bottom: 10 }
  const barWidth = 60;
  const barWidthWithoutMargin = barWidth - 10;
  const height = 200 - margin.top - margin.bottom;


  const x = d3.scaleOrdinal().range(d3.range(data.length).map(d => d * barWidth))
  const y = d3.scaleLinear().range([height, 0]);

  const svgContainer = d3
    .select(svgRef.current)
    .attr("width", barWidth * data.length)
    .attr("height", height + margin.top + margin.bottom)

  x.domain(data.map((x) => x.id))
  y.domain([0, d3.max(data, (data) => data.wpm) + 50])

  svgContainer.selectAll("*").remove();

  const svg = svgContainer.append('g');

  svg
    .append('g')
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .attr('transform', `translate(${barWidthWithoutMargin / 2}, ${height})`)
    .attr('color', '#35B27C');

  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr('width', barWidthWithoutMargin)
    .attr('height', data => height - y(data.wpm))
    .attr('x', (data) => x(data.id))
    .attr('y', (data) => y(data.wpm))
    .attr('fill', '#35B27C');


  svg.selectAll("text").attr("font-size", "small")

  svg
    .selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .text(data => data.wpm)
    .attr('x', data => x(data.id) + barWidthWithoutMargin / 2)
    .attr('y', data => y(data.wpm) - margin.top)
    .attr('text-anchor', 'middle')
    .classed('label', true)
    .attr('fill', '#35B27C')
    .attr("font-size", "medium")


}

const RoundBreakdownChart = ({ data }) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    drawChart(svgRef, data);
  }, [svgRef, data]);

  return (
    <div id="chart" class="max-w-3xl overflow-x-auto mb-5 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-green-500 hover:scrollbar-thumb-green-600 ">
      <svg ref={svgRef} />
    </div>
  );
};

export default RoundBreakdownChart;