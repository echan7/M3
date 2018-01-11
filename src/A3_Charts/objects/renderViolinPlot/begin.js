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

