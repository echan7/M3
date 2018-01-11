/*
    * Format numbers as float
    * @param {float} d
    * @returns {float} float formated number
*/
    function formatAsFloat(d) {
        if (d % 1 !== 0) {
            return d3.format('.2f')(d);
        } else {
            return d3.format('.0f')(d);
        }
    }
