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
