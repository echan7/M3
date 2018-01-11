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

