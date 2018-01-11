	/**
	 * Check if it's a array of number, if it is, return the original array. Otherwise, return the array of string padded to sort
	 * @param  {[Array]} array [original array]
	 * @return {[Array]} array [padded array]
	 */
	function padDataAndSort(array) {
	    var isNumber = false;
	    for(var item in array) {
	        if(typeof parseFloat(array[item]) === 'number' && !isNaN(parseFloat(array[item])) && parseFloat(array[item]).toString().length == array[item].toString().length) {
	           isNumber = true;
	        } else {
	           isNumber = false;
	           break;
	        }
	    }

	    if(isNumber) {
	        return array.sort(d3.ascending);
	    }

	    var temp = array.slice();
	    var longest = temp.reduce(function (a, b) { return a.length > b.length ? a : b; });

	    for(var item in array) {

	        var padding = Array(longest.length+1).join(' ');
	        array[item] = (padding + array[item]).slice(-longest.length)
	    }

	    array.sort(d3.ascending);
	    array = array.map(function(d) {return d.replace(/(^\s+|\s+$)/g, '');});

	    return array;
	}