/*
        * Create svg elements for the box plot
        * @param
        * @return
*/
        chart.boxPlots.prepareBoxPlot = function() {
            var currentName, currentBox;

            if(boxOptions.colors) {
                chart.boxPlots.color = getColorFunct(boxOptions.colors);
            } else {
                chart.boxPlots.color = chart.colorFunct;
            }

            if(boxOptions.show == false) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentBox = chart.groupObjs[currentName].boxPlot;

                currentBox.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'box-plot');

                // Box
                if (boxOptions.showBox) {
                    currentBox.objs.box = currentBox.objs.g.append('rect')
                        .attr('class', 'box')
                        .style('fill', chart.boxPlots.color(currentName))
                        // Stroke around box is hidden by default but can be shown through css with stroke-width
                        .style('stroke', chart.boxPlots.color(currentName));
                }

                // Median
                if (boxOptions.showMedian) {
                    currentBox.objs.median = {
                        line: null,
                        circle: null
                    };
                    currentBox.objs.median.line = currentBox.objs.g.append('line')
                        .attr('class', 'median');
                    currentBox.objs.median.circle = currentBox.objs.g.append('circle')
                        .attr('class', 'median')
                        .attr('r', boxOptions.medianCSize)
                        .style('fill', chart.boxPlots.color(currentName));
                }

                // Mean
                if (boxOptions.showMean) {
                    currentBox.objs.mean = {
                        line: null,
                        circle: null
                    };
                    currentBox.objs.mean.line = currentBox.objs.g.append('line')
                        .attr('class', 'mean');
                    currentBox.objs.mean.circle = currentBox.objs.g.append('circle')
                        .attr('class', 'mean')
                        .attr('r', boxOptions.meanCSize)
                        .style('fill', chart.boxPlots.color(currentName));
                }

                // Whiskers
                if (boxOptions.showWhiskers) {
                    currentBox.objs.upperWhisker = {
                        fence: null,
                        line: null
                    };
                    currentBox.objs.lowerWhisker = {
                        fence: null,
                        line: null
                    };
                    currentBox.objs.upperWhisker.fence = currentBox.objs.g.append('line')
                        .attr('class', 'upper whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                    currentBox.objs.upperWhisker.line = currentBox.objs.g.append('line')
                        .attr('class', 'upper whisker')
                        .style('stroke', chart.boxPlots.color(currentName));

                    currentBox.objs.lowerWhisker.fence = currentBox.objs.g.append('line')
                        .attr('class', 'lower whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                    currentBox.objs.lowerWhisker.line = currentBox.objs.g.append('line')
                        .attr('class', 'lower whisker')
                        .style('stroke', chart.boxPlots.color(currentName));
                }

                // Outliers and Extremes
                if (boxOptions.showOutliers) {
                    if(!currentBox.objs.outliers) calcAllOutliers();
                    var currentPoint;
                    if(currentBox.objs.outliers.length) {
                        var outSvg = currentBox.objs.g.append('g').attr('class', 'boxplot outliers');
                        for(currentPoint in currentBox.objs.outliers) {
                            currentBox.objs.outliers[currentPoint].point = outSvg.append('circle')
                                .attr('class', 'outlier')
                                .attr('r', boxOptions.outlierCSize)
                                .style('fill', chart.boxPlots.color(currentName));
                        }
                    }

                    if(currentBox.objs.extremes.length) {
                        var extSvg = currentBox.objs.g.append('g').attr('class', 'boxplot extremes');
                        for(currentPoint in currentBox.objs.extremes) {
                            currentBox.objs.extremes[currentPoint].point = extSvg.append('circle')
                                .attr('class', 'extreme')
                                .attr('r', boxOptions.extremeCSize)
                                .style('stroke', chart.boxPlots.color(currentName));
                        }
                    }
                }
            }

            if(!chart.violinPlots){
                var legendSize = getLegendSize('box', chart.boxPlots.color, chart.settings.xName);
                generateLegend('box', legendSize, chart.boxPlots.color, chart.settings.xName);
            }
        }

