		chart.bubblePlots.prepareBubblePlot();
		d3.select(window).on('resize.bubblePlot', chart.bubblePlots.update);
		chart.bubblePlots.update();

		return chart;

	};