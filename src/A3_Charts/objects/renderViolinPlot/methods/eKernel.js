/*
        * Epanechnikov function as a kernel function optimal in mean square error sense
        * CONSIDER OTHER KERNEL FUNCTIONS IN THE FUTURE: UNIFORM, TRIANGULAR, BIWEIGHT, TRIWEIGHT, NORMAL, ETC
        * @param {Float} scale
        * @return {function} function to do the calculation
*/
        function eKernel(scale) {
            return function (u) {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
            };
        }
