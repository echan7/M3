        /*
         * Check if Bubble Data for bubble Volume and Color
         * @param
         * @returns
        */
        (function prepareBubbleData() {

            var currentX = null;
            var currentRow;
            var currentToolTip;

            for(currentRow = 0; currentRow < chart.data.length; currentRow++){
                currentX = chart.data[currentRow][chart.settings.xName];
                currentToolTip = chart.data[currentRow];

                var obj = {
                    value: chart.data[currentRow][chart.settings.yName],
                    volume: chart.data[currentRow][bubbleOptions.bubbleVolume],
                    color: chart.data[currentRow][bubbleOptions.colorBy],
                    tooltip: currentToolTip
                };

                if(!chart.groupObjs[currentX].bubbleValues) {
                    chart.groupObjs[currentX].bubbleValues = [obj];
                } else {
                    chart.groupObjs[currentX].bubbleValues.push(obj);
                }
            }

        })();