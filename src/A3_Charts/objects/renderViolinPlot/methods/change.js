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
