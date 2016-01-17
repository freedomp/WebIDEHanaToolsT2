define(["sap/watt/lib/lodash/lodash", "sap/watt/lib/orion/javascript/esprima/esprimaVisitor", "sap/watt/lib/orion/ui/esprima/esprima", "sap/watt/lib/orion/ui/escodegen/escodegen.browser"],
	function(_, visitor) { // Don't add a variable for 'esprima' - for some reason is makes the 'esprima' variable be undefined

		/**
		 * Convert an esprima ojbect representing an argument into a string.
		 * The given argument type is expected to be either MemberExpression, Identifier, or ThisExpression
		 *
		 * @param {object} oArgument - an esprima object
		 * @returns {string} String representation of the arguments. Dots are replaced with '_', and 'this' is replaced with 'that'.
		 * An empty string is returned for unexpected input
		 */
        var _getArgumentString = function(oArgument) {
            if (!oArgument) {
                return "";
            }
            /* eslint-disable no-undef */
            if (oArgument.type === esprima.Syntax.MemberExpression) {
                return _getArgumentString(oArgument.object) + "_" + oArgument.property.name;
            } else if (oArgument.type === esprima.Syntax.Identifier) {
                return oArgument.name;
            } else if (oArgument.type === esprima.Syntax.ThisExpression){ // Use the 'that' replacement
                return "that";
            } else {
                return "";
            }
            /* eslint-enable no-undef */
        };

		// A visitor function to collect hooks information
		function _getHooksCallback(node, context) {
            /* eslint-disable no-undef */
			if (node.type === esprima.Syntax.CallExpression) {
				// If a callee name exist, and it starts with 'extHook'
				if (node.callee && node.callee.property && node.callee.property.name && node.callee.property.name.indexOf("extHook") === 0) {
					// If the callee is called on 'this'
					if (node.callee.object && node.callee.object.type === esprima.Syntax.ThisExpression) {
						var hookName = node.callee.property.name;
						var hookArgs = [];
						if (node.arguments) {
							jQuery.each(node.arguments, function(idx, oArgument) { // TODO-GS special case for 'this'
								var sArgument = _getArgumentString(oArgument);
								hookArgs.push(sArgument);
							});
						}
						context.hooksObj[hookName] = hookArgs;
					}
				}
			}
			/* eslint-enable no-undef */
			return true;
		}

		/**
		 * Get the list of hooks which are applicable for the given controller
		 *
		 * @param sControllerJs - the controller code as string
		 * @returns An array of hook info object. The object has a 'name' property with the hook name,
		 *  and 'args' property with an array of the arguments of the hook
		 * @throw esprima error if given controller has invalid syntax
		 */
		var _getHooks = function(sControllerJs) {
			/* eslint-disable no-undef */
			var ast = esprima.parse(sControllerJs, {});
			/* eslint-enable no-undef */
			var visitContext = {
                hooksObj: {} // Use an object and not array to avoid duplications
			};
			visitor.visit(ast, visitContext, _getHooksCallback);

            var array = _.map(visitContext.hooksObj, function(value, key) {
                return {name: key, args: value};
            });

            array = _.sortBy(array, "name");
			return array;
		};

		// A visitor function to collect hooks information
		function _isHookExtendedCallback(node, context) {
            /* eslint-disable no-undef */
			if (node.type === esprima.Syntax.ObjectExpression) {
			/* eslint-enable no-undef */
				// Does the object experssion has a 'key' property, and its 'name' is the requested hook?
				if (node.properties && node.properties.length > 0) {
					jQuery.each(node.properties, function(idx, oProperty) {
						if (oProperty.key && oProperty.key.name === context.hookName) {
							context.isHookExtended = true;
							return false; // No need to continue the lookup
						}
					});
				}
			}
			return true;
		}

		/**
		 * Checks if the given hook exist in the given custom controller
		 *
		 * @param sHookName - the name of the hook
		 * @param sCustomControllerJs - the custom controller code as string
		 * @returns true if found, false otherwise
		 * @throw esprima error if given controller has invalid syntax
		 */
		var _isHookExtended = function(sHookName, sCustomControllerJs) {
			if (!sCustomControllerJs) {
				return false;
			}
			/* eslint-disable no-undef */
			var ast = esprima.parse(sCustomControllerJs, {});
			/* eslint-enable no-undef */
			var visitContext = {
				hookName: sHookName,
				isHookExtended: false
			};
			visitor.visit(ast, visitContext, _isHookExtendedCallback);

			return visitContext.isHookExtended;
		};

		function _removeHookCallback(node, context) {
            /* eslint-disable no-undef */
			if (node.type === esprima.Syntax.ObjectExpression) {
            /* eslint-enable no-undef */
				// A property is a definition
				if (node.properties) {
					jQuery.each(node.properties, function(idx, oProperty) {
						if (oProperty.key && oProperty.key.name === context.hookName) {
                            node.properties.splice(idx, 1);
							return false; // No need to continue
						}
					});
				}
			}
			return true;
        }

		/**
		 * Remove the given hook from the given custom controller
		 *
		 * @param sHookName - the name of the hook to be removed
		 * @param sCustomControllerJs - the custom controller code as string
		 * @returns the modified custom controller code as string
		 * @throw esprima error if given controller has invalid syntax
		 */
		var _removeHook = function(sHookName, sCustomControllerJs) {
            /* eslint-disable no-undef */
            var ast = esprima.parse(sCustomControllerJs, {range: true, tokens: true, comment: true});
            ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
			var visitContext = {
				hookName: sHookName
			};
            visitor.visit(ast, visitContext, _removeHookCallback);

            var modified = escodegen.generate(ast, {
				comment: true,
				format: {
					quotes : "double",
					indent: {
						style : "\t"
					}
				}
			});
            /* eslint-enable no-undef */
            return modified;
		};

		function _addHookCallback(node, context) {
            /* eslint-disable no-undef */
			if (node.type === esprima.Syntax.ObjectExpression) {
			/* eslint-enable no-undef */
				if (node.properties) {
                    // The hook definition by itself isn't a valid JS that we can parse.
                    // Workaround it by adding it as a property in an object.
                    // Example: "extHookOnInit: function() {}" will become "var dummy = {extHookOnInit: function() {}};"
                    var dummyJs = "var dummy = {" + context.hook + "};";
                    /* eslint-disable no-undef */
                    var dummyHookAst = esprima.parse(dummyJs, {range: true, tokens: true, comment: true});
                    dummyHookAst = escodegen.attachComments(dummyHookAst, dummyHookAst.comments, dummyHookAst.tokens);
                    /* eslint-enable no-undef */
                    var hookAst = dummyHookAst.body[0].declarations[0].init.properties[0];
                    // Add the hook ast as a new property in the controller object
                    node.properties.push(hookAst);
                    return false;
				}
			}
			return true;
        }

		/**
		 * Add the given hook to the given custom controller
		 *
		 * @param sHook - the code of the hook to be added
		 * @param sCustomControllerJs - the custom controller code as string
		 * @returns the modified custom controller code as string
		 * @throw esprima error if given controller has invalid syntax
		 */
		var _addHook = function(sHook, sCustomControllerJs) {
            /* eslint-disable no-undef */
            var ast = esprima.parse(sCustomControllerJs, {range: true, tokens: true, comment: true});
            ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

			var visitContext = {
				hook: sHook
			};
            visitor.visit(ast, visitContext, _addHookCallback);

            var modified = escodegen.generate(ast, {
				comment: true,
				format: {
					quotes : "double",
					indent: {
						style : "\t"
					}
				}
			});
            /* eslint-enable no-undef */
            return modified;
		};

		return {
			getHooks: _getHooks,
			isHookExtended: _isHookExtended,
			removeHook: _removeHook,
			addHook: _addHook,

			// Internal functions
			_getArgumentString: _getArgumentString
		};
	});