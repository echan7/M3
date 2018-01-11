    /**
     * Find the size of the entire legend box
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return {[Object]} obj         [Object containing the height and width of the legend]
     */
    function getLegendSize(plotName, color, legendTitle) {

        createLegend(plotName, color, legendTitle);
        var obj = {
            height: chart.objs.legend.node().getBBox().height,
            width: chart.objs.legend.node().getBBox().width
        }

        if(chart.objs.legend) {
            chart.objs.legend.selectAll('g').remove();
            chart.objs.legend.selectAll('text').remove();
        }
        chart.objs.legend.remove();

        return obj;

    }

    /**
     * Adjust the chart size and regenerate the legend
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Object]} legendSize  [Object containing the height and width of the legend]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return
     */
    function generateLegend(plotName, legendSize, color, legendTitle) {
        // Constant number 22 to overrides the miss offset given by getBBox() function
        chart.width -= (legendSize.width + 22);
        chart.xScale.range([0, chart.width]);
        chart.objs.xAxis.scale(chart.xScale);
        chart.objs.axes.xAxis.call(chart.objs.xAxis);
        chart.objs.g.select('.x.axis .label')
            .attr('x', chart.width / 2);
        chart.objs.g.select('.x.axis .caption')
            .attr('x', chart.width / 2);

        chart.objs.yAxis.tickSizeInner(-chart.width);
        chart.objs.axes.yAxis.call(chart.objs.yAxis);

        createLegend(plotName, color, legendTitle);
    }

    /**
     * Create the legend
     * @param  {[String]} plotName    [Naming convention for class]
     * @param  {[Function]} color       [Color function]
     * @param  {[String]} legendTitle [Title of the legend]
     * @return
     */
    function createLegend(plotName, color, legendTitle) {

        var legendRectSize = 18;
        var legendSpacing = 4;

        chart.objs.legend = chart.objs.g.append('g')
                                .attr('class', 'legend-wrapper');
        chart.objs.legend.append('text')
                    .attr('class', 'legend-title')
                    .attr('x', chart.width + legendSpacing)
                    .attr('y', 0)
                    .text(legendTitle.toUpperCase());
        var lgd = chart.objs.legend.selectAll('.legend')
                        .data(padDataAndSort(color.domain()))
                        .enter()
                        .append('g')
                        .attr('class', 'legend-point')
                        .attr('transform', function(d, i){
                            var height = legendRectSize + legendSpacing;
                            var horz =  chart.width + legendSpacing;
                            var vert = i * height + 5;
                            return 'translate(' + horz + ',' + vert + ')';
                        });

        lgd.append('rect')
          .attr('class', plotName + '-legend')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', color)
          .style('stroke', color);
        lgd.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .style('fill', 'black')
          .text(function(d) { return d; });
    }
