import * as React from "react";
import * as d3 from "d3";

function drawChart(svgRef, data) {

  const margin = {top: 20, bottom: 10}
  const width = 700;
  const height = 200 - margin.top - margin.bottom;

  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const svgContainer = d3
    .select(svgRef.current)
    .attr("width", width)
    .attr("height", height + margin.top + margin.bottom)

  x.domain(data.map((x) => x.id))
  y.domain([0, d3.max(data, (data) => data.wpm) + 50])

  svgContainer.selectAll("*").remove();
  
  const svg = svgContainer.append('g');
  
  svg
    .append('g')
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .attr('transform', `translate(0, ${height})`)
    .attr('color', '#35B27C');

  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr('width', x.bandwidth())
    .attr('height', data => height - y(data.wpm))
    .attr('x', (data) => x(data.id))
    .attr('y', (data) => y(data.wpm))
    .attr('fill', '#35B27C');
    
  svg
    .selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .text(data => data.wpm)
    .attr('x', data => x(data.id) + x.bandwidth() / 2)
    .attr('y', data => y(data.wpm) - 20)
    .attr('text-anchor' , 'middle')
    .classed('label', true)
    .attr('fill', '#35B27C');
}
const Chart = ({ data }) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    drawChart(svgRef, data);
  }, [svgRef, data]);

  return (
    <div id="chart">
      <svg ref={svgRef} />
    </div>
  );
};

export default Chart;