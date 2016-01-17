/*eslint-disable quotes*/
/*jshint -W110*/
define(['require',
        'sap/hana/ide/editor/plugin/analytics/base/common',
        'sap/hana/ide/editor/plugin/analytics/base/modelbase',
        'sap/hana/ide/editor/plugin/analytics/base/XmlReader',
        'sap/hana/ide/editor/plugin/analytics/base/XmlWriter',
        'sap/hana/ide/editor/plugin/analytics/base/XmlSerializer',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlParser',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlRenderer',
        'sap/hana/ide/editor/plugin/analytics/viewmodel/model'
    ],
    function(require) {
        "use strict";

        var Util, modelbase, XmlReader, XmlWriter, XmlSerializer, RepositoryXmlParser, RepositoryXmlRenderer, viewmodel,
            TestObject;

        Util = require('sap/hana/ide/editor/plugin/analytics/base/common').Util;
        modelbase = require('sap/hana/ide/editor/plugin/analytics/base/modelbase');
        XmlReader = require('sap/hana/ide/editor/plugin/analytics/base/XmlReader');
        XmlWriter = require('sap/hana/ide/editor/plugin/analytics/base/XmlWriter');
        XmlSerializer = require('sap/hana/ide/editor/plugin/analytics/base/XmlSerializer');
        RepositoryXmlParser = require('sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlParser');
        RepositoryXmlRenderer = require('sap/hana/ide/editor/plugin/analytics/viewmodel/RepositoryXmlRenderer');
        viewmodel = require('sap/hana/ide/editor/plugin/analytics/viewmodel/model');

        TestObject = modelbase.AbstractModelClass.extend("TestObject", {});

        var readRepoFile = function(assert, fileName) {
            var url = "/sap/hana/xs/dt/base/file" + require.toUrl("idetests/editor/plugin/analytics/testdata/") + fileName;
            $.ajax({
                url: url,
                async: false,
                dataType: "text"
            }).done(function(data) {
                data = data.replace(/\x0d/g, ""); // remove CR added by REST API 
                var model = new viewmodel.ViewModel();
                RepositoryXmlParser.parseScenario(data, model);
                var doc = RepositoryXmlRenderer.renderScenario(model);
                model.$finishLoading();
                var xmlString = XmlSerializer.serializeToString(doc);
                assert.strictEqual(xmlString, data, fileName);
            });
        };

        QUnit.module("XmlWriter");

        QUnit.test("write root element", function(assert) { // setup
            var doc = $.parseXML('<root xmlns:xsi="' + Util.XSI_NS + '" skippedBefore="1" consumedX="2" xsi:consumedNS="3" xsi:skippedMiddle="4" consumedA="5" skippedAfter="6"/>');
            var reader = new XmlReader(doc);
            reader.moveDown().moveTo("root");
            var attributes = reader.buildAttributes({
                unknownProp: "{unknown}",
                consumedAProp: "{consumedA}",
                consumedNSProp: Util.createXsiSelector("consumedNS"),
                consumedXProp: "{consumedX}"
            });
            var testObj = new TestObject(attributes, reader.skippedNodes);
            var writer = new XmlWriter();
            writer.configure({
                namespaces: [{
                    name: Util.XSI_NS,
                    prefix: "xsi"
                }]
            });
            // verify
            var mapValue = function(value) {
                return "mapped" + value;
            };
            var rootElement = writer.writeRootElement(testObj, "root", {
                consumedAProp: "{consumedA}",
                consumedXProp: Util.createSelector("consumedX", mapValue),
                consumedNSProp: Util.createXsiSelector("consumedNS")
            }, [{
                name: "fixedAdded",
                value: "7"
            }, {
                name: "skippedMiddle",
                namespace: Util.XSI_NS,
                value: "fixedReplace"
            }]);
            writer.close();
            assert.strictEqual(rootElement.attributes.length, 8, "number of attributes");
            assert.strictEqual(rootElement.attributes[0].name, "xmlns:xsi", "xmlns attribute");
            assert.strictEqual(rootElement.attributes[1].name, "skippedBefore", "skipped attribute");
            assert.strictEqual(rootElement.attributes[2].name, "consumedX", "consumed attribute");
            assert.strictEqual(rootElement.attributes[3].name, "xsi:consumedNS", "consumed attribute w/ namespace");
            assert.strictEqual(rootElement.attributes[4].name, "xsi:skippedMiddle", "skipped attribute");
            assert.strictEqual(rootElement.attributes[5].name, "consumedA", "consumed attribute");
            assert.strictEqual(rootElement.attributes[6].name, "skippedAfter", "skipped attribute");
            assert.strictEqual(rootElement.attributes[7].name, "fixedAdded", "additional attribute");
            assert.strictEqual(rootElement.attributes[0].value, Util.XSI_NS, "xmlns attribute value");
            assert.strictEqual(rootElement.attributes[1].value, "1", "skipped attribute value");
            assert.strictEqual(rootElement.attributes[2].value, "mapped2", "mapped attribute value");
            assert.strictEqual(rootElement.attributes[3].value, "3", "consumed attribute value w/ namespace");
            assert.strictEqual(rootElement.attributes[4].value, "fixedReplace", "skipped attribute value replaced with fixed value");
            assert.strictEqual(rootElement.attributes[5].value, "5", "consumed attribute value");
            assert.strictEqual(rootElement.attributes[6].value, "6", "skipped attribute value");
            assert.strictEqual(rootElement.attributes[7].value, "7", "additional attribute value");
        });

        QUnit.test("track used namespaces", function(assert) {
            var testObj = new TestObject({
                prop: "value"
            });
            var writer = new XmlWriter();
            writer.configure({
                namespaces: [{
                    name: Util.XSI_NS,
                    prefix: "xsi"
                }]
            });
            // verify
            var rootElement = writer.writeRootElement(testObj, "root", {
                prop: Util.createXsiSelector("prop")
            });
            writer.close();
            assert.strictEqual(rootElement.attributes.length, 2, "xmlns usage at root node, number of attributes");

            var subObj = new TestObject({
                prop: "subValue"
            });
            writer = new XmlWriter();
            writer.configure({
                namespaces: [{
                    name: Util.XSI_NS,
                    prefix: "xsi"
                }]
            });
            // verify
            rootElement = writer.writeRootElement(testObj, "root", {
                prop: "{prop}"
            });
            writer.writeElement(subObj, rootElement, "sub", {
                prop: Util.createXsiSelector("prop")
            });
            writer.close();
            assert.strictEqual(rootElement.attributes.length, 2, "xmlns usage at child node, number of attributes");
        });

        QUnit.test("compare documents", function(assert) {
            assert.expect(5);

            readRepoFile(assert, "cube1.calculationview.xml");
            readRepoFile(assert, "projection1.calculationview.xml");
            readRepoFile(assert, "projection2.calculationview.xml");
            readRepoFile(assert, "scripted1.calculationview.xml");
            readRepoFile(assert, "scripted2.calculationview.xml");
            //I066990: "star1.calculationview.xml" is having star join and union node; so we will expect UnsupportedOperationException here
            // Tested in below method
            // readRepoFile(assert, "star1.calculationview.xml");
        });
        
        //I066990: Now in SP10 Sprint4, we will start Star Join implementation
        /*QUnit.test("Expect UnsupportedOperation Exception", function(assert) {
            assert.throws(function() {
                //star1.calculationview.xml is having Star Join/Union Node; so we will expect UnsupportedOperationException here
                readRepoFile(assert, "star1.calculationview.xml");
            }, modelbase.UnsupportedOperationException, "must throw UnsupportedOperationException to pass");
        });*/

        QUnit.test("createElement", function(assert) {
            var reader, writer, root, test1, test2, test3, rootElement, intermediateElement, test1Element, test2Element, test3Element, resultString,
                xmlString =
                    '<?xml version="1.0" encoding="UTF-8"?>\n' +
                    '<root>\n' +
                    '    <skipped1/>\n' +
                    '    <test id="1">\n' +
                    '        <skipped2/>\n' +
                    '    </test>\n' +
                    '    <skipped3/>\n' +
                    '    <intermediate>\n' +
                    '        <skipped4/>\n' +
                    '        <test id="2">\n' +
                    '            <skipped5/>\n' +
                    '        </test>\n' +
                    '        <skipped5/>\n' +
                    '        <test id="3">text content</test>\n' +
                    '        <skipped6/>\n' +
                    '    </intermediate>\n' +
                    '    <skipped7/>\n' +
                    '</root>';

            reader = new XmlReader(xmlString);
            reader.moveDown().moveTo("root");
            root = new TestObject(reader.buildAttributes({}), reader.skippedNodes);

            reader.moveDown().moveTo("test");
            test1 = new TestObject(reader.buildAttributes({
                id: "{id}"
            }), reader.skippedNodes);
            reader.next();

            reader.moveToIntermediate("intermediate");
            reader.moveDown().moveTo("test");
            test2 = new TestObject(reader.buildAttributes({
                id: "{id}"
            }), reader.skippedNodes);
            reader.next().moveTo("test");
            test3 = new TestObject(reader.buildAttributes({
                id: "{id}"
            }), reader.skippedNodes);
            test3.textContent = reader.consumeContent();
            reader.next();
            reader.moveUp();
            reader.next();
            reader.moveUp().moveUp();

            // test serialize in order
            writer = new XmlWriter();
            rootElement = writer.writeRootElement(root, "root", {});
            test1Element = writer.writeElement(test1, rootElement, "test", {
                id: "{id}"
            });
            intermediateElement = writer.writeIntermediateElement(
                root, rootElement, "root", "intermediate");
            test2Element = writer.writeElement(test2, intermediateElement, "test", {
                id: "{id}"
            });
            test3Element = writer.writeElement(test3, intermediateElement, "test", {
                id: "{id}"
            });
            writer.writeTextContent(test3Element, test3.textContent);

            writer.close();
            resultString = XmlSerializer.serializeToString(rootElement.parentNode);
            assert.strictEqual(resultString, xmlString, "serialize in order");

            // test serialize out of order
            writer = new XmlWriter();
            rootElement = writer.writeRootElement(root, "root", {});
            test3Element = writer.createElement(test3, "test", {
                id: "{id}"
            });
            writer.writeTextContent(test3Element, test3.textContent);
            test1Element = writer.createElement(test1, "test", {
                id: "{id}"
            });
            intermediateElement = writer.createIntermediateElement(
                root, "root", "intermediate");
            test2Element = writer.writeElement(test2, intermediateElement, "test", {
                id: "{id}"
            });

            writer.writeNode(test1Element, rootElement);
            writer.writeNode(intermediateElement, rootElement);
            // writer.writeNode(test2Element, intermediateElement);
            writer.writeNode(test3Element, intermediateElement);

            writer.close();
            resultString = XmlSerializer.serializeToString(rootElement.parentNode);
            assert.strictEqual(resultString, xmlString, "serialize in order");

        });
    });