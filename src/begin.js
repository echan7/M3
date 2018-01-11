
 (function (context, a3) {
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS
        module.exports = a3(require('d3'), require('crossfilter'));

    } else {
        if (typeof define === 'function' && define.amd){
            // RequireJS | AMD
            define(['d3'], ['crossfilter'], function (d3, crossfilter) {
                // publish a3 to the global namespace for backwards compatibility
                // and define it as an AMD module
                context.a3 = a3(d3, crossfilter);
                return context.a3;
            });
        } else {
            // No AMD, expect d3 to exist in the current context and publish
            // a3 to the global namespace
            if (!context.d3 || !context.crossfilter) {
                if (console && console.warn) {
                    if(!context.d3){
                        console.warn('a3 requires d3 to run.  Are you missing a reference to the d3 library?');
                    } else if(!context.crossfilter){
                        console.warn('a3 requires crossfilter to run. Are you missing a reference to crossfilter library?');
                    }
                } else {
                    if(!context.d3){
                        throw 'a3 requires d3 to run.  Are you missing a reference to the d3 library?';
                    } else if(!context.crossfilter){
                        throw 'a3 requires crossfilter to run. Are you missing a reference to crossfilter library?';
                    }
                }
            } else {
                context.a3 = a3(context.d3, context.crossfilter);
            }
        }
    }

}(this, function (d3, crossfilter) {
 'use strict';

 // Create a3 object for D3 based distribution chart system.
 var a3 ={
     version: '1.1.0',
     // Setting up the base of the chart
     plot: {}
 };