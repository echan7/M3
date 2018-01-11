 		chart.violinPlots.prepareViolin();
        d3.select(window).on('resize.violinPlot', chart.violinPlots.update);
        chart.violinPlots.update();

        return chart;
    };
