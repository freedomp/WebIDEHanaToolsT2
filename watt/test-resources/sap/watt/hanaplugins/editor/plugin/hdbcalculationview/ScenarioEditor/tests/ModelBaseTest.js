define(['sap/hana/ide/editor/plugin/analytics/base/common', 'sap/hana/ide/editor/plugin/analytics/base/modelbase', './Util'], function(common, modelbase, util) {
    "use strict";

    var ModelCollection = modelbase.ModelCollection;
    var AbstractModel = modelbase.AbstractModel;
    var AbstractModelClass = modelbase.AbstractModelClass;
    var ReferenceManager = modelbase.ReferenceManager;
    var DeleteCommand = modelbase.DeleteCommand;

    var TestCommand = function(object, value) {
        this._object = object;
        this._value = value;
        this._valueReplaced = undefined;
    };
    TestCommand.prototype = {
        execute: function(model, events) {
            this._valueReplaced = this._object.value;
            this._object.value = this._value;
            return this._valueReplaced;
        },
        undo: function(model, events) {
            this._object.value = this._valueReplaced;
            this._valueReplaced = undefined;
            return this._value;
        }
    };
    var TestModel = AbstractModel.extend("TestModel", {
        $features: {
            containments: {
                "children": {
                    isMany: true
                },
                "root": {}
            },
            references: {
                "defaultNode": {},
                "allChildren": {
                    isMany: true
                }
            }
        }
    });
    var TestEntityKey = AbstractModelClass.extend("TestEntityKey", {
        $features: {
            keyAttribute: "name",
            containments: {
                "children": {
                    isMany: true
                },
                "sub": {}
            },
            references: {
                "next": {},
                "prev": {}
            }
        },

        createChild: function(attributes) {
            var child = this.children.add(new TestEntityKey(attributes));
            this.$getModel().allChildren.add(child);
            return child;
        }

    });
    var TestEntity = AbstractModelClass.extend("TestEntity", {
        $features: {
            containments: {
                "sub": {}
            },
            references: {
                "next": {}
            }
        },

        createSub: function(attributes) {
            this.sub = new TestEntityKey(attributes);
            this.$getModel().allChildren.add(this.sub);
            return this.sub;
        }

    });

    var TestEvents = {};
    TestEvents.ALL = modelbase.ModelEvents.ALL;
    TestEvents.CHANGED = modelbase.ModelEvents.CHANGED;
    TestEvents.TESTENTITY_CREATED = "testentity_created";
    TestEvents.TESTENTITY_DELETED = "testentity_deleted";
    TestEvents.TESTENTITY_CHANGED = "testentity_changed";
    TestEvents.TESTENTITY_MOVED = "testentity_moved";
    TestEvents.TESTENTITYKEY_CREATED = "testentitykey_created";
    TestEvents.TESTENTITYKEY_DELETED = "testentitykey_deleted";
    TestEvents.TESTENTITYKEY_CHANGED = "testentitykey_changed";
    TestEvents.TESTENTITYKEY_MOVED = "testentitykey_moved";
    modelbase.ModelEvents.registerEventTypes(TestEntity, {
        created: TestEvents.TESTENTITY_CREATED,
        deleted: TestEvents.TESTENTITY_DELETED,
        changed: TestEvents.TESTENTITY_CHANGED,
        moved: TestEvents.TESTENTITY_MOVED
    });
    modelbase.ModelEvents.registerEventTypes(TestEntityKey, {
        created: TestEvents.TESTENTITYKEY_CREATED,
        deleted: TestEvents.TESTENTITYKEY_DELETED,
        changed: TestEvents.TESTENTITYKEY_CHANGED,
        moved: TestEvents.TESTENTITYKEY_MOVED
    });

    module("modelbase");

    test("extend", function() {
        throws(function() {
            AbstractModelClass.extend({});
        }, /assert/, "no className");

        throws(function() {
            AbstractModelClass.extend("", {});
        }, /assert/, "invalid className");

        throws(function() {
            AbstractModelClass.extend("%", {});
        }, /assert/, "invalid className");

        var Test1 = AbstractModelClass.extend("Test1", {
            $init: function() {
                this.$defineReference(1);
            }
        });

        throws(function() {
            new Test1();
        }, /assert/, "invalid feature name");

        Test1 = AbstractModelClass.extend("Test1", {
            $features: {
                references: {
                    "$test": {}
                }
            }
        });

        throws(function() {
            new Test1();
        }, /assert/, "invalid feature name");

        var Test2 = AbstractModelClass.extend("Test2", {
            $init: function() {
                this.$defineReference("a");
                this.$defineReference("b");
                this.$defineContainment("b", true);
            }
        });

        throws(function() {
            new Test2();
        }, /assert/, "duplicate feature name");

        Test1 = AbstractModelClass.extend("Test1", {
            $features: {
                references: {
                    "test1": {}
                }
            }
        });
        Test2 = Test1.extend("Test2", {
            $features: {
                references: {
                    "test2": {}
                }
            }
        });
        var t1 = new Test1();
        var t2 = new Test2();
        ok(t1 instanceof Test1, "t1 instanceof Test1");
        ok(t2 instanceof Test1, "t2 instanceof Test1");
        ok(t2 instanceof Test2, "t2 instanceof Test2");
        ok(!(t1 instanceof Test2), "t1 instanceof Test2");
        ok(t1.hasOwnProperty("test1"), "test1 of t1");
        ok(!t1.hasOwnProperty("test2"), "test2 of t1");
        ok(t2.hasOwnProperty("test1"), "test1 of t2");
        ok(t2.hasOwnProperty("test2"), "test2 of t2");
        t1.test1 = new Test1({
            id: 1
        });
        t2.test1 = new Test1({
            id: 2
        });
        t2.test2 = new Test1({
            id: 3
        });
        strictEqual(t1.test1.id, 1, "test1 of t1");
        strictEqual(t2.test1.id, 2, "test1 of t2");
        strictEqual(typeof t1.test2, "undefined", "test2 of t1");
        strictEqual(t2.test2.id, 3, "test2 of t2");

    });

    test("setAttributes", function() {
        var keyEntity1 = new TestEntityKey({
            name: "key1",
            value1: 1
        });

        // negative tests
        throws(function() {
            keyEntity1.$setAttributes({
                name: "key2"
            });
        }, /assert/, "key must not be changed");

        throws(function() {
            keyEntity1.$setAttributes({
                sub: new TestEntity()
            });
        }, /assert/, "direct assignment of model classes not possible");

        // set simple attributes
        keyEntity1.$setAttributes({
            name: "key1",
            value1: 2,
            value2: 2,
            $value: 3
        });
        strictEqual(keyEntity1.name, "key1", "key change with identical value allowed");
        strictEqual(keyEntity1.value1, 2, "existing value changed");
        strictEqual(keyEntity1.value2, 2, "new value added");
        strictEqual(keyEntity1.sub, undefined, "empty sub");
        strictEqual(keyEntity1.$value, undefined, "framework property not set");

        // create containment
        keyEntity1.$setAttributes({
            sub: {
                $constructor: TestEntity,
                value1: 1
            },
            value1: 3
        });
        ok(keyEntity1.sub instanceof TestEntity, "sub is instanceof TestEntity");
        strictEqual(keyEntity1.sub.value1, 1, "new value added to sub");
        strictEqual(keyEntity1.value1, 3, "existing value changed");

        // modify containment
        var oldSub = keyEntity1.sub;
        keyEntity1.$setAttributes({
            sub: {
                $constructor: TestEntity,
                value1: 2,
                value2: 2
            },
            value1: 4
        });
        strictEqual(keyEntity1.sub, oldSub, "sub has been retained");
        strictEqual(keyEntity1.sub.value1, 2, "existing value changed at sub");
        strictEqual(keyEntity1.sub.value2, 2, "new value added to sub");
        strictEqual(keyEntity1.value1, 4, "existing value changed");

        // remove containment and simple attribute
        keyEntity1.$setAttributes({
            sub: undefined,
            value1: 5,
            value2: undefined
        });
        strictEqual(oldSub.$$removed, true, "sub has been removed");
        strictEqual(keyEntity1.sub, undefined, "empty sub");
        strictEqual(keyEntity1.value1, 5, "existing value changed");
        ok(!keyEntity1.hasOwnProperty("value5"), "value removed");

        // create deep containment
        keyEntity1.$setAttributes({
            sub: {
                $constructor: TestEntity,
                value1: 1,
                sub: {
                    $constructor: TestEntityKey,
                    name: "subsub",
                    value1: 2
                }
            }
        });
        ok(keyEntity1.sub instanceof TestEntity, "sub is instanceof TestEntity");
        strictEqual(keyEntity1.sub.value1, 1, "new value added to sub");
        ok(keyEntity1.sub.sub instanceof TestEntityKey, "sub.sub is instanceof TestEntityKey");
        strictEqual(keyEntity1.sub.sub.value1, 2, "new value added to sub.sub");

        var oldSubSub = keyEntity1.sub.sub;
        oldSub = keyEntity1.sub;

        // modify deep containment
        keyEntity1.$setAttributes({
            sub: {
                $constructor: TestEntity,
                sub: {
                    $constructor: TestEntityKey,
                    value1: 3
                }
            }
        });
        strictEqual(keyEntity1.sub, oldSub, "sub has been retained");
        strictEqual(keyEntity1.sub.sub, oldSubSub, "sub.sub has been retained");
        strictEqual(keyEntity1.sub.sub.value1, 3, "existing value changed at sub");

        // type change not allowed
        throws(function() {
            keyEntity1.$setAttributes({
                sub: {
                    $constructor: TestEntityKey
                }
            });
        }, /assert/, "type change not allowed");

        // replace
        keyEntity1.$setAttributes({
            sub: {
                $constructor: TestEntityKey,
                $forceCreate: true,
                name: "force"
            }
        });
        notStrictEqual(keyEntity1.sub, oldSub, "new sub has been created");
        ok(oldSub.$$removed, "old sub has been removed");
        ok(oldSubSub.$$removed, "old sub.sub has been removed");

        // assign reference
        keyEntity1.$setAttributes({
            next: keyEntity1.sub
        });
        strictEqual(keyEntity1.next, keyEntity1.sub, "next is a reference to sub");

        // change reference
        keyEntity1.$setAttributes({
            next: keyEntity1.sub.sub
        });
        strictEqual(keyEntity1.next, keyEntity1.sub.sub, "next is a reference to sub.sub");
        strictEqual(keyEntity1.sub.$$removed, false, "sub removed?");

        // set collection via array
        keyEntity1.$setAttributes({
            children: [{
                $constructor: TestEntityKey,
                name: "1"
            }, {
                $constructor: TestEntityKey,
                name: "2"
            }]
        });
        strictEqual(keyEntity1.children.count(), 2, "number of children created");

        // replace the content of a collection
        var old0 = keyEntity1.children.getAt(0);
        var old1 = keyEntity1.children.getAt(1);
        keyEntity1.$setAttributes({
            children: [{
                $constructor: TestEntityKey,
                name: "2"
            }]
        });
        strictEqual(keyEntity1.children.count(), 1, "number of children created");
        notStrictEqual(keyEntity1.children.getAt(0), old0, "first element has been replaced");
        ok(old0.$$removed, "first element removed");
        ok(old1.$$removed, "second element removed");

        // change the content of a collection
        var old0 = keyEntity1.children.getAt(0);
        keyEntity1.$setAttributes({
            children: {
                "2": {
                    $constructor: TestEntityKey,
                    name: "2",
                    value1: 1
                },
                "3": {
                    $constructor: TestEntityKey,
                    name: "3"
                }
            }
        });
        strictEqual(keyEntity1.children.count(), 2, "number of children");
        strictEqual(keyEntity1.children.get("2"), old0, "first element has been merged");
        strictEqual(old0.value1, 1, "first element has been merged");
        strictEqual(keyEntity1.children.get("3").name, "3", "second element has been added");
    });

    test("model collection, empty", function() {
        // setup
        var coll = new ModelCollection(new TestModel(), "coll");
        // test
        strictEqual(coll.get("unknown"), undefined, "unknown key");
        util.verifyCollection("is empty", coll, [], []);
        // test clear
        coll.clear();
        util.verifyCollection("clear empty", coll, [], []);
    });

    test("model collection, single entry", function() {
        // setup
        var keys = ["x"];
        var values = [{
            x: "x"
        }];
        var removedKey;
        var removedValue;
        var coll = new ModelCollection(new TestModel(), "coll");
        // test
        coll.add(keys[0], values[0]);
        throws(function() {
            coll.add(keys[0], "duplicate");
        }, modelbase.ObjectAlreadyExistsException, "add known key");
        strictEqual(coll.get(keys[0]), values[0], "known key");
        strictEqual(coll.get("unknown"), undefined, "unknown key");
        util.verifyCollection("add single", coll, keys, values);
        // test removal
        removedKey = keys[0];
        removedValue = values[0];
        strictEqual(coll.remove("unknown"), undefined, "remove unknown key");
        strictEqual(coll.remove(removedKey), removedValue, "remove key");
        strictEqual(coll.get(removedKey), undefined, "removed key");
        util.verifyCollection("remove single", coll, [], []);
        // test clear
        coll.add(keys[0], values[0]);
        coll.clear();
        strictEqual(coll.get("unknown"), undefined, "unknown key after clear");
        util.verifyCollection("clear single", coll, [], []);
    });

    test("model collection, multiple entries", function() {
        // setup
        var keys = ["x", "y", "a", 0, {
            z: "z"
        }];
        var values = [{
                x: "x"
            },
            1, 2, "3", {
                z: "z"
            }
        ];
        var removedKey;
        var removedValue;
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);
        // test
        strictEqual(coll.get("unknown"), undefined, "unknown key");
        util.verifyCollection("add multiple entries", coll, keys, values);
        // test removal
        removedKey = keys[1];
        removedValue = values[1];
        keys = [keys[0], keys[2], keys[3], keys[4]];
        values = [values[0], values[2], values[3], values[4]];
        strictEqual(coll.remove("unknown"), undefined, "remove unknown key");
        strictEqual(coll.remove(removedKey), removedValue, "remove key");
        strictEqual(coll.get(removedKey), undefined, "removed key");
        util.verifyCollection("remove entry at index 1", coll, keys, values);
        // test removal last index
        var lastIndex = keys.length - 1;
        removedKey = keys[lastIndex];
        removedValue = values[lastIndex];
        keys = [keys[0], keys[1], keys[2]];
        values = [values[0], values[1], values[2]];
        strictEqual(coll.remove("unknown"), undefined, "remove unknown key");
        strictEqual(coll.remove(removedKey), removedValue, "remove key");
        strictEqual(coll.get(removedKey), undefined, "removed key");
        util.verifyCollection("remove entry at last index", coll, keys, values);
        // test clear
        coll.clear();
        strictEqual(coll.get("unknown"), undefined, "unknown key after clear");
        util.verifyCollection("clear", coll, [], []);
    });


    test("model collection, add before", function() {
        // setup
        var testName = "add before";
        var keys = ["y", "z", "x"];
        var values = [10, 11, 12];
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);

        // test
        coll.add("a", 1, "x");
        throws(function() {
            coll.add("a", 100, "z");
        }, modelbase.ObjectAlreadyExistsException, testName + ": existing key");
        coll.add("b", 2, "y");
        coll.add("c", 3, "unknown");
        coll.add("d", 4, "d");

        util.verifyCollection("add before", coll, ["b", "y", "z", "a", "x", "c", "d"], [2, 10, 11, 1, 12, 3, 4]);
    });

    test("model collection, moveUp", function() {
        // setup
        var keys = ["y", "z", "x"];
        var values = [10, 11, 12];
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);
        // test
        coll.moveUp("y");
        coll.moveUp("unknown");
        util.verifyCollection("moveUp nothing", coll, keys, values);
        // test
        coll.moveUp("z");
        coll.moveUp("x");
        coll.moveUp("x");
        util.verifyCollection("moveUp multiple", coll, ["x", "z", "y"], [12, 11, 10]);
    });

    test("model collection, moveDown", function() {
        // setup
        var keys = ["y", "z", "x"];
        var values = [10, 11, 12];
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);
        // test
        coll.moveDown("x");
        coll.moveDown("unknown");
        util.verifyCollection("moveDown nothing", coll, keys, values);
        // test
        coll.moveDown("z");
        coll.moveDown("y");
        coll.moveDown("y");
        util.verifyCollection("moveDown multiple", coll, ["x", "z", "y"], [12, 11, 10]);
    });

    test("model collection, getNextKey, getPreviousKey", function() {
        // setup
        var keys = ["y", "z", "x"];
        var values = [10, 11, 12];
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);
        // test
        strictEqual(coll.getNextKey("unknown"), undefined, "next of non existing key");
        strictEqual(coll.getNextKey("y"), "z", "next existing key");
        strictEqual(coll.getNextKey("x"), undefined, "next of last existing key");
        strictEqual(coll.getPreviousKey("unknown"), undefined, "previous non existing key");
        strictEqual(coll.getPreviousKey("z"), "y", "previous existing key");
        strictEqual(coll.getPreviousKey("y"), undefined, "previous first existing key");
    });

    test("model collection, rename", function() {
        // setup
        var keys = ["y", "z", "x"];
        var values = [{
                value: 10
            },
            11, {
                value: 12
            }
        ];
        var coll = new ModelCollection(new TestModel(), "coll");
        util.addValuesToCollection(coll, keys, values);
        // test
        coll.rename("x", "a");
        coll.rename("y", "b");
        coll.rename("z", "c");
        util.verifyCollection("rename", coll, ["b", "c", "a"], values);
        throws(function() {
            coll.rename("c", "b");
        }, modelbase.ObjectAlreadyExistsException, "rename existing key");
    });

    test("model collection w/o key attribute", function() {
        var model = new TestModel(true);
        var entity1 = new TestEntity({
            id: 1
        });
        var entity2 = new TestEntity({
            id: 2
        });
        var entity3 = new TestEntity({
            id: 3
        });
        var keyEntity1 = new TestEntityKey({
            name: "key1"
        });
        strictEqual(entity1.$getKeyAttributeValue(), -1, "default key value before add");
        strictEqual(entity1.$getKeyAttributeName(), undefined, "defined key attribute name");
        strictEqual(entity1.$hasKeyAttribute(), false, "has defined key attribute");
        model.children.add(entity1);
        strictEqual(entity1.$getKeyAttributeValue(), 0, "default key value after add");
        strictEqual(entity1.$getKeyAttributeName(), undefined, "defined key attribute name");
        strictEqual(entity1.$hasKeyAttribute(), false, "has defined key attribute");

        strictEqual(entity2.$getKeyAttributeValue(), -1, "default key value before add");
        model.children.add(entity2);
        strictEqual(entity2.$getKeyAttributeValue(), 1, "default key value after add");

        strictEqual(entity3.$getKeyAttributeValue(), -1, "default key value before add");
        model.children.add(entity3, 1);
        strictEqual(entity3.$getKeyAttributeValue(), 2, "default key value after add");

        strictEqual(keyEntity1.$getKeyAttributeValue(), "key1", "defined key value before add");
        strictEqual(keyEntity1.$getKeyAttributeName(), "name", "defined key attribute name");
        strictEqual(keyEntity1.$hasKeyAttribute(), true, "has defined key attribute");
        model.children.add(keyEntity1);
        strictEqual(keyEntity1.$getKeyAttributeValue(), "key1", "defined key value after add");
        strictEqual(keyEntity1.$getKeyAttributeName(), "name", "defined key attribute name");
        strictEqual(keyEntity1.$hasKeyAttribute(), true, "has defined key attribute");

        util.verifyCollection("add w/o key", model.children, [0, 2, 1, "key1"], [entity1, entity3, entity2, keyEntity1]);
    });

    test("model collection, setAt, getAt", function() {
        var coll = new ModelCollection(new TestModel(), "coll");
        var entity1 = new TestEntityKey({
            name: "key1"
        });
        var entity1b = new TestEntityKey({
            name: "key1",
            value: "b"
        });
        var entity2 = new TestEntityKey({
            name: "key2"
        });
        var entity3 = new TestEntityKey({
            name: "key3"
        });
        var entity4 = new TestEntityKey({
            name: "key4"
        });

        // set
        coll.setAt(1, entity1);
        util.verifyCollection("set", coll, [undefined, "key1"], [undefined, entity1]);

        // replace
        coll.setAt(1, entity2);
        util.verifyCollection("replace", coll, [undefined, "key2"], [undefined, entity2]);

        // add after
        coll.add(entity1);
        util.verifyCollection("add after", coll, [undefined, "key2", "key1"], [undefined, entity2, entity1]);

        // set after
        coll.setAt(3, entity4);
        util.verifyCollection("set after", coll, [undefined, "key2", "key1", "key4"], [undefined, entity2, entity1, entity4]);

        // replace2
        coll.setAt(2, entity3);
        util.verifyCollection("replace2", coll, [undefined, "key2", "key3", "key4"], [undefined, entity2, entity3, entity4]);

        // set before
        coll.setAt(0, entity1);
        util.verifyCollection("set before", coll, ["key1", "key2", "key3", "key4"], [entity1, entity2, entity3, entity4]);

        // remove
        coll.remove("key2");
        util.verifyCollection("remove", coll, ["key1", "key3", "key4"], [entity1, entity3, entity4]);

        // existing key
        throws(function() {
            coll.setAt(3, entity1);
        }, modelbase.ObjectAlreadyExistsException, "existing key");

        // existing key, same index
        throws(function() {
            coll.setAt(0, entity1b);
        }, modelbase.ObjectAlreadyExistsException, "existing key, same index");

        // invalid index
        throws(function() {
            coll.setAt(-1, entity2);
        }, /assert/, "invalid index");

        // invalid index
        throws(function() {
            coll.setAt("2", entity2);
        }, /assert/, "invalid index");

        // invalid value
        throws(function() {
            coll.setAt(2, null);
        }, /assert/, "invalid value");

        // invalid index
        throws(function() {
            coll.setAt("1", {
                name: "key2"
            });
        }, /assert/, "invalid value");

        // set undefined
        coll.setAt(0, undefined);
        util.verifyCollection("set undefined", coll, [undefined, "key3", "key4"], [undefined, entity3, entity4]);

        // next/previous key
        coll.setAt(5, entity1);
        strictEqual(coll.getNextKey("key4"), "key1", "getNextKey");
        strictEqual(coll.getPreviousKey("key1"), "key4", "getPreviousKey");

        // move        
        coll.moveUp("key3");
        util.verifyCollection("move up", coll, [undefined, "key3", "key4", undefined, undefined, "key1"], [undefined, entity3, entity4, undefined, undefined, entity1]);

        coll.moveDown("key3");
        util.verifyCollection("move down", coll, [undefined, "key4", "key3", undefined, undefined, "key1"], [undefined, entity4, entity3, undefined, undefined, entity1]);

        coll.moveDown("key3");
        util.verifyCollection("move down II", coll, [undefined, "key4", undefined, undefined, "key1", "key3"], [undefined, entity4, undefined, undefined, entity1, entity3]);

    });

    test("undo/redo", function() {
        // setup
        var testObject = {
            value: 1
        };
        var model = new TestModel(true);
        model.$finishLoading();
        var undoManager = model.$getUndoManager();

        strictEqual(undoManager.execute(new TestCommand(testObject, 2)), 1, "first execute");
        strictEqual(undoManager.execute(new TestCommand(testObject, 3)), 2, "second execute");
        strictEqual(undoManager.undo(), 3, "first undo");
        strictEqual(undoManager.undo(), 2, "second undo");
        strictEqual(undoManager.redo(), 1, "first redo");
        strictEqual(undoManager.redo(), 2, "second redo");

        testObject = {
            value: 1
        };
        var cmd1 = new modelbase.CompoundCommand([new TestCommand(testObject, 2), new TestCommand(testObject, 3)]);
        var cmd2 = new modelbase.CompoundCommand([new TestCommand(testObject, 4), new TestCommand(testObject, 5)]);
        undoManager.execute(cmd1);
        strictEqual(testObject.value, 3, "compound first execute");
        undoManager.execute(cmd2);
        strictEqual(testObject.value, 5, "compound second execute");
        undoManager.undo();
        strictEqual(testObject.value, 3, "compound first undo");
        undoManager.undo();
        strictEqual(testObject.value, 1, "compound first undo");
        undoManager.redo();
        strictEqual(testObject.value, 3, "compound first redo");
        undoManager.redo();
        strictEqual(testObject.value, 5, "compound first redo");
    });

    test("key path", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "root"
        });
        strictEqual(model.root.$getKeyPath(), "root", "root single");

        var directChild1 = model.children.add(new TestEntityKey({
            name: "direct1"
        }));
        strictEqual(directChild1.$getKeyPath(), 'children["direct1"]', "root collection w/ key");

        var directChild2 = model.children.add("specificKey", new TestEntity());
        strictEqual(directChild2.$getKeyPath(), 'children["specificKey"]', "root collection w/ explicit key value");

        var directChild3 = model.children.add(new TestEntity());
        strictEqual(directChild3.$getKeyPath(), 'children[' + directChild3.$getKeyAttributeValue() + ']', "root collection w/ implicit key value");

        var child = model.root.createChild({
            name: "child1"
        });
        strictEqual(child.$getKeyPath(), 'root.children["child1"]', "child collection");

        child.sub = new TestEntity();
        strictEqual(child.sub.$getKeyPath(), 'root.children["child1"].sub', "child single");
    });

    test("reference manager, getReferences", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });

        util.verifyReferences("used by model.allChildren, before add reference", ReferenceManager.getReferencesFrom(model.allChildren.getKeyPath()), []);
        util.verifyReferences("used by model, before add reference", ReferenceManager.getReferencesFrom(model), []);

        var child = model.root.createChild({
            name: "child1"
        });

        util.verifyReferences("used by model, after add reference", ReferenceManager.getReferencesFrom(model), [{
            feature: model.allChildren,
            key: "child1",
            object: child
        }]);

        model.allChildren.rename("child1", "child1RenamedRef");
        util.verifyReferences("used by model, after rename reference", ReferenceManager.getReferencesFrom(model), [{
            feature: model.allChildren,
            key: "child1RenamedRef",
            object: child
        }]);

        child.$rename("childRenamed");
        util.verifyReferences("used by model, after rename", ReferenceManager.getReferencesFrom(model), [{
            feature: model.allChildren,
            key: "child1RenamedRef",
            object: child
        }]);

        util.verifyReferences("using root, before set reference", ReferenceManager.getReferencesTo(model.root, true, true), []);
        util.verifyReferences("using root, before set reference", ReferenceManager.getReferencesFrom(model.$getFeature("defaultNode")), []);
        model.
        defaultNode = model.root;
        util.verifyReferences("used by model, after set reference", ReferenceManager.getReferencesFrom(model), [{
            feature: model.allChildren,
            key: "child1RenamedRef",
            object: child
        }, {
            feature: model.$getFeature("defaultNode"),
            object: model.root
        }]);
        util.verifyReferences("using root, before set reference", ReferenceManager.getReferencesFrom(model.$getFeature("defaultNode")), [{
            feature: model.$getFeature("defaultNode"),
            object: model.root
        }]);
        util.verifyReferences("using root, after set reference", ReferenceManager.getReferencesTo(model.root, true, true), [{
            feature: model.$getFeature("defaultNode")
        }]);

        model.root.children.remove("childRenamed");
        util.verifyReferences("used by model, after remove from collection", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("defaultNode"),
            object: model.root
        }]);

        model.
        defaultNode = null;
        util.verifyReferences("used by model, after remove reference", ReferenceManager.getReferencesFrom(model), []);

    });

    test("reference manager, restoreReferences simple", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });

        // create a simple reference 
        // defaultNode->root
        // remove and restore
        model.defaultNode = model.root;
        util.verifyReferences("used by model before removeReferences", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("defaultNode"),
            object: model.root
        }]);
        strictEqual(model.defaultNode, model.root, "root reference before removeReferences");

        var references = ReferenceManager.removeReferences(model.root);
        util.verifyReferences("used by model after removeReferences", ReferenceManager.getReferencesFrom(model), []);
        strictEqual(model.defaultNode, null, "root reference after removeReferences");

        model.root.$remove();
        strictEqual(model.root, null, "root after remove");

        model.root = new TestEntityKey({
            name: "root"
        });
        util.verifyReferences("used by model after recreate root", ReferenceManager.getReferencesFrom(model), []);
        strictEqual(model.defaultNode, null, "root reference after recreate root");

        ReferenceManager.restoreReferences(model.root, references);
        util.verifyReferences("used by model after restoreReferences", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("defaultNode"),
            object: model.root
        }]);
        strictEqual(model.defaultNode, model.root, "root reference after restoreReferences");

        var child1 = model.root.createChild({
            name: "child1"
        });
        var child2 = model.root.createChild({
            name: "child2"
        });
        var child3 = model.root.createChild({
            name: "child3"
        });
        child2.next = child3;
        child2.prev = child1;
        util.verifyReferences("used by model before removeReferences", ReferenceManager.getReferencesFrom(child2), [{
            feature: child2.$getFeature("next"),
            object: child3
        }, {
            feature: child2.$getFeature("prev"),
            object: child1
        }]);
        strictEqual(child2.next, child3, "next reference before removeReferences");
        strictEqual(child2.prev, child1, "prev reference before removeReferences");

        references = ReferenceManager.removeReferences(child2);
        util.verifyReferences("used by model after removeReferences", ReferenceManager.getReferencesFrom(child2), []);
        strictEqual(child2.next, null, "next reference after removeReferences");
        strictEqual(child2.prev, null, "prev reference after removeReferences");

        ReferenceManager.restoreReferences(child2, references);
        util.verifyReferences("used by model after restoreReferences", ReferenceManager.getReferencesFrom(child2), [{
            feature: child2.$getFeature("next"),
            object: child3
        }, {
            feature: child2.$getFeature("prev"),
            object: child1
        }]);
        strictEqual(child2.next, child3, "next reference after restoreReferences");
        strictEqual(child2.prev, child1, "prev reference after restoreReferences");

    });

    test("reference manager, restoreReferences complex", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });

        // create a complex reference
        // root.children["child1"].children["child1b"].next->root.children["child2"].children[0].sub
        var child1 = model.root.createChild({
            name: "child1"
        });
        var child1b = child1.children.add(new TestEntityKey({
            name: "child1b"
        }));
        var child2 = model.root.createChild({
            name: "child2"
        });
        var child3 = child2.children.add(new TestEntity());
        var child4 = child3.createSub({
            name: "child4"
        });
        child4.next = child2;
        child1b.next = child4;

        util.verifyReferences("used by child1b before remove", ReferenceManager.getReferencesFrom(child1b), [{
            feature: child1b.$getFeature("next"),
            object: child4
        }]);
        util.verifyReferences("used by model before remove", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("allChildren"),
            key: "child1",
            object: child1
        }, {
            feature: model.$getFeature("allChildren"),
            key: "child2",
            object: child2
        }, {
            feature: model.$getFeature("allChildren"),
            key: "child4",
            object: child4
        }]);

        var references = child1b.next.$remove();

        util.verifyReferences("used by child1b after remove", ReferenceManager.getReferencesFrom(child1), []);
        util.verifyReferences("used by model after remove", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("allChildren"),
            key: "child1",
            object: child1
        }, {
            feature: model.$getFeature("allChildren"),
            key: "child2",
            object: child2
        }]);

        strictEqual(child3.sub, null, "child3.sub after remove");

        child4 = new TestEntityKey({
            name: "child4"
        });
        child3.sub = child4;

        ReferenceManager.restoreReferences(child4, references);

        util.verifyReferences("used by child1b after restore", ReferenceManager.getReferencesFrom(child1b), [{
            feature: child1b.$getFeature("next"),
            object: child4
        }]);
        util.verifyReferences("used by model after restore", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("allChildren"),
            key: "child1",
            object: child1
        }, {
            feature: model.$getFeature("allChildren"),
            key: "child2",
            object: child2
        }, {
            feature: model.$getFeature("allChildren"),
            key: "child4",
            object: child4
        }]);
        strictEqual(child1b.next, child4, "child1b.next after restore");
        strictEqual(child4.next.name, child2.name, "child4.next after restore");

        // add refernce multiple times to the same collection
        model.allChildren.add("secondKey", child1);
        model.allChildren.add("thirdKey", child1);
        var refBeforeRemove = [{
            feature: model.$getFeature("allChildren"),
            key: "child1"
        }, {
            feature: model.$getFeature("allChildren"),
            key: "secondKey"
        }, {
            feature: model.$getFeature("allChildren"),
            key: "thirdKey"
        }];
        util.verifyReferences("using child1 before remove", ReferenceManager.getReferencesTo(child1, true, true), refBeforeRemove);

        // references in collections
        var allChildrenBefore = model.allChildren.toArray();

        references = child1.$remove();

        child1 = model.root.children.add(new TestEntityKey({
            name: "child1"
        }));
        ReferenceManager.restoreReferences(child1, references);

        var refAfterRestore = ReferenceManager.getReferencesTo(child1, true, true);
        util.verifyReferences("references to child1 after restore", refBeforeRemove, refAfterRestore);
        var allChildrenAfter = model.allChildren.toArray();
        strictEqual(allChildrenBefore.length, allChildrenAfter.length, "number of entries in collection after restore");
        for (var i = 0; i < allChildrenBefore.length; i++) {
            strictEqual(allChildrenBefore[i].$getKeyAttributeValue(), allChildrenAfter[i].$getKeyAttributeValue(), "key of entry #" + i + " in collection after restore");
        }

    });

    test("reference manager, remove from collection", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });

        var child1 = model.root.createChild({
            name: "child1"
        });

        // add refernce multiple times to the same collection
        model.allChildren.add("secondKey", child1);
        model.allChildren.add("thirdKey", child1);
        var refBeforeRemove = [{
            feature: model.$getFeature("allChildren"),
            key: "child1"
        }, {
            feature: model.$getFeature("allChildren"),
            key: "secondKey"
        }, {
            feature: model.$getFeature("allChildren"),
            key: "thirdKey"
        }];
        util.verifyReferences("using child1 before remove", ReferenceManager.getReferencesTo(child1, true, true), refBeforeRemove);

        // references in collections
        var allChildrenBefore = model.allChildren.toArray();

        model.allChildren.remove("child1");

        var refAfterRemove = [{
            feature: model.$getFeature("allChildren"),
            key: "secondKey"
        }, {
            feature: model.$getFeature("allChildren"),
            key: "thirdKey"
        }];
        util.verifyReferences("using child1 after remove", ReferenceManager.getReferencesTo(child1, true, true), refAfterRemove);
        var allChildrenAfter = model.allChildren.toArray();
        strictEqual(allChildrenAfter.length, 2, "number of entries in collection after remove");
        util.verifyReferences("used by model after remove", ReferenceManager.getReferencesFrom(model), [{
            feature: model.$getFeature("allChildren"),
            key: "secondKey",
            object: child1
        }, {
            feature: model.$getFeature("allChildren"),
            key: "thirdKey",
            object: child1
        }]);

    });

    test("remove from cyclic reference", function() {
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });
        var child1 = model.root.createChild({
            name: "child1"
        });
        var child2 = model.root.createChild({
            name: "child2"
        });

        child1.next = child2;
        child2.next = child1;

        var references = child1.$remove();
        util.verifyReferences("from child2 references after remove", ReferenceManager.getReferencesFrom(child2), []);
        util.verifyReferences("to child2 references after remove", ReferenceManager.getReferencesTo(child2, true, true), ['allChildren["child2"]']);
        strictEqual(child2.next, null, "reference after remove");
    });

    test("delete command", function() {
        var child = [];
        var model = new TestModel();
        model.root = new TestEntityKey({
            name: "child0"
        });
        child[0] = model.root;
        child[1] = model.root.createChild({
            name: "child1"
        });
        child[2] = model.root.createChild({
            name: "child2"
        });
        child[3] = child[2].children.add(new TestEntity());
        child[4] = child[2].children.add(new TestEntity());
        child[1].sub = new TestEntityKey({
            name: "child5"
        });
        child[5] = child[1].sub;

        child[5].next = child[4];
        child[4].next = child[3];
        child[3].next = child[1];
        child[1].next = child[2];
        child[2].next = child[0];
        child[0].next = child[5];
        child[1].publicAttr = "x";
        child[1]._privateAttr = "y";

        var modelListener = new util.EventListener("model events", model);
        var listener0 = new util.EventListener("child0 view events", child[0]);
        var listener2 = new util.EventListener("child2 view events", child[2]);

        var delete0Cmd = new DeleteCommand(child[0]);
        var delete3Cmd = new DeleteCommand(child[3]);
        model.$getUndoManager().execute(delete0Cmd);

        modelListener.verifyChanged("after delete", TestEvents.TESTENTITYKEY_DELETED, "child0");
        listener0.verify("after delete");
        listener2.verify("after delete");

        strictEqual(model.root, null, "root after delete");
        strictEqual(model.allChildren.toArray().length, 0, "allChildren after delete");
        strictEqual(child[0].$getModel(), null, "model of child0 after delete");
        strictEqual(child[1].$getContainer(), null, "container of child1 after delete");
        strictEqual(child[3].next, null, "next of child3 after delete");

        model.$getUndoManager().undo();

        modelListener.verifyChanged("after undo", TestEvents.TESTENTITYKEY_CREATED, "child0");
        listener0.verify("after undo");
        listener2.verify("after undo");

        var allChildrenAfter = model.allChildren.toArray();
        var allChildren = model.allChildren.toArray();
        strictEqual(allChildren.length, 2, "allChildren after undo");
        strictEqual(allChildren[0].name, "child1", "allChildren[0] after undo");
        strictEqual(allChildren[1].name, "child2", "allChildren[1] after undo");
        var actual = [];
        actual[0] = model.root;
        var children0 = actual[0].children.toArray();
        actual[1] = children0[0];
        actual[2] = children0[1];
        var children2 = actual[2].children.toArray();
        actual[3] = children2[0];
        actual[4] = children2[1];
        actual[5] = actual[1].sub;
        strictEqual(actual[0].name, "child0", "child0 after undo");
        ok(actual[0] instanceof TestEntityKey, "child0 is TestEntityKey after undo");
        strictEqual(actual[1].name, "child1", "child1 after undo");
        ok(actual[1] instanceof TestEntityKey, "child1 is TestEntityKey after undo");
        strictEqual(actual[2].name, "child2", "child2 after undo");
        ok(actual[2] instanceof TestEntityKey, "child2 is TestEntityKey after undo");
        strictEqual(actual[3].$getKeyAttributeValue(), 0, "child3 after undo");
        ok(actual[3] instanceof TestEntity, "child3 is TestEntity after undo");
        strictEqual(actual[4].$getKeyAttributeValue(), 1, "child4 after undo");
        ok(actual[4] instanceof TestEntity, "child4 is TestEntity after undo");
        strictEqual(actual[5].name, "child5", "child5 after undo");
        ok(actual[5] instanceof TestEntityKey, "child5 is TestEntityKey after undo");
        strictEqual(actual[5].next, actual[4], "next of child5 after undo");
        strictEqual(actual[4].next, actual[3], "next of child4 after undo");
        strictEqual(actual[3].next, actual[1], "next of child3 after undo");
        strictEqual(actual[1].next, actual[2], "next of child1 after undo");
        strictEqual(actual[2].next, actual[0], "next of child2 after undo");
        strictEqual(actual[0].next, actual[5], "next of child0 after undo");
        strictEqual(actual[1].publicAttr, "x", "publicAttr of child1 after undo");
        strictEqual(actual[1]._privateAttr, "y", "_privateAttr of child1 after undo");

        listener0 = new util.EventListener("child0 view events", actual[0]);
        listener2 = new util.EventListener("child2 view events", actual[2]);

        model.$getUndoManager().execute(delete3Cmd);

        modelListener.verifyChanged("after delete child3");
        listener0.verify("after delete child3");
        listener2.verifyChanged("after delete child3", TestEvents.TESTENTITY_DELETED, 0);

        strictEqual(actual[2].children.get(0), undefined, "child3 after delete child3");
        strictEqual(actual[3].$getModel(), null, "model of child3 after delete child3");
        strictEqual(actual[3].$getContainer(), null, "container of child3 after delete child3");
        strictEqual(actual[3].next, null, "next of child3 after delete child3");
        strictEqual(actual[4].next, null, "next of child4 after delete child3");

        model.$getUndoManager().undo();

        modelListener.verifyChanged("after undo delete child3");
        listener0.verify("after undo delete child3");
        listener2.verifyChanged("after undo delete child3", TestEvents.TESTENTITY_CREATED, 0);

        var actual3 = actual[2].children.get(0);
        ok(actual3 instanceof TestEntity, "child3 is TestEntity after undo delete child3");
        strictEqual(actual[2].children.toArray()[0], actual3, "child3 after undo delete child3");
        strictEqual(actual3.$getModel(), model, "model of child3 after undo delete child3");
        strictEqual(actual3.$getContainer(), actual[2], "container of child3 after undo delete child3");
        strictEqual(actual3.next, actual[1], "next of child3 after undo delete child3");
        strictEqual(actual[4].next, actual3, "next of child4 after undo delete child3");
    });

    test("events unsubscribeScope", function() {
        var model = new TestModel();
        var listener1 = new util.EventListener("model events listener1", model);
        model.$getEvents().subscribe(TestEvents.TESTENTITY_CREATED, listener1.listen, listener1);
        var listener2 = new util.EventListener("model events listener2", model);

        model.$getEvents().publish(TestEvents.TESTENTITY_CREATED, "test");

        listener1.verify("before unregister", [{
            "name": "test",
            "source": {
                "className": "TestModel"
            },
            "type": TestEvents.TESTENTITY_CREATED
        }, {
            "name": "test",
            "source": {
                "className": "TestModel"
            },
            "type": TestEvents.TESTENTITY_CREATED
        }]);
        listener2.verify("before unregister", {
            "name": "test",
            "source": {
                "className": "TestModel"
            },
            "type": TestEvents.TESTENTITY_CREATED
        });

        model.$getEvents().unsubscribeAllScope(listener1);
        model.$getEvents().publish(TestEvents.TESTENTITY_CREATED, "test");

        listener1.verify("after unregister");
        listener2.verify("after unregister", {
            "name": "test",
            "source": {
                "className": "TestModel"
            },
            "type": TestEvents.TESTENTITY_CREATED
        });
    });

});