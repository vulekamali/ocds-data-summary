import React from 'react';
import * as d3 from 'd3';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { isColorLight, months } from './util';
import Typography from '@mui/material/Typography';

export default function Heatmap({ title, data, rowKey, colKey, valKey }) {
    const [width, setWidth] = React.useState(0);

    const ref = React.useRef();

    // Resize
    React.useEffect(() => {
        const element = ref?.current;

        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            entries.forEach(entry => {
                console.log("element resized", entry.contentRect.width);
                setWidth(entry.contentRect.width);
            })
        });

        observer.observe(element);

        return () => {
            // Cleanup the observer by unobserving all elements
            observer.disconnect();
        };
    }, [])

    React.useEffect(
        () => {
            const container = d3.select(ref.current);

            data.forEach(d => d.date = new Date(`${d[colKey]}-01T00:00:00`));

            // Labels of row and columns
            const cols = [...new Set(data.map((d) => d.date))];

            // Generate values for each month in the range available in the data
            const filledCols = d3.scaleTime()
                .domain(d3.extent(cols))
                .ticks(d3.timeMonth);

            const rows = [...new Set(data.map((d) => d[rowKey]))];
            rows.sort();

            const titleHeight = 23;
            const labelHeight = 16;
            const squareSize = 50;
            const plotWidth = (filledCols.length + 1) * squareSize;

            const plotHeight = rows.length * squareSize;
            const xAxisHeight = 20;
            const legendContainerHeight = 21;
            const margin = 8,
                scrollContainerWidth = width,
                height = titleHeight + labelHeight + plotHeight + margin * 2 + xAxisHeight * 2 + legendContainerHeight;

            const minColor = "#f3eae0";
            const maxColor = "#AB5600";

            const tooltipWidth = 150;
            const tooltipHeight = 108;

            container.style("height", `${height}px`);

            const horizontalScrollContainerEl = container.select(".horizontalScrollContainer").node();

            const svg = d3.select(horizontalScrollContainerEl)
                .style("width", `${scrollContainerWidth}px`)
                .style("height", `${plotHeight + margin + 10}px`)
                .style("left", `0px`)
                .select("svg.main")
                .attr("width", plotWidth)
                .attr("height", plotHeight);

            const plotArea = svg.select(".plot-area")
                .attr("transform", `translate(0, 0)`);

            // Build x band scale to determine square layout
            const xBand = d3.scaleBand()
                .range([0, plotWidth])
                .domain(filledCols)
                .padding(0.05);

            const xAxisTickFormat = (value, i) => {
                return i % 3 === 2 ? d3.timeFormat("%b %Y")(value) : "";
            };

            // Create sticky x axis at the top
            container.select(".horizontalScrollXAxisContainer")
                .style("height", `${xAxisHeight + margin}px`)
                .select("svg")
                .attr("height", xAxisHeight + margin)
                .attr("width", plotWidth)
                .style("top", "0px")
                .select(".x-axis.top")
                .attr("transform", `translate(0, ${xAxisHeight - 2 + margin})`)
                .call(d3.axisTop(xBand)
                    .tickFormat(xAxisTickFormat)
                )
                .select("path.domain")
                .style("display", "none");
            container.select(".horizontalScrollXAxisContainer")
                .select("svg")
                .select("rect.background")
                .attr("width", plotWidth)
                .attr("height", xAxisHeight + margin)
                .attr("fill", "#fff");

            // Build y scales and axis:
            const y = d3.scaleBand()
                .range([plotHeight, 0])
                .domain(rows.reverse())
                .padding(0.05);
            container.select(".yAxisContainer")
                .select("svg")
                .attr("width", width)
                .attr("height", plotHeight)
                .style("position", "relative")
                .style("top", `${titleHeight + labelHeight + xAxisHeight + margin + legendContainerHeight + 5}px`)
                .select(".y-axis")
                .selectAll('foreignObject')
                .data(rows)
                .join((enter) => {
                    enter.append("foreignObject")
                        .attr("y", (row) => y(row) + 8)
                        .attr("width", `${width}px`)
                        .attr("height", "30px")
                        .append("xhtml:div")
                        .attr("class", "yLabelContainer")
                        .append("span")
                        .attr("class", "yLabel")
                        .text((row) => (width < 500 && row.length > 40) ? row.slice(0, 40) + "..." : row);
                },
                    (update) => {
                        container.select(".yAxisContainer")
                            .selectAll('foreignObject')
                            .attr("width", `${width}px`)
                            .select(".yLabel")
                            .text((row) => (width < 500 && row.length > 40) ? row.slice(0, 40) + "..." : row);
                    })
            const values = data.map((d) => d[valKey]);
            const min = d3.min(values);
            const max = d3.max(values);

            // Build color scale
            const myColor = d3.scaleLinear()
                .range([minColor, maxColor])
                .domain([min, max]);

            // create a tooltip
            var tooltip = container.select(".tooltip")
                .style("height", `${tooltipHeight}px`)
                .style("width", `${tooltipWidth}px`);
            var tooltipArrow = container.select(".tooltipArrow");

            // Three function that change the tooltip when user hover / move / leave a cell
            var mouseover = function (e, d) {
                tooltip.style("display", "block")
                tooltipArrow.style("display", "block")
            };
            var mousemove = function (e, d) {
                const date = d[colKey];
                const [year, month] = date.split("-");
                const monthLabel = months[parseInt(month-1)];
                tooltip
                    .html(
                        `<div class="titleRow"><div class="date">${monthLabel} ${year}</div><div class="total">${d[valKey]} items</div></div>` +
                        `<div class="name">${d[rowKey]}</div>` +
                        `<div class="subTotalRow"><div class="date">Has planning</div><div class="total">${d["has_planning"]}</div></div>` +
                        `<div class="subTotalRow"><div class="date">Has tender</div><div class="total">${d["has_tender"]}</div></div>` +
                        `<div class="subTotalRow"><div class="date">Has awards</div><div class="total">${d["has_awards"]}</div></div>` +
                        `<div class="subTotalRow"><div class="date">Has contracts</div><div class="total">${d["has_contracts"]}</div></div>`
                    )
                    .style("left", () => {
                        const left = xBand(d.date) + margin - horizontalScrollContainerEl.scrollLeft;
                        console.log(width, left, tooltipWidth);
                        if (left + tooltipWidth + 16 > width)
                            return `${width - tooltipWidth - 16}px`;
                        else
                            return `${left}px`;
                    })
                    .style("top", (y(d[rowKey]) - tooltipHeight - 9 + titleHeight + labelHeight + xAxisHeight + margin + legendContainerHeight) + "px");

                tooltipArrow
                    .style("left", `${xBand(d.date) + 20 - horizontalScrollContainerEl.scrollLeft}px`)
                    .style("top", (y(d[rowKey]) + 5 + titleHeight + labelHeight + xAxisHeight + margin + legendContainerHeight) + "px");
            };
            var mouseleave = function (e, d) {
                tooltip.style("display", "none")
                tooltipArrow.style("display", "none")
            }

            plotArea.selectAll()
                .data(data)
                .join("rect")
                .attr("x", (d) => xBand(d.date))
                .attr("y", (d) => y(d[rowKey]))
                .attr("width", xBand.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    return myColor(d[valKey])
                })
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .exit().remove();

            addLegend(container, myColor, [min, max]);

            horizontalScrollContainerEl.scrollLeft = horizontalScrollContainerEl.scrollWidth;

            return () => console.log("cleanup function");
        },
        [width, data, rowKey, colKey, valKey]
    );

    const addLegend = (container, myColor, range) => {
        const swatchesContainer = container.select(".swatchesContainer");

        const legendVals = []
        for (let i = 0; i <= 4; i++) {
            legendVals.push({
                key: i,
                value: d3.scaleSequential().domain([0, 4]).range(range)(i),
            })
        }

        swatchesContainer.selectAll(".swatch")
            .data(legendVals)
            .join((enter) => {
                enter.append("div")
                    .attr("class", "swatch")
                    .style("background-color", function (d) {
                        return myColor(d.value)
                    })
                    .style("color", function (d) {
                        return isColorLight(myColor(d.value)) ? "#000" : "#fff"
                    })
                    .text(function (d) {
                        return Math.round(d.value)
                    })
            });
    }

    return (
        <div ref={ref} className="container">
            <ScrollSync>
                <>
                    <div className="stickyXAxisContainer">
                        <Typography component="h2" sx={{
                            fontSize: "15px",
                            fontWeight: "600",
                            paddingX: "12px"
                        }}>
                            {title}
                        </Typography>
                        <div className='chartLabel'>Number of procurement processes</div>
                        <div className="legend-container">
                            <span className='legendTitle'>Legend:</span>
                            <div className='swatchesContainer'></div>
                        </div>
                        <ScrollSyncPane>
                            <div className='horizontalScrollXAxisContainer'>
                                <svg>
                                    <rect className='background'></rect>
                                    <g className="x-axis top" />
                                </svg>
                            </div>
                        </ScrollSyncPane>
                    </div>
                    <ScrollSyncPane>
                        <div className="horizontalScrollContainer">
                            <svg className="main">
                                <g className="plot-area" />
                            </svg>
                        </div>
                    </ScrollSyncPane>
                </>
            </ScrollSync>
            <div className='yAxisContainer'>
                <svg>
                    <g className="y-axis" />
                </svg>
            </div>
            <div className="tooltip"></div>
            <div className="tooltipArrow" />
        </div>
    );
}
