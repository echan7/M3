    /**
     * Parse the data for calculating appropriate base values for all plots
     * General self-executed group function to group appropriate values in chart.groupObjs settings
     * @param
     * @returns
    */
    (function prepareData(){

        // General Grouping function to store grouped values in chart.groupObjs
        var currentX = null;
        var currentY = null;
        var currentRow;
        var currentToolTip;

        for(currentRow = 0; currentRow < chart.data.length; currentRow++){
            currentX = chart.data[currentRow][chart.settings.xName];
            currentY = chart.data[currentRow][chart.settings.yName];
            currentToolTip = chart.data[currentRow];

            if(chart.groupObjs.hasOwnProperty(currentX)){
                chart.groupObjs[currentX].values.push(currentY);
                chart.groupObjs[currentX].tooltip.push(currentToolTip);
            } else {
                chart.groupObjs[currentX] = {};
                chart.groupObjs[currentX].values = [currentY];
                chart.groupObjs[currentX].tooltip = [currentToolTip];
            }
        }

//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    console.log('Chart = ');
    console.log(chart);
//REMEMBER DELETE CONSOLE WHEN FINISH ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })();
