/*
        * Create svg elements for the violin plot
        * @param
        * @return
*/
        chart.violinPlots.prepareViolin = function() {
            var currentName, currentViolin;

            if(violinOptions.colors) {
                chart.violinPlots.color = getColorFunct(violinOptions.colors);
            } else {
                chart.violinPlots.color = chart.colorFunct;
            }

            if(violinOptions.show == false) {
                return;
            }

            for(currentName in chart.groupObjs) {
                currentViolin = chart.groupObjs[currentName].violin;
                currentViolin.objs.g = chart.groupObjs[currentName].g.append('g')
                                        .attr('class', 'violin-plot');
                currentViolin.objs.left = {
                    area: null,
                    line: null,
                    g: currentViolin.objs.g.append('g')
                };
                currentViolin.objs.right = {
                    area: null,
                    line: null,
                    g: currentViolin.objs.g.append('g')
                };

                if(violinOptions.showViolinPlot !== false) {
                    // Area
                    currentViolin.objs.left.area = currentViolin.objs.left.g.append('path')
                        .attr('class', 'area')
                        .style('fill', chart.violinPlots.color(currentName));

                    currentViolin.objs.right.area = currentViolin.objs.right.g.append('path')
                        .attr('class', 'area')
                        .style('fill', chart.violinPlots.color(currentName));

                    // Stroke Around Area (Lines)
                    currentViolin.objs.left.line = currentViolin.objs.left.g.append('path')
                        .attr('class', 'line')
                        .style('fill', 'none')
                        .style('stroke', chart.violinPlots.color(currentName));

                    currentViolin.objs.right.line = currentViolin.objs.right.g.append('path')
                        .attr('class', 'line')
                        .style('fill', 'none')
                        .style('stroke', chart.violinPlots.color(currentName));
                }
            }

            var legendSize = getLegendSize('violin', chart.violinPlots.color, chart.settings.xName);
            generateLegend('violin', legendSize, chart.violinPlots.color, chart.settings.xName);
        };
