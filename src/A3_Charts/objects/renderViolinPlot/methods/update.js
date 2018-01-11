/*
        * Generate the Values of each violin object distribution
        * Update it together as well when called upon
        * @param
        * @return
*/
        chart.violinPlots.update = function() {
            var currentName, currentViolin;

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;

                // Build the line chart sideways to make a violin over the current distribution
                // Hence, use the current yScale for vioin xViolinScale
                var xViolinScale = chart.yScale.copy();

                // Initialize Kernel Density Estimator Function
                currentViolin.kde = kernelDensityEstimator(eKernel(violinOptions.bandWidth), xViolinScale.ticks(violinOptions.resolution));
                currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].boxMetrics.values);

                // Initialize interpolation to min and max of the metrices
                var interpolateMax = chart.groupObjs[currentName].boxMetrics.max;
                var interpolateMin = chart.groupObjs[currentName].boxMetrics.min;

                if (violinOptions.clamp == 0 || violinOptions.clamp == -1) {
                    // When clamp is 0, calculate the min and max that is needed to bring the violin plot to a point
                    // interpolateMax = the Minimum value greater than the max where y = 0
                    interpolateMax = d3.min(currentViolin.kdeData.filter(function (d) {
                        return (d.x > chart.groupObjs[currentName].boxMetrics.max && d.y == 0)
                    }), function (d) {
                        return d.x;
                    });
                    // interpolateMin = the Maximum value less than the min where y = 0
                    interpolateMin = d3.max(currentViolin.kdeData.filter(function (d) {
                        return (d.x < chart.groupObjs[currentName].boxMetrics.min && d.y == 0)
                    }), function (d) {
                        return d.x;
                    });

                    // If clamp is -1 we need to extend the axises so that the violins come to a point
                    if (violinOptions.clamp == -1){
                        var kdeTester = eKernelTest(eKernel(violinOptions.bandWidth), chart.groupObjs[currentName].boxMetrics.values);
                        if (!interpolateMax) {
                            var interMaxY = kdeTester(chart.groupObjs[currentName].boxMetrics.max);
                            var interMaxX = chart.groupObjs[currentName].boxMetrics.max;
                            var count = 25; // Arbitrary limit to make sure we don't get an infinite loop
                            while (count > 0 && interMaxY != 0) {
                                interMaxY = kdeTester(interMaxX);
                                interMaxX += 1;
                                count -= 1;
                            }
                            interpolateMax = interMaxX;
                        }
                        if (!interpolateMin) {
                            var interMinY = kdeTester(chart.groupObjs[currentName].boxMetrics.min);
                            var interMinX = chart.groupObjs[currentName].boxMetrics.min;
                            var count = 25;  // Arbitrary limit to make sure we don't get an infinite loop
                            while (count > 0 && interMinY != 0) {
                                interMinY = kdeTester(interMinX);
                                interMinX -= 1;
                                count -= 1;
                            }
                            interpolateMin = interMinX;
                        }
                    }

                    // Check to see if the new values are outside the existing chart range
                    // If exist, they are assign to the master _yDomainVP
                    if (!violinOptions._yDomainVP) violinOptions._yDomainVP = chart.yRange.slice(0);
                    if (interpolateMin && interpolateMin < violinOptions._yDomainVP[0]) {
                        violinOptions._yDomainVP[0] = interpolateMin;
                    }
                    if (interpolateMax && interpolateMax > violinOptions._yDomainVP[1]) {
                        violinOptions._yDomainVP[1] = interpolateMax;
                    }
                }

                if (violinOptions.showViolinPlot) {
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 //   chart.update();
// IMPORTANT FIX CHART UPDATE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    xViolinScale = chart.yScale.copy();

                    // Recalculate KDE as xViolinScale Changed
                    currentViolin.kde = kernelDensityEstimator(eKernel(violinOptions.bandWidth), xViolinScale.ticks(violinOptions.resolution));
                    currentViolin.kdeData = currentViolin.kde(chart.groupObjs[currentName].boxMetrics.values);
                }

                currentViolin.kdeData = currentViolin.kdeData
                                            .filter(function (d) {
                                                return (!interpolateMin || d.x >= interpolateMin)
                                            })
                                            .filter(function (d) {
                                                return (!interpolateMax || d.x <= interpolateMax)
                                            });
            }

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;

                // Get the Violin object width
                var objBounds = getObjWidth(chart.xScale, violinOptions.width, currentName);
                var width = (objBounds.right - objBounds.left) / 2;

                var yViolinScale = d3.scaleLinear()
                                    .range([width, 0])
                                    .domain([0, d3.max(currentViolin.kdeData, function(d) {return d.y;})])
                                    .clamp(true);
                var area = d3.area()
                            .curve(violinOptions.interpolation)
                            .x(function (d) {return xViolinScale(d.x);})
                            .y0(width)
                            .y1(function (d) {return yViolinScale(d.y);});

                var line = d3.line()
                            .curve(violinOptions.interpolation)
                            .x(function (d) {return xViolinScale(d.x);})
                            .y(function (d) {return yViolinScale(d.y);});


                if (currentViolin.objs.left.area) {
                    currentViolin.objs.left.area
                        .datum(currentViolin.kdeData)
                        .attr('d', area);

                    currentViolin.objs.left.line
                        .datum(currentViolin.kdeData)
                        .attr('d', line);

                    currentViolin.objs.right.area
                        .datum(currentViolin.kdeData)
                        .attr('d', area);

                    currentViolin.objs.right.line
                        .datum(currentViolin.kdeData)
                        .attr('d', line);

                }

                // Rotate Violins
                currentViolin.objs.left.g.attr('transform', 'rotate(90,0,0)   translate(0,-' + objBounds.left + ')  scale(1,-1)');
                currentViolin.objs.right.g.attr('transform', 'rotate(90,0,0)  translate(0,-' + objBounds.right + ')');
            }
        };
