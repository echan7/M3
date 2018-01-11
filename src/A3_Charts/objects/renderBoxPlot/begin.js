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
