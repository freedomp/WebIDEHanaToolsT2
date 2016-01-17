/**
 * Handles the registration and notification of callback functions.
 * When notifying registered callbacks, optional arguments can be specified.
 * Errors in callback functions are caught and logged. Multiple subscription
 * of the same callback function is not possible.
 */
(function CallbackHandler() {

    var logger = sap.galilei.gravity.getLogger("CallbackHandler");

    function allreadyRegistered(callback, callbacks) {
        return $.inArray(callback, callbacks) === -1;
    }

    function notifyInternal(callbacks, args) {
        $(callbacks).each(function (i, callback) {
            try {
                callback.apply(this, args);
            } catch (e) {
                logger.error("Exception while excuting callback '" + callback + "': " + e);
            }
        });
    }

    this.sap.galilei.gravity.createCallbackHandler = function createCallbackHandler() {
        var callbacks = [];

        return {
            /**
             * Registers a callback function.
             * @param callback
             */
            register: function registerCallback(callback) {
                if (typeof(callback) === 'function' && allreadyRegistered(callback, callbacks)) {
                    callbacks.push(callback);
                }
            },
            /**
             * notifies all registered callback function with any optional parameters passed to this function.
             */
            notify: function notifyCallbacks() {
                notifyInternal(callbacks, arguments);
            },
            /**
             * Unregisters a callback function.
             * @param callback
             */
            unregister: function unregisterCallback(callback) {
                var index = $.inArray(callback, callbacks);
                callbacks.splice(index, 1);
            }
        };
    };
}());
(function Participant() {

    this.sap.galilei.gravity.createParticipant = function (model, id, isLocal) {

        function resolve() {
            return model.getNode(id);
        }

        function getAttributeOrDefault(attributeName, defaultValue) {
            var node = resolve();
            if (node) {
                return node.getAttribute(attributeName);
            } else {
                return defaultValue;
            }
        }

        function getReverseAtomicReferencesOrDefault(refName, defaultList) {
            var node = resolve();
            if (node) {
                var createdNodes = node.getReverseAtomicReferences(refName);
                return createdNodes.slice(0);
            } else {
                return defaultList;
            }
        }

        return {
            getId: function () {
                return id;
            },

            getDisplayName: function () {
                return getAttributeOrDefault("displayName", "unknown");
            },

            getThumbnailUrl: function () {
                return getAttributeOrDefault("thumbnailURL", "");
            },

            getEmailAddress: function () {
                return getAttributeOrDefault("emailAddress", "");
            },

            getColor: function () {
                var assignedColors = getReverseAtomicReferencesOrDefault("assignedTo", []);
                if (assignedColors.length > 0) {
                    return assignedColors[0].getAttribute("color");
                }
                return undefined;
            },

            isLocal: function () {
                return !!isLocal;
            },

            getCreatedNodes: function () {
                return getReverseAtomicReferencesOrDefault("creator");
            },

            getWrappedNode: function () {
                return resolve(model, id);
            }
        };
    };
}());

/**
 * add functions to the namespace object
 *
 */
this.sap.galilei.gravity.createOperationalizer = function () {

    var flavors = {
        id: "identity",
        add: "addObject",
        remove: "deleteObject",
        update: "updateAttribute",
        rewire: "setReference",
        wire: "addReference",
        unwire: "removeReference",
        complex: "complex",
        insertString: "insertString",
        removeString: "removeString"
    };

    /**
     * as a precondition, both operations have to have the same context.
     * Undefined components in the context vector are treated as 0.
     *
     * @deprecated not used anymore due to shortcut optimization
     */
    var checkPreconditions = function (op1, op2) {
        var length = 0;
        var i = 0;
        var c1 = 0;
        var c2 = 0;
        if (op1.getContext().length >= op2.getContext().length) {
            length = op1.getContext().length;
        } else {
            length = op2.getContext().length;
        }
        for (i = 0; i < length; i += 1) {
            c1 = op1.getContext()[i] || 0;
            c2 = op2.getContext()[i] || 0;
            if (c1 !== c2) {
                throw "Operation '" + op1 + "' cannot be transformed against '"
                    + op2 + "' as their contexts do not match.";
            }
        }
    };

    var attributeValuesEqual = function (expected, actual) {
        if (expected === actual) {
            return true;
        }
        if (expected === undefined || actual === undefined) {
            return false;
        }

        var p;
        for (p in expected) {
            if (expected.hasOwnProperty(p)) {
                if (expected[p] !== actual[p]) {
                    return false;
                }
            }
        }
        for (p in actual) {
            if (actual.hasOwnProperty(p)) {
                if (expected[p] !== actual[p]) {
                    return false;
                }
            }
        }
        return true;
    };

    var generic_operation = {
        timestamp_cache: undefined,

        /**
         * Returns the context vector array of this operation.
         */
        getContext: function () {
            return this.context_vector;
        },

        getPrimaryContext: function () {
            var context = this.getContext();

            if (context) {
                var primary = [];
                for (var i = 0, len = context.length; i < len; i += 2) {
                    primary.push(context[i] || 0);
                }
                return primary;
            } else {
                return undefined;
            }
        },

        getInverseContext: function () {
            var context = this.getContext();

            if (context) {
                var inv = [];
                for (var i = 1, len = context.length; i < len; i += 2) {
                    inv.push(context[i] || 0);
                }
                return inv;
            } else {
                return undefined;
            }
        },


        /**
         * Returns the identifier of the object this operation is applied to or {@value undefined} for the "id" operation.
         */
        getObjectId: function () {
            return this.object_id;
        },

        /**
         * Sets the context vector if this operation (copies the given
         * array).
         *
         * @param context
         *            is the context vector array.
         */
        setContext: function (context) {
            this.context_vector = context.slice(0);
            this.timestamp_cache = undefined;
        },

        /**
         * Gets the offset into the context vector that identifies the
         * client from which this operation originates.
         */
        getClientOffset: function () {
            return this.client_offset;
        },

        /**
         * Sets the offset into the context vector that identifies the
         * client from which this operation originates.
         *
         * @param client_offset
         *            is the integer index (offset) into the context vector
         *            array.
         */
        setClientOffset: function (offset) {
            this.client_offset = offset;
            this.timestamp_cache = undefined;
        },

        /**
         * Indicates whether or not this operation is an inverse of some
         * other operation. This has impact on the time stamp of this
         * operation.
         *
         * @return {@value true} if this operation is an inverse,
         *         {@value false}, otherwise.
         */
        isInverse: function () {
            return this.is_inverse;
        },

        /**
         * To easily distinguish different operation flavors, this method
         * returns a unique "flavor" identifier per operation type.
         */
        getFlavor: function () {
            return this.flavor;
        },

        /**
         * Upgrades this operation's context to also include op2. Therefore,
         * they both must have the same context, otherwise an exception is
         * thrown.
         *
         * @param operation
         *            the operation to be included into this operation's
         *            context
         */
        upgradeContextToInclude: function (operation) {
            // checkPreconditions(this, operation);

            this.timestamp_cache = undefined;
            // Recall that both contexts have to be identical.
            // Now we set op's context to op2's timestamp.
            // Therefore, op's context also includes op2.
            if (!operation.isInverse()) {
                // initialise if necessary
                if (!this.context_vector[2 * operation.getClientOffset()]) {
                    this.context_vector[2 * operation.getClientOffset()] = 0;
                }
                this.context_vector[2 * operation.getClientOffset()] += 1;
            } else {
                // initialise if necessary
                if (!this.context_vector[2 * operation.getClientOffset() + 1]) {
                    this.context_vector[2 * operation.getClientOffset() + 1] = 0;
                }
                this.context_vector[2 * operation.getClientOffset() + 1 ] += 1;
            }
        },

        /**
         * @return the original operation. May be undefined.
         */
        getOriginalOperation: function () {
            return this.original_operation;
        },

        /**
         * sets the original operation. Can be undefined.
         * @param original_operation
         */
        setOriginalOperation: function (original_operation) {
            this.original_operation = original_operation;
        },

        /**
         * Returns the timestamp array of an operation which is computed by
         * incrementing the originators component of the context vector.
         *
         * @return an array with the operation's timestamp
         */
        timestamp: function () {
            if (this.timestamp_cache === undefined) {
                this.timestamp_cache = this.getContext().slice(0);// copy context array
                // increment to component of the originator thus
                // characterizing a state where the originator has
                // applied the opperation
                if (this.isInverse()) {
                    // if the operation is an inverse operation we increase the
                    // inverse sequence
                    // number which comes right after the normal sequence number
                    this.timestamp_cache[this.getClientOffset() * 2 + 1] = (this.getContext()[this.getClientOffset() * 2 + 1] || 0) + 1;
                }
                else {
                    // if the operation is an normal (i.e. no inverse) operation
                    // we
                    // increase the sequence number
                    this.timestamp_cache[this.getClientOffset() * 2] = (this.getContext()[this.getClientOffset() * 2] || 0) + 1;
                }
            }
            return this.timestamp_cache;
        },

        /**
         * check whether this operation is in the context of operation op2
         *
         * @param operation
         *            the operation to check whether it is this operation's
         *            context
         * @return true if this is in the context of op2, false otherwise
         */
        isInContextOf: function (operation) {
            // we treat undefined values as 0
            for (var i = 0; i < this.getContext().length || i < operation.getContext().length; i += 1) {
                if ((this.timestamp()[i] || 0) > (operation.getContext()[i] || 0)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * checks whether this operation is a subcontext of op2's context
         *
         * @param operation
         * @return true if this operation's context is a subcontext of op2's
         *         context, false otherwise
         */
        isSubContextOf: function (operation) {
            for (var i = 0; i < this.getContext().length || i < operation.getContext().length; i += 1) {
                // if any of op's context components is greater than op2's,
                // op cannot be a subcontext of op2
                if ((this.getContext()[i] || 0) > (operation.getContext()[i] || 0)) {
                    return false;
                }
            }
            return true;
        }
    };

    var id_operation, add_node_operation, remove_node_operation, set_attribute_operation, set_reference_operation, add_reference_operation, remove_reference_operation, insert_string_operation, remove_string_operation, complex_operation;

    /**
     * The id() (aka no-op) primitive operation. Is sometimes the result of a
     * transformation, indicating that the transformed operation should not be
     * applied (which is normally because it is already covered by the operation
     * it is transformed against).
     *
     * @constructor
     * @param context
     *            the context in which this operation was generated
     * @param originator
     *            the id of the originator of this operation
     * @param isInverse
     *            whether or not this is an inverse of another operation (this
     *            is optional with false as its standard)
     * @param originalOp
     *            the original operation (this is optional with undefined as its
     *            standard)
     * @return returns a new instance of the Id operation object
     */
    var createIdOperationInternal = function (context_vector, client_offset, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(id_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };


    var createAddNodeOperationInternal = function (context_vector, client_offset, identity, is_inverse, original_operation, initial_attribute_values) {
        initial_attribute_values = initial_attribute_values || {};
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(add_node_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "is_inverse": is_inverse,
                "original_operation": original_operation,
                "initial_attribute_values": initial_attribute_values
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createRemoveNodeOperationInternal = function (context_vector, client_offset, identity, is_inverse, original_operation, to_be_deleted_attribute_values) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(remove_node_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "is_inverse": is_inverse,
                "original_operation": original_operation,
                to_be_deleted_attribute_values: to_be_deleted_attribute_values
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createSetAttributeOperationInternal = function (context_vector, client_offset, identity, attribute_name, old_value, new_value, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(set_attribute_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "attribute_name": attribute_name,
                "new_value": new_value,
                "old_value": old_value,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }

    };

    var createSetAtomicReferenceOperationInternal = function (context_vector, client_offset, identity, reference_name, old_target_id, new_target_id, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(set_reference_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "reference_name": reference_name,
                "old_target_id": old_target_id,
                "new_target_id": new_target_id,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createAddOrderedReferenceOperationInternal = function (context_vector, client_offset, identity, reference_name, target_id, index, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(add_reference_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "reference_name": reference_name,
                "target_id": target_id,
                "index": index,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createRemoveOrderedReferenceOperationInternal = function (context_vector, client_offset, identity, reference_name, target_id, index, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(remove_reference_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "reference_name": reference_name,
                "target_id": target_id,
                "index": index,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createInsertStringOperationInternal = function (context_vector, client_offset, identity, attribute_name, subString, position, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(insert_string_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "attribute_name": attribute_name,
                "subString": subString,
                "position": position,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    var createRemoveStringOperationInternal = function (context_vector, client_offset, identity, attribute_name, subString, position, is_inverse, original_operation) {
        if (context_vector && $.isArray(context_vector)) {
            return sap.galilei.gravity.beget(remove_string_operation, {
                "operation_id": uuid.v4(),
                "context_vector": context_vector.slice(0),
                "client_offset": client_offset,
                "object_id": identity,
                "attribute_name": attribute_name,
                "subString": subString,
                "position": position,
                "is_inverse": is_inverse,
                "original_operation": original_operation
            });
        } else {
            throw "Context vector is missing or is not an array.";
        }
    };

    /**
     * Creates a new complex operation
     * @param sequence array of primitive operations to include
     * @param client_offset is the integer client offset into the context_vector
     * @return a complex operation
     */
    var createComplexOperationInternal = function (sequence) {
        if (!sequence) {
            sequence = [];
        }

        var complexOp = sap.galilei.gravity.beget(complex_operation, {
            "sequence": sequence
        });

        for (var i = 0, ii = sequence.length; i < ii; i += 1) {
            if (i > 0 && !sap.galilei.gravity.equals(sequence[i - 1].timestamp(), sequence[i].getContext())) {
                throw "Operations '" + sequence[i - 1] + "' and '" + sequence[i] + "' are not strictly consecutive.";
            }
            sequence[i].complexOp = complexOp;
        }


        return complexOp;

    };


    // ***************************************************************
    // Operations
    // ***************************************************************

    id_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.id,

        object_id: undefined,

        toJSON: function () {
            return {
                operation: this.getFlavor()
            };
        },

        /**
         * The inverse of id() is id() itself. ~id() === id()
         */
        inverse: function () {
            return createIdOperationInternal(this.timestamp(), this.getClientOffset(), true);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param primitive_operation
         * @return true if this operation needs to be transformed against primitive_operation.
         */
        requiresTransform: function (primitive_operation) {
            // id does not have to be transformed at all.
            return false;
        },

        /**
         * When id() is transformed against some other operation, it will
         * always yield id(). id()' = ET(id(), operation) = id()
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            return createIdOperationInternal(this.getContext(), this.getClientOffset(),
                this.isInverse(), this.getOriginalOperation() || this);
        },

        /**
         * Applies this operation to the model
         *
         * @param the
         *            model
         */
        materialize: function (model) {
            // no-op
            // FIXME this operation also has to go into the queue
        },

        /**
         * Returns the string representation
         *
         * @return the id operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ")";
        }
    });


    add_node_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.add,

        /**
         * JSON serialization: {operation:"addObject", objectId:<object
		 * id>}
         */
        toJSON: function () {
            var json = {};
            json.operation = this.getFlavor();
            json.objectId = this.getObjectId();

            if (this.initial_attribute_values) {
                json.initial_attribute_values = this.initial_attribute_values;
            }
            return json;
        },

        /**
         * Inverting to add an object is to remove the very same object:
         * ~add(o) = delete(o) TODO: ask Thomas why the timestamp is passed
         * to the inverse and why we do not pass this' original operation??
         */
        inverse: function () {
            return createRemoveNodeOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), true, undefined, this.initial_attribute_values);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            // add node needs to be transformed against all operations that manipulate the same object
            switch (operation.getFlavor()) {
                case flavors.add:
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId());
                case flavors.id:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.update:
                case flavors.insertString:
                case flavors.removeString:
                    return false;
            }
        },

        /**
         * Transforms adding an object against the other operations, using
         * the following rules:
         * <ul>
         * <li>ET(add(o), id()) = add(o)
         * <li>ET(add(o1), add(o2)) =
         * <ul>
         * <li>id() if o1=o2
         * <li>add(o1), otherwise
         * </ul>
         * <li>ET(add(o1), delete(o2)) =
         * <ul>
         * <li> {@literal null} (collision) if o1=o2
         * <li> add(o1), otherwise
         * </ul>
         * <li>ET(add(o1), wire(o2, ref, target, index))= add(o1)
         * <li>ET(add(o1), unwire(o2, ref, target, index)) = add(o1)
         * <li>ET(add(o1), rewire(o2, ref, old_target, new_target)) =
         * add(o1)
         * <li>ET(add(o1), update(o2, attr, old_value, new_value)) =
         * add(o1)
         * <li>ET(add(o1), insStr(o2, attr, string, i) = add(o1)
         * <li>ET(add(o1), remStr(o2, attr, string, i) = add(o1)
         * </ul>
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            switch (operation.getFlavor()) {
                case flavors.add:
                    if (operation.getObjectId() === this.getObjectId()) {
                        if (attributeValuesEqual(this.initial_attribute_values, operation.initial_attribute_values)) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            return undefined;
                        }
                    }
                    return createAddNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.initial_attribute_values);
                case flavors.remove:
                    if (operation.getObjectId() === this.getObjectId()) {
                        return undefined;
                    }
                    return createAddNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.initial_attribute_values);
                case flavors.id:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.update:
                case flavors.insertString:
                case flavors.removeString:
                    return createAddNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.initial_attribute_values);
            }
        },

        /**
         * Adds an object to the model
         * @param model the model to manipulate
         */
        materialize: function (model) {
            model.addNode(this.getObjectId(), this.initial_attribute_values);
        },

        /**
         * Returns the string representation
         * @return the id operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ")";
        }
    });


    remove_node_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.remove,

        toJSON: function () {
            var json = {};
            json.operation = this.getFlavor();
            json.objectId = this.getObjectId();

            if (this.to_be_deleted_attribute_values) {
                json.to_be_deleted_attribute_values = this.to_be_deleted_attribute_values;
            }
            return json;
        },

        /**
         * Inverting a deletion of an object adds that object.
         * ~delete(o) = add(o)
         */
        inverse: function () {
            return createAddNodeOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), true, undefined, this.to_be_deleted_attribute_values);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            // add node needs to be transformed against all operations that manipulate the same object
            switch (operation.getFlavor()) {
                case flavors.add:
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId());
                case flavors.id:
                    return false;
                case flavors.wire:
                    return (this.getObjectId() === operation.getObjectId() || this.getObjectId() === operation.getTargetId());
                case flavors.unwire:
                    return false;
                case flavors.rewire:
                    return ((this.getObjectId() === operation.getObjectId() && operation.getNewTargetId() !== undefined) || this.getObjectId() === operation.getNewTargetId());
                case flavors.update:
                    return (this.getObjectId() === operation.getObjectId() && operation.getNewValue() !== undefined);
                case flavors.insertString:
                    return (this.getObjectId() === operation.getObjectId());
                case flavors.removeString:
                    return false;
            }
        },

        /**
         * Transforms removeObject against another operation, using the
         * following rules:
         * <ul>
         * <li> ET(delete(o), id()) = delete(o)
         * <li> ET(delete(o1), add(o2)) =
         * <ul>
         * <li> undefined (collision) if o1=o2
         * <li> delete(o1), otherwise
         * </ul>
         * <li> ET(delete(o1), delete(o2) =
         * <ul>
         * <li> id() (no-op) if o1=o2
         * <li> delete(o1), otherwise
         * </ul>
         * <li> ET(delete(o1), wire(o2, ref, target, index)) =
         * <ul>
         * <li> undefined (collision) if o1=o2 or o1=target
         * <li> delete(o1), otherwise
         * </ul>
         * <li> ET(delete(o1), unwire(o2, ref, target, index)) =
         * delete(o1)
         * <li> ET(delete(o1), rewire(o2, ref, old_target, new_target)) =
         * <ul>
         * <li> undefined (collision) if o1=o2 and new_target !=
         * null (undefined) OR o1=new_target
         * <li> delete(o1), otherwise
         * </ul>
         * <li> ET(delete(o1), update(o2, attr, old_value, new_value) =
         * <ul>
         * <li> undefined (collision) if o1=o2 and new_value !=
         * null (undefined)
         * <li> delete(o1), otherwise
         * </ul>
         * <li> ET(delete(o1), insStr(o2, attr, string, i) =
         * <ul>
         * <li> delete(o1) if o1 != o2
         * <li> undefined (collision) otherwise
         * </ul>
         * <li> ET(delete(o1), remStr(o2, attr, string, i) = delete(o1)
         * </ul>
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            var sameAttributeValues;
            switch (operation.getFlavor()) {
                case flavors.add:
                    if (operation.getObjectId() === this.getObjectId()) {
                        return undefined;
                    }
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.remove:
                    if (operation.getObjectId() === this.getObjectId()) {
                        if (attributeValuesEqual(this.to_be_deleted_attribute_values, operation.to_be_deleted_attribute_values)) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            return undefined;
                        }
                    }
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.update:
                    if (operation.getObjectId() === this.getObjectId()
                        && operation.getNewValue() !== undefined) {
                        return undefined;
                    }
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.rewire:
                    if ((operation.getObjectId() === this.getObjectId() && operation
                        .getNewTargetId() !== undefined)
                        || (this.getObjectId() === operation.getNewTargetId())) {
                        return undefined;
                    }
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.wire:
                    if (operation.getObjectId() === this.getObjectId()
                        || operation.getTargetId() === this.getObjectId()) {
                        return undefined;
                    }
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.id:
                case flavors.unwire:
                case flavors.removeString:
                    return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                case flavors.insertString:
                    if (this.getObjectId() === operation.getObjectId()) {
                        return undefined;
                    } else {
                        return createRemoveNodeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.isInverse(), original, this.to_be_deleted_attribute_values);
                    }
            }
        },

        /**
         *
         */
        materialize: function (model) {
            model.removeNode(this.getObjectId(), this.to_be_deleted_attribute_values);
        },

        /**
         * Returns the string representation
         * @return the RemoveObject operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ")";
        }
    });


    /**
     * Transforms set_attribute ("update") operation against another
     * operation according to the following set of rules:
     * <ul>
     * <li>ET(update(o1, attr, oldval, newval), id()) = update(o1, attr, oldval,
     * newval)
     * <li>ET(update(o1, attr, oldval, newval), add(o2)) = update(o1, attr,
     * oldval, newval)
     * <li>ET(update(o1, attr, oldval, newval), wire(o2, ref2, target2, index2))
     * = update(o1, attr, oldval, newval)
     * <li>ET(update(o1, attr, oldval, newval), unwire(o2, ref2, target2,
     * index2)) = update(o1, attr, oldval, newval)
     * <li>ET(update(o1, attr, oldval, newval), rewire(o2, ref, oldtarget,
     * newtarget)) = update(o1, attr, oldval, newval)
     * <li>ET(update(o1, attr, oldval, newval), delete(o2)) =
     * <ul>
     * <li>id() if o1=o2 and newval=null
     * <li>{@literal null} (collision) if o1=o2 and newval!=null
     * <li>update(o1, attr, oldval, newval) otherwise
     * </ul>
     * <li>ET(update(o1, attr1, oldval1, newval1), update(o2, attr2, oldval2,
     * newval2)) =
     * <ul>
     * <li>id() if o1=o2 and attr1=attr2 and newval1=newval2
     * <li>{@literal null} (collision) if o1=o2 and attr1=attr2 and
     * newval1!=newval2
     * <li>update(o1, attr1, oldval1, newval1) otherwise
     * </ul>
     * </ul>
     */
    set_attribute_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.update,

        getNewValue: function () {
            return this.new_value;
        },

        getOldValue: function () {
            return this.old_value;
        },

        setOldValue: function (old_value) {
            this.old_value = old_value;
        },

        getAttributeName: function () {
            return this.attribute_name;
        },


        /**
         * JSON serialization: <br>
         * {operation:"updateAttribute", objectId:<object id>, name:<attrbute name>, oldValue:<current value>, newValue:<new value>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getAttributeName(),
                oldValue: this.getOldValue(),
                newValue: this.getNewValue()
            };
        },

        /**
         *
         */
        inverse: function () {
            return createSetAttributeOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getNewValue(), this.getOldValue(), true, undefined);
        },
        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            // add node needs to be transformed against all operations that manipulate the same object
            switch (operation.getFlavor()) {
                case flavors.add:
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId());
                case flavors.id:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.insertString:
                case flavors.removeString:
                    return false;
                case flavors.update:
                    return (this.getObjectId() === operation.getObjectId() && this.getAttributeName() === operation.getAttributeName());
            }
        },
        /**
         *
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            switch (operation.getFlavor()) {
                case flavors.id:
                case flavors.add:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.insertString:
                case flavors.removeString:
                    return createSetAttributeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getOldValue(), this.getNewValue(), this.isInverse(), original);
                case flavors.remove:
                    if (this.getObjectId() === operation.getObjectId()) {
                        if (this.getNewValue() === undefined) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            return undefined;
                        }
                    }
                    return createSetAttributeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getOldValue(), this.getNewValue(), this.isInverse(), original);
                case flavors.update:
                    if (this.getObjectId() === operation.getObjectId()
                        && this.getAttributeName() === operation.getAttributeName()) {
                        if (this.getNewValue() === operation.getNewValue()) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            return undefined;
                        }
                    }
                    return createSetAttributeOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getOldValue(), this.getNewValue(), this.isInverse(), original);
            }
        },

        /**
         *
         */
        materialize: function (model) {
            var object = model.getNode(this.getObjectId());

            if (this.getNewValue() === undefined) {
                if (object !== undefined) {
                    object.setAttribute(this.getAttributeName(), undefined);
                }
            }
            else {
                if (object === undefined) {
                    throw "Object with identity " + this.getObjectId() + " does not exist in model.";
                }

                object.setAttribute(this.getAttributeName(), this.getNewValue());
            }

        },

        /**
         * Returns the string representation
         * @return the Update operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ", " + this.getAttributeName() + ", " + this.getOldValue() + ", " + this.getNewValue() + ")";
        }
    });


    /**
     * Transforms this set reference ("rewire") operation against another
     * operation according to the following set of rules:
     * <ul>
     * <li>ET(rewire(o1, ref, oldtarget, newtarget), id()) = rewire(o1, ref,
     * oldtarget, newtarget)
     * <li>ET(rewire(o1, ref, oldtarget, newtarget), add(o2)) = rewire(o1, ref,
     * oldtarget, newtarget)
     * <li>ET(rewire(o1, ref, oldtarget, newtarget), wire(o2, ref2, target2,
     * index2)) = rewire(o1, ref, oldtarget, newtarget)
     * <li>ET(rewire(o1, ref1, oldtarget, newtarget), unwire(o2, ref2, target,
     * index)) = rewire(o1, ref, oldtarget, newtarget)
     * <li>ET(rewire(o1, ref, oldtarget, newtarget), update(o2, attr, oldval,
     * newval)) = rewire(o1, ref, oldtarget, newtarget)
     * <li>ET(rewire(o1, ref, oldtarget, newtarget), delete(o2)) =
     * <ul>
     * <li>id() if (o1=o2 and ref=null)
     * <li>{@literal null} (collision) if (o1=o2 and ref!=null) or (o2=ref)
     * <li>rewire(o1, ref, oldtarget, newtarget) otherwise
     * </ul>
     * <li>ET(rewire(o1, ref1, oldtarget1, newtarget1), rewire(o2, ref2,
     * oldtarget2, newtarget2)) =
     * <ul>
     * <li>id() if o1=o2 and re1=ref2 and newtarget1=newtarget2
     * <li>{@literal null} (collision)if o1=o2 and re1=ref2 and
     * newtarget1!=newtarget2
     * <li>rewire(o1, ref1, oldtarget1, newtarget1) otherwise
     * </ul>
     * </ul>
     */
    set_reference_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.rewire,

        getNewTargetId: function () {
            return this.new_target_id;
        },

        getOldTargetId: function () {
            return this.old_target_id;
        },

        setOldTargetId: function (old_target_id) {
            this.old_target_id = old_target_id;
        },

        getReferenceName: function () {
            return this.reference_name;
        },


        /**
         * JSON serialization:<br>
         * {operation:"setReference", objectId:<source object id>, name:<reference name>, oldTargetId:<current target object id>, newTargetId:<new target object id>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getReferenceName(),
                oldTargetId: this.getOldTargetId(),
                newTargetId: this.getNewTargetId()
            };
        },

        /**
         *
         */
        inverse: function () {
            return createSetAtomicReferenceOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getNewTargetId(), this.getOldTargetId(), true, undefined);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            switch (operation.getFlavor()) {
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId() || this.getNewTargetId() === operation.getObjectId());
                case flavors.rewire:
                    return (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName());
                case flavors.add:
                case flavors.id:
                case flavors.update:
                case flavors.wire:
                case flavors.unwire:
                case flavors.insertString:
                case flavors.removeString:
                    return false;

            }
        },

        /**
         *
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            switch (operation.getFlavor()) {
                case flavors.id:
                case flavors.add:
                case flavors.wire:
                case flavors.unwire:
                case flavors.update:
                case flavors.insertString:
                case flavors.removeString:
                    return createSetAtomicReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getOldTargetId(), this.getNewTargetId(), this.isInverse(), original);
                case flavors.remove:
                    if (this.getObjectId() === operation.getObjectId()) {
                        if (this.getNewTargetId() === undefined) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            return undefined;
                        }
                    }
                    if (operation.getObjectId() === this.getNewTargetId()) {
                        return undefined;
                    }
                    return createSetAtomicReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getOldTargetId(), this.getNewTargetId(), this.isInverse(), original);
                case flavors.rewire:
                    if (this.getObjectId() === operation.getObjectId()
                        && this.getReferenceName() === operation.getReferenceName()) {
                        return this.getNewTargetId() === operation.getNewTargetId() ? createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original)
                            : undefined;
                    } else {
                        return createSetAtomicReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getOldTargetId(), this.getNewTargetId(), this.isInverse(), original);
                    }
            }
        },

        /**
         *
         */
        materialize: function (model) {

            var object = model.getNode(this.getObjectId());

            if (this.getNewTargetId() === undefined) {
                if (object !== undefined) {
                    object.setAtomicReference(this.getReferenceName(), undefined);
                }
            }
            else {
                if (object === undefined) {
                    throw "Object with identity " + this.getObjectId() + " does not exist in model.";
                }

                var target = model.getNode(this.getNewTargetId());
                if (target === undefined) {
                    throw "Target with identity " + this.getObjectId() + " does not exist in model.";
                }

                object.setAtomicReference(this.getReferenceName(), target);
            }
        },

        /**
         * Returns the string representation
         * @return the SetReference operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ", " + this.getReferenceName() + ", " + this.getOldTargetId() + ", " + this.getNewTargetId() + ")";
        }
    });


    add_reference_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.wire,

        getTargetId: function () {
            return this.target_id;
        },

        getIndex: function () {
            return this.index;
        },

        getReferenceName: function () {
            return this.reference_name;
        },


        /**
         * JSON serialization:<br>
         * {operation:"addReference", objectId:<source object id>, name:<reference name>, index:<index>, targetId:<target object id>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getReferenceName(),
                index: this.getIndex(),
                targetId: this.getTargetId()
            };
        },

        /**
         * ~wire(object, reference, target, index) = unwire(object, reference, target, index)
         */
        inverse: function () {
            return createRemoveOrderedReferenceOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), true, undefined);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            // add node needs to be transformed against all operations that manipulate the same object
            switch (operation.getFlavor()) {
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId() || this.getTargetId() === operation.getObjectId());
                case flavors.unwire:
                case flavors.wire:
                    return (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName());
                case flavors.add:
                case flavors.id:
                case flavors.update:
                case flavors.rewire:
                case flavors.insertString:
                case flavors.removeString:
                    return false;

            }
        },

        /**
         * Transforms adding a reference ("wire") against the other
         * operations, using the following rules:
         * <ul>
         * <li>ET(wire(o1, ref, target, index), add(o2)) = wire(o1,
         * ref, target, index)
         * <li>ET(wire(o1, ref, target, index), delete(o2)) =
         * <ul>
         * <li>{@literal null} (collision) if o1=o2 or target=o2
         * <li>wire(o1, ref, target, index) otherwise
         * </ul>
         * <li>ET(wire(o1, ref1, target1, index1), wire(o2, ref2,
         * target2, index2)) =
         * <ul>
         * <li>id() if o1=o2 and ref1=ref2 and target1=target2 and
         * index1>=index2
         * <li>wire(o1, ref1, target1, index1+1) if o1=o2 and ref1=ref2
         * and target1!=target2 and index1>index2
         * <li>wire(o1, ref1, target1, index1+1) if o1=o2 and ref1=ref2
         * and target1!=target2 and index1=index2 and
         * |target1|>|target2| (deterministic choice based on ordering
         * of target identities)
         * <li>wire(o1, ref1, target1, index1) otherwise
         * </ul>
         * <li>ET(wire(o1, ref1, target1, index1), unwire(o2, ref2,
         * target2, index2)) =
         * <ul>
         * <li>{@literal null} (collision) if o1=o2 and ref1=ref2 and
         * target1=target2
         * <li>wire(o1, ref1, target1, index1-1) if o1=o2 and ref1=ref2
         * and target1!=target2 and index1>index2
         * <li>wire(o1, ref1, target1, index1) otherwise
         * </ul>
         * <li>ET(wire(o1, ref1, target1, index1), insStr(o2, attr, string, index)) = wire(o1, ref1, target1, index1)
         * <li>ET(wire(o1, ref1, target1, index1), remStr(o2, attr, string, index)) = wire(o1, ref1, target1, index1)
         * </ul>
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            switch (operation.getFlavor()) {
                case flavors.id:
                case flavors.add:
                case flavors.rewire:
                case flavors.update:
                case flavors.insertString:
                case flavors.removeString:
                    return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
                case flavors.remove:
                    if (this.getObjectId() === operation.getObjectId()
                        || this.getTargetId() === operation.getObjectId()) {
                        return undefined;
                    }
                    return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
                case flavors.wire:
                    if (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName()) {
                        if (this.getTargetId() === operation.getTargetId()) {
                            if (this.getIndex() === operation.getIndex()) {
                                return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                            } else {
                                return undefined;
                            }
                        } else {
                            if (this.getIndex() > operation.getIndex()) {
                                return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex() + 1, this.isInverse(), original);
                            } else {
                                if (this.getIndex() === operation.getIndex() && this.getTargetId() > operation.getTargetId()) {
                                    return  createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex() + 1, this.isInverse(), original);
                                }
                            }
                        }
                    }
                    return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
                case flavors.unwire:
                    if (this.getObjectId() === operation.getObjectId()
                        && this.getReferenceName() === operation.getReferenceName()) {
                        if (this.getTargetId() === operation.getTargetId()) {
                            return undefined;
                        } else {
                            if (this.getIndex() > operation.getIndex()) {
                                return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex() - 1, this.isInverse(), original);
                            }
                        }
                    }
                    return createAddOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
            }
        },

        /**
         *
         */
        materialize: function (model) {
            var object = model.getNode(this.getObjectId());
            if (object === undefined) {
                throw "Object with identity " + this.getObjectId() + " does not exist in model.";
            }

            var target = model.getNode(this.getTargetId());
            if (target === undefined) {
                throw "Target with identity " + this.getObjectId() + " does not exist in model.";
            }

            object.addOrderedReference(this.getReferenceName(), this.getIndex(), target);
        },

        /**
         * Returns the string representation
         * @return the AddOrderedReference operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ", " + this.getReferenceName() + ", " + this.getTargetId() + ", " + this.getIndex() + ")";
        }
    });

    remove_reference_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.unwire,

        getTargetId: function () {
            return this.target_id;
        },

        getIndex: function () {
            return this.index;
        },

        getReferenceName: function () {
            return this.reference_name;
        },

        /**
         * JSON serialization:<br>
         * {operation:"removeReference", objectId:<source object id>, name:<reference name>, index:<index>, targetId:<target object id>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getReferenceName(),
                index: this.getIndex(),
                targetId: this.getTargetId()
            };
        },

        /**
         * ~unwire(object, reference, target, index) = wire(object, reference, target, index)
         */
        inverse: function () {
            return createAddOrderedReferenceOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), true, undefined);
        },
        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            switch (operation.getFlavor()) {
                case flavors.unwire:
                case flavors.wire:
                    return (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName());
                case flavors.remove:
                case flavors.add:
                case flavors.id:
                case flavors.update:
                case flavors.rewire:
                case flavors.insertString:
                case flavors.removeString:
                    return false;

            }
        },
        /**
         * Transforms removing a reference ("unwire") against the other
         * operations, using the following rules:
         * <ul>
         * <li>ET(unwire(o1, ref, target, index), id()) = unwire(o1,
         * ref, target, index)
         * <li>ET(unwire(o1, ref, target, index), add(o2)) = unwire(o1,
         * ref, target, index)
         * <li>ET(unwire(o1, ref, target, index), delete(o2)) =
         * unwire(o1, ref, target, index)
         * <li>ET(unwire(o1, ref1, target1, index1), wire(o2, ref2,
         * target2, index2) =
         * <ul>
         * <li> {@literal null} (collision) if o1=o2 and ref1=ref2 and
         * target1=target2
         * <li> unwire(o1, ref1, target1, index1+1) if o1=o2 and
         * ref1=ref2 and target1!=target2 & index1>=index2
         * <li> unwire(o1, ref1, target1, index1) otherwise
         * </ul>
         * <li> ET(unwire(o1, ref1, target1, index), insStr(o2, attr, string, index2)) = unwire(o1, ref1, target1, index)
         * <li> ET(unwire(o1, ref1, target1, index), remStr(o2, attr, string, index2)) = unwire(o1, ref1, target1, index)
         * </ul>
         */
        transform: function (operation) {
            // checkPreconditions(this, operation);
            var original = this.getOriginalOperation() || this;
            switch (operation.getFlavor()) {
                case flavors.id:
                case flavors.add:
                case flavors.remove:
                case flavors.rewire:
                case flavors.update:
                case flavors.insertString:
                case flavors.removeString:
                    return createRemoveOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
                case flavors.wire:
                    if (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName()) {
                        if (this.getTargetId() === operation.getTargetId()) {
                            return undefined;
                        } else {
                            if (operation.getIndex() <= this.getIndex()) {
                                return createRemoveOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex() + 1, this.isInverse(), original);
                            }
                        }
                    }
                    return createRemoveOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
                case flavors.unwire:
                    if (this.getObjectId() === operation.getObjectId() && this.getReferenceName() === operation.getReferenceName()) {
                        if (this.getTargetId() === operation.getTargetId() && this.getIndex() === operation.getIndex()) {
                            return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                        } else {
                            if (operation.getIndex() <= this.getIndex()) {
                                return createRemoveOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex() - 1, this.isInverse(), original);
                            }
                        }
                    }
                    return createRemoveOrderedReferenceOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getReferenceName(), this.getTargetId(), this.getIndex(), this.isInverse(), original);
            }
        },

        /**
         *
         */
        materialize: function (model) {
            var object = model.getNode(this.getObjectId());
            if (object === undefined) {
                throw "Object with identity " + this.getObjectId() + " does not exist in model.";
            }
            object.removeOrderedReference(this.getReferenceName(), this.getIndex());
        },

        /**
         * Returns the string representation
         * @return the AddReference operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ", " + this.getObjectId() + ", " + this.getReferenceName() + ", " + this.getTargetId() + ", " + this.getIndex() + ")";
        }
    });

    insert_string_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.insertString,

        object_id: undefined,

        getAttributeName: function () {
            return this.attribute_name;
        },

        getSubString: function () {
            return this.subString;
        },

        getPosition: function () {
            return this.position;
        },

        /**
         * JSON serialization:<br>
         * {operation:"insertString", objectId:<object id>, name:<attribute name>, subString:<subString>, position:<position>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getAttributeName(),
                subString: this.getSubString(),
                position: this.getPosition()
            };
        },

        /**
         * ~insStr(object, attribute, string, index) = remStr(object, attribute, string, index)
         */
        inverse: function () {
            return createRemoveStringOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), true, undefined);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            switch (operation.getFlavor()) {
                case flavors.remove:
                    return (this.getObjectId() === operation.getObjectId());
                case flavors.insertString:
                case flavors.removeString:
                    return (this.getObjectId() === operation.getObjectId() && this.getAttributeName() === operation.getAttributeName());
                case flavors.id:
                case flavors.add:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.update:
                    return false;
            }
        },

        /**
         * Transforms insertion of a substring ("insertString") against the other
         * operations, using the following rules:
         * <ul>
         * <li>ET(insStr(o1, attr1, string1, index1), id()) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), add(o2)) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), delete(o2)) =
         *  <ul>
         *   <li>undefined, if o1 == o2
         *   <li>insStr(o1, attr1, string1, index1), if o1 != o2
         *  </ul>
         * <li>ET(insStr(o1, attr1, string1, index1), wire(o2, ref2, target2, index2)) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), unwire(o2, ref2, target2, index2)) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), rewire(o2, ref2, oldNode, newNode)) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), update(o2, attr2, oldValue, newValue)) = insStr(o1, attr1, string1, index1)
         * <li>ET(insStr(o1, attr1, string1, index1), insStr(o2, attr2, string2, index2)) =
         *  <ul>
         *   <li>insStr(o1, attr1, string1, index1), if o1 != o2 || attr1 != attr2
         *   <li>if o1 == o2 && attr1 == attr2
         *    <ul>
         *     <li>if index1 > index2: insStr(o1, attr1, string1, index1+length(string2))
         *     <li>if string1 starts with string2: insStr(o1, attr1, string1-string2, index1+length(string2))
         *     <li>if string2 starts with string1: id()
         *     <li>if string1 ends with string2: insStr(o1, attr1, string1-string2, index1)
         *     <li>if string2 ends with string1: id()
         *     <li>default: insStr(o1, attr1, string1, index1)
         *    </ul>
         *  </ul>
         * <li>ET(insStr(o1, attr1, string1, index1), remStr(o2, attr2, string2, index2)) =
         *  <ul>
         *   <li>insStr(o1, attr1, string1, index1), if o1 != o2 || attr1 != attr2
         *   <li>if o1 == o2 && attr1 == attr2
         *    <ul>
         *     <li>if index1 <= index2: insStr(o1, attr1, string1, index1)
         *     <li>if index1 >= index2+length(string2): insStr(o1, attr1, string1, index2-length(string2))
         *     <li>if index1 > index2 && index1 < index2+length(string2)): id()
         *    </ul>
         *  </ul>
         * </ul>
         */
        transform: function (operation) {
            var original = this.getOriginalOperation() || this;
            var transformedSubString;
            var transformedPosition;

            switch (operation.getFlavor()) {
                case flavors.remove:
                    if (this.getObjectId() === operation.getObjectId()) {
                        return undefined;
                    }
                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
                case flavors.insertString:
                    //same object
                    if (this.getObjectId() === operation.getObjectId()) {
                        //same attribute
                        if (this.getAttributeName() === operation.getAttributeName()) {
                            //index1 > index2
                            if (this.getPosition() > operation.getPosition()) {
                                transformedSubString = this.getSubString();
                                transformedPosition = this.getPosition() + operation.getSubString().length;
                                return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                            //index1 == index2
                            if (this.getPosition() === operation.getPosition()) {
                                //string1 == string2
                                if (this.getSubString() === operation.getSubString()) {
                                    return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                                }
                                //string1 starts with string2
                                if (this.getSubString().indexOf(operation.getSubString()) === 0) {
                                    transformedSubString = this.getSubString().slice(operation.getSubString().length, this.getSubString().length);
                                    transformedPosition = this.getPosition() + operation.getSubString().length;
                                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                                }
                                //string2 starts with string1
                                if (operation.getSubString().indexOf(this.getSubString()) === 0) {
                                    return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                                }
                                //string1 ends with string2
                                if (this.getSubString().match(operation.getSubString() + "$") === null ? false : true) {
                                    transformedSubString = this.getSubString().slice(0, this.getSubString().length - operation.getSubString().length);
                                    transformedPosition = this.getPosition();
                                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                                }
                                //string2 ends with string1
                                if (operation.getSubString().match(this.getSubString() + "$") === null ? false : true) {
                                    return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                                }
                                return undefined;
                            }
                        }
                    }
                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
                case flavors.removeString:
                    //same object
                    if (this.getObjectId() === operation.getObjectId()) {
                        //same attribute
                        if (this.getAttributeName() === operation.getAttributeName()) {
                            //index1 >= index2+length(string2)
                            if (this.getPosition() >= operation.getPosition() + operation.getSubString().length) {
                                transformedSubString = this.getSubString();
                                transformedPosition = this.getPosition() - operation.getSubString().length;
                                return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                            //index1 > index2 && index1 < index2+length(string2)
                            if (this.getPosition() > operation.getPosition() && this.getPosition() < operation.getPosition() + operation.getSubString().length) {
                                return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                            }
                        }
                    }
                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
                default:
                    return createInsertStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
            }
        },

        /**
         * Applies this operation to the model
         * @param the model
         */
        materialize: function (model) {
            var node = model.getNode(this.getObjectId());
            if (!node) {
                throw "Cannot materialize operation '" + this.toString() + "' because the node '" + this.getObjectId() + "' does not exist.";
            }

            try {
                node.insertIntoStringAttribute(this.getAttributeName(), this.getSubString(), this.getPosition());
            } catch (e) {
                throw "Cannot materialize operation '" + this.toString() + "'because: " + e;
            }
        },

        /**
         * Returns the string representation
         * @return the operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ")";
        }

    });


    remove_string_operation = sap.galilei.gravity.beget(generic_operation, {
        flavor: flavors.removeString,

        object_id: undefined,

        getAttributeName: function () {
            return this.attribute_name;
        },

        getSubString: function () {
            return this.subString;
        },

        getPosition: function () {
            return this.position;
        },

        /**
         * JSON serialization:<br>
         * {operation:"removeString", objectId:<object id>, name:<attribute name>, subString:<subString>, position:<position>}
         */
        toJSON: function () {
            return {
                operation: this.getFlavor(),
                objectId: this.getObjectId(),
                name: this.getAttributeName(),
                subString: this.getSubString(),
                position: this.getPosition()
            };
        },

        /**
         * ~remStr(object, attribute, string, index) = insStr(object, attribute, string, index)
         */
        inverse: function () {
            return createInsertStringOperationInternal(this.timestamp(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), true, undefined);
        },

        /**
         * Checks whether this primitive operation needs to be transformed against another primitive operation.
         * This is used to check whether a shortcut can be taken during the transformation procedure, which greatly
         * improves the runtime performance.
         * @param operation
         * @return true if this operation needs to be transformed against operation.
         */
        requiresTransform: function (operation) {
            switch (operation.getFlavor()) {
                case flavors.insertString:
                case flavors.removeString:
                    return (this.getObjectId() === operation.getObjectId() && this.getAttributeName() === operation.getAttributeName());
                case flavors.id:
                case flavors.add:
                case flavors.remove:
                case flavors.wire:
                case flavors.unwire:
                case flavors.rewire:
                case flavors.update:
                    return false;
            }
        },


        /**
         * Transforms removal of a substring ("removeString") against the other
         * operations, using the following rules:
         * <ul>
         * <li>ET(remStr(o1, attr1, string1, index1), id()) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), add(o2)) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), delete(o2)) = renStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), wire(o2, ref2, target2, index2)) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), unwire(o2, ref2, target2, index2)) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), rewire(o2, ref2, oldNode, newNode)) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), update(o2, attr2, oldValue, newValue)) = remStr(o1, attr1, string1, index1)
         * <li>ET(remStr(o1, attr1, string1, index1), insStr(o2, attr2, string2, index2)) =
         *  <ul>
         *   <li>remStr(o1, attr1, string1, index1), if o1 != o2 || attr1 != attr2
         *   <li>if o1 == o2 && attr1 == attr2
         *    <ul>
         *     <li>if index2 <= index1: remStr(o1, attr1, string1, index1+length(string2))
         *     <li>if index2 >= index1+length(string1): remStr(o1, attr1, string1, index1)
         *     <li>if index2 > index1 && index2 < index1+length(string1): remStr(o1, attr1, merge(string1,string2), index1)
         *    </ul>
         *  </ul>
         * <li>ET(remStr(o1, attr1, string1, index1), remStr(o2, attr2, string2, index2)) =
         *  <ul>
         *   <li>remStr(o1, attr1, string1, index1), if o1 != o2 || attr1 != attr2
         *   <li>if o1 == o2 && attr1 == attr2
         *    <ul>
         *     <li>if index1 == index2
         *      <ul>
         *       <li> if length(string1) <= length(string2): id()
         *       <li> if length(string1) > length(string2): remStr(o1, attr1, string1-string2, index1)
         *      </ul>
         *     <li>if index1+length(string1) <= string2: remStr(o1, attr1, string1, index1)
         *     <li>if index1 < index2 && index1+length(string1) > index2: remStr(o1, attr1, string1\string2, index1)
         *     <li>if index1 >= index2+length(string2): remStr(o1, attr1, string1, index1-length(string2))
         *    </ul>
         *  </ul>
         * </ul>
         */
        transform: function (operation) {
            var original = this.getOriginalOperation() || this;
            var transformedSubString;
            var transformedPosition;

            switch (operation.getFlavor()) {
                case flavors.insertString:
                    //same object
                    if (this.getObjectId() === operation.getObjectId()) {
                        //same attribute
                        if (this.getAttributeName() === operation.getAttributeName()) {
                            //index2 <= index1
                            if (operation.getPosition() <= this.getPosition()) {
                                transformedSubString = this.getSubString();
                                transformedPosition = this.getPosition() + operation.getSubString().length;
                                return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                            //index2 > index1 && index2 < index1+length(string1)
                            if (operation.getPosition() > this.getPosition() && operation.getPosition() < this.getPosition() + this.getSubString().length) {
                                transformedSubString = this.getSubString().substr(0, operation.getPosition() - this.getPosition()) + operation.getSubString() + this.getSubString().substr(operation.getPosition() - this.getPosition());
                                transformedPosition = this.getPosition();
                                return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                        }
                    }
                    return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
                case flavors.removeString:
                    //same object
                    if (this.getObjectId() === operation.getObjectId()) {
                        //same attribute
                        if (this.getAttributeName() === operation.getAttributeName()) {
                            //index1 == index2
                            if (this.getPosition() === operation.getPosition()) {
                                //length(string1) <= length(string2)
                                if (this.getSubString().length <= operation.getSubString().length) {
                                    return createIdOperationInternal(this.getContext(), this.getClientOffset(), this.isInverse(), original);
                                } else {
                                    transformedSubString = this.getSubString().substr(operation.getSubString().length);
                                    transformedPosition = this.getPosition();
                                    return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                                }
                            }
                            //index1 < index2 && index1+length(string1) > index2
                            if (this.getPosition() < operation.getPosition() && this.getPosition() + this.getSubString().length > operation.getPosition()) {
                                transformedSubString = this.getSubString().substring(0, operation.getPosition() - this.getPosition());
                                if (this.getPosition() + this.getSubString().length > operation.getPosition() + operation.getSubString().length) {
                                    transformedSubString += this.getSubString().substr(operation.getPosition() + operation.getSubString().length - this.getPosition());
                                }
                                transformedPosition = this.getPosition();
                                return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                            //index1 >= index2+length(string2)
                            if (this.getPosition() >= operation.getPosition() + operation.getSubString().length) {
                                transformedSubString = this.getSubString();
                                transformedPosition = this.getPosition() - operation.getSubString().length;
                                return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), transformedSubString, transformedPosition, this.isInverse(), original);
                            }
                        }
                    }
                    return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
                default:
                    return createRemoveStringOperationInternal(this.getContext(), this.getClientOffset(), this.getObjectId(), this.getAttributeName(), this.getSubString(), this.getPosition(), this.isInverse(), original);
            }
        },

        /**
         * Applies this operation to the model
         * @param the model
         */
        materialize: function (model) {
            var node = model.getNode(this.getObjectId());
            if (!node) {
                throw "Cannot materialize operation '" + this.toString() + "' because the node '" + this.getObjectId() + "' does not exist.";
            }

            try {
                node.removeFromStringAttribute(this.getAttributeName(), this.getSubString(), this.getPosition());
            } catch (e) {
                throw "Cannot materialize operation '" + this.toString() + "'because: " + e;
            }
        },

        /**
         * Returns the string representation
         * @return the operation in string format
         */
        toString: function () {
            return this.getFlavor() + "(" + JSON.stringify(this.getContext()) + "/" + JSON.stringify(this.timestamp()) + ", " + this.getClientOffset() + ")";
        }
    });

    complex_operation = {
        /**
         * a short description of what this complex operation does.
         */
        description: "",

        /**
         * Returns the sequence of primitive operations within this complex operation.
         */
        getPrimitiveOps: function () {
            return this.sequence;
        },

        setPrimitiveOps: function (sequence) {
            this.sequence = sequence;
        },

        /**
         * Fetches the sequence number that was assigned when the operation was created.
         */
        getSequenceNumber: function () {
            if (this.sequenceNumber) {
                return this.sequenceNumber;
            }

            if (this.original_operation) {
                this.sequenceNumber = this.original_operation.getSequenceNumber();
            }

            return this.sequenceNumber;
        },

        /**
         * Explicitly sets the operation's sequence number.
         */
        setSequenceNumber: function (sequenceNumber) {
            this.sequenceNumber = sequenceNumber;
        },

        /**
         * Reverses the complex operation
         * @return the reverse of the complex operation
         */
        inverse: function () {
            var complexInv = createComplexOperationInternal(undefined);
            complexInv.setSequenceNumber(this.getSequenceNumber());

            var opInv;
            var length = this.sequence.length;
            for (var i = length - 1; i >= 0; i -= 1) {
                opInv = this.sequence[i].inverse();

                if (opInv && this.sequence[i].nestedTransactionDescription !== undefined) {
                    opInv.nestedTransactionDescription = this.sequence[i].nestedTransactionDescription;
                }

                if (complexInv.getPrimitiveOps().length > 0) {
                    opInv.setContext(complexInv.getPrimitiveOps()[complexInv.getPrimitiveOps().length - 1].timestamp());
                }
                complexInv.addPrimitiveOp(opInv);
            }
            return complexInv;
        },

        /**
         * @return the flavor of this complex operation.
         */
        getFlavor: function () {
            return flavors.complex;
        },

        /**
         * Applies the complex operation to the model by sequentially applying its contained primitive operations.
         *
         * @param model the model to apply the operations to
         */
        materialize: function (model) {
            for (var i = 0, ii = this.sequence.length; i < ii; i += 1) {
                if (this.sequence[i].nestedTransactionDescription !== undefined) {
                    sap.galilei.gravity.nestedTransactionDescription = this.sequence[i].nestedTransactionDescription;
                }
                this.sequence[i].materialize(model);
                if (sap.galilei.gravity.nestedTransactionDescription) {
                    delete sap.galilei.gravity.nestedTransactionDescription;
                }
            }
        },

        /**
         * Renders this complex operation as an object literal, ready for being JSON-ized.
         */
        toJSON: function () {
            if (this.sequence && this.sequence.length && this.sequence.length > 0) {
                return {
                    "context": this.sequence[0].getPrimaryContext(),
                    "sequence": this.sequence,
                    "description": this.description
                };
            }
            else {
                return undefined;
            }
        },

        /**
         *
         * Sets the original operation.
         * @original_operation the original operation of this operation. Can be undefined.
         */
        setOriginalOperation: function (original_operation) {
            this.original_operation = original_operation;
        },

        /**
         * @return the original operation. may be undefined
         */
        getOriginalOperation: function () {
            return this.original_operation;
        },

        /**
         *
         * @return the timestamp of the last operation. if there are no operations, undefined is returned
         */
        timestamp: function () {
            var length = this.sequence.length;

            if (length > 0) {
                return this.sequence[length - 1].timestamp();
            }
            else {
                return undefined;
            }
        },

        /**
         * return the context of this complex operation
         *
         * @return the context of the first primitive operation or undefined if there are no primitive operations
         */
        getContext: function () {
            if (this.sequence.length > 0) {
                return this.sequence[0].getContext();
            } else {
                return undefined;
            }
        },

        /**
         * adds a primitive operation to this complex operation
         * @param op the primitive operation to be added
         *
         */
        addPrimitiveOp: function (operation) {
            var length = this.sequence.length;

            // check if the predecessor (primitive) operation's timestamp is identical to the new operation's context
            if (length > 0 && !sap.galilei.gravity.equals(this.sequence[length - 1].timestamp(), operation.getContext())) {
                throw "Operations '" + this.sequence[length - 1] + "' and '" + operation + "' are not strictly consecutive.";
            }

            operation.complexOp = this;
            this.sequence.push(operation);
        },

        /**
         * Returns the string representation
         * @return the complex operation in string format
         */
        toString: function () {
            var i = 0;
            var ii = this.sequence.length;
            var s = "[";
            for (i = 0; i < ii; i += 1) {
                if (i > 0) {
                    s += ", ";
                }
                s += this.sequence[i].toString();
            }
            return s + "]";
        }
    };

    return {

        /**
         * The id() (aka no-op) primitive operation. Is sometimes the result of a
         * transformation, indicating that the transformed operation should not be
         * applied (which is normally because it is already covered by the operation
         * it is transformed against).
         *
         * @constructor
         * @param context
         *            the context in which this operation was generated
         * @param originator
         *            the id of the originator of this operation
         * @param isInverse
         *            whether or not this is an inverse of another operation (this
         *            is optional with false as its standard)
         * @param originalOp
         *            the original operation (this is optional with undefined as its
         *            standard)
         * @return returns a new instance of the Id operation object
         */
        createIdOperation: function (context_vector, client_offset) {
            return createIdOperationInternal(context_vector, client_offset, false, undefined);
        },

        createAddNodeOperation: function (context_vector, client_offset, identity, initial_attribute_values) {
            return createAddNodeOperationInternal(context_vector, client_offset, identity, false, undefined, initial_attribute_values);
        },

        createRemoveNodeOperation: function (context_vector, client_offset, identity, to_be_deleted_attribute_values) {
            return createRemoveNodeOperationInternal(context_vector, client_offset, identity, false, undefined, to_be_deleted_attribute_values);
        },

        createSetAttributeOperation: function (context_vector, client_offset, identity, attribute_name, old_value, new_value) {
            return createSetAttributeOperationInternal(context_vector, client_offset, identity, attribute_name, old_value, new_value, false, undefined);
        },

        createSetAtomicReferenceOperation: function (context_vector, client_offset, identity, reference_name, old_target_id, new_target_id) {
            return createSetAtomicReferenceOperationInternal(context_vector, client_offset, identity, reference_name, old_target_id, new_target_id, false, undefined);
        },

        createAddOrderedReferenceOperation: function (context_vector, client_offset, identity, reference_name, target_id, index) {
            return createAddOrderedReferenceOperationInternal(context_vector, client_offset, identity, reference_name, target_id, index, false, undefined);
        },

        createRemoveOrderedReferenceOperation: function (context_vector, client_offset, identity, reference_name, target_id, index) {
            return createRemoveOrderedReferenceOperationInternal(context_vector, client_offset, identity, reference_name, target_id, index, false, undefined);
        },

        createInsertStringOperation: function (context_vector, client_offset, identity, attribute_name, subString, position) {
            return createInsertStringOperationInternal(context_vector, client_offset, identity, attribute_name, subString, position, false, undefined);
        },

        createRemoveStringOperation: function (context_vector, client_offset, identity, attribute_name, subString, position) {
            return createRemoveStringOperationInternal(context_vector, client_offset, identity, attribute_name, subString, position, false, undefined);
        },

        createComplexOperation: function (sequence) {
            return createComplexOperationInternal(sequence);
        },

        /**
         * Parses an object resulting from a JSON string into a complex operation.
         *
         * @param {Object} object is the complex operation object that was parsed out of a JSON string, it is NOT the JSON string itself!
         * @param {Number} client_offset is the (integer) offset into the primitive operations' context vectors, denoting the client from whom this operation originates.
         *
         * @return the complex operation object.
         */
        parseComplexOperation: function (object, client_offset) {
            if (!object || typeof object !== "object") {
                throw JSON.stringify(object) + " is not a complex operation representation";
            }

            if (client_offset === undefined || typeof client_offset !== "number" || client_offset < 0) {
                throw JSON.stringify(client_offset) + " is not a correct client offset into the primitive operations' context vector";
            }

            var context_vector = object.context;
            if (!context_vector || !$.isArray(context_vector)) /* || context_vector.length <= client_offset) */ {
                throw JSON.stringify(context_vector) + " is not a correct context vector for this complex operation";
            }


            var expanded_context = [];
            var value;
            var i, len;

            for (i = 0, len = Math.max(context_vector.length, client_offset + 1); i < len; i += 1) {
                value = context_vector[i];
                expanded_context.push(value ? value : 0);
                expanded_context.push(0);
            }

            var sequence = object.sequence;
            if (!sequence || !$.isArray(sequence) || sequence.length === 0) {
                throw JSON.stringify(sequence) + " is not a proper primitive operations sequence";
            }

            var description = object.description || "";

            var primitives = [];
            var primitive;
            var primary_offset = 2 * client_offset;
            var inv_offset = primary_offset + 1;
            var actual_offset;

            for (i = 0, len = sequence.length; i < len; i += 1) {
                primitive = this.parsePrimitiveOperation(sequence[i], expanded_context, client_offset);
                primitives.push(primitive);
                // TODO: do we ever expect inverses here?
                actual_offset = primitive.isInverse() ? inv_offset : primary_offset;
                value = expanded_context[actual_offset];
                expanded_context[actual_offset] = value ? value + 1 : 1;
            }
            var complex = createComplexOperationInternal(primitives);
            complex.description = description;
            return complex;
        },

        /**
         * Parses an object resulting from a JSON string into a primitive operation.
         *
         * @param {Object} object is the primitive operation object that was parsed out of a JSON string, it is NOT the JSON string itself!
         * @param {Array} context_vector is the context vector of this operation.
         * @param {Number} client_offset is the (integer) offset into the context vector, denoting the client from whom this operation originates.
         *
         * @return the primitive operation object.
         */
        parsePrimitiveOperation: function (object, context_vector, client_offset) {
            if (!object || typeof (object) !== "object") {
                throw JSON.stringify(object) + " is not a primitive operation representation";
            }

            if (!context_vector || !$.isArray(context_vector)) {
                throw JSON.stringify(context_vector) + " is not a proper context vector";
            }

            if (client_offset === undefined || typeof client_offset !== "number" || client_offset < 0 || client_offset >= context_vector.length / 2) {
                throw JSON.stringify(client_offset) + " is not a correct client offset into the context vector " + JSON.stringify(context_vector);
            }

            var opcode = object.operation;
            if (opcode === undefined) {
                throw JSON.stringify(object) + " is not a serialized primitive operation";
            }

            var initial_attribute_values = object.initial_attribute_values;
            var to_be_deleted_attribute_values = object.to_be_deleted_attribute_values;

            if (opcode === flavors.id) {
                return createIdOperationInternal(context_vector, client_offset, false, undefined);
            } else {
                var identity = object.objectId;

                if (identity === undefined) {
                    throw JSON.stringify(object) + " lacks an objectId attribute";
                }

                switch (opcode) {
                    case flavors.add:
                        return createAddNodeOperationInternal(context_vector, client_offset, identity, false, undefined, initial_attribute_values);
                    case flavors.remove:
                        return createRemoveNodeOperationInternal(context_vector, client_offset, identity, false, undefined, to_be_deleted_attribute_values);
                    default:
                        var name = object.name;

                        if (name === undefined) {
                            throw JSON.stringify(object) + " lacks a name attribute";
                        }

                        switch (opcode) {
                            case flavors.update:
                                return createSetAttributeOperationInternal(context_vector, client_offset, identity, name, object.oldValue, object.newValue, false, undefined);
                            case flavors.rewire:
                                return createSetAtomicReferenceOperationInternal(context_vector, client_offset, identity, name, object.oldTargetId, object.newTargetId, false, undefined);
                            case flavors.wire:
                                return createAddOrderedReferenceOperationInternal(context_vector, client_offset, identity, name, object.targetId, object.index, false, undefined);
                            case flavors.unwire:
                                return createRemoveOrderedReferenceOperationInternal(context_vector, client_offset, identity, name, object.targetId, object.index, false, undefined);
                            case flavors.insertString:
                                return createInsertStringOperationInternal(context_vector, client_offset, identity, name, object.subString, object.position, false, undefined);
                            case flavors.removeString:
                                return createRemoveStringOperationInternal(context_vector, client_offset, identity, name, object.subString, object.position, false, undefined);
                            default:
                                throw JSON.stringify(object) + " does not represent a known operation type";
                        }
                }
            }
        }
    };
};

this.sap.galilei.gravity.createOperationGenerator = function (model, client_offset) {

    var operationalizer = sap.galilei.gravity.createOperationalizer();

    var currentComplexOperation = operationalizer.createComplexOperation();

    var logger = sap.galilei.gravity.getLogger("OperationGenerator");

    var timestamp = [];

    var sequenceNumber = 0;

    var incrementTimestamp = function () {
        var index = 2 * client_offset;
        if (!timestamp[index]) {
            timestamp[index] = 0;
        }
        timestamp[index] += 1;
        return timestamp;
    };

    var addToComplexOperation = function (primitiveOperation) {
        currentComplexOperation.addPrimitiveOp(primitiveOperation);
        incrementTimestamp();
    };

    var modelListener = {
        attributeSet: function (node, name, new_value, old_value) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                // we only want to generate an operation if there was something
                // actually done
                if (new_value !== old_value) {
                    var setAttr = operationalizer.createSetAttributeOperation(
                        timestamp, client_offset, node.identity, name,
                        old_value, new_value);
                    if (sap.galilei.gravity.nestedTransactionDescription) {
                        setAttr.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                    }
                    addToComplexOperation(setAttr);
                }
            }
            /***
             * MODIFIED
             * **** END ****
             */

        },

        atomicReferenceSet: function (that, name, new_target, old_target) {
            // we only want to generate an operation if there was something
            // actually done
            if (new_target !== old_target && model.isProtectedFromUndo !== true) {
                var old_target_id = (old_target !== undefined) ? old_target
                    .getIdentity() : undefined;
                var new_target_id = (new_target !== undefined) ? new_target
                    .getIdentity() : undefined;

                var setRef = operationalizer.createSetAtomicReferenceOperation(
                    timestamp, client_offset, that.identity, name,
                    old_target_id, new_target_id);

                if (sap.galilei.gravity.nestedTransactionDescription) {
                    setRef.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                }

                addToComplexOperation(setRef);
            }
        },

        orderedReferenceAdded: function (that, name, index, target) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                var addRef = operationalizer.createAddOrderedReferenceOperation(
                    timestamp, client_offset, that.getIdentity(), name, target
                        .getIdentity(), index);
                if (sap.galilei.gravity.nestedTransactionDescription) {
                    addRef.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                }
                addToComplexOperation(addRef);
            }
            /***
             * MODIFIED
             * **** END ****
             */
        },

        orderedReferenceRemoved: function (that, name, indexOrObject, target) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                var remRef = operationalizer.createRemoveOrderedReferenceOperation(
                    timestamp, client_offset, that.identity, name, target
                        .getIdentity(), indexOrObject);
                if (sap.galilei.gravity.nestedTransactionDescription) {
                    remRef.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                }
                addToComplexOperation(remRef);
            }
            /***
             * MODIFIED
             * **** END ****
             */
        },

        nodeAdded: function (node, initial_attribute_values) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                var addNodeOp = operationalizer
                    .createAddNodeOperation(timestamp, client_offset, node
                        .getIdentity(), initial_attribute_values);
                if (sap.galilei.gravity.nestedTransactionDescription) {
                    addNodeOp.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                }
                addToComplexOperation(addNodeOp);
            }
            /***
             * MODIFIED
             * **** END ****
             */
        },

        nodeRemoved: function (node, attribute_values) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                var remNodeOp = operationalizer.createRemoveNodeOperation(
                    timestamp, client_offset, node.getIdentity(),
                    attribute_values);
                if (sap.galilei.gravity.nestedTransactionDescription) {
                    remNodeOp.nestedTransactionDescription = sap.galilei.gravity.nestedTransactionDescription;
                }
                addToComplexOperation(remNodeOp);
            }
            /***
             * MODIFIED
             * **** END ****
             */
        },

        stringInserted: function (node, attribute, string, position) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                addToComplexOperation(
                    operationalizer.createInsertStringOperation(
                        timestamp, client_offset, node.getIdentity(), attribute, string, position));
            }
            /***
             * MODIFIED
             * **** END ****
             */
        },

        stringRemoved: function (node, attribute, string, position) {
            /***
             * MODIFIED
             * **** BEGIN ****
             * Prevent from registering primitive action in the complex operation if undo is not supported
             */
            if (model.isProtectedFromUndo !== true) {
                addToComplexOperation(
                    operationalizer.createRemoveStringOperation(
                        timestamp, client_offset, node.getIdentity(), attribute, string, position));
            }
            /***
             * MODIFIED
             * **** END ****
             */
        }
    };

    return {
        startGenerating: function (initialContext, description) {
            timestamp = initialContext.slice(0);
            currentComplexOperation = operationalizer.createComplexOperation();
            if (description) {
                currentComplexOperation.description = description;
            }
            model.addModelListener(modelListener);
        },

        stopGenerating: function () {
            model.removeModelListener(modelListener);
            currentComplexOperation.setSequenceNumber(sequenceNumber);
            sequenceNumber += 1;
        },

        getGeneratedComplexOperation: function () {
            return currentComplexOperation;
        }
    };

};
/**
 * Creates a new model instance. This method is supposed to be used by editors
 * working atop a client model replica. Editors must not interact with the OT
 * layer directly but rather adhere to the methods provided by the returned
 * object.
 *
 * @param {Function} lockedByModelHandler optional function that evaluates to true or false
 * depending on whether the model is currently locked. If the function is undefined, the model
 * is permanently unlocked and can be changed any time.
 *
 */
this.sap.galilei.gravity.createModel = function (lockedByModelHandler) {

    if (typeof (lockedByModelHandler) !== "function") {
        lockedByModelHandler = function () {
            return false;
        };
    }

    /**
     * Storage for all objects in the model. Please note that there must not be
     * any identity collisions between objects.
     */
    var nodes = {};

    var listeners = sap.galilei.gravity.createSubscriptionHandler();

    var logger = sap.galilei.gravity.getLogger("Model");

    var nodeChangeListener = {
        attributeSet: function (that, name, old_value, new_value) {
            listeners.notify('attributeSet', [that, name, new_value, old_value]);
        },

        atomicReferenceSet: function (that, name, old_target, new_target) {
            listeners.notify('atomicReferenceSet', [that, name, new_target, old_target]);
        },

        orderedReferenceAdded: function (that, name, index, target) {
            listeners.notify('orderedReferenceAdded', [that, name, index, target]);

        },

        orderedReferenceRemoved: function (that, name, indexOrObject, target) {
            listeners.notify('orderedReferenceRemoved', [that, name, indexOrObject, target]);
        },

        stringInserted: function (that, name, string, position) {
            listeners.notify('stringInserted', [that, name, string, position]);
        },

        stringRemoved: function (that, name, string, position) {
            listeners.notify('stringRemoved', [that, name, string, position]);
        }
    };


    var copy = function (object) {
        if (!object) {
            return undefined;
        }
        var copiedObject = {}, property;
        for (property in object) {
            if (object.hasOwnProperty(property)) {
                copiedObject[property] = object[property];
            }
        }
        return copiedObject;
    };

    var checkLockedByModelHandler = function () {
        if (lockedByModelHandler()) {
            throw "Model cannot be manipulated outside ModelHandler.changeModel().";
        }
    };

    /**
     * Adds a node having the given identity to the model and sets the specified attribute values.
     *
     * @param identity
     *            is the unique identity to the to-be-added object.
     * @param attribute_values initial attribute values for this node
     * @return the operation ready to be enqueued
     */
    var addNodeInternal = function (identity, attribute_values) {
        if (nodes[identity]) {
            throw "Node " + identity + " already exists in the model.";
        }

        // create a new model node
        var node = sap.galilei.gravity.createNode(identity, attribute_values, nodeChangeListener, lockedByModelHandler);

        // and put it into the model
        nodes[identity] = node;

        listeners.notify('nodeAdded', [node, attribute_values || {}]);
    };

    /**
     * Removes the object with the given identity from the model. This method
     * will automatically add the corresponding simple operation to the
     * operations queue (or the currently open complex operation therein).
     *
     * @param indentity
     *            is the identity of the object that is to be removed.
     * @param attribute_values
     *            a map of attribute value pair that the node has
     * @return the operation ready to be enqueued
     */
    var removeNodeInternal = function (identity, attribute_values) {
        if (!nodes[identity]) {
            throw "Model does not contain a node " + identity;
        }

        var node = nodes[identity];
        var notify_listener = false;
        var msg;
        for (var attr in attribute_values) {
            if (attribute_values.hasOwnProperty(attr)) {
                if (attribute_values[attr] === node.getAttribute(attr)) {
                    node.deleteAttribute(attr, notify_listener);
                } else {
                    logger.error("Attribute '" + attr + "' of node '" + identity + "' is set to '" +
                        node.getAttribute(attr) + "' but value '" + attribute_values[attr] +
                        "' was expected.");
                }
            }
        }

        if (node.listAttributes().length > 0) {
            msg = "Cannot remove node " + identity + " because it still holds attributes: " + node.listAttributes();
            logger.error(msg);
            throw msg;
        }

        if (node.listAtomicReferences().length > 0) {
            msg = "Cannot remove node " + identity + " because it still holds atomic references.";
            logger.error(msg);
            throw msg;
        }

        if (node.listOrderedReferences().length > 0) {
            msg = "Cannot remove node " + identity + " because it still holds ordered references.";
            logger.error(msg);
            throw msg;
        }

        if (node.listReverseAtomicReferences().length > 0) {
            msg = "Cannot remove node " + identity + " because it is still a target of atomic references.";
            logger.error(msg);
            throw msg;
        }

        if (node.listReverseOrderedReferences().length > 0) {
            msg = "Cannot remove node " + identity + " because it is still a target of ordered references.";
            logger.error(msg);
            throw msg;
        }

        if (node.listStringAttributes().length > 0) {
            msg = "Cannot remove node " + identity + "because it holds string-valued attributes: " + node.listStringAttributes();
            logger.error(msg);
            throw msg;
        }

        delete nodes[identity];
        listeners.notify('nodeRemoved', [node, attribute_values || {}]);

        node.listener = undefined;
    };

    var removeAllAtomicReferences = function (node) {
        var atomicRefs = node.listAtomicReferences();
        var ref;
        var atomicRefs_length = atomicRefs.length;
        for (var i = 0; i < atomicRefs_length; i += 1) {
            ref = atomicRefs[i];
            node.deleteAtomicReference(ref);
        }
    };

    var removeAllReverseAtomicReferences = function (node) {
        var reverseAtomicRefs = node.listReverseAtomicReferences();
        var referencingNodes;
        var ref;
        var refNode;
        var reverseAtomicRefs_length = reverseAtomicRefs.length;
        var referencingNodes_length;
        for (var i = 0; i < reverseAtomicRefs_length; i += 1) {
            ref = reverseAtomicRefs[i];
            referencingNodes = node.getReverseAtomicReferences(ref);
            referencingNodes_length = referencingNodes.length;
            for (var j = 0; j < referencingNodes_length; j += 1) {
                refNode = referencingNodes[j];
                refNode.deleteAtomicReference(ref);
            }
        }
    };

    var removeAllOrderedReferences = function (node) {
        var orderedRefs = node.listOrderedReferences();
        var referencedNodes;
        var reference;
        var orderedRefs_length = orderedRefs.length;
        for (var i = 0; i < orderedRefs_length; i += 1) {
            reference = orderedRefs[i];
            referencedNodes = node.getOrderedReference(reference);
            // we go through the referenced nodes in reverse so we don't mess up the indexes
            for (var j = referencedNodes.length - 1; j >= 0; j -= 1) {
                node.removeOrderedReference(reference, j);
            }
        }
    };

    var removeAllReverseOrderedReferences = function (node) {
        var reverseOrderedRefs = node.listReverseOrderedReferences();
        var referencingNodes;
        var referencedNodes;
        var index;
        var refNode;
        var reverseReference;
        var numberOfReferencingNodes;
        var reverseOrderedRefs_length = reverseOrderedRefs.length;
        for (var i = 0; i < reverseOrderedRefs_length; i += 1) {
            reverseReference = reverseOrderedRefs[i];
            referencingNodes = node.getReverseOrderedReferences(reverseReference);
            numberOfReferencingNodes = referencingNodes.length;
            for (var j = 0; j < numberOfReferencingNodes; j += 1) {
                refNode = referencingNodes[j];
                referencedNodes = refNode.getOrderedReference(reverseReference);
                index = $.inArray(node, referencedNodes);
                refNode.removeOrderedReference(reverseReference, index);
            }
        }
    };

    var removeAllStringAttributes = function (node) {
        var stringAttributes = node.listStringAttributes();
        var stringAttributeValue;
        for (var i = 0; i < stringAttributes.length; i += 1) {
            stringAttributeValue = node.getStringAttribute(stringAttributes[i]);
            node.removeFromStringAttribute(stringAttributes[i], stringAttributeValue, 0);
        }
    };

    var deleteNodeInternal = function (identity) {
        if (!nodes[identity]) {
            throw "Model does not contain a node " + identity;
        }

        var node = nodes[identity];
        var attributeNames;
        var attributeName;
        var attributeValues = {};
        var attributeNames_length;
        removeAllAtomicReferences(node);
        removeAllReverseAtomicReferences(node);
        removeAllOrderedReferences(node);
        removeAllReverseOrderedReferences(node);
        removeAllStringAttributes(node);

        attributeNames = node.listAttributes();
        attributeNames_length = attributeNames.length;
        for (var i = 0; i < attributeNames_length; i += 1) {
            attributeName = attributeNames[i];
            attributeValues[attributeName] = node.getAttribute(attributeName);
        }
        return removeNodeInternal(identity, attributeValues);
    };

    /**
     * The model exposes a number of operations to control the complex operation
     * demarcation boundaries and performing atomic operations on model level
     * (such as adding and removing objects).
     */
    var public_model = {

        /**
         * Retrieves an model object entity by its unique identity.
         *
         * @param identity
         *            is the unique key (a string) of the object that is being
         *            looked up.
         * @return the object having the given identity or undefined if no such
         *         object exists in the model.
         */
        getNode: function (identity) {
            return nodes && nodes[identity];
        },

        /**
         * Lists all node identities within the model.
         *
         * @return an array containing all nodes identities in this model.
         */
        listNodes: function () {
            var result = [];
            for (var object in nodes) {
                if (nodes.hasOwnProperty(object)) {
                    result.push(object);
                }
            }
            return result;
        },

        /**
         * Adds an empty object having the given identity to the model. This
         * method will automatically add the corresponding simple operation to
         * the operations queue (or the currently open complex operation
         * therein).
         *
         * @param identity
         *            is the unique identity to the to-be-added object. If
         *            undefined, a unique identifier will automatically be
         *            assigned.
         * @param attribute_values
         *              optional map of attribute value pairs to be set
         * @param atomic_references
         *              optional map of atomic reference and node pairs to be set
         * @return the object instance that was added to the model.
         */
        addNode: function (identity, attribute_values) {
            checkLockedByModelHandler();

            // Id's generated are not bpmn compliant as they start with a digit.
            // Appending an alphabet to make it bpmn compliant

            identity = identity || "A" + uuid.v4();

            addNodeInternal(identity, copy(attribute_values));

            return this.getNode(identity);
        },

        /**
         * Removes the object with the given identity from the model. This
         * method will automatically add the corresponding simple operation to
         * the operations queue (or the currently open complex operation
         * therein).
         *
         * @param identity
         *            is the identity of the node that is to be removed.
         * @param attribute_values
         *            a map of attribute value pairs that this node currently has
         *            and which must be removed prior to removing this node.
         *            This parameter is optional with the empty map as default.
         */
        removeNode: function (identity, attribute_values) {
            checkLockedByModelHandler();
            attribute_values = (attribute_values || {});
            removeNodeInternal(identity, copy(attribute_values));
        },

        /**
         * Removes all attribute values, all atomic or ordered references to and from this node
         * and finally removes the node itself.
         * @param identity  is the identity of the node that is to be removed.
         */
        deleteNode: function (identity) {
            checkLockedByModelHandler();
            deleteNodeInternal(identity);
        },


        /**
         * Registers a model listener object, providing a number of optional callback
         * methods that get invoked on various model changes:
         * <ul>
         * <li>nodeAdded(object, attributeValues)</li>
         * <li>nodeRemoved(object, attributeValues)</li>
         * <li>attributeSet(object, attributeName, value, oldValue)</li>
         * <li>atomicReferenceSet(sourceObject, referenceName, targetObject, oldTargetObject)</li>
         * <li>orderedReferenceAdded(sourceObject, referenceName, index,
         * target_object)</li>
         * <li>orderedReferenceRemoved(sourceObject, referenceName, index,
         * targetObject)</li>
         * <li>stringInserted(object, attributeName, string, position)</li>
         * <li>stringRemoved(object, attributeName, string, position)</li>
         * </ul>
         *
         * @param listener
         *            is the object providing various callback methods for model
         *            change notification.
         */
        addModelListener: function (listener) {
            listeners.register(listener);
        },

        /**
         * Unregisters a model listener object, providing a number of callback
         * methods that get invoked on various model changes.
         *
         * @param listener
         *            is the object providing various callback methods for model
         *            change notification.
         */
        removeModelListener: function (listener) {
            listeners.unregister(listener);
        },

        /**
         * Clears the model, i.e., removes all nodes, which become unusable and any references to nodes have to be dropped.
         */
        clear: function () {
            checkLockedByModelHandler();
            for (var nodeId in nodes) {
                if (nodes.hasOwnProperty(nodeId)) {
                    deleteNodeInternal(nodeId);
                }
            }
        }

    };

    return public_model;
};
(function () {
    /***
     * MODIFIED
     * **** BEGIN ****
     * Add lockedByModelHandler parameter to fix bug preventing from using two models at the same time
     */
    var Node = function (identity, changeListener, lockedByModelHandler) {

        // store node identity
        this.identity = identity;
        this.listener = changeListener;
        // associative arrays (aka objects) for storing the attributes and
        // atomic/ordered references, respectively
        this.attributes = {};
        this.atomic_references = {};
        this.atomic_reverse_references = {};
        this.ordered_references = {};
        this.ordered_reverse_references = {};
        //accociative array (aka objects) for storing the string attributes
        this.stringAttributes = {};

        this.checkLockedByModelHandler = function () {
            if (lockedByModelHandler()) {
                throw "Model: cannot be manipulated outside ModelHandler.changeModel().";
            }
        };
    };
    /***
     * MODIFIED
     * **** END ****
     */

    Node.prototype = (function () {

        /**
         * Replaces the current value of the given attribute with a new value.
         *
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the updated attribute.
         * @param value
         *            is the value replacing the current value.
         * @param notify_listener {Boolean}
         *            whether or not to notify any listeners.
         *            This parameter is optional and its default value is "true".
         * @return the operation ready to be enqueued
         * @member sap.galilei.gravity.model-Node
         */

        var setAttributeInternal = function (that, name, value, notify_listener) {
            var old_value = that.attributes[name];
            notify_listener = (notify_listener === undefined) ? true : notify_listener;
            if (value === undefined) {
                delete that.attributes[name];
            } else {
                that.attributes[name] = value;
            }
            if (notify_listener) {
                that.listener.attributeSet(that, name, old_value, value);
            }
        };

        var addReverseReference = function (referenceName, referencing_node, reverse_references) {
            if (!reverse_references[referenceName]) {
                reverse_references[referenceName] = [];
            }
            reverse_references[referenceName].push(referencing_node);
        };

        var removeReverseReference = function (reference_name, referencing_node, reverse_references) {
            var referencing_nodes = reverse_references[reference_name];
            var referencing_node_pos = $.inArray(referencing_node, referencing_nodes);
            referencing_nodes.splice(referencing_node_pos, 1);
            // clean up
            if (referencing_nodes.length === 0) {
                delete reverse_references[reference_name];
            }
        };

        /**
         * Sets the given atomic reference ("rewires") to a new target object.
         * Please notice that this method must not be called for list-valued
         * (ordered) references!
         *
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the atomic reference.
         * @param target
         *            is the target object replacing the old target.
         * @return the operation ready to be enqueued
         * @member sap.galilei.gravity.model-Node
         */
        var setAtomicReferenceInternal = function (that, name, target) {
            var old_target_id;
            var new_target_id;
            var old_target = that.atomic_references[name];

            if (old_target !== undefined) {
                old_target_id = old_target.getIdentity();
                removeReverseReference(name, that, old_target.atomic_reverse_references);
            }

            if (target === undefined) {
                delete that.atomic_references[name];
            } else {
                that.atomic_references[name] = target;
                new_target_id = target.getIdentity();
                addReverseReference(name, that, target.atomic_reverse_references);
            }

            that.listener.atomicReferenceSet(that, name, old_target, target);
        };

        /**
         * Adds ("wires") a reference to some target object to a list-valued
         * (ordered) reference at the given list index. When order does not
         * matter, it is usually a good idea to add references at an index of 0.
         *
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the list-valued reference attribute.
         * @param index
         *            is the list index at which to add the target object.
         * @param target
         *            is the target model object to which the reference (at this
         *            index) points to.
         * @return the operation ready to be enqueued
         * @member sap.galilei.gravity.model-Node
         */
        var addOrderedReferenceInternal = function (that, name, index, target) {
            that.ordered_references[name] = that.ordered_references[name] || [];

            if (that.ordered_references[name].length < index) {
                throw "Cannot add ordered reference " + name + " at index " + index + " beyond length " +
                    that.ordered_references[name].length + ".";
            }
            /*MODIFIED
             * **** BEGIN ****/
            if (index === -1) {
                index = that.ordered_references[name].length;
                that.ordered_references[name].push(target);
            } else {
                that.ordered_references[name].splice(index, 0, target);
            }
            /*MODIFIED
             * **** END ****/

            addReverseReference(name, that, target.ordered_reverse_references);
            that.listener.orderedReferenceAdded(that, name, index, target);
        };

        /**
         * Removes ("unwires") a reference to some target object from a
         * list-valued (ordered) reference at the given list index.
         *
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the reference attribute.
         * @param indexOrObject
         *            is the integer index in the list-valued reference from
         *            where to remove the target or the object itself that
         *            should be removed from the list
         * @return the operation ready to be enqueued
         * @member sap.galilei.gravity.model-Node
         */
        var removeOrderedReferenceInternal = function (that, name, indexOrObject) {
            var array = that.ordered_references[name] || [];
            if (typeof (indexOrObject) !== "number") {
                var length = array.length;
                for (var i = 0; i < length; i += 1) {
                    if (array[i] === indexOrObject) {
                        indexOrObject = i;
                        break;
                    }
                }
            }

            var target = array[indexOrObject];

            if (target === undefined) {
                throw "Cannot remove non-existent ordered reference " + name + " from index " + indexOrObject + ".";
            }
            array.splice(indexOrObject, 1);
            removeReverseReference(name, that, target.ordered_reverse_references);

            // some cleanup
            if (array.length === 0) {
                delete that.ordered_references[name];
            }

            that.listener.orderedReferenceRemoved(that, name, indexOrObject, target);
        };


        /**
         * Inserts a substring into the substring attribute designated by string at the specified position.
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the string attribute.
         * @param string
         *            is the substring to be inserted.
         * @param position
         *            is the position where the substring shall be inserted (starting with 0)
         * @member sap.galilei.gravity.model-Node
         */
        var insertIntoStringAttributeInternal = function (that, name, string, position) {
            if (typeof(string) !== "string") {
                throw "Only strings can be inserted!";
            }

            //check whether empty string shall be inserted
            if (string.length === 0) {
                throw "Empty string cannot be inserted!";
            }

            var currentStringValue;
            var newStringValue;

            currentStringValue = that.stringAttributes[name] || "";

            //check whether insertion position is valid
            if (position > currentStringValue.length || position < 0) {
                throw "Insertion index out of bounds!";
            }

            //generate and set new string value
            var head = currentStringValue.substring(0, position);
            var tail = currentStringValue.substring(position);
            newStringValue = head + string + tail;
            that.stringAttributes[name] = newStringValue;

            //notify the listeners
            that.listener.stringInserted(that, name, string, position);
        };

        /**
         * Removes a substring from the substring attribute designated by position and endpos.
         * @param that
         *            is the reference to the instance (in order to access the
         *            identity, attributes, ...)
         * @param name
         *            is the name of the string attribute
         * @param string
         *            is the substring to be removed
         * @param position
         *            is the position where the removal shall start
         * @member com.sap.graavity.model-Node
         */
        var removeFromStringAttributeInternal = function (that, name, string, position) {
            var currentStringValue;
            var newStringValue;

            currentStringValue = that.stringAttributes[name];

            //check whether specified string attribute exists
            if (currentStringValue === undefined) {
                throw "String attribute undefined!";
            }

            //check whether empty string shall be remove
            if (string.length === 0) {
                throw "Empty string cannot be removed!";
            }

            //check whether the removal borders are valid
            if (position < 0 || position + string.length > currentStringValue.length) {
                throw "Removal index out of bounds!";
            }

            //check whether the substring to be removed equals the substring in the model
            var actualSubString = currentStringValue.slice(position, position + string.length);
            if (actualSubString !== string) {
                throw "Substring to be removed '" + string + "' does not match the substring in the model '" + actualSubString + "'.";
            }

            //generate and set new string value
            var head = currentStringValue.substring(0, position);
            var tail = currentStringValue.substring(position + string.length);
            newStringValue = head + tail;
            if (newStringValue === "") {
                delete that.stringAttributes[name];
            } else {
                that.stringAttributes[name] = newStringValue;
            }

            //notify the listeners
            that.listener.stringRemoved(that, name, string, position);
        };


        /** @lends sap.galilei.gravity.model-Node */
        return {
            constructor: Node,
            /**
             * Retrieves the object identifier of this object.
             *
             * @return the object identifier.
             */
            getIdentity: function () {
                return this.identity;
            },

            /**
             * Retrieves the value for the given attribute name.
             *
             * @param name
             *            is the name of the attribute.
             * @return the value of the attribute of {@literal undefined} if no
             *         such attribute exists.
             */
            getAttribute: function (name) {
                return this.attributes[name];
            },

            /**
             * Lists the attributes of this object.
             *
             * @return an array containing all attribute names of this object.
             */
            listAttributes: function () {
                var result = [];
                for (var name in this.attributes) {
                    if (this.attributes.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Removes an attribute from this object which semantically
             * corresponds replacing the current attribute value with
             * {@literal undefined}. This method will automatically add the
             * corresponding simple operation to the operations queue (or the
             * currently open complex operation therein).
             *
             * @param name
             *            is the name of the to-be-removed attribute.
             * @param notify_listener {Boolean}
             *            whether or not to notify any listeners.
             *            This parameter is optional and its default value is "true".
             */
            deleteAttribute: function (name, notify_listener) {
                this.setAttribute(name, undefined, notify_listener);
            },

            /**
             * Replaces the current value of the given attribute with a new
             * value. This method will automatically add the corresponding
             * simple operation to the operations queue (or the currently open
             * complex operation therein).
             *
             * @param name
             *            is the name of the updated attribute.
             * @param value
             *            is the value replacing the current value.
             * @param notify_listener {Boolean}
             *            whether or not to notify any listeners.
             *            This parameter is optional and its default value is "true".
             */
            setAttribute: function (name, value, notify_listener) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */

                setAttributeInternal(this, name, value, notify_listener);
            },

            /**
             * Retrieves the target object for the given atomic reference name.
             *
             * @param {String}
             *            name is the name of the atomic reference.
             * @return {Object} the target node of this reference or
             * @type{undefined} if no such reference exists.
             */
            getAtomicReference: function (name) {
                return this.atomic_references[name];
            },

            /**
             * @param name the name of the atomic reference to navigate in reverse direction
             * @return Array containing objects that reference this node using the specified reference
             * Note: nodes in the array are in no particular order!
             */
            getReverseAtomicReferences: function (name) {
                if (this.atomic_reverse_references[name]) {
                    return this.atomic_reverse_references[name].slice(0);
                } else {
                    return [];
                }
            },

            /**
             * @param name the name of the atomic reference to navigate in reverse direction
             * @return Array containing objects that reference this node using the specified reference.
             * Note: nodes in the array are in no particular order!
             */
            getReverseOrderedReferences: function (name, index) {
                if (this.ordered_reverse_references[name]) {
                    return (index !== undefined && this.ordered_reverse_references[name][index]) || this.ordered_reverse_references[name].slice(0);
                } else {
                    return undefined ? undefined : [];
                }
            },

            /**
             * Retrieves the target object array for the given ordered reference
             * name.
             *
             * @param {String}
             *            name is the name of the ordered reference.
             * @return {Array} is the array of target nodes of this reference of
             * @type{undefined} if no such reference exists.
             */
            getOrderedReference: function (name, index) {
                if (this.ordered_references[name]) {
                    return (index !== undefined && this.ordered_references[name][index]) || this.ordered_references[name].slice(0);
                } else {
                    return index !== undefined ? undefined : [];
                }
            },

            /**
             * Lists the atomic references of this node.
             *
             * @return {Array} an array of all atomic reference names for this
             *         object.
             */
            listAtomicReferences: function () {
                var result = [];
                for (var name in this.atomic_references) {
                    if (this.atomic_references.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Lists the atomic references pointing to this node.
             *
             * @return {Array} an array of all atomic reference names for this
             *         object.
             */
            listReverseAtomicReferences: function () {
                var result = [];
                for (var name in this.atomic_reverse_references) {
                    if (this.atomic_reverse_references.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Lists the ordered references of this node.
             *
             * @return {Array} an array of all ordered reference names for this
             *         node.
             */
            listOrderedReferences: function () {
                var result = [];
                for (var name in this.ordered_references) {
                    if (this.ordered_references.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Lists the ordered references pointing to this node.
             *
             * @return {Array} an array of all ordered reference names pointing to this
             *         node.
             */
            listReverseOrderedReferences: function () {
                var result = [];
                for (var name in this.ordered_reverse_references) {
                    if (this.ordered_reverse_references.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Sets the given atomic reference ("rewires") to a new target
             * object. Please notice that this method must not be called for
             * list-valued (ordered) references! This method will automatically
             * add the corresponding simple operation to the operations queue
             * (or the currently open complex operation therein).
             *
             * @param name
             *            is the name of the atomic reference.
             * @param target
             *            is the target object replacing the old target.
             */
            setAtomicReference: function (name, target) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */
                setAtomicReferenceInternal(this, name, target);
            },

            /**
             * Removes an atomic reference from this object which semantically
             * corresponds replacing the current reference target with
             *
             * @type{undefined}. This method will automatically add the
             *                   corresponding simple operation to the
             *                   operations queue (or the currently open complex
             *                   operation therein).
             * @param name
             *            is the name of the to-be-removed reference.
             */
            deleteAtomicReference: function (name) {
                setAtomicReferenceInternal(this, name, undefined);
            },

            /**
             * Adds ("wires") a reference to some target object to a list-valued
             * (ordered) reference at the given list index. When order does not
             * matter, it is usually a good idea to add references at an index
             * of 0. This method will automatically add the corresponding simple
             * operation to the operations queue (or the currently open complex
             * operation therein).
             *
             * @param name
             *            is the name of the list-valued reference attribute.
             * @param index
             *            is the list index at which to add the target object.
             * @param target
             *            is the target model object to which the reference (at
             *            this index) points to.
             */
            addOrderedReference: function (name, index, target) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */
                addOrderedReferenceInternal(this, name, index, target);
            },

            /**
             * Removes ("unwires") a reference to some target object from a
             * list-valued (ordered) reference at the given list index. This
             * method will automatically add the corresponding simple operation
             * to the operations queue (or the currently open complex operation
             * therein).
             *
             * @param name
             *            is the name of the reference attribute.
             * @param index
             *            is the integer index in the list-valued reference from
             *            where to remove the target.
             */
            removeOrderedReference: function (name, index) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */
                removeOrderedReferenceInternal(this, name, index);
            },


            /**
             * Inserts a substring into the substring attribute designated by string at the specified position.
             * This method will automatically add the corresponding simple operation
             * to the operations queue (or the currently open complex operation
             * therein).
             * Note that string-valued attributes are disjoint from the other attributes, i.e. the same attribute
             * names can be used for both kinds of attributes without overwriting each other's values.
             * @param {String} name
             *            is the name of the string attribute.
             * @param {String} string
             *            is the substring to be inserted.
             * @param {Number} position
             *            is the position where the substring shall be inserted (starting with 0)
             */
            insertIntoStringAttribute: function (name, string, position) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */
                insertIntoStringAttributeInternal(this, name, string, position);
            },

            /**
             * Removes a substring from the substring attribute designated by position and endpos.
             * This method will automatically add the corresponding simple operation
             * to the operations queue (or the currently open complex operation
             * therein).
             * Note that string-valued attributes are disjoint from the other attributes, i.e. the same attribute
             * names can be used for both kinds of attributes without overwriting each other's values.
             * @param {String} name
             *            is the name of the string attribute
             * @param {Number} string
             *            is the substring to be removed
             * @param {Number} position
             *            is the position where the removal shall start
             */
            removeFromStringAttribute: function (name, string, position) {
                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * use checkLockedByModelHandler on current instance to avoid static varriable issue when using two models at the same time
                 */
                this.checkLockedByModelHandler();
                /***
                 * MODIFIED
                 * **** END ****
                 */
                removeFromStringAttributeInternal(this, name, string, position);
            },

            /**
             * Lists the string attributes of this object.
             * @return an array containing all string attribute names of this object.
             */
            listStringAttributes: function () {
                var result = [];
                for (var name in this.stringAttributes) {
                    if (this.stringAttributes.hasOwnProperty(name)) {
                        result.push(name);
                    }
                }
                return result;
            },

            /**
             * Retrieves the value for the given string attribute name.
             * @param name
             *            is the name of the string attribute.
             * @return the value of the attribute
             *            {@literal undefined} if no such attribute exists.
             */
            getStringAttribute: function (name) {
                return this.stringAttributes[name];
            }
        };
    }());

    this.sap.galilei.gravity.createNode = function (identity, attribute_values, changeListener, lock) {
        attribute_values = attribute_values || {};

        /***
         * MODIFIED
         * **** BEGIN ****
         * use new parameter on Node constructor to avoir issue when using two models at the same time.
         */
        if (typeof (lock) !== "function") {
            lock = function () {
                return false;
            };
        }

        var node = new Node(identity, changeListener, lock);
        /***
         * MODIFIED
         * **** END ****
         */

        var notify_listener = false;
        for (var attr in attribute_values) {
            if (attribute_values.hasOwnProperty(attr)) {
                node.setAttribute(attr, attribute_values[attr], notify_listener);
            }
        }
        return node;
    };

}());
/**
 * Handles all operations applied to the model be it remote or local operations.
 */
this.sap.galilei.gravity.createModelHandler = function (configuration) {

    var execution_history;

    var original_history;

    var transformer = sap.galilei.gravity.createTransformer(configuration);

    var generator;

    var initialized = false;

    var client_offset = -1;

    var timestamp = [];

    var logger = sap.galilei.gravity.getLogger("ModelHandler");

    var pendingOperationsQueue;

    var executing = false;

    var readOnly = false;

    var modelLock = function () {
        return !executing;
    };

    var model = sap.galilei.gravity.createModel(modelLock);
    var annotatingModel = sap.galilei.gravity.createAnnotatingModelWrapper(model);
    var participantId;
    var bufferedListener = sap.galilei.gravity.createBufferedModelListener();
    model.addModelListener(bufferedListener);

    var undoHandler;

    var changeModelRecursions = 0;

    var recoredCollisions = [];

    var reportException = function (exception) {
        logger.error(exception);
        if (console && console.trace) {
            console.trace();
        }
        throw exception;
    };

    var panic = function (exception) {
        logger.fatal(exception);
        if (console && console.trace) {
            console.trace();
        }
        sap.galilei.gravity.panic();
    };

    var updateHistory = function (complexOperation) {
        if (complexOperation === undefined || complexOperation.getPrimitiveOps().length === 0) {
            return;
        }

        original_history.addOperation(complexOperation);
        original_history.commit();
        execution_history.addOperation(complexOperation);
        pendingOperationsQueue.addOperation(complexOperation);
        pendingOperationsQueue.notifyOnQueueChange();
        timestamp = execution_history.getTimestamp();
    };


    var replayRedoLog = function (redoLog) {
        var redoLogLength = redoLog.length;
        var operation;
        model.clear();
        for (var i = 0; i < redoLogLength; i += 1) {
            operation = redoLog[i];
            try {
                operation.materialize(model);
            } catch (e) {
                logger.error("Exception while replaying the redolog: " + e);
                panic(e);
            }
        }
    };

    var startExecution = function () {
        executing = true;
    };

    var endExecution = function () {
        executing = false;
    };

    var registerCallback = function (complexOperation, callbackName, callback) {
        if (callback && typeof (callback) === "function") {
            if (complexOperation) {
                var callbacks = complexOperation[callbackName];
                if (callbacks === undefined) {
                    callbacks = [];
                    complexOperation[callbackName] = callbacks;
                }
                callbacks.push(callback);
            } else if (callbackName === "onAcknowledge") {
                // if complex operation was a no-op, we can instantly call the
                // acknowledgement callback (in case the editor relies on it)
                callback();
            }
        }
    };

    var notifyCallback = function (complexOperation, callbackName) {
        var callbacks = complexOperation[callbackName] || [];
        $.each(callbacks, function (index, callback) {
            if (callback !== undefined && typeof (callback) === "function") {
                try {
                    callback();
                } catch (e) {
                    logger.error("Error while executing function '" + callback + "' registered on " + callbackName + "' callback:\n" + e);
                }
            }
        });
    };

    var doSanityCheck = function (remote_operation) {
        var exception;
        /*
         * Check whether the remote_operation has a time stamp prior or equal to
         * local model's time stamp. If that isn't checked here, the
         * transformation fails later on with a rather cyptic error message.
         */
        if (sap.galilei.gravity.strictlyPrior(timestamp, remote_operation.getContext())) {
            exception = "Operation '" + remote_operation.toString() + "' cannot be transformed " +
                "and applied to the local model as its context vector '" +
                remote_operation.getContext() + "' is newer than the time stamp of the local model " +
                "which is '" + timestamp + "'." + " Are you sure you are not missing operations?";
            panic(exception);
        }

        if (sap.galilei.gravity.prior(remote_operation.timestamp(), timestamp)) {
            exception = "Operation '" + remote_operation.toString() + "' with time stamp '" +
                remote_operation.timestamp() + "' is already included in the local model " +
                "which has timestamp '" + timestamp + "'.";
            panic(exception);
        }

        /*
         * check whether the history covers the period required for the
         * transformation. If not, the operation cannot be transformed
         */
        if (sap.galilei.gravity.strictlyPrior(remote_operation.getContext(), original_history.getMinimumTimestamp())) {
            exception = "Operation '" + remote_operation.toString() + "' cannot be transformed and applied " +
                "to the local model as its context vector '" + remote_operation.getContext() +
                "' is not covered by the history, which only goes back until '" + original_history.getMinimumTimestamp() + "'.";
            panic(exception);
        }
    };

    var recordCollisions = function (acceptedOperation, rejectedOperation) {
        recoredCollisions.push(rejectedOperation);
    };

    var notifyCollisions = function () {
        $(recoredCollisions).each(function (i, collision) {
            notifyCallback(collision, "onCollision");
        });
        recoredCollisions = [];
    };

    var rollback = function () {
        var rollbackOperation = generator.getGeneratedComplexOperation().inverse();
        var op;
        var inverseOps = rollbackOperation.getPrimitiveOps();
        var length = inverseOps.length;

        for (var i = 0; i < length; i += 1) {
            op = inverseOps[i];
            op.materialize(model);
        }

        timestamp = execution_history.getTimestamp();
    };

    var prepareForModelChanges = function (description) {
        if (changeModelRecursions === 0) {
            startExecution();
            generator.startGenerating(timestamp, description);
        }
        changeModelRecursions += 1;
    };

    var finalizeModelChange = function () {
        var complexOp;
        changeModelRecursions -= 1;
        if (changeModelRecursions === 0) {
            endExecution();
            generator.stopGenerating();
            complexOp = generator.getGeneratedComplexOperation();
            updateHistory(complexOp);
        } else {
            complexOp = generator.getGeneratedComplexOperation();
        }
        if (complexOp === undefined || complexOp.getPrimitiveOps().length === 0) {
            return undefined;
        }
        return complexOp;
    };

    var markLocalParticipantAsActive = function () {
        var participant = model.getNode(participantId);
        if (participant) {
            participant.setAttribute("active", true);
        }
    };

    var applyModelChanges = function (command, description) {
        var complexOp;
        prepareForModelChanges(description);
        try {
            command(annotatingModel);
            markLocalParticipantAsActive();
        } catch (e) {
            logger.error("Error while executing command '" + description + "':\n" +
                e + "\n" + "All previous operations are rolled back. ");
            rollback();
            generator.startGenerating(timestamp, description);
        } finally {
            complexOp = finalizeModelChange();
        }

        return complexOp;
    };

    var changeModelInternal = function (command, description) {
        var checkInput = function (command, description) {
            if (!command || typeof (command) !== "function") {
                reportException("command must be a function!");
            }
            if (!initialized) {
                reportException("ModelHandler is not initialized. Please initialize it before manipulating the model.");
            }
        };
        var checkSanity = function () {
            if (!sap.galilei.gravity.equals(execution_history.getTimestamp(), original_history.getMaximumTimeStamp())) {
                panic("Timestamps between execution history" +
                    " and original history have diverged: " +
                    "[" + timestamp + "] vs " +
                    "[" + original_history.getMaximumTimeStamp() + "].");
            }
        };
        var createSubscriptionObject = function (complexOp) {
            return {
                onAcknowledge: function (onAcknowledge) {
                    registerCallback(complexOp, "onAcknowledge", onAcknowledge);
                },
                onCollision: function (onCollision) {
                    registerCallback(complexOp, "onCollision", onCollision);
                }
            };
        };

        checkInput(command, description);
        logger.info("Performing local changes '" + description + "'.");
        var complexOp = applyModelChanges(command, description);
        logger.info("Model time stamp is [" + execution_history.getTimestamp() + "].");
        checkSanity();
        bufferedListener.notifyListeners();
        return createSubscriptionObject(complexOp);
    };

    var initializeInternal = function (clientOffset, initialTimestamp, redoLog, read_only) {
        var initializeHelper = function () {
            transformer.addOnCollisionCallback(recordCollisions);
            generator = sap.galilei.gravity.createOperationGenerator(model, client_offset);
            original_history = sap.galilei.gravity.createWorkload(timestamp);
            execution_history = sap.galilei.gravity.createExecutionHistory(timestamp);
            pendingOperationsQueue = sap.galilei.gravity.createQueue(timestamp);
            pendingOperationsQueue.addOnAcknowledge(function (op) {
                notifyCallback(op, "onAcknowledge");
            });
            undoHandler = sap.galilei.gravity.createUndoRedoHandler(changeModelInternal, transformer, original_history, execution_history);
        };

        readOnly = !!read_only; // force boolean
        initialized = true;
        client_offset = clientOffset;
        timestamp = [];

        startExecution();
        replayRedoLog(redoLog);
        endExecution();

        timestamp = initialTimestamp.slice(0);
        initializeHelper();
        bufferedListener.notifyListeners();
    };


    var externalInterface = {};
    var internalInterface = {
        applyRemoteOperation: function (remoteOperation) {
            logger.info("Applying remote operation '" + (remoteOperation.description || '') + "' " +
                "with context [" + remoteOperation.getContext() + "] " +
                "and timestamp [" + remoteOperation.timestamp() + "].");
            doSanityCheck(remoteOperation);
            // TODO refactor this!
            var client_configuration = {
                model: model,
                original_history: original_history,
                execution_history: execution_history,
                pending_operations_queue: pendingOperationsQueue,
                client_offset: client_offset
            };

            startExecution();
            transformer.ecot(remoteOperation, client_configuration);
            endExecution();

            timestamp = execution_history.getTimestamp();
            pendingOperationsQueue.notifyOnQueueChange();
            logger.info("new timestamp = [" + timestamp + "]");
            if (!sap.galilei.gravity.equals(timestamp, original_history.getMaximumTimeStamp())) {
                panic("Timestamps between execution history and original history have diverged:" +
                    " [" + timestamp + "] vs [" + original_history.getMaximumTimeStamp() + "].");
            }
            bufferedListener.notifyListeners();
            notifyCollisions();
        },

        collectGarbage: function (timestamp) {
            logger.info("Garbage-collecting operations with a timestamp prior to (" + timestamp + ").");
            execution_history.collectGarbage(timestamp);
            original_history.collectGarbage(timestamp);
            transformer.getCache().collectGarbage(timestamp);
        },

        getModelTimestamp: function () {
            return execution_history.getTimestamp();
        },

        /**
         * Initializes this ModelHandler
         *
         * @param clientOffset the clientOffset assigned to the client
         * @param initialTimestamp the initial timestamp of the model
         * @param redoLog the sequence of operations to be applied in order to restore the model
         * @param read_only whether or not the model can be changed.
         */
        initialize: function (clientOffset, initialTimestamp, redoLog, read_only) {
            var checkInitializeInput = function (clientOffset, initialTimestamp, redoLog) {
                if (clientOffset === undefined || clientOffset < 0) {
                    reportException("ClientOffset must be >= 0!");
                }
                if (!$.isArray(initialTimestamp)) {
                    reportException("InitialTimestamp must be an array!");
                }
                if (!$.isArray(redoLog)) {
                    reportException("RedoLog must be an array!");
                }
            };

            checkInitializeInput(clientOffset, initialTimestamp, redoLog);
            logger.info("Initializing with client offset = '" + clientOffset +
                "' and time stamp '" + initialTimestamp + "'");
            initializeInternal(clientOffset, initialTimestamp, redoLog, read_only);
            logger.info("initialized");
        },

        /**
         * Whether or not this ModelHandler is initialized.
         */
        isInitialized: function () {
            return initialized;
        },

        /**
         *
         * @returns {Boolean} whether or not the model is read only
         */
        isReadOnly: function () {
            return readOnly;
        },

        /***
         * MODIFIED
         * **** BEGIN ****
         * Add an isProtectedFromUndo parameter that allows to execute an action without taking it into account in the undo/redo
         */

        /**
         * Performs changes to the model. Therefore, it takes a function that
         * manipulates the model, which is passed into the function.
         *
         * @param command
         *            function that takes a model and perform changes on it.
         *            E.g. manipulateModel(function (model) {
         *            model.addNode(...); ... });
         * @param description
         *            an optional string describing the changes performed to the
         *            model by the command
         * @param isProtectedFromUndo
         *            an optional boolean indicating if the operation can be undone
         * @returns Returns an object which can be used to register callbacks in
         *          order to be notified for acknowledgment of the performed
         *          change or collision involving the performed change. To
         *          register for acknowledgment call onAcknowledge(callback) on
         *          the result. To register for collisions, call
         *          onCollision(callback) on the result.
         */
        changeModel: function (command, description, isProtectedFromUndo, isNested) {
            var operationIndex,
                changeHandle,
                operation,
                model = this.getModel(),
                topLevelProtectedFromUndoCommand,
                topLevelNestedTransactionCommand;

            if (readOnly) {
                throw "Model cannot be changed as it is read-only.";
            }

            if (isProtectedFromUndo === true) {
                try {
                    if (isNested !== true) {
                        startExecution();
                    }

                    if (model && model.isProtectedFromUndo === undefined) {
                        topLevelProtectedFromUndoCommand = command;
                        model.isProtectedFromUndo = true;
                    }
                    command(model);
                    if (isNested !== true) {
                        endExecution();
                    }
                    bufferedListener.notifyListeners();
                } finally {
                    if (model && topLevelProtectedFromUndoCommand === command) {
                        delete model.isProtectedFromUndo;
                    }
                }
            } else {
                if (isNested === true && sap.galilei.gravity.nestedTransactionDescription === undefined) {
                    topLevelNestedTransactionCommand = command;
                    sap.galilei.gravity.nestedTransactionDescription = description;
                }
                operationIndex = execution_history.size();
                changeHandle = changeModelInternal(command, description);
                operation = execution_history.getOperation(operationIndex);
                undoHandler.makeUndoable(operation, changeHandle);
                if (sap.galilei.gravity.nestedTransactionDescription && topLevelNestedTransactionCommand === command) {
                    delete sap.galilei.gravity.nestedTransactionDescription;
                }
            }

            return changeHandle;
        },

        /***
         * MODIFIED
         * **** END ****
         */

        /**
         * Undo the last change that was applied to the model with changeModel(), provided that
         * no other client in the collaboration has modified anything that was changed with said change.
         * @returns true if the undo operation succeeded, false otherwise
         */
        undoChange: function () {
            return undoHandler.undo();
        },

        /**
         * Redo the last change that was reverted with undoChange() if possible.
         * @returns true if the redo operation succeeded, false otherwise
         */
        redoChange: function () {
            return undoHandler.redo();
        },

        /***
         * MODIFIED
         * **** BEGIN ****
         * Add canUndoChange and canRedoChangeMethod
         */

        canUndoChange: function () {
            return undoHandler.canUndo();
        },

        canRedoChange: function () {
            return undoHandler.canRedo();
        },

        /***
         * MODIFIED
         * **** END ****
         */

        protectAgainstUndo: function () {
            undoHandler.protectAgainstUndo();
        },

        /**
         * Returns the queue of complex operations pending acknowledgment. To
         * remove operations from the queue, they must be acknowledged.
         *
         */
        getOperationsQueue: function () {
            return pendingOperationsQueue;
        },

        /**
         * Returns the model. Please note, that the model cannot be manipulated
         * directly. All changes have to be performed by a function which is
         * passed into the changeModel() method.
         *
         * @returns the model handled by this model handler
         */
        getModel: function () {
            return model;
        },

        /**
         * resets the ModelHandler and the model. In order to reuse the
         * ModelHandler, it has to be initialized again. This function also
         * clears the model
         */
        reset: function () {
            initialized = false;
            startExecution();
            model.clear();
            endExecution();
            bufferedListener.notifyListeners();
        },
        /**
         * Adds a listener to be notified upon changes to the model.
         *
         * @param listener
         * @returns
         */
        addModelListener: function (listener) {
            bufferedListener.addModelListener(listener);
        },
        /**
         * Removes a listener. It will no longer receive changes made to the model.
         * @param listener
         * @returns
         */
        removeModelListener: function (listener) {
            bufferedListener.removeModelListener(listener);
        },
        /**
         * Directly applies an operation to the model without transformation,
         * update of the model state or notification of the client. ModelListener, however, are notified.
         * Note: This only meant to be used by the ReplayHandler!
         * @param complexOp
         * @returns
         */
        directlyApplyToModel: function (operation) {
            startExecution();
            try {
                operation.materialize(model);
            } finally {
                endExecution();
                bufferedListener.notifyListeners();
            }
        },
        /**
         *
         * @returns the external interface of the model handler.
         */
        getExternalInterface: function () {
            return externalInterface;
        },
        /**
         * Sets the node representing the local participant. This is used for annotating
         * model changes and marking participants as active after a successful change.
         * @param node the node representing the local participant.
         */
        setLocalParticipantId: function (id) {
            participantId = id;
            annotatingModel.setParticipantId(id);
        }
    };

    externalInterface.changeModel = internalInterface.changeModel;
    externalInterface.isInitialized = internalInterface.isInitialized;
    externalInterface.isReadOnly = internalInterface.isReadOnly;
    externalInterface.getModel = internalInterface.getModel;
    externalInterface.getModelTimestamp = internalInterface.getModelTimestamp;
    externalInterface.redoChange = internalInterface.redoChange;
    externalInterface.undoChange = internalInterface.undoChange;
    externalInterface.addModelListener = internalInterface.addModelListener;
    externalInterface.removeModelListener = internalInterface.removeModelListener;

    return internalInterface;
};
sap.galilei.gravity.createUndoRedoHandler = function (changeModelInternal, transformer, originalHistory, executionHistory) {

    var undoStack = [];
    var redoStack = [];

    var applyInverseOperation = function (operation, description) {
        if (operation) {
            var inverseOperation = operation.inverse();
            try {
                var transformedOperation = transformer.calculateTransformation(inverseOperation, originalHistory);
                var changeHandle = changeModelInternal(function (mdl) {
                    transformedOperation.materialize(mdl);
                }, description);
                changeHandle.onCollision(function () {
                    undoStack = [];
                    redoStack = [];
                });
                return true;
            } catch (e) {
                if (e.type === "CollisionException") {
                    // Transformation failed due to collision --> Undo not possible
                    return false;
                } else {
                    // some other problem
                    throw e;
                }
            }
        } else {
            return false;
        }
    };

    var revertOperation = function (fromStack, toStack, prefix) {
        var success = false,
            operationToBeReverted = fromStack.pop(),
            description,
            revertOperation,
            originalOperation,
            originalRevertOperation;
        if (operationToBeReverted) {
            description = operationToBeReverted.originalDescription || operationToBeReverted.description;
            success = applyInverseOperation(operationToBeReverted, prefix + " '" + description + "'");
            if (success) {
                revertOperation = executionHistory.getOperation(executionHistory.size() - 1);
                revertOperation.originalDescription = description;

                /***
                 * MODIFIED
                 * **** BEGIN ****
                 * Add revertedOperation to complex operation to keep record of the reverted operation
                 * that can be different from the original operation.
                 */
                revertOperation.revertedOperation = operationToBeReverted;
                /***
                 * MODIFIED
                 * **** END ****
                 */

                toStack.push(revertOperation);
                originalOperation = operationToBeReverted.getOriginalOperation() || operationToBeReverted;
                originalRevertOperation = revertOperation.getOriginalOperation() || revertOperation;
                originalOperation.isPartOfUndo = true;
                originalRevertOperation.isPartOfUndo = true;
            } else {
                fromStack.splice(0, fromStack.length);
            }
        }
        return success;
    };

    return {
        undo: function () {
            return revertOperation(undoStack, redoStack, "Undo", true);
        },

        redo: function () {
            return revertOperation(redoStack, undoStack, "Redo");
        },

        /***
         * MODIFIED
         * **** BEGIN ****
         * Add canUndo and canRedo methods
         */

        canUndo: function () {
            return undoStack.length > 0;
        },

        canRedo: function () {
            return redoStack.length > 0;
        },

        /***
         * MODIFIED
         * **** END ****
         */

        makeUndoable: function (complexOperation, changeHandle) {
            if (complexOperation) {
                undoStack.push(complexOperation);
            }
            redoStack = [];
            changeHandle.onCollision(function () {
                undoStack = [];
            });
        },

        protectAgainstUndo: function () {
            undoStack = [];
        },

        protectAgainstRedo: function () {
            redoStack = [];
        }
    };
};
this.sap.galilei.gravity.createReplayHandler = function (client) {

    var interval = 500;

    var position;

    var timer;

    var isInReplayMode = false;

    var redoLog = [];

    var modelHandler = client.getModelHandler();

    var subscriptions = sap.galilei.gravity.createSubscriptionHandler();

    var getNextOperation = function () {
        if (position < redoLog.length) {
            var nextOp = redoLog[position];
            position += 1;
            return nextOp;
        } else {
            return undefined;
        }
    };

    var hasNextOperation = function () {
        return position < redoLog.length;
    };

    var receiveRedoLogCallback = function (log) {
        position = 0;
        redoLog = log;
        isInReplayMode = true;
        subscriptions.notify("replayModeStarted");
    };

    var iPublic = {};

    iPublic.enterReplayMode = function () {
        client.enterReplayMode(receiveRedoLogCallback);
    };

    iPublic.exitReplayMode = function () {
        isInReplayMode = false;
        timer = undefined;
        position = undefined;
        client.leaveReplayMode();

        subscriptions.notify("replayModeExited");

    };

    iPublic.isInReplayMode = function () {
        return isInReplayMode;
    };

    iPublic.setIntervalInMillis = function (intervalInMillis) {
        interval = intervalInMillis;
    };

    iPublic.getIntervalInMillis = function () {
        return interval;
    };

    iPublic.canPlay = function () {
        return (isInReplayMode && hasNextOperation());
    };

    iPublic.play = function () {
        if (iPublic.canPlay()) {
            iPublic.next();
            timer = setTimeout(iPublic.play, interval);
        } else {
            iPublic.pause();
        }
    };

    iPublic.canPause = function () {
        return isInReplayMode && timer !== undefined;
    };

    iPublic.pause = function pause() {
        if (iPublic.canNext()) {
            clearTimeout(timer);
            timer = undefined;
            subscriptions.notify("paused");
        }
    };

    iPublic.canNext = function canNext() {
        return isInReplayMode && hasNextOperation();
    };

    iPublic.next = function () {
        if (iPublic.canNext()) {
            var nextOp = getNextOperation();
            modelHandler.directlyApplyToModel(nextOp);
            subscriptions.notify("replayed", [nextOp.description]);
        }
    };

    iPublic.getPosition = function () {
        return position;
    };

    iPublic.length = function () {
        if (isInReplayMode) {
            return redoLog.length;
        } else {
            return undefined;
        }
    };

    iPublic.canWindBack = function () {
        return (isInReplayMode && position > 0);
    };

    iPublic.windBack = function () {
        if (iPublic.canWindBack()) {
            position = 0;
            modelHandler.directlyApplyToModel({
                materialize: function (model) {
                    model.clear();
                }
            });
        }
    };

    iPublic.canPrevious = function () {
        return (isInReplayMode && position > 0);
    };

    iPublic.previous = function () {
        var currentOp, inverse;
        if (iPublic.canPrevious()) {
            position -= 1;
            currentOp = redoLog[position];
            inverse = currentOp.inverse();
            modelHandler.directlyApplyToModel(inverse);
            subscriptions.notify("replayed", [currentOp.description]);
        }
    };

    iPublic.addListener = function (listener) {
        subscriptions.register(listener);
    };

    iPublic.removeListener = function (listener) {
        subscriptions.unregister(listener);
    };

    window.enterReplayMode = iPublic.enterReplayMode;
    window.exitReplayMode = iPublic.exitReplayMode;
    window.enterReplayMode = iPublic.enterReplayMode;
    window.replay = iPublic.play;
    window.pauseReplay = iPublic.pause;
    window.replayHandler = iPublic;

    return iPublic;
};

/**
 * Handles subscriptions by listener objects (objects is a set of functions).
 * When notifying listeners, a the name of a callback function plus optional arguments can be specified
 * which is then executed on all listeners if they implement the specified function.
 * Errors in callback functions are caught and logged. Multiple subscription of the same listener is not possible.
 */
(function SubscriptionHandler() {

    var logger = sap.galilei.gravity.getLogger("SubscriptionHandler");

    var notifySubscribers = function (subscribers, callbackName, args) {
        var nIndex = 0,
            nMax = (subscribers && subscribers.length) || 0,
            listener;
        for (; nIndex < nMax; nIndex++) {
            var callback = subscribers[nIndex][callbackName];
            if (callback) {
                try {
                    callback.apply(listener, args);
                } catch (e) {
                    logger.error("Exception while calling function '" + callbackName + "' on '" + listener + "': " + e);
                }
            }
        }
    };

    var subscribe = function (subscribers, listener) {
        if (listener) {
            if ($.inArray(listener, subscribers) === -1) {
                subscribers.push(listener);
            }
        } else {
            throw "Listener cannot be undefined.";
        }
    };

    var unsubscribe = function (subscribers, subscriber) {
        var index = $.inArray(subscriber, subscribers);
        subscribers.splice(index, 1);
    };

    this.sap.galilei.gravity.createSubscriptionHandler = function () {
        var subscribers = [];

        return {
            /**
             * Registers a listener
             * @param listener
             */
            register: function (listener) {
                subscribe(subscribers, listener);
            },
            /**
             * Calls the function identified by callbackName on each of the registered listeners
             * @param callbackName
             * @param args array of optional parameters for the listerns
             */
            notify: function (callbackName, args) {
                notifySubscribers(subscribers, callbackName, args);
            },
            /**
             * Unregisters a given listener
             * @param listener
             */
            unregister: function (listener) {
                unsubscribe(subscribers, listener);
            }
        };
    };
}());
/**
 * Creates an empty history with an initial time stamp
 * @param initialTimestamp {Array} the initial time stamp
 */
this.sap.galilei.gravity.createExecutionHistory = function (initialTimestamp) {

    var timestamp = (initialTimestamp && initialTimestamp.slice(0)) || [];

    var minTimestamp = timestamp.slice(0);

    var history = [];

    return {
        /**
         * the current timestamp of the history
         */
        getTimestamp: function () {
            return timestamp.slice(0);
        },

        /**
         * returns the minimum time stamp covered by the execution history.
         */
        getMinimumTimestamp: function () {
            return minTimestamp.slice(0);
        },

        /**
         * adds an complex operation to the history. The context of the operation must
         * match the history's time stamp
         */
        addOperation: function (operation) {
            if (operation.getFlavor() !== "complex") {
                throw "ExecutionHistory: can only add complex operations.";
            }
            if (!sap.galilei.gravity.equals(operation.getContext(), this.getTimestamp())) {
                throw "ExecutionHistory: Operation out of sequence.";
            }
            history.push(operation);
            timestamp = operation.timestamp().slice(0);
        },
        /**
         * returns operation at the specified index or undefined.
         */
        getOperation: function (index) {
            return history[index];
        },
        /**
         * returns the number of operations in the history
         */
        size: function () {
            return history.length;
        },
        /**
         * Removes and returns the last operation in the history.
         */
        removeLastOperation: function () {
            var lastOperation = history.pop();
            if (lastOperation !== undefined) {
                timestamp = lastOperation.getContext().slice(0);
            }
            return lastOperation;
        },
        /**
         * Removes all operations in the history that are strictly prior to a specified time stamp
         * @param timestamp
         */
        collectGarbage: function (timestamp) {
            for (var i = 0; i < history.length; i += 1) {
                var op = history[0];
                if (sap.galilei.gravity.strictlyPrior(op.getContext(), timestamp)) {
                    history.shift();
                    minTimestamp = op.timestamp();
                } else {
                    break;
                }
            }
        }
    };
};
/**
 * Creates an empty operationsQueue with an initial time stamp
 * @param initialTimestamp {Array} the initial time stamp
 */
this.sap.galilei.gravity.createQueue = function (initialTimestamp) {

    var timestamp = (initialTimestamp && initialTimestamp.slice(0)) || [];

    var operationsQueue = [];

    var changed = false;

    var onQueueChangeCallbacks = sap.galilei.gravity.createCallbackHandler();
    var onAcknowledgeCallbacks = sap.galilei.gravity.createCallbackHandler();

    var log = sap.galilei.gravity.getLogger("Queue");

    var acknowledgeTimestamp = function (timestamp) {
        var op;
        for (var i = operationsQueue.length - 1; i >= 0; i -= 1) {
            op = operationsQueue[i];
            if (sap.galilei.gravity.prior(op.timestamp(), timestamp)) {
                log.info("Acknowledged Operation '" + op.description + "' with context [" + op.getContext() + "] and timestamp [" + op.timestamp() + "]");
                operationsQueue.splice(i, 1);
                onAcknowledgeCallbacks.notify(op);
            }
        }
    };

    var acknowledgeSequenceNumber = function (sequenceNumber) {
        var op;
        for (var i = operationsQueue.length - 1; i >= 0; i -= 1) {
            op = operationsQueue[i];
            if (op.getSequenceNumber() <= sequenceNumber) {
                log.info("Acknowledged Operation '" + op.description + "' with context [" + op.getContext() + "] and timestamp [" + op.timestamp() + "]");
                operationsQueue.splice(i, 1);
                onAcknowledgeCallbacks.notify(op);
            }
        }
    };

    return {
        /**
         * the current time stamp of the queue
         */
        getTimestamp: function () {
            return timestamp.slice(0);
        },

        /**
         * adds an complex operation to the operationsQueue. The context of the operation must
         * match the operationsQueue's time stamp
         */
        addOperation: function (operation) {
            log.info("adding operation '" + operation.description + "' with context [" + operation.getContext() + "] and timestamp [" + operation.timestamp() + "]");
            if (operation.getFlavor() !== "complex") {
                throw "Queue: can only add complex operations.";
            }
            var offset = 2 * operation.getPrimitiveOps()[0].getClientOffset();
            var inverseOffset = 2 * operation.getPrimitiveOps()[0].getClientOffset() + 1;
            if ((this.getTimestamp()[offset] || 0) !== (operation.getContext()[offset] || 0) ||
                (this.getTimestamp()[inverseOffset] || 0) !== (operation.getContext()[inverseOffset] || 0)) {
                throw "Queue: Operation out of sequence.";
            }
            operationsQueue.push(operation);
            timestamp = operation.timestamp().slice(0);
            changed = true;
        },

        /**
         * returns operation at the specified index or undefined.
         */
        getOperation: function (index) {
            return operationsQueue[index];
        },

        /**
         * returns the number of operations in the operationsQueue
         */
        size: function () {
            return operationsQueue.length;
        },

        /**
         * Removes and returns the last operation in the operationsQueue.
         */
        removeLastOperation: function () {
            var lastOperation = operationsQueue.pop();
            if (lastOperation !== undefined) {
                timestamp = lastOperation.getContext().slice(0);
                changed = true;
            }
            return lastOperation;
        },

        /**
         * Acknowledges all pending operations up to and including the specified time stamp.
         * This also removes operations with a time stamp prior to time stamp
         * @param timestamp the time stamp
         */
        acknowledgeOperation: function (timestamp) {
            if (jQuery.isArray(timestamp)) {
                acknowledgeTimestamp(timestamp);
            } else if (typeof (timestamp) === "number") {
                acknowledgeSequenceNumber(timestamp);
            }
        },

        /**
         * Registers a call-back function to be executed upon acknowledgment of an operation.
         * The acknowledged operation is passed as the first parameter of the call-back function.
         */
        addOnAcknowledge: function (callback) {
            onAcknowledgeCallbacks.register(callback);
        },

        /**
         * Unregisters a call-back function.
         *
         */
        removeOnAcknowledge: function (callback) {
            onAcknowledgeCallbacks.unregister(callback);
        },

        /**
         * Registers a call-back function to be executed upon changes to the queue.
         *
         */
        addOnQueueChange: function (callback) {
            onQueueChangeCallbacks.register(callback);
        },

        /**
         * Unregisters a call-back function.
         *
         */
        removeOnQueueChange: function (callback) {
            onQueueChangeCallbacks.unregister(callback);
        },

        /**
         * Notifies the onQueueChange call-back about changes to the queue, if there were any since the
         * last notification.
         */
        notifyOnQueueChange: function () {
            if (changed) {
                onQueueChangeCallbacks.notify();
            }
            changed = false;
        },

        /**
         * Returns all operations in the queue
         */
        getOperations: function () {
            return operationsQueue.slice(0);
        },

        /**
         * returns the last operation in the queue or undefined if there is none
         */
        getLastOperation: function () {
            if (operationsQueue.length > 0) {
                return operationsQueue[operationsQueue.length - 1];
            } else {
                return undefined;
            }
        }
    };
};
/**
 * Creates and returns a new cache object to be used in the OT client to store
 * and quickly retrieve transformed operation versions.
 *
 * @param {Number}
 *            capacity is the maximum number of operation versions stored per
 *            original operation, a value of undefined means unbounded.
 *
 * @return {Object} the cache interface to store, retrieve and garbage collect
 *         the cache.
 */
this.sap.galilei.gravity.createCache = function (capacity) {
    capacity = capacity || 1;

    /**
     * The actual cache, maps operation identifiers to the (original) operation
     * itself and a list of operation versions.
     */
    var cache = {};

    /**
     * Numeric, logical timestamp that keeps track of when a version was added
     * to the cache. Later used in cache eviction strategy.
     */
    var insertion_time = 0;

    /**
     * Compares two cached operations by means of their usage counters and
     * insertion times. To be used by Array.sort(...).
     *
     * @param {Object}
     *            v1 is the first operation object.
     * @param {Object}
     *            v2 is the second operation object.
     *
     * @return a negative number if v1 was more often accessed, a positive
     *         number if v2 was more often accessed.
     */
    var compareVersions = function (v1, v2) {
        // primarily use usage counter (more frequently used versions go first)
        var compare = (v2.usage || 0) - (v1.usage || 0);

        // break ties by placing newer versions first
        if (compare === 0) {
            compare = (v2.insertion_time || 0) - (v1.insertion_time || 0);
        }

        return compare;
    };

    return {
        /**
         * Adds an operation version (i.e., a transformed operation) to the
         * cache.
         *
         * @param {Object}
         *            version the operation to be cached
         */
        storeVersion: function (version) {
            var original = version.getOriginalOperation() || version;

            // retrieve the operation's key
            var key = original.operation_id;

            // fetch the versions for this operation
            var data = cache[key];

            if (data === undefined) {
                // create a new versions list with the original at front
                data = {
                    "original": original,
                    "versions": []
                };

                // store it in the cache
                cache[key] = data;
            }

            var versions = data.versions;

            // Make sure we do not add version to the wrong version group due to key collisions.
            if (original !== data.original) {
                throw "[Internal Error (BUG?)] storeVersion(): Key collision.";
            }

            // store insertion timestamp
            version.insertion_time = insertion_time;
            insertion_time += 1;
            version.usage = 0;

            // insert the new version at front
            versions.splice(0, 0, version);

            // check if versions limit is exceeded
            if (capacity && versions.length > capacity) {
                // purge the oldest one or with the fewest hits (at the end of
                // the
                // list) from the cache
                versions.splice(capacity, 1);
            }
        },

        /**
         * Retrieves a version of the given original operation from the cache
         * that is applicable in a context.
         *
         * @param original
         *            {Object} the original operation identifying the version
         *            group
         * @param context
         *            {Array} the context vector identifying the version
         *
         * @return the matching operation version or undefined if the
         *         sought-after version is not cached.
         */
        getVersion: function (original, context) {
            // fetch the operation's key
            var key = original.operation_id;

            // look up its cached versions
            var data = cache[key];

            if (data) {
                var versions = data.versions;

                if (versions) {
                    var version;

                    // go through all operations in the version group to find
                    // the
                    // one that matches the context
                    for (var i = 0, ii = versions.length; i < ii; i += 1) {
                        // compare this version's context to the given context
                        // vector
                        version = versions[i];
                        if (version && sap.galilei.gravity.equals(version.getContext(), context) && (version.getOriginalOperation() || version) === original) {
                            version.usage += 1;
                            versions.sort(compareVersions);
                            return version;
                        }
                    }
                }
            }
            // none was found.
            return undefined;
        },

        /**
         * flushes the cache
         */
        flush: function () {
            cache = {};
            insertion_time = 0;
        },

        /**
         * Collects garbage from the cache. Therefore it evicts all version
         * groups with a vector time stamp prior to the given time stamp.
         *
         * @param {Array}
         *            timestamp is the operation time stamp prior to which
         *            operation versions will be purged from the cache.
         */
        collectGarbage: function (timestamp) {
            var key;
            for (key in cache) {
                if (cache.hasOwnProperty(key)) {
                    var data = cache[key];
                    if (sap.galilei.gravity.prior(data.original.timestamp(), timestamp)) {
                        delete cache[key];
                        // orgOp2VersGroup[key] = undefined;
                    }
                }
            }
        },

        /**
         * Dumps the cache content
         */
        toString: function () {
            var j, jj;
            var versions;
            var version;
            var string = "";
            var data;

            for (var key in cache) {
                if (cache.hasOwnProperty(key)) {
                    data = cache[key];

                    string += data.original + ";";
                    versions = data.versions || [];
                    for (j = 0, jj = versions.length; j < jj; j += 1) {
                        version = versions[j];
                        if (version) {
                            string += "(" + (version.usage || 0) + ", "
                                + (version.insertion_time || 0) + ");";
                        }
                    }
                    string += "||\n";
                }
            }
            return string;
        }
    };
}; // end Cache

/*******************************************************************************
 * Context-based Operational Transformation
 * ***********************************************************
 *
 ******************************************************************************/
this.sap.galilei.gravity.createTransformer = function (configuration) {

    /**
     * the cache for storing transformed operations
     */
    var cache = sap.galilei.gravity.createCache(1);

    /**
     * whether or not to cache transformed operations
     */
    var caching = (configuration && configuration.caching !== undefined) ? configuration.caching
        : true;

    /**
     * "factory" for creating operation objects
     */
    var operations = sap.galilei.gravity.createOperationalizer();

    /**
     * Whether or not we are trying to retain local (i.e. unacknowledged)
     * operations when resolving conflicts.
     */
    var retainLocalOps = false;

    /**
     * Whether or not to take shortcuts, i.e. do not apply transformation if not
     * necessary.
     */
    var take_shortcuts = (configuration && configuration.take_shortcuts !== undefined) ? configuration.take_shortcuts
        : true;

    /**
     * Whether or not to leapfrog entire differences, i.e. do not apply
     * transformation if not necessary.
     */
    var leapfrog = (configuration && configuration.leapfrog !== undefined) ? configuration.leapfrog
        : true;

    /**
     * The number resolved collisions. This is recored for performance testing
     * reasons.
     */
    var collisionsResolved = 0;

    /**
     * For performance testing keeps track of the number of calls to transform()
     */
    var transformCallsCount = 0;

    /**
     * stores call-backs for notifying collisions
     */
    var onCollisionCallbacks = sap.galilei.gravity.createCallbackHandler();

    /**
     * stores collisions so they can be reported once all collisions have been resolved.
     */
    var recordedCollisions = [];

    // ******************************************************************************************
    // ** Private helper functions
    // ******************************************************************************************

    /**
     * A CollisionException is thrown if a collision was encountered when
     * transforming two operations.
     *
     * @constructor
     * @param op
     *            the operation that caused the collision, which can be accessed
     *            via the collision attribute.
     */
    var CollisionException = function (op) {
        this.collision = op;
        this.type = "CollisionException";

        this.toString = function () {
            return "Collision with '" + op + "'";
        };
    };

    /**
     * For performance testing increments the transform call counter
     */
    var incrementTransformCallsCount = function () {
        transformCallsCount += 1;
    };

    /**
     * shortcut to the logger
     */
    var log = sap.galilei.gravity.log;

    /**
     * Applies the actual OT and stores the result in the cache. Therefore, o1
     * is transformed against o2.
     *
     * @param o1
     * @param o2
     * @return the result of transforming o1 against o2.
     */
    var et = function (o1, o2) {
        var o_trans1;
        var partOfDoUndoPair = function (op) {
            var orig = op.getOriginalOperation() || op;
            return orig.complexOp.isPartOfUndo;
        };

        var canIgnore = function (o1, o2) {
            return o1.getClientOffset() === o2.getClientOffset();
        };

        if ((partOfDoUndoPair(o1) || partOfDoUndoPair(o2)) && canIgnore(o1, o2)) {
            o_trans1 = o1.transform(operations.createIdOperation(o1.getContext(), 0));
            o_trans1.upgradeContextToInclude(o2);
            return o_trans1;
        } else {
            o_trans1 = o1.transform(o2);
        }

        if (!o_trans1) {
            // the above transformation causes a collision
            // throw an exception and deal with the problem at a higher
            // level
            throw new CollisionException(o2);
        }
        if (!o_trans1.getOriginalOperation()) {
            log.warn("'" + o_trans1 + "' does not have an original operation set!");
        }

        /*
         * Also transform the other way round. The result will also be cached,
         * because it is very likely to be reused.
         */
        var o_trans2 = o2.transform(o1);

        // same, but the other way round.
        if (!o_trans2) {
            throw new CollisionException(o1);
        }
        o_trans1.upgradeContextToInclude(o2);
        o_trans2.upgradeContextToInclude(o1);
        // caching
        if (caching) {
            cache.storeVersion(o_trans1); // store the new version
            cache.storeVersion(o_trans2); // store the new version
        }
        return o_trans1;
    };

    /**
     * transforms an operation op against all operations in diff
     *
     * @param o
     *            the operation to transform
     * @param diff
     *            array of operations to transform against
     * @return the transformation of op
     * @throws Collision
     *             if a collision was encountered (et(op1, op2) returned
     *             undefined).
     */
    var transform = function (o, diff, tempHistory) {
        var o_x;
        var o_x_trans;
        var cachedVersion;
        var diff_length = diff.getLength(); // optimization: we keep the length
        // in a var and decrement it each
        // time
        incrementTransformCallsCount(); // for performance testing, keep track
        // of the calls to this function
        while (diff_length > 0) {
            o_x = diff.selectAndRemove(o);
            diff_length -= 1; // optimization: since we removed an element form
            // the list, we have to decrement the counter
            // check whether we can take a shortcut
            if (!take_shortcuts || o.requiresTransform(o_x)) {
                // retrieve version from cache
                if (caching) {
                    cachedVersion = cache.getVersion(o_x.getOriginalOperation() || o_x, o.getContext());
                    // reuse cached version if exists or transform o_x
                    o_x_trans = cachedVersion || transform(o_x, tempHistory.operationContextDifference(o, o_x), tempHistory);
                } else {
                    o_x_trans = transform(o_x, tempHistory.operationContextDifference(o, o_x), tempHistory);
                }
                o = et(o, o_x_trans);
            } else {
                // we can take a shortcut and skip the recursion
                // log.info("Taking a shortcut");
                o = et(o, o_x);
            }

        }
        return o;
    };

    /**
     * Transforms a primitive operation to be applicable to a model. This
     * implements the COT algorithmn for primitive operations.
     *
     * @param primitive
     *            A primitive operation
     * @param model
     *            The Model
     * @return the transformed primitive operation. The resulting primitive
     *         operation must still be applied to the model and added to its
     *         history.
     * @throws CollisionException
     *             if a collision was encountered during the transformation. The
     *             operation causing the collision can be obtained via the
     *             collision attribute of the exception.
     */
    var primitiveCOT = function (primitive, client) {
        var history = client.original_history;
        return transform(primitive, history.contextDifference(primitive),
            history);
    };

    /**
     * Transforms a complex operation to be applicable to a model. This
     * implements the COT algorithmn for complex operations.
     *
     * @param complex
     *            a complex operation consisting of primitive operations
     * @param history
     *            the history of the collaboration
     * @return the transformed complex operation containing transformed
     *         primitive operations. The resulting complex operation must still
     *         be applied to the model and added to its history.
     * @throws CollisionException
     *             if a collision was encountered during the transformation. The
     *             operation causing the collision can be obtained via the
     *             collision attribute of the exception.
     */
    var complexCOT = function (complex, history) {
        var complexTrans = operations.createComplexOperation();
        complexTrans.setOriginalOperation(complex);

        /*
         log.info("complexCOT: Transforming operation #"
         + complex.getSequenceNumber() + " into derived operation #"
         + complexTrans.getSequenceNumber());
         */

        var primitives = complex.getPrimitiveOps();
        var oTrans;
        var diff;
        var contextDiff = history.contextDifference;
        try {
            for (var i = 0, ii = primitives.length; i < ii; i += 1) {
                var o = primitives[i];
                diff = contextDiff(o); // we recompute the diff, which is
                // quicker than copying
                if (!leapfrog || diff.requiresTransform(o)) {
                    oTrans = transform(o, diff, history);
                } else {
                    // we are taking a short cut:
                    // copy o by transforming it against id
                    oTrans = o.transform(operations.createIdOperation(o
                        .getContext(), 0));
                    // set the new context that comes from the history.
                    oTrans.setContext(history.getMaximumTimeStamp());
                }
                if (oTrans.complexOp !== undefined) {
                    log
                        .warn(oTrans
                            + " has already been assigned a complex operation.");
                }
                history.addOperation(o);
                complexTrans.addPrimitiveOp(oTrans);
            }
            history.rollback();
        } catch (collision) {
            history.rollback();
            throw collision;
        }
        return complexTrans;
    };

    /**
     * removes an operation from a list (e.g. operation history)
     *
     * @param op
     *            the operation to remove
     * @param list
     *            the list of operation from which op is to be removed (if
     *            present at all)
     */
    var removeFromList = function (op, list) {
        var i;
        // go through the history to find op and remove it
        // we are going through it in reverse order, which is faster, assuming
        // that op happened "recently"
        for (i = list.length; i >= 0; i -= 1) {
            if (op === list[i]) {
                list.splice(i, 1); // remove one element at position i
                break;
            }
        }
    };

    /**
     * Removes all operations upto and including op from model.
     *
     * @param op
     *            complex operation to remove
     * @param model
     *            the model from which to remove op
     * @return array of *original operations* removed from the model
     */
    var rollback = function (op, client) {
        // TODO also consider the pending_operations_queue
        var o;
        var o_inv;
        var orig;
        var removedComplexOps = [];
        var done = false;
        var opInQueue;
        var queue = client.pending_operations_queue;
        // go through the primitive operation contained in the complex
        // operations in reverse order
        while (!done) {
            // remove trailing operation from history
            o = client.execution_history.removeLastOperation();
            o_inv = o.inverse();
            o_inv.materialize(client.model);
            if (queue.getLastOperation() === o) {
                queue.removeLastOperation();
            }

            orig = o.getOriginalOperation() || o;
            if (orig !== op) {
                // TODO that's expensive: can't we rather add to the
                // end and traverse backward later on?
                if (removedComplexOps[0] !== orig) {
                    removedComplexOps.unshift(orig);
                }
            }
            client.original_history.removeOperation(orig);
            // we stop after having undone all operations up until and including
            // op
            if (o === op) {
                done = true;
            }
        }
        client.original_history.commit(); // commit changes to the history
        return removedComplexOps;
    };

    /**
     * Removes all operations that depend on op (i.e. have op in their context)
     * and op itself from the model and its history. Operations applied after
     * op, but not depending on op (i.e. have op not in their context) are
     * re-transformed and re-applied.
     *
     * @param op
     *            the complex operation and all its subsequent operations to be
     *            removed
     * @param model
     *            the model on which the operation has to be undone
     */
    var reapply = function (ops, client) {
        var o;
        var o_trans;
        var original_history = client.original_history;
        var model = client.model;
        var execution_history = client.execution_history;
        var client_offset = client.client_offset;
        // We now have to re-apply and re-transform all operations in remoteOps
        for (var i = 0, ii = ops.length; i < ii; i += 1) {
            o = ops[i];
            o_trans = complexCOT(o, original_history);
            o_trans.materialize(model);
            execution_history.addOperation(o_trans);
            original_history.addOperation(o);
            original_history.commit();
            // if o is a local op (look at client offset) we put it into the
            // pending ops queue
            if (o.getPrimitiveOps()[0].getClientOffset() === client_offset) {
                client.pending_operations_queue.addOperation(o);
            }
        }
    };

    /**
     * Transforms a complex operation to be applicable to a model. This
     * implements the COT algorithmn for complex operations.
     *
     * @param complex
     *            a complex operation consisting of primitive operations
     * @param model
     *            the Model
     * @return the transformed complex operation containing transformed
     *         primitive operations. The resulting complex operation must still
     *         be applied to the model and added to its history.
     * @throws CollisionException
     *             if a collision was encountered during the transformation. The
     *             operation causing the collision can be obtained via the
     *             collision attribute of the exception.
     */
    var complexTrans = function (complex, ops, tempHistory) {
        var complexTrans = operations.createComplexOperation();
        complexTrans.setOriginalOperation(complex);
        complexTrans.description = complex.description;

        /*
         log.info("complexTrans: Transforming operation #"
         + complex.getSequenceNumber() + " into derived operation #"
         + complexTrans.getSequenceNumber());
         */

        for (var i = 0, ii = complex.getPrimitiveOps().length; i < ii; i += 1) {
            var o = complex.getPrimitiveOps()[i];
            var oTrans = transform(o, ops.contextDifference(o), tempHistory);
            if (oTrans.complexOp !== undefined) {
                log.warn(oTrans
                    + " has already been assigned a complex operation.");
            }
            tempHistory.addOperation(o);
            complexTrans.addPrimitiveOp(oTrans);
        }
        return complexTrans;
    };

    /**
     * Makes a complex operation its own original operation
     *
     * @param the
     *            complex operation
     */
    var makeOriginal = function (complex_operation) {
        // TODO: attn: we use a nasty side-effect of "getSequenceNumber" to
        // perform a recursive descent into the previous original operation to
        // cache its sequenceNumber (uhh-ohh)
        complex_operation.getSequenceNumber();

        complex_operation.setOriginalOperation(undefined);
        // go through all its primitive operations and make them their own
        // originals.
        var primitives = complex_operation.getPrimitiveOps();
        for (var i = 0, ii = primitives.length; i < ii; i += 1) {
            primitives[i].setOriginalOperation(undefined);
        }
    };

    /**
     * Takes an operation and removes all operations in a set from its context
     *
     * @param complex_operation
     * @param list_of_complex_operations_to_remove_from_context
     */
    var removeOperationsFromContext = function (complex_operation, list_of_operations_to_remove_from_context) {
        var i, ii, j, jj;
        var op;
        var primitives = complex_operation.getPrimitiveOps();
        var context;
        for (i = 0, ii = primitives.length; i < ii; i += 1) {
            for (j = 0, jj = list_of_operations_to_remove_from_context.length; j < jj; j += 1) {
                op = list_of_operations_to_remove_from_context[j];
                if (!op.isInverse()) {
                    // operation is a normal operation
                    context = primitives[i].getContext();
                    context[2 * op.getClientOffset()] -= 1;
                    primitives[i].setContext(context);
                } else {
                    // operation is an inverse operation
                    context = primitives[i].getContext();
                    context[2 * op.getClientOffset() + 1] -= 1;
                    primitives[i].setContext(context);
                }
            }
        }
    };

    /**
     * Removes an operation from an operation history
     *
     * @param op
     *            the primitive operation to be removed
     * @param opList
     *            operations to transform against
     */
    var excludeEffects = function (op, opList) {
        var o_x;
        var op_inv = op.inverse();
        var opList_trans = [];
        var tempHistory = sap.galilei.gravity.createWorkload(op.getContext());
        tempHistory.addOperation(op);
        tempHistory.addOperation(op_inv);
        var o_x_trans;
        //
        while (opList.length > 0) {
            o_x = opList[0];
            try {
                // If o_x depends on op i.e. op is in the context of o_x
                // If Op is a local operation that has not be acknowledged, then
                // o_x is another local operation
                if (op.getPrimitiveOps()[0]
                    .isInContextOf(o_x.getPrimitiveOps()[0]
                        .getOriginalOperation()
                        || o_x.getPrimitiveOps()[0])) {
                    // Retain local operations if possible. If not, only the
                    // remote operations are reapplied.
                    if (retainLocalOps) {
                        // since o_x depends on op, it has to be transformed
                        // against the op's inverse, i.e. tempHistory
                        var workload = sap.galilei.gravity.createWorkload();
                        workload.addOperation(op_inv);
                        o_x_trans = complexTrans(o_x, workload, tempHistory);
                        // add the result to the list
                        opList_trans.push(o_x_trans);
                        // since o_x_trans has been transformed against op_inv,
                        // op and op_inv can be removed from o_x_tran's context.
                        // They amount to id() anyway.
                        // remove op from context of o_x_trans
                        removeOperationsFromContext(o_x_trans, op
                            .getPrimitiveOps().concat(
                                op_inv.getPrimitiveOps().slice(0)));
                        // Moreover, o_x_trans it is new own original
                        // make o_x_trans its own original
                        makeOriginal(o_x_trans);
                    }
                } else {
                    // o_x does not depend on op i.e. op is not in the context
                    // of o_x
                    // o_x is a remote operation. Since is does not depend on
                    // op, it does not have to be transformed.
                    // we just add the original operation to the list
                    var original_operation = o_x.getOriginalOperation() || o_x;
                    opList_trans.push(original_operation);
                    tempHistory.addOperation(original_operation);
                }
                // remove o_x from the list
                opList.shift();
            } catch (c) {
                if (c.type === "CollisionException") {
                    // break;
                    // o_x cannot be transformed against op, op_inv. I.e. it
                    // depends on elements that op creates and therefore,
                    // has to be undone as well. We do that by recursively
                    // calling the algorithm and thereby transforming operations
                    // in
                    // opList such that they do not depend on o_x
                    opList = excludeEffects(o_x, opList.slice(1));
                } else {
                    throw c;
                }
            }
        }
        return opList_trans;
    };

    /**
     * Transforms a primitive or complex operation to be applicable to a model.
     * This implements the COT algorithmn for primitive operations.
     *
     * @param op
     *            A (primitive or complex) operation
     * @param model
     *            The Model
     * @param original_history
     *            the history of all original operations applied or received by
     *            this client. Do not pass a copy! As it will be changed by this
     *            procedure
     * @param execution_history
     *            the sequence of all operations applied to the model as they
     *            are. Do not pass a copy! As it will be changed by this
     *            procedure
     * @return the transformed primitive operation. The resulting primitive or
     *         complex operation must still be applied to the model and added to
     *         its history.
     * @throws CollisionException
     *             if a collision was encountered during the transformation. The
     *             operation causing the collision can be obtained via the
     *             collision attribute of the exception.
     */
    var cotInternal = function (op, client) {
        switch (op.getFlavor()) {
            case "complex":
                return complexCOT(op, client.original_history);
            case "addObject":
            case "deleteObject":
            case "addReference":
            case "removeReference":
            case "setReference":
            case "updateAttribute":
            case "identity":
            case "insertString":
            case "removeString":
                return primitiveCOT(op, client);
            default:
                throw "Unkown operation '" + op.toString() + "'";
        }
    };

    /**
     * records a collision so it can be reported later on
     */
    var recordCollision = function (acceptedOperation, rejectedOperation) {
        recordedCollisions.push({accepted: acceptedOperation, rejected: rejectedOperation});
    };

    /**
     * calls the onCollisions callback for each recorded collision
     */
    var notifyOnCollision = function () {
        $(recordedCollisions).each(function (i, collision) {
            onCollisionCallbacks.notify(collision.accepted, collision.rejected);
        });
        recordedCollisions = [];
    };

    // *****************************************************************************
    // * Public Functions
    // *****************************************************************************
    return {

        /**
         * for testing: number of resolved collisions during the last call to
         * ecot().
         */
        getCollisionsResolved: function () {
            return collisionsResolved;
        },

        /**
         * The cache that keeps operation version
         */
        getCache: function () {
            return cache;
        },

        /**
         * For performance testing
         *
         * @return the number of calls to transform()
         */
        getTransformCallsCount: function () {
            return transformCallsCount;
        },

        /**
         * For performance testing resets the transform call counter
         */
        resetTransformCallsCount: function () {
            transformCallsCount = 0;
        },

        /**
         * Transforms a primitive or complex operation to be applicable to a
         * model. This implements the COT algorithmn for primitive operations.
         *
         * @param op
         *            A (primitive or complex) operation
         * @param client_configuration
         *            the current configuration of the client, which inlcudes
         *            its time stamp, the model, the history, etc
         * @throws CollisionException
         *             if a collision was encountered during the transformation.
         *             The operation causing the collision can be obtained via
         *             the collision attribute of the exception.
         */
        cot: function (op, client_configuration) {
            cotInternal(op, client_configuration);
        },

        /**
         * Forcefully transforms and applies a complex operation to a model.
         * Should there be any conflicts, the algorithm will undo the
         * conflicting operations that were applied to the model such that the
         * complex operation can be applied.
         *
         * @param complexOp
         *            the complex operation to be forcefully transformed to be
         *            applicable on the model
         * @param client_configuration
         *            the current configuration of the client, which inlcudes
         *            its time stamp, the model, the history, etc
         */
        ecot: function (complexOp, client_configuration) {
            var successful = false;
            var op;
            var collisionOp;
            var orig;
            var removedOps;
            var localCleanOps;
            var collisionsResolved = 0;
            var original_history = client_configuration.original_history;
            var model = client_configuration.model;
            var execution_history = client_configuration.execution_history;
            while (!successful) {
                try {
                    op = complexCOT(complexOp, original_history);
                    op.materialize(model);
                    execution_history.addOperation(op);
                    original_history.addOperation(complexOp);
                    original_history.commit();
                    successful = true;
                } catch (collision) {
                    if (collision.type === "CollisionException") {
                        orig = collision.collision.getOriginalOperation()
                            || collision.collision;
                        collisionOp = orig.complexOp;
                        recordCollision(complexOp, collisionOp);
                        log.info("Transforming remote operation "
                            + JSON.stringify(complexOp)
                            + " against local operation "
                            + JSON.stringify(collisionOp)
                            + " has caused a conflict, rolling back.");

                        removedOps = rollback(collisionOp, client_configuration);
                        cache.flush(); // get rid of all the cached versions.
                        // They are going to be out-dated and
                        // stuff things up!
                        localCleanOps = excludeEffects(collisionOp, removedOps);
                        cache.flush(); // get rid of all the cached versions.
                        // They are going to be out-dated and
                        // stuff things up!
                        reapply(localCleanOps, client_configuration);
                        collisionsResolved += 1;
                    } else {
                        cache.flush();
                        log.error(collision);
                        throw collision;
                    }
                }
            }
            // make sure to invalidate the cache after transforming each complex operation
            cache.flush();
            notifyOnCollision();
        },

        addOnCollisionCallback: function (callback) {
            onCollisionCallbacks.register(callback);
        },

        removeOnCollisionCallback: function (callback) {
            onCollisionCallbacks.unregister(callback);
        },

        calculateTransformation: complexCOT
    };
};
this.sap.galilei.gravity.createBufferedModelListener = function () {

    var events = [];

    var listeners = sap.galilei.gravity.createSubscriptionHandler();

    var rememberEvent = function (event, params) {
        events.push({'event': event, 'params': params});
    };

    return {
        attributeSet: function (node, name, new_value, old_value) {
            rememberEvent('attributeSet', [node, name, new_value, old_value]);
        },

        atomicReferenceSet: function (node, name, new_target, old_target) {
            rememberEvent('atomicReferenceSet', [node, name, new_target, old_target]);
        },

        orderedReferenceAdded: function (node, name, index, target) {
            rememberEvent('orderedReferenceAdded', [node, name, index, target]);
        },

        orderedReferenceRemoved: function (node, name, index, target) {
            rememberEvent('orderedReferenceRemoved', [node, name, index, target]);
        },

        nodeAdded: function (node, initial_attribute_values) {
            rememberEvent('nodeAdded', [node, initial_attribute_values]);
        },

        nodeRemoved: function (node, attribute_values) {
            rememberEvent('nodeRemoved', [node, attribute_values]);
        },

        stringInserted: function (node, attribute, string, position) {
            rememberEvent('stringInserted', [node, attribute, string, position]);
        },

        stringRemoved: function (node, attribute, string, position) {
            rememberEvent('stringRemoved', [node, attribute, string, position]);
        },

        addModelListener: function (listener) {
            listeners.register(listener);
        },

        removeModelListener: function (listener) {
            listeners.unregister(listener);
        },

        notifyListeners: function () {
            $(events).each(function (i, event) {
                listeners.notify([event.event], event.params);
            });
            events = [];
        }
    };
};
this.sap.galilei.gravity.createUmHelper = function () {
    var udisplayname = $.getUrlParam("userDisplayName");
    var uemail = $.getUrlParam("userEmail");
    var uurl = $.getUrlParam("userThumbnailUrl");

    var umHelper = {
        getLoggedInUser: function (userIdSSO) {
            var usrIdText = "User";
            if (userIdSSO !== undefined && userIdSSO.replace(/\s/g, "") !== "") {
                usrIdText = userIdSSO;
            }
            var user = {
                userId: usrIdText,
                displayName: (udisplayname === undefined ? usrIdText : udisplayname),
                thumbnailURL: (uurl === undefined ? "" : uurl),
                emailAddress: (uemail === undefined ? "" : uemail)
            };
            return user;
        }
    };

    return umHelper;
};

/**
 * To allow gravity to run in a cluster setup, queries regarding a collaboration/model
 * (e.g. all cometd messages, export of a model, etc) must convey the model id as a cookie.
 * This is used by the load balancer to route HTTP requests to the server node which is
 * exclusively responsible for a model. In order to not confuse messages for different collaborations
 * accessed in the same browser, the model ID must be reflected in the requested URL.
 *
 * This method sets a cookie for a model and the a path to which the model ID is appended.
 *
 * @param modelId
 * @param path
 * @return
 */
this.sap.galilei.gravity.enableForCluster = function enableForCluster(modelId, path) {
    function pad(s, length) {
        while (s.length < length) {
            s += "X";
        }
        return s;
    }

    // MODIFIED
    // Disable cookie to avoid "Client Cross Frame Scripting Attack" Checkmark code scan issue.
    // The collaboration feature is not used anyway.
    //document.cookie = document.domain + "-pcn="+pad(modelId,64)+"; path=" + path + "/" + modelId;
};

/**
 * Data structure for storing operation potentially subject to transformation.
 * It is used for storing the history in the client as well as for context differences
 * based on the history. It offers constant time computation of context differences.
 *
 * Further optimizations:
 * When computing the differences only use a projection of the history. The difference
 * would point to the original history and indices to mark the ranges that belong to
 * the difference. This way we get around of copying parts of the history.
 *
 *
 */
this.sap.galilei.gravity.createWorkload = function (initial_offsets) {

    /**
     * the workload: a list of lists. Two lists per participants (includes a list of inverses)
     */
    var workload = [];

    /**
     * shortcut to the logger
     */
    var log = sap.galilei.gravity.getLogger("Workload");

    /**
     * offsets into the different workload lists
     */
    var offsets = (initial_offsets && initial_offsets.slice(0)) || [];

    /**
     * the length of the workload
     */
    var length = 0;

    /**
     * keeps track of what objects are manipulated by this workload.
     * This information is used to take shortcuts see requiresTransform().
     */
    var manipulated_objects = {};

    /**
     * the maximum time stamp of this workload. This is needed for taking short cuts
     * and leapfrogging the entire workload.
     */
    var max_timestamp = (initial_offsets && initial_offsets.slice(0)) || [];

    /**
     * keeps the positions of the last committed additions. This is used for rolling back additions.
     */
    var last_committed_pos = [];

    var reportException = function (msg) {
        log.error(msg);
        if (console.trace) {
            console.trace();
        }
        throw msg;
    };

    var getNormalIndex = function (clientOffset) {
        return 2 * clientOffset;
    };

    var getInverseIndex = function (clientOffset) {
        return 2 * clientOffset + 1;
    };

    var getWorkloadIndex = function (operation) {
        var index;
        if (operation.isInverse()) {
            index = getInverseIndex(operation.getClientOffset());
        } else {
            index = getNormalIndex(operation.getClientOffset());
        }
        return index;
    };

    /**
     * Updates max_timestamp to include the provided operation
     */
    var addToMaximumTimeStamp = function (operation) {
        var normalIndex = getNormalIndex(operation.getClientOffset());
        var inverseIndex = getInverseIndex(operation.getClientOffset());
        var timestamp = operation.timestamp();
        max_timestamp[normalIndex] = Math.max((max_timestamp[normalIndex] || 0), (timestamp[normalIndex] || 0));
        max_timestamp[inverseIndex] = Math.max((max_timestamp[inverseIndex] || 0), (timestamp[inverseIndex] || 0));
    };

    var getOffset = function (index) {
        return (offsets[index] || 0);
    };

    /**
     * keeps track of how often an object is manipulated by operations in this workload
     * each time this operation is called the count for the given object is decreased.
     * @param id the object identifier of the object that is manipulated
     */
    var forgetObject = function (id) {
        manipulated_objects[id] -= 1;
    };

    /**
     * forgets the objects an operation manipulates
     * @param operation the operation
     */
    var forgetManipulatedObjects = function (operation) {
        if (operation.getObjectId !== undefined) {
            forgetObject(operation.getObjectId());
        }
        if (operation.getTargetId !== undefined) {
            forgetObject(operation.getTargetId());
        }
        if (operation.getNewTargetId !== undefined) {
            forgetObject(operation.getNewTargetId());
        }
    };

    /**
     * keeps track of how often an object is manipulated by operations in this workload
     * each time this operation is called the count for the given object is increased.
     * @param id the object identifier of the object that is manipulated
     */
    var memorizeObject = function (id) {
        if (manipulated_objects[id] === undefined) {
            manipulated_objects[id] = 0;
        }
        manipulated_objects[id] += 1;
    };

    /**
     * Memorizes the objects an operation manipulates
     * @param operation the operation
     */
    var memorizeManipulatedObjects = function (operation) {
        if (operation.getObjectId) {
            memorizeObject(operation.getObjectId());
        }
        if (operation.getTargetId) {
            memorizeObject(operation.getTargetId());
        }
        if (operation.getNewTargetId) {
            memorizeObject(operation.getNewTargetId());
        }
    };

    var getOperationsSequence = function (originatorIndex) {
        var operationsSequence = workload[originatorIndex];
        // initialise workload if necessary
        if (operationsSequence === undefined) {
            operationsSequence = [];
            workload[originatorIndex] = operationsSequence;
        }
        return operationsSequence;
    };

    var relativeSequenceNumber = function (operation, operationSequenceIndex) {
        var context = operation.getContext();
        var sequenceNumber = context[operationSequenceIndex] || 0;
        return sequenceNumber - getOffset(operationSequenceIndex);
    };

    // we return the public object
    return {
        /**
         * Adds an operation to the workload
         * @param operation the operation (complex or primitive) to add to the workload
         */
        addOperation: function addOperation(operation) {
            var operationCanBeAdded = function (operation) {
                var context = operation.getContext(),
                    operationSequenceIndex;

                if (operation.getFlavor() === "complex") {
                    operationSequenceIndex = getWorkloadIndex(operation.getPrimitiveOps()[0]);
                } else {
                    operationSequenceIndex = getWorkloadIndex(operation);
                }
                if ((context[operationSequenceIndex] || 0) !== (max_timestamp[operationSequenceIndex] || 0)) {
                    return false;
                }
                return true;
            };

            var addPrimitiveOperationToSequence = function (primitiveOperation) {
                var originatorIndex = getWorkloadIndex(primitiveOperation);
                var operationSequence = getOperationsSequence(originatorIndex);
                operationSequence.push(primitiveOperation);
                length += 1;
            };

            var addPrimitiveOperation = function (primitiveOperation) {
                addPrimitiveOperationToSequence(primitiveOperation);
                memorizeManipulatedObjects(primitiveOperation);
                addToMaximumTimeStamp(primitiveOperation);
            };

            var addComplexOperation = function (complexOperation) {
                var primitiveOperations = complexOperation.getPrimitiveOps();
                var ii = primitiveOperations.length;
                for (var i = 0; i < ii; i += 1) {
                    addPrimitiveOperation(primitiveOperations[i]);
                }
            };

            if (!operationCanBeAdded(operation)) {
                reportException("Operation '" + operation + "' cannot be added " +
                    "because it is out of sequence. " +
                    "Maximum timestamp is '" + max_timestamp + "'.");
            }
            if (operation.getFlavor() === "complex") {
                addComplexOperation(operation);
            } else {
                addPrimitiveOperation(operation);
            }
        },

        /**
         * computes the context difference between two operations primitive operations based on this workload.
         * @param operation1
         * @param operation2
         * @param {Array} List of operations contained in operation1's context but not in the context of operation2
         */
        operationContextDifference: function (operation1, operation2) {

            var difference = sap.galilei.gravity.createWorkload(operation2.getContext().slice(0));

            var addToDifference = function (operationSequenceIndex, operation1, operation2) {
                var sequenceNumberOp1 = relativeSequenceNumber(operation1, operationSequenceIndex);
                var sequenceNumberOp2 = relativeSequenceNumber(operation2, operationSequenceIndex);
                var operationSequence = getOperationsSequence(operationSequenceIndex);
                for (var j = sequenceNumberOp2; j < sequenceNumberOp1; j += 1) {
                    difference.addOperation(operationSequence[j]);
                }
            };

            var reportCannotComputeDifference = function (operation1, operation2) {
                var e = "The context difference between " + operation1 + " and " +
                    operation2 + " cannot be entirely covered by this workload.";
                reportException(e);
            };

            var canComputeDifference = function (operationSequenceIndex, sequenceNumberOp1, sequenceNumberOp2) {
                var operationSequence = getOperationsSequence(operationSequenceIndex);
                var sequenceNumberOp1WithinBounds = sequenceNumberOp1 >= 0 && sequenceNumberOp1 <= operationSequence.length;
                var sequenceNumberOp2WithinBounds = sequenceNumberOp2 >= 0 && sequenceNumberOp2 <= operationSequence.length;
                return sequenceNumberOp1WithinBounds && sequenceNumberOp2WithinBounds;
            };

            var isDifferenceInSequence = function (operationSequenceIndex, operation1, operation2) {
                var sequenceNumberOp1 = relativeSequenceNumber(operation1, operationSequenceIndex);
                var sequenceNumberOp2 = relativeSequenceNumber(operation2, operationSequenceIndex);
                if (!canComputeDifference(operationSequenceIndex, sequenceNumberOp1, sequenceNumberOp2)) {
                    reportCannotComputeDifference(operation1, operation2);
                }
                return sequenceNumberOp1 > sequenceNumberOp2;
            };

            var computeDifferenceInSequence = function (operationSequenceIndex, operation1, operation2) {
                if (isDifferenceInSequence(operationSequenceIndex, operation1, operation2)) {
                    addToDifference(operationSequenceIndex, operation1, operation2);
                }
            };

            var context1 = operation1.getContext();
            var context2 = operation2.getContext();
            var maxOperationSequences = Math.max(context1.length, context2.length);
            for (var operationSequenceIndex = 0; operationSequenceIndex < maxOperationSequences; operationSequenceIndex += 1) {
                computeDifferenceInSequence(operationSequenceIndex, operation1, operation2);
            }
            return difference;
        },

        /**
         * Computes the set of all operations that are in the workload but not in the
         * context of operation
         *
         * @param operation
         *            the primitive operation
         * @return array with operations that are in workload but not in the context
         *         of operation
         */
        contextDifference: function (operation) {
            var difference = sap.galilei.gravity.createWorkload(operation.getContext().slice(0));

            var addToDifference = function (operationSequenceIndex, operation) {
                var start = relativeSequenceNumber(operation, operationSequenceIndex);
                var operationSequence = getOperationsSequence(operationSequenceIndex);
                var end = operationSequence.length;
                for (var j = start; j < end; j += 1) {
                    difference.addOperation(operationSequence[j]);
                }
            };

            var cannotComputeDifference = function (operation) {
                var e = "The context difference of " + operation +
                    " cannot be entirely covered by this workload.";
                reportException(e);
            };

            var isDifferenceInSequence = function (operationSequenceIndex, operation) {
                var operationSequence = getOperationsSequence(operationSequenceIndex);
                var relativeOperationSequenceNumber = relativeSequenceNumber(operation, operationSequenceIndex);
                var outOfBounds = relativeOperationSequenceNumber < 0 || relativeOperationSequenceNumber > operationSequence.length;
                if (outOfBounds) {
                    cannotComputeDifference(operation);
                }
                return relativeOperationSequenceNumber <= operationSequence.length;
            };

            var computeDifferenesInSequence = function (operationSequenceIndex, operation) {
                if (isDifferenceInSequence(operationSequenceIndex, operation)) {
                    addToDifference(operationSequenceIndex, operation);
                }
            };

            var ii = workload.length;
            for (var operationSequenceIndex = 0; operationSequenceIndex < ii; operationSequenceIndex += 1) {
                computeDifferenesInSequence(operationSequenceIndex, operation);
            }
            return difference;
        },

        /**
         * selects and removes an operation o_x from diff such that C(o_x) is a
         * subcontext of C(o).
         *
         * @param o
         *            the operation o
         * @returns the selected operation
         * @throws exception if no operation can be select.
         */
        selectAndRemove: function (operation) {
            var ii;
            var i;
            var context = operation.getContext();
            var index;
            var selectedOp;
            var client_workload;
            ii = workload.length;
            var done = false;
            var j = 0;
            /*
             * we go through all client histories and use the operation's context 
             * as indexes into the histories. An operation selectedOp in the context 
             * of operation, can only be found at indexes less that the operation's 
             * context components. Should we not find one in the first iteration, we 
             * go iteratively deeper into the histories (with while loop). 
             * Apparently this never happens
             */
            while (!done) {
                // go through all entries in all client histories--if necessary. 
                // In my test a suitable operation was always found in the first iteration
                done = true; // assume we are done
                // go through all client histories / all component of the context vector
                // We use the components again as indexes into the histories.
                // Any suitable operation must be found at one of the indexes or before.
                for (i = 0; i < ii; i += 1) {
                    index = (context[i] || 0) - j - getOffset(i); // adjust index to iteratively search along each workload if necessary
                    client_workload = workload[i] || [];
                    if (index >= 0 && index < client_workload.length) {
                        selectedOp = client_workload[index];
                        if (selectedOp && selectedOp.isSubContextOf(operation)) {
                            // set it to undefined in order to not disturb the indexes
                            client_workload[index] = undefined;
                            length -= 1;
                            forgetManipulatedObjects(selectedOp);
                            return selectedOp;
                        }
                    }
                    if (index >= 0) {
                        // if we have an index >= 0 then there is at least one workload 
                        // were we haven't searched through to the end.
                        done = false;
                    }
                }
                j += 1;
            }

            reportException("Cannot find a suitable operation in difference.");
        },

        /**
         * removes an operation from the history. However, the operation must be the last operation that was added for
         * @param operation the primitive operation to be removed
         */
        removeOperation: function removeOperation(operation) {

            var removePrimitiveOperation = function (primitiveOperation) {
                var workload_index = getWorkloadIndex(operation);
                var client_workload = getOperationsSequence(workload_index);
                var relativeOperationSequenceNumber = relativeSequenceNumber(operation, workload_index);
                if (relativeOperationSequenceNumber !== (client_workload.length - 1)) {
                    reportException("Only the last operation of a client can be removed");
                }
                client_workload.pop();
                length -= 1;
                max_timestamp[workload_index] -= 1;
                forgetManipulatedObjects(operation);
            };

            var removeComplexOperation = function () {
                var primitveOperations = operation.sequence;
                var i = primitveOperations.length - 1;
                for (; i >= 0; i -= 1) {
                    removeOperation(primitveOperations[i]);
                }
            };

            if (operation.getFlavor() === "complex") {
                removeComplexOperation(operation);
            } else {
                removePrimitiveOperation(operation);
            }
        },

        /**
         * checks whether a given operation must be transformed against any operations in the workload
         */
        requiresTransform: function (operation) {

            var workloadManipulatesNode = function (nodeId) {
                return (manipulated_objects[nodeId] || 0) > 0;
            };

            var workloadManipulatesNodeReturnedByGetter = function (getterName) {
                if (operation[getterName]) {
                    return workloadManipulatesNode(operation[getterName]());
                }
            };

            return workloadManipulatesNodeReturnedByGetter('getObjectId') ||
                workloadManipulatesNodeReturnedByGetter('getNewTargetId') ||
                workloadManipulatesNodeReturnedByGetter('getTargetId');
        },

        /**
         * Returns the time stamp that includes everything in this workload.
         * This is used for leapfrogging the entire workload.
         */
        getMaximumTimeStamp: function () {
            return max_timestamp.slice(0);
        },

        /**
         * Garbage collects this workload by removing all operations older than
         * the provided time stamp.
         * @param timestamp the time stamp prior to which operations are subject to garbage collection.
         */
        collectGarbage: function (timestamp) {
            // go through the time stamp's components and evict all operations before
            var i;
            var ii = timestamp.length;
            var index;
            var client_workload;
            for (i = 0; i < ii; i += 1) {
                index = (timestamp[i] || 0) - getOffset(i);
                client_workload = workload[i] || [];
                // evict all operations before index
                client_workload.splice(0, index);
                offsets[i] = timestamp[i];
                last_committed_pos[i] -= index;
            }
        },

        /**
         * Commits recent additions (after the last commit) to the workload
         */
        commit: function () {
            var i;
            var ii = workload.length;
            var client_workload;
            for (i = 0; i < ii; i += 1) {
                client_workload = workload[i] || [];
                last_committed_pos[i] = client_workload.length;
            }

        },

        /**
         * rolls back all additions to the workload that happend after the last commit.
         */
        rollback: function () {
            var i;
            var ii = workload.length;
            var committed_pos;
            var client_workload;
            var ops_to_rollback;
            for (i = 0; i < ii; i += 1) {
                client_workload = workload[i] || [];
                committed_pos = last_committed_pos[i] || 0;
                ops_to_rollback = client_workload.length - committed_pos;
                client_workload.splice(committed_pos, ops_to_rollback);
                max_timestamp[i] -= ops_to_rollback;
            }
        },

        /**
         * returns the number of operations in this workload
         * @return {Number} the number of operations in this workload
         */
        getLength: function () {
            return length;
        },

        toString: function () {
            return workload.toString();
        },

        /**
         *
         */
        contains: function (operation) {
            var index = getWorkloadIndex(operation);
            var client_workload = getOperationsSequence(index);
            var relative_index = relativeSequenceNumber(operation, index);
            var indexOutOfBounds = relative_index < 0 || relative_index >= client_workload.length;
            if (indexOutOfBounds) {
                return false;
            } else {
                var op = client_workload[relative_index];
                return op && operation.operation_id === op.operation_id;
            }
        },

        /**
         * Returns the time stamp from whereupon operations are covered in this workload.
         */
        getMinimumTimestamp: function () {
            return offsets.slice(0);
        }
    };
};
(function AnnotatingModel() {
    this.sap.galilei.gravity.createAnnotatingModelWrapper = function createAnnotatingModelWrapper(wrappedModel) {
        var wrapper = {},
            participantId;

        function inheritMethods(inheritor, object) {
            var property;
            for (property in object) {
                if (object.hasOwnProperty(property) && typeof(object[property]) === 'function') {
                    inheritor[property] = object[property];
                }
            }
        }

        inheritMethods(wrapper, wrappedModel);

        wrapper.setParticipantId = function (id) {
            participantId = id;
        };

        wrapper.addNode = function (identity, attribute_values) {
            var node = wrappedModel.addNode(identity, attribute_values),
                participantNode = wrappedModel.getNode(participantId);
            if (node && participantNode) {
                node.setAtomicReference('creator', participantNode);
            }
            return node;
        };

        return wrapper;
    };
}());
this.sap.galilei.gravity.createModelInitializer = function (modelHandler) {

    var customInitializer;

    var GRAVITY_PARTICIPANTS = "GRAVITY_PARTICIPANTS";
    var GRAVITY_COLORS = "GRAVITY_COLORS";

    function createParticipantStructure(model) {
        if (!model.getNode(GRAVITY_PARTICIPANTS)) {
            model.addNode(GRAVITY_PARTICIPANTS);
        }
    }

    function createColorStructure(model) {
        if (!model.getNode(GRAVITY_COLORS)) {
            model.addNode(GRAVITY_COLORS);
        }
    }

    function isModelInitialized() {
        var model = modelHandler.getModel();
        return model.getNode(GRAVITY_PARTICIPANTS) !== undefined && model.getNode(GRAVITY_COLORS) !== undefined;
    }

    function invokeGenericInitialize() {
        modelHandler.changeModel(function (model) {
            createColorStructure(model);
            createParticipantStructure(model);
        }, "generic model initialization");
    }

    function invokeCustomInitializer() {
        if (customInitializer) {
            modelHandler.changeModel(customInitializer, "custom model initialization");
        }
    }

    function initializeModel() {
        if (!isModelInitialized()) {
            invokeGenericInitialize();
            invokeCustomInitializer();
            modelHandler.protectAgainstUndo();
        }
    }

    return {
        initialize: function () {
            if (modelHandler.isReadOnly()) {
                throw "Cannot initialize read-only model.";
            } else {
                initializeModel();
            }
        },

        setCustomInitializer: function (command) {
            customInitializer = command;
        }
    };
};
this.sap.galilei.gravity.createParticipantInitializer = function (modelHandler) {

    var onParticipantInitialized = sap.galilei.gravity.createCallbackHandler(),
        logger = sap.galilei.gravity.getLogger("ColorPicker");

    function createAdditionalColor(model) {
        var color, colorsNode, nextColorCode;

        colorsNode = model.getNode("GRAVITY_COLORS");
        nextColorCode = colorsNode.getOrderedReference("color").length;
        color = model.addNode("GRAVITY_COLOR_" + nextColorCode, {
            'color': nextColorCode
        });
        colorsNode.addOrderedReference("color", nextColorCode, color);
        return color;
    }

    function getOrCreateParticipant(model, userData) {
        var allParticipantsNode,
            participant = model.getNode(userData.userId);

        if (!participant && userData && userData.userId) {
            participant = model.addNode(userData.userId, userData);
            allParticipantsNode = model.getNode("GRAVITY_PARTICIPANTS");
            allParticipantsNode.addOrderedReference("participants", 0, participant);
        }
        return participant;
    }

    function pickColor(model, participant) {
        var freeColor = createAdditionalColor(model);
        freeColor.setAtomicReference("assignedTo", participant);
    }

    function initializeParticipantInternal(userData) {
        var change;

        change = modelHandler.changeModel(function (model) {
            var participant = getOrCreateParticipant(model, userData);
            pickColor(model, participant);
        }, "Assigning color '" + "' to participant '" + userData.displayName + "'.");
        modelHandler.protectAgainstUndo();

        change.onCollision(function () {
            initializeParticipantInternal(userData);
        });

        change.onAcknowledge(function () {
            onParticipantInitialized.notify();
        });
    }

    function hasColorAssigned(participantId) {
        var assignedColors,
            participantNode = modelHandler.getModel().getNode(participantId);
        if (participantNode) {
            return participantNode.getReverseAtomicReferences("assignedTo").length > 0;
        } else {
            return false;
        }
    }

    return {
        /**
         * initializes a participant and picks a color for him.
         * @param userData
         */
        initializeParticipant: function (userData) {
            if (hasColorAssigned(userData.userId)) {
                onParticipantInitialized.notify();
            } else {
                initializeParticipantInternal(userData);
            }
        },

        /**
         * Registers a callback which is called once a color was picked.
         * @param callback
         */
        addOnParticipantInitialized: function (callback) {
            onParticipantInitialized.register(callback);
        }
    };
};
