/*
 * XlsxFile.js - plugin to extract resources from a appinfo.json code file
 *
 * Copyright (c) 2021, JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require("fs");
var path = require("path");
var LocaleMatcher = require("ilib/lib/LocaleMatcher.js");

var log4js = require("log4js");
log4js.configure(path.dirname(module.filename) + '/log4js.json');
var logger = log4js.getLogger("loctool.plugin.XlsxFile");

/**
 * Create a new xlsx file with the given path name and within
 * the given project.
 *
 * @param {Project} project the project object
 * @param {String} pathName path to the file relative to the root
 * of the project file
 * @param {FileType} type the file type of this instance
 */
var XlsxFile = function(props) {
    var langDefaultLocale;

    this.baseLocale = false;
    this.project = props.project;
    this.pathName = props.pathName;
    this.locale = new LocaleMatcher({locale:props.locale}).getLikelyLocaleMinimal();
    this.API = props.project.getAPI();

    langDefaultLocale = new LocaleMatcher({locale: this.locale.language});
    this.baseLocale = langDefaultLocale.getLikelyLocaleMinimal().getSpec() === this.locale.getSpec();
    this.type = props.type;

    this.datatype = "x-xlsx";
    this.set = this.API.newTranslationSet(this.project ? this.project.sourceLocale : "zxx-XX");
};

/**
 * Unescape the string to make the same string that would be
 * in memory in the target programming language.
 *
 * @static
 * @param {String} string the string to unescape
 * @returns {String} the unescaped string
 */
XlsxFile.unescapeString = function(string) {
    var unescaped = string;

    unescaped = unescaped.
        replace(/\\\\n/g, "").                // line continuation
        replace(/\\\n/g, "").                // line continuation
        replace(/^\\\\/, "\\").             // unescape backslashes
        replace(/([^\\])\\\\/g, "$1\\").
        replace(/^\\'/, "'").               // unescape quotes
        replace(/([^\\])\\'/g, "$1'").
        replace(/^\\"/, '"').
        replace(/([^\\])\\"/g, '$1"');

    return unescaped;
};

/**
 * Clean the string to make a resource name string. This means
 * removing leading and trailing white space, compressing
 * whitespaces, and unescaping characters. This changes
 * the string from what it looks like in the source
 * code but increases matching.
 *
 * @static
 * @param {String} string the string to clean
 * @returns {String} the cleaned string
 */
XlsxFile.cleanString = function(string) {
    var unescaped = XlsxFile.unescapeString(string);

    unescaped = unescaped.
        replace(/\\[btnfr]/g, " ").
        replace(/[ \n\t\r\f]+/g, " ").
        trim();

    return unescaped;
};

/**
* Add a resource to this file. The locale of the resource
* should correspond to the locale of the file, and the
* context of the resource should match the context of
* the file.
*
* @param {Resource} res a resource to add to this file
*/
XlsxFile.prototype.addResource = function(res) {
    logger.trace("XlsxFile.addResource: " + JSON.stringify(res) + " to " + this.project.getProjectId() + ", " + this.locale + ", " + JSON.stringify(this.context));
    var resLocale = res.getTargetLocale() || res.getSourceLocale();

    if (res && res.getProject() === this.project.getProjectId() && resLocale === this.locale.getSpec()) {
        logger.trace("correct project, context, and locale. Adding.");
        this.set.add(res);
    } else {
        if (res) {
            if (res.getProject() !== this.project.getProjectId()) {
                logger.warn("Attempt to add a resource to a resource file with the incorrect project.");
            } else {
                logger.warn("Attempt to add a resource to a resource file with the incorrect locale. " + resLocale + " vs. " + this.locale.getSpec());
            }
        } else {
            logger.warn("Attempt to add an undefined resource to a resource file.");
        }
    }
}

/**
 * Make a new key for the given string. This must correspond
 * exactly with the code in file so that the
 * resources match up. See the class IResourceBundle in
 * this project under the directory for the corresponding
 * code.
 *
 * @private
 * @param {String} source the source string to make a resource
 * key for
 * @returns {String} a unique key for this string
 */
XlsxFile.prototype.makeKey = function(source) {
    return XlsxFile.unescapeString(source);
};

/**
 * Parse the data string looking for the localizable strings and add them to the
 * project's translation set.
 * @param {String} data the string to parse
 */
XlsxFile.prototype.parse = function(data) {
    logger.debug("Extracting strings from " + this.pathName);

    this.parsedData = data;

    if (typeof data !== "object") {
        this.parsedData = JSON.parse(data);
    }

    this.resourceIndex = 0;
    for (var property in this.schema) {
        if ((this.parsedData[property]) &&
            (this.schema[property].type === typeof this.parsedData[property])) {
            var r = this.API.newResource({
                resType: "string",
                project: this.project.getProjectId(),
                key: XlsxFile.unescapeString(this.parsedData[property]),
                sourceLocale: this.project.sourceLocale,
                source: XlsxFile.cleanString(this.parsedData[property]),
                autoKey: true,
                pathName: this.pathName,
                state: "new",
                comment: undefined,
                datatype: this.datatype,
                index: this.resourceIndex++
            });
            this.set.add(r);
        } else {
            logger.debug("[" + property + "] property doesn't have localized `true` or not match the required data type.");
        }
    }
};

/**
 * Extract all the localizable strings from the appinfo.json file and add them to the
 * project's translation set.
 */
XlsxFile.prototype.extract = function() {
    logger.debug("Extracting strings from " + this.pathName);
    if (this.pathName) {
        var p = path.join(this.project.root, this.pathName);
        try {
            var data = fs.readFileSync(p, "utf8");
            if (data) {
                this.parse(data);
            }
        } catch (e) {
            logger.warn("Could not read file: " + p);
        }
    }
};

/**
 * Return the set of resources found in the current appinfo.json file.
 *
 * @returns {TranslationSet} The set of resources found in the
 * current appinfo.json file.
 */
XlsxFile.prototype.getTranslationSet = function() {
    return this.set;
}

XlsxFile.prototype.writeContents = function(resources, locale) {
    var xlsxWrite = require("xlsx");
    var contents = [];
    var fileName = (this.pathName !== ".") ? this.pathName : this.project.settings.id + "_" + locale + ".xlsx";

    for (var i=0; i < resources.length;i++) {
        contents.push({
            "index": i,
            "id": resources[i].id,
            "datatype": resources[i].datatype,
            "targetLocale": resources[i].targetLocale,
            "source": resources[i].source,
            "target": resources[i].target,
            "key": (resources[i].source !== resources[i].reskey) ?  resources[i].reskey : "",
            "comment": resources[i].comment || ""
        })
    }

    var ws = xlsxWrite.utils.json_to_sheet(contents);
    var wb = xlsxWrite.utils.book_new();
    xlsxWrite.utils.book_append_sheet(wb, ws, "Sheet1");
    xlsxWrite.utils.book_append_sheet(wb, ws, "Sheet2");
    xlsxWrite.writeFile(wb, fileName);
}

XlsxFile.prototype.write = function(resources, locale) {
    var resourcesContets = resources || this.set.resources;
    this.writeContents(resourcesContets, locale);
};

/**
*
*/
XlsxFile.prototype.localize = function() {};

module.exports = XlsxFile;
