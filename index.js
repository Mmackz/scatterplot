console.log(flags);

// add div for tooltip
d3.select(".chart-outer")
   .insert("div", ":first-child")
   .attr("id", "tooltip")
   .attr("class", "tooltip")
   .attr("opacity", "0");

// setup chart
const height = 380;
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
   console.log(new Set(data.map((x) => x.Nationality).sort()));

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

   chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -270)
      .attr("y", 20)
      .text("Time in minutes");

   chart
      .append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -286)
      .attr("y", 80)
      .text("faster times");
   chart
      .append("line")
      .attr("x1", 75)
      .attr("x2", 75)
      .attr("y1", 189)
      .attr("y2", 130)
      .attr("stroke", "black")
      .attr("stroke-width", 1.2);
   chart
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle))
      .attr("transform", "translate(75, 128)")
      .attr("fill", "#6f9df1")
      .attr("stroke", "black");

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
      .attr("r", 8)
      .attr("fill", (d) => color(Boolean(d.Doping)))
      .on("mouseenter", (event, data) => {
         console.log(data);
         d3
            .select("#tooltip")
            .attr("data-year", data.Year)
            .style("opacity", "0.9")
            .style("z-index", "1")
            .style("left", `${xAxisScale(data.Year) + 100}px`)
            .style("top", `${yAxisScale(d3.timeParse(timeFormat)(data.Time)) + 92}px`)
            .html(`
               <p class="tt-text">
                  <span class="tt-label">NAME:</span>
                  ${data.Name}
                  <span class="tt-country">${flags[data.Nationality]}</span>
               </p>
               <p class="tt-text">
                  <span class="tt-label">YEAR:</span>
                  ${data.Year}
               </p>
               <p class="tt-text">
                  <span class="tt-label">TIME:</span>
                  ${data.Time}
               </p>
               ${data.Doping && `
                  <p class="tt-text">
                     <span class="tt-label">ALLEGATION:</span>
                     ${data.Doping}
                  </p>
               `}
            `);
      })
      .on("mouseout", () => {
         d3.select("#tooltip").style("opacity", "0").style("z-index", "-1");
      });

   const legend = chart
      .append("g")
      .attr("id", "legend")
      .selectAll("g")
      .data([true, false])
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
      .text((d) => `${d ? "Riders with" : "No"} doping allegations`);
});
