/*
    * Accept a function, array or object mapping and create a color function  from it
    * @param {function | [] | object} colorOptions
    * @returns {function} Function to determine chart color priority
*/
    function getColorFunct(colorOptions) {
        if(typeof colorOptions == 'function'){
            return colorOptions
        } else if (Array.isArray(colorOptions)){

            var colorMap = {}, currentColor = 0;
            for (var currentName in chart.groupObjs) {
                colorMap[currentName] = colorOptions[currentColor];
                currentColor = (currentColor + 1) % colorOptions.length;
            }
            return function (group){
                return colorMap[group];
            }
        } else if (typeof colorOptions == 'object') {

            return function (group) {
                return colorOptions[group];
            }
        } else {
            return d3.scaleOrdinal(d3.schemeCategory10);
        }
    }
