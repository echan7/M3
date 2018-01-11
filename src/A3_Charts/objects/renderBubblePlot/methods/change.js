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
