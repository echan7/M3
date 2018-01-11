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