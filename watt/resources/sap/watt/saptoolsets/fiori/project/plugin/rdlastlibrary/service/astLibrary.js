define(["./astPrint"],
    function (astPrint) {
        /**
         * Polyfill - This if statement is used to workaround the fact that phantomJS
         * doesn't support 'bind'. So, instead of returning a function, it return 'undefined'.
         * Polyfill is the workaround for that.
         */
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    Fnop = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof Fnop && oThis
                            ? this
                            : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                Fnop.prototype = this.prototype;
                fBound.prototype = new Fnop();

                return fBound;
            };
        }

        var __nodePropertyList = {
            type:true,
            from:true,
            targetEntity:true,
            viaBacklinkField:true,
            viaEntity:true,
            cardinality:true,
            defaultReturnParameter:true,
            query:true
        };
        var __stringPropertyList = {
            fullyQualifiedName:true,
            name:true
        };

        function ParseTree(tree) {
            tree = tree || {};

            var refTable = {}, todoDeref = [], roots = [];
            var parseTree = this;
            jQuery.each(tree.nodes || [], function () {
                var node = this;
                // enrich node with getter for arrays:

                jQuery.each(node || {}, function (propertyName, child) {
                    if (jQuery.isArray(child)) {
                        if (propertyName === "positions") {
                            node[_getGetter(propertyName)] = _getNodeWithFixedPositions.bind(child);
                        } else {
                            node[_getGetter(propertyName)] = _getArray.bind(child);
                            if (propertyName.charAt(propertyName.length - 1) === "s") {
                                node[_getGetter(propertyName, 1)] = _getArrayElement.bind(child);
                            }
                        }
                    } else if (propertyName in __nodePropertyList) {
                        node[_getGetter(propertyName)] = _getNode.bind(child);
                    } else if (child && typeof child.$node_id !== "undefined" && Object.keys(child).length === 1) { // todo validate...
                        todoDeref.push({
                            "n":node,
                            "propertyName":propertyName
                        });
                    } else if (propertyName in __stringPropertyList) {
                        node[_getGetter(propertyName)] = _getString.bind(null, child);
                    }
                });
                node.instanceOf = _instanceOf.bind(node);
                node.print = astPrint.printNode.bind(null, parseTree, node);

                refTable[node.$id] = node;
                refTable[node.fullyQualifiedName] = node;
            });

            jQuery.each(todoDeref, function () {
                this.n[this.propertyName] = _deref(this.n[this.propertyName].$node_id);
            });

            jQuery.each(tree.roots || [], function () {
                roots.push(_deref(this));
            });

            function _deref(id) {
                return refTable[id];
            }

            function _getArray() {
                var tree = this;
                if (tree.length && (typeof tree[0].$node_id !== "undefined")) {
                    jQuery.each(tree, function (i, node) {
                        tree[i] = _deref(node.$node_id);
                    });
                }
                return tree;
            }

            function _getArrayElement(name) {
                var notResolved = this.length && (typeof this[0].$node_id !== "undefined");
                var res = null;
                jQuery.each(this, function () {
                    var node = notResolved ? _deref(this.$node_id) : this;
                    if (node.name === name) {
                        res = node;
                        return false;
                    }
                });
                return res;
            }

            function _getNodeWithFixedPositions() {
                var positions = this;
                jQuery.each(positions, function () {
                    var resourceName = _getResourceName(this.src);
                    if (resourceName) {this.src = resourceName;}
                });
                return positions;
            }

            function _getIssueArrayWithFixedPositions() {
                var positions = this;
                jQuery.each(positions, function () {
                    var resourceName = _getResourceName(this.source);
                    if (resourceName) {this.source = resourceName;}
                });
                return positions;
            }

            function _getGetter(pName, cut) {
                return "get" + pName.charAt(0).toUpperCase() + pName.substring(1, pName.length - (cut || 0));
            }

            function _getResourceName(index) {
                var source = tree.sources[index];
                return source && source.resourceName || null;
            }

            function _getNode() {
                return _deref(this.$node_id);
            }

            function _getString(str) {
                return str;
            }

            function _instanceOf() {
                if (typeof this.$intf === "undefined") {return false;}

                var res = false, node = this, $intf = node.$intf;

                jQuery.each(arguments, function (i, value) {
                    if (!value) {return;}

                    if ($intf === value) {
                        res = true;
                        return false;
                    }
                    var intfBefore = $intf;
                    var intf = tree.interfaces[intfBefore];
                    while (intf !== intfBefore) {
                        if (intf === value) {
                            res = true;
                            return false;
                        }
                        intfBefore = intf;
                        intf = tree.interfaces[intf];
                    }
                });
                return res;
            }

            /*------------------ PUBLIC API ------------------*/
            this.getSymbol = _deref;
            this.getRoots = function () {
                return roots;
            };
            this.getParsingIssues = function () {
                return _getIssueArrayWithFixedPositions.apply(tree.issues);
            };
            this.isFileInAst = function (fileUri) {
                var sources = tree.sources;
                var res = false;
                jQuery.each(sources, function () {
                    if (this.resourceName === fileUri) {
                        res = true;
                        return false;
                    }
                });
                return res;
            };
            this.getMasterContext = function (context) {
                context = context || roots;
                if (context.length === 1) {
                    context = context[0];
                    return context.isExplicitlyDefined ? context : this.getMasterContext(context.getNestedContexts());
                }
                return null;
            };
            this.getSources = function () {
                return tree.sources;
            };
            this.isSuccess = function () {
                return tree.isSuccess;
            };
            this.getContErrors = function () {
                return tree.cont_errors ? _getIssueArrayWithFixedPositions.apply(tree.cont_errors) : [];
            };
            this.toRdlString = function () {
                try {
                    var app = this.getMasterContext();
                    if (app) {return app.print();}
                } catch (e) {
                    top.console.error(e.message);
                    //TODO: log error...
                }
                return null;
            };
        }

        return {
            /**
             * Returns a River AST Library object
             * @param tree
             * @returns {ParseTree}
             */
            getRiverAstLibrary:function (tree) {
                return new ParseTree(tree);
            }
        };
    }
);