    /**
     * Prepare all settings for the chart base on user preference or default
     * Mainly dealing with axis object
     * @return
     */
    (function prepareSettings(){
        // Set chart base settings
        chart.margin = chart.settings.margin;
        chart.axisMargin = chart.settings.axisMargin;
        chart.svgWidth = chart.settings.chartSize.width + chart.axisMargin;
        chart.svgHeight = chart.settings.chartSize.height + chart.axisMargin;
        chart.width = chart.settings.chartSize.width - chart.margin.left - chart.margin.right;
        chart.height = chart.settings.chartSize.height - chart.margin.top - chart.margin.bottom;
        chart.colorFunct = getColorFunct(chart.settings.colors);

        if(chart.settings.axisLabels.xAxis || chart.settings.axisLabels.yAxis){
            chart.xAxisLabel = chart.settings.axisLabels.xAxis;
            chart.yAxisLabel = chart.settings.axisLabels.yAxis;
        } else {
            chart.xAxisLabel = chart.settings.xName;
            chart.yAxisLabel = chart.settings.yName;
        }

        // TAKE NOTE LOG SCALE CAN NEVER HAVE NEGATIVE TO POSITIVE RANGE THROUGH 0 FOR THE DOMAIN
        if (chart.settings.axisScale.yAxis === 'log') {
            chart.yScale = d3.scaleLog();
            chart.yScale.scale = chart.settings.axisScale.yAxis;
            chart.yFormatter = logFormatNumber;
            chart.yRange = d3.extent(chart.data, function (d) {return d[chart.settings.yName];});
        } else if (chart.settings.axisScale.yAxis === 'ordinal') {
            chart.yScale = d3.scaleBand();
            chart.yScale.scale = chart.settings.axisScale.yAxis;
            chart.yRange = chart.data.map(function (d) {return d[chart.settings.yName];})
                                    .filter(function(item, index, array) {return array.indexOf(item) == index});
            chart.yRange = padDataAndSort(chart.yRange);
        } else if (chart.settings.axisScale.yAxis === 'linear') {
            chart.yScale = d3.scaleLinear();
            chart.yScale.scale = chart.settings.axisScale.yAxis;
            chart.yFormatter = formatAsFloat;
            chart.yRange = d3.extent(chart.data, function (d) {return d[chart.settings.yName];});

        }

        // TAKE NOTE LOG SCALE CAN NEVER HAVE NEGATIVE TO POSITIVE RANGE THROUGH 0 FOR THE DOMAIN
        if (chart.settings.axisScale.xAxis === 'log') {
            chart.xScale = d3.scaleLog();
            chart.xScale.scale = chart.settings.axisScale.xAxis;
            chart.xFormatter = logFormatNumber;
            chart.xRange = d3.extent(chart.data, function (d) {return d[chart.settings.xName];});
        } else if (chart.settings.axisScale.xAxis === 'ordinal') {
            chart.xScale = d3.scaleBand();
            chart.xScale.scale = chart.settings.axisScale.xAxis;
            chart.xRange = Object.keys(chart.groupObjs);
            chart.xRange = padDataAndSort(chart.xRange);
        } else if (chart.settings.axisScale.xAxis === 'linear') {
            chart.xScale = d3.scaleLinear();
            chart.xScale.scale = chart.settings.axisScale.xAxis;
            chart.xFormatter = formatAsFloat;
            chart.xRange = d3.extent(chart.data, function (d) {return d[chart.settings.xName];});
        }

    // NOTE FOR FUTURE, IF USER REALLY WANT TO CONSTRAINT EXTREMES, TRANSPORT THIS TO NEW FILE UNDER prepareBoxSettings.js IN SETTINGS OF RENDERBOX
     /* if (chart.settings.constrainExtremes === true) {
            var fences = [];
            for (var currentName in chart.groupObjs) {
                fences.push(chart.groupObjs[currentName].boxMetrics.lowerInnerFence);
                fences.push(chart.groupObjs[currentName].boxMetrics.upperInnerFence);
            }
            chart.range = d3.extent(fences);
        } else {
            chart.range = d3.extent(chart.data, function (d) {return d[chart.settings.yName];});
        } */

//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    console.log('Chart Range = ')
    console.log(chart.yRange);
//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Build Scale Functions
        // TAKE NOTE LOG SCALE CAN NEVER HAVE NEGATIVE TO POSITIVE RANGE THROUGH 0 FOR THE DOMAIN
        chart.yScale
            .range([chart.height, 0])
            .domain(chart.yRange);
        if(chart.settings.axisScale.yAxis === 'log' || chart.settings.axisScale.yAxis === 'linear') {
            chart.yScale
                .nice()
                .clamp(true);
        }


        // TAKE NOTE LOG SCALE CAN NEVER HAVE NEGATIVE TO POSITIVE RANGE THROUGH 0 FOR THE DOMAIN
        chart.xScale
            .range([0, chart.width])
            .domain(chart.xRange);
        if(chart.settings.axisScale.xAxis === 'log' || chart.settings.axisScale.xAxis === 'linear') {
            chart.xScale
                .nice()
                .clamp(true);
        }


        // Build Axes Functions
        chart.objs.yAxis = d3.axisLeft()
                                .scale(chart.yScale)
                                .tickFormat(chart.yFormatter)
                                .tickSize(5)
                                .tickSizeOuter(0)
                                .tickSizeInner(-chart.width)
                                .ticks(10 * chart.settings.yTicks);

        chart.objs.xAxis = d3.axisBottom()
                                .scale(chart.xScale)
                                .tickFormat(chart.xFormatter)
                                .tickSize(5)
                                .tickSizeOuter(0)
                                .ticks(10 * chart.settings.xTicks);


    })();
