/*
        * Set violin show option to true
        * @param
        * @return
*/
        chart.violinPlots.show = function (opts) {
            if (opts !== undefined) {
                opts.show = true;
                if (opts.reset) {
                    chart.violinPlots.reset()
                }
            } else {
                opts = {show: true};
            }
            chart.violinPlots.change(opts);

        };
