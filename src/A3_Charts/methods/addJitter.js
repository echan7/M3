    /**
     * Adds jitter to the  scatter point plot
     * @param {[boolean]} doJitter [true or false whether to jitter the point]
     * @param {[float]} width    [width percent of range band to cover with jitter]
     */
    function addJitter(doJitter, width) {
        if (doJitter !== true || width == 0) {
            return 0
        }
        return Math.floor(Math.random() * width) - width / 2;
    }
