module.exports = function (grunt) {
    'use strict';
    var jsFiles = [
                    'src/begin.js',
                    'src/A3_Charts/begin.js',
                    'src/A3_Charts/methods/*.js',
                    'src/A3_Charts/settings/prepareData.js',
                    'src/A3_Charts/settings/prepareSettings.js',
                    'src/A3_Charts/settings/prepareChart.js',
                    'src/A3_Charts/objects/renderBoxPlot/begin.js',
                    'src/A3_Charts/objects/renderBoxPlot/settings/prepareBoxData.js',
                    'src/A3_Charts/objects/renderBoxPlot/methods/*.js',
                    'src/A3_Charts/objects/renderBoxPlot/end.js',
                    'src/A3_Charts/objects/renderViolinPlot/begin.js',
                    'src/A3_Charts/objects/renderViolinPlot/settings/prepareBoxData.js',
                    'src/A3_Charts/objects/renderViolinPlot/methods/*.js',
                    'src/A3_Charts/objects/renderViolinPlot/end.js',
                    'src/A3_Charts/objects/renderBubblePlot/begin.js',
                    'src/A3_Charts/objects/renderBubblePlot/settings/prepareBubbleData.js',
                    'src/A3_Charts/objects/renderBubblePlot/methods/*.js',
                    'src/A3_Charts/objects/renderBubblePlot/end.js',
                    'src/A3_Charts/end.js',
                    'src/end.js'
                ];
    require('load-grunt-tasks')(grunt);
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [jsFiles],
                dest: 'lib/<%= pkg.name %>.v<%= pkg.version %>.js',
                options: {
                    banner: grunt.file.read('./LICENSE-BANNER.txt')
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    'lib/<%= pkg.name %>.v<%= pkg.version %>.min.js': ['lib/<%= pkg.name %>.v<%= pkg.version %>.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    {src: 'lib/<%= pkg.name %>.v<%= pkg.version %>.min.js', dest: '<%= pkg.name %>.final.min.js'},
                    {src: 'lib/<%= pkg.name %>.v<%= pkg.version %>.js', dest: '<%= pkg.name %>.final.js'}
                ]
            }
        },
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            }
        },
        jsdoc2md: {
            dist: {
                src: 'a3.final.js',
                dest: 'web/docs/api-latest.md'
            }
        },
        eslint: {
            client: {
                src: [
                    'Gruntfile.js',
                    'lib/<%= pkg.name %>.v<%= pkg.version %>.js'
                ],
                directives: {
                    browser: true,
                    nomen: true,
                    plusplus: true,
                    predef: [
                        'd3',
                        'crossfilter',
                        'module',
                        'console',
                        'define',
                        'require',
                        'exports'
                    ]
                },
                options: {
                    parser: 'babel-eslint',
                    parserOptions: {
                        ecmaVersion: 6,
                        sourceType: 'module',
                        ecmaFeatures: {
                            jsx: true
                        }
                    },
                    env: {
                        browser: true,
                        amd: true,
                        es6: true,
                        node: true,
                        mocha: true
                    },
                    rules: {
                        'comma-dangle': 1,
                        'quotes': [ 1, 'single' ],
                        'no-undef': 1,
                        'global-strict': 0,
                        'no-extra-semi': 1,
                        'no-underscore-dangle': 0,
                        'no-console': 1,
                        'no-unused-vars': 1,
                        'no-trailing-spaces': [1, { 'skipBlankLines': true }],
                        'no-unreachable': 1,
                        'no-alert': 0,
                        'react/jsx-uses-react': 1,
                        'react/jsx-uses-vars': 1
                    }
                }
            }
        },
        watch: {
            js: {
                files: [jsFiles],
                tasks: ['concat', 'uglify', 'eslint']
            },
            scripts: {
                files: ['Gruntfile.js'],
                tasks: ['eslint']
            }
        }
      /*prop: {
            dist: {
                src: [
                    'examples/templates/*.html'
                ]
            },
            options: {
                exampleOutputPath: 'examples/',
                a3Path: '/lib/',
                version: 'v<%= pkg.version %>',
                d3version: 'v<%= pkg.buildDependencies.d3 %>',
                scriptTag: '{scriptDependencies}',
                header: "<!----------------------------------------------------------------->\n" +
                        "<!-- AUTOMATICALLY GENERATED CODE - PLEASE EDIT TEMPLATE INSTEAD -->\n" +
                        "<!----------------------------------------------------------------->\n"
            }
        } */
    });
    // Propogate version into relevant files
 /*   grunt.registerMultiTask('prop', 'Propagate Versions.', function () {
        function generateScriptElements(options, indent) {
            var d3Path = "https://d3js.org/d3" + options.d3version +".js",
                a3Path = options.a3Path + "a3." + options.version + ".js",
                createScriptElement = function (path) {
                    var scriptElement = '<script src="{path}"></script>';
                    return scriptElement.split("{path}").join(path);
                },
                libPath = options.libPath,
                distPath = options.distPath,
                version = options.version,
                d3version = options.d3version,
                tab = "";

            // default indentation to two spaces
            indent = indent || 2;

            for (i = 0; i < indent; i++) {
                tab += " ";
            }

            d3Path = d3Path.split("{libFolder}").join(libPath);
            d3Path = d3Path.split("{d3version}").join(d3version);
            dimplePath = dimplePath.split("{distFolder}").join(distPath);
            dimplePath = dimplePath.split("{version}").join(version);

            grunt.log.writeln("\nUsing d3: " + d3Path + " with " + d3version);
            grunt.log.writeln("\nUsing a3: " + a3Path + " with " + version + "\n");

            return createScriptElement(d3Path) + "\n" + tab + createScriptElement(a3Path);
        }

        var options = this.options(),
            outPath = options.exampleOutputPath,
            header = options.header,
            scriptTag = options.scriptTag,
            scripts = generateScriptElements(options);

        this.files.forEach(function (f) {
            f.src.filter(function (filepath) {
                var result = true;
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('File "' + filepath + '" not found.');
                    result = false;
                }
                return result;
            }).map(function (filepath) {
                // Read file source.
                var src = grunt.file.read(filepath);

                // Replace the script placeholder tag with script html elements
                src = src.split(scriptTag).join(scripts);

                // Write the new file
                grunt.log.writeln("Creating " + outPath + filepath.substring(filepath.lastIndexOf("/") + 1));
                grunt.file.write(outPath + filepath.substring(filepath.lastIndexOf("/") + 1), header + src);
            });
        });
    }); */

    // Default tasks
    grunt.registerTask('dev', ['concat', 'uglify', 'eslint', 'connect:server', 'watch']);
    grunt.registerTask('push', ['uglify', 'copy']);
};