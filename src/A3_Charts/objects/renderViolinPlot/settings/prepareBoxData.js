        /*
         * Check if Box metrics is calculated, if not, calculate and store it
         * @param
         * @returns
        */
        (function prepareBoxData() {
            for(var currentName in chart.groupObjs){
                if(!chart.groupObjs[currentName].boxMetrics){
                    chart.groupObjs[currentName].boxMetrics = {};
                    var copy = chart.groupObjs[currentName].values.slice();
                    copy.sort(d3.ascending);
                    chart.groupObjs[currentName].boxMetrics = calcBoxMetrics(copy);
                    chart.groupObjs[currentName].boxMetrics.values = copy;

                    var toolCopy = chart.groupObjs[currentName].tooltip.slice();
                    toolCopy.sort(function(a, b) {return a[chart.settings.yName] - b[chart.settings.yName]});
                    chart.groupObjs[currentName].boxMetrics.tooltip = toolCopy;
                }
            }

        })();