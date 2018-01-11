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
     version: '1.0.2',
     // Setting up the base of the chart
     plot: {}
 };


 a3.plot.graph = function(settings) {
    var chart = {
        settings: {},
        data: null,
        groupObjs:{}, //The data organized by grouping and sorted as well as any metadata for the groups
        svgWidth: null,
        svgHeight: null,
        width: null,
        height: null,
        selector: null
    }

    // Defaults
    chart.settings = {
        data: null,
        selector: null,
        chartSize: {width: 800, height: 400},
        margin: {top: 20, right: 50, bottom: 20, left: 10},
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

    // Set chart base settings
    chart.margin = chart.settings.margin;
    chart.svgWidth = chart.settings.chartSize.width;
    chart.svgHeight = chart.settings.chartSize.height;
    chart.width = chart.settings.chartSize.width - chart.margin.left - chart.margin.right;
    chart.height = chart.settings.chartSize.height - chart.margin.top - chart.margin.bottom;

    // Build main div and chart div
    chart.objs.mainDiv = d3.select(chart.settings.selector)
                            .attr('class', 'chart-wrapper')
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

// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 //   d3.select(window).on('resize.chartInnerBox', chart.update);
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Create the svg
    chart.objs.svg = chart.objs.chartDiv.append('svg')
        .attr('class', 'chart-area')
        .attr('width', chart.svgWidth)
        .attr('height', chart.svgHeight);

    var color = d3.scaleOrdinal(d3.schemeCategory20);



    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(chart.svgWidth / 2, (chart.svgHeight + 60) / 2));

//    d3.json(chart.data, function(graph) {
      var link = chart.objs.svg.append("g")
          .attr("class", "links")
        .selectAll("line")
        .data(chart.data.links)
        .enter().append("line")
          .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = chart.objs.svg.append("g")
          .attr("class", "nodes")
        .selectAll("circle")
        .data(chart.data.nodes)
        .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function(d) { return color(d.group); })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

      node.append("title")
          .text(function(d) {
                    var keys = Object.keys(d);
                    var str = keys[0] + ': ' + d[keys[0]];
                    for(var i = 1; i < keys.length; i++) {
                        str = str + '\n' + keys[i] + ': ' + d[keys[i]];
                    }
                    return str;
                });

      link.append("title")
          .text(function(d) {
                    var keys = Object.keys(d);
                    var str = keys[0] + ': ' + d[keys[0]];
                    for(var i = 1; i < keys.length; i++) {
                        str = str + '\n' + keys[i] + ': ' + d[keys[i]];
                    }
                    return str;
                });

      simulation
          .nodes(chart.data.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(chart.data.links);

      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }
  //  });

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return chart;

 }


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
 a3.plot.setUp = function(settings) {

    var chart = {
        settings: {},
        yFormatter: null,
        yScale: null,
        xFormatter: null,
        xScale: null,
        data: null,
        groupObjs:{}, //The data organized by grouping and sorted as well as any metadata for the groups
        objs: {},
        colorFunct: null,
        margin : {},
        axisMargin: null,
        svgWidth: null,
        svgHeight: null,
        width: null,
        height: null,
        xAxisLabel: null,
        yAxisLabel: null,
        yRange: [],
        xRange: [],
        selector: null
    };

    // Defaults
    chart.settings = {
        data: null,
        xName: null,
        yName: null,
        selector: null,
        caption: null,
        axisLabels: {xAxis: null, yAxis: null},
        // *CURRENTLY DIFFERENT SYNTAX, TAKE NOTE TO ADJUST TICK SIZE IN THE FUTURE
        yTicks: 1,
        // *REMEMBER TO ADJUST TICK SIZE FOR XSCALE TOO
        xTicks: 1,
        axisScale: {xAxis: 'ordinal', yAxis: 'linear'},
        chartSize: {width: 800, height: 400},
        margin: {top: 20, right: 50, bottom: 20, left: 10},
        axisMargin: 25,
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


    /**
     * Adds jitter to the  scatter point plot
     * @param {[boolean]} doJitter [true or false whether to jitter the point]
     * @param {[float]} width    [width percent of range band to cover with jitter]
     */
    function addJitter(doJitter, width) {
        if (doJitter !== true || width == 0) {
            return 0
        }
        return Math.floor(Math.random() * width) - width / 2;
    }

    /**
     * Find the size of the entire legend box
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return {[Object]} obj         [Object containing the height and width of the legend]
     */
    function getLegendSize(plotName, color, legendTitle) {

        createLegend(plotName, color, legendTitle);
        var obj = {
            height: chart.objs.legend.node().getBBox().height,
            width: chart.objs.legend.node().getBBox().width
        }

        if(chart.objs.legend) {
            chart.objs.legend.selectAll('g').remove();
            chart.objs.legend.selectAll('text').remove();
        }
        chart.objs.legend.remove();

        return obj;

    }

    /**
     * Adjust the chart size and regenerate the legend
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Object]} legendSize  [Object containing the height and width of the legend]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return
     */
    function generateLegend(plotName, legendSize, color, legendTitle) {
        // Constant number 22 to overrides the miss offset given by getBBox() function
        chart.width -= (legendSize.width + 22);
        chart.xScale.range([0, chart.width]);
        chart.objs.xAxis.scale(chart.xScale);
        chart.objs.axes.xAxis.call(chart.objs.xAxis);
        chart.objs.g.select('.x.axis .label')
            .attr('x', chart.width / 2);
        chart.objs.g.select('.x.axis .caption')
            .attr('x', chart.width / 2);

        chart.objs.yAxis.tickSizeInner(-chart.width);
        chart.objs.axes.yAxis.call(chart.objs.yAxis);

        createLegend(plotName, color, legendTitle);
    }

    /**
     * Create the legend
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return
     */
    function createLegend(plotName, color, legendTitle) {

        var legendRectSize = 18;
        var legendSpacing = 4;

        chart.objs.legend = chart.objs.g.append('g')
                                .attr('class', 'legend-wrapper');
        chart.objs.legend.append('text')
                    .attr('class', 'legend-title')
                    .attr('x', chart.width + legendSpacing)
                    .attr('y', 0)
                    .text(legendTitle.toUpperCase());
        var lgd = chart.objs.legend.selectAll('.legend')
                        .data(padDataAndSort(color.domain()))
                        .enter()
                        .append('g')
                        .attr('class', 'legend-point')
                        .attr('transform', function(d, i){
                            var height = legendRectSize + legendSpacing;
                            var horz =  chart.width + legendSpacing;
                            var vert = i * height + 5;
                            return 'translate(' + horz + ',' + vert + ')';
                        });

        lgd.append('rect')
          .attr('class', plotName + '-legend')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', color)
          .style('stroke', color);
        lgd.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .style('fill', 'black')
          .text(function(d) { return d; });
    }

    /**
     * Calculate Metrics for General Box Plot, Assumes values are sorted
     * @param  {[array]} values Sorted Array of Numbers
     * @return {[object]} boxMetrics Object with metrics param
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

    /**
     * Error Handling Begin, an object of error functions to be called globally
     */

    var err = {};

    /**
     * Error Messages
     * @type {Object}
     */
    err.messages = {
        checkNumber: 'Value must be a number',
        checkPositive: 'Value must be greater than zero',
        checkNonNegative: 'Value must be greater than or equal to zero',
        checkLogLinear: 'Scale should be either log or linear',
        checkDistro: 'x Axis must be ordinal, y Axis must be log/linear',
        checkAxis: 'Values for axis are unsuitable for the scale you chose'
    }

    /**
     * Check if every item in array is a number
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkNumber = function(array) {
        for (var i = 0; i < array.length; i++) {
            if(typeof array[i] != 'number' && isNaN(array[i])){
                return false;
            }
        }
        return true;
    }

    /**
     * Check if every item must be more than 0
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkPositive = function(array) {
        for (var i = 0; i < array.length; i ++) {
            if(array[i] <= 0 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if every item must be more than or equals to 0
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkNonNegative = function(array) {
        for (var i = 0; i < array.length; i ++) {
            if(array[i] < 0 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if type of scale is log or linear
     * @param  {[String]} scale [String containing information about the scale]
     * @return {[Boolean]}
     */
    err.checkLogLinear = function(scale) {
        if (scale === 'log') {
            return true;
        }

        if (scale === 'linear') {
            return true;
        }

        return false;
    }


    /**
     * General function to check Box and Violin chart errors
     * @return {[Boolean]}
     */
    err.checkDistro = function() {
        if (chart.xScale.scale !== 'ordinal') {
            return false;
        }

        return err.checkLogLinear(chart.yScale.scale);
    }

    /**
     * General Function to check axis
     * @return {[Boolean]}
     */
    err.checkAxis = function() {
        var errObj = {
            xAxis: null,
            yAxis: null
        };

        (function() {
            if(chart.xScale.scale === 'ordinal') {
                errObj.xAxis = true;
                return;
            } else if (chart.xScale.scale === 'linear') {
                errObj.xAxis = err.checkNumber(chart.xRange);
                return;
            } else if (chart.xScale.scale === 'log') {
                if (err.checkNumber(chart.xRange)) {
                    errObj.xAxis = true;
                } else {
                    errObj.xAxis = false;
                    return
                }
                if (err.checkPositive(chart.xRange)) {
                    errObj.xAxis = true;
                } else {
                    errObj.xAxis = false;
                    return;
                }
                return
            }
        })();

        (function() {
            if(chart.yScale.scale === 'ordinal') {
                errObj.yAxis = true;
                return;
            } else if (chart.yScale.scale === 'linear') {
                errObj.yAxis = err.checkNumber(chart.yRange);
                return;
            } else if (chart.yScale.scale === 'log') {
                if (err.checkNumber(chart.yRange)) {
                    errObj.yAxis = true;
                } else {
                    errObj.yAxis = false;
                    return
                }
                if (err.checkPositive(chart.yRange)) {
                    errObj.yAxis = true;
                } else {
                    errObj.yAxis = false;
                    return;
                }
                return;
            }
        })();

        if (errObj.xAxis && errObj.yAxis) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * Main caller function to print the error if found
     * @param  {[Function]} errFunc [Error Function to call]
     * @param  {[Parameter]} param   [Parameter to pass into the function]
     * @param  {[String]} name    [String containing information about the error]
     * @return {[Boolean]}
     */
    err.printError = function(errFunc, param, name) {
        if(errFunc(param)) {
            return true;
        }

        if(chart.objs.innerDiv) {
            chart.objs.innerDiv.remove();
        }

        throw new Error(err.messages[name]);
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
    function getObjWidth(scale, objWidth, gName) {
        var objSize = {left: null, right: null, middle: null};
        var width = scale.bandwidth() * (objWidth / 100);
        var padding = (scale.bandwidth() - width) / 2;
        var gShift = scale(gName);
        objSize.middle = scale.bandwidth() / 2 + gShift;
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


	/**
	 * Convert object to an array, formating  float numbers in the process
	 * @param  {[Object]} obj [Assume object containing any type]
	 * @return {[Array]}  data [Array of formatted float numbers]
	 */
    function objectToArray(obj) {
	    var data = [];
	    var keys = Object.keys(obj);
	    for(var i =0; i < keys.length; i ++){
	        var temp;
	        if(typeof obj[keys[i]] === 'string') {
	            if(typeof parseFloat(obj[keys[i]]) === 'number' && !isNaN(parseFloat(obj[keys[i]])) && parseFloat(obj[keys[i]]).toString().length == obj[keys[i]].length) {
	                temp = formatAsFloat(parseFloat(obj[keys[i]]));
	            } else {
	                temp = obj[keys[i]];
	            }
	        } else if(typeof obj[keys[i]] === 'number') {
	            temp = formatAsFloat(obj[keys[i]]);
	        } else {
	            temp = obj[keys[i]];
	        }

	        data.push(keys[i].charAt(0).toUpperCase() + keys[i].slice(1) + ': ' + temp);
	    }

	   	return data;
    }


	/**
	 * Check if it's a array of number, if it is, return the original array. Otherwise, return the array of string padded to sort
	 * @param  {[Array]} array [original array]
	 * @return {[Array]} array [padded array]
	 */
	function padDataAndSort(array) {
	    var isNumber = false;
	    for(var item in array) {
	        if(typeof parseFloat(array[item]) === 'number' && !isNaN(parseFloat(array[item])) && parseFloat(array[item]).toString().length == array[item].toString().length) {
	           isNumber = true;
	        } else {
	           isNumber = false;
	           break;
	        }
	    }

	    if(isNumber) {
	        return array.sort(d3.ascending);
	    }

	    var temp = array.slice();
	    var longest = temp.reduce(function (a, b) { return a.length > b.length ? a : b; });

	    for(var item in array) {

	        var padding = Array(longest.length+1).join(' ');
	        array[item] = (padding + array[item]).slice(-longest.length)
	    }

	    array.sort(d3.ascending);
	    array = array.map(function(d) {return d.replace(/(^\s+|\s+$)/g, '');});

	    return array;
	}
    /**
     * Tooltip Funtionality to show dashed line to respective axis of the point
     * NOTE POINT MUST BE CIRCLE SHAPE, MAYBE GENERALIZE TO ANY SHAPE IN FUTURE
     * @param  {[String]} cx   [circle x position]
     * @param  {[String]} cy   [circle y position]
     * @param  {[String]} r    [circle radius]
     * @param  {[String]} fill [circle color]
     */
    function showCircleAxisLine (cx, cy, r, fill) {
        var dropDest = {};
        var coodXAxis = transform(chart.objs.axes.xAxis.attr('transform'));
        dropDest.y = coodXAxis[1];
        dropDest.x = 0;

        chart.objs.tooltip.append('line')
            .attr('class', 'circle-tooltipline')
            .attr('x1', cx)
            .attr('y1', (cy < dropDest.y ? cy + r + 5 + 2 : cy - r - 5 - 2))
            .attr('x2', cx)
            .attr('y2', (cy < dropDest.y ? cy + r + 5 + 2 : cy - r - 5 - 2))
            .call(function(context) {
                context.style('fill', 'none')
                    .style('stroke', fill)
                    .style('stroke-width', 2)
                    .style('stroke-dasharray', ('3,3'));
            })
            .transition()
            .delay(350)
            .duration(350)
            .ease(d3.easeLinear)
            .attr('y2', dropDest.y);

        chart.objs.tooltip.append('line')
            .attr('class', 'circle-tooltipline')
            .attr('x1', (cx < dropDest.x ? cx + r + 5 + 2 : cx - r - 5 - 2))
            .attr('y1', cy)
            .attr('x2', (cx < dropDest.x ? cx + r + 5 + 2 : cx - r - 5 - 2))
            .attr('y2', cy)
            .call(function(context) {
                context.style('fill', 'none')
                    .style('stroke', fill)
                    .style('stroke-width', 2)
                    .style('stroke-dasharray', ('3,3'));
            })
            .transition()
            .delay(350)
            .duration(350)
            .ease(d3.easeLinear)
            .attr('x2', dropDest.x);
    }

    /**
     * ToolTip Function for circle shapes
     * @param  {[Object]} obj [Object contains data of tooltip]
     * @param  {[String]} cx   [circle x position]
     * @param  {[String]} cy   [circle y position]
     * @param  {[String]} r    [circle radius]
     * @param  {[String]} fill [circle color]
     * @return {[function]}      [function to be called upon]
     */
    function showCircleToolTip (obj, cx, cy, r, fill) {
        return function (){
            var w = 0;
            var h = 0;
            var height = 0;
            var y = 0;
            var textMargin = 5;
            var popupMargin = 10;
            var translateX, translateY;

            cx = parseFloat(cx);
            cy = parseFloat(cy);
            r = parseFloat(r);

            // Fade the popup stroke mixing the shape fill with 60% white
            var popupStrokeColor = d3.rgb(
                    d3.rgb(fill).r + 0.4 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.4 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.4 * (255 - d3.rgb(fill).b)
                ),
            // Fade the popup fill mixing the shape fill with 80% white
                popupFillColor = d3.rgb(
                    d3.rgb(fill).r + 0.6 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.6 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.6 * (255 - d3.rgb(fill).b)
                )


            chart.objs.tooltip.append('circle')
                .attr('class', 'circle-tooltipcircle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r)
                .call(function(context) {
                    context.attr('opacity', 0)
                        .style('fill', 'none')
                        .style('stroke', fill)
                        .style('stroke-width', 1);
                })
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr('r', r + 5)
                .call(function(context) {
                    context.attr('opacity', 1)
                        .style('stroke-width', 2);
                });
            if(!chart.boxPlots && !chart.violinPlots){
                showCircleAxisLine(cx, cy, r, fill);
            }

            var t = chart.objs.tooltip.append('g');


            var box = t.append('rect')
                        .attr('class', 'circle-tooltipbox');

            var data = objectToArray(obj);

            t.selectAll('dont').data(data).enter().append('text')
                .attr('class', 'circle-tooltiptext')
                .style('fill', 'black')
                .text(function(d) {return d;});

            t.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                h = (this.getBBox().height > h ? this.getBBox().height : h);
            });

            t.selectAll('text')
                .attr('x', 0)
                .attr('y', function () {
                // Increment the y position
                y += this.getBBox().height;
                // Position the text at the centre point
                return y - (this.getBBox().height / 2);
            });

            box.attr('x',-textMargin)
                .attr('y', -textMargin)
                .attr('height', Math.floor(y + textMargin) - 0.5)
                .attr('width', w + 2 * textMargin)
                .attr('rx', 5)
                .attr('ry', 5)
                .call(function (context) {
                        context.style('fill', popupFillColor)
                            .style('stroke', popupStrokeColor)
                            .style('stroke-width', 2)
                            .style('opacity', 0.95);
                });

            box.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                height = (this.getBBox().width > h ? this.getBBox().height : h);
            });

            // Shift the popup around to avoid overlapping the svg edge
           if (cx + r + textMargin + popupMargin + w < parseFloat(chart.width)) {
                // Draw centre right
                translateX = (cx + r + textMargin + popupMargin);
                translateY = (cy - ((y - (h - textMargin)) / 2));
            } else if (cx - r - (textMargin + popupMargin + w) > 0) {
                // Draw centre left
                translateX = (cx - r - (textMargin + popupMargin + w));
                translateY = (cy - ((y - (h - textMargin)) / 2));
            } else if (cy + r + y + popupMargin + textMargin < parseFloat(chart.height)) {
                // Draw centre below
                translateX = (cx - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (cy + r + 2 * textMargin);
            } else {
                // Draw centre above
                translateX = (cx - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (cy - y - (h - textMargin));
            }
            if (translateY < 0) {
                translateY = 0;
            } else if ((translateY + height) > chart.height){
                translateY = translateY - ((translateY + height) - chart.height);
            }
            t.attr('transform', 'translate(' + translateX + ',' + translateY + ')');
        }
    }

    /**
     * Tool Tip Function for box
     * @param  {[Object]} obj  [data description in object]
     * @param  {[String]} boxX [box x position]
     * @param  {[String]} boxY [box y position]
     * @param  {[String]} boxH [box height]
     * @param  {[String]} boxW [box width]
     * @param  {[String]} fill [box color]
     * @return {[function]}      [function to call the tool tip]
     */
    function showBoxToolTip (obj, boxX, boxY, boxH, boxW, fill) {
        return function (){
            var w = 0;
            var h = 0;
            var height = 0;
            var y = 0;
            var textMargin = 5;
            var popupMargin = 10;
            var translateX, translateY;

            boxX = parseFloat(boxX);
            boxY = parseFloat(boxY);
            boxH = parseFloat(boxH);
            boxW = parseFloat(boxW);

            // Fade the popup stroke mixing the shape fill with 60% white
            var popupStrokeColor = d3.rgb(
                    d3.rgb(fill).r + 0.4 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.4 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.4 * (255 - d3.rgb(fill).b)
                ),
            // Fade the popup fill mixing the shape fill with 80% white
                popupFillColor = d3.rgb(
                    d3.rgb(fill).r + 0.6 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.6 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.6 * (255 - d3.rgb(fill).b)
                )


            chart.objs.tooltip.append('rect')
                .attr('class', 'metrics-tooltipbox')
                .attr('x', boxX)
                .attr('y', boxY)
                .attr('width', boxW)
                .attr('height', boxH)
                .call(function(context) {
                    context.attr('opacity', 0)
                        .style('fill', 'none')
                        .style('stroke', fill)
                        .style('stroke-width', 1);
                })
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr('x', boxX - 5)
                .attr('y', boxY - 5)
                .attr('width', boxW + 10)
                .attr('height', boxH + 10)
                .call(function(context) {
                    context.attr('opacity', 1)
                        .style('stroke-width', 2);
                });

            var t = chart.objs.tooltip.append('g');


            var box = t.append('rect')
                        .attr('class', 'metrics-tooltipbox');

            var data = objectToArray(obj);

            t.selectAll('dont').data(data).enter().append('text')
                .attr('class', 'metrics-tooltiptext')
                .style('fill', 'black')
                .text(function(d) {return d;});

            t.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                h = (this.getBBox().height > h ? this.getBBox().height : h);
            });

            t.selectAll('text')
                .attr('x', 0)
                .attr('y', function () {
                // Increment the y position
                y += this.getBBox().height;
                // Position the text at the centre point
                return y - (this.getBBox().height / 2);
            });

            box.attr('x',-textMargin)
                .attr('y', -textMargin)
                .attr('height', Math.floor(y + textMargin) - 0.5)
                .attr('width', w + 2 * textMargin)
                .attr('rx', 5)
                .attr('ry', 5)
                .call(function (context) {
                        context.style('fill', popupFillColor)
                            .style('stroke', popupStrokeColor)
                            .style('stroke-width', 2)
                            .style('opacity', 0.95);
                });

            box.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                height = (this.getBBox().width > h ? this.getBBox().height : h);
            });

            // Shift the popup around to avoid overlapping the svg edge
           if (boxX + boxW + textMargin + popupMargin + w < parseFloat(chart.width)) {
                // Draw centre right
                translateX = (boxX + boxW + textMargin + popupMargin);
                translateY = (boxY +(boxH/2) - ((y - (h - textMargin)) / 2));
            } else if (boxX - boxW - (textMargin + popupMargin + w) > 0) {
                // Draw centre left
                translateX = (boxX - (textMargin + popupMargin + w));
                translateY = (boxY + (boxH/2)- ((y - (h - textMargin)) / 2));
            } else if (boxY + boxH + y + popupMargin + textMargin < parseFloat(chart.height)) {
                // Draw centre below
                translateX = (boxX - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (boxY + boxH + 2 * textMargin);
            } else {
                // Draw centre above
                translateX = (boxX - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (boxY - y - (h - textMargin));
            }
            if (translateY < 0) {
                translateY = 0;
            } else if ((translateY + height) > chart.height){
                translateY = translateY - ((translateY + height) - chart.height);
            }
            t.attr('transform', 'translate(' + translateX + ' , ' + translateY + ')');
        }
    }


    /**
     * Remove all tooltip
     * @return {[Function]} [function to call when on mouse leave]
     */
    function removeToolTip () {
        return function() {
            chart.objs.tooltip.selectAll('circle').remove();
            chart.objs.tooltip.selectAll('line').remove();
            chart.objs.tooltip.selectAll('rect').remove();
            chart.objs.tooltip.selectAll('g').remove();
        }
    }
	/**
	 * Transform the translated coordinate string into x and y values
	 * NOTE UNCLEAN WAY TO CUT STRING MANUALLY USING JAVASCRIPT FUNCTION
	 * MAYBE CONSIDER REFERRING D3 IN THE FUTURE BECAUSE D3 v4 REMOVED TRANSFORM FUNCTION
	 * @param  {[String]} translate [String contains transform attribute]
	 * @return {[Array]} cood       [Array of x and y value]
	 */
    function transform(translate) {
    	if(translate == null) {
    		throw new Error('Co-ordinate of object is null');
    	}
    	var cood = translate.substring(translate.indexOf('(')+1, translate.indexOf(')')).split(',');
    	return cood;
    }


    /**
     * Update chart base on window size
     * @return
     */
    chart.update = function () {

        // Update Chart size
        chart.svgWidth = parseInt(chart.objs.chartDiv.style('width'), 10) - (chart.margin.left + chart.margin.right);
        chart.svgHeight = parseInt(chart.objs.chartDiv.style('height'), 10) - (chart.margin.top + chart.margin.bottom);
        chart.width = chart.svgWidth - chart.margin.left - chart.margin.right;
        chart.height = chart.svgHeight - chart.margin.top - chart.margin.bottom;

        // Update Scale size
        chart.xScale.range([0, chart.width]);
        chart.yScale.range([chart.height, 0]);

        // Update the yDomain if the Violin plot clamp is set to -1 meaning it will extend the violins to make nice points
        if (chart.violinPlots && chart.violinPlots.options.show == true && chart.violinPlots.options._yDomainVP != null) {
            chart.yScale.domain(chart.violinPlots.options._yDomainVP).nice().clamp(true);
        } else {
           // chart.yScale.domain(chart.range).nice().clamp(true);
        }

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


    /**
     * Parse the data for calculating appropriate base values for all plots
     * General self-executed group function to group appropriate values in chart.groupObjs settings
     * @param
     * @returns
    */
    (function prepareData(){

        // General Grouping function to store grouped values in chart.groupObjs
        var currentX = null;
        var currentY = null;
        var currentRow;
        var currentToolTip;

        for(currentRow = 0; currentRow < chart.data.length; currentRow++){
            currentX = chart.data[currentRow][chart.settings.xName];
            currentY = chart.data[currentRow][chart.settings.yName];
            currentToolTip = chart.data[currentRow];

            if(chart.groupObjs.hasOwnProperty(currentX)){
                chart.groupObjs[currentX].values.push(currentY);
                chart.groupObjs[currentX].tooltip.push(currentToolTip);
            } else {
                chart.groupObjs[currentX] = {};
                chart.groupObjs[currentX].values = [currentY];
                chart.groupObjs[currentX].tooltip = [currentToolTip];
            }
        }
    })();

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

    /**
     * Prepare Chart HTML elements
     * @return
     */
    (function prepareChart() {

        /**
         * Wrapping Function for future use of Long Sentences, Split by Space and Readjust
         * @param  {[node]} text  [node of the text]
         * @param  {[float]} width [bandwidth of chart axis]
         * @return        [changes the text DOM in place]
         */
      /*  function wrap(text, width) {
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr('y'),
                dy = parseFloat(text.attr('dy')),
                tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(' '));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
              }
            }
          });
        } */

        /**
         * Calculate the maximum length of text among ticks from the given axis
         * @param  {[Object]} scale    [Object reference to the axis scale]
         * @param  {[String]} axisName [Axis Type provided in settings]
         * @param  {[Object]} axisObj  [Object reference to the axis object]
         * @return {[Float]}          [Maximum value in pixels]
         */
        function getMaxText(scale, axisName, axisObj) {
            var maxWidth = 0;
            var maxHeight = 0;
            var data = null;
            if (axisName === 'linear') {
                data = scale.ticks();
            } else if (axisName === 'ordinal') {
                data = scale.domain();
            }

            chart.objs.svg.selectAll('text.foo').data(data)
                .enter().append('text').text(function (d) {return d;})
                .each(function(){
                    maxWidth = Math.max(this.getBBox().width + axisObj.tickPadding(), maxWidth);
                    maxHeight = Math.max(this.getBBox().height, maxHeight);
                })
                .remove();

            var max = {
                width: maxWidth,
                height: maxHeight
            }

            return max;
        }

        // Build main div and chart div
        chart.objs.mainDiv = d3.select(chart.settings.selector)
                                .attr('class', 'chart-wrapper')
                                .style('max-width', chart.svgWidth + 'px');
        // Add divs to make it centered and responsive
        chart.objs.innerDiv = chart.objs.mainDiv.append('div')
                                .attr('class', 'inner-wrapper');
        chart.objs.innerDiv
            .append('div').attr('class', 'outer-box')
            .append('div').attr('class', 'inner-box');

        if(!err.printError(err.checkAxis, '', 'checkAxis')) {
            return;
        }

        // Capture the inner div for the chart (the real container for the chart)
        chart.selector = chart.objs.innerDiv.select('.inner-box');
        chart.objs.chartDiv = chart.selector;

// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     //   d3.select(window).on('resize.chartInnerBox', chart.update);
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Create the svg
        chart.objs.svg = chart.objs.chartDiv.append('svg')
            .attr('class', 'chart-area')
            .attr('width', chart.svgWidth + chart.axisMargin + chart.margin.left)
            .attr('height', chart.svgHeight);

        // Calculate the maxWidth of the data in pixels then readjust the chart position
        var yMax = getMaxText(chart.yScale, chart.settings.axisScale.yAxis, chart.objs.yAxis);
        var xMax = getMaxText(chart.xScale, chart.settings.axisScale.xAxis, chart.objs.xAxis);


        chart.objs.g = chart.objs.svg.append('g')
            .attr('transform', 'translate(' + (yMax.width + chart.axisMargin + chart.margin.left) + ',' + chart.margin.top + ')');

        // Create axes
        chart.objs.axes = chart.objs.g.append('g')
                            .attr('class', 'axes');

        chart.objs.axes.yAxis = chart.objs.axes.append('g')
                                    .attr('class', 'y axis')
                                    .call(chart.objs.yAxis);
        chart.objs.axes.yAxisLabel = chart.objs.axes.yAxis
                                        .append('text')
                                        .attr('class', 'label')
                                        .attr('transform', 'rotate(-90)')
                                        .attr('y', -yMax.width - chart.axisMargin)
                                        .attr('x', -chart.height / 2)
                                        .attr('dy', '.71em')
                                        .attr('fill', 'black')
                                        .style('text-anchor', 'middle')
                                        .style('font-weight', 'bold')
                                        .text(chart.yAxisLabel.toUpperCase());

        chart.objs.axes.xAxis =  chart.objs.axes.append('g')
                                    .attr('class', 'x axis')
                                    .attr('transform', 'translate(0,' + chart.height + ')')
                                    .call(chart.objs.xAxis);

        chart.objs.axes.xAxisLabel = chart.objs.axes.xAxis
                                        .append('text')
                                        .attr('class', 'label')
                                        .attr('x', chart.width / 2)
                                        .attr('y', xMax.height + chart.axisMargin)
                                        .attr('fill', 'black')
                                        .style('text-anchor', 'middle')
                                        .style('font-weight', 'bold')
                                        .text(chart.xAxisLabel.toUpperCase());


        for(var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].g = chart.objs.g.append('g')
                                                .attr('class', 'group');
        }

        // Caption
        if(chart.settings.caption){
            chart.objs.caption = chart.objs.axes.xAxis.append('text')
                                    .attr('class', 'caption')
                                    .attr('fill', 'black')
                                    .attr('x', chart.width / 2)
                                    .attr('y', xMax.height + chart.axisMargin*2 )
                                    .style('text-anchor', 'middle')
                                    .style('font-weight', 'bold')
                                    .text(chart.settings.caption);

    // TO DO, IF IT DOESN'T BREAK ANYMORE, REMOVE THE COMMENTS BELOW ON THE OLD VERSION OF THE CODE
           /* chart.svgHeight += chart.axisMargin;
            chart.objs.svg.attr('height', chart.svgHeight); */
            chart.height -= chart.axisMargin;
            chart.yScale.range([chart.height, 0]);
            chart.objs.yAxis.scale(chart.yScale);
            chart.objs.axes.yAxis.call(chart.objs.yAxis);
            chart.objs.axes.xAxis.attr('transform', 'translate(0,' + chart.height + ')');
        }

        var xBandwidth;
        if (chart.settings.axisScale.xAxis === 'ordinal') {
            xBandwidth = chart.xScale.bandwidth();
        } else if (chart.settings.axisScale.xAxis === 'linear') {
            xBandwidth = chart.width / chart.xScale.ticks().length;
        }

        if (xMax.width >= xBandwidth) {
            chart.objs.axes.xAxis.selectAll('.tick text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-90)');
    // TO DO, IF IT DOESN'T BREAK ANYMORE, REMOVE THE COMMENTS BELOW ON THE OLD VERSION OF THE CODE
          /*  chart.objs.svg.attr('height', chart.svgHeight + xMax.width);
            chart.objs.axes.xAxisLabel.attr('y', xMax.width + chart.axisMargin);
            if (chart.objs.caption) {
                chart.objs.caption.attr('y', xMax.width + chart.axisMargin*2);
            } */

            chart.height -= xMax.width;
            chart.objs.axes.xAxisLabel.attr('y', xMax.width + chart.axisMargin);
            if (chart.objs.caption) {
                chart.objs.caption.attr('y', xMax.width + chart.axisMargin*2);
            }
            chart.yScale.range([chart.height, 0]);
            chart.objs.yAxis.scale(chart.yScale);
            chart.objs.axes.yAxis.call(chart.objs.yAxis);
            chart.objs.axes.xAxis.attr('transform', 'translate(0,' + chart.height + ')');
        }

        // Create tooltip div
        chart.objs.tooltip = chart.objs.g.append('g').attr('class', 'tooltip');

// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Update the chart on its size
    //     chart.update();
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

        if(!err.printError(err.checkDistro, '', 'checkDistro')) {
            return;
        }

        /*
         * Check if Box metrics is calculated, if not, calculate and store it
         * @param
         * @returns
        */
        (function prepareBoxData() {
            for(var currentName in chart.groupObjs){
                if(!chart.groupObjs[currentName].boxMetrics){
                    chart.groupObjs[currentName].boxMetrics = {};
                    var copy = chart.groupObjs[currentName].values.slice();
                    copy.sort(d3.ascending);
                    chart.groupObjs[currentName].boxMetrics = calcBoxMetrics(copy);
                    chart.groupObjs[currentName].boxMetrics.values = copy;

                    var toolCopy = chart.groupObjs[currentName].tooltip.slice();
                    toolCopy.sort(function(a, b) {return a[chart.settings.yName] - b[chart.settings.yName]});
                    chart.groupObjs[currentName].boxMetrics.tooltip = toolCopy;


                }
            }

        })();
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
                for(index = 0; index < currentGroup.boxMetrics.values.length; index++) {
                    currentOut = {value: currentGroup.boxMetrics.values[index], tooltip:currentGroup.boxMetrics.tooltip[index]};

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
                        }
                    }

                    if(currentBox.objs.extremes.length) {
                        var extSvg = currentBox.objs.g.append('g').attr('class', 'boxplot extremes');
                        for(currentPoint in currentBox.objs.extremes) {
                            currentBox.objs.extremes[currentPoint].point = extSvg.append('circle')
                                .attr('class', 'extreme')
                                .attr('r', boxOptions.extremeCSize)
                                .style('stroke', chart.boxPlots.color(currentName));
                        }
                    }
                }
            }

            if(!chart.violinPlots){
                var legendSize = getLegendSize('box', chart.boxPlots.color, chart.settings.xName);
                generateLegend('box', legendSize, chart.boxPlots.color, chart.settings.xName);
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
                var objBounds = getObjWidth(chart.xScale, boxOptions.boxWidth, currentName);
                var width = (objBounds.right - objBounds.left);

                var scaledBoxMetrics = {};
                for(var attr in chart.groupObjs[currentName].boxMetrics) {
                    scaledBoxMetrics[attr] = null;
                    scaledBoxMetrics[attr] = chart.yScale(chart.groupObjs[currentName].boxMetrics[attr]);
                }

                var tooltip = clone(chart.groupObjs[currentName].boxMetrics);
                delete tooltip.values;
                delete tooltip.tooltip;
                var x, y, height, width, fill;

                // Box
                if (currentBox.objs.box) {
                    currentBox.objs.box
                        .attr('x', objBounds.left)
                        .attr('width', width)
                        .attr('y', scaledBoxMetrics.quartile3)
                        .attr('rx', 1)
                        .attr('ry', 1)
                        .attr('height', -scaledBoxMetrics.quartile3 + scaledBoxMetrics.quartile1);

                    x = currentBox.objs.box.attr('x');
                    y = currentBox.objs.box.attr('y');
                    height = currentBox.objs.box.attr('height');
                    width = currentBox.objs.box.attr('width');
                    fill = currentBox.objs.box.style('fill');
                    currentBox.objs.box.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                       .on('mouseout', removeToolTip());
                }

                // Lines
                var lineBounds = null;
                if(boxOptions.lineWidth) {
                    lineBounds = getObjWidth(chart.xScale, boxOptions.lineWidth, currentName);
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
                    if (currentBox.objs.box) {
                        currentBox.objs.median.circle.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                     .on('mouseout', removeToolTip());
                        currentBox.objs.median.line.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                   .on('mouseout', removeToolTip());
                    }
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
                    if (currentBox.objs.box) {
                        currentBox.objs.mean.circle.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                   .on('mouseout', removeToolTip());
                        currentBox.objs.mean.line.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                 .on('mouseout', removeToolTip());
                    }
                }

                var cx, cy, r;

                // Outliers
                var currentPoint;
                if(currentBox.objs.outliers && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.outliers) {

                        currentBox.objs.outliers[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.outliers[currentPoint].value));

                        tooltip = currentBox.objs.outliers[currentPoint].tooltip;
                        cx = currentBox.objs.outliers[currentPoint].point.attr('cx');
                        cy = currentBox.objs.outliers[currentPoint].point.attr('cy');
                        r = currentBox.objs.outliers[currentPoint].point.attr('r');
                        fill = currentBox.objs.outliers[currentPoint].point.style('fill');

                        currentBox.objs.outliers[currentPoint].point.on('mouseover', showCircleToolTip(tooltip, cx, cy, r, fill))
                                                                    .on('mouseout', removeToolTip());
                    }
                }

                // Extremes
                if(currentBox.objs.extremes && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.extremes) {
                        currentBox.objs.extremes[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.extremes[currentPoint].value));

                        tooltip = currentBox.objs.extremes[currentPoint].tooltip;
                        cx = currentBox.objs.extremes[currentPoint].point.attr('cx');
                        cy = currentBox.objs.extremes[currentPoint].point.attr('cy');
                        r = currentBox.objs.extremes[currentPoint].point.attr('r');
                        fill = currentBox.objs.extremes[currentPoint].point.style('stroke');

                        currentBox.objs.extremes[currentPoint].point.on('mouseover', showCircleToolTip(tooltip, cx, cy, r, fill))
                                                                    .on('mouseout', removeToolTip());
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

        if(!err.printError(err.checkDistro, '', 'checkDistro')) {
            return;
        }


        /*
         * Check if Box metrics is calculated, if not, calculate and store it
         * @param
         * @returns
        */
        (function prepareBoxData() {
            for(var currentName in chart.groupObjs){
                if(!chart.groupObjs[currentName].boxMetrics){
                    chart.groupObjs[currentName].boxMetrics = {};
                    var copy = chart.groupObjs[currentName].values.slice();
                    copy.sort(d3.ascending);
                    chart.groupObjs[currentName].boxMetrics = calcBoxMetrics(copy);
                    chart.groupObjs[currentName].boxMetrics.values = copy;

                    var toolCopy = chart.groupObjs[currentName].tooltip.slice();
                    toolCopy.sort(function(a, b) {return a[chart.settings.yName] - b[chart.settings.yName]});
                    chart.groupObjs[currentName].boxMetrics.tooltip = toolCopy;
                }
            }

        })();
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

            var legendSize = getLegendSize('violin', chart.violinPlots.color, chart.settings.xName);
            generateLegend('violin', legendSize, chart.violinPlots.color, chart.settings.xName);
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
                currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].boxMetrics.values);

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
                        var kdeTester = eKernelTest(eKernel(violinOptions.bandWidth), chart.groupObjs[currentName].boxMetrics.values);
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
                    if (!violinOptions._yDomainVP) violinOptions._yDomainVP = chart.yRange.slice(0);
                    if (interpolateMin && interpolateMin < violinOptions._yDomainVP[0]) {
                        violinOptions._yDomainVP[0] = interpolateMin;
                    }
                    if (interpolateMax && interpolateMax > violinOptions._yDomainVP[1]) {
                        violinOptions._yDomainVP[1] = interpolateMax;
                    }
                }

                if (violinOptions.showViolinPlot) {
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 //   chart.update();
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    xViolinScale = chart.yScale.copy();

                    // Recalculate KDE as xViolinScale Changed
                    currentViolin.kde = kernelDensityEstimator(eKernel(violinOptions.bandWidth), xViolinScale.ticks(violinOptions.resolution));
                    currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].boxMetrics.values);
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
                var objBounds = getObjWidth(chart.xScale, violinOptions.width, currentName);
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

    /**
     * Begin and setting up options for bubble plot
     * @param  {[object]} options
     * @return {[type]}
     */
    chart.renderBubblePlot = function (options) {
        chart.bubblePlots = {};

        // Default options
        var defaultOptions = {
            show: true,
            showBubble: true,
            bubbleWidth: 30,
            bubbleVolume: '',
            colorBy: '',
            colors: chart.colorFunct
        };
        chart.bubblePlots.options = clone(defaultOptions);
        for (var option in options){
            chart.bubblePlots.options[option] = options[option];
        }
        var bubbleOptions = chart.bubblePlots.options;

        // Create Plot Objects for each ticks of xAxis
        for (var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].bubblePlot = {};
            chart.groupObjs[currentName].bubblePlot.objs = {};
        }
        /*
         * Check if Bubble Data for bubble Volume and Color
         * @param
         * @returns
        */
        (function prepareBubbleData() {

            var currentX = null;
            var currentRow;
            var currentToolTip;

            for(currentRow = 0; currentRow < chart.data.length; currentRow++){
                currentX = chart.data[currentRow][chart.settings.xName];
                currentToolTip = chart.data[currentRow];

                var obj = {
                    value: chart.data[currentRow][chart.settings.yName],
                    volume: chart.data[currentRow][bubbleOptions.bubbleVolume],
                    color: chart.data[currentRow][bubbleOptions.colorBy],
                    tooltip: currentToolTip
                };

                if(!chart.groupObjs[currentX].bubbleValues) {
                    chart.groupObjs[currentX].bubbleValues = [obj];
                } else {
                    chart.groupObjs[currentX].bubbleValues.push(obj);
                }
            }

        })();
/*
        * Take a new set of option and redraw bubblePlot
        * @param {object} updateOptions
        * @return
*/
        chart.bubblePlots.change = function (updateOptions) {
            if (updateOptions) {
                for (var option in updateOptions) {
                    bubbleOptions[option] = updateOptions[option];
                }
            }

            for (var currentName in chart.groupObjs) {
                chart.groupObjs[currentName].bubblePlot.objs.g.remove();
            }
            chart.bubblePlots.prepareBoxPlot();
            chart.bubblePlots.update();
        }

/*
        * Set bubblePlot show option to false
        * @param
        * @return
*/
        chart.bubblePlots.hide = function (opts) {
            if (opts !== undefined) {
                opts.show = false;
                if (opts.reset) {
                    chart.bubblePlots.reset()
                }
            } else {
                opts = {show: false};
            }
            chart.bubblePlots.change(opts)
        };

        /**
         * Create svg elements for bubble plot
         * @param
         * @return
         */
        chart.bubblePlots.prepareBubblePlot = function() {
            var currentName, currentBubble;

            if(bubbleOptions.colors) {
                chart.bubblePlots.color = getColorFunct(bubbleOptions.colors);
            } else {
                chart.bubblePlots.color = chart.colorFunct;
            }

            if(bubbleOptions.show == false) {
                return;
            }

            /**
             * Specify the range of bubble size
             * Default for smallest bubble will always be 3 pixel
             * If both axis are ordinal, the maximum bubble size cannot be bigger than the min of both axis bandwidth
             * If one of them is linear, the maximum bubble size cannot be bigger than the ordinal axis bandwidth
             * otherwise, if both linear the current range will always be [3, 30]
             */
            var bubbleRange;
            if(chart.settings.axisScale.xAxis === 'ordinal' && chart.settings.axisScale.yAxis === 'ordinal') {
                bubbleRange = [3, (((Math.min(chart.xScale.bandwidth(), chart.yScale.bandwidth()))*0.9)/2)];
            } else if(chart.settings.axisScale.xAxis === 'ordinal' && chart.settings.axisScale.yAxis !== 'ordinal') {
                bubbleRange = [3, (((chart.xScale.bandwidth())*0.9)/2)];
            } else if(chart.settings.axisScale.xAxis !== 'ordinal' && chart.settings.axisScale.yAxis === 'ordinal') {
                bubbleRange = [3, (((chart.yScale.bandwidth())*0.9)/2)];
            } else {
                // TAKE NOTE FOR FUTURE, CURRENT BUBBLE VOLUME FOR BOTH AXIS LINEAR IS HARD CODED
                bubbleRange = [3, 30];
            }

            var tenMultiples = 0;
            /**
             * Get the min and max of data, then change the type to number
             */
            var domain = d3.extent(chart.data.map(function(d) {return +d[bubbleOptions.bubbleVolume]})).map(function(d) {
                // For each min and max of the return get the number of digits
                    if(d > 0) {
                        tenMultiples = Math.floor(Math.log10(d));
                    }
                    tenMultiples = Math.pow(10, tenMultiples);
                    // Zero out the every digit except the most significant digit
                    d = (Math.floor(d/tenMultiples))*tenMultiples;
                    return d;
                });

            // Bump the max to the ceiling
            domain[1] = domain[1] + tenMultiples;

            var bubbleScale = d3.scaleSqrt()
                                .domain(domain)
                                .range(bubbleRange);

            if(!err.printError(err.checkNonNegative, domain, 'checkNonNegative')) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentBubble = chart.groupObjs[currentName].bubblePlot;
                currentBubble.objs.bubble = [];
                currentBubble.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'bubble-plot');

                // Bubble
                if (bubbleOptions.showBubble) {
                    for(var currentBubbleValue in chart.groupObjs[currentName].bubbleValues){
                        var volume = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].volume;
                        var color = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].color;
                        if(!currentBubble.objs.bubble){
                            currentBubble.objs.bubble = [];
                            currentBubble.objs.bubble = [currentBubble.objs.g.append('circle')
                                .attr('class', 'bubble')
                                .attr('r', function() {return bubbleScale(volume);})
                                .style('fill', chart.bubblePlots.color(color))
                                //.style('stroke', 'rgb(107, 148, 177)')
                                .style('opacity', 0.8)];
                        } else {
                            currentBubble.objs.bubble.push(currentBubble.objs.g.append('circle')
                                .attr('class', 'bubble')
                                .attr('r', function() {return bubbleScale(volume);})
                                .style('fill', chart.bubblePlots.color(color))
                                //.style('stroke', 'rgb(107, 148, 177)')
                                .style('opacity', 0.8));
                        }
                    }
                }
            }

            var legendSize = getLegendSize('bubble', chart.bubblePlots.color, bubbleOptions.colorBy);
            generateLegend('bubble', legendSize, chart.bubblePlots.color, bubbleOptions.colorBy);

        }
/*
        * Reset the bubblePlot to default option
        * @param
        * @return
*/
        chart.bubblePlots.reset = function () {
            chart.bubblePlots.change(defaultOptions)
        };

/*
        * Set bubblePlot show option to true
        * @param
        * @return
*/
        chart.bubblePlots.show = function (opts) {
            if (opts !== undefined) {
                opts.show = true;
                if (opts.reset) {
                    chart.bubblePlots.reset()
                }
            } else {
                opts = {show: true};
            }
            chart.bubblePlots.change(opts)

        };


        chart.bubblePlots.update = function() {
            var currentName, currentBubble;

            for(currentName in chart.groupObjs) {
                currentBubble = chart.groupObjs[currentName].bubblePlot;


                var xPosition, yPosition;
                // Check linear or ordinal and get bubble position
                if(chart.settings.axisScale.xAxis === 'ordinal') {
                    // Get Bubble Width
                    var objBoundsX = getObjWidth(chart.xScale, bubbleOptions.bubbleWidth, currentName);
                    xPosition = objBoundsX.middle;
                } else if (chart.settings.axisScale.xAxis === 'linear') {
                    xPosition = chart.xScale(currentName);
                }

                // Bubble
                if (currentBubble.objs.bubble) {
                    for(var currentBubbleValue in chart.groupObjs[currentName].bubbleValues){
                        var value = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].value;
                        var tooltip = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].tooltip;
                        if(chart.settings.axisScale.yAxis === 'ordinal') {
                            // Get Bubble Width
                            var objBoundsY = getObjWidth(chart.yScale, bubbleOptions.bubbleWidth, value);
                            yPosition = objBoundsY.middle;
                        } else if (chart.settings.axisScale.yAxis === 'linear') {
                            yPosition = chart.yScale(value);
                        }

                        currentBubble.objs.bubble[currentBubbleValue]
                            .attr('cx', xPosition)
                            .attr('cy', yPosition);


                        var r, fill;
                        r = currentBubble.objs.bubble[currentBubbleValue].attr('r');
                        fill = currentBubble.objs.bubble[currentBubbleValue].style('fill');
                        currentBubble.objs.bubble[currentBubbleValue].on('mouseover', showCircleToolTip(tooltip, xPosition, yPosition, r, fill))
                                                                     .on('mouseout', removeToolTip());


                    }

                }
            }
        };

		chart.bubblePlots.prepareBubblePlot();
		d3.select(window).on('resize.bubblePlot', chart.bubblePlots.update);
		chart.bubblePlots.update();

		return chart;

	};
    return chart;
 }

return a3;
}));
// End a3
