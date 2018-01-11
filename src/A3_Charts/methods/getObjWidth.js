/*
     * Takes a percentage as returns the values that correspond to that percentage of the group range witdh
     * @param objWidth Percentage of range band
     * @param gName The bin name to use to get the x shift
     * @returns {{left: null, right: null, middle: null}}
*/
    function getObjWidth(scale, objWidth, gName) {
        var objSize = {left: null, right: null, middle: null};
        var width = scale.bandwidth() * (objWidth / 100);
        var padding = (scale.bandwidth() - width) / 2;
        var gShift = scale(gName);
        objSize.middle = scale.bandwidth() / 2 + gShift;
        objSize.left = padding + gShift;
        objSize.right = objSize.left + width;
        return objSize;
    }
