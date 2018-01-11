/*
    * Clone an object as a copy, usually options object pass in as a param
    * *CONSIDER CLONING ARRAY, OBJECT OF TIME AND TREES IN THE FUTURE, SHOULD ALSO IMPLEMENT ERROR HANDLING
    * @param {object} obj
    * @return {object} copy
*/
    function clone(obj) {
        if (null == obj || 'object' != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
