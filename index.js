const height = 400;
const width = 800;
const paddingY = 60;
const paddingX = 100;

const color = d3.scaleOrdinal(d3.schemeSet2);

const chartContainer = d3.select(".chart");

chartContainer
   .append("div")
   .attr("id", "title")
   .attr("class", "title-container")
   .append("h1")
   .attr("class", "title")
   .text("Doping in Professional Bicycle Racing");

d3.select("#title")
   .append("p")
   .attr("class", "sub-title")
   .text("35 Fastest times up Alpe d'Huez");

const chart = chartContainer
   .append("svg")
   .attr("width", width + paddingX)
   .attr("height", height + paddingY);

d3.json(
   "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((data) => {
   // console.log(data);

   // Race Times (y-axis)
   const timeFormat = "%M:%S";
   const parsedTime = data.map((data) => d3.timeParse(timeFormat)(data.Time));
   const yAxisScale = d3.scaleTime().domain(d3.extent(parsedTime)).range([0, height]);
   const yAxis = d3.axisLeft(yAxisScale).tickFormat((d) => d3.timeFormat(timeFormat)(d));

   chart
      .append("g")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr("transform", `translate(60, 20)`);

   // Years (x-axis)
   const maxYear = d3.max(data, (d) => d.Year + 1);
   const minYear = d3.min(data, (d) => d.Year - 1);
   const xAxisScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, width]);
   const xAxis = d3.axisBottom(xAxisScale).tickFormat((d) => d3.timeParse(d));
   chart
      .append("g")
      .call(xAxis)
      .attr("id", "x-axis")
      .attr("transform", `translate(${paddingY}, ${height + 20})`);

   // Data points

   d3.select("svg")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xAxisScale(d.Year) + 60)
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d3.timeParse(timeFormat)(d.Time))
      .attr("cy", (d) => yAxisScale(d3.timeParse(timeFormat)(d.Time)) + 20)
      .attr("r", 6)
      .attr("fill", (d) => color(Boolean(d.Doping)));

   const legendContainer = chart.append("g").attr("id", "legend");

   const legend = legendContainer
      .selectAll("#legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${height / 2 - i * 20})`);

   legend
      .append("rect")
      .attr("class", "legend-label")
      .attr("x", width)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

   legend
      .append("text")
      .attr("class", "label-text")
      .attr("x", width - 6)
      .attr("y", 12)
      .text((d) => `${d ? "No" : "Riders with"} doping allegations`);
});
