const elNinoYears = [1891, 1926, 1973, 1983, 1998, 2016];

async function loadData() {
    const data = await d3.csv("data/temperature.csv", d => {
        return { ...d, Year: +d.Year, J_D: +d['J-D'] }; // Parsing logic
    });
    return data.filter(d => !isNaN(d.Year) && !isNaN(d.J_D));
}

function updateVisualization(data, svg, startYear, endYear) {
    // Filter the data to include only the range between the start and end years
    const filteredData = data.filter(d => d.Year >= startYear && d.Year <= endYear);

    // Reinitialize the visualization with the filtered data
    initializeVisualization(filteredData, svg);
}

function initializeVisualization(data, svg) {
    const margin = {top: 50, right: 30, bottom: 70, left: 70};
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Define scales within the function to ensure they are updated
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year)).range([0, width]);
    const y = d3.scaleLinear().domain([d3.min(data, d => d.J_D), d3.max(data, d => d.J_D)]).nice().range([height, 0]);

    drawIntroduction(svg, data, x, y, margin, width, height);
}

document.addEventListener("DOMContentLoaded", async function() {
    const data = await loadData();
    const svg = setupSvg();
    initializeButtons(data, svg); // Pass data and SVG to buttons for further initialization
    initializeVisualization(data, svg); // Initialize visualization
    d3.select("#controls-introduction").style("display", "block");

    const startYearSlider = document.getElementById('startYear');
    const endYearSlider = document.getElementById('endYear');
    const startYearLabel = document.getElementById('startYearLabel');
    const endYearLabel = document.getElementById('endYearLabel');

    startYearSlider.addEventListener("input", function() {
        if (parseInt(startYearSlider.value) > parseInt(endYearSlider.value)) {
            startYearSlider.value = endYearSlider.value;
        }
        startYearLabel.textContent = startYearSlider.value;
        updateVisualization(data, svg, parseInt(startYearSlider.value), parseInt(endYearSlider.value));
    });

    endYearSlider.addEventListener("input", function() {
        if (parseInt(endYearSlider.value) < parseInt(startYearSlider.value)) {
            endYearSlider.value = startYearSlider.value;
        }
        endYearLabel.textContent = endYearSlider.value;
        updateVisualization(data, svg, parseInt(startYearSlider.value), parseInt(endYearSlider.value));
    });
});

function initializeButtons(data, svg) {
    d3.select("#btn-intro").on("click", () => {
        const startYearSlider = document.getElementById('startYear');
        const endYearSlider = document.getElementById('endYear');
        const startYearLabel = document.getElementById('startYearLabel');
        const endYearLabel = document.getElementById('endYearLabel');

        // Reset sliders to their minimum and maximum values
        startYearSlider.value = startYearSlider.min;
        endYearSlider.value = endYearSlider.max;
        startYearLabel.textContent = startYearSlider.value;
        endYearLabel.textContent = endYearSlider.value;

        updateVisualization(data, svg, parseInt(startYearSlider.value), parseInt(endYearSlider.value));

        d3.select("#controls-effects").style("display", "none");
        d3.select("#controls-introduction").style("display", "block");
    });

    d3.select("#btn-elnino").on("click", () => {
        const margin = {top: 50, right: 30, bottom: 70, left: 70};
        const width = 960 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // Define scales within the button click to ensure they are updated
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.Year)).range([0, width]);
        const y = d3.scaleLinear().domain([d3.min(data, d => d.J_D), d3.max(data, d => d.J_D)]).nice().range([height, 0]);

        drawGraphWithAnnotations(svg, data, x, y, margin, width, height); // Draw graph with annotations
        d3.select("#controls-introduction").style("display", "none");
        d3.select("#controls-effects").style("display", "none");
    });

    d3.select("#btn-effects").on("click", () => {
        setupElNinoEffectsButtons(data, svg);
        d3.select("#controls-introduction").style("display", "none");
        d3.select("#controls-effects").style("display", "block");
    });
}

function setupSvg() {
    const svg = d3.select("#visualization").html("").append("svg")
        .attr("width", 960 + 100)
        .attr("height", 600 + 100)
        .append("g")
        .attr("transform", "translate(50, 50)");

    // Define a clipping path
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", 960)
        .attr("height", 600);

    return svg;
}

function drawIntroduction(svg, data, x, y, margin, width, height) {
    svg.selectAll("*").remove(); // Clear previous contents

    const line = d3.line()
        .defined(d => !isNaN(d.J_D))
        .x(d => x(d.Year))
        .y(d => y(d.J_D));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("transform", `translate(${margin.left},${height + margin.top})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y));

    // Adding X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 50)
        .text("Year");

    // Adding Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -height / 2 - margin.top)
        .attr("y", margin.left - 50)
        .text("Temperature Anomaly (°C)");
}

function drawGraphWithAnnotations(svg, data, x, y, margin, width, height) {
    svg.selectAll("*").remove(); // Clear previous contents

    const line = d3.line()
        .defined(d => !isNaN(d.J_D))
        .x(d => x(d.Year))
        .y(d => y(d.J_D));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("transform", `translate(${margin.left},${height + margin.top})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y));

    // Text element for displaying temperature differences
    let infoText = svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top - 20) // Position above the graph
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black")
        .text("Click on the labels to see more info about El Niño years");

    elNinoYears.forEach(year => {
        const yearData = data.find(d => d.Year === year);
        const prevYearData = data.find(d => d.Year === year - 1);

        if (yearData && prevYearData) {
            const annotationOffset = 50;
            const labelOffset = 10;

            let line = svg.append("line")
                .attr("x1", x(yearData.Year) + margin.left)
                .attr("y1", y(yearData.J_D) + margin.top)
                .attr("x2", x(yearData.Year) + margin.left)
                .attr("y2", y(yearData.J_D) - annotationOffset + margin.top)
                .attr("stroke", "red")
                .attr("stroke-width", 2);

            let circle = svg.append("circle")
                .attr("cx", x(yearData.Year) + margin.left)
                .attr("cy", y(yearData.J_D) + margin.top)
                .attr("r", 7)
                .attr("fill", "red")
                .style("cursor", "pointer");

            let label = svg.append("text")
                .attr("x", x(yearData.Year) + margin.left)
                .attr("y", y(yearData.J_D) - annotationOffset - labelOffset + margin.top)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "red")
                .text(`El Niño ${year}`)
                .style("cursor", "pointer");

            let tempDifference = yearData.J_D - prevYearData.J_D;

            [line, circle, label].forEach(element => {
                element.on("click", () => {
                    infoText.text(`Temp change from ${year - 1} to ${year}: ${tempDifference.toFixed(2)}°C`);
                });
            });
        }
    });
}

function setupElNinoEffectsButtons(data, svg) {
    svg.selectAll("*").remove(); // Clear the SVG to prepare for a new scene
    const controls = document.getElementById('elnino-buttons');
    controls.innerHTML = ''; // Make sure previous buttons are removed

    elNinoYears.forEach(year => {
        let button = document.createElement('button');
        button.textContent = `El Niño ${year}`;
        button.onclick = () => displayElNinoEffects(data, svg, year);
        controls.appendChild(button);
    });
}

function displayElNinoEffects(data, svg, selectedYear) {
    const filteredData = data.filter(d => d.Year >= selectedYear && d.Year <= selectedYear + 5);
    initializeVisualization(filteredData, svg);
}