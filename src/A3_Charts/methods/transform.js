	/**
	 * Transform the translated coordinate string into x and y values
	 * NOTE UNCLEAN WAY TO CUT STRING MANUALLY USING JAVASCRIPT FUNCTION
	 * MAYBE CONSIDER REFERRING D3 IN THE FUTURE BECAUSE D3 v4 REMOVED TRANSFORM FUNCTION
	 * @param  {[String]} translate [String contains transform attribute]
	 * @return {[Array]} cood       [Array of x and y value]
	 */
    function transform(translate) {
    	if(translate == null) {
    		throw new Error('Co-ordinate of object is null');
    	}
    	var cood = translate.substring(translate.indexOf('(')+1, translate.indexOf(')')).split(',');
    	return cood;
    }

