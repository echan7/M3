/*
        * Sample kernelDensityEstimator test function
        * Used to find the roots for adjusting violin axis
        * Given an array, find the value for a single point, even if it is not in the domain
        * @param {function} kernel, {array} array
        * @return {float} mean of all kernel function return values
*/
        function eKernelTest(kernel, array) {
            return function (testX) {
                return d3.mean(array, function (v) {return kernel(testX - v);})
            }
        }
