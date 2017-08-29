var requireConfig = require("./jsrf/src/js/requireConfig");
var _ = require("underscore");

module.exports = function(grunt) {
    // Options for builds, usually specified by 
    var opts = {
        channel: grunt.option("channel") || "1",
        versionNumber: grunt.option ("versionNumber") || "1",
        betaNumber: grunt.option("betaNumber") || "0",
        versionString: ""
    };

    // The version string is the same as the version number. For example 1.1.3 is version
    opts.versionString = opts.versionNumber;
    if(opts.channel === "beta") {
        // The name of the version will be razorflow-1.2.0-beta.2
        opts.versionString = opts.versionString + "-beta." + opts.betaNumber;
    }


    var JSRF_Tasks = {
        requirejs: {
            core: {options:requireConfig.core},
            devtools: {options:requireConfig.devtools},
            wrapper: {options:requireConfig.wrapper},
            core_eval: {options:requireConfig.core_eval},
            wrapper_eval: {options:requireConfig.wrapper_eval}
        },
        jst: {
            jsrf: {
                options: {
                    prettify: true,
                    processName: function (filePath) {
                        var parts = filePath.split('/');
                        var fileName = parts[parts.length - 1];
                        return fileName.split('.')[0];
                    },
                    amd: true,
                    global: false,
                    requires: {
                        'vendor/lodash' : '_'
                    }
                },
                files: {
                    "jsrf/src/js/generated/templates.js": ["jsrf/src/templates/*.html"]
                }
            }
        },
        themegen: {
            jsrf: {
                options: {
                    themeLess: "jsrf/src/less/theme.less",
                    mixins: "jsrf/src/less/mixins.less",
                    defaultVariables: "jsrf/src/less/theme/variables.less"
                },
                themeJSON: "jsrf/src/js/themebuilder/config/defaulttheme.json",
                out: "build/tmp/less/rftheme.default.less",
            }
        },
        less: {
            jsrf: {
                options: {
                    paths: ['jsrf/src/less']
                },
                files: {
                    "build/tmp/css/razorflow.css": "jsrf/src/less/razorflow.less",
                }
            }
        },
        cssmin: {
            jsrf: {
                expand: true,
                cwd: 'build/tmp/css/',
                src: ['razorflow.css'],
                dest: 'build/assets/css',
                ext: '.min.css'
            }
        },
        copyto: {
            jsrf_img: {
                files:[
                    {cwd:"jsrf/src/", src:["img/*"], dest:"build/assets/"},
                    {cwd:"jsrf/src/", src:["img/*"], dest:"build/tmp/"}
                ]
            },
            examples: {
                files: [
                    {cwd: "build/razorflow_js/files/", src:"**/*", dest: "examples/static/rf/"},
                    {cwd: "build/php/razorflow_php/", src:"**/*", dest: "examples/lib/razorflow_php/"}
                ]
                .concat(_.map([
                    'php_mvc/cakephp/app/vendor/razorflow_php/',
                    'php_embedded/razorflow_php/',
                    'distributable/php_database_sample/razorflow_php/'
                ], function(val){ return {cwd:"build/php/razorflow_php", src:"**/*", dest:"examples/apps/"+val};  })).concat(_.map([
                    'html_embedded/razorflow_js/',
                    'php_mvc/rfci/application/rf/'
                ], function(val){ return {cwd:"build/assets/", src:"**/*", dest:"examples/apps/"+val};  }))
            },
            website: {
                files: [
                    {cwd: "build/assets/", src: ["css/*.css", "js/*.js", "img/*"], dest: "website/src/static/transfer/build/"},
                    {cwd: "examples/static/fixtures/", src:["*.*"], dest: "website/src/static/fixtures/"},
                    {cwd: "examples/static/fixtures/databases/", src: ["Northwind.sqlite"], dest: "website/src/static/fixtures/"},
                    {cwd: 'wrappers/phprf/build/packages/minified/', src: ["**/*.*"], dest: 'website/src/static/transfer/build/'},
                    {cwd: "build/php/razorflow_php/", src: ["**/*.*"], dest: "website/src/static/transfer/build/razorflow_php/"},
                    {cwd: 'examples/src/php/tour/', src: ["*.*"], dest: 'website/src/static/transfer/build/tour/'},
                    {cwd: 'website/src/storage/sample_db/', src: ["razorflow.sqlite"], dest: 'website/src/storage/database/'}
                ]
            }
        },
        replace: {
            removeAMD: {
                src: ["build/assets/js/razorflow.min.js", "build/assets/js/razorflow.devtools.min.js", "build/assets/js/razorflow.wrapper.min.js", "build/eval_assets/js/razorflow.wrapper.min.js", "build/eval_assets/js/razorflow.min.js"],
                overwrite: true,
                replacements: [
                    {from: /\bdefine\b/g, to: "_dfn"},
                    {from: /\brequire\b/g, to: "_rqr"}
                ]
            }
        },
        packman: {

        },
        exec: {
          casperphp: {
            cmd: "casperjs test tools/wrappertester/app.js --testspath=tools/wrappertester/tests --baseurl=http://localhost:8080/dev/php/testcases --verbose"
          }
        },
        clean: {
            build: "build",
            jsrf: ["build/assets", "build/eval_assets"]
        },
        screenshotGen: {
            jsExamples: {
                options: {
                    files: "examples/src/js/examples/*.js",
                    out: "examples/static/exampleImages/js/examples/",
                    baseUrl: "http://localhost:8080/dashboard/js/examples/",
                    width: 1024,
                    height: 768,
                    timeout: 2000,
                    extension: ".js"
                }
            },
            phpExamples: {
                options: {
                    files: "examples/src/php/examples/*.php",
                    out: "examples/static/exampleImages/php/examples/",
                    baseUrl: "http://localhost:8080/dashboard/php/examples/",
                    width: 1024,
                    height: 768,
                    timeout: 2000,
                    extension: ".php"
                }
            }
        },
        squashDemos: {
          options: {
            demoPaths: {
              js: "examples/src/js/demos/*.js",
              php: "examples/src/php/demos/*.php"
            },
            demosConfig: "tools/config/demos.json",
            out: "website/src/static/transfer/build/js/rfDemos.js",
            outCode: "website/src/static/transfer/build/js/rfDemoCode.js"
          }
        },
        file_append: {
            jsrf_version: {
                files: {
                    "build/assets/js/razorflow.min.js": {
                        append: "\n\nwindow.__rfVersion={channel:\""+opts.channel+"\", version:\""+opts.versionString+"\"};\n\n"
                    },
                    "build/assets/js/razorflow.wrapper.min.js": {
                        append: "\n\nwindow.__rfVersion={channel:\""+opts.channel+"\", version:\""+opts.versionString+"\"};\n\n"
                    }
                }
            }
        },
        versionWriter: {
            options: {
                versionJSON: "tools/config/version.json",
                versionPHP: "website/src/version.php",
                opts: opts
            }
        },
        s3: {
            options: {
                key: 'AKIAIUKBV2KPXI6GM43A',
                secret: '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',
                bucket: 'download_bucket',
                access: 'public-read',
                headers: {
                    // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
                    "Cache-Control": "max-age=630720000, public",
                    "Expires": new Date(Date.now() + 63072000000).toUTCString()
                }
            },
            upload_package: {
                // These options override the defaults
                options: {
                    encodePaths: false,
                    maxOperations: 20

                },
                // Files to be uploaded.
                upload: [
                    {
                        // Move everything in the packages folder to 
                        src: "build/packages/*",
                        dest: opts.versionString + "/"
                    }
                ]
            }
        },
        genProps: {
            options: {
                configPath: "tools/config/props.json",
                outPaths: {
                    js: "jsrf/src/js/prop/properties.js",
                    php: "wrappers/phprf/src/lib/core/Properties.php"
                },
                templatePath: "tools/grunt-tasks/templates/genprops" 
            }
        },
        extGrunt: {
            docs: {
                options: {
                    cwd:"docs",
                    task: "build:website"
                }
            },
            website: {
                options: {
                    cwd:"website/src/static/",
                    task: "build"
                }
            },
        }
    };

    var get_filesets = function (evalFlag) {
        if(typeof(evalFlag) === "undefined") { evalFlag = false; }
        grunt.log.writeln("The fileset eval flag is: ", evalFlag)
        var rfCorePath = evalFlag ? "build/eval_assets/js/razorflow.min.js" : "build/assets/js/razorflow.min.js";
        var rfWrapperPath = evalFlag ? "build/eval_assets/js/razorflow.wrapper.min.js" : "build/assets/js/razorflow.wrapper.min.js";

        var js_assets = [
            {dir: "js", files: [
                "jsrf/src/vendor/jquery.min.js",
                rfCorePath,
                "build/assets/js/razorflow.devtools.min.js"
            ]},
            {dir: "img", src:"build/assets/img/"},
            {dir: "css", src:"build/assets/css/"}
        ];
        var js_files = [
            {dir:"files", files: js_assets},
            {dir:"dashboard_quickstart", src:"jsrf/quickstart/", files:js_assets}
        ];
        var php_files = [
            {dir:"razorflow_php", src:"wrappers/phprf/src/", files: [
                {dir:"static", files: [
                    {dir:"rf", files:[
                        {dir:"js", files: [
                            "jsrf/src/vendor/jquery.min.js",
                            rfWrapperPath,
                            "build/assets/js/razorflow.devtools.min.js"
                        ]},
                        {dir:"img", src:"build/assets/img/"},
                        {dir:"css", src:"build/assets/css/"}
                    ]}
                ]}
            ]},
            {dir: "dashboard_quickstart", src:"wrappers/phprf/dashboard_quickstart/", files:[
                {dir:"razorflow_php", copyFromPackage: "../razorflow_php/"}
            ]}
        ];
        return {
            php: php_files,
            js: js_files
        }
    };

    var assets_build = get_filesets();
    var assets_eval = get_filesets(true);


    JSRF_Tasks.packman.php_build = {
        file_name: "razorflow_php_build",
        container_name: "php",
        noZip: true,
        copyFolderTo: "build/",
        files: assets_build.php
    };

    JSRF_Tasks.packman.js_build = {
        file_name: "razorflow_js_build",
        container_name: "razorflow_js",
        noZip: true,
        copyFolderTo: "build/",
        files: assets_build.js
    }; 

    function addPackageWithLicense (version, license) {
        var taskHost = JSRF_Tasks.packman;
        var licensePath = "razorflow_license_" + license;
        var fileName =  "-"+version;

        var evalFlag = false;
        grunt.log.writeln("The evaluation flag is:", evalFlag);
        var js_files = evalFlag ? assets_eval.js : assets_build.js;
        var php_files = evalFlag ? assets_eval.php : assets_build.php;

        taskHost['js_' + license] = {
            file_name: "razorflow_framework_js"+fileName,
            container_name: "razorflow_framework_js-" + version,
            files: [
                {file: "readme.html", src:"tools/licenses/"+licensePath+"/js.html"},
                {file: "license.pdf", src:"tools/licenses/"+licensePath+"/license.pdf"},
            ].concat(js_files)
        };

        taskHost['php_' + license] = {
            file_name: "razorflow_framework_php"+fileName,
            container_name: "razorflow_framework_php-" + version,
            files: [
                {file: "readme.html", src:"tools/licenses/"+licensePath+"/js.html"},
                {file: "license.pdf", src:"tools/licenses/"+licensePath+"/license.pdf"},
            ].concat(php_files)
        };

        taskHost['suite_' + license] = {
            file_name: "razorflow_framework_suite"+fileName,
            container_name: "razorflow_framework_suite-" + version,
            files: [
                {file: "readme.html", src:"tools/licenses/"+licensePath+"/suite.html"},
                {file: "license.pdf", src:"tools/licenses/"+licensePath+"/license.pdf"},
                {dir: "razorflow_php", files: php_files},
                {dir: "razorflow_js", files: js_files},
            ]
        };
    };

    function createPackagesForVersion (version) {
        JSRF_Tasks.exec.php_readme_gen = {
            cmd: "php genreadmes.php " + version,
            // stdout: true, // Set this to true to debug genreadmes
            cwd: "tools/licenses/generator"
        }
        // addPackageWithLicense(version, "trial");
        // addPackageWithLicense(version, "standard");
        addPackageWithLicense(version, "pro");
        // addPackageWithLicense(version, "devdirect");
    };

    createPackagesForVersion(opts.versionString);



    grunt.registerMultiTask("extGrunt", "Call an external grunt", function() {
        var options = this.options({});
        var done = this.async();

        grunt.util.spawn({
            grunt: true,
            opts: {
                cwd: options.cwd,
                stdio: 'inherit'
            },
            args: [options.task]
        }, done)
    });


    grunt.registerTask("makePackage", ["exec:php_readme_gen", "packman"]);
    grunt.registerTask("jsrf:compile", ["jst:jsrf", "themegen:jsrf", "less:jsrf"]);
    grunt.registerTask("build:jsrf", ["clean:jsrf", "jst:jsrf", "requirejs", "file_append:jsrf_version", "themegen:jsrf", "less:jsrf", "cssmin:jsrf", "copyto:jsrf_img", "packman:js_build"]);
    grunt.registerTask("build:examples", ["copyto:examples"]);
    grunt.registerTask("build:phprf", ["packman:php_build"]);
    grunt.registerTask("build:code", ["build:jsrf", "build:phprf", "replace:removeAMD"]);
    grunt.registerTask("build:website", ["copyto:website", "squashDemos", "extGrunt:website"]);
    grunt.registerTask("build:docs", ["extGrunt:docs"]);
    grunt.registerTask("build", ["build:code", "build:website", "build:examples", "build:website", "build:docs"]);
    grunt.registerTask("package", ["clean:build", "build", "makePackage", "versionWriter"]);
    grunt.registerTask("upload", ["s3:upload_package"]);
    grunt.registerTask("test:wrappers", ["exec:casperphp"]);
    grunt.registerTask("quickbuild", ["clean:build", "build:code", "makePackage", "versionWriter"]);


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadTasks ('./tools/grunt-tasks/');
    grunt.initConfig (JSRF_Tasks);
};
