/*
 * XlsxFileType.js - Represents a collection of appinfo.json files
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

var path = require("path");
var log4js = require("log4js");
var XlsxFile = require("./XlsxFile.js");
var logger = log4js.getLogger("loctool.plugin.XlsxFileType");
log4js.configure(path.dirname(module.filename) + '/log4js.json');

var XlsxFileType = function(project) {
    this.type = "xlsx";
    this.resourceType = "xlsx";
    this.project = project;
    this.extensions = [".xlsx"];
    this.datatype = "x-xlsx";

    this.API = project.getAPI();
    this.extracted = this.API.newTranslationSet(project.getSourceLocale());
    this.newres = this.API.newTranslationSet(project.getSourceLocale());
    this.pseudo = this.API.newTranslationSet(project.getSourceLocale());
};

/**
 * Return true if the given path is a xlsx file and is handled
 * by the current file type.
 *
 * @param {String} pathName path to the file being questions
 * @returns {boolean} true if the path is a xlsx file, or false
 * otherwise
 */
XlsxFileType.prototype.handles = function(pathName) {
    logger.debug("XlsxFileTyp handles " + pathName + "?");
    if (!pathName) return false;
    var ret = false;
    if ((pathName.length > 5  && pathName.substring(pathName.length - 5) === ".xlsx")) {
       ret = true;
    }
    logger.debug(ret ? "Yes": "No");
    return ret;
};

XlsxFileType.prototype.name = function() {
    return "Xlsx File Type";
};

XlsxFileType.prototype.getResourceTypes = function() {
    return {};
}

/**
 * Write out the aggregated resources for this file type. In
 * some cases, the string are written out to a common resource
 * file, and in other cases, to a type-specific resource file.
 * In yet other cases, nothing is written out, as the each of
 * the files themselves are localized individually, so there
 * are no aggregated strings.
 */
XlsxFileType.prototype.write = function(translations, locales) {
    // templates are localized individually, so we don't have to
    // write out the resources
};

XlsxFileType.prototype.newFile = function(path) {
    return new XlsxFile({
        project: this.project,
        pathName: path,
        type: this
    });
};

XlsxFileType.prototype.getDataType = function() {
    return this.datatype;
};

/**
 * Return the translation set containing all of the extracted
 * resources for all instances of this type of file. This includes
 * all new strings and all existing strings. If it was extracted
 * from a source file, it should be returned here.
 *
 * @returns {TranslationSet} the set containing all of the
 * extracted resources
 */
XlsxFileType.prototype.getExtracted = function() {
    return this.extracted;
};

/**
 * Add the contents of the given translation set to the extracted resources
 * for this file type.
 *
 * @param {TranslationSet} set set of resources to add to the current set
 */
XlsxFileType.prototype.addSet = function(set) {
    this.extracted.addSet(set);
};

/**
 * Return the translation set containing all of the new
 * resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * new resources
 */
XlsxFileType.prototype.getNew = function() {
    return this.newres;
};

/**
 * Return the translation set containing all of the pseudo
 * localized resources for all instances of this type of file.
 *
 * @returns {TranslationSet} the set containing all of the
 * pseudo localized resources
 */
XlsxFileType.prototype.getPseudo = function() {
    return this.pseudo;
};

/**
 * Return the list of file name extensions that this plugin can
 * process.
 *
 * @returns {Array.<string>} the list of file name extensions
 */
XlsxFileType.prototype.getExtensions = function() {
    return this.extensions;
};

/**
  * Called right before each project is closed
  * Allows the file type class to do any last-minute clean-up or generate any final files
  *
  * Generate manifest file based on created resource files
  */
XlsxFileType.prototype.projectClose = function() {
    var resourceRoot = path.join(this.project.root, this.project.getResourceDirs("xlsx")[0] || "resources");
    var manifestFile = new XlsxFile({
            project: this.project,
            type: this.type
        });
};

module.exports = XlsxFileType;