    /**
     * Error Handling Begin, an object of error functions to be called globally
     */

    var err = {};

    /**
     * Error Messages
     * @type {Object}
     */
    err.messages = {
        checkNumber: 'Value must be a number',
        checkPositive: 'Value must be greater than zero',
        checkNonNegative: 'Value must be greater than or equal to zero',
        checkLogLinear: 'Scale should be either log or linear',
        checkDistro: 'x Axis must be ordinal, y Axis must be log/linear',
        checkAxis: 'Values for axis are unsuitable for the scale you chose'
    }

    /**
     * Check if every item in array is a number
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkNumber = function(array) {
        for (var i = 0; i < array.length; i++) {
            if(typeof array[i] != 'number' && isNaN(array[i])){
                return false;
            }
        }
        return true;
    }

    /**
     * Check if every item must be more than 0
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkPositive = function(array) {
        for (var i = 0; i < array.length; i ++) {
            if(array[i] <= 0 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if every item must be more than or equals to 0
     * @param  {[Array]} array [Array of values]
     * @return {[Boolean]}
     */
    err.checkNonNegative = function(array) {
        for (var i = 0; i < array.length; i ++) {
            if(array[i] < 0 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if type of scale is log or linear
     * @param  {[String]} scale [String containing information about the scale]
     * @return {[Boolean]}
     */
    err.checkLogLinear = function(scale) {
        if (scale === 'log') {
            return true;
        }

        if (scale === 'linear') {
            return true;
        }

        return false;
    }


    /**
     * General function to check Box and Violin chart errors
     * @return {[Boolean]}
     */
    err.checkDistro = function() {
        if (chart.xScale.scale !== 'ordinal') {
            return false;
        }

        return err.checkLogLinear(chart.yScale.scale);
    }

    /**
     * General Function to check axis
     * @return {[Boolean]}
     */
    err.checkAxis = function() {
        var errObj = {
            xAxis: null,
            yAxis: null
        };

        (function() {
            if(chart.xScale.scale === 'ordinal') {
                errObj.xAxis = true;
                return;
            } else if (chart.xScale.scale === 'linear') {
                errObj.xAxis = err.checkNumber(chart.xRange);
                return;
            } else if (chart.xScale.scale === 'log') {
                if (err.checkNumber(chart.xRange)) {
                    errObj.xAxis = true;
                } else {
                    errObj.xAxis = false;
                    return
                }
                if (err.checkPositive(chart.xRange)) {
                    errObj.xAxis = true;
                } else {
                    errObj.xAxis = false;
                    return;
                }
                return
            }
        })();

        (function() {
            if(chart.yScale.scale === 'ordinal') {
                errObj.yAxis = true;
                return;
            } else if (chart.yScale.scale === 'linear') {
                errObj.yAxis = err.checkNumber(chart.yRange);
                return;
            } else if (chart.yScale.scale === 'log') {
                if (err.checkNumber(chart.yRange)) {
                    errObj.yAxis = true;
                } else {
                    errObj.yAxis = false;
                    return
                }
                if (err.checkPositive(chart.yRange)) {
                    errObj.yAxis = true;
                } else {
                    errObj.yAxis = false;
                    return;
                }
                return;
            }
        })();

        if (errObj.xAxis && errObj.yAxis) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * Main caller function to print the error if found
     * @param  {[Function]} errFunc [Error Function to call]
     * @param  {[Parameter]} param   [Parameter to pass into the function]
     * @param  {[String]} name    [String containing information about the error]
     * @return {[Boolean]}
     */
    err.printError = function(errFunc, param, name) {
        if(errFunc(param)) {
            return true;
        }

        if(chart.objs.innerDiv) {
            chart.objs.innerDiv.remove();
        }

        throw new Error(err.messages[name]);
    }
