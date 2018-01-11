        chart.bubblePlots.update = function() {
            var currentName, currentBubble;

            for(currentName in chart.groupObjs) {
                currentBubble = chart.groupObjs[currentName].bubblePlot;


                var xPosition, yPosition;
                // Check linear or ordinal and get bubble position
                if(chart.settings.axisScale.xAxis === 'ordinal') {
                    // Get Bubble Width
                    var objBoundsX = getObjWidth(chart.xScale, bubbleOptions.bubbleWidth, currentName);
                    xPosition = objBoundsX.middle;
                } else if (chart.settings.axisScale.xAxis === 'linear') {
                    xPosition = chart.xScale(currentName);
                }

                // Bubble
                if (currentBubble.objs.bubble) {
                    for(var currentBubbleValue in chart.groupObjs[currentName].bubbleValues){
                        var value = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].value;
                        var tooltip = chart.groupObjs[currentName].bubbleValues[currentBubbleValue].tooltip;
                        if(chart.settings.axisScale.yAxis === 'ordinal') {
                            // Get Bubble Width
                            var objBoundsY = getObjWidth(chart.yScale, bubbleOptions.bubbleWidth, value);
                            yPosition = objBoundsY.middle;
                        } else if (chart.settings.axisScale.yAxis === 'linear') {
                            yPosition = chart.yScale(value);
                        }

                        currentBubble.objs.bubble[currentBubbleValue]
                            .attr('cx', xPosition)
                            .attr('cy', yPosition);


                        var r, fill;
                        r = currentBubble.objs.bubble[currentBubbleValue].attr('r');
                        fill = currentBubble.objs.bubble[currentBubbleValue].style('fill');
                        currentBubble.objs.bubble[currentBubbleValue].on('mouseover', showCircleToolTip(tooltip, xPosition, yPosition, r, fill))
                                                                     .on('mouseout', removeToolTip());


                    }

                }
            }
        };
