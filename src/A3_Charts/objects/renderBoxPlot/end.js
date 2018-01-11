	 	chart.boxPlots.prepareBoxPlot();
        d3.select(window).on('resize.boxPlot', chart.boxPlots.update);
        chart.boxPlots.update();

        return chart;

    };
