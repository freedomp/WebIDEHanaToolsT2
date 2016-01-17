define([
    'sap/hana/ide/editor/plugin/analytics/base/modelbase',
    'sap/hana/ide/editor/plugin/analytics/viewmodel/model',
    'sap/hana/ide/editor/plugin/analytics/viewmodel/commands',
    './Util'
], function(modelbase, viewmodel, commands, util) {
    "use strict";

    var ViewModelEvents = commands.ViewModelEvents;
    var EventListener = util.EventListener;

    function buildTypedObjectProps(name, type, length, scale) {
        var result = {
            objectAttributes: {
                name: name
            }
        };
        if (arguments.length > 1) {
            result.typeAttributes = {
                primitiveType: type
            };
        }
        if (arguments.length > 2) {
            result.typeAttributes.length = length;
        }
        if (arguments.length > 3) {
            result.typeAttributes.scale = scale;
        }
        return result;
    }

    function buildViewNodeProperties(name, type, xCoordinate, yCoordinate, width, height, expanded) {
        return {
            objectAttributes: {
                name: name,
                type: type
            },
            layoutAttributes: {
                xCoordinate: xCoordinate,
                yCoordinate: yCoordinate,
                width: width,
                height: height,
                expanded: expanded
            }
        };
    }

    function createColumnView(name, dataCategory) {
        var model = new viewmodel.ViewModel(true);
        var columnViewProperties = {
            name: name ? name : "test",
            dataCategory: dataCategory ? dataCategory : "DIMENSION"
        };
        var columnView = model.createColumnView(columnViewProperties);
        model.$finishLoading();
        return columnView;
    }

    function createViewNode(columnView) {
        var viewNodeProperties = buildViewNodeProperties("test", "Script", 100, 200, 80, 20, true);
        var createViewNodeCmd = new commands.CreateViewNodeCommand(viewNodeProperties, true);
        return columnView.$getModel().$getUndoManager().execute(createViewNodeCmd);
    }

    function verifyTypedObject(testName, object, expectedProperties) {
        strictEqual(object.name, expectedProperties.objectAttributes.name, testName + ", name");
        strictEqual(object.hasOwnProperty("name"), expectedProperties.hasOwnProperty("objectAttributes") && expectedProperties.objectAttributes.hasOwnProperty("name"), testName + ", has property name");
        strictEqual(object.inlineType.primitiveType, expectedProperties.typeAttributes.primitiveType, testName + ", type");
        strictEqual(object.inlineType.hasOwnProperty("primitiveType"), expectedProperties.hasOwnProperty("typeAttributes") && expectedProperties.typeAttributes.hasOwnProperty("primitiveType"), testName + ", has property primitiveType");
        strictEqual(object.inlineType.length, expectedProperties.typeAttributes.length, testName + ", length");
        strictEqual(object.inlineType.hasOwnProperty("length"), expectedProperties.hasOwnProperty("typeAttributes") && expectedProperties.typeAttributes.hasOwnProperty("length"), testName + ", has property length");
        strictEqual(object.inlineType.scale, expectedProperties.typeAttributes.scale, testName + ", scale");
        strictEqual(object.inlineType.hasOwnProperty("scale"), expectedProperties.hasOwnProperty("typeAttributes") && expectedProperties.typeAttributes.hasOwnProperty("scale"), testName + ", has property scale");
    }

    function verifyViewNode(testName, viewNode, viewNodeProperties) {
        strictEqual(viewNode.name, viewNodeProperties.objectAttributes.name, testName + ", name");
        strictEqual(viewNode.hasOwnProperty("name"), viewNodeProperties.hasOwnProperty("objectAttributes") && viewNodeProperties.objectAttributes.hasOwnProperty("name"), testName + ", has property name");
        strictEqual(viewNode.type, viewNodeProperties.objectAttributes.type, testName + ", type");
        strictEqual(viewNode.hasOwnProperty("type"), viewNodeProperties.hasOwnProperty("objectAttributes") && viewNodeProperties.objectAttributes.hasOwnProperty("type"), testName + ", has property type");
        strictEqual(viewNode.layout.xCoordinate, viewNodeProperties.layoutAttributes.xCoordinate, testName + ", layout x");
        strictEqual(viewNode.layout.hasOwnProperty("xCoordinate"), viewNodeProperties.hasOwnProperty("layoutAttributes") && viewNodeProperties.layoutAttributes.hasOwnProperty("xCoordinate"), testName + ", has property xCoordinate");
        strictEqual(viewNode.layout.yCoordinate, viewNodeProperties.layoutAttributes.yCoordinate, testName + ", layout y");
        strictEqual(viewNode.layout.hasOwnProperty("yCoordinate"), viewNodeProperties.hasOwnProperty("layoutAttributes") && viewNodeProperties.layoutAttributes.hasOwnProperty("yCoordinate"), testName + ", has property yCoordinate");
        strictEqual(viewNode.layout.width, viewNodeProperties.layoutAttributes.width, testName + ", layout width");
        strictEqual(viewNode.layout.hasOwnProperty("width"), viewNodeProperties.hasOwnProperty("layoutAttributes") && viewNodeProperties.layoutAttributes.hasOwnProperty("width"), testName + ", has property width");
        strictEqual(viewNode.layout.height, viewNodeProperties.layoutAttributes.height, testName + ", layout height");
        strictEqual(viewNode.layout.hasOwnProperty("height"), viewNodeProperties.hasOwnProperty("layoutAttributes") && viewNodeProperties.layoutAttributes.hasOwnProperty("height"), testName + ", has property height");
        strictEqual(viewNode.layout.expanded, viewNodeProperties.layoutAttributes.expanded, testName + ", layout expanded");
        strictEqual(viewNode.layout.hasOwnProperty("expanded"), viewNodeProperties.hasOwnProperty("layoutAttributes") && viewNodeProperties.layoutAttributes.hasOwnProperty("expanded"), testName + ", has property expanded");
    }

    module("viewmodel");

    test("ChangeColumnViewPropertiesCommand", function() {
        // setup
        var columnView = createColumnView();
        var columnView1Properties = {
            defaultSchema: "TEST",
            dataCategory: "CUBE",
            applyPrivilegeType: "ANALYTIC_PRIVILEGE"
        };
        var columnView1aProperties = {
            defaultSchema: "TEST2"
        };

        var command1 = new commands.ChangeColumnViewPropertiesCommand(columnView1Properties);
        var command1a = new commands.ChangeColumnViewPropertiesCommand(columnView1aProperties);
        var modelListener = new EventListener("model events", columnView.$getModel());
        var viewListener = new EventListener("column view events", columnView);

        // test 1
        columnView.$getModel().$getUndoManager().execute(command1);
        modelListener.verifyChanged("after execute 1");
        viewListener.verifyChanged("after execute 1", ViewModelEvents.COLUMNVIEW_CHANGED, columnView.name);
        strictEqual(columnView.defaultSchema, columnView1Properties.defaultSchema, "default schema after execute 1");
        strictEqual(columnView.dataCategory, columnView1Properties.dataCategory, "data category after execute 1");
        strictEqual(columnView.applyPrivilegeType, columnView1Properties.applyPrivilegeType, "apply privilege type after execute 1");

        // test 1a
        columnView.$getModel().$getUndoManager().execute(command1a);
        modelListener.verifyChanged("after execute 1a");
        viewListener.verifyChanged("after execute 1a", ViewModelEvents.COLUMNVIEW_CHANGED, columnView.name);
        strictEqual(columnView.defaultSchema, columnView1aProperties.defaultSchema, "default schema after execute 1");
        strictEqual(columnView.dataCategory, columnView1Properties.dataCategory, "data category after execute 1a");
        strictEqual(columnView.applyPrivilegeType, columnView1Properties.applyPrivilegeType, "apply privilege type after execute 1a");

        // test undo
        columnView.$getModel().$getUndoManager().undo();
        modelListener.verifyChanged("after undo");
        viewListener.verifyChanged("after undo", ViewModelEvents.COLUMNVIEW_CHANGED, columnView.name);
        strictEqual(columnView.defaultSchema, columnView1Properties.defaultSchema, "default schema after undo");
        strictEqual(columnView.dataCategory, columnView1Properties.dataCategory, "data category after undo");
        strictEqual(columnView.applyPrivilegeType, columnView1Properties.applyPrivilegeType, "apply privilege type after undo");
        
        // test 1b - comment
        var columnViewCommentProperties = { comment: { text: "My comment", mimetype: "text/plain"} };
        var commandComment = new commands.ChangeColumnViewPropertiesCommand(null, columnViewCommentProperties);
        
        columnView.$getModel().$getUndoManager().execute(commandComment);
        modelListener.verifyChanged("after execute 1b");
        viewListener.verifyChanged("after execute 1b", ViewModelEvents.COLUMNVIEW_CHANGED, columnView.name);
        strictEqual(columnView.endUserTexts.comment.text, columnViewCommentProperties.comment.text, "comment text after execute 1b");
        strictEqual(columnView.endUserTexts.comment.mimetype, columnViewCommentProperties.comment.mimetype, "comment mimetype after execute 1b");
        
        // test 1b - comment - undo
        columnView.$getModel().$getUndoManager().undo();
        modelListener.verifyChanged("after undo of execute 1b");
        viewListener.verifyChanged("after undo of execute 1b", ViewModelEvents.COLUMNVIEW_CHANGED, columnView.name);
        strictEqual(columnView.endUserTexts, null, "comment still existing after undo");
    });

    test("Add-/DeleteViewNodeCommand", function() {
        // setup
        var columnView = createColumnView();
        var viewNode1Properties = buildViewNodeProperties("Projection", "Projection", 100, 200, 80, 20, true);
        var viewNode2Properties = buildViewNodeProperties("Union", "Union", 250, 300, 80, 20, true);
        var create1Command = new commands.CreateViewNodeCommand(viewNode1Properties);
        var create2Command = new commands.CreateViewNodeCommand(viewNode2Properties);
        var modelListener = new EventListener("model events", columnView.$getModel());
        var viewListener = new EventListener("column view events", columnView);

        // test
        columnView.$getModel().$getUndoManager().execute(create1Command);
        modelListener.verifyChanged("after execute");
        viewListener.verifyChanged("after execute", ViewModelEvents.VIEWNODE_CREATED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after execute");
        verifyViewNode("view node after create", columnView.viewNodes.toArray()[0], viewNode1Properties);

        // test undo
        columnView.$getModel().$getUndoManager().undo();
        modelListener.verifyChanged("after undo");
        viewListener.verifyChanged("after undo", ViewModelEvents.VIEWNODE_DELETED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 0, "number of view nodes after undo");

        // test redo
        columnView.$getModel().$getUndoManager().redo();
        modelListener.verifyChanged("after redo");
        viewListener.verifyChanged("after redo", ViewModelEvents.VIEWNODE_CREATED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after redo");
        verifyViewNode("view node after redo", columnView.viewNodes.toArray()[0], viewNode1Properties);

        columnView.$getModel().$getUndoManager().execute(create2Command);
        modelListener.verifyChanged("after create 2");
        viewListener.verifyChanged("after create 2", ViewModelEvents.VIEWNODE_CREATED, viewNode2Properties.objectAttributes.name);

        // test delete
        var delete1Command = new modelbase.DeleteCommand(columnView.viewNodes.get(viewNode1Properties.objectAttributes.name));
        columnView.$getModel().$getUndoManager().execute(delete1Command);
        modelListener.verifyChanged("after delete");
        viewListener.verifyChanged("after delete", ViewModelEvents.VIEWNODE_DELETED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after delete");
        verifyViewNode("view node after delete", columnView.viewNodes.toArray()[0], viewNode2Properties);

        // test undo delete
        columnView.$getModel().$getUndoManager().undo();
        modelListener.verifyChanged("after undo delete");
        viewListener.verifyChanged("after undo delete", ViewModelEvents.VIEWNODE_CREATED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 2, "number of view nodes after undo delete");
        verifyViewNode("view node after undo delete", columnView.viewNodes.toArray()[0], viewNode1Properties);

        // test redo delete
        columnView.$getModel().$getUndoManager().redo();
        modelListener.verifyChanged("after redo delete");
        viewListener.verifyChanged("after redo delete", ViewModelEvents.VIEWNODE_DELETED, viewNode1Properties.objectAttributes.name);
        strictEqual(columnView.viewNodes.count(), 1, "number of view nodes after redo delete");
        verifyViewNode("view node afterredo  delete", columnView.viewNodes.toArray()[0], viewNode2Properties);
    });

    test("Add-/DeleteElementCommand", function() {
        // setup
        var columnView = createColumnView();
        var viewNode = createViewNode(columnView);

        var elements;
        var element1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var element2Properties = buildTypedObjectProps("test2", "NVARCHAR", 256);
        var element3Properties = buildTypedObjectProps("test2", "TEXT");

        var createElement1Cmd = new commands.AddElementCommand(viewNode.name, element1Properties);
        var createElement2Cmd = new commands.AddElementCommand(viewNode.name, element2Properties, element1Properties.objectAttributes.name);
        var createElement3Cmd = new commands.AddElementCommand(viewNode.name, element3Properties, element1Properties.objectAttributes.name);
        var deleteElement1Cmd = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode.name + '"].elements["' + element1Properties.objectAttributes.name + '"]');
        var viewNodeListener = new EventListener("view node events", viewNode);

        // test before
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 0, "initial number of elements");

        // test add 1
        columnView.$getModel().$getUndoManager().execute(createElement1Cmd);
        viewNodeListener.verifyChanged("after add 1", ViewModelEvents.ELEMENT_CREATED, element1Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 1, "number of elements after add 1");
        verifyTypedObject("first element after add 1", elements[0], element1Properties);

        // test add 2 before 1
        columnView.$getModel().$getUndoManager().execute(createElement2Cmd);
        viewNodeListener.verifyChanged("after add 2", ViewModelEvents.ELEMENT_CREATED, element2Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after add 2");
        verifyTypedObject("first element after add 2", elements[0], element2Properties);
        verifyTypedObject("second element after add 2", elements[1], element1Properties);

        // test add 3 - conflict with test2
        throws(function() {
            columnView.$getModel().$getUndoManager().execute(createElement3Cmd);
        }, modelbase.ObjectAlreadyExistsException, "add 3 - conflict");
        viewNodeListener.verify("after add 3", []);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after add 3");
        verifyTypedObject("first element after add 3", elements[0], element2Properties);
        verifyTypedObject("second element after add 3", elements[1], element1Properties);

        // test undo add 2
        columnView.$getModel().$getUndoManager().undo();
        viewNodeListener.verifyChanged("after undo add 2", ViewModelEvents.ELEMENT_DELETED, element2Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 1, "number of elements after undo add 2");
        verifyTypedObject("first element after undo add 2", elements[0], element1Properties);

        // test delete 1
        columnView.$getModel().$getUndoManager().execute(deleteElement1Cmd);
        viewNodeListener.verifyChanged("after delete 1", ViewModelEvents.ELEMENT_DELETED, element1Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 0, "number of elements after delete 1");

        // test undo delete 1
        columnView.$getModel().$getUndoManager().undo();
        viewNodeListener.verifyChanged("after undo delte 1", ViewModelEvents.ELEMENT_CREATED, element1Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 1, "number of elements after undo delete 1");
        verifyTypedObject("first element after undo delete 1", elements[0], element1Properties);
    });

    test("Add-/DeleteInputCommand", function() {
        // setup
        var columnView = createColumnView();
        var viewNodeProperties = buildViewNodeProperties("Test1", "Projection", 100, 200, 80, 20, true);
        var createViewNodeCmd = new commands.CreateViewNodeCommand(viewNodeProperties, true);
        var viewNode1 = columnView.$getModel().$getUndoManager().execute(createViewNodeCmd);
        viewNodeProperties = buildViewNodeProperties("Test2", "Projection", 100, 200, 80, 20, true);
        createViewNodeCmd = new commands.CreateViewNodeCommand(viewNodeProperties);
        var viewNode2 = columnView.$getModel().$getUndoManager().execute(createViewNodeCmd);
        var entity1Name = "entity1";
        var entity1SchemaName = "SCHEMA1";
        var searchAttributes = {
            name: entity1Name,
            schemaName: entity1SchemaName,
            type: "table"
        };

        var inputs;
        var source;

        var createInput1Cmd = new commands.CreateInputCommand(viewNode1.name, viewNode2.name);
        var createInput2Cmd = new commands.CreateInputCommand(viewNode1.name, entity1Name, searchAttributes);
        var viewNode1Listener = new EventListener("view node 1 events", viewNode1);

        // test before
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 0, "initial number of inputs node 1");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "initial number of inputs node 2");

        // test add 1
        var input1 = columnView.$getModel().$getUndoManager().execute(createInput1Cmd);
        var input1name = input1.$getKeyAttributeValue();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 1, "number of inputs node 1 after add 1");
        viewNode1Listener.verifyChanged("after add 1", ViewModelEvents.INPUT_CREATED, input1name);
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.ViewNode, true, "source is ViewNode after add 1");
        strictEqual(source.name, viewNode2.name, "source name after add 1");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after add 1");

        // test add 2
        var input2 = columnView.$getModel().$getUndoManager().execute(createInput2Cmd);
        var input2name = input2.$getKeyAttributeValue();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 2, "number of inputs node 1 after add 2");
        viewNode1Listener.verifyChanged("after add 2", ViewModelEvents.INPUT_CREATED, input2name);
        source = inputs[1].getSource();
        strictEqual(source instanceof viewmodel.Entity, true, "source is Entity after add 2");
        strictEqual(source.name, entity1Name, "source name after add 2");
        strictEqual(source.schemaName, entity1SchemaName, "source name after add 2");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after add 2");

        // test delete 1
        var deleteInput1Cmd = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode1.name + '"].inputs[' + input1name + ']');
        columnView.$getModel().$getUndoManager().execute(deleteInput1Cmd);
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 1, "number of inputs node 1 after delete 1");
        viewNode1Listener.verifyChanged("after delete 2", ViewModelEvents.INPUT_DELETED, input1name);
        strictEqual(inputs[0].$getKeyAttributeValue(), input2name, "input name after delete 1");
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.Entity, true, "source is Entity after delete 1");
        strictEqual(source.name, entity1Name, "source name after delete 1");
        strictEqual(source.schemaName, entity1SchemaName, "source name after delete 1");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after delete 1");

        // test delete 2
        var deleteInput2Cmd = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode1.name + '"].inputs[' + input2name + ']');
        columnView.$getModel().$getUndoManager().execute(deleteInput2Cmd);
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 1 after delete 2");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after delete 2");
        viewNode1Listener.verifyChanged("after delete 2", ViewModelEvents.INPUT_DELETED, input2name);

        //test undo delete 2
        columnView.$getModel().$getUndoManager().undo();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 1, "number of inputs node 1 after undo 1");
        viewNode1Listener.verifyChanged("after undo 1", ViewModelEvents.INPUT_CREATED, input2name);
        strictEqual(inputs[0].$getKeyAttributeValue(), input2name, "input name after undo 1");
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.Entity, true, "source is Entity after undo 1");
        strictEqual(source.name, entity1Name, "source name after undo 1");
        strictEqual(source.schemaName, entity1SchemaName, "source name after undo 1");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after undo 1");

        //test undo delete 1
        columnView.$getModel().$getUndoManager().undo();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 2, "number of inputs node 1 after undo 2");
        viewNode1Listener.verifyChanged("after undo 2", ViewModelEvents.INPUT_CREATED, input1name);
        strictEqual(inputs[0].$getKeyAttributeValue(), input1name, "input name after undo 2");
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.ViewNode, true, "source is Entity after undo 2");
        strictEqual(source.name, viewNode2.name, "source name after undo 2");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after undo 2");

        //test redo delete 1
        columnView.$getModel().$getUndoManager().redo();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 1, "number of inputs node 1 after redo delete");
        viewNode1Listener.verifyChanged("after redo delete", ViewModelEvents.INPUT_DELETED, input1name);
        strictEqual(inputs[0].$getKeyAttributeValue(), input2name, "input name after redo delete");
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.Entity, true, "source is Entity after redo delete");
        strictEqual(source.name, entity1Name, "source name after redo delete");
        strictEqual(source.schemaName, entity1SchemaName, "source name after redo delete");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after redo delete");

        // test undo delete 1, create 2, 1
        columnView.$getModel().$getUndoManager().undo();
        viewNode1Listener.verifyChanged("after after undo delete", ViewModelEvents.INPUT_CREATED, input1name);
        columnView.$getModel().$getUndoManager().undo();
        viewNode1Listener.verifyChanged("after after undo create", ViewModelEvents.INPUT_DELETED, input2name);
        columnView.$getModel().$getUndoManager().undo();
        viewNode1Listener.verifyChanged("after after undo create", ViewModelEvents.INPUT_DELETED, input1name);
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 1 after undo create");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after undo create");

        // test redo create 1
        columnView.$getModel().$getUndoManager().redo();
        inputs = viewNode1.inputs.toArray();
        strictEqual(inputs.length, 1, "number of inputs node 1 after redo create");
        viewNode1Listener.verifyChanged("after redo create", ViewModelEvents.INPUT_CREATED, input1name);
        strictEqual(inputs[0].$getKeyAttributeValue(), input1name, "input name after redo create");
        source = inputs[0].getSource();
        strictEqual(source instanceof viewmodel.ViewNode, true, "source is ViewNode after redo create");
        strictEqual(source.name, viewNode2.name, "source name after redo create");
        inputs = viewNode2.inputs.toArray();
        strictEqual(inputs.length, 0, "number of inputs node 2 after redo create");
    });

    test("ChangeElementPropertiesCommand", function() {
        // setup
        var columnView = createColumnView();
        var viewNode = createViewNode(columnView);

        var elements;
        var element1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var element1aProperties = buildTypedObjectProps("test1", "NVARCHAR", 256, undefined);
        var element1bProperties = buildTypedObjectProps("test3");
        var element1bExpectedProperties = buildTypedObjectProps("test3", "DECIMAL", 28, 6);
        var element2Properties = buildTypedObjectProps("test2", "ALPHANUM", 3);
        var element2aProperties = buildTypedObjectProps("test1");

        var createElement1Cmd = new commands.AddElementCommand(viewNode.name, element1Properties);
        var createElement2Cmd = new commands.AddElementCommand(viewNode.name, element2Properties);
        var changeElement1aCmd = new commands.ChangeElementPropertiesCommand(viewNode.name, element1Properties.objectAttributes.name, element1aProperties);
        var changeElement1bCmd = new commands.ChangeElementPropertiesCommand(viewNode.name, element1Properties.objectAttributes.name, element1bProperties);
        var changeElement2Cmd = new commands.ChangeElementPropertiesCommand(viewNode.name, element2Properties.objectAttributes.name, element2aProperties);

        columnView.$getModel().$getUndoManager().execute(createElement1Cmd);
        columnView.$getModel().$getUndoManager().execute(createElement2Cmd);
        var viewNodeListener = new EventListener("view node events", viewNode);
        // test change type
        columnView.$getModel().$getUndoManager().execute(changeElement1aCmd);
        viewNodeListener.verifyChanged("after first change", ViewModelEvents.ELEMENT_CHANGED, element1aProperties.objectAttributes.name, element1Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after first change");
        verifyTypedObject("after first change", elements[0], buildTypedObjectProps("test1", "NVARCHAR", 256));
        // test undo change type
        columnView.$getModel().$getUndoManager().undo();
        viewNodeListener.verifyChanged("after undo 1", ViewModelEvents.ELEMENT_CHANGED, element1Properties.objectAttributes.name, element1aProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after undo 1");
        verifyTypedObject("after undo 1", elements[0], element1Properties);
        // test rename
        columnView.$getModel().$getUndoManager().execute(changeElement1bCmd);
        viewNodeListener.verifyChanged("after second change", ViewModelEvents.ELEMENT_CHANGED, element1bProperties.objectAttributes.name, element1Properties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after second change");
        verifyTypedObject("after second change", elements[0], element1bExpectedProperties);
        // test undo rename
        columnView.$getModel().$getUndoManager().undo();
        viewNodeListener.verifyChanged("after undo 2", ViewModelEvents.ELEMENT_CHANGED, element1Properties.objectAttributes.name, element1bProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after undo 2");
        verifyTypedObject("after undo 2", elements[0], element1Properties);
        // test rename conflict
        throws(function() {
            columnView.$getModel().$getUndoManager().execute(changeElement2Cmd);
        }, modelbase.ObjectAlreadyExistsException, "rename conflict");
        viewNodeListener.verify("after rename conflict", []);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 2, "number of elements after rename conflict");
        verifyTypedObject("after rename conflict", elements[1], element2Properties);
    });

    test("CopyElementCommand", function() {
        // setup
        var columnView = createColumnView();
        var viewNode = createViewNode(columnView);

        var elements;
        var element1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var element1aProperties = buildTypedObjectProps("test1_COPY", "DECIMAL", 28, 6);
        var element1bProperties = buildTypedObjectProps("test1_COPY_1", "DECIMAL", 28, 6);
        var element1cProperties = buildTypedObjectProps("test1_COPY_2", "DECIMAL", 28, 6);
        var element1dProperties = buildTypedObjectProps("test1_COPY_3", "DECIMAL", 28, 6);
        var element2Properties = buildTypedObjectProps("test2", "TEXT");

        var createElement1Cmd = new commands.AddElementCommand(viewNode.name, element1Properties);
        var createElement2Cmd = new commands.AddElementCommand(viewNode.name, element2Properties);
        var copyElement1aCmd = new commands.CopyElementCommand(viewNode.name, element1Properties.objectAttributes.name);
        var copyElement1bCmd = new commands.CopyElementCommand(viewNode.name, element1Properties.objectAttributes.name);
        var copyElement1cCmd = new commands.CopyElementCommand(viewNode.name, element1aProperties.objectAttributes.name);
        var copyElement1dCmd = new commands.CopyElementCommand(viewNode.name, element1bProperties.objectAttributes.name);
        columnView.$getModel().$getUndoManager().execute(createElement1Cmd);
        columnView.$getModel().$getUndoManager().execute(createElement2Cmd);
        var viewNodeListener = new EventListener("view node events", viewNode);

        // test copy 1
        columnView.$getModel().$getUndoManager().execute(copyElement1aCmd);
        viewNodeListener.verifyChanged("after first copy", ViewModelEvents.ELEMENT_CREATED, element1aProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 3, "number of elements after first copy");
        verifyTypedObject("first element after first copy", elements[0], element1Properties);
        verifyTypedObject("second element after first copy", elements[1], element1aProperties);
        verifyTypedObject("third element after first copy", elements[2], element2Properties);

        // test copy 2
        columnView.$getModel().$getUndoManager().execute(copyElement1bCmd);
        viewNodeListener.verifyChanged("after second copy", ViewModelEvents.ELEMENT_CREATED, element1bProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 4, "number of elements after second copy");
        verifyTypedObject("first element after second copy", elements[0], element1Properties);
        verifyTypedObject("second element after second copy", elements[1], element1bProperties);
        verifyTypedObject("third element after second copy", elements[2], element1aProperties);
        verifyTypedObject("fourth element after second copy", elements[3], element2Properties);

        // test copy 3
        columnView.$getModel().$getUndoManager().execute(copyElement1cCmd);
        viewNodeListener.verifyChanged("after third copy", ViewModelEvents.ELEMENT_CREATED, element1cProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 5, "number of elements after third copy");
        verifyTypedObject("first element after third copy", elements[0], element1Properties);
        verifyTypedObject("second element after third copy", elements[1], element1bProperties);
        verifyTypedObject("third element after third copy", elements[2], element1aProperties);
        verifyTypedObject("fourth element after third copy", elements[3], element1cProperties);
        verifyTypedObject("fifth element after third copy", elements[4], element2Properties);

        // test copy 4
        columnView.$getModel().$getUndoManager().execute(copyElement1dCmd);
        viewNodeListener.verifyChanged("after fourth copy", ViewModelEvents.ELEMENT_CREATED, element1dProperties.objectAttributes.name);
        elements = columnView.getDefaultNode().elements.toArray();
        strictEqual(elements.length, 6, "number of elements after fourth copy");
        verifyTypedObject("first element after fourth copy", elements[0], element1Properties);
        verifyTypedObject("second element after fourth copy", elements[1], element1bProperties);
        verifyTypedObject("third element after fourth copy", elements[2], element1dProperties);
        verifyTypedObject("fourth element after fourth copy", elements[3], element1aProperties);
        verifyTypedObject("fifth element after fourth copy", elements[4], element1cProperties);
        verifyTypedObject("sixth element after fourth copy", elements[5], element2Properties);
    });

    test("Add-/DeleteParameterCommand", function() {
        // setup
        var columnView = createColumnView();

        var parameters;
        var parameter1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var parameter2Properties = buildTypedObjectProps("test2", "NVARCHAR", 256);
        var parameter3Properties = buildTypedObjectProps("test2", "TEXT");

        var createParameter1Cmd = new commands.AddParameterCommand(parameter1Properties);
        var createParameter2Cmd = new commands.AddParameterCommand(parameter2Properties, parameter1Properties.objectAttributes.name);
        var createParameter3Cmd = new commands.AddParameterCommand(parameter3Properties, parameter1Properties.objectAttributes.name);
        var deleteParameter1Cmd = new modelbase.DeleteCommand('columnView.parameters["' + parameter1Properties.objectAttributes.name + '"]');
        var columnViewListener = new EventListener("column view events", columnView);

        // test before
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 0, "initial number of parameters");

        // test add 1
        columnView.$getModel().$getUndoManager().execute(createParameter1Cmd);
        columnViewListener.verifyChanged("after add 1", ViewModelEvents.PARAMETER_CREATED, parameter1Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 1, "number of parameters after add 1");
        verifyTypedObject("first parameter after add 1", parameters[0], parameter1Properties);

        // test add 2 before 1
        columnView.$getModel().$getUndoManager().execute(createParameter2Cmd);
        columnViewListener.verifyChanged("after add 2", ViewModelEvents.PARAMETER_CREATED, parameter2Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after add 2");
        verifyTypedObject("first parameter after add 2", parameters[0], parameter2Properties);
        verifyTypedObject("second parameter after add 2", parameters[1], parameter1Properties);

        // test add 3 - conflict with test2
        throws(function() {
            columnView.$getModel().$getUndoManager().execute(createParameter3Cmd);
        }, modelbase.ObjectAlreadyExistsException, "add 3 - conflict");
        columnViewListener.verify("after add 3", []);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after add 3");
        verifyTypedObject("first parameter after add 3", parameters[0], parameter2Properties);
        verifyTypedObject("second parameter after add 3", parameters[1], parameter1Properties);

        // test undo add 2
        columnView.$getModel().$getUndoManager().undo();
        columnViewListener.verifyChanged("after undo add 2", ViewModelEvents.PARAMETER_DELETED, parameter2Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 1, "number of parameters after undo add 2");
        verifyTypedObject("first parameter after undo add 2", parameters[0], parameter1Properties);

        // test delete 1
        columnView.$getModel().$getUndoManager().execute(deleteParameter1Cmd);
        columnViewListener.verifyChanged("after delete 1", ViewModelEvents.PARAMETER_DELETED, parameter1Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 0, "number of parameters after delete 1");

        // test undo delete 1
        columnView.$getModel().$getUndoManager().undo();
        columnViewListener.verifyChanged("after undo delte 1", ViewModelEvents.PARAMETER_CREATED, parameter1Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 1, "number of parameters after undo delete 1");
        verifyTypedObject("first parameter after undo delete 1", parameters[0], parameter1Properties);
    });

    test("ChangeParameterPropertiesCommand", function() {
        // setup
        var columnView = createColumnView();

        var parameters;
        var parameter1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var parameter1aProperties = buildTypedObjectProps("test1", "NVARCHAR", 256, undefined);
        var parameter1bProperties = buildTypedObjectProps("test3");
        var parameter1bExpectedProperties = buildTypedObjectProps("test3", "DECIMAL", 28, 6);
        var parameter2Properties = buildTypedObjectProps("test2", "ALPHANUM", 3);
        var parameter2aProperties = buildTypedObjectProps("test1");

        var createParameter1Cmd = new commands.AddParameterCommand(parameter1Properties);
        var createParameter2Cmd = new commands.AddParameterCommand(parameter2Properties);
        var changeParameter1aCmd = new commands.ChangeParameterPropertiesCommand(parameter1Properties.objectAttributes.name, parameter1aProperties);
        var changeParameter1bCmd = new commands.ChangeParameterPropertiesCommand(parameter1Properties.objectAttributes.name, parameter1bProperties);
        var changeParameter2Cmd = new commands.ChangeParameterPropertiesCommand(parameter2Properties.objectAttributes.name, parameter2aProperties);

        columnView.$getModel().$getUndoManager().execute(createParameter1Cmd);
        columnView.$getModel().$getUndoManager().execute(createParameter2Cmd);
        var columnViewListener = new EventListener("view node events", columnView);
        // test change type
        columnView.$getModel().$getUndoManager().execute(changeParameter1aCmd);
        columnViewListener.verifyChanged("after first change", ViewModelEvents.PARAMETER_CHANGED, parameter1aProperties.objectAttributes.name, parameter1Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after first change");
        verifyTypedObject("after first change", parameters[0], buildTypedObjectProps("test1", "NVARCHAR", 256));
        // test undo change type
        columnView.$getModel().$getUndoManager().undo();
        columnViewListener.verifyChanged("after undo 1", ViewModelEvents.PARAMETER_CHANGED, parameter1Properties.objectAttributes.name, parameter1aProperties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after undo 1");
        verifyTypedObject("after undo 1", parameters[0], parameter1Properties);
        // test rename
        columnView.$getModel().$getUndoManager().execute(changeParameter1bCmd);
        columnViewListener.verifyChanged("after second change", ViewModelEvents.PARAMETER_CHANGED, parameter1bProperties.objectAttributes.name, parameter1Properties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after second change");
        verifyTypedObject("after second change", parameters[0], parameter1bExpectedProperties);
        // test undo rename
        columnView.$getModel().$getUndoManager().undo();
        columnViewListener.verifyChanged("after undo 2", ViewModelEvents.PARAMETER_CHANGED, parameter1Properties.objectAttributes.name, parameter1bProperties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after undo 2");
        verifyTypedObject("after undo 2", parameters[0], parameter1Properties);
        // test rename conflict
        throws(function() {
            columnView.$getModel().$getUndoManager().execute(changeParameter2Cmd);
        }, modelbase.ObjectAlreadyExistsException, "rename conflict");
        columnViewListener.verify("after rename conflict", []);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 2, "number of parameters after rename conflict");
        verifyTypedObject("after rename conflict", parameters[1], parameter2Properties);
    });

    test("CopyParameterCommand", function() {
        // setup
        var columnView = createColumnView();

        var parameters;
        var parameter1Properties = buildTypedObjectProps("test1", "DECIMAL", 28, 6);
        var parameter1aProperties = buildTypedObjectProps("test1_COPY", "DECIMAL", 28, 6);
        var parameter1bProperties = buildTypedObjectProps("test1_COPY_1", "DECIMAL", 28, 6);
        var parameter1cProperties = buildTypedObjectProps("test1_COPY_2", "DECIMAL", 28, 6);
        var parameter2Properties = buildTypedObjectProps("test2", "TEXT");

        var createParameter1Cmd = new commands.AddParameterCommand(parameter1Properties);
        var createParameter2Cmd = new commands.AddParameterCommand(parameter2Properties);
        var copyParameter1aCmd = new commands.CopyParameterCommand(parameter1Properties.objectAttributes.name);
        var copyParameter1bCmd = new commands.CopyParameterCommand(parameter1Properties.objectAttributes.name);
        var copyParameter1cCmd = new commands.CopyParameterCommand(parameter1aProperties.objectAttributes.name);
        columnView.$getModel().$getUndoManager().execute(createParameter1Cmd);
        columnView.$getModel().$getUndoManager().execute(createParameter2Cmd);
        var columnViewListener = new EventListener("view node events", columnView);

        // test copy 1
        columnView.$getModel().$getUndoManager().execute(copyParameter1aCmd);
        columnViewListener.verifyChanged("after first copy", ViewModelEvents.PARAMETER_CREATED, parameter1aProperties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 3, "number of parameters after first copy");
        verifyTypedObject("first parameter after first copy", parameters[0], parameter1Properties);
        verifyTypedObject("second parameter after first copy", parameters[1], parameter1aProperties);
        verifyTypedObject("third parameter after first copy", parameters[2], parameter2Properties);

        // test copy 2
        columnView.$getModel().$getUndoManager().execute(copyParameter1bCmd);
        columnViewListener.verifyChanged("after second copy", ViewModelEvents.PARAMETER_CREATED, parameter1bProperties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 4, "number of parameters after second copy");
        verifyTypedObject("first parameter after second copy", parameters[0], parameter1Properties);
        verifyTypedObject("second parameter after second copy", parameters[1], parameter1bProperties);
        verifyTypedObject("third parameter after second copy", parameters[2], parameter1aProperties);
        verifyTypedObject("fourth parameter after second copy", parameters[3], parameter2Properties);

        // test copy 3
        columnView.$getModel().$getUndoManager().execute(copyParameter1cCmd);
        columnViewListener.verifyChanged("after third copy", ViewModelEvents.PARAMETER_CREATED, parameter1cProperties.objectAttributes.name);
        parameters = columnView.parameters.toArray();
        strictEqual(parameters.length, 5, "number of parameters after third copy");
        verifyTypedObject("first parameter after third copy", parameters[0], parameter1Properties);
        verifyTypedObject("second parameter after third copy", parameters[1], parameter1bProperties);
        verifyTypedObject("third parameter after third copy", parameters[2], parameter1aProperties);
        verifyTypedObject("fourth parameter after third copy", parameters[3], parameter1cProperties);
        verifyTypedObject("fifth parameter after third copy", parameters[4], parameter2Properties);
    });

    module("EntityModel");

    test("CreateEntityModel", function() {
        var model = new viewmodel.ViewModel(true);
        var attribtues;
        var entity;

        // test creation of Entity wo package/schema name: should throw exception
        try {
            attribtues = {
                name: "CUSTOMER"
            };

            entity = model.createEntity(attribtues);
            ok(false, "no exception thrown for missing attribute");
        } catch (xception) {
            ok(xception, "exception thrown for missing attribute");
        }

        // test creation of Entity with package name
        attribtues = {
            name: "CUSTOMER",
            packageName: "test"
        };
        entity = model.createEntity(attribtues);
        strictEqual(entity.name, "CUSTOMER", "test1: entity created with correct name");
        strictEqual(entity.packageName, "test", "test1: entity created with correct package");
        strictEqual(entity.getFullyQualifiedName(), "test::CUSTOMER", "test1: returned correct Full Qualified Name");

        // test creation of Entity with schema name
        attribtues = {
            name: "CUSTOMER",
            schemaName: "schema"
        };
        entity = model.createEntity(attribtues);
        strictEqual(entity.name, "CUSTOMER", "test2: entity created with correct name");
        strictEqual(entity.schemaName, "schema", "test2: entity created with correct schema");
        strictEqual(entity.getFullyQualifiedName(), "\"schema\".CUSTOMER", "test2: returned correct Full Qualified Name");
    });

    test("AddDeleteElementsToEntity", function() {
        var model = new viewmodel.ViewModel(true);
        var attributes;
        var entity;
        attributes = {
            name: "CUSTOMER",
            packageName: "test"
        };
        entity = model.createEntity(attributes);

        // Add test
        entity.createElement({
            name: "CustomerID"
        });
        ok(entity.elements.count() === 1 && entity.elements.get("CustomerID"), "element created successfully in entity");

        // Add same element throws exception
        try {
            entity.createElement({
                name: "CustomerID",
                aggregationBehavior: "SUM"
            });
            ok(false, "exception not thrown on duplicate element addition");
        } catch (ex) {
            ok(true, "exception thrown on duplicate element addition");
        }

        // Merge test
        entity.createOrMergeElement({
            name: "CustomerID",
            aggregationBehavior: "SUM"
        });
        ok(entity.elements.count() === 1 && entity.elements.get("CustomerID").aggregationBehavior === "SUM", "merge element in entity works fine");

        // Counter Test
        // Create Product element
        var elemProduct = entity.createElement({
            name: "ProductID"
        });

        //Define product counter for the Customer element
        var exceptionAggregationStep = entity.elements.get("CustomerID").createExceptionAggregationStep({
            "exceptionAggregationBehavior": viewmodel.ExceptionAggregationBehavior.COUNT_DISTINCT
        });
        exceptionAggregationStep.referenceElements.add(elemProduct);

        var elemCheck = entity.elements.get("CustomerID");
        ok(elemCheck.exceptionAggregationStep.exceptionAggregationBehavior === "countDistinct" &&
            elemCheck.exceptionAggregationStep.referenceElements.count() === 1, "Counter defined on element successfully");

    });
});