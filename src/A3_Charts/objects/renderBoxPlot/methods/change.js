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
