/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(function() {
    "use strict";

    var extend = function(baseClass, baseConstructorName, defineFeatures, className, properties) {
        if (typeof baseClass !== "function") {
            throw "assert. no baseClass provided";
        }
        if (typeof className !== "string") {
            throw "assert: no className provided";
        }
        if (typeof baseConstructorName !== "string") {
            throw "assert: no baseConstructorName provided";
        }
        if (!className.match(/^[a-zA-z_]+[a-zA-z0-9_]*$/)) {
            throw "assert: invalid className";
        }

        var clone = function(object) {
            var OneShotConstructor = function() {};

            OneShotConstructor.prototype = object;
            return new OneShotConstructor();
        };

        var proto = clone(baseClass.prototype);
        var features = {};
        for (var prop in properties) {
            if (!properties.hasOwnProperty(prop)) continue;
            if (prop === "$features") {
                features = properties[prop];
            } else {
                proto[prop] = properties[prop];
            }
        }
        if (features.keyAttribute) {
            if (!proto.$$supportsKeyAttribute) throw "assert: keyAttribute feature not supported by " + baseClass;
            if (proto.$$keyAttributeName) throw "assert: keyAttribute already defined for " + proto;
            var name = features.keyAttribute;
            if (typeof name !== "string" || name.length === 0) throw "assert: invalid key attribute name";
            proto.$$keyAttributeName = name;
            delete features.keyAttribute;
        }
        proto.$$className = className;
        var cls;
        cls = function() {
            if (defineFeatures) {
                defineFeatures(this, features);
            }
            baseClass.apply(this, arguments);
        };
        // would result in nice class names in the debugger but does not work on firefox
        //eval(" cls = function " + className + "() { " + baseConstructorName + ".apply(this, arguments); };");
        cls.prototype = proto;
        cls.prototype.constructor = cls;
        cls.extend = extend.bind(null, cls, baseConstructorName, defineFeatures);
        return cls;
    };

    var defineFeature = function(owner, name, isMany, isContainment) {
        if (!(owner instanceof AbstractModelClass) && !(owner instanceof AbstractModel)) {
            throw "assert: no feature owner provided";
        }
        if (typeof name !== "string" || name.length === 0 || name.charAt(0) === "$") {
            throw "assert: invalid feature name: " + name;
        }
        if (owner.hasOwnProperty(name)) {
            throw "assert: property " + name + " is already defined for " + owner.toString();
        }

        // do not keep a reference to the newly created feature in this function sice this
        // might cause a memory leak
        if (isMany) {
            owner.$$features[name] = new ModelCollection(owner, name, isContainment);
            owner[name] = owner.$$features[name];
        } else {
            owner.$$features[name] = new SingleValueContainer(owner, name, isContainment);
            Object.defineProperty(owner, name, {
                set: function(newValue) {
                    this.$$features[name].set(newValue);
                },
                get: function() {
                    var feature = this.$$features[name];
                    return feature ? feature.get() : null;
                }
            });
        }
    };

    var defineFeatures = function(owner, features) {
        var name, isMany;

        // features are defined on instance level as it contains the actual value holders
        // like collections
        if (!owner.$$features) {
            owner.$$features = {};
        }

        for (var kind in features) {
            if (!features.hasOwnProperty(kind)) continue;
            if (kind === "containments") {
                var containments = features[kind];
                for (name in containments) {
                    if (!containments.hasOwnProperty(name)) continue;
                    var containment = containments[name];
                    isMany = containment ? containment.isMany : false;
                    defineFeature(owner, name, isMany, true);
                }
            } else if (kind === "references") {
                var references = features[kind];
                for (name in references) {
                    if (!references.hasOwnProperty(name)) continue;
                    var reference = references[name];
                    isMany = reference ? reference.isMany : false;
                    defineFeature(owner, name, isMany, false);
                }
            } else {
                throw "assert: feature " + kind + " not supported by " + owner;
            }
        }
    };

    /**
     * @exception
     */
    var ModelException = function(message, objects) {
        this.name = 'ModelException';
        if (!message) message = "no detailed message";
        this.objects = objects ? Array.isArray(objects) ? objects : [objects] : [];
        var that = this;
        this.message = message.replace(/{(\d+)}/g, function(match) {
            var index = parseInt(match.substr(1, match.length - 2), 10);
            return index < that.objects.length && that.objects[index] ? that.objects[index].toString() : that.objects[index];
        });
    };
    ModelException.prototype = new Error();
    ModelException.prototype.constructor = ModelException;

    /**
     * @exception
     */
    var ObjectAlreadyExistsException = function(object, key, containingFeature) {
        ModelException.call(this, "{0} with key {1} already exists in {2}", [object, key, containingFeature]);
        this.name = 'ObjectAlreadyExistsException';
    };
    ObjectAlreadyExistsException.prototype = new ModelException();
    ObjectAlreadyExistsException.prototype.constructor = ObjectAlreadyExistsException;

    /**
     * @exception
     */
    var TransformationException = function(message, objects) {
        ModelException.call(this, message, objects);
        this.name = 'TransformationException';
        // this.feature = feature;
    };
    TransformationException.prototype = new ModelException();
    TransformationException.prototype.constructor = TransformationException;

    /**
     * @exception
     */
    var UnsupportedOperationException = function(feature) {
        ModelException.call(this, "Unsupported Operation Exists : {0}", [feature]);
        this.name = 'UnsupportedOperationException';
        // this.feature = feature;
    };
    UnsupportedOperationException.prototype = new ModelException();
    UnsupportedOperationException.prototype.constructor = UnsupportedOperationException;
    
    /**
     * @exception
     */
    var InvalidInputException = function(feature) {
        ModelException.call(this, "Invalid Input : {0}", [feature]);
        this.name = 'InvalidInputException';
        // this.feature = feature;
    };
    InvalidInputException.prototype = new ModelException();
    InvalidInputException.prototype.constructor = InvalidInputException;

    /**
     * @exception
     */
    var AttributeMissingException = function(object, attributeName) {
        ModelException.call(this, "attribute {1} missing from {0}", [object, attributeName]);
        this.name = 'AttributeMissingException';
    };
    AttributeMissingException.prototype = new ModelException();
    AttributeMissingException.prototype.constructor = AttributeMissingException;

    /**
     * @exception
     */
    var InvalidAttributeException = function(object, attributeName, attributeValue) {
        ModelException.call(this, "invalid attribute value {2} for attribute {1} of {0}", [object, attributeName, attributeValue]);
        this.name = 'InvalidAttributeException';
    };
    InvalidAttributeException.prototype = new ModelException();
    InvalidAttributeException.prototype.constructor = InvalidAttributeException;

    /**
     * @class
     */
    var ModelEvents = function(source) {
        if (!(source instanceof AbstractModelClass) && !(source instanceof AbstractModel)) {
            throw "assert: no event source provided";
        }
        this._source = source;
        this._registry = {};
    };
    ModelEvents.ALL = "all";
    ModelEvents.CHANGED = "changed";
    ModelEvents.registerEventTypes = function(constr, eventTypes) {
        constr.prototype.$$eventTypes = eventTypes;
    };
    ModelEvents.prototype = {
        _getSubscribers: function(event) {
            var subscribers = this._registry[event];
            if (!subscribers) {
                subscribers = [];
                if (this._source) {
                    // fill registry only if not disposed
                    this._registry[event] = subscribers;
                }
            }
            return subscribers;
        },

        subscribe: function(type, callback, thisArg) {
            this._getSubscribers(type).push({
                callback: callback,
                thisArg: thisArg
            });
        },

        unsubscribe: function(type, callback, thisArg) {
            var subscribers = this._getSubscribers(type);
            var index = -1;
            for (var i = 0; i < subscribers.length; i++) {
                if (subscribers[i].callback === callback && subscribers[i].thisArg === thisArg) {
                    index = i;
                }
            }
            if (index < 0) return;
            subscribers.splice(index, 1);
        },

        unsubscribeAllScope: function(thisArg) {
            for (var type in this._registry) {
                if (!this._registry.hasOwnProperty(type)) continue;
                var subscribers = this._registry[type];
                for (var i = subscribers.length - 1; i >= 0; i--) {
                    if (subscribers[i].thisArg === thisArg) {
                        subscribers.splice(i, 1);
                    }
                }
            }
        },

        publish: function(type, name, originalName) {
            if (this._source && !this._source.$getModel().$isLoading()) {
                var subscribers = this._getSubscribers(type).concat(this._getSubscribers(ModelEvents.ALL));
                var newEvent = {
                    type: type,
                    source: this._source
                };
                if (typeof name !== "undefined") {
                    newEvent.name = name;
                }
                if (typeof originalName !== "undefined") {
                    newEvent.originalName = originalName;
                }
                for (var i = 0; i < subscribers.length; i++) {
                    var subscriber = subscribers[i];
                    if (subscriber.callback) {
                        if (subscriber.thisArg) {
                            subscriber.callback.call(subscriber.thisArg, newEvent);
                        } else {
                            subscriber.callback(newEvent);
                        }
                    }
                }
            }
        },

        _dispose: function() {
            this._source = null;
            this._registry = [];
        }

    };

    /**
     * @class
     */
    var ModelFeature = function(owner, name, isContainment) {
        if (!(owner instanceof AbstractModelClass) && !(owner instanceof AbstractModel)) {
            throw "assert: no collection owner provided";
        }
        if (typeof name !== "string" || name.length === 0) {
            throw "assert: no feature name provided";
        }
        this._owner = owner;
        this._name = name;
        this._isContainment = isContainment;

        if (typeof this._init === "function") this._init.apply(this, arguments);
    };
    ModelFeature.prototype = {

        isMany: function() {
            return false;
        },

        isContainment: function() {
            return this._isContainment ? true : false;
        },

        getOwner: function() {
            return this._owner;
        },

        getName: function() {
            return this._name;
        },

        getKeyPath: function() {
            var ownerPath = this._owner.$getKeyPath();
            return ownerPath ? ownerPath + '.' + this._name : this._name;
        },

        toString: function() {
            return this._owner.toString() + '.' + this._name;
        }
    };
    ModelFeature.extend = extend.bind(null, ModelFeature, "ModelFeature", null);

    /**
     * @class
     */
    var SingleValueContainer = ModelFeature.extend("SingleValueContainer", {

        set: function(value) {
            if (this.isContainment()) {
                var emptyValue = typeof value === "undefined" || value === null;
                if (!emptyValue && !(value instanceof AbstractModelClass)) {
                    throw "assert: instance of AbstractModelClass expected";
                }
                if (this._value instanceof AbstractModelClass) {
                    this._value.$$setContainingFeature(null);
                }
                if (!emptyValue) {
                    value.$$setContainingFeature(this);
                }
            } else {
                if (this._value instanceof AbstractModelClass) {
                    ReferenceManager._removeUsage(this._value, this);
                }
                if (value instanceof AbstractModelClass) {
                    ReferenceManager._addUsage(value, this);
                }
            }

            this._value = value;
        },

        get: function() {
            return this._value;
        },

        _dispose: function() {
            if (this.isContainment() && this._value instanceof AbstractModelClass) {
                this._value.$$dispose();
            }
            this._owner = null;
            this._value = null;
        }
    });

    var IndexKey = function(value) {
        this.value = value;
    };

    /**
     * @class
     */
    var ModelCollection = ModelFeature.extend("ModelCollection", {

        _init: function() {
            // ensure stable order
            this._keys = [];
            this._values = {};
        },

        isMany: function() {
            return true;
        },

        foreach: function(func) {
            var context = {
                _stopped: false,
                stop: function() {
                    this.stopped = true;
                }
            };
            for (var i = 0; i < this._keys.length; i++) {
                var key = this._keys[i];
                if (typeof key !== "undefined") {
                    func(this._values[key], key, context);
                    if (context._stopped) break;
                }
            }
        },

        toArray: function() {
            var result = new Array(this._keys.length);
            for (var i = this._keys.length; i > 0;) {
                i--;
                var key = this._keys[i];
                if (typeof key === "undefined") {
                    result[i] === undefined;
                } else {
                    result[i] = this._values[key];
                }
            }
            return result;
        },

        /**
         * @param index
         * @param value an instance of AbstractModelClass or undefined to remove
         * an existing value.
         */
        setAt: function(index, value) {
            if (typeof index !== "number" || index < 0) {
                throw "assert: index must be a number";
            }
            if (typeof value === "undefined") {
                var key = this._keys[index];
                if (typeof key !== "undefined") {
                    this.remove(key, true);
                }
                return;
            }
            if (!(value instanceof AbstractModelClass)) {
                throw "assert: value must be an instance of AbstractModelClass";
            }
            return this.add(new IndexKey(index), value);
        },

        /**
         * @param index
         */
        getAt: function(index) {
            if (typeof index !== "number") {
                throw "assert: index must be a number";
            }
            if (index < 0 || index > this._keys.length - 1) {
                return undefined;
            }
            var key = this._keys[index];
            if (typeof key === "undefined") {
                return undefined;
            }
            return this._values[key];
        },

        /**
         * @param key
         */
        indexOf: function(key) {
            if (typeof key === "undefined") return -1;
            return this._keys.indexOf(key);
        },

        /**
         * @param [key] optional in case value is a instanceof AbstractModelClass
         * @param value
         * @param [nextKey] key of an existing element in the collection before which the value is add
         */
        add: function() {
            var key, value, nextKey, index;
            var determineKey = false;
            if (arguments.length === 1 && arguments[0] instanceof AbstractModelClass) {
                value = arguments[0];
                determineKey = true;
            } else if (arguments.length === 2) {
                if (arguments[0] instanceof AbstractModelClass) {
                    value = arguments[0];
                    nextKey = arguments[1];
                    determineKey = true;
                } else {
                    key = arguments[0];
                    value = arguments[1];
                }
            } else if (arguments.length === 3) {
                key = arguments[0];
                value = arguments[1];
                nextKey = arguments[2];
            } else {
                throw "assert: invalid number of arguments";
            }

            if (key instanceof IndexKey) {
                index = key.value;
                determineKey = true;
            }

            if (determineKey) {
                // determine key 
                key = value.$hasKeyAttribute() ? value.$getKeyAttributeValue() : this.getUniqueKey();
            } else if (typeof key === "undefined" || key === null) {
                key = this.getUniqueKey();
            }

            var oldValue = this.get(key);
            if (oldValue) {
                throw new ObjectAlreadyExistsException(oldValue, key, this);
            }

            if (this.isContainment()) {
                if (!(value instanceof AbstractModelClass)) {
                    throw "assert: instance of AbstractModelClass expected";
                }
                if (value.$hasKeyAttribute()) {
                    // key value has been specified explicitely but differs from the objects key attribute
                    // this is not allowed in case of a containment
                    if (key !== value.$getKeyAttributeValue()) {
                        throw "assert: explicitly specified key value " + key + " and key attribute value of " + value.toString() + " must match in case of a containment";
                    }
                } else {
                    // remember default key value
                    value.$$defaultKeyValue = key;
                }
                // link containment
                value.$$setContainingFeature(this);
            }

            if (typeof nextKey !== "undefined") {
                this._addBefore(key, value, nextKey);
            } else {
                if (index >= 0) {
                    var oldKey = this._keys[index];
                    this.remove(oldKey, true);
                    this._keys[index] = key;
                } else {
                    this._keys.push(key);
                }
                this._values[key] = value;
            }

            if (!this.isContainment() && value instanceof AbstractModelClass) {
                ReferenceManager._addUsage(value, this, key);
            }

            // return the value to allow for short expressions like:
            // var entity = container.coll.add(new Entity());
            return value;
        },

        rename: function(oldKey, newKey) {
            var oldValue = this.get(newKey);
            if (oldValue) {
                throw new ObjectAlreadyExistsException(oldValue, newKey, this);
            }

            var nextKey = this.getNextKey(oldKey);
            var value = this.get(oldKey);
            this._remove(oldKey);
            if (value instanceof AbstractModelClass) {
                if (this.isContainment()) {
                    value.$rename(newKey, true);
                } else {
                    ReferenceManager._renameReference(value, this, oldKey, newKey);
                }
            }

            this._addBefore(newKey, value, nextKey);
        },

        _addBefore: function(key, value, nextKey) {
            if (this._values.hasOwnProperty(nextKey)) {
                var index = this.indexOf(nextKey);
                if (index < 0) {
                    throw "assert: keys index inconsistent '" + nextKey + "' not found in collection";
                }
                this._keys.splice(index, 0, key);
            } else {
                this._keys.push(key);
            }
            this._values[key] = value;
        },

        moveUp: function(key) {
            if (this._values.hasOwnProperty(key)) {
                var index = this.indexOf(key);
                if (index < 0) {
                    throw "assert: keys index inconsistent '" + key + "' not found in collection";
                }
                var predecessorIndex = this.indexOf(this.getPreviousKey(key));
                if (index > 0 && predecessorIndex >= 0) {
                    var value = this._values[key];
                    this._keys.splice(index, 1);
                    this._keys.splice(predecessorIndex, 0, key);
                }
            }
        },

        moveDown: function(key) {
            if (this._values.hasOwnProperty(key)) {
                var index = this.indexOf(key);
                if (index < 0) {
                    throw "assert: keys index inconsistent '" + key + "' not found in collection";
                }
                var successorIndex = this.indexOf(this.getNextKey(key));
                if (index < this._keys.length - 1 && successorIndex > 0) {
                    var value = this._values[key];
                    this._keys.splice(index, 1);
                    this._keys.splice(successorIndex, 0, key);
                }
            }
        },

        get: function(key) {
            return this._values[key];
        },

        getNextKey: function(key) {
            var index = this.indexOf(key);
            while (index >= 0 && index < this._keys.length - 1) {
                var nextKey = this._keys[++index];
                if (typeof nextKey !== "undefined") {
                    return nextKey;
                }
            }
            return;
        },

        getPreviousKey: function(key) {
            var index = this.indexOf(key);
            while (index > 0) {
                var previousKey = this._keys[--index];
                if (typeof previousKey !== "undefined") {
                    return previousKey;
                }
            }
            return;
        },

        _remove: function(key, noSplice) {
            if (this._values.hasOwnProperty(key)) {
                var oldIndex = this.indexOf(key);
                if (noSplice) {
                    this._keys[oldIndex] = undefined;
                } else {
                    this._keys.splice(oldIndex, 1);
                }
                delete this._values[key];
            }
        },

        remove: function(key, noSplice, deep) {
            var oldValue = this.get(key);
            if (oldValue instanceof AbstractModelClass && this.isContainment()) {
                oldValue.$$remove(noSplice, deep);
            } else {
                if (oldValue instanceof AbstractModelClass) {
                    ReferenceManager._removeUsage(oldValue, this, key);
                }
                this._remove(key, noSplice);
            }
            return oldValue;
        },

        /**
         * returns the number of values in the collection
         */
        count: function() {
            // do not rely on the length of _keys since this might be a sparse
            // collection in case values have been provided by using the set()
            // method
            return Object.keys(this._values).length;
        },

        /**
         * returns the size of the collection (max index + 1). In case values
         * have been added by setAt() size might be
         * larger than the value returned by count.
         */
        size: function() {
            return this._keys.length;
        },

        clear: function() {
            if (this.isContainment()) {
                var that = this;
                this.foreach(function(element, key) {
                    that.remove(key, true, true);
                });
            } else {
                ReferenceManager.removeReferences(this);
            }
            this._values = {};
            this._keys = [];
        },

        getUniqueKey: function(elementName, suffix) {
            var max = -1;
            if (arguments.length === 0) {
                this.foreach(function(modelObject, key) {
                    if (typeof key === "number") {
                        max = Math.max(max, key);
                    }
                });
                return max + 1;
            } else {
                var originalName;
                if (suffix) {
                    var removeSuffixPattern = new RegExp("(" + suffix + "(_\\d+)?)?$");
                    originalName = elementName.replace(removeSuffixPattern, "");
                } else {
                    originalName = elementName;
                }

                var newName = suffix ? originalName + suffix : originalName;
                var reg = new RegExp("^" + newName + "(?:_(\\d+))?$");
                var match, alreadyUsed = false;
                this.foreach(function(modelObject, key) {
                    match = reg.exec(key);
                    if (match) {
                        if (match[1]) {
                            max = Math.max(max, parseInt(match[1], 10));
                        } else {
                            max = Math.max(max, 0);
                        }
                    }
                });
                return max < 0 ? newName : newName + "_" + (max + 1);
            }
        },

        _dispose: function() {
            if (this.isContainment()) {
                this.foreach(function(modelObject) {
                    if (modelObject instanceof AbstractModelClass) {
                        modelObject.$$dispose();
                    }
                });
            }
            this._owner = null;
            this.clear();
        }
    });

    /**
     * @class
     */
    var UndoManager = function(model) {
        if (!(model instanceof AbstractModel)) {
            throw "assert: no model provided";
        }
        this._model = model;
        this.reset();
    };
    UndoManager.prototype = {

        _isExecutingCompoundCommand: function() {
            return this._compoundCommandEvents !== null;
        },

        getLastCommand: function() {
            var numberOfCommands = this._undoStack.length;
            if (numberOfCommands > 0) {
                return this._undoStack[numberOfCommands - 1];
            }
        },

        reset: function() {
            this._undoStack = [];
            this._redoStack = [];
            this._dirtyCounter = 0;
            this._compoundCommandEvents = null;
        },

        hasUndo: function() {
            return this._undoStack.length > 0;
        },

        hasRedo: function() {
            return this._redoStack.length > 0;
        },

        undo: function(command) {
            if (typeof command === "undefined") {
                command = this._undoStack.pop();
            }
            if (typeof command !== "undefined") {
                var pushToStack = false;
                if (!this._isExecutingCompoundCommand()) {
                    pushToStack = true;
                }
                var result = this._invoke(command.undo, command);
                if (pushToStack) {
                    this._redoStack.push(command);
                }
                return result;
            }
        },

        redo: function(command) {
            return this._execute(command, true);
        },

        _execute: function(command, isRedo) {
            if (typeof command === "undefined") {
                command = this._redoStack.pop();
            }
            if (typeof command !== "undefined") {
                var hasUndo = typeof command.undo === "function";
                var pushToStack = false;
                if (hasUndo && !this._isExecutingCompoundCommand()) {
                    pushToStack = true;
                }
                var result = this._invoke(command.execute, command, isRedo);
                if (pushToStack) {
                    this._undoStack.push(command);
                }
                return result;
            }
        },

        execute: function(command) {
            if (typeof command !== "undefined") {
                var result = this._execute(command);
                this._redoStack = [];

                if (this._dirtyCounter < 0) {
                    this._dirtyCounter = NaN;
                }
                this._dirtyCounter++;

                return result;
            }
        },

        markClean: function() {
            this._dirtyCounter = 0;
        },

        isClean: function() {
            return this._dirtyCounter === 0;
        },

        _invoke: function(func, command, isRedo) {
            var i, source;
            var events = [];
            var isCompoundCommand = false;

            if (!this._isExecutingCompoundCommand()) {
                if (command instanceof CompoundCommand) {
                    isCompoundCommand = true;
                    this._compoundCommandEvents = events;
                }
            } else {
                events = this._compoundCommandEvents;
            }

            try {

                var result = func.call(command, this._model, events, isRedo);
                return result;

            } finally {

                if (isCompoundCommand) {
                    this._compoundCommandEvents = null;
                }

                if (!this._isExecutingCompoundCommand()) {
                    var changedSources = []; // aggregate changed events
                    for (i = 0; i < events.length; i++) {
                        var event = events[i];
                        source = event.source;
                        if (event.changed && changedSources.indexOf(source) < 0) {
                            changedSources.push(source);
                        }
                        source.$getEvents().publish(event.type, event.name, event.originalName);
                    }
                    // publish changed events
                    if (changedSources.length > 0 && changedSources.indexOf(this._model) < 0) {
                        changedSources.push(this._model);
                    }
                    for (i = 0; i < changedSources.length; i++) {
                        source = changedSources[i];
                        source.$getEvents().publish(ModelEvents.CHANGED);
                    }
                }

            }
        }
    };

    /**
     * @class
     */
    var ReferenceManager = {

        _renameReference: function(used, using, oldKey, newKey) {
            var index = ReferenceManager._indexOfUsage(used, using, oldKey);
            used.$$usingFeatureKeys[index] = newKey;
        },

        getReferenceFromPath: function(rootObject, keyPath) {
            var segments = keyPath.match(/[_\w]+(\[[^\]]*\])?/g); // split path after identifiers or identifiers followed by an index expression, e.g. id1 or id2["indexValue"]
            if (!segments) return null;

            var referencedObject = rootObject;
            var feature, keyValue;
            for (var j = 0; j < segments.length; j++) {
                var components = segments[j].match(/([_\w]+)(?:\[([^\]]+)\])?/);
                if (!components) throw "assert: invalid path syntax in segment " + j + " of " + keyPath;
                var propertyName = components[1];
                if (!referencedObject) {
                    throw "assert: invalid key path " + keyPath + " parent of " + components[0] + " does not exist";
                }
                if (components[2]) {
                    try {
                        keyValue = JSON.parse(components[2]);
                        referencedObject = referencedObject.$$features[propertyName];
                    } catch (e) {
                        throw "assert: invalid key value " + components[2] + " in path " + keyPath;
                    }
                } else {
                    keyValue = undefined;
                    referencedObject = referencedObject.$$features[propertyName];
                }
                if (referencedObject instanceof ModelFeature) {
                    feature = referencedObject;
                    referencedObject = referencedObject.get(keyValue);
                }
            }

            return {
                object: referencedObject,
                feature: feature,
                keyValue: keyValue
            };
        },

        restoreReferences: function(used, references) {
            var obj, model = used.$getModel();
            if (!model) return;

            for (var i = 0; i < references.length; i++) {
                var path = references[i];
                if (!path) continue;
                var fromTo = path.split("->");
                var reference;
                if (fromTo[1]) {
                    reference = this.getReferenceFromPath(used, fromTo[0]);
                    obj = this.getReferenceFromPath(model, fromTo[1]).object;
                } else {
                    reference = this.getReferenceFromPath(model, fromTo[0]);
                    obj = used;
                }
                if (reference.feature instanceof ModelCollection) {
                    reference.feature.add(reference.keyValue.key, obj, reference.keyValue.nextKey);
                } else if (reference.feature instanceof SingleValueContainer) {
                    reference.feature.set(obj);
                } else {
                    throw "assert: invalid key path " + path;
                }
            }
        },

        _indexOfUsage: function(used, using, keyInCollection) {
            var index = used.$$usingFeatures.indexOf(using);
            while (index != -1) {
                if (used.$$usingFeatureKeys[index] === keyInCollection) {
                    break;
                }
                index = used.$$usingFeatures.indexOf(using, index + 1);
            }
            return index;
        },

        _removeUsage: function(used, using, keyInCollection) {
            var index = ReferenceManager._indexOfUsage(used, using, keyInCollection);
            used.$$usingFeatureKeys.splice(index, 1);
            used.$$usingFeatures.splice(index, 1);
        },

        _addUsage: function(used, using, keyInCollection) {
            if (ReferenceManager._indexOfUsage(used, using, keyInCollection) > -1) return;

            used.$$usingFeatures.push(using);
            if (typeof keyInCollection !== "undefined") {
                used.$$usingFeatureKeys[used.$$usingFeatures.length - 1] = keyInCollection;
            }
        },

        _getReferencesTo: function(root, used, result, shallow) {
            var that = this;

            function callRecursive(child) {
                that._getReferencesTo(root, child, result, true);
            }

            var features;
            if (used instanceof ModelFeature) {
                features = {};
                features[used.getName()] = used;
            } else {
                features = used.$$features;
                for (var i = 0; i < used.$$usingFeatures.length; i++) {
                    var key = used.$$usingFeatureKeys[i];
                    var ref = {};
                    if (used !== root) {
                        ref.object = used;
                    }
                    ref.feature = used.$$usingFeatures[i];
                    if (typeof key !== "undefined") {
                        ref.key = key;
                    }
                    result.push(ref);
                }
            }
            if (!shallow) {
                for (var featureName in features) {
                    if (!features.hasOwnProperty(featureName)) continue;
                    var feature = features[featureName];
                    if (feature.isContainment()) {
                        if (feature instanceof ModelCollection) {
                            feature.foreach(callRecursive);
                        } else {
                            callRecursive(feature.get());
                        }
                    }
                }
            }
        },

        getReferencesTo: function(used, shallow, all) {
            var iResult = [];
            this._getReferencesTo(used, used, iResult, shallow);
            if (!all) {
                return iResult.filter(function(ref) {
                    var owner = ref.feature.getOwner();
                    if (owner instanceof AbstractModel) return false;
                    return !ref.object || !owner.$isContainedIn(used);
                });
            } else {
                return iResult;
            }
        },

        stringifyReference: function(reference, shortFeaturePath) {
            if (typeof reference === "string") return reference;

            var isFromReference = typeof reference.object !== "undefined";
            var result = isFromReference && shortFeaturePath ? reference.feature.getName() : reference.feature.getKeyPath();
            if (typeof reference.key !== "undefined") {
                result += '[' + JSON.stringify(reference.key) + ']';
            }
            if (isFromReference) {
                result += '->' + reference.object.$getKeyPath();
            }
            return result;
        },

        removeReferences: function(used) {
            var result = [];
            // get a copy of the references since we are going to remove references
            var references = ReferenceManager.getReferencesTo(used, true, true);
            references = references.concat(ReferenceManager.getReferencesFrom(used));
            for (var i = 0; i < references.length; i++) {
                var reference = references[i];
                var key = reference.key;
                if (typeof key === "undefined") {
                    reference.feature.set(null);
                } else {
                    var nextKey = reference.feature.getNextKey(key);
                    reference.key = {
                        key: key,
                        nextKey: nextKey
                    };
                    reference.feature.remove(key);
                }
                if (!reference.object || !reference.object.$$disposed) {
                    result.push(ReferenceManager.stringifyReference(reference, true));
                }
            }
            return result;
        },

        _getReferencesFromFeature: function(feature, result) {
            if (feature.isContainment()) return;
            if (feature instanceof ModelCollection) {
                feature.foreach(function(used, key) {
                    if (used instanceof AbstractModelClass) {
                        result.push({
                            feature: feature,
                            key: key,
                            object: used
                        });
                    }
                });
            } else if (feature instanceof SingleValueContainer) {
                var used = feature.get();
                if (used instanceof AbstractModelClass) {
                    result.push({
                        feature: feature,
                        object: used
                    });
                }
            }
        },

        getReferencesFrom: function(using, deep) {
            var result = [];
            if (using instanceof ModelFeature) {
                ReferenceManager._getReferencesFromFeature(using, result);
            } else {
                for (var featureName in using.$$features) {
                    if (!using.$$features.hasOwnProperty(featureName)) continue;
                    var feature = using.$$features[featureName];
                    ReferenceManager._getReferencesFromFeature(feature, result);
                }
            }
            return result;
        }
    };

    /**
     * @class
     */
    var AbstractModel = function(isLoading) {
        this.$$undoManager = new UndoManager(this);
        this.$$events = new ModelEvents(this);
        this.$$isLoading = typeof isLoading === "undefined" ? false : true;
        if (typeof this.$init === "function") this.$init();
    };
    AbstractModel.prototype = {

        $getFeature: function(name) {
            return this.$$features[name];
        },

        $defineContainment: function(name, isMany) {
            defineFeature(this, name, isMany, true);
        },

        $defineReference: function(name, isMany) {
            defineFeature(this, name, isMany, false);
        },

        $isLoading: function() {
            return this.$$isLoading;
        },

        $finishLoading: function() {
            this.$$isLoading = false;
        },

        $getUndoManager: function() {
            return this.$$undoManager;
        },

        $getEvents: function() {
            return this.$$events;
        },

        $getModel: function() {
            return this;
        },

        $getContainer: function() {
            return this;
        },

        $getKeyPath: function() {
            return "";
        },

        toString: function() {
            return this.name ? this.name + '(' + this.$$className + ')' : this.$$className;
        },

        $dispose: function() {
            for (var featureKey in this.$$features) {
                if (!this.$$features.hasOwnProperty(featureKey)) continue;
                this.$$features[featureKey]._dispose();
            }
            this.$getEvents()._dispose();
            this.$$disposed = true;
        },

        $isDisposed: function() {
            return this.$$disposed ? true : false;
        }

    };
    AbstractModel.extend = extend.bind(null, AbstractModel, "AbstractModel", defineFeatures);

    /**
     * @class
     */
    var AbstractModelClass = function(attributes, skippedNodes) {
        this.$$removed = false;
        this.$$usingFeatures = [];
        this.$$usingFeatureKeys = [];
        this.$$defaultKeyValue = -1;
        this.$$skippedNodes = {};
        this.$$events = new ModelEvents(this);
        this.$setAttributes(attributes, skippedNodes);
        if (typeof this.$init === "function") this.$init();
        // check for mandatory key
        if (this.$hasKeyAttribute()) {
            var keyValue = this.$getKeyAttributeValue();
            if (typeof keyValue === "undefined" || keyValue === null) {
                throw new AttributeMissingException(this, this.$getKeyAttributeName());
            }
        }
    };
    AbstractModelClass.prototype = {

        $$supportsKeyAttribute: true,

        $addSkippedNodes: function(skippedNodes) {
            if (skippedNodes && skippedNodes.nodeName) {
                if (this.$$skippedNodes.hasOwnProperty(skippedNodes.nodeName)) {
                    throw "assert: features already added for element " + skippedNodes.nodeName;
                }
                this.$$skippedNodes[skippedNodes.nodeName] = skippedNodes;
            }
        },

        $getFeature: function(name) {
            return this.$$features[name];
        },

        $defineContainment: function(name, isMany) {
            defineFeature(this, name, isMany, true);
        },

        $defineReference: function(name, isMany) {
            defineFeature(this, name, isMany, false);
        },

        $getSkippedNodes: function(nodeName) {
            var skippedNodes = this.$$skippedNodes[nodeName];
            return skippedNodes;
        },

        $getAllSkippedNodes: function() {
            var result = [];
            for (var key in this.$$skippedNodes) {
                if (!this.$$skippedNodes.hasOwnProperty(key)) continue;
                result.push(this.$$skippedNodes[key]);
            }
            return result;
        },

        $setAttributes: function(changedAttributes, skippedNodes) {

            function createOrUpdate(value, feature, key) {
                var newValue = value;
                var nextKey;
                var merged = false;

                var newValueIsEmpty = typeof value === "undefined" || value === null;
                var oldValue;
                if (feature.isMany()) {
                    if (typeof key !== "undefined") {
                        oldValue = feature.get(key);
                    }
                } else {
                    oldValue = feature.get();
                }
                var oldValueIsEmpty = typeof oldValue === "undefined" || oldValue === null;

                // delete old value
                if (!oldValueIsEmpty && (newValueIsEmpty || value.$forceCreate)) {
                    if (feature.isMany()) {
                        // remember the key to insert the new value before
                        nextKey = feature.getNextKey(key);
                    }
                    if (feature.isContainment()) {
                        // deeply remove the object from containment
                        oldValue.$remove(true);
                    } else if (feature.isMany()) {
                        // remove the reference from a collection, single values will just be removed by adding an emty value
                        feature.remove(key);
                    }
                }

                // merge attributes or create new object
                if (feature.isContainment() && !newValueIsEmpty) {
                    var constructor = value.$constructor;
                    if (value instanceof AbstractModelClass) {
                        throw "assert: direct assignment of instances of AbstractModelClass to containment not supported " + feature;
                    }
                    if (typeof constructor !== "function") {
                        throw "assert: unable to create instance, constructor function in attribute $constructor expected";
                    }

                    if (oldValueIsEmpty || value.$forceCreate) {
                        newValue = Object.create(constructor.prototype);
                        constructor.call(newValue, value, value.$skippedNodes);
                    } else {
                        if (Object.getPrototypeOf(oldValue).constructor !== constructor) {
                            throw "assert: unable to merge attributes of different model classes";
                        }
                        oldValue.$setAttributes(value, value.$skippedNodes);
                        merged = true;
                    }
                }

                // set the new value
                if (!merged) {
                    if (feature.isMany()) {
                        if (typeof key === "undefined") {
                            feature.add(newValue, nextKey);
                        } else {
                            feature.add(key, newValue, nextKey);
                        }
                    } else {
                        feature.set(newValue);
                    }
                }
            }

            if (Array.isArray(skippedNodes)) {
                for (var i = 0; i < skippedNodes.length; i++) {
                    this.$addSkippedNodes(skippedNodes[i]);
                }
            } else {
                this.$addSkippedNodes(skippedNodes);
            }
            var key;
            for (key in changedAttributes) {
                if (!changedAttributes.hasOwnProperty(key)) continue;
                // ignore framework properties
                if (key.charAt(0) === '$') continue;
                var value = changedAttributes[key];
                var feature = this.$$features[key];

                if (feature) {
                    if (feature.isMany()) {
                        if (typeof value === "undefined" || value === null) {
                            feature.clear();
                        } else if (Array.isArray(value)) {
                            feature.clear();
                            for (var i = 0; i < value.length; i++) {
                                createOrUpdate(value[i], feature);
                            }
                        } else if (value instanceof ModelCollection) {
                            feature.foreach(function(entry, key) {
                                createOrUpdate(entry, feature, key);
                            });
                        } else if (typeof value === "object") {
                            for (var key in value) {
                                if (!value.hasOwnProperty(key)) continue;
                                createOrUpdate(value[key], feature, key);
                            }
                        } else {
                            throw "assert: value of type " + typeof value + " cannot be assigned to: " + feature;
                        }
                    } else {
                        createOrUpdate(value, feature);
                    }
                } else {
                    if (this.hasOwnProperty(key) && this.$getKeyAttributeName() === key && this[key] !== value) {
                        throw "assert: value of key attribute cannot be changed via setAttributes: " + key;
                    }
                    if (typeof value === "undefined") {
                        delete this[key];
                    } else {
                        this[key] = value;
                    }
                }
            }
        },

        $getAttributes: function(publicOnly) {
            var result = {};
            for (var key in this) {
                if (!this.hasOwnProperty(key)) continue;
                if (key.charAt(0) === '$') continue;
                if (publicOnly && key.charAt(0) === '_') continue;
                var value = this[key];
                if (this.$$features[key] || value instanceof AbstractModelClass || value instanceof ModelCollection) continue;
                result[key] = value;
            }
            return result;
        },

        $getAttributesForUndo: function(newAttributes) {
            var attributes = this.$getAttributes();
            for (var key in newAttributes) {
                if (!newAttributes.hasOwnProperty(key)) continue;
                if (!attributes.hasOwnProperty(key)) attributes[key] = undefined;
            }
            return attributes;
        },

        $getEvents: function() {
            return this.$$events;
        },

        $getEventTypes: function() {
            var proto = Object.getPrototypeOf(this);
            if (!proto.$$eventTypes) {
                proto.$$eventTypes = {};
            }
            return proto.$$eventTypes;
        },

        $getModel: function() {
            return this.$$model;
        },

        $getContainer: function() {
            return this.$$containingFeature ? this.$$containingFeature.getOwner() : this.$$containingFeature;
        },

        $$setContainingFeature: function(feature) {
            if (!feature) {
                this.$$containingFeature = null;
                this.$$model = null;
            } else {
                if (!this.$$containingFeature && feature instanceof ModelFeature) {
                    this.$$containingFeature = feature;
                    this.$$model = feature.getOwner().$getModel();
                } else {
                    throw "assert: " + this.toString() + " already belongs to " + this.$$containingFeature.toString() + " and cannot be added to " + feature.toString();
                }
            }
        },

        $getKeyAttributeName: function() {
            return this.$$keyAttributeName;
        },

        $getKeyAttributeValue: function() {
            return this.$$keyAttributeName ? this[this.$$keyAttributeName] : this.$$defaultKeyValue;
        },

        $hasKeyAttribute: function() {
            return this.$$keyAttributeName ? true : false;
        },

        $getKeyPath: function() {
            if (!this.$$containingFeature) {
                throw "assert: " + this.toString() + " does not have a container";
            }
            if (this.$$containingFeature instanceof ModelCollection) {
                // container is a collection
                return this.$$containingFeature.getKeyPath() + '[' + JSON.stringify(this.$getKeyAttributeValue()) + ']';
            } else {
                // container is a single value property
                return this.$$containingFeature.getKeyPath();
            }
        },

        $rename: function(newKey, doNotRenameContainment) {
            var oldKey = this.$getKeyAttributeValue();
            if (oldKey === newKey) return;

            var oldKeyPath;
            if (this.$$containingFeature instanceof ModelCollection) {
                oldKeyPath = this.$getKeyPath();
            }

            if (this.$hasKeyAttribute()) {
                this[this.$getKeyAttributeName()] = newKey;
            } else {
                this.$$defaultKeyValue = newKey;
            }

            var newKeyPath;
            if (this.$$containingFeature instanceof ModelCollection) {
                newKeyPath = this.$getKeyPath();
            }

            if (!doNotRenameContainment && this.$$containingFeature instanceof ModelCollection) {
                this.$$containingFeature.rename(oldKey, newKey);
            }
        },

        $remove: function(deep) {
            return this.$$remove(false, deep);
        },

        $$remove: function(noSplice, deep) {
            var references = ReferenceManager.removeReferences(this);

            if (deep) {
                for (var featureName in this.$$features) {
                    if (!this.$$features.hasOwnProperty(featureName)) continue;
                    var feature = this.$$features[featureName];
                    if (feature.isContainment()) {
                        // references are already cleaned-up, need to take care of contained objects only
                        if (feature instanceof ModelCollection) {
                            feature.clear();
                        } else {
                            var value = feature.get();
                            if (value) {
                                value.$remove(true);
                            }
                        }
                    }
                }
            }

            if (this.$$containingFeature instanceof ModelCollection) {
                this.$$containingFeature._remove(this.$getKeyAttributeValue(), noSplice);
            } else if (this.$$containingFeature instanceof SingleValueContainer) {
                this.$$containingFeature.set(null);
            }
            this.$$setContainingFeature(null);
            this.$$usingFeatures = [];
            this.$$usingFeatureKeys = [];
            this.$getEvents()._dispose();
            this.$$features = {};
            this.$$removed = true;

            return references;
        },

        $isContainedIn: function(anchestor) {
            if (!(anchestor instanceof AbstractModelClass)) return false;
            if (this.$getModel() !== anchestor.$getModel()) return false;
            var parent = this;
            while (parent instanceof AbstractModelClass && parent !== anchestor) {
                parent = parent.$getContainer();
            }
            return parent instanceof AbstractModelClass;
        },

        toString: function() {
            var keyValue = this.$getKeyAttributeValue();
            return keyValue ? keyValue + '(' + this.$$className + ')' : this.$$className;
        },

        $$dispose: function() {
            for (var featureKey in this.$$features) {
                if (!this.$$features.hasOwnProperty(featureKey)) continue;
                this.$$features[featureKey]._dispose();
            }
            this.$$setContainingFeature(null);
            this.$$usingFeatures = [];
            this.$$usingFeatureKeys = [];
            this.$$skippedNodes = {};
            this.$getEvents()._dispose();
            this.$$disposed = true;
        }

    };
    AbstractModelClass.extend = extend.bind(null, AbstractModelClass, "AbstractModelClass", defineFeatures);

    /**
     * @class
     */
    var CompoundCommand = function() {
        this.$$commands = [];
        if (typeof this.$init === "function") {
            this.$init.apply(this, arguments);
        }
    };
    CompoundCommand.prototype = {
        $init: function(commands) {
            this.$$commands = [];
            this.$addCommands(commands);
        },
        $addCommands: function(commands) {
            if (commands) {
                if (Array.isArray(commands)) {
                    for (var i = 0; i < commands.length; i++) {
                        this.$$commands.push(commands[i]);
                    }
                } else {
                    this.$$commands.push(commands);
                }
            }
        },
        execute: function(model, events, isRedo) {
            return this.$defaultExecute(model, events, isRedo);
        },
        $defaultExecute: function(model, events, isRedo) {
            var result = [];
            var subResult;
            for (var i = 0; i < this.$$commands.length; i++) {
                if (isRedo) {
                    subResult = model.$getUndoManager().redo(this.$$commands[i]);
                } else {
                    subResult = model.$getUndoManager().execute(this.$$commands[i]);
                }
                if (this.$$commands[i] instanceof CompoundCommand) {
                    if (subResult)
                        for (var j = 0; j < subResult.length; j++) {
                            result.push(subResult[j]);
                        }
                } else {
                    result.push(subResult);
                }
            }
            return result;
        },
        undo: function(model, events) {
            return this.$defaultUndo(model, events);
        },
        $defaultUndo: function(model, events) {
            var result = [];
            for (var i = this.$$commands.length - 1; i >= 0; i--) {
                var subResult = model.$getUndoManager().undo(this.$$commands[i]);
                if (this.$$commands[i] instanceof CompoundCommand) {
                    for (var j = 0; j < subResult.length; j++) {
                        result.push(subResult[j]);
                    }
                } else {
                    result.push(subResult);
                }
            }
            return result;
        }
    };
    CompoundCommand.extend = extend.bind(null, CompoundCommand, "CompoundCommand", null);

    /**
     * @class
     */
    var DeleteCommand = CompoundCommand.extend("DeleteCommand", {
        $init: function(object, isSubCommand) {
            if (typeof object === "string") {
                this._keyPath = object;
            } else if (object instanceof AbstractModelClass) {
                this._keyPath = object.$getKeyPath();
            } else {
                throw "assert: key path or instance of AbstractModelClass expected";
            }
            this._isSubCommand = isSubCommand;
            this._executed = false;
        },

        execute: function(model, events, isRedo) {
            var that = this;

            function addSubCommand(value) {
                if (value) {
                    that.$addCommands(new DeleteCommand(value, true));
                }
            }

            var result;
            var ref = ReferenceManager.getReferenceFromPath(model, this._keyPath);
            if (ref && ref.object) {
                if (!this._executed) {
                    for (var featureName in ref.object.$$features) {
                        if (!ref.object.$$features.hasOwnProperty(featureName)) continue;
                        var feature = ref.object.$$features[featureName];
                        if (feature.isContainment()) {
                            if (feature instanceof ModelCollection) {
                                feature.foreach(addSubCommand);
                            } else {
                                addSubCommand(feature.get());
                            }
                        }
                    }
                    this._executed = true;
                }
                var subResult = this.$defaultExecute(model, events, isRedo);

                subResult.push(ref.object);
                // capture everyting we need to re-create the object itself
                this._prototype = Object.getPrototypeOf(ref.object);
                this._attributes = ref.object.$getAttributes();
                this._skippedNodes = ref.object.$getAllSkippedNodes();
                this._containmentKeyPath = ref.feature.getKeyPath();
                this._keyValue = ref.object.$getKeyAttributeValue();
                if (ref.feature instanceof ModelCollection) {
                    this._nextKey = ref.feature.getNextKey(ref.keyValue);
                }
                if (!this._isSubCommand) {
                    var i;
                    var container = ref.object.$getContainer();
                    this._references = [];
                    // remove/capture references first
                    for (i = 0; i < subResult.length; i++) {
                        this._references[i] = ReferenceManager.removeReferences(subResult[i]);
                    }
                    // remove the actual objects
                    for (i = 0; i < subResult.length; i++) {
                        subResult[i].$remove();
                    }
                    events.push({
                        source: container,
                        type: ref.object.$getEventTypes().deleted,
                        name: this._keyValue,
                        changed: true
                    });
                    result = ref.object;
                } else {
                    result = subResult;
                }
            }
            return result;
        },

        undo: function(model, events) {
            // restore deleted object
            var result;
            var object = Object.create(this._prototype);
            this._prototype.constructor.call(object, this._attributes, this._skippedNodes);
            var ref = ReferenceManager.getReferenceFromPath(model, this._containmentKeyPath);
            if (ref.feature instanceof ModelCollection) {
                ref.feature.add(this._keyValue, object, this._nextKey);
            } else {
                ref.feature.set(object);
            }
            // restore contained objects
            var subResult = this.$defaultUndo(model, events);
            subResult = [object].concat(subResult);
            if (!this._isSubCommand) {
                // restore references
                for (var i = this._references.length - 1; i >= 0; i--) {
                    ReferenceManager.restoreReferences(subResult[i], this._references[this._references.length - 1 - i]);
                }
                events.push({
                    source: object.$getContainer(),
                    type: object.$getEventTypes().created,
                    name: this._keyValue,
                    changed: true
                });
                result = object;
            } else {
                result = subResult;
            }
            return result;
        }
    });

    /**
     * @class
     */

    return {
        ModelCollection: ModelCollection,
        ModelEvents: ModelEvents,
        UndoManager: UndoManager,
        ReferenceManager: ReferenceManager,
        AbstractModel: AbstractModel,
        AbstractModelClass: AbstractModelClass,
        CompoundCommand: CompoundCommand,
        DeleteCommand: DeleteCommand,
        ModelException: ModelException,
        ObjectAlreadyExistsException: ObjectAlreadyExistsException,
        AttributeMissingException: AttributeMissingException,
        InvalidAttributeException: InvalidAttributeException,
        UnsupportedOperationException: UnsupportedOperationException,
        TransformationException: TransformationException
    };

});
