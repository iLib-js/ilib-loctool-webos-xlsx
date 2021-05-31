/*
 * testXlsxFile.js - test the xlsx file handler object.
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

if (!XlsxFile) {
    var XlsxFile = require("../XlsxFile.js");
    var XlsxFileType = require("../XlsxFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
    var TranslationSet =  require("loctool/lib/TranslationSet.js");
    var ResourceString =  require("loctool/lib/ResourceString.js");
}

var p = new CustomProject({
    id: "sample",
    type: "webos-web",
    sourceLocale: "en-US",
    resourceDirs: {
        "xlsx": "localized_json"
    },
    }, "./test/testfiles", {
    locales:["en-GB", "ko-KR"]
});

var xft = new XlsxFileType(p);

module.exports.xlsxFile = {
    testXlsxFileConstructor: function(test) {
        test.expect(1);

        var xf =new XlsxFile({project: p});
        test.ok(xf);
        test.done();
    },
    testXlsxFileConstructorParams: function(test) {
        test.expect(1);

        var xf =new XlsxFile({
            project: p,
            type: xft
        });

        test.ok(xf);
        test.done();
    },
    testXlsxFileConstructorNoFile: function(test) {
        test.expect(1);

        var xf =new XlsxFile({
            project: p,
            pathName: undefined,
            type: xft
        });
        test.ok(xf);
        test.done();
    },
    testXlsxFileMakeKey: function(test) {
        test.expect(2);

        var xf =new XlsxFile({
            project: p,
            pathName: undefined,
            type: xft
        });
        test.ok(xf);
        test.equal(xf.makeKey("title"), "title");
        test.done();
    },
    testXlsxFileExtractFile: function(test) {
        test.expect(8);

        var xf =new XlsxFile({
            project: p,
            pathName: "./ko-KR.xlsx",
            type: xft
        });
        test.ok(xf);

        // should read the file
        xf.extract();
        var set = xf.getTranslationSet();
        test.equal(set.size(), 3);

        var r = set.getBySource("Settings");
        test.ok(r);
        test.equal(r.getSource(), "Settings");
        test.equal(r.getKey(), "Settings");

        var r = set.getBy({
            reskey: "Settings"
        });
        test.ok(r);
        test.equal(r[0].getSource(), "Settings");
        test.equal(r[0].getKey(), "Settings");

        test.done();
    },
        testXlsxFiledefaultPath: function(test) {
        test.expect(2);

        var xf =new XlsxFile({
            project: p,
            pathName: ".",
            type: xft
        });
        test.ok(xf);

        // should attempt to read the file and not fail
        xf.extract();

        var set = xf.getTranslationSet();
        test.equal(set.size(), 0);

        test.done();
    },
    testXlsxFileExtractUndefinedFile: function(test) {
        test.expect(2);

        var xf =new XlsxFile({
            project: p,
            pathName: undefined,
            type: xft
        });
        test.ok(xf);

        // should attempt to read the file and not fail
        xf.extract();

        var set = xf.getTranslationSet();
        test.equal(set.size(), 0);
        test.done();
    }
};
