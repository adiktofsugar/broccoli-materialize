var fs = require('fs-extra');
var path = require('path');
var Plugin = require('broccoli-plugin');

Materialize.prototype = Object.create(Plugin.prototype);
Materialize.prototype.constructor = Materialize;
function Materialize(materializeRootPath, options) {
    if (!(this instanceof Materialize)) return new Materialize(materializeRootPath, options);
    var inputNodes = [materializeRootPath];
    
    console.log('===Materialize init===');
    options = options || {};
    Plugin.call(this, inputNodes, {
        annotation: options.annotation
    });
    this.options = options;

    // inputNodes should be the materialize npm module
    // this will just copy everything in dist except js
    // js will be concatted according to the gruntfile.js setup
    // it will output a tree like this:
    // [js, css, fonts]
    // the js tree will be like this:
    // [materialize.js, vendor1.js, vendor2.js...]
    // materialize will have the libraries excluded and the initial.js
    // the header and footer will be a umd style one
    // this will allow things to be required properly, just need to the shims...
}

Materialize.prototype.build = function() {
    console.log('==== Materialize build start ====');
    var materializeRootPath = this.inputPaths[0];

    // copy the css and fonts
    var distPath = path.join(materializeRootPath, 'dist');
    fs.readdirSync(distPath).forEach((dir) => {
        if (dir == 'js') return;
        fs.copySync(
            path.join(distPath, dir),
            path.join(this.outputPath, dir),
            {
                clobber: true,
                dereference: true,
            }
        );
    });

    var config = this.getGruntConcatConfig();
    var concatConfig = config.dist;
    var jsFilePaths = concatConfig.src;
    var libraryPaths = [];
    var srcPaths = [];
    var jsPathsToIgnore = [
        'initial.js'
    ];
    var jsPathsForLibrary = [
        'jquery.easing',
        'velocity.min.js',
        'hammer.min.js',
        'jquery.hammer.js',
        'picker.js',
        'picker.date.js'
    ];
    jsFilePaths.forEach((jsFilePath) => {
        var shouldIgnore = jsPathsToIgnore.find((matcher) => {
            return jsFilePath.match(matcher);
        });
        var shouldAddToLibrary = jsPathsForLibrary.find((matcher) => {
            return jsFilePath.match(matcher);
        });
        if (shouldIgnore) return;
        if (shouldAddToLibrary) {
            libraryPaths.push(jsFilePath);
        } else {
            srcPaths.push(jsFilePath);
        }
    });

    // write the library files to separate files
    libraryPaths.forEach((filePath) => {
        fs.copySync(
            path.join(materializeRootPath, filePath),
            path.join(this.outputPath, filePath)
        )
    });
    
    var replacements = {
        MODULE_NAMES: JSON.stringify([
            'jquery',
            'jquery.easing',
            'jquery.hammer',
            'velocity',
            'hammerjs',
            'picker',
            'picker.date'
        ]),
        BROWSER_MODULE_NAMES: JSON.stringify([
            'jQuery',
            'jqEasing',
            'jqHammer',
            'Velocity',
            'Hammer',
            'Picker',
            'pickerDateLoaded'
        ]),
        FUNCTION_SIGNATURE: '(exports, jQuery, jqEasing, jqHammer, ' +
            'Velocity, Hammer, Picker, pickerDateLoaded)'
    };
    var header = fs.readFileSync(path.join(__dirname, 'header.js'), 'utf-8');
    header = header.replace(/__(.+?)__/g, function ($0, $1) {
        return replacements[$1];
    });
    var footer = fs.readFileSync(path.join(__dirname, 'footer.js'), 'utf-8');

    var output = header;
    srcPaths.forEach((filePath) => {
        output += "\n";
        output += fs.readFileSync(path.join(materializeRootPath, filePath), 'utf-8');
    });
    output += "\n" + footer;
    fs.writeFileSync(path.join(this.outputPath, 'js/materialize.js'), output);

    console.log('==== Materialize build end ====');
    return this;
};
Materialize.prototype.getGruntConcatConfig = function () {
    var materializeRootPath = this.inputPaths[0];
    var gruntfilePath = path.join(materializeRootPath, 'Gruntfile.js');
    var gruntfile = fs.readFileSync(gruntfilePath, 'utf-8');
    var initConfigMatch = gruntfile.match(/grunt\.initConfig.*\(.*\{/);
    var text = initConfigMatch[0];
    var depth = 0;
    var i = initConfigMatch.index + text.length - 1;
    var configStart;
    var configEnd;
    var char;
    var gruntfileRead = '';
    for (; i < gruntfile.length; i++) {
        char = gruntfile.slice(i, i+1);
        gruntfileRead += char;

        if (configStart) {
            if (char == '{') {
                depth++;
            } else if (char == '}') {
                depth--;
            }
            if (char == '}' && depth === 0) {
                configEnd = i + 1;
                break;
            }
        } else {
            // I have to find the start, at concat:
            if (char == '{' && gruntfileRead.match(/concat\s*:\s*\{$/)) {
                configStart = i;
                depth = 1;
            }
        }
    }
    if (!configStart) {
        throw new Error("Could not parse config");
    }
    var configString = gruntfile.slice(configStart, configEnd);
    var configContents = 'module.exports = ' + configString;
    var configFilePath = path.join(this.outputPath, 'gruntConfig.js');
    fs.writeFileSync(configFilePath, configContents, 'utf-8');
    try {
        var config = require(configFilePath);
    } catch (e) {
        e.file = gruntfilePath;
        e.treeDir = materializeRootPath;
        e.message = configString;
        throw e;
    }
    fs.unlinkSync(configFilePath);
    return config;
};
module.exports = Materialize;
