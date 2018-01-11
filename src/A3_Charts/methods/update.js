    /**
     * Update chart base on window size
     * @return
     */
    chart.update = function () {

        // Update Chart size
        chart.svgWidth = parseInt(chart.objs.chartDiv.style('width'), 10) - (chart.margin.left + chart.margin.right);
        chart.svgHeight = parseInt(chart.objs.chartDiv.style('height'), 10) - (chart.margin.top + chart.margin.bottom);
        chart.width = chart.svgWidth - chart.margin.left - chart.margin.right;
        chart.height = chart.svgHeight - chart.margin.top - chart.margin.bottom;

        // Update Scale size
        chart.xScale.range([0, chart.width]);
        chart.yScale.range([chart.height, 0]);

        // Update the yDomain if the Violin plot clamp is set to -1 meaning it will extend the violins to make nice points
        if (chart.violinPlots && chart.violinPlots.options.show == true && chart.violinPlots.options._yDomainVP != null) {
            chart.yScale.domain(chart.violinPlots.options._yDomainVP).nice().clamp(true);
        } else {
           // chart.yScale.domain(chart.range).nice().clamp(true);
        }

        // Update axes
        chart.objs.g.select('.x.axis')
            .attr('transform', 'translate(0,' + chart.height + ')')
            .call(chart.objs.xAxis);
        chart.objs.g.select('.y.axis')
            .call(chart.objs.yAxis.tickSizeInner(-chart.width));
        chart.objs.g.select('.x.axis .label')
            .attr('x', chart.width / 2);
        chart.objs.g.select('.y.axis .label')
            .attr('x', -chart.height / 2);

        return chart;
    };

