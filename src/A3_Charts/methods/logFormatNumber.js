/*
    * Format numbers as log
    * @param {float} d
    * @returns {float} log formatted number
*/
    function logFormatNumber(d) {
        var x = Math.log(d) / Math.log(10) + 1e-6;
        return Math.abs(x - Math.floor(x)) < 0.6 ? formatAsFloat(d) : '';
    }

