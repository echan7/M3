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

