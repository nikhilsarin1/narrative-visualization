document.addEventListener("DOMContentLoaded", async function() {
    const data = await loadData();
    initializeVisualization(data);
});

function initializeVisualization(data) {
    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", 960)
                  .attr("height", 600);

    drawAnnualTrends(svg, data);
}

function drawAnnualTrends(svg, data) {
    const validData = data.filter(d => !isNaN(d.Year) && !isNaN(d.J_D));

    const margin = {top: 20, right: 30, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.J_D), d3.max(data, d => d.J_D)])
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .defined(d => !isNaN(d.J_D))  
        .x(d => x(d.Year))
        .y(d => y(d.J_D));

    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line);

    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x).ticks(data.length / 10).tickFormat(d3.format("d")));

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));
}
