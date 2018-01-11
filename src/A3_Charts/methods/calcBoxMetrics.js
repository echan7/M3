    /**
     * Calculate Metrics for General Box Plot, Assumes values are sorted
     * @param  {[array]} values Sorted Array of Numbers
     * @return {[object]} boxMetrics Object with metrics param
     */
    function calcBoxMetrics(values){

        var boxMetrics = {
            max: null,
            upperOuterFence: null,
            upperInnerFence: null,
            // 75%-tile of the values
            quartile3: null,
            median: null,
            mean: null,
            // 25%-tile of the values
            quartile1: null,
            // InterQuartile Range
            iqr: null,
            lowerInnerFence: null,
            lowerOuterFence: null,
            min: null
        }

        boxMetrics.max = d3.max(values);
        boxMetrics.quartile3 = d3.quantile(values, 0.75);
        boxMetrics.median = d3.median(values);
        boxMetrics.mean = d3.mean(values);
        boxMetrics.quartile1 = d3.quantile(values, 0.25);
        boxMetrics.iqr = boxMetrics.quartile3 - boxMetrics.quartile1;
        boxMetrics.min = d3.min(values);

        // Adjust InnerFences to be the closest value to the IQR without going past InnerFence max range
        var LIF = boxMetrics.quartile1 - (1.5*boxMetrics.iqr);
        var UIF = boxMetrics.quartile3 + (1.5*boxMetrics.iqr);
        for(var i = 0; i < values.length; i++){
            if(values[i] < LIF){
                continue;
            }
            if(!boxMetrics.lowerInnerFence && values[i] >= LIF){
                boxMetrics.lowerInnerFence = values[i];
                continue;
            }
            if(values[i] > UIF){
                boxMetrics.upperInnerFence = values[i-1];
                break;
            }
        }

        // Calculate max range of OuterFences
        boxMetrics.lowerOuterFence = boxMetrics.quartile1 - (3*boxMetrics.iqr);
        boxMetrics.upperOuterFence = boxMetrics.quartile3 + (3*boxMetrics.iqr);

        // If Inner Fences are not declared, none of the values outside of IQR are within InnerFences range
        // Set the InnerFences to the respective min and max of values
        if(!boxMetrics.lowerInnerFence) {
            boxMetrics.lowerInnerFence = boxMetrics.min;
        }
        if(!boxMetrics.upperInnerFence) {
            boxMetrics.upperInnerFence = boxMetrics.max;
        }

        return boxMetrics;
    }