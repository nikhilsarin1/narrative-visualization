document.addEventListener("DOMContentLoaded", async function() {
    const data = await loadData();
    const svg = setupSvg();
    const margin = {top: 50, right: 30, bottom: 70, left: 70};
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year)).range([0, width]);
    const y = d3.scaleLinear().domain([d3.min(data, d => d.J_D), d3.max(data, d => d.J_D)]).nice().range([height, 0]);

    initializeButtons(data, svg, x, y, margin, width, height);
    drawIntroduction(svg, data, x, y, margin, width, height); // Start with the introduction scene

    d3.select("#yearRangeSlider").on("input", function() {
        const year = parseInt(this.value);
        const filteredData = data.filter(d => Math.abs(d.Year - year) <= 5); // Filter data within +/- 5 years of the selected year
        drawIntroduction(svg, filteredData, x, y, margin, width, height);
    });
});


async function loadData() {
    const data = await d3.csv("data/temperature.csv", d => {
        return { ...d, Year: +d.Year, J_D: +d['J-D'] }; // Parsing logic
    });
    return data.filter(d => !isNaN(d.Year) && !isNaN(d.J_D));
}

function initializeButtons(data, svg, x, y, margin, width, height) {
    d3.select("#btn-intro").on("click", () => {
        initializeVisualization(data);
        d3.select("#controls-introduction").style("display", "block"); // Show only on intro
    });
    d3.select("#btn-history").on("click", () => {
        drawHistoricalTrends(data, svg, x, y, margin, width, height);
        d3.select("#controls-introduction").style("display", "none"); // Hide for other scenes
    });
    d3.select("#btn-decade").on("click", () => {
        drawDecadalAnalysis(data, svg, x, y, margin, width, height);
        d3.select("#controls-introduction").style("display", "none"); // Hide for other scenes
    });
}

function initializeVisualization(data) {
    const svg = setupSvg(); // Sets up the SVG correctly
    drawIntroduction(svg, data); // Start with the introduction scene
}

function setupSvg() {
    const svg = d3.select("#visualization").html("").append("svg")
        .attr("width", 960 + 100)  // Added extra width for padding
        .attr("height", 600 + 100)  // Added extra height for padding
        .append("g")
        .attr("transform", "translate(50, 50)");  // Increased translation for padding

    // Define a clipping path
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", 960)
        .attr("height", 600);

    // Use clipping path
    svg.attr("clip-path", "url(#clip)");

    return svg;
}

function drawIntroduction(svg, data) {
    const validData = data.filter(d => !isNaN(d.Year) && !isNaN(d.J_D));

    // Ensure adequate space for the axes and labels
    const margin = {top: 50, right: 30, bottom: 70, left: 70},
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Adjust the scale to properly fit within the defined margins
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);  // Axis range from 0 to width, positioned by translating group

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.J_D), d3.max(data, d => d.J_D)]).nice()
        .range([height, 0]);  // Axis range from height to 0, inverted for correct display

    // Define the line generator
    const line = d3.line()
        .defined(d => !isNaN(d.J_D))
        .x(d => x(d.Year))  // Use the adjusted scale
        .y(d => y(d.J_D));  // Use the adjusted scale

    // Clear previous SVG contents
    svg.html('');

    // Draw the line graph
    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line)
       .attr("transform", `translate(${margin.left},${margin.top})`);  // Translate to match axis placement

    // Append the X axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},${height + margin.top})`)
       .call(d3.axisBottom(x).ticks(data.length / 10).tickFormat(d3.format("d")));

    // Append the Y axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`)
       .call(d3.axisLeft(y));

    // Add a red dot for the year 1976
    // el nino year 1891, 1926, 1973, 1983, 1998, 2016
    const dataPoint = data.find(d => d.Year === 1896);
    if (dataPoint) {
        svg.append("circle")
           .attr("cx", x(dataPoint.Year))
           .attr("cy", y(dataPoint.J_D))
           .attr("r", 5)
           .attr("fill", "red")
           .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text")
           .attr("x", x(dataPoint.Year) + 10)  // Offset text to the right of the dot
           .attr("y", y(dataPoint.J_D) - 10)  // Offset text above the dot
           .attr("transform", `translate(${margin.left},${margin.top})`)
           .text("Start of rapid temperature rise")
           .attr("fill", "red")
           .style("font-size", "12px");
    }

    // Adding Title
    svg.append("text")
       .attr("x", (width / 2) + margin.left)
       .attr("y", margin.top / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "20px")
       .style("text-decoration", "underline")
       .text("Global Temperature Anomalies Over Time");

    // X-axis Label
    svg.append("text")
       .attr("class", "x label")
       .attr("text-anchor", "middle")
       .attr("x", width / 2 + margin.left)
       .attr("y", height + margin.top + 40)
       .text("Year");

    // Y-axis Label
    svg.append("text")
       .attr("class", "y label")
       .attr("text-anchor", "middle")
       .attr("transform", `rotate(-90)`)
       .attr("y", margin.left - 40)
       .attr("x", -(height / 2 + margin.top))
       .text("Temperature Anomaly (°C)");
    

}

function drawHistoricalTrends(data) {
    const svg = setupSvg();
    // Your drawing logic for the historical trends
}

function drawDecadalAnalysis(data) {
    const svg = setupSvg();
    // Your drawing logic for the decadal analysis
}