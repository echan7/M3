/**
 * Copyright 2017 DataChat
 *	www.datachat.ai

 *	All rights reserved
 */

 (function (context, a3) {
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS
        module.exports = a3(require('d3'), require('crossfilter'));

    } else {
        if (typeof define === 'function' && define.amd){
            // RequireJS | AMD
            define(['d3'], ['crossfilter'], function (d3, crossfilter) {
                // publish a3 to the global namespace for backwards compatibility
                // and define it as an AMD module
                context.a3 = a3(d3, crossfilter);
                return context.a3;
            });
        } else {
            // No AMD, expect d3 to exist in the current context and publish
            // a3 to the global namespace
            if (!context.d3 || !context.crossfilter) {
                if (console && console.warn) {
                    if(!context.d3){
                        console.warn('a3 requires d3 to run.  Are you missing a reference to the d3 library?');
                    } else if(!context.crossfilter){
                        console.warn('a3 requires crossfilter to run. Are you missing a reference to crossfilter library?');
                    }
                } else {
                    if(!context.d3){
                        throw 'a3 requires d3 to run.  Are you missing a reference to the d3 library?';
                    } else if(!context.crossfilter){
                        throw 'a3 requires crossfilter to run. Are you missing a reference to crossfilter library?';
                    }
                }
            } else {
                context.a3 = a3(context.d3, context.crossfilter);
            }
        }
    }

}(this, function (d3, crossfilter) {
 'use strict';

 // Create a3 object for D3 based distribution chart system.
 var a3 ={
     version: '1.0.0',
     // Setting up the base of the chart
     setUp: null,
     plot: {}
 };
/*
 * General function to create distro dimension charts (box plot, notched box plot, violin plot, bean plot)
 * @param settings Configuration options for the base plot
 * @param settings.data The data for the plot
 * @param settings.xName The name of the column that should be used for the x groups
 * @param settings.yName The name of the column used for the y values
 * @param {string} settings.selector The selector node for the main chart div *TAKE NOTE THAT NODE IS NOT THE ONLY THING THAT PASS THROUGH SELECTOR IN THE FUTURE, CONSIDER ID AND CLASSES AS WELL AND FUNCTION
 * @param [settings.axisLabels={}] Defaults to the xName and yName
 * @param [settings.yTicks = 1] 1 = default ticks, 2 =  double, 0.5 = half *TAKE NOTE FOR FUTURE CHANGE
 * @param [settings.scale = 'linear'] 'linear' or 'log' - y scale of the chart
 * @param [settings.chartSize = {width:800, height:400}] The height and width of the chart itself (doesn't include the container)
 * @param [settings.margin = {top: 15, right: 40, bottom: 40, left: 50}] The margins around the chart (inside the main div)
 * @param [settings.constrainExtremes = false] Should the y scale include outliers?
 * @param [settings.colors = d3.scaleOrdinal(d3.schemeCategory10)] d3 color options = default, allows customized colors that accept function, array or object
 * @returns {object} chart A chart object
*/
 a3.plot.makeDistroChart = function(settings) {

    var chart = {
        settings: {},
        yFormatter: null,
        yScale: null,
        xScale: null,
        data: null,
        groupObjs:{}, //The data organized by grouping and sorted as well as any metadata for the groups
        objs: {},
        colorFunct: null,
        margin : {},
        svgWidth: null,
        svgHeight: null,
        width: null,
        height: null,
        xAxisLabel: null,
        yAxisLabel: null,
        range: {},
        selector: null
    };

    // Defaults
    chart.settings = {
        data: null,
        xName: null,
        yName: null,
        selector: null,
        axisLabels: {xAxis: null, yAxis: null},
        // *CURRENTLY DIFFERENT SYNTAX, TAKE NOTE TO ADJUST TICK SIZE IN THE FUTURE
        yTicks: 1,
        // *REMEMBER TO ADJUST TICK SIZE FOR XSCALE TOO
        // xTicks: 1,
        scale: 'linear',
        chartSize: {width: 800, height: 400},
        margin: {top: 15, right: 40, bottom: 40, left: 50},
        constrainExtremes: false,
        colors: d3.scaleOrdinal(d3.schemeCategory10)
    };
    for (var setting in settings) {
        chart.settings[setting] = settings[setting];
    }
    chart.data = chart.settings.data;

    chart.objs = {
        mainDiv: null,
        innerDiv: null,
        chartDiv: null,
        svg: null,
        g: null,
        axes: null,
        xAxis: null,
        yAxis: null,
        tooltip: null
    };


/*
    * Adds jitter to the  scatter point plot
    * @param doJitter true or false, add jitter to the point
    * @param width percent of the range band to cover with the jitter
    * @returns {number}
*/
    function addJitter(doJitter, width) {
        if (doJitter !== true || width == 0) {
            return 0
        }
        return Math.floor(Math.random() * width) - width / 2;
    }

/*
    * Clone an object as a copy, usually options object pass in as a param
    * *CONSIDER CLONING ARRAY, OBJECT OF TIME AND TREES IN THE FUTURE, SHOULD ALSO IMPLEMENT ERROR HANDLING
    * @param {object} obj
    * @return {object} copy
*/
    function clone(obj) {
        if (null == obj || 'object' != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

/*
    * Format numbers as float
    * @param {float} d
    * @returns {float} float formated number
*/
    function formatAsFloat(d) {
        if (d % 1 !== 0) {
            return d3.format('.2f')(d);
        } else {
            return d3.format('.0f')(d);
        }
    }

/*
    * Accept a function, array or object mapping and create a color function  from it
    * @param {function | [] | object} colorOptions
    * @returns {function} Function to determine chart color priority
*/
    function getColorFunct(colorOptions) {
        if(typeof colorOptions == 'function'){
            return colorOptions
        } else if (Array.isArray(colorOptions)){

            var colorMap = {}, currentColor = 0;
            for (var currentName in chart.groupObjs) {
                colorMap[currentName] = colorOptions[currentColor];
                currentColor = (currentColor + 1) % colorOptions.length;
            }
            return function (group){
                return colorMap[group];
            }
        } else if (typeof colorOptions == 'object') {

            return function (group) {
                return colorOptions[group];
            }
        } else {
            return d3.scaleOrdinal(d3.schemeCategory10);
        }
    }

/*
     * Takes a percentage as returns the values that correspond to that percentage of the group range witdh
     * @param objWidth Percentage of range band
     * @param gName The bin name to use to get the x shift
     * @returns {{left: null, right: null, middle: null}}
*/
    function getObjWidth(objWidth, gName) {
        var objSize = {left: null, right: null, middle: null};
        var width = chart.xScale.bandwidth() * (objWidth / 100);
        var padding = (chart.xScale.bandwidth() - width) / 2;
        var gShift = chart.xScale(gName);
        objSize.middle = chart.xScale.bandwidth() / 2 + gShift;
        objSize.left = padding + gShift;
        objSize.right = objSize.left + width;
        return objSize;
    }

/*
    * Format numbers as log
    * @param {float} d
    * @returns {float} log formatted number
*/
    function logFormatNumber(d) {
        var x = Math.log(d) / Math.log(10) + 1e-6;
        return Math.abs(x - Math.floor(x)) < 0.6 ? formatAsFloat(d) : '';
    }


/*
    * Creates tooltip for Box Charts *CURRENTLY HARD CODED FOR DISTRO CHARTS, TAKE NOTE FOR FUTURE CHANGE
    * @param groupName Name of x axis group
    * @param metrics Object to use to show the metrics value of the group
    * @returns {function} function that provides value for the tooltip
*/
    function tooltipHover (showOutlier, groupName, metrics, toolTipArray) {
        if(showOutlier === 'metrics'){
        var tooltipString = 'Group: ' + groupName;
        tooltipString += '<br\>Max: ' + formatAsFloat(metrics.max, 0.1);
        tooltipString += '<br\>Q3: ' + formatAsFloat(metrics.quartile3);
        tooltipString += '<br\>Median: ' + formatAsFloat(metrics.median);
        tooltipString += '<br\>Mean: ' + formatAsFloat(metrics.mean);
        tooltipString += '<br\>Q1: ' + formatAsFloat(metrics.quartile1);
        tooltipString += '<br\>Min: ' + formatAsFloat(metrics.min);
        } else {
        var tooltipString = '';
        for(var i =0; i < metrics.length; i++){
            tooltipString += '<br\>' + metrics[i] + ': ' + toolTipArray[i];
        }
        }
        return function() {
            chart.objs.tooltip.transition().duration(200).style('opacity', 0.9);
            chart.objs.tooltip.html(tooltipString);
        };
    }

/*
    * Update the chart based on the current settings and window size
    * @param
    * @returns {object} The updated chart object
*/
    chart.update = function () {
        // Update Chart size
        chart.width = parseInt(chart.objs.chartDiv.style('width'), 10) - (chart.margin.left + chart.margin.right);
        chart.height = parseInt(chart.objs.chartDiv.style('height'), 10) - (chart.margin.top + chart.margin.bottom);

        // Update Scale size
        chart.xScale.range([0, chart.width]);
        chart.yScale.range([chart.height, 0]);

        // Update axes
        chart.objs.g.select('.x.axis')
            .attr('transform', 'translate(0,' + chart.height + ')')
            .call(chart.objs.xAxis);
        chart.objs.g.select('.y.axis')
            .call(chart.objs.yAxis.tickSizeInner(-chart.width));
        chart.objs.g.select('.x.axis .label')
            .attr('x', chart.width / 2);
        chart.objs.g.select('.y.axis .label')
            .attr('x', -chart.height / 2);

        return chart;
    };


/*
    * Parse the data for calculating appropriate base values for all plots
    * General self-executed group function to group appropriate values in chart.groupObjs settings
    * Inner function for calculating different plot metrices
    * @param
    * @returns
*/
    (function prepareData(){
/*
        * Calculate Metrics for General Box Plot, Assumes values are sorted
        * @param [values] Sorted array of numbers
        * @returns {object} boxMetrics
*/
        function calcBoxMetrics(values){

            var boxMetrics = {
                max: null,
                upperOuterFence: null,
                upperInnerFence: null,
                // 75%-tile of the values
                quartile3: null,
                median: null,
                mean: null,
                // 25%-tile of the values
                quartile1: null,
                // InterQuartile Range
                iqr: null,
                lowerInnerFence: null,
                lowerOuterFence: null,
                min: null
            }

            boxMetrics.max = d3.max(values);
            boxMetrics.quartile3 = d3.quantile(values, 0.75);
            boxMetrics.median = d3.median(values);
            boxMetrics.mean = d3.mean(values);
            boxMetrics.quartile1 = d3.quantile(values, 0.25);
            boxMetrics.iqr = boxMetrics.quartile3 - boxMetrics.quartile1;
            boxMetrics.min = d3.min(values);

            // Adjust InnerFences to be the closest value to the IQR without going past InnerFence max range
            var LIF = boxMetrics.quartile1 - (1.5*boxMetrics.iqr);
            var UIF = boxMetrics.quartile3 + (1.5*boxMetrics.iqr);
            for(var i = 0; i < values.length; i++){
                if(values[i] < LIF){
                    continue;
                }
                if(!boxMetrics.lowerInnerFence && values[i] >= LIF){
                    boxMetrics.lowerInnerFence = values[i];
                    continue;
                }
                if(values[i] > UIF){
                    boxMetrics.upperInnerFence = values[i-1];
                    break;
                }
            }

            // Calculate max range of OuterFences
            boxMetrics.lowerOuterFence = boxMetrics.quartile1 - (3*boxMetrics.iqr);
            boxMetrics.upperOuterFence = boxMetrics.quartile3 + (3*boxMetrics.iqr);

            // If Inner Fences are not declared, none of the values outside of IQR are within InnerFences range
            // Set the InnerFences to the respective min and max of values
            if(!boxMetrics.lowerInnerFence) {
                boxMetrics.lowerInnerFence = boxMetrics.min;
            }
            if(!boxMetrics.upperInnerFence) {
                boxMetrics.upperInnerFence = boxMetrics.max;
            }

            return boxMetrics;
        }


        // General Grouping function to store grouped values in chart.groupObjs
        var currentX = null;
        var currentY = null;
        var currentRow;

        for(currentRow = 0; currentRow < chart.data.length; currentRow++){
            currentX = chart.data[currentRow][chart.settings.xName];
            currentY = chart.data[currentRow][chart.settings.yName];
            var tooltipNameArray = Object.keys(chart.data[currentRow]);
            var toolTipArray = [];
            for(var i =0; i < tooltipNameArray.length; i++){
                var currentToolTip = chart.data[currentRow][tooltipNameArray[i]];
                toolTipArray.push(currentToolTip);
            }

            if(chart.groupObjs.hasOwnProperty(currentX)){
                chart.groupObjs[currentX].values.push(currentY);
                chart.groupObjs[currentX][currentY] = {};
                chart.groupObjs[currentX][currentY].tooltipNameArray = tooltipNameArray;
                chart.groupObjs[currentX][currentY].toolTipArray = toolTipArray;
            } else {
                chart.groupObjs[currentX] = {};
                chart.groupObjs[currentX].values = [currentY];
                chart.groupObjs[currentX][currentY] = {};
                chart.groupObjs[currentX][currentY].tooltipNameArray = tooltipNameArray;
                chart.groupObjs[currentX][currentY].toolTipArray = toolTipArray;
            }
        }

        for(var currentName in chart.groupObjs){
            chart.groupObjs[currentName].values.sort(d3.ascending);
            chart.groupObjs[currentName].boxMetrics = {};
            chart.groupObjs[currentName].boxMetrics = calcBoxMetrics(chart.groupObjs[currentName].values);
        }

//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    console.log('Chart = ');
    console.log(chart);
//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })();

/*
    * Prepare all the settings for the chart
    * Set Chart settings based on user settings given
    * Create Axis Object for the chart using d3
    * @param
    * @returns
*/
    (function prepareSettings(){
        // Set chart base settings
        chart.margin = chart.settings.margin;
        chart.svgWidth = chart.settings.chartSize.width;
        chart.svgHeight = chart.settings.chartSize.height;
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

        if (chart.settings.scale === 'log') {
            chart.yScale = d3.scaleLog();
            chart.yFormatter = logFormatNumber;
        } else {
            chart.yScale = d3.scaleLinear();
            chart.yFormatter = formatAsFloat;
        }

        if (chart.settings.constrainExtremes === true) {
            var fences = [];
            for (var currentName in chart.groupObjs) {
                fences.push(chart.groupObjs[currentName].boxMetrics.lowerInnerFence);
                fences.push(chart.groupObjs[currentName].boxMetrics.upperInnerFence);
            }
            chart.range = d3.extent(fences);
        } else {
            chart.range = d3.extent(chart.data, function (d) {return d[chart.settings.yName];});
        }

//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    console.log('Chart Range = ')
    console.log(chart.range);
//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Build Scale Functions
        chart.yScale
            .range([chart.height, 0])
            .domain(chart.range)
            .nice()
            .clamp(true);


        // Default for X Axis Scale is Ordinal, *HARD CODED, TAKE NOTE FOR FUTURE
        chart.xScale = d3.scaleBand()
                            .domain(Object.keys(chart.groupObjs))
                            .range([0, chart.width]);


        // Build Axes Functions
        chart.objs.yAxis = d3.axisLeft()
                                .scale(chart.yScale)
                                //.tickFormat(chart.yFormatter)
                                .tickSizeOuter(0)
                                .tickSizeInner(-chart.width + (chart.margin.right + chart.margin.left));
        // ASSUME DATA TICKS WILL ALWAYS <= 10, FIGURE OUT A WAY TO GET DEFAULT TICK VALUES IN FUTURE
        chart.objs.yAxis.ticks(10 * chart.settings.yTicks);

        chart.objs.xAxis = d3.axisBottom()
                                .scale(chart.xScale)
                                .tickSize(5);
        // *REMEMBER TO ADJUST TICK SIZE FOR XSCALE TOO
                            //  .ticks(10 * charrt.settings.xTicks);
    })();

/*
    * Prepare Chart Html elements
    * @param
    * @returns
*/
    (function prepareChart() {
        // Build main div and chart div
        chart.objs.mainDiv = d3.select(chart.settings.selector)
                                .style('max-width', chart.svgWidth + 'px');
        // Add divs to make it centered and responsive
        chart.objs.innerDiv = chart.objs.mainDiv.append('div')
                                .attr('class', 'inner-wrapper');
        chart.objs.innerDiv
            .append('div').attr('class', 'outer-box')
            .append('div').attr('class', 'inner-box');

        // Capture the inner div for the chart (the real container for the chart)
        chart.selector = chart.objs.innerDiv.select('.inner-box');
        chart.objs.chartDiv = chart.selector;
        d3.select(window).on('resize.chartInnerBox', chart.update);

        // Create the svg
        chart.objs.svg = chart.objs.chartDiv.append('svg')
            .attr('class', 'chart-area')
            .attr('width', chart.svgWidth)
            .attr('height', chart.svgHeight);
        chart.objs.g = chart.objs.svg.append('g')
            .attr('transform', 'translate(' + (chart.margin.left + 20) + ',' + chart.margin.top + ')');

        // Create axes
        chart.objs.axes = chart.objs.g.append('g')
                            .attr('class', 'axes');

        chart.objs.axes.append('g')
            .attr('class', 'y axis')
            .call(chart.objs.yAxis)
            .append('text')
            .attr('class', 'label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -70)
            .attr('x', -chart.height / 2)
            .attr('dy', '.71em')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(chart.yAxisLabel.toUpperCase());

        chart.objs.axes.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + chart.height + ')')
            .call(chart.objs.xAxis)
            .append('text')
            .attr('class', 'label')
            .attr('x', chart.width / 2)
            .attr('y', 35)
            .attr('dx', '.25em')
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(chart.xAxisLabel.toUpperCase());

        // Create tooltip div
        chart.objs.tooltip = chart.objs.mainDiv.append('div').attr('class', 'tooltip');
        for(var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].g = chart.objs.g.append('g')
                                                .attr('class', 'group');
       /*     chart.groupObjs[currentName].g.on('mouseover', function a() {
                                                            chart.objs.tooltip
                                                                .style('display', null)
                                                                .style('left', (d3.event.pageX) + 'px')
                                                                .style('top', (d3.event.pageY - 28) + 'px');
                                                            })
                                          .on('mouseout', function b() {
                                                            chart.objs.tooltip.style('display', 'none');
                                                            })
                                          .on('mousemove', tooltipHover('metrics', currentName, chart.groupObjs[currentName].boxMetrics)); */
        }

        // Update the chart on its size
        chart.update();
    })();

/*
    * Render a box plot on the current chart
    * @param options
    * @param [options.show=true] Toggle the whole plot on and off
    * @param [options.showBox=true] Show the box part of the box plot
    * @param [options.showWhiskers=true] Show the whiskers
    * @param [options.showMedian=true] Show the median line
    * @param [options.showMean=false] Show the mean line
    * @param [options.medianCSize=3] The size of the circle on the median
    * @param [options.showOutliers=true] Show any value that lies more than one and a half times the length of the iqr
    * @param [options.boxWidth=30] The max percent of the group rangeBand that the box can be
    * @param [options.lineWidth=boxWidth] The max percent of the group rangeBand that the line can be
    * @param [options.outlierScatter=false] Spread out the outliers so they don't all overlap (in development)
    * @param [options.outlierCSize=2] Size of the outliers
    * @param [options.colors=chart default] The color mapping for the box plot
    * @returns {*} The chart object
*/
    chart.renderBoxPlot = function (options) {
        chart.boxPlots = {};

        // Default options
        var defaultOptions = {
            show: true,
            showBox: true,
            showWhiskers: true,
            showMedian: true,
            showMean: false,
            medianCSize: 3.5,
            meanCSize: 3.5,
            showOutliers: true,
            boxWidth: 30,
            lineWidth: null,
            scatterOutliers: true,
            outlierCSize: 2.5,
            extremeCSize: 2.5,
            colors: chart.colorFunct
        };
        chart.boxPlots.options = clone(defaultOptions);
        for (var option in options){
            chart.boxPlots.options[option] = options[option];
        }
        var boxOptions = chart.boxPlots.options;

        // Create Plot Objects for each ticks of xAxis
        for (var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].boxPlot = {};
            chart.groupObjs[currentName].boxPlot.objs = {};
        }

/*
        * Function to calculates all extreme and outlier points for each group
        * Strore them in group as arrays
        * Extremes are > 3 times iqr on both ends of the box
        * Outliers are > 1.5 times iqr on both ends of the box
*/
        var calcAllOutliers = (function() {
/*
            * Create array of extremes and outliers and store the values in current group in place
            * @param {object} currentGroup of xaxis
            * @return
*/
            function calcOutliers(currentGroup) {
                var currentExtremes = [];
                var currentOutliers = [];
                var currentOut, index;
                for(index = 0; index < currentGroup.values.length; index++) {
                    currentOut = {value: currentGroup.values[index], tooltipNameArray: currentGroup[currentGroup.values[index]]["tooltipNameArray"], toolTipArray: currentGroup[currentGroup.values[index]]["toolTipArray"]};

                    if(currentOut.value < currentGroup.boxMetrics.lowerInnerFence) {
                        if(currentOut.value < currentGroup.boxMetrics.lowerOuterFence) {
                            currentExtremes.push(currentOut);
                        } else {
                            currentOutliers.push(currentOut);
                        }
                    } else if(currentOut.value > currentGroup.boxMetrics.upperInnerFence) {
                        if(currentOut.value > currentGroup.boxMetrics.upperOuterFence) {
                            currentExtremes.push(currentOut);
                        } else {
                            currentOutliers.push(currentOut);
                        }
                    }
                }
                currentGroup.boxPlot.objs.outliers = currentOutliers;
                currentGroup.boxPlot.objs.extremes = currentExtremes;
            }

            for (var currentName in chart.groupObjs) {
                calcOutliers(chart.groupObjs[currentName]);
            }

        })();

/*
        * Take a new set of option and redraw boxPlot
        * @param {object} updateOptions
        * @return
*/
        chart.boxPlots.change = function (updateOptions) {
            if (updateOptions) {
                for (var option in updateOptions) {
                    boxOptions[option] = updateOptions[option];
                }
            }

            for (var currentName in chart.groupObjs) {
                chart.groupObjs[currentName].boxPlot.objs.g.remove();
            }
            chart.boxPlots.prepareBoxPlot();
            chart.boxPlots.update();
        }

/*
        * Set boxPlot show option to false
        * @param
        * @return
*/
        chart.boxPlots.hide = function (opts) {
            if (opts !== undefined) {
                opts.show = false;
                if (opts.reset) {
                    chart.boxPlots.reset()
                }
            } else {
                opts = {show: false};
            }
            chart.boxPlots.change(opts)
        };

/*
        * Create svg elements for the box plot
        * @param
        * @return
*/
        chart.boxPlots.prepareBoxPlot = function() {
            var currentName, currentBox;

            if(boxOptions.colors) {
                chart.boxPlots.color = getColorFunct(boxOptions.colors);
            } else {
                chart.boxPlots.color = chart.colorFunct;
            }

            if(boxOptions.show == false) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentBox = chart.groupObjs[currentName].boxPlot;

                currentBox.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'box-plot');

                // Box
                if (boxOptions.showBox) {
                    currentBox.objs.box = currentBox.objs.g.append('rect')
                        .attr('class', 'box')
                        .style('fill', chart.boxPlots.color(currentName))
                        // Stroke around box is hidden by default but can be shown through css with stroke-width
                        .style('stroke', chart.boxPlots.color(currentName));
                }

                // Median
                if (boxOptions.showMedian) {
                    currentBox.objs.median = {
                        line: null,
                        circle: null
                    };
                    currentBox.objs.median.line = currentBox.objs.g.append('line')
                        .attr('class', 'median');
                    currentBox.objs.median.circle = currentBox.objs.g.append('circle')
                        .attr('class', 'median')
                        .attr('r', boxOptions.medianCSize)
                        .style('fill', chart.boxPlots.color(currentName));
                }

                // Mean
                if (boxOptions.showMean) {
                    currentBox.objs.mean = {
                        line: null,
                        circle: null
                    };
                    currentBox.objs.mean.line = currentBox.objs.g.append('line')
                        .attr('class', 'mean');
                    currentBox.objs.mean.circle = currentBox.objs.g.append('circle')
                        .attr('class', 'mean')
                        .attr('r', boxOptions.meanCSize)
                        .style('fill', chart.boxPlots.color(currentName));
                }

                // Whiskers
                if (boxOptions.showWhiskers) {
                    currentBox.objs.upperWhisker = {
                        fence: null,
                        line: null
                    };
                    currentBox.objs.lowerWhisker = {
                        fence: null,
                        line: null
                    };
                    currentBox.objs.upperWhisker.fence = currentBox.objs.g.append('line')
                        .attr('class', 'upper whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                    currentBox.objs.upperWhisker.line = currentBox.objs.g.append('line')
                        .attr('class', 'upper whisker')
                        .style('stroke', chart.boxPlots.color(currentName));

                    currentBox.objs.lowerWhisker.fence = currentBox.objs.g.append('line')
                        .attr('class', 'lower whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                    currentBox.objs.lowerWhisker.line = currentBox.objs.g.append('line')
                        .attr('class', 'lower whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                }

                // Outliers and Extremes
                if (boxOptions.showOutliers) {
                    if(!currentBox.objs.outliers) calcAllOutliers();
                    var currentPoint;
                    if(currentBox.objs.outliers.length) {
                        var outSvg = currentBox.objs.g.append('g').attr('class', 'boxplot outliers');
                        for(currentPoint in currentBox.objs.outliers) {
                            currentBox.objs.outliers[currentPoint].point = outSvg.append('circle')
                                .attr('class', 'outlier')
                                .attr('r', boxOptions.outlierCSize)
                                .style('fill', chart.boxPlots.color(currentName));

                            currentBox.objs.outliers[currentPoint].point.on('mouseover', function a() {
                                                            chart.objs.tooltip
                                                                .style('display', null)
                                                                .style('left', (d3.event.pageX) + 'px')
                                                                .style('top', (d3.event.pageY - 28) + 'px');
                                                            })
                                          .on('mouseout', function b() {
                                                            chart.objs.tooltip.style('display', 'none');
                                                            })
                                          .on('mousemove', tooltipHover('outlier', currentName, currentBox.objs.outliers[currentPoint].tooltipNameArray, currentBox.objs.outliers[currentPoint].toolTipArray));
                        }
                    }

                    if(currentBox.objs.extremes.length) {
                        var extSvg = currentBox.objs.g.append('g').attr('class', 'boxplot extremes');
                        for(currentPoint in currentBox.objs.extremes) {
                            currentBox.objs.extremes[currentPoint].point = extSvg.append('circle')
                                .attr('class', 'extreme')
                                .attr('r', boxOptions.extremeCSize)
                                .style('stroke', chart.boxPlots.color(currentName));

                            currentBox.objs.extremes[currentPoint].point.on('mouseover', function a() {
                                                            chart.objs.tooltip
                                                                .style('display', null)
                                                                .style('left', (d3.event.pageX) + 'px')
                                                                .style('top', (d3.event.pageY - 28) + 'px');
                                                            })
                                          .on('mouseout', function b() {
                                                            chart.objs.tooltip.style('display', 'none');
                                                            })
                                          .on('mousemove', tooltipHover('outlier', currentName, currentBox.objs.extremes[currentPoint].tooltipNameArray, currentBox.objs.extremes[currentPoint].toolTipArray));
                        }
                    }
                }
            }
        }


/*
        * Reset the boxPlot to default option
        * @param
        * @return
*/
        chart.boxPlots.reset = function () {
            chart.boxPlots.change(defaultOptions)
        };

/*
        * Set boxPlot show option to true
        * @param
        * @return
*/
        chart.boxPlots.show = function (opts) {
            if (opts !== undefined) {
                opts.show = true;
                if (opts.reset) {
                    chart.boxPlots.reset()
                }
            } else {
                opts = {show: true};
            }
            chart.boxPlots.change(opts)

        };


/*
        * Generate the Values of each box object and draw it
        * Update it together as well when called upon
        * @param
        * @return
*/
        chart.boxPlots.update = function() {
            var currentName, currentBox;

            for(currentName in chart.groupObjs) {
                currentBox = chart.groupObjs[currentName].boxPlot;

                // Get Box Width
                var objBounds = getObjWidth(boxOptions.boxWidth, currentName);
                var width = (objBounds.right - objBounds.left);

                var scaledBoxMetrics = {};
                for(var attr in chart.groupObjs[currentName].boxMetrics) {
                    scaledBoxMetrics[attr] = null;
                    scaledBoxMetrics[attr] = chart.yScale(chart.groupObjs[currentName].boxMetrics[attr]);
                }

                // Box
                if (currentBox.objs.box) {
                    currentBox.objs.box
                        .attr('x', objBounds.left)
                        .attr('width', width)
                        .attr('y', scaledBoxMetrics.quartile3)
                        .attr('rx', 1)
                        .attr('ry', 1)
                        .attr('height', -scaledBoxMetrics.quartile3 + scaledBoxMetrics.quartile1);

                    currentBox.objs.box.on('mouseover', function a() {
                                                            chart.objs.tooltip
                                                                .style('display', null)
                                                                .style('left', (d3.event.pageX) + 'px')
                                                                .style('top', (d3.event.pageY - 28) + 'px');
                                                            })
                                          .on('mouseout', function b() {
                                                            chart.objs.tooltip.style('display', 'none');
                                                            })
                                          .on('mousemove', tooltipHover('metrics', currentName, chart.groupObjs[currentName].boxMetrics));

                }

                // Lines
                var lineBounds = null;
                if(boxOptions.lineWidth) {
                    lineBounds = getObjWidth(boxOptions.lineWidth, currentName);
                } else {
                    lineBounds = objBounds;
                }

                // Whiskers
                if (currentBox.objs.upperWhisker) {
                    currentBox.objs.upperWhisker.fence
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.upperInnerFence)
                        .attr('y2', scaledBoxMetrics.upperInnerFence);

                    currentBox.objs.upperWhisker.line
                        .attr('x1', lineBounds.middle)
                        .attr('x2', lineBounds.middle)
                        .attr('y1', scaledBoxMetrics.quartile3)
                        .attr('y2', scaledBoxMetrics.upperInnerFence);

                    currentBox.objs.lowerWhisker.fence
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.lowerInnerFence)
                        .attr('y2', scaledBoxMetrics.lowerInnerFence);

                    currentBox.objs.lowerWhisker.line
                        .attr('x1', lineBounds.middle)
                        .attr('x2', lineBounds.middle)
                        .attr('y1', scaledBoxMetrics.quartile1)
                        .attr('y2', scaledBoxMetrics.lowerInnerFence);
                }

                // Median
                if (currentBox.objs.median) {
                    currentBox.objs.median.line
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.median)
                        .attr('y2', scaledBoxMetrics.median);
                    currentBox.objs.median.circle
                        .attr('cx', lineBounds.middle)
                        .attr('cy', scaledBoxMetrics.median);
                }

                // Mean
                if (currentBox.objs.mean) {
                    currentBox.objs.mean.line
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.mean)
                        .attr('y2', scaledBoxMetrics.mean);
                    currentBox.objs.mean.circle
                        .attr('cx', lineBounds.middle)
                        .attr('cy', scaledBoxMetrics.mean);
                }

                // Outliers
                var currentPoint;
                if(currentBox.objs.outliers && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.outliers) {
                        currentBox.objs.outliers[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.outliers[currentPoint].value));
                    }
                }

                // Extremes
                if(currentBox.objs.extremes && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.extremes) {
                        currentBox.objs.extremes[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.extremes[currentPoint].value));
                    }
                }
            }
        };


 chart.boxPlots.prepareBoxPlot();
        d3.select(window).on('resize.boxPlot', chart.boxPlots.update);
        chart.boxPlots.update();

        return chart;

    };

/*
    * Render a violin plot on the current chart
    * @param options
    * @param [options.showViolinPlot=true] True or False, show the violin plot
    * @param [options.resolution=100 default]
    * @param [options.bandWidth=10 default] May need higher bandWidth for larger data sets
    * @param [options.width=50] The max percent of the group rangeBand that the violin can be
    * @param [options.interpolation=''] How to render the violin
    * @param [options.clamp=0 default]
    *   0 = keep data within chart min and max, clamp once data = 0. May extend beyond data set min and max
    *   1 = clamp at min and max of data set. Possibly no tails
    *  -1 = extend chart axis to make room for data to interpolate to 0. May extend axis and data set min and max
    * @param [options.colors=chart default] The color mapping for the violin plot
    * @returns {*} The chart object
*/
    chart.renderViolinPlot = function (options) {
        chart.violinPlots = {};

        // Default options
        var defaultOptions = {
            show: true,
            showViolinPlot: true,
            resolution: 100,
            bandWidth: 20,
            width: 50,
            interpolation: d3.curveCardinal,
            clamp: 0,
            colors: chart.colorFunct,
            _yDomainVP: null // If the Violin plot is set to close all violin plots, it may need to extend the domain, that extended domain is stored here
        };
        chart.violinPlots.options = clone(defaultOptions);
        for(var option in options) {
            chart.violinPlots.options[option] = options[option];
        }
        var violinOptions = chart.violinPlots.options;

        // Create Plot Objects for each ticks of xAxis
        for (var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].violin = {};
            chart.groupObjs[currentName].violin.objs = {};
        }


/*
        * Take a new set of option and redraw violin
        * @param {object} updateOptions
        * @return
*/
        chart.violinPlots.change = function (updateOptions) {
            if (updateOptions) {
                for (var option in updateOptions) {
                    violinOptions[option] = updateOptions[option];
                }
            }

            for (var currentName in chart.groupObjs) {
                chart.groupObjs[currentName].violin.objs.g.remove();
            }

            chart.violinPlots.prepareViolin();
            chart.violinPlots.update();
        }

/*
        * Epanechnikov function as a kernel function optimal in mean square error sense
        * CONSIDER OTHER KERNEL FUNCTIONS IN THE FUTURE: UNIFORM, TRIANGULAR, BIWEIGHT, TRIWEIGHT, NORMAL, ETC
        * @param {Float} scale
        * @return {function} function to do the calculation
*/
        function eKernel(scale) {
            return function (u) {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        }

/*
        * Sample kernelDensityEstimator test function
        * Used to find the roots for adjusting violin axis
        * Given an array, find the value for a single point, even if it is not in the domain
        * @param {function} kernel, {array} array
        * @return {float} mean of all kernel function return values
*/
        function eKernelTest(kernel, array) {
            return function (testX) {
                return d3.mean(array, function (v) {return kernel(testX - v);})
            }
        }

/*
        * Set violin show option to false
        * @param
        * @return
*/
        chart.violinPlots.hide = function (opts) {
            if (opts !== undefined) {
                opts.show = false;
                if (opts.reset) {
                    chart.violinPlots.reset()
                }
            } else {
                opts = {show: false};
            }
            chart.violinPlots.change(opts);

        };

/*
        * Kernel Density Estimator function is a non-parametric way to estimate the probability density function of a set of random variable
        * Uses a range of kernel functions over a smoothing parameter from chart.violinPlots.option.bandWidth
        * @param {function} kernel, {array} array of values
        * @return {array} Array of objects with elements x: orignal value from array y: mean of all kernel function return values
*/
        function kernelDensityEstimator(kernel, array) {
            return function (sample) {
                return array.map(function (val) {
                    return {x:val, y:d3.mean(sample, function (v) {return kernel(val - v);})};
                });
            };
        }

/*
        * Create svg elements for the violin plot
        * @param
        * @return
*/
        chart.violinPlots.prepareViolin = function() {
            var currentName, currentViolin;

            if(violinOptions.colors) {
                chart.violinPlots.color = getColorFunct(violinOptions.colors);
            } else {
                chart.violinPlots.color = chart.colorFunct;
            }

            if(violinOptions.show == false) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;
                currentViolin.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'violin-plot');
                currentViolin.objs.left = {
                    area: null,
                    line: null,
                    g: currentViolin.objs.g.append('g')
                };
                currentViolin.objs.right = {
                    area: null,
                    line: null,
                    g: currentViolin.objs.g.append('g')
                };

                if(violinOptions.showViolinPlot !== false) {
                    // Area
                    currentViolin.objs.left.area = currentViolin.objs.left.g.append('path')
                        .attr('class', 'area')
                        .style('fill', chart.violinPlots.color(currentName));

                    currentViolin.objs.right.area = currentViolin.objs.right.g.append('path')
                        .attr('class', 'area')
                        .style('fill', chart.violinPlots.color(currentName));

                    // Stroke Around Area (Lines)
                    currentViolin.objs.left.line = currentViolin.objs.left.g.append('path')
                        .attr('class', 'line')
                        .style('fill', 'none')
                        .style('stroke', chart.violinPlots.color(currentName));

                    currentViolin.objs.right.line = currentViolin.objs.right.g.append('path')
                        .attr('class', 'line')
                        .style('fill', 'none')
                        .style('stroke', chart.violinPlots.color(currentName));
                }
            }
        };

/*
        * Reset the violin to default option
        * @param
        * @return
*/
        chart.violinPlots.reset = function() {
            chart.violinPlots.change(defaultOptions);
        }

/*
        * Set violin show option to true
        * @param
        * @return
*/
        chart.violinPlots.show = function (opts) {
            if (opts !== undefined) {
                opts.show = true;
                if (opts.reset) {
                    chart.violinPlots.reset()
                }
            } else {
                opts = {show: true};
            }
            chart.violinPlots.change(opts);

        };

/*
        * Generate the Values of each violin object distribution
        * Update it together as well when called upon
        * @param
        * @return
*/
        chart.violinPlots.update = function() {
            var currentName, currentViolin;

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;

                // Build the line chart sideways to make a violin over the current distribution
                // Hence, use the current yScale for vioin xViolinScale
                var xViolinScale = chart.yScale.copy();

                // Initialize Kernel Density Estimator Function
                currentViolin.kde = kernelDensityEstimator(eKernel(violinOptions.bandWidth), xViolinScale.ticks(violinOptions.resolution));
                currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].values);

                // Initialize interpolation to min and max of the metrices
                var interpolateMax = chart.groupObjs[currentName].boxMetrics.max;
                var interpolateMin = chart.groupObjs[currentName].boxMetrics.min;

                if (violinOptions.clamp == 0 || violinOptions.clamp == -1) {
                    // When clamp is 0, calculate the min and max that is needed to bring the violin plot to a point
                    // interpolateMax = the Minimum value greater than the max where y = 0
                    interpolateMax = d3.min(currentViolin.kdeData.filter(function (d) {
                        return (d.x > chart.groupObjs[currentName].boxMetrics.max && d.y == 0)
                    }), function (d) {
                        return d.x;
                    });
                    // interpolateMin = the Maximum value less than the min where y = 0
                    interpolateMin = d3.max(currentViolin.kdeData.filter(function (d) {
                        return (d.x < chart.groupObjs[currentName].boxMetrics.min && d.y == 0)
                    }), function (d) {
                        return d.x;
                    });

                    // If clamp is -1 we need to extend the axises so that the violins come to a point
                    if (violinOptions.clamp == -1){
                        var kdeTester = eKernelTest(eKernel(violinOptions.bandWidth), chart.groupObjs[currentName].values);
                        if (!interpolateMax) {
                            var interMaxY = kdeTester(chart.groupObjs[currentName].boxMetrics.max);
                            var interMaxX = chart.groupObjs[currentName].boxMetrics.max;
                            var count = 25; // Arbitrary limit to make sure we don't get an infinite loop
                            while (count > 0 && interMaxY != 0) {
                                interMaxY = kdeTester(interMaxX);
                                interMaxX += 1;
                                count -= 1;
                            }
                            interpolateMax = interMaxX;
                        }
                        if (!interpolateMin) {
                            var interMinY = kdeTester(chart.groupObjs[currentName].boxMetrics.min);
                            var interMinX = chart.groupObjs[currentName].boxMetrics.min;
                            var count = 25;  // Arbitrary limit to make sure we don't get an infinite loop
                            while (count > 0 && interMinY != 0) {
                                interMinY = kdeTester(interMinX);
                                interMinX -= 1;
                                count -= 1;
                            }
                            interpolateMin = interMinX;
                        }
                    }

                    // Check to see if the new values are outside the existing chart range
                    // If exist, they are assign to the master _yDomainVP
                    if (!violinOptions._yDomainVP) violinOptions._yDomainVP = chart.range.slice(0);
                    if (interpolateMin && interpolateMin < violinOptions._yDomainVP[0]) {
                        violinOptions._yDomainVP[0] = interpolateMin;
                    }
                    if (interpolateMax && interpolateMax > violinOptions._yDomainVP[1]) {
                        violinOptions._yDomainVP[1] = interpolateMax;
                    }
                }

                if (violinOptions.showViolinPlot) {
                    chart.update();
                    xViolinScale = chart.yScale.copy();

                    // Recalculate KDE as xViolinScale Changed
                    currentViolin.kde = kernelDensityEstimator(eKernel(violinOptions.bandWidth), xViolinScale.ticks(violinOptions.resolution));
                    currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].values);
                }

                currentViolin.kdeData = currentViolin.kdeData
                                            .filter(function (d) {
                                                return (!interpolateMin || d.x >= interpolateMin)
                                            })
                                            .filter(function (d) {
                                                return (!interpolateMax || d.x <= interpolateMax)
                                            });
            }

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;

                // Get the Violin object width
                var objBounds = getObjWidth(violinOptions.width, currentName);
                var width = (objBounds.right - objBounds.left) / 2;

                var yViolinScale = d3.scaleLinear()
                                    .range([width, 0])
                                    .domain([0, d3.max(currentViolin.kdeData, function(d) {return d.y;})])
                                    .clamp(true);
                var area = d3.area()
                            .curve(violinOptions.interpolation)
                            .x(function (d) {return xViolinScale(d.x);})
                            .y0(width)
                            .y1(function (d) {return yViolinScale(d.y);});

                var line = d3.line()
                            .curve(violinOptions.interpolation)
                            .x(function (d) {return xViolinScale(d.x);})
                            .y(function (d) {return yViolinScale(d.y);});


                if (currentViolin.objs.left.area) {
                    currentViolin.objs.left.area
                        .datum(currentViolin.kdeData)
                        .attr('d', area);

                    currentViolin.objs.left.line
                        .datum(currentViolin.kdeData)
                        .attr('d', line);

                    currentViolin.objs.right.area
                        .datum(currentViolin.kdeData)
                        .attr('d', area);

                    currentViolin.objs.right.line
                        .datum(currentViolin.kdeData)
                        .attr('d', line);

                }

                // Rotate Violins
                currentViolin.objs.left.g.attr('transform', 'rotate(90,0,0)   translate(0,-' + objBounds.left + ')  scale(1,-1)');
                currentViolin.objs.right.g.attr('transform', 'rotate(90,0,0)  translate(0,-' + objBounds.right + ')');
            }
        };

 	chart.violinPlots.prepareViolin();
        d3.select(window).on('resize.violinPlot', chart.violinPlots.update);
        chart.violinPlots.update();

        return chart;
    };

    return chart;
 }

return a3;
}));
// End a3
