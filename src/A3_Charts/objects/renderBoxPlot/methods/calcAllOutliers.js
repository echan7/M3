/*
        * Function to calculates all extreme and outlier points for each group
        * Strore them in group as arrays
        * Extremes are > 3 times iqr on both ends of the box
        * Outliers are > 1.5 times iqr on both ends of the box
*/
        var calcAllOutliers = (function() {
/*
            * Create array of extremes and outliers and store the values in current group in place
            * @param {object} currentGroup of xaxis
            * @return
*/
            function calcOutliers(currentGroup) {
                var currentExtremes = [];
                var currentOutliers = [];
                var currentOut, index;
                for(index = 0; index < currentGroup.boxMetrics.values.length; index++) {
                    currentOut = {value: currentGroup.boxMetrics.values[index], tooltip:currentGroup.boxMetrics.tooltip[index]};

                    if(currentOut.value < currentGroup.boxMetrics.lowerInnerFence) {
                        if(currentOut.value < currentGroup.boxMetrics.lowerOuterFence) {
                            currentExtremes.push(currentOut);
                        } else {
                            currentOutliers.push(currentOut);
                        }
                    } else if(currentOut.value > currentGroup.boxMetrics.upperInnerFence) {
                        if(currentOut.value > currentGroup.boxMetrics.upperOuterFence) {
                            currentExtremes.push(currentOut);
                        } else {
                            currentOutliers.push(currentOut);
                        }
                    }
                }
                currentGroup.boxPlot.objs.outliers = currentOutliers;
                currentGroup.boxPlot.objs.extremes = currentExtremes;
            }

            for (var currentName in chart.groupObjs) {
                calcOutliers(chart.groupObjs[currentName]);
            }

        })();
