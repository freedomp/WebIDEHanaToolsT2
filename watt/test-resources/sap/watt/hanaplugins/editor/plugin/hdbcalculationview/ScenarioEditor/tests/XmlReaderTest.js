define(['sap/hana/ide/editor/plugin/analytics/base/common', 'sap/hana/ide/editor/plugin/analytics/base/XmlReader'], function(common, XmlReader) {
    "use strict";

    var SkippedNodes = common.SkippedNodes;
    var XmlReaderException = common.XmlReaderException;
    var Util = common.Util;

    function createDoc(rootName, xmlNamespaces) {
        var doc = document.implementation.createDocument(null, null, null);
        var pi = doc.createProcessingInstruction("xml", " version='1.0' encoding='UTF-8'");
        doc.appendChild(pi);
        if (rootName) {
            var rootElement = doc.createElement(rootName);
            if (xmlNamespaces) {
                for (var i = 0; i < xmlNamespaces.length; i++) {
                    rootElement.setAttributeNS(Util.XML_NS, xmlNamespaces[i].name, xmlNamespaces[i].value);
                }
            }
            doc.appendChild(rootElement);
        }
        return doc;
    }

    module("XmlReader");

    test("parse xml", function() {
        var emptyXML =
            '\n';
        throws(function() {
            new XmlReader(emptyXML);
        }, XmlReaderException, "empty document");

        var newlineBeforeXMLPI =
            '\n' +
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<x></x>';
        throws(function() {
            new XmlReader(newlineBeforeXMLPI);
        }, XmlReaderException, "newline before xml processing instruction");

        var incompleteXMLPI =
            '<?xml version="1.0" encoding="utf-8"\n';
        throws(function() {
            new XmlReader(incompleteXMLPI);
        }, XmlReaderException, "incomplete xml processing instruction");

        // TODO: phantomjs 1.9.7 does not represent parser errors correctly,
        // see bug: https://github.com/ariya/phantomjs/issues/10428
        if (window.navigator.userAgent.indexOf("PhantomJS") === -1) {
            var tagMismatch =
                '<?xml version="1.0" encoding="utf-8"?>\n' +
                '  <x>\n' +
                '    <y></z>\n' +
                '  </x>';
            throws(function() {
                new XmlReader(tagMismatch);
            }, XmlReaderException, "tag mismatch");

            var corruptedElement =
                '<?xml version="1.0" encoding="utf-8"?>\n' +
                '  <x>\n' +
                '    <y </y>\n' +
                '  </x>';
            throws(function() {
                new XmlReader(corruptedElement);
            }, XmlReaderException, "corrupted element");

            var corruptedAttribute =
                '<?xml version="1.0" encoding="utf-8"?>\n' +
                '  <x>\n' +
                '    <y a = "def></y>\n' +
                '  </x>';
            throws(function() {
                new XmlReader(corruptedAttribute);
            }, XmlReaderException, "corrupted attribute");

            var garbageAfterXML =
                '<?xml version="1.0" encoding="utf-8"?>\n' +
                '  <x>\n' +
                '    <y a = "def"></y>\n' +
                '  </x>\n' +
                '<z></z>';
            throws(function() {
                new XmlReader(garbageAfterXML);
            }, XmlReaderException, "garbage after XML");
        }

    });

    test("document properties", function() {
        var content =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>';
        var reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "LF only hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "LF only detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "LF only fixedContent");
        strictEqual(reader.documentProperties.spacesBeforeDocumentElement, "\n  ", "LF only spacesBeforeDocumentElement");
        strictEqual(reader.documentProperties.spacesAfterDocumentElement, "", "LF only spacesBeforeAfterElement");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\r\n' +
            '    <y a = "def"></y>\r\n' +
            '  </x>';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "CRLF only hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\r\n", "CRLF only detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "CRLF only fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '  <x>' +
            '    <y a = "def"></y>' +
            '  </x>';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "no line breaks hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "", "no line breaks detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "no line breaks fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks LF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "mixed line breaks LF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "mixed line breaks LF fixedContent");
        strictEqual(reader.documentProperties.spacesBeforeDocumentElement, "\n  ", "mixed line breaks LF spacesBeforeDocumentElement");
        strictEqual(reader.documentProperties.spacesAfterDocumentElement, "\r\n", "mixed line breaks LF spacesBeforeAfterElement");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks CRLF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\r\n", "mixed line breaks CRLF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "mixed line breaks CRLF fixedContent");

        content = '<?xml version="1.0" encoding="utf-8"?><x><y a = "def"></y></x>';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "no line breaks CRLF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "", "no line breaks CRLF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "no line breaks CRLF fixedContent");
        strictEqual(reader.documentProperties.spacesBeforeDocumentElement, "", "no line breaks spacesBeforeDocumentElement");
        strictEqual(reader.documentProperties.spacesAfterDocumentElement, "", "no line breaks spacesBeforeAfterElement");

        content = '<?xml version="1.0" encoding="utf-8"?><x><y a = "def\n' +
            '  "></y></x>';
        reader = new XmlReader(content);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "line breaks in attribute only hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "line breaks in attribute only detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "line breaks in attribute only fixedContent");
        strictEqual(reader.documentProperties.spacesBeforeDocumentElement, "", "line breaks in attribute only spacesBeforeDocumentElement");
        strictEqual(reader.documentProperties.spacesAfterDocumentElement, "", "line breaks in attribute only spacesBeforeAfterElement");
    });

    test("fix line endings", function() {
        var content =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>';
        var reader = new XmlReader(content, true);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "LF only hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "LF only detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "LF only fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\r\n' +
            '    <y a = "def"></y>\r\n' +
            '  </x>';
        reader = new XmlReader(content, true);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "CRLF only hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\r\n", "CRLF only detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "CRLF only fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '  <x>' +
            '    <y a = "def"></y>' +
            '  </x>';
        reader = new XmlReader(content, true);
        strictEqual(reader.documentProperties.hasMixedLineEndings, false, "no line breaks hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "", "no line breaks detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, undefined, "no line breaks fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        var expectedContent =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\n';
        reader = new XmlReader(content, true);
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks LF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "mixed line breaks LF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, expectedContent, "mixed line breaks LF fixedContent");

        content =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        expectedContent =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\r\n' +
            '    <y a = "def"></y>\r\n' +
            '  </x>\r\n';
        reader = new XmlReader(content, true);
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks CRLF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\r\n", "mixed line breaks CRLF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, expectedContent, "mixed line breaks CRLF fixedContent");

        // force CRLF
        content =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        expectedContent =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\r\n' +
            '    <y a = "def"></y>\r\n' +
            '  </x>\r\n';
        reader = new XmlReader(content, true, "\r\n");
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks force CRLF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\n", "mixed line breaks force CRLF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, expectedContent, "mixed line breaks force CRLF fixedContent");

        // force LF
        content =
            '<?xml version="1.0" encoding="utf-8"?>\r\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\r\n';
        expectedContent =
            '<?xml version="1.0" encoding="utf-8"?>\n' +
            '  <x>\n' +
            '    <y a = "def"></y>\n' +
            '  </x>\n';
        reader = new XmlReader(content, true, "\n");
        strictEqual(reader.documentProperties.hasMixedLineEndings, true, "mixed line breaks force LF hasMixedLineEndings");
        strictEqual(reader.documentProperties.detectedLineEndings, "\r\n", "mixed line breaks force LF detectedLineEndings");
        strictEqual(reader.documentProperties.fixedContent, expectedContent, "mixed line breaks force LF fixedContent");
    });

    test("move to root", function() {
        // setup
        var doc = createDoc("prefix:root", [{
            name: "xmlns:xsi",
            value: Util.XSI_NS
        }, {
            name: "xmlns:prefix",
            value: "someNS"
        }]);
        var xmlPI = doc.firstChild;
        var rootEl = doc.documentElement;
        var reader = new XmlReader(doc); // test
        reader.moveDown().moveTo("root", "someNS"); // move to the root elemet // consuming the xml PI // verify
        ok(reader.skippedNodes instanceof SkippedNodes, "skippedNodes found");
        strictEqual(reader.skippedNodes.nodeName, "prefix:root", "tag name set");
        strictEqual(reader.skippedNodes.nodesBefore.length, 1, "1 skipped node");
        strictEqual(reader.skippedNodes.nodesBefore[0], xmlPI, "skipped node is XML PI");
        strictEqual(reader.skippedNodes.childNodes.length, 0, "no child nodes");
        deepEqual(reader.skippedNodes.intermediateElements, {}, "no intermediate children");
        deepEqual(reader.skippedNodes.attributes, {}, "no attributes");
        strictEqual(reader.skippedNodes.nodesAfter.length, 0, "no remaining nodes");
        strictEqual(doc.childNodes.length, 1, "xml PI has been consumed");
        strictEqual(doc.firstChild, rootEl, "root remains");
    });

    test("move down", function() { // setup
        var doc = createDoc("root");
        doc.documentElement.appendChild(doc.createElement("first"));
        doc.documentElement.appendChild(doc.createElement("first")).appendChild(doc.createElement("second"));
        var reader = new XmlReader(doc); // test
        reader.moveDown().moveTo("root").moveDown().moveTo("first"); // move to // the first // "first" // tag
        throws(function() {
            reader.moveDown();
        }, XmlReaderException, "cannot move down");
        reader.next().moveTo("first").moveDown().moveTo("second"); // move to the second tag
        throws(function() {
            reader.moveDown();
        }, XmlReaderException, "cannot move down");
        reader.moveUp().moveUp().moveUp(); // move up to XML doc level
        throws(function() {
            reader.moveUp();
        }, XmlReaderException, "cannot move up");
    });

    test("build attributes", function() { // setup
        function mapValues(val) {
            switch (val) {
                case "testMappedValue":
                    return "value1";
                case "testMappedValueNS":
                    return "value2";
                default:
                    return "default";
            }
        }
        var doc = '<root xmlns:xsi="' + Util.XSI_NS + '">' + '<test1/>' + '<test2 value="testValue" mappedValue="testMappedValue" xsi:valueNS="testValueNS" xsi:mappedValueNS="testMappedValueNS" emptyValue=""/>' + '<test3 skippedBefore="1" consumedX="2" xsi:consumedNS="3" skippedMiddle="4" consumedA="5" skippedAfter="6"/>' + '</root>';
        var reader = new XmlReader(doc);
        reader.moveDown().moveTo("root").moveDown();
        var attributes; // test node w/o attributes
        reader.moveTo("test1");
        attributes = reader.buildAttributes({
            unknownProp: "{unknown}",
            unknownNSProp: Util.createXsiSelector("unknown"),
            unknownMappedNSProp: Util.createXsiSelector("unknown", mapValues),
            fixedProp: "fixedValue"
        });
        ok(!attributes.hasOwnProperty("unknownProp"), "unknown attribute");
        ok(!attributes.hasOwnProperty("unknownNSProp"), "unknown attribute");
        ok(!attributes.hasOwnProperty("unknownMappedNSProp"), "unknown attribute");
        strictEqual(attributes.fixedProp, "fixedValue", "fixed value attribute");
        deepEqual(reader.skippedNodes.attributes, {}, "no skipped attributes");
        reader.next(); // test node w/ attributes
        reader.moveTo("test2");
        attributes = reader.buildAttributes({
            valueProp: "{value}",
            valueNSProp: Util.createXsiSelector("valueNS"),
            mappedValueProp: Util.createSelector("mappedValue", mapValues),
            mappedValueNSProp: Util.createXsiSelector("mappedValueNS", mapValues),
            emptyValueProp: "{emptyValue}"
        });
        strictEqual(attributes.valueProp, "testValue", "known attribute");
        strictEqual(attributes.valueNSProp, "testValueNS", "known attribute w/ namespace");
        strictEqual(attributes.mappedValueProp, "value1", "known attribute");
        strictEqual(attributes.mappedValueNSProp, "value2", "known attribute w/ namespace");
        strictEqual(attributes.emptyValueProp, "", "known attribute w/ namespace");
        deepEqual(reader.skippedNodes.attributes, {}, "no skipped attributes");
        reader.next(); // test node w/ skipped attributes
        reader.moveTo("test3");
        attributes = reader.buildAttributes({
            unknownProp: "{unknown}",
            consumedAProp: "{consumedA}",
            consumedNSProp: Util.createXsiSelector("consumedNS"),
            consumedXProp: "{consumedX}"
        });
        ok(!attributes.hasOwnProperty("unknownProp"), "unknown attribute");
        strictEqual(attributes.consumedAProp, "5", "known attribute");
        strictEqual(attributes.consumedNSProp, "3", "known attribute w/ namespace");
        strictEqual(attributes.consumedXProp, "2", "known attribute");
        deepEqual(reader.skippedNodes.attributes, {
            "skippedAfter": "6",
            "skippedBefore": "1",
            "skippedMiddle": "4"
        }, "skipped attributes");
        reader.next();
    });
});