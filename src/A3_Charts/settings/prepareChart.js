    /**
     * Prepare Chart HTML elements
     * @return
     */
    (function prepareChart() {

        /**
         * Wrapping Function for future use of Long Sentences, Split by Space and Readjust
         * @param  {[node]} text  [node of the text]
         * @param  {[float]} width [bandwidth of chart axis]
         * @return        [changes the text DOM in place]
         */
      /*  function wrap(text, width) {
          text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr('y'),
                dy = parseFloat(text.attr('dy')),
                tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(' '));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
              }
            }
          });
        } */

        /**
         * Calculate the maximum length of text among ticks from the given axis
         * @param  {[Object]} scale    [Object reference to the axis scale]
         * @param  {[String]} axisName [Axis Type provided in settings]
         * @param  {[Object]} axisObj  [Object reference to the axis object]
         * @return {[Float]}          [Maximum value in pixels]
         */
        function getMaxText(scale, axisName, axisObj) {
            var maxWidth = 0;
            var maxHeight = 0;
            var data = null;
            if (axisName === 'linear') {
                data = scale.ticks();
            } else if (axisName === 'ordinal') {
                data = scale.domain();
            }

            chart.objs.svg.selectAll('text.foo').data(data)
                .enter().append('text').text(function (d) {return d;})
                .each(function(){
                    maxWidth = Math.max(this.getBBox().width + axisObj.tickPadding(), maxWidth);
                    maxHeight = Math.max(this.getBBox().height, maxHeight);
                })
                .remove();

            var max = {
                width: maxWidth,
                height: maxHeight
            }

            return max;
        }

        // Build main div and chart div
        chart.objs.mainDiv = d3.select(chart.settings.selector)
                                .attr('class', 'chart-wrapper')
                                .style('max-width', chart.svgWidth + 'px');
        // Add divs to make it centered and responsive
        chart.objs.innerDiv = chart.objs.mainDiv.append('div')
                                .attr('class', 'inner-wrapper');
        chart.objs.innerDiv
            .append('div').attr('class', 'outer-box')
            .append('div').attr('class', 'inner-box');

        if(!err.printError(err.checkAxis, '', 'checkAxis')) {
            return;
        }

        // Capture the inner div for the chart (the real container for the chart)
        chart.selector = chart.objs.innerDiv.select('.inner-box');
        chart.objs.chartDiv = chart.selector;

// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     //   d3.select(window).on('resize.chartInnerBox', chart.update);
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // Create the svg
        chart.objs.svg = chart.objs.chartDiv.append('svg')
            .attr('class', 'chart-area')
            .attr('width', chart.svgWidth + chart.axisMargin + chart.margin.left)
            .attr('height', chart.svgHeight);

        // Calculate the maxWidth of the data in pixels then readjust the chart position
        var yMax = getMaxText(chart.yScale, chart.settings.axisScale.yAxis, chart.objs.yAxis);
        var xMax = getMaxText(chart.xScale, chart.settings.axisScale.xAxis, chart.objs.xAxis);


        chart.objs.g = chart.objs.svg.append('g')
            .attr('transform', 'translate(' + (yMax.width + chart.axisMargin + chart.margin.left) + ',' + chart.margin.top + ')');

        // Create axes
        chart.objs.axes = chart.objs.g.append('g')
                            .attr('class', 'axes');

        chart.objs.axes.yAxis = chart.objs.axes.append('g')
                                    .attr('class', 'y axis')
                                    .call(chart.objs.yAxis);
        chart.objs.axes.yAxisLabel = chart.objs.axes.yAxis
                                        .append('text')
                                        .attr('class', 'label')
                                        .attr('transform', 'rotate(-90)')
                                        .attr('y', -yMax.width - chart.axisMargin)
                                        .attr('x', -chart.height / 2)
                                        .attr('dy', '.71em')
                                        .attr('fill', 'black')
                                        .style('text-anchor', 'middle')
                                        .style('font-weight', 'bold')
                                        .text(chart.yAxisLabel.toUpperCase());

        chart.objs.axes.xAxis =  chart.objs.axes.append('g')
                                    .attr('class', 'x axis')
                                    .attr('transform', 'translate(0,' + chart.height + ')')
                                    .call(chart.objs.xAxis);

        chart.objs.axes.xAxisLabel = chart.objs.axes.xAxis
                                        .append('text')
                                        .attr('class', 'label')
                                        .attr('x', chart.width / 2)
                                        .attr('y', xMax.height + chart.axisMargin)
                                        .attr('fill', 'black')
                                        .style('text-anchor', 'middle')
                                        .style('font-weight', 'bold')
                                        .text(chart.xAxisLabel.toUpperCase());


        for(var currentName in chart.groupObjs) {
            chart.groupObjs[currentName].g = chart.objs.g.append('g')
                                                .attr('class', 'group');
        }

        // Caption
        if(chart.settings.caption){
            chart.objs.caption = chart.objs.axes.xAxis.append('text')
                                    .attr('class', 'caption')
                                    .attr('fill', 'black')
                                    .attr('x', chart.width / 2)
                                    .attr('y', xMax.height + chart.axisMargin*2 )
                                    .style('text-anchor', 'middle')
                                    .style('font-weight', 'bold')
                                    .text(chart.settings.caption);

    // TO DO, IF IT DOESN'T BREAK ANYMORE, REMOVE THE COMMENTS BELOW ON THE OLD VERSION OF THE CODE
           /* chart.svgHeight += chart.axisMargin;
            chart.objs.svg.attr('height', chart.svgHeight); */
            chart.height -= chart.axisMargin;
            chart.yScale.range([chart.height, 0]);
            chart.objs.yAxis.scale(chart.yScale);
            chart.objs.axes.yAxis.call(chart.objs.yAxis);
            chart.objs.axes.xAxis.attr('transform', 'translate(0,' + chart.height + ')');
        }

        var xBandwidth;
        if (chart.settings.axisScale.xAxis === 'ordinal') {
            xBandwidth = chart.xScale.bandwidth();
        } else if (chart.settings.axisScale.xAxis === 'linear') {
            xBandwidth = chart.width / chart.xScale.ticks().length;
        }

        if (xMax.width >= xBandwidth) {
            chart.objs.axes.xAxis.selectAll('.tick text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-90)');
    // TO DO, IF IT DOESN'T BREAK ANYMORE, REMOVE THE COMMENTS BELOW ON THE OLD VERSION OF THE CODE
          /*  chart.objs.svg.attr('height', chart.svgHeight + xMax.width);
            chart.objs.axes.xAxisLabel.attr('y', xMax.width + chart.axisMargin);
            if (chart.objs.caption) {
                chart.objs.caption.attr('y', xMax.width + chart.axisMargin*2);
            } */

            chart.height -= xMax.width;
            chart.objs.axes.xAxisLabel.attr('y', xMax.width + chart.axisMargin);
            if (chart.objs.caption) {
                chart.objs.caption.attr('y', xMax.width + chart.axisMargin*2);
            }
            chart.yScale.range([chart.height, 0]);
            chart.objs.yAxis.scale(chart.yScale);
            chart.objs.axes.yAxis.call(chart.objs.yAxis);
            chart.objs.axes.xAxis.attr('transform', 'translate(0,' + chart.height + ')');
        }

        // Create tooltip div
        chart.objs.tooltip = chart.objs.g.append('g').attr('class', 'tooltip');

// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Update the chart on its size
    //     chart.update();
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })();
