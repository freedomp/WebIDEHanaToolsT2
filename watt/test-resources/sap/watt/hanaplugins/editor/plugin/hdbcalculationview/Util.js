define(['watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/common', 'watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase'], function(common, modelbase) {
    "use strict";
 
    var AbstractModel = modelbase.AbstractModel;
    var AbstractModelClass = modelbase.AbstractModelClass;
    var ReferenceManager = modelbase.ReferenceManager;
 
    function compareValues(s1, s2) {
        if (s1 === s2) return 0;
        if (typeof s1 === "undefined") return -1;
        if (typeof s2 === "undefined") return 1;
        if (s1 === null) return -1;
        if (s2 === null) return 1;
        if (typeof s1 !== typeof s2) return -1;
        return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
    }
 
    function compareEvents(e1, e2) {
        if (e1 === e2) return 0;
        if (typeof e1 === "undefined") return -1;
        if (typeof e2 === "undefined") return 1;
        if (e1 === null) return -1;
        if (e2 === null) return 1;
        if (typeof e1 !== "object") return -1;
        if (typeof e2 !== "object") return 1;
        var result = compareValues(e1.type, e2.type);
        if (result !== 0) return result;
        result = compareValues(e1.name, e2.name);
        if (result !== 0) return result;
        result = compareValues(e1.originalName, e2.originalName);
        if (result !== 0) return result;
        result = compareSources(e1.source, e2.source);
        return result;
    }
 
    function compareSources(s1, s2) {
        if (s1 === s2) return 0;
        if (typeof s1 === "undefined") return -1;
        if (typeof s2 === "undefined") return 1;
        if (s1 === null) return -1;
        if (s2 === null) return 1;
        if (typeof s1 !== "object") return -1;
        if (typeof s2 !== "object") return 1;
        var result = compareValues(s1.className, s2.className);
        if (result !== 0) return result;
        result = compareValues(s1.name, s2.name);
        return result;
    }
 
    function simplifyEventSource(source) {
        if (typeof source !== "object") return source;
        if (source instanceof AbstractModel) {
            return {
                className: source.$$className
            };
        } else {
            return {
                name: source.$getKeyPath(),
                className: source.$$className
            };
        }
    }
 
    function simplifyEvent(event) {
        if (typeof event !== "object") return event;
 
        var result = {};
        for (var prop in event) {
            if (!event.hasOwnProperty(prop)) continue;
 
            if (prop === "source") {
                result.source = simplifyEventSource(event.source);
            } else {
                result[prop] = event[prop];
            }
        }
        return result;
    }
 
    var EventListener = function(testName, source) {
        this.received = [];
        this.source = simplifyEventSource(source);
        if (source) {
            source.$getEvents().subscribe(modelbase.ModelEvents.ALL, this.listen, this);
        }
        this.testName = testName;
    };
    EventListener.prototype = {
        listen: function(event) {
            this.received.push(simplifyEvent(event));
        },
        verifyChanged: function(testName, type, name, originalName) {
            if (arguments.length > 3) {
                this.verify(testName, [{
                    source: this.source,
                    type: modelbase.ModelEvents.CHANGED
                }, {
                    source: this.source,
                    type: type,
                    name: name,
                    originalName: originalName
                }]);
            } else if (arguments.length > 2) {
                this.verify(testName, [{
                    source: this.source,
                    type: modelbase.ModelEvents.CHANGED
                }, {
                    source: this.source,
                    type: type,
                    name: name
                }]);
            } else if (arguments.length > 1) {
                this.verify(testName, [{
                    source: this.source,
                    type: modelbase.ModelEvents.CHANGED
                }, {
                    source: this.source,
                    type: type
                }]);
            } else {
                this.verify(testName, [{
                    source: this.source,
                    type: modelbase.ModelEvents.CHANGED
                }]);
            }
        },
        verify: function(testName, expected) {
            if (expected) {
                if (Array.isArray(expected)) {
                    this.expected = expected;
                } else {
                    this.expected = [expected];
                }
            } else {
                this.expected = [];
            }
            var recievedSorted = this.received.sort(compareEvents);
            var expectedSorted = this.expected.sort(compareEvents);
            deepEqual(recievedSorted, expectedSorted, this.testName + (testName ? " " + testName : ""));
            this.received = [];
        }
    };
 
    function addValuesToCollection(coll, keys, values) {
        for (var i = 0; i < keys.length; i++) {
            coll.add(keys[i], values[i]);
        }
    }
 
    function verifyCollection(testName, coll, expectedKeys, expectedValues) {
        var i = 0;
        var expectedValuesCondensed = [];
        var expectedKeysCondensed = expectedKeys.filter(function(key) {
            var value = expectedValues[i++];
            if (typeof key === "undefined") return false;
            expectedValuesCondensed.push(value);
            return true;
        });
        strictEqual(coll.count(), expectedKeysCondensed.length, testName + ": count");
        var result, expected;
        for (i = 0; i < expectedKeysCondensed.length; i++) {
            result = coll.get(expectedKeysCondensed[i]);
            expected = expectedValuesCondensed[i];
            if (result instanceof AbstractModelClass) {
                result = result.$getAttributes();
            }
            if (expected instanceof AbstractModelClass) {
                expected = expected.$getAttributes();
            }
            deepEqual(result, expected, testName + ": value of key " + expectedKeysCondensed[i]);
        }
        i = 0;
        coll.foreach(function(result) {
            expected = expectedValuesCondensed[i];
            if (result instanceof AbstractModelClass) {
                result = result.$getAttributes();
            }
            if (expected instanceof AbstractModelClass) {
                expected = expected.$getAttributes();
            }
            deepEqual(result, expected, testName + ": loop value at " + i);
            i++;
        });
        strictEqual(i, expectedKeysCondensed.length, testName + ": number of loops performed");
        var toArray = coll.toArray();
        strictEqual(toArray.length, expectedKeys.length, testName + ": toArray length");
        strictEqual(coll.size(), expectedKeys.length, testName + ": size");
        for (i = 0; i < expectedKeys.length; i++) {
            result = toArray[i];
            expected = expectedValues[i];
            if (result instanceof AbstractModelClass) {
                result = result.$getAttributes();
            }
            if (expected instanceof AbstractModelClass) {
                expected = expected.$getAttributes();
            }
            deepEqual(result, expected, testName + ": toArray found expected value at " + i);
        }
        for (i = 0; i < expectedKeys.length; i++) {
            if (typeof expectedKeys[i] !== "undefined") {
                strictEqual(coll.indexOf(expectedKeys[i]), i, "indexof for " + expectedKeys[i]);
            }
            result = coll.getAt(i);
            expected = expectedValues[i];
            if (result instanceof AbstractModelClass) {
                result = result.$getAttributes();
            }
            if (expected instanceof AbstractModelClass) {
                expected = expected.$getAttributes();
            }
            deepEqual(result, expected, testName + ": getAt found expected value at " + i);
        }
    }
 
    function verifyReferences(testName, actual, expected, shortFeaturePath) {
        var i;
        var actualStrings = [];
        var expectedStrings = [];
        for (i = 0; i < actual.length; i++) {
            actualStrings.push(ReferenceManager.stringifyReference(actual[i], shortFeaturePath));
        }
        for (i = 0; i < expected.length; i++) {
            expectedStrings.push(ReferenceManager.stringifyReference(expected[i], shortFeaturePath));
        }
        actualStrings.sort();
        expectedStrings.sort();
        deepEqual(actualStrings, expectedStrings, testName);
    }
 
    function moduleUI5(moduleName, parentId) {
 
        var controls = [];
 
        function testStart(details) {
            var elem = $('#' + parentId);
            if (elem.size() === 0) {
                elem = jQuery('<div/>', {
                    id: parentId,
                    style: "width: 800px; height: 600px; margin: 0; padding: 0; border-width: 0; border-style: none"
                });
                elem.appendTo('body');
            }
        }
 
        function testDone(details) {
            var elem = $('#' + parentId);
            while (controls.length > 0) {
                controls.pop().destroy();
            }
            if (elem.size() !== 0) {
                elem.empty();
            }
        }
 
        if (!parentId) {
            parentId = "controlsParent";
        }
 
        function placeAt(control, containerId) {
            if (containerId) {
                var elem = jQuery('<div/>', {
                    id: containerId
                });
                elem.appendTo('#' + parentId);
            } else {
                containerId = parentId;
            }
            if (control) {
                control.placeAt(containerId);
                controls.push(control);
            }
            return $('#' + containerId);
        }
 
        module(moduleName, {
            setup: testStart,
            teardown: testDone
        });
 
       return placeAt;
    }
 
    return {
        moduleUI5: moduleUI5,
        verifyReferences: verifyReferences,
        verifyCollection: verifyCollection,
        addValuesToCollection: addValuesToCollection,
        EventListener: EventListener
    };
});