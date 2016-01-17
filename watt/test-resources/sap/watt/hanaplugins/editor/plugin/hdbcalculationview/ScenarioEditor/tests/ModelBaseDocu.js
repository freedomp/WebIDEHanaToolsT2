/**
 * Require modules:
 * modelbase - base classes and utilities for model implementation
 * XmlReader, XmlWriter, XmlSerializer - helpers for XML serialization
 * common - helper classes for XML serialization
 */
define([
    'sap/hana/ide/editor/plugin/analytics/base/modelbase',
    'sap/hana/ide/editor/plugin/analytics/base/XmlReader',
    'sap/hana/ide/editor/plugin/analytics/base/XmlWriter',
    'sap/hana/ide/editor/plugin/analytics/base/XmlSerializer',
    'sap/hana/ide/editor/plugin/analytics/base/common',
], function(modelbase, XmlReader, XmlWriter, XmlSerializer, common) {
    "use strict";

    /** Define shortcuts for frequently use classes from modelbase and common. */
    var AbstractModel = modelbase.AbstractModel;
    var AbstractModelClass = modelbase.AbstractModelClass;
    var ModelCollection = modelbase.ModelCollection;
    var ModelException = modelbase.ModelException;
    var DeleteCommand = modelbase.DeleteCommand;
    var ReferenceManager = modelbase.ReferenceManager;
    var ObjectAlreadyExistsException = modelbase.ObjectAlreadyExistsException;
    var AttributeMissingException = modelbase.AttributeMissingException;
    var InvalidAttributeException = modelbase.InvalidAttributeException;
    var Util = common.Util;

    module("modelbase docu");
    test("docu model", function() {

        /*
         **************************************************************************
         * Model definition
         **************************************************************************
         */

        /**
         * @class
         * A model class defines the features of a certain type of entities.
         * Your model class extends from AbstractModelClass which provides for
         * common helper methods supporting XML serialisation, events, ...
         * and provides a common constructor. See the createChild method below for
         * a description of the parameters of the constructor.
         */
        var SampleEntity = AbstractModelClass.extend("SampleEntity", {

            /**
             * @method
             * The $features defines containments and references to other model
             * objects. Simple attributes do not have to be declared but can be added
             * dynamically, i.e. the $features descriptor is optional.
             */
            $features: {
                /**
                 * Defines the name ofthe key attribute by name.
                 * If specified, tt is mandatory to pass a value for this attribute
                 * to the constructor or to set it in the $init method.
                 * The attribute value is used as the default key in collections.
                 * The value has to be unique in a containment relationship.
                 */
                keyAttribute: "name",
                /** 
                 * Define attributes containing other model objects.
                 * The parameter [isMany] is optional and specifies the multiplicity.
                 */
                containments: {
                    "children": {
                        isMany: true
                    }
                },
                /** 
                 * Define attributes referencing other model objects.
                 * The second [isMany] is optional and specifies the multiplicity.
                 */
                references: {
                    "nextSibling": {}
                }
            },

            /**
             * @method
             * The $init method is called by the constructor of the model class.
             * It is an "abstract" method defined by AbstractModelClass and starts
             * with $ therefore.
             * At this point in time, attributes have already been initialized with
             * the values passed to the constructor.
             * In $init you can initialize optional attributes with default values.
             */
            $init: function() {
                if (typeof this.rank === "undefined") this.rank = 1;
            },

            /**
             * @method
             * It is good practice to expose a create method for each composition.
             * In simple cases, you can omit the create method but let clients call:
             *     var child = entity.children.add(new SampleEntity(attributes));
             * The signature shall start with the following two parameters to
             * resemble the signature of the constructor.
             * However, a create method may have further parameters.
             *
             * @param {object} [attributes] initial attributes (plain JS object)
             * @param {SkippedNodes} [skippedNodes] usually provided by the parser
             */
            createChild: function(attributes, skippedNodes) {

                /** Create a child instance by calling it constructor. */
                var child = new SampleEntity(attributes, skippedNodes);

                /** 
                 * Add the entity to the containment relationship.
                 * The value of the key attribute is used as a key.
                 * If the entity has no key attribute defined, a default
                 * key value (number) will be generated.
                 * By adding/seeting an entity to a containment relationship,
                 * the back references to container and model are automatically
                 * maintained.
                 */
                this.children.add(child);

                /**
                 * You may implement further checks/logic in the create method.
                 * In this example, a list of all children is maintaind at the model
                 * to allow for simple iteration over all child entities in
                 * the model. _allChildren is a collection of references which is
                 * defined in the $features descriptor of SampleModel.
                 * To avoid clashing key values, we force the collection to
                 * generate a default key by providing the parameter an passing null
                 * as key value.
                 */
                this.$getModel()._allChildren.add(null, child);

                return child;
            }

            /**
             * Further methods can be defined here.
             * Note!
             * Private methods or attributes, which that are not part of the
             * persisted model, start with an _ (underscore).
             */
        });

        /**
         * @class
         * A model is a runtime container of entities (instances of model classes)
         * that logically belong together.
         * The content of a model is typically persistet in a single document.
         * Your model extends AbstractModel which provides for undo manager,
         * usage index, ...
         */
        var SampleModel = AbstractModel.extend("SampleModel", {

            /**
             * @method
             * The $features descriptor for the model.
             */
            $features: {

                /** Here you typically define a "root" containment. */
                containments: {
                    "root": {}
                },

                /** 
                 * You may define further containments/references.
                 * Here, we are defining a "private" collection of references.
                 */
                references: {
                    "_allChildren": {
                        isMany: true
                    }
                }
            }

            /** Further methods can be defined here. */
        });


        /**
         * @class
         * A model classes can be derived from another model class by calling the
         * static extend method of the parent class.
         */
        var SampleEntityWithCategory = SampleEntity.extend("SampleEntityWithCategory", {

            /**
             * @method
             */
            $features: {
                /** 
                 * Define additional containments/references.
                 */
            },

            /**
             * @method
             */
            $init: function() {

                /** Call the $init method of the super class first. */
                SampleEntity.prototype.$init.call(this);

                /** 
                 * Then you can run additional checks.
                 * In this example, we just introduce an
                 * additional mandatory attribute named "category".
                 */
                if (!this.category)
                    throw new AttributeMissingException(this, "category");
            }

            /** Further methods can be defined of course as well. */
        });

        /*
         **************************************************************************
         * XML de-/serialization
         **************************************************************************
         */

        /** sample XML document */
        var xmlString =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<SampleModel:model' +
            ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            ' xmlns:SampleModel="http://www.sap.com/SampleModel.ecore"' +
            ' id="Root" rank="1">\n' +
            '    <skippedNode1 description="test"/>\n' +
            '    <entities>\n' +
            '        <entity id="Entity1" skippedAttr="value" rank="10">\n' +
            '            <entities>\n' +
            '                <entity id="Sub1" rank="2"/>\n' +
            '            </entities>\n' +
            '            <skippedNode2 description="test2"/>\n' +
            '        </entity>\n' +
            '        <entity id="Entity2" rank="1"/>\n' +
            '    </entities>\n' +
            '</SampleModel:model>';

        /**
         * Create an empty model and flag it for data loading which means that
         * no events are being sent until model.$finishLoading() is called.
         */
        var model = new SampleModel(true);

        /** 
         * Create an XmlReader that collects skipped nodes while walking through
         * the DOM. Skipped nodes are attributes, elements, text nodes which are
         * included in the XML but not part of the in-memory model.
         * Skipped nodes are attached to the model classes and included in the
         * DOM when the model is rendered back to XML using the XmlWriter.
         * This helps to ensure interoperability of tools even if the model evolves.
         */
        var reader = new XmlReader(xmlString);

        /** 
         * Initially, the reader is positioned at the document node,
         * i.e. we have to move down to the next level where we expect
         * the SampleModel:model element. We have to pass the XML namespace
         * of this node since it belongs to another namespace.
         */
        reader.moveDown().moveTo("model", "http://www.sap.com/SampleModel.ecore");

        /**
         * Start building-up the model by consuming the attributes of the current node.
         * Here we map the id attribute of the DOM to the name attribute of the model.
         * The rank attibute is mapped one to one. Util.createIntSelector helps to
         * parse the XML attribute value to create a JavaScript number type.
         * Unmapped attributes or elements are recorded by the reader while moving
         * through the DOM. Passing the skippedNodes property attaches all skipped
         * nodes recorded so far to the entity. The reader will open a new record of
         * skippedNodes upon the next move.
         */
        model.root = new SampleEntity(reader.buildAttributes({
            name: "{id}",
            rank: Util.createIntSelector("rank")
        }), reader.skippedNodes);

        function readChildren(parent, reader) {

            /** Try to move one level down where we look for the entities element. */
            if (reader.tryMoveDown()) {
                /**
                 * We use tryMoveToIntermediate instead of tryMoveTo, since the
                 * "entities" element is an intermediate node, which has no
                 * corresponding model class in our model.
                 * Attributes or child elements of the "entities" element are still
                 * being collected in the skippedNodes record that was already
                 * attached to parent.
                 */
                if (reader.tryMoveToIntermediate("entities")) {

                    /** Entities might be empty so we try to move down. */
                    if (reader.tryMoveDown()) {

                        /** Now we visit all entity elements. */
                        while (reader.tryMoveTo("entity")) {

                            /** Create a new instance for each element found. */
                            var child = parent.createChild(reader.buildAttributes({
                                name: "{id}",
                                rank: Util.createIntSelector("rank")
                            }), reader.skippedNodes);

                            /** Recursively read children. */
                            readChildren(child, reader);

                            /** Collect advance to the next element. */
                            reader.next();
                        }

                        /** No more entities left, we move-up one level again. */
                        reader.moveUp(); // up to "entities"
                    }
                }

                /** Mark the entities element as "consumed" and move-up. */
                reader.next().moveUp();
            }
        }

        /** Call a helper function to recursively walk down the entities hierarchy */
        readChildren(model.root, reader);

        /** Move-up to the document node. */
        reader.moveUp();

        /** Enable model events. */
        model.$finishLoading();

        /** Use XmlSerializer to create an XML DOM. */
        var writer = new XmlWriter();
        /**
         * Internet explorer does not ensure stable order of XML attributes when
         * parsing XML.
         * If you require a stable order, e.g. to support textual dif/merge,
         * you can specify the order of attributes.
         */
        writer.configure({
            attributesOrder: {
                "*": ["id"],
                "SampleModel:model": ["xmlns:xsi", "xmlns:SampleModel", "id"]
            }
        });


        /** Create the root DOM element by mapping attributes from the root entity. */
        var rootElement = writer.writeRootElement(model.root, "SampleModel:model", {
            name: "{id}",
            rank: "{rank}"
        });

        function renderChilren(parent, parentElement, parentElementName, writer) {

            if (parent.children.count() === 0) return;

            /** 
             * Create the intermediate "entities" element.
             * We need to pass the ancestor model entity where skipped nodes of the
             * "entities" element have been recorded.
             * Next parameter is the parent DOM element the new child element will be
             * added to.
             * Third parameter is the tag name of the ancestor model entity which is
             * as well required to lookup the skipped nodes.
             * Last but not least, the name of the intermediate element to be created.
             */
            var entitiesElement = writer.writeIntermediateElement(
                parent, parentElement, parentElementName, "entities");

            parent.children.foreach(function(entity) {
                /** Write an "entity" element for each child entity */
                var childElement = writer.writeElement(
                    entity, entitiesElement, "entity", {
                        name: "{id}",
                        rank: "{rank}"
                    });

                /** Call the helper function recursively */
                renderChilren(entity, childElement, "entity", writer);
            });
        }

        /** Call a helper function to recursively render the child entities */
        renderChilren(model.root, rootElement, "SampleModel:model", writer);
        writer.close();

        /** Render the entire DOM as string using the XmlSerializer. */
        var resultString = XmlSerializer.serializeToString(rootElement.parentNode);

        /*
         **************************************************************************
         * Working with the model
         **************************************************************************
         */

        /** Create the model */
        var model = new SampleModel();

        /** Create an entity and assign it to the "root" containment. */
        model.root = new SampleEntity({
            name: "Entity"
        });

        /** Create a child entity using the create function. */
        var entity1 = model.root.createChild({
            name: "Entity1"
        });

        /** Create another entity and initialize an optional attribute. */
        var entity2 = model.root.createChild({
            name: "Entity2",
            greeting: "Hello"
        });

        /** Set a reference to another entity. */
        entity1.nextSibling = entity2;

        /** Access attributes and read references. */
        entity1.rank = entity1.nextSibling.rank + 1;
        entity1.greeting = entity2.greeting;

        /** Iterate through collections. */
        model.root.children.foreach(function(entity) {
            if (typeof console !== "undefined") console.log(entity.toString());
        });

        /** Read from collections by key */
        var entityByKey = model.root.children.get("Entity1");

        /** Getting an array from a collection */
        var entityArray = model.root.children.toArray();

        /** 
         * Re-name an entity that is contained in a collection.
         * The same result can be achieved by entity1.$rename("Entity1_renamed")
         */
        model.root.children.rename("Entity1", "Entity1_renamed");

        /** Collections are ordered - you can elements. */
        model.root.children.moveDown("Entity1_renamed");

        /** Access the key of an element while iterating through a collection. */
        model._allChildren.foreach(function(entity, key) {
            if (typeof console !== "undefined") console.log("[" + key + "]" + entity.toString());
        });

        /** 
         * Index based access allows for sparse collection. This is helpful while
         * loading the model from an XML document where the order of elements is
         * defined by an attribute in the XML.
         * Note: the key of the entity added with setAt has to be unique within the
         * collection. If an entity already exists at the specified index, it will
         * be replaced. If you mix index based access (setAt) with other operations
         * (add, remove) the index of entities added via setAt might change as well.
         */
        model.root.children.setAt(42, new SampleEntity({
            name: "Entity42"
        }));
        var entity42 = model.root.children.getAt(42);
        /**
         * In this example, model.root.children now contains:
         *  [entity1, entity2, undefined Ã 40, entity42]
         * count(), and foreach() do not consider "holes" in the collection, whereas
         * size(), indexOf(), and toArray() will include them.
         */
        var count = model.root.children.count(); // is 3
        var size = model.root.children.size(); // is 43
        var index = model.root.children.indexOf("Entity42"); // is 42

        /** 
         * An entity gets delted by removing it from its containing collection or by
         * calling $remove on the entity. In both cases, the entity will be removed
         * for the containing feature an from the model. All references to that
         * entity will be removed as well.
         */
        var removedEntity = model.root.children.remove("Entity2");
        entity1.$remove();

        /** 
         * remove does not take care about removing contained objects and their
         * references. This can be achieved by using the DeleteCommand.
         * The DeleteCommand either takes the object to be deleted or a string
         * representing the key-path to the object.
         * A key-path looks like a JavaScript path expression along the containment
         * hierarchy.
         * Commands take effect only when passing them to the execute method of
         * the undo manager. To revert all changes performed by the command, the
         * undo method can be called.
         */
        var entity3 = model.root.createChild({
            name: "Entity3"
        });
        var entity4 = entity3.children.add(new SampleEntity({
            name: "Entity4"
        }));
        entity3.children.add(new SampleEntity({
            name: "Entity5"
        }));
        /** 
         * This removes root.children["Entity4"] as well as the reference to it from
         * _allChildren.
         */
        model.$getUndoManager().execute(new DeleteCommand(entity4));
        /** 
         * This will remove root.children["Entity3"], the reference to it from
         * _allChildren, as well is child entity
         * root.children["Entity3"].children["Entity5"].
         */
        model.$getUndoManager().execute(new DeleteCommand('root.children["Entity3"]'));
        entity3 = model.$getUndoManager().undo();

        /**
         * Using the ReferenceManager it is possible to obtain all references
         * to or from a given model object. This can be used by a tool to build a
         * where-used list before deleting an object.
         * The code below builds up a small tree with the following containments:
         *             model
         *             #  #
         *            /    \
         *      Entity6   Entitiy7--+
         *      #     #             |
         *     /       \            |
         * Entity9<--Entity8<-------+
         */
        var entity6 = model.root.createChild({
            name: "Entity6"
        });
        var entity7 = model.root.createChild({
            name: "Entity7"
        });
        var entity8 = entity6.children.add(new SampleEntity({
            name: "Entity8"
        }));
        var entity9 = entity6.children.add(new SampleEntity({
            name: "Entity9"
        }));
        model._allChildren.add(entity8);
        model._allChildren.add(entity9);
        entity7.nextSibling = entity8;
        entity8.nextSibling = entity9;

        /**
         * The ReferenceReference manager returns an object for each reference
         * to Entity6 (or one of its children Entity8, or Entity9).
         * References from the model, e.g. from model._allChildren will not be
         * included. The same is true for local references, e.g. the references
         * from Entity8 to Entity9.
         * So the only reference returned for this example is the reference from
         * Entity7 to Entity8. A reference includes up to three properties.
         * {
         *   feature: // the referencing feature, which can either be an instance of
         *     ModelCollection, or SingleValueContainer. Using getOwner() you can
         *     navigate to the model object the feature belongs to.
         *   [key]: // the key of the referenced object in case the referencing
         *     feature is a collection
         *   [object]: // the referenced object, in case the refernce points to child
         */
        var refs = ReferenceManager.getReferencesTo(entity6);
        /**
         * This will result in the following output on the console:
         *   Entity8(SampleEntity) of Entity6(SampleEntity) is still used in Entity7(SampleEntity)
         */
        for (var i = 0; i < refs.length; i++) {
            var referenced = refs[i].object ? refs[i].object.toString() + " of " : "";
            referenced += entity6.toString();
            var referencing = refs[i].feature.getOwner().toString();
            if (typeof console !== "undefined") console.log(referenced + " is still used in " + referencing);
        }

        var testSub1 = new SampleEntityWithCategory({
            name: "sub entity1",
            category: "test"
        });

        // very basic verification, just to ensure that the sample is not completely broken
        strictEqual(entity3.$getContainer().name, "Entity", "verify sample code");

        if (typeof console !== "undefined") console.log(xmlString);
        strictEqual(resultString, xmlString, "xml document");
    });

});