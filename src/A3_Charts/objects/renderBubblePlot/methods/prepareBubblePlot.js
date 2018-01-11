        /**
         * Create svg elements for bubble plot
         * @param
         * @return
         */
        chart.bubblePlots.prepareBubblePlot = function() {
            var currentName, currentBubble;

            if(bubbleOptions.colors) {
                chart.bubblePlots.color = getColorFunct(bubbleOptions.colors);
            } else {
                chart.bubblePlots.color = chart.colorFunct;
            }

            if(bubbleOptions.show == false) {
                return;
            }

            /**
             * Specify the range of bubble size
             * Default for smallest bubble will always be 3 pixel
             * If both axis are ordinal, the maximum bubble size cannot be bigger than the min of both axis bandwidth
             * If one of them is linear, the maximum bubble size cannot be bigger than the ordinal axis bandwidth
             * otherwise, if both linear the current range will always be [3, 30]
             */
            var bubbleRange;
            if(chart.settings.axisScale.xAxis === 'ordinal' && chart.settings.axisScale.yAxis === 'ordinal') {
                bubbleRange = [3, (((Math.min(chart.xScale.bandwidth(), chart.yScale.bandwidth()))*0.9)/2)];
            } else if(chart.settings.axisScale.xAxis === 'ordinal' && chart.settings.axisScale.yAxis !== 'ordinal') {
                bubbleRange = [3, (((chart.xScale.bandwidth())*0.9)/2)];
            } else if(chart.settings.axisScale.xAxis !== 'ordinal' && chart.settings.axisScale.yAxis === 'ordinal') {
                bubbleRange = [3, (((chart.yScale.bandwidth())*0.9)/2)];
            } else {
                // TAKE NOTE FOR FUTURE, CURRENT BUBBLE VOLUME FOR BOTH AXIS LINEAR IS HARD CODED
                bubbleRange = [3, 30];
            }

            var tenMultiples = 0;
            /**
             * Get the min and max of data, then change the type to number
             */
            var domain = d3.extent(chart.data.map(function(d) {return +d[bubbleOptions.bubbleVolume]})).map(function(d) {
                // For each min and max of the return get the number of digits
                    if(d > 0) {
                        tenMultiples = Math.floor(Math.log10(d));
                    }
                    tenMultiples = Math.pow(10, tenMultiples);
                    // Zero out the every digit except the most significant digit
                    d = (Math.floor(d/tenMultiples))*tenMultiples;
                    return d;
                });

            // Bump the max to the ceiling
            domain[1] = domain[1] + tenMultiples;

            var bubbleScale = d3.scaleSqrt()
                                .domain(domain)
                                .range(bubbleRange);

            if(!err.printError(err.checkNonNegative, domain, 'checkNonNegative')) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentBubble = chart.groupObjs[currentName].bubblePlot;
                currentBubble.objs.bubble = [];
                currentBubble.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'bubble-plot');

                // Bubble
                if (bubbleOptions.showBubble) {
                    for(var currentBubbleValue in chart.groupObjs[currentName].bubbleValues){
                        var volume = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].volume;
                        var color = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].color;
                        if(!currentBubble.objs.bubble){
                            currentBubble.objs.bubble = [];
                            currentBubble.objs.bubble = [currentBubble.objs.g.append('circle')
                                .attr('class', 'bubble')
                                .attr('r', function() {return bubbleScale(volume);})
                                .style('fill', chart.bubblePlots.color(color))
                                //.style('stroke', 'rgb(107, 148, 177)')
                                .style('opacity', 0.8)];
                        } else {
                            currentBubble.objs.bubble.push(currentBubble.objs.g.append('circle')
                                .attr('class', 'bubble')
                                .attr('r', function() {return bubbleScale(volume);})
                                .style('fill', chart.bubblePlots.color(color))
                                //.style('stroke', 'rgb(107, 148, 177)')
                                .style('opacity', 0.8));
                        }
                    }
                }
            }

            var legendSize = getLegendSize('bubble', chart.bubblePlots.color, bubbleOptions.colorBy);
            generateLegend('bubble', legendSize, chart.bubblePlots.color, bubbleOptions.colorBy);

        }