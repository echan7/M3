	/**
	 * Convert object to an array, formating  float numbers in the process
	 * @param  {[Object]} obj [Assume object containing any type]
	 * @return {[Array]}  data [Array of formatted float numbers]
	 */
    function objectToArray(obj) {
	    var data = [];
	    var keys = Object.keys(obj);
	    for(var i =0; i < keys.length; i ++){
	        var temp;
	        if(typeof obj[keys[i]] === 'string') {
	            if(typeof parseFloat(obj[keys[i]]) === 'number' && !isNaN(parseFloat(obj[keys[i]])) && parseFloat(obj[keys[i]]).toString().length == obj[keys[i]].length) {
	                temp = formatAsFloat(parseFloat(obj[keys[i]]));
	            } else {
	                temp = obj[keys[i]];
	            }
	        } else if(typeof obj[keys[i]] === 'number') {
	            temp = formatAsFloat(obj[keys[i]]);
	        } else {
	            temp = obj[keys[i]];
	        }

	        data.push(keys[i].charAt(0).toUpperCase() + keys[i].slice(1) + ': ' + temp);
	    }

	   	return data;
    }

