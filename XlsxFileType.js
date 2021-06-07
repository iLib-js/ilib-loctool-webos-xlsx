/*
 * XlsxFileType.js - Represents a collection of xlsx files
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
    var path = this.project.settings.targetDir;
    var resources = translations.getAll();
    this.resourceFiles = {};
    var files = [];

    for (var i=0; i < resources.length;i++) {
        var locale = resources[i].targetLocale;
        if (!this.resourceFiles[locale]) {
            this.resourceFiles[locale] = [];
        }
        this.resourceFiles[locale].push(resources[i]);
    }

    for (var i=0; i < locales.length;i++) {
        files[i] = this.newFile(path, {locale: locales[i]});
        files[i].write(this.resourceFiles[locales[i]], locales[i]);
    }
};

XlsxFileType.prototype.newFile = function(path, options) {
    return new XlsxFile({
        project: this.project,
        pathName: path,
        locale: (options && options.locale) || this.project.sourceLocale,
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

module.exports = XlsxFileType;