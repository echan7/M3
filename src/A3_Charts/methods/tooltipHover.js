    /**
     * Tooltip Funtionality to show dashed line to respective axis of the point
     * NOTE POINT MUST BE CIRCLE SHAPE, MAYBE GENERALIZE TO ANY SHAPE IN FUTURE
     * @param  {[String]} cx   [circle x position]
     * @param  {[String]} cy   [circle y position]
     * @param  {[String]} r    [circle radius]
     * @param  {[String]} fill [circle color]
     */
    function showCircleAxisLine (cx, cy, r, fill) {
        var dropDest = {};
        var coodXAxis = transform(chart.objs.axes.xAxis.attr('transform'));
        dropDest.y = coodXAxis[1];
        dropDest.x = 0;

        chart.objs.tooltip.append('line')
            .attr('class', 'circle-tooltipline')
            .attr('x1', cx)
            .attr('y1', (cy < dropDest.y ? cy + r + 5 + 2 : cy - r - 5 - 2))
            .attr('x2', cx)
            .attr('y2', (cy < dropDest.y ? cy + r + 5 + 2 : cy - r - 5 - 2))
            .call(function(context) {
                context.style('fill', 'none')
                    .style('stroke', fill)
                    .style('stroke-width', 2)
                    .style('stroke-dasharray', ('3,3'));
            })
            .transition()
            .delay(350)
            .duration(350)
            .ease(d3.easeLinear)
            .attr('y2', dropDest.y);

        chart.objs.tooltip.append('line')
            .attr('class', 'circle-tooltipline')
            .attr('x1', (cx < dropDest.x ? cx + r + 5 + 2 : cx - r - 5 - 2))
            .attr('y1', cy)
            .attr('x2', (cx < dropDest.x ? cx + r + 5 + 2 : cx - r - 5 - 2))
            .attr('y2', cy)
            .call(function(context) {
                context.style('fill', 'none')
                    .style('stroke', fill)
                    .style('stroke-width', 2)
                    .style('stroke-dasharray', ('3,3'));
            })
            .transition()
            .delay(350)
            .duration(350)
            .ease(d3.easeLinear)
            .attr('x2', dropDest.x);
    }

    /**
     * ToolTip Function for circle shapes
     * @param  {[Object]} obj [Object contains data of tooltip]
     * @param  {[String]} cx   [circle x position]
     * @param  {[String]} cy   [circle y position]
     * @param  {[String]} r    [circle radius]
     * @param  {[String]} fill [circle color]
     * @return {[function]}      [function to be called upon]
     */
    function showCircleToolTip (obj, cx, cy, r, fill) {
        return function (){
            var w = 0;
            var h = 0;
            var height = 0;
            var y = 0;
            var textMargin = 5;
            var popupMargin = 10;
            var translateX, translateY;

            cx = parseFloat(cx);
            cy = parseFloat(cy);
            r = parseFloat(r);

            // Fade the popup stroke mixing the shape fill with 60% white
            var popupStrokeColor = d3.rgb(
                    d3.rgb(fill).r + 0.4 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.4 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.4 * (255 - d3.rgb(fill).b)
                ),
            // Fade the popup fill mixing the shape fill with 80% white
                popupFillColor = d3.rgb(
                    d3.rgb(fill).r + 0.6 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.6 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.6 * (255 - d3.rgb(fill).b)
                )


            chart.objs.tooltip.append('circle')
                .attr('class', 'circle-tooltipcircle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r)
                .call(function(context) {
                    context.attr('opacity', 0)
                        .style('fill', 'none')
                        .style('stroke', fill)
                        .style('stroke-width', 1);
                })
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr('r', r + 5)
                .call(function(context) {
                    context.attr('opacity', 1)
                        .style('stroke-width', 2);
                });
            if(!chart.boxPlots && !chart.violinPlots){
                showCircleAxisLine(cx, cy, r, fill);
            }

            var t = chart.objs.tooltip.append('g');


            var box = t.append('rect')
                        .attr('class', 'circle-tooltipbox');

            var data = objectToArray(obj);

            t.selectAll('dont').data(data).enter().append('text')
                .attr('class', 'circle-tooltiptext')
                .style('fill', 'black')
                .text(function(d) {return d;});

            t.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                h = (this.getBBox().height > h ? this.getBBox().height : h);
            });

            t.selectAll('text')
                .attr('x', 0)
                .attr('y', function () {
                // Increment the y position
                y += this.getBBox().height;
                // Position the text at the centre point
                return y - (this.getBBox().height / 2);
            });

            box.attr('x',-textMargin)
                .attr('y', -textMargin)
                .attr('height', Math.floor(y + textMargin) - 0.5)
                .attr('width', w + 2 * textMargin)
                .attr('rx', 5)
                .attr('ry', 5)
                .call(function (context) {
                        context.style('fill', popupFillColor)
                            .style('stroke', popupStrokeColor)
                            .style('stroke-width', 2)
                            .style('opacity', 0.95);
                });

            box.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                height = (this.getBBox().width > h ? this.getBBox().height : h);
            });

            // Shift the popup around to avoid overlapping the svg edge
           if (cx + r + textMargin + popupMargin + w < parseFloat(chart.width)) {
                // Draw centre right
                translateX = (cx + r + textMargin + popupMargin);
                translateY = (cy - ((y - (h - textMargin)) / 2));
            } else if (cx - r - (textMargin + popupMargin + w) > 0) {
                // Draw centre left
                translateX = (cx - r - (textMargin + popupMargin + w));
                translateY = (cy - ((y - (h - textMargin)) / 2));
            } else if (cy + r + y + popupMargin + textMargin < parseFloat(chart.height)) {
                // Draw centre below
                translateX = (cx - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (cy + r + 2 * textMargin);
            } else {
                // Draw centre above
                translateX = (cx - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (cy - y - (h - textMargin));
            }
            if (translateY < 0) {
                translateY = 0;
            } else if ((translateY + height) > chart.height){
                translateY = translateY - ((translateY + height) - chart.height);
            }
            t.attr('transform', 'translate(' + translateX + ',' + translateY + ')');
        }
    }

    /**
     * Tool Tip Function for box
     * @param  {[Object]} obj  [data description in object]
     * @param  {[String]} boxX [box x position]
     * @param  {[String]} boxY [box y position]
     * @param  {[String]} boxH [box height]
     * @param  {[String]} boxW [box width]
     * @param  {[String]} fill [box color]
     * @return {[function]}      [function to call the tool tip]
     */
    function showBoxToolTip (obj, boxX, boxY, boxH, boxW, fill) {
        return function (){
            var w = 0;
            var h = 0;
            var height = 0;
            var y = 0;
            var textMargin = 5;
            var popupMargin = 10;
            var translateX, translateY;

            boxX = parseFloat(boxX);
            boxY = parseFloat(boxY);
            boxH = parseFloat(boxH);
            boxW = parseFloat(boxW);

            // Fade the popup stroke mixing the shape fill with 60% white
            var popupStrokeColor = d3.rgb(
                    d3.rgb(fill).r + 0.4 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.4 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.4 * (255 - d3.rgb(fill).b)
                ),
            // Fade the popup fill mixing the shape fill with 80% white
                popupFillColor = d3.rgb(
                    d3.rgb(fill).r + 0.6 * (255 - d3.rgb(fill).r),
                    d3.rgb(fill).g + 0.6 * (255 - d3.rgb(fill).g),
                    d3.rgb(fill).b + 0.6 * (255 - d3.rgb(fill).b)
                )


            chart.objs.tooltip.append('rect')
                .attr('class', 'metrics-tooltipbox')
                .attr('x', boxX)
                .attr('y', boxY)
                .attr('width', boxW)
                .attr('height', boxH)
                .call(function(context) {
                    context.attr('opacity', 0)
                        .style('fill', 'none')
                        .style('stroke', fill)
                        .style('stroke-width', 1);
                })
                .transition()
                .duration(350)
                .ease(d3.easeLinear)
                .attr('x', boxX - 5)
                .attr('y', boxY - 5)
                .attr('width', boxW + 10)
                .attr('height', boxH + 10)
                .call(function(context) {
                    context.attr('opacity', 1)
                        .style('stroke-width', 2);
                });

            var t = chart.objs.tooltip.append('g');


            var box = t.append('rect')
                        .attr('class', 'metrics-tooltipbox');

            var data = objectToArray(obj);

            t.selectAll('dont').data(data).enter().append('text')
                .attr('class', 'metrics-tooltiptext')
                .style('fill', 'black')
                .text(function(d) {return d;});

            t.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                h = (this.getBBox().height > h ? this.getBBox().height : h);
            });

            t.selectAll('text')
                .attr('x', 0)
                .attr('y', function () {
                // Increment the y position
                y += this.getBBox().height;
                // Position the text at the centre point
                return y - (this.getBBox().height / 2);
            });

            box.attr('x',-textMargin)
                .attr('y', -textMargin)
                .attr('height', Math.floor(y + textMargin) - 0.5)
                .attr('width', w + 2 * textMargin)
                .attr('rx', 5)
                .attr('ry', 5)
                .call(function (context) {
                        context.style('fill', popupFillColor)
                            .style('stroke', popupStrokeColor)
                            .style('stroke-width', 2)
                            .style('opacity', 0.95);
                });

            box.each(function () {
                w = (this.getBBox().width > w ? this.getBBox().width : w);
                height = (this.getBBox().width > h ? this.getBBox().height : h);
            });

            // Shift the popup around to avoid overlapping the svg edge
           if (boxX + boxW + textMargin + popupMargin + w < parseFloat(chart.width)) {
                // Draw centre right
                translateX = (boxX + boxW + textMargin + popupMargin);
                translateY = (boxY +(boxH/2) - ((y - (h - textMargin)) / 2));
            } else if (boxX - boxW - (textMargin + popupMargin + w) > 0) {
                // Draw centre left
                translateX = (boxX - (textMargin + popupMargin + w));
                translateY = (boxY + (boxH/2)- ((y - (h - textMargin)) / 2));
            } else if (boxY + boxH + y + popupMargin + textMargin < parseFloat(chart.height)) {
                // Draw centre below
                translateX = (boxX - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (boxY + boxH + 2 * textMargin);
            } else {
                // Draw centre above
                translateX = (boxX - (2 * textMargin + w) / 2);
                translateX = (translateX > 0 ? translateX : popupMargin);
                translateX = (translateX + w < parseFloat(chart.width) ? translateX : parseFloat(chart.width) - w - popupMargin);
                translateY = (boxY - y - (h - textMargin));
            }
            if (translateY < 0) {
                translateY = 0;
            } else if ((translateY + height) > chart.height){
                translateY = translateY - ((translateY + height) - chart.height);
            }
            t.attr('transform', 'translate(' + translateX + ' , ' + translateY + ')');
        }
    }


    /**
     * Remove all tooltip
     * @return {[Function]} [function to call when on mouse leave]
     */
    function removeToolTip () {
        return function() {
            chart.objs.tooltip.selectAll('circle').remove();
            chart.objs.tooltip.selectAll('line').remove();
            chart.objs.tooltip.selectAll('rect').remove();
            chart.objs.tooltip.selectAll('g').remove();
        }
    }