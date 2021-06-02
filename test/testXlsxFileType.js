/*
 * testXlsxFileType.js - test the xlsx template file type handler object.
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

if (!XlsxFileType) {
    var XlsxFileType = require("../XlsxFileType.js");
    var CustomProject =  require("loctool/lib/CustomProject.js");
}

var p = new CustomProject({
    id: "test",
    plugins: ["../."],
    sourceLocale: "en-US"
}, "./test/testfiles", {
    locales:["en-GB"]
});

module.exports.xlsxFileType = {
    testXlsxFileTypeConstructor: function(test) {
        test.expect(1);
        var xft =new XlsxFileType(p);
        test.ok(xft);
        test.done();
    },
    testXlsxFileTypeHandlesJsonTrue: function(test) {
        test.expect(2);
        var xft =new XlsxFileType(p);
        test.ok(xft);
        test.ok(xft.handles("app.xlsx"));
        test.done();
    },
    testXlsxFileTypeHandlesxlsxPath: function(test) {
        test.expect(2);
        var xft =new XlsxFileType(p);
        test.ok(xft);
        test.ok(xft.handles("foo/bar/ko-KR.xlsx"));
        test.done();
    },
    testXlsxFileTypeHandlesxlsxFalse: function(test) {
        test.expect(2);
        var xft =new XlsxFileType(p);
        test.ok(xft);
        test.ok(!xft.handles("foo.xlsxs"));
        test.done();
    },
    testXlsxFileTypeHandlesJonFalse1: function(test) {
        test.expect(2);
        var xft =new XlsxFileType(p);
        test.ok(xft);
        test.ok(!xft.handles("app.xliff"));
        test.done();
    }
};
