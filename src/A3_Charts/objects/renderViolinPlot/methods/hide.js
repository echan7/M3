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
