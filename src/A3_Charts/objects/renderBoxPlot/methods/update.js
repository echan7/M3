/*
        * Generate the Values of each box object and draw it
        * Update it together as well when called upon
        * @param
        * @return
*/
        chart.boxPlots.update = function() {
            var currentName, currentBox;

            for(currentName in chart.groupObjs) {
                currentBox = chart.groupObjs[currentName].boxPlot;

                // Get Box Width
                var objBounds = getObjWidth(chart.xScale, boxOptions.boxWidth, currentName);
                var width = (objBounds.right - objBounds.left);

                var scaledBoxMetrics = {};
                for(var attr in chart.groupObjs[currentName].boxMetrics) {
                    scaledBoxMetrics[attr] = null;
                    scaledBoxMetrics[attr] = chart.yScale(chart.groupObjs[currentName].boxMetrics[attr]);
                }

                var tooltip = clone(chart.groupObjs[currentName].boxMetrics);
                delete tooltip.values;
                delete tooltip.tooltip;
                var x, y, height, width, fill;

                // Box
                if (currentBox.objs.box) {
                    currentBox.objs.box
                        .attr('x', objBounds.left)
                        .attr('width', width)
                        .attr('y', scaledBoxMetrics.quartile3)
                        .attr('rx', 1)
                        .attr('ry', 1)
                        .attr('height', -scaledBoxMetrics.quartile3 + scaledBoxMetrics.quartile1);

                    x = currentBox.objs.box.attr('x');
                    y = currentBox.objs.box.attr('y');
                    height = currentBox.objs.box.attr('height');
                    width = currentBox.objs.box.attr('width');
                    fill = currentBox.objs.box.style('fill');
                    currentBox.objs.box.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                       .on('mouseout', removeToolTip());
                }

                // Lines
                var lineBounds = null;
                if(boxOptions.lineWidth) {
                    lineBounds = getObjWidth(chart.xScale, boxOptions.lineWidth, currentName);
                } else {
                    lineBounds = objBounds;
                }

                // Whiskers
                if (currentBox.objs.upperWhisker) {
                    currentBox.objs.upperWhisker.fence
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.upperInnerFence)
                        .attr('y2', scaledBoxMetrics.upperInnerFence);

                    currentBox.objs.upperWhisker.line
                        .attr('x1', lineBounds.middle)
                        .attr('x2', lineBounds.middle)
                        .attr('y1', scaledBoxMetrics.quartile3)
                        .attr('y2', scaledBoxMetrics.upperInnerFence);

                    currentBox.objs.lowerWhisker.fence
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.lowerInnerFence)
                        .attr('y2', scaledBoxMetrics.lowerInnerFence);

                    currentBox.objs.lowerWhisker.line
                        .attr('x1', lineBounds.middle)
                        .attr('x2', lineBounds.middle)
                        .attr('y1', scaledBoxMetrics.quartile1)
                        .attr('y2', scaledBoxMetrics.lowerInnerFence);
                }

                // Median
                if (currentBox.objs.median) {
                    currentBox.objs.median.line
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.median)
                        .attr('y2', scaledBoxMetrics.median);
                    currentBox.objs.median.circle
                        .attr('cx', lineBounds.middle)
                        .attr('cy', scaledBoxMetrics.median);
                    if (currentBox.objs.box) {
                        currentBox.objs.median.circle.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                     .on('mouseout', removeToolTip());
                        currentBox.objs.median.line.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                   .on('mouseout', removeToolTip());
                    }
                }

                // Mean
                if (currentBox.objs.mean) {
                    currentBox.objs.mean.line
                        .attr('x1', lineBounds.left)
                        .attr('x2', lineBounds.right)
                        .attr('y1', scaledBoxMetrics.mean)
                        .attr('y2', scaledBoxMetrics.mean);
                    currentBox.objs.mean.circle
                        .attr('cx', lineBounds.middle)
                        .attr('cy', scaledBoxMetrics.mean);
                    if (currentBox.objs.box) {
                        currentBox.objs.mean.circle.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                   .on('mouseout', removeToolTip());
                        currentBox.objs.mean.line.on('mouseover', showBoxToolTip(tooltip, x, y, height, width, fill))
                                                 .on('mouseout', removeToolTip());
                    }
                }

                var cx, cy, r;

                // Outliers
                var currentPoint;
                if(currentBox.objs.outliers && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.outliers) {

                        currentBox.objs.outliers[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.outliers[currentPoint].value));

                        tooltip = currentBox.objs.outliers[currentPoint].tooltip;
                        cx = currentBox.objs.outliers[currentPoint].point.attr('cx');
                        cy = currentBox.objs.outliers[currentPoint].point.attr('cy');
                        r = currentBox.objs.outliers[currentPoint].point.attr('r');
                        fill = currentBox.objs.outliers[currentPoint].point.style('fill');

                        currentBox.objs.outliers[currentPoint].point.on('mouseover', showCircleToolTip(tooltip, cx, cy, r, fill))
                                                                    .on('mouseout', removeToolTip());
                    }
                }

                // Extremes
                if(currentBox.objs.extremes && boxOptions.showOutliers) {
                    for(currentPoint in currentBox.objs.extremes) {
                        currentBox.objs.extremes[currentPoint].point
                            .attr('cx', objBounds.middle + addJitter(boxOptions.scatterOutliers, width))
                            .attr('cy', chart.yScale(currentBox.objs.extremes[currentPoint].value));

                        tooltip = currentBox.objs.extremes[currentPoint].tooltip;
                        cx = currentBox.objs.extremes[currentPoint].point.attr('cx');
                        cy = currentBox.objs.extremes[currentPoint].point.attr('cy');
                        r = currentBox.objs.extremes[currentPoint].point.attr('r');
                        fill = currentBox.objs.extremes[currentPoint].point.style('stroke');

                        currentBox.objs.extremes[currentPoint].point.on('mouseover', showCircleToolTip(tooltip, cx, cy, r, fill))
                                                                    .on('mouseout', removeToolTip());
                    }
                }
            }
        };

