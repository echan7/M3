/*
        * Kernel Density Estimator function is a non-parametric way to estimate the probability density function of a set of random variable
        * Uses a range of kernel functions over a smoothing parameter from chart.violinPlots.option.bandWidth
        * @param {function} kernel, {array} array of values
        * @return {array} Array of objects with elements x: orignal value from array y: mean of all kernel function return values
*/
        function kernelDensityEstimator(kernel, array) {
            return function (sample) {
                return array.map(function (val) {
                    return {x:val, y:d3.mean(sample, function (v) {return kernel(val - v);})};
                });
            };
        }
