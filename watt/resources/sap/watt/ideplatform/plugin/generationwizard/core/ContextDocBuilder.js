define({
	initContextDocBuilder : function() {
		var SPEC_MAJOR_VERSION = 1;
		var SPEC_MINOR_VERSION = 0; // any integer between 0 and 99 (inclusive)
		var SPEC_VERSION = SPEC_MAJOR_VERSION * 100 + SPEC_MINOR_VERSION;

		var global = this; // the JavaScript context in which the script was executed.

		/**
		 * doc javascript object
		 */
		var doc = {
			version : "1.0",// + SPEC_MAJOR_VERSION + "." + ((SPEC_MINOR_VERSION < 10) ? "0" : "") + SPEC_MINOR_VERSION,

			Document : function(definition, context) {
				return new _Document(definition, context);
			}
		};

		/**
		 * runtime related prototypes
		 */

		function _Context(parentContext, owner) {
			if (parentContext) {
				for ( var k in parentContext) {
					this[k] = parentContext[k];
				}

				this.parent = parentContext.owner;
			}
			Object.defineProperty(this, "owner", {
				value : owner,
				enumerable : true,
				writable : false,
				configurable : false
			});
			if (!this.root) {
				this.root = owner;
			}
		}

		function _Event(who, what, oldValue, newValue, realValue) {
			this.who = who;
			this.what = what;
			this.oldValue = oldValue;
			this.newValue = newValue;
			this.realValue = realValue;
		}
		_Event.prototype = {};
		_Event.prototype.name = "doc.Event";

		function _LoadEvent(who) {
			_Event.apply(this, arguments);
		}

		_LoadEvent.prototype = new _Event();
		_LoadEvent.prototype.name = _Event.prototype.name + ".LoadEvent";
		_Event.LoadEvent = _LoadEvent;

		function _ModifyEvent(who, what, oldValue, newValue, realValue) {
			_Event.apply(this, arguments);
		}
		_ModifyEvent.prototype = new _Event();
		_ModifyEvent.prototype.name = _Event.prototype.name + ".ModifyEvent";

		_Event.ModifyEvent = _ModifyEvent;

		function _ChildChangedEvent(who, what, oldValue, newValue, realValue) {
			_ModifyEvent.apply(this, arguments);
		}
		_ChildChangedEvent.prototype = new _ModifyEvent();
		_ChildChangedEvent.prototype.name = _ModifyEvent.prototype.name + ".ChildChangedEvent";

		_ModifyEvent.ChildChangedEvent = _ChildChangedEvent;

		function _ReferencedObjectChanged(who, what, oldValue, newValue, realValue) {
			_ChildChangedEvent.apply(this, arguments);
		}
		_ReferencedObjectChanged.prototype = new _ChildChangedEvent();
		_ReferencedObjectChanged.prototype.name = _ChildChangedEvent.prototype.name + ".ReferencedObjectChanged";

		_ChildChangedEvent.ReferencedObjectChanged = _ReferencedObjectChanged;

		_Event.prototype.toString = function() {
			return "event <" + this.name + ">: <who:" + this.who.classID + "#" + this.who.id + " what=<" + this.what + "> old: <"
					+ this.oldValue + "> new: <" + this.newValue + ">";
		};

		/** basic building blocks
		 * ----------------------
		 * Object
		 * Element
		 * Annotation
		 * Privilege
		 */
		var stoplist = {
			id : true,
			revision : true,
			classID : true,
			append : true,
			remove : true,
			resolve : true,
			docElements : true,
			modelElements : true,
			dependents : true,
			find : true,
			'#subscribers' : true,
			'#referring' : true,
			'#attributes' : true,
			'#context' : true,
			observe : true,
			quiet : true,
			silence : true,
			activate : true,
			parent : true,
			on : true,
			'#on' : true
		};

		Object.seal(stoplist);

		doc.stoplist = stoplist;

		function _Object(definition, context) {
			context = new _Context(context, this);
			var refs = (context.root) ? context.root.__$references$__ : null;
			var properties = [];

			// do not send notifications until the construction of the new object is over
			this.silence();

			// our hidden friend that keep the values to himself
			var colonelPrivate = {};
			// keep track of the objects refering to us
			Object.defineProperty(this, '#referring', {
				value : {}
			});

			colonelPrivate.context = context;
			colonelPrivate.definition = definition;

			Object.defineProperty(this, '#context', {
				value : context
			});

			Object.defineProperty(this, "remove", {
				value : _remove,
				configurable : false,
				enumerable : true
			});

			Object.defineProperty(this, "resolve", {
				value : function(reference, silentlyFail, optionalUsedByProperty) {
					return resolveReference.call(this, reference, undefined, context, silentlyFail, optionalUsedByProperty).call(this);
				},
				configurable : false,
				enumerable : true
			});

			Object.defineProperty(this, "parent", {
				value : function() {
					return context.parent;
				},
				configurable : false,
				enumerable : false
			});

			Object.defineProperty(this, "append", {
				value : function append(prop, v, attributes) {
					setAndTell(this, context, colonelPrivate, prop, attributes, true).call(this, v);
					return this;
				},
				configurable : false,
				enumerable : true
			});

			Object.defineProperty(this, "root", {
				value : function() {
					return context.root;
				},
				configurable : false,
				enumerable : false
			});

			//TODO: buggy implementation, docElements does not reflect changes done during append(), same for
			// the definition of docElements in doc-proxy.
			this.docElements = function() {
				return properties.slice(0).concat([ 'classID', 'revision' ]);
			};

			this.modelElements = function() {
				var aPropertyNames = Object.getOwnPropertyNames(this);
				var aFiltered = [];
				for (var i = 0, len = aPropertyNames.length; i < len; i++) {
					var item = aPropertyNames[i];
					if (!doc.stoplist[item]) {
						aFiltered.push(item);
					}
				}
				return aFiltered;
			};

			if (definition) {
				Object.defineProperty(this, "id", {
					value : ((definition.id != undefined) ? definition.id : generateID(definition.classID)),
					writable : false,
					enumerable : true,
					configurable : false
				});

				if (refs) {
					refs[this.id] = this;
				}
				this.revision = (definition.revision) ? definition.revision : 1;
				this.classID = (definition.classID) ? definition.classID : "doc.Object";

				// open question: shall we use 'getOwnPropertyNames' instead of 'keys'?
				// the reason I chose 'keys' is that it might be useful for injection of attributes and behavior at runtime.
				properties = Object.keys(definition).filter(function(p) {
					return !stoplist.hasOwnProperty(p) && (p.indexOf('.') == -1);
				});
				var attributesPool = Object.keys(definition).filter(function(p) {
					return p.indexOf('.') != -1;
				});
				var attributesMap = {};

				attributesPool.forEach(function(p) {
					var list = p.split('.');
					var prop = list[0];
					var rest = list[1];
					if (!attributesMap.hasOwnProperty(prop)) {
						attributesMap[prop] = {};
					}
					
					attributesMap[prop][rest] = definition[p];
				});

				Object.defineProperty(this, '#attributes', {
					value : attributesMap
				});

				properties.forEach(function(prop) {
					var attributes = attributesMap[prop];
					this.append(prop, definition[prop], attributes);
				}, this);
			} else {
				Object.defineProperty(this, "id", {
					value : generateID(),
					writable : false,
					enumerable : true,
					configurable : false
				});
				this.revision = 1;
				this.classID = "doc.Object";
				if (refs) {
					refs[this.id] = this;
				}
			}

			this.on(_ReferencedObjectChanged, function(event, stuff) {
				if (event.who !== this) {
					if (stuff) {
						stuff.forEach(function(extra) {
							var propName = extra.prop;
							this.raise(new _ReferencedObjectChanged(this, propName, undefined, undefined, undefined));
						}, this);
					}
					
				}
				
			});

			this.activate();

			// internal functions

			function _remove(prop) {
				this[prop] = undefined; // trigger the observer
				delete this[prop]; // remove this property
				delete colonelPrivate[prop]; // and its shadow
				delete this['#attributes'][prop]; // and its attributes
				return this;
			}
		}

		_Object.prototype = {};

		_Object.prototype.silence = function silence() {
			if (this.quiet > 0) {
				this.quiet++;
			} else {
				this.quiet = 1;
			}
		};

		_Object.prototype.activate = function activate() {
			if (this.quiet > 0) {
				this.quiet--;
			}
		};

		_Object.prototype.resolveID = function resolveID(id) {
			return this.root() && this.root().__$references$__[id];
		};

		_Object.prototype.dependents = function dependent(includeSelf) {
			var list = Object.keys(this['#subscribers']).map(this.resolveID, this);
			return (includeSelf) ? list : list.filter(function(x) {
				return x !== this;
			}, this);
		};

		__eventLevel = 0;
		_Object.prototype.raise = function raise(event) {
			try {
				__eventLevel++;

				if (this.quiet > 0 || !this['#subscribers']) {
					return;
				}

				var subscribers = this['#subscribers'];
				Object.keys(subscribers).forEach(function(key) {
					var info = subscribers[key];
					var subscriber = this.resolveID(key);

					if (!subscriber) {
						return;
					}

					var relevantEvents = Object.keys(info.events).filter(function(eventName) {
						var e = info.events[eventName];
						return (event instanceof e.event) && e.filter(subscriber, event);
					});

					// no relevant events
					if (relevantEvents.length == 0) {
						return;
					}

					var stuff = (info.events[event.name]) ? (info.events[event.name].stuff) : undefined;

					// only the generic notify function exists
					if (!subscriber['#on']) {
						subscriber.notify(event, stuff);
					} else {
						// search for the best specific event handler

						var handler = subscriber['#on'][event.name];
						if (handler) {
							handler.call(subscriber, event, stuff);
						} else {
							var lastchecked = event.name;
							while (lastchecked !== _Event.prototype.name && lastchecked.indexOf('.') != -1) {
								var supertype = lastchecked.substring(0, lastchecked.lastIndexOf('.'));
								handler = subscriber['#on'][supertype];
								if (handler) {
									if (!stuff) {
										// maybe there is a some stuff for the supertype event?
										stuff = (info.events[supertype]) ? (info.events[supertype].stuff) : undefined;
									}
									
									handler.call(subscriber, event, stuff);

									// now register event handler of the supertype for the invoked event
									do {
										var nextcut = event.name.indexOf('.', supertype.length + 1);
										if (nextcut == -1) {
											nextcut = event.name.length;
										}
										supertype = event.name.substring(0, nextcut);
										subscriber['#on'][supertype] = handler;
									} while (supertype.length != event.name.length);
									return;
								} else {
									lastchecked = supertype;
								}
							}

							subscriber.notify(event);
						}
					}
					
				}, this); // forEach
			} finally {
				__eventLevel--;
			}
			
		};

		// trigger the notification of the events to all interested parties
		_Object.prototype.letThemKnowIChanged = function letThemKnowIchanged(event) {
			if (this.quiet > 0) {
				return;
			}

			// ModifyEvent is already handled by the setAndTell and ReferencedObjectChanged doesn't increment the revision
			if (event instanceof _ChildChangedEvent && !(event instanceof _ReferencedObjectChanged)) {
				this.revision++;
			}

			if (!(event instanceof _ChildChangedEvent) || (event.oldValue === undefined)) {
				// either one of my children changed or one of my properties now has a value
				if (event.who !== this || !(event instanceof _ReferencedObjectChanged)) {
					this.raise(new _ReferencedObjectChanged(this, event.what, event.oldValue, event.newValue, event.realValue));
				}
				
			}
			

			var parent = this.parent();
			if (parent && (parent instanceof _Object || (typeof parent.notify === "function"))) {
				this.silence();
				parent.letThemKnowIChanged(new _ChildChangedEvent(this, event.what, event.oldValue, event.newValue, event.realValue));
				this.activate();
			}
		};

		_Object.prototype.find = function(classID) {
			var result = [];
			var classFunction;
			var visited = {};

			if (typeof (classID) === "function") {
				classFunction = classID;

			} else {
				if (typeof (classID) !== 'string') {
					return result;
				}

				classFunction = doc.functionLookup(classID);
			}
			if (typeof (classFunction) !== 'function') {
				return result;
			}

			_find.call(this);
			return result;

			function _find() {
				// avoid cyclic, infinite, traversal of the graph
				if (visited[this.id]) {
					return;
				}
				visited[this.id] = true;

				this.docElements().forEach(function(x) {
					_inspect(this[x]);
				}, this);
				return;

				function _inspect(v) {
					// Array.isArray doesn't work for the Proxy objects and
					// neither for the _Array hack
					if ((v instanceof Array) || ((typeof (v) === "object") && v['#proxy'])) {
						v.forEach(function(a) {
							_inspect(a);
						}, this);
					} else {
						if (v instanceof classFunction) {
							result.push(v);
						}

						if (v instanceof _Object) {
							_find.call(v);
						}
					}
				}
			}
		};

		function _same(o1, o2) {
			if (o1 === o2) {
				return true;
			}
			

			var props1 = Object.keys(o1);
			var props2 = Object.keys(o2);
			if (props1.length != props2.length) {
				return false;
			}
			

			return props1.every(function(p) {
				return o1[p] == o2[p];
			});
		}
		

		_Object.prototype.inform = function(observer, event, optionalFilter, optionalStuff) {
			if (!optionalFilter) {
				optionalFilter = function() {
					return true;
				};
			}
			if (!event) {
				event = _Event;
			}
			if (!this.hasOwnProperty('#subscribers')) {
				this['#subscribers'] = {};
			}

			var existing = this['#subscribers'][observer.id];
			if (!existing) {
				existing = {
					events : {}
				};
			}
			
			var optional = (optionalStuff) ? [ optionalStuff ] : [];
			// event handler already exists
			if (existing.events[event.prototype.name]) {
				var existingStuff = existing.events[event.prototype.name].stuff;
				if ((optionalStuff === undefined) || !existingStuff.some(function(o) {
					return _same(o, optionalStuff);
				})) {
					optional = optional.concat(existingStuff);
				} else {
					optional = existingStuff;
				}
			}
			
			existing.events[event.prototype.name] = {
				event : event,
				filter : optionalFilter,
				stuff : optional
			};

			this['#subscribers'][observer.id] = existing;
		};

		_Object.prototype.notify = function(event, stuff) {
			console.log("#" + this.id + ":\t" + event.name + " event: <who=" + event.who.classID + "#" +
			event.who.id + " what=<" + event.what + "> old=<" + event.oldValue + "> new=<" + event.newValue +
			"> stuff=" + JSON.stringify(stuff));
		};

		_Object.prototype.on = function(event, handler) {
			if (!this['#on']) {
				Object.defineProperty(this, '#on', {
					value : {},
					configurable : true
				});
			}
			

			if (handler) {
				this['#on'][event.prototype.name] = handler;
			}
			
			return this['#on'][event.prototype.name];
		};

		_Object.prototype.toJSON = function() {
			var properties = this.docElements();
			var output = {};
			for (var i = 0, len = properties.length; i < len; i++) {
				var prop = properties[i];
				var value = this[prop];
				if (value != undefined) {
					// overcome a Chrome bug - this fix doesn't work for nested arrays
					if (value["#proxy"]) {
						var array = new Array(value.length);
						for ( var j = 0; j < array.length; j++) {
							array[j] = value[j];
						}
						
						value = array;
					}
					
					output[prop] = value;
				}
			}

			return output;
		};

		_Object.prototype.toJSONRec = function() {
			var properties = this.docElements();
			var output = {};
			for (var i = 0, len = properties.length; i < len; i++) {
				var prop = properties[i];
				var value = this[prop];
				if (value !== undefined) {
					// overcome a Chrome bug - this fix doesn't work for nested arrays
					if (value["#proxy"] || value instanceof Array) {
						var array = new Array(value.length);
						for ( var j = 0; j < array.length; j++) {
							array[j] = value[j].toJSONRec();
						}
						output[prop] = array;
					}
					else if (value.toJSONRec) {
					    output[prop] = value.toJSONRec();
					}
					else {
					    output[prop] = value;
					}
				}
			}

			return output;
		};

		/**
		 * miscellaneous functions
		 */
		function generateID(classID) {
			var now = Date.now();
			var s = ((classID) ? classID : "id-") + now;
			for ( var i = 0; i < 3; i++) {
				s += "-" + Math.floor(Math.random() * 0x1000);
			}
			return s;
		}

		function updateReferences(refs, oldV, newV) {
			if ((oldV instanceof Object) && oldV.id) {
				delete refs[oldV.id];
				for ( var p in oldV) {
					updateReferences(oldV[p]);
				}
				
			}
			

			if ((newV instanceof Object) && newV.id) {
				if (refs[newV.id]) {
					return; // already registered
				}

				refs[newV.id] = newV;
				for ( var p in newV) {
					updateReferences(newV[p]);
				}
				
			}
			
		}
		

		function setAndTell(obj, context, colonelPrivate, propName, attributes, replaceGetterSetter) {
			return function(v) {
				var realV = deserializeValue.call(obj, v, attributes, context, propName);
				var oldV = colonelPrivate[propName];

				if ((realV instanceof Function) && (!attributes || attributes.type != "native")) {
					var setter = (attributes && (attributes.bidirectional === "true" || attributes.bidirectional == true)) ? function(x) {
						realV.call(this, x, true);
					} : setAndTell(obj, context, colonelPrivate, propName, attributes, true);

					// calculated property using the expression syntax, reference or function syntax
					Object.defineProperty(obj, propName, {
						get : realV,
						set : setter,
						enumerable : true,
						configurable : true
					});
				} else {
					colonelPrivate[propName] = realV;
					if (replaceGetterSetter) {
						Object.defineProperty(obj, propName, {
							get : function() {
								return colonelPrivate[propName];
							},
							set : setAndTell(obj, context, colonelPrivate, propName, attributes, true),
							enumerable : true,
							configurable : true
						});
					}
					
				}
				
				if (realV !== oldV) {
					if (this.root()) {
						updateReferences(this.root().__$references$__, oldV, realV);
					}
					this.revision++;

					this.letThemKnowIChanged(new _ModifyEvent(this, propName, oldV, v, realV));
				}
				
				return realV;
			};
		}
		

		/**
		 * _Array
		 * This is a poor man's solution to the missing support for Proxy() in
		 * the Chrome and Safari browsers.
		 * This solution doesn't work in FireFox. In FireFox 18.0 we use new Proxy() API and
		 * in FireFox 17.0 and below we use the old Proxy API (which also exists in as experimental JavaScript feature in Chrome)
		 */
		function _Array(length, context) {
			_Object.call(this, {}, context);
			this['#internal-array'] = [];

			this.notify = function(event, stuff) {
				for ( var i = 0; i < this['#internal-array'].length; i++) {
					var value = this['#internal-array'][i];
//					console.log('re-evaluating index', i);
					if (typeof (value) === "function" && value.isaReference) {
						this[i] = value.call(this);
					}
				}
			};

			this.on(_ReferencedObjectChanged, this.notify);
		}
		
		_Array.prototype = new Array();

		Object.keys(_Object.prototype).forEach(function(prop) {
			if (!_Array.prototype.hasOwnProperty(prop)) {
				_Array.prototype[prop] = _Object.prototype[prop];
			}
			
		});

		function makeArray(object, length) {
			function addMethods(aObj) {
				return {

					"delete" : function(sName) {
						return delete aObj[sName];
					},

					fix : function() {
						if (Object.isFrozen(aObj) === true) {
							return Object.getOwnPropertyNames(aObj).map(function(sName) {
								return Object.getOwnPropertyDescriptor(aObj, sName);
							});
						}

						return undefined;
					},

					// derived traps
					has : function(sName) {
						return sName in aObj;
					},
					hasOwn : function(sName) {
						return Object.prototype.hasOwnProperty.call(aObj, sName);
					},
					get : function(rec, sName) {
						if (sName === '#proxy') {
							return true;
						}
						var value = aObj[sName];

						return (typeof (value) === "function" && value.isaReference) ? value.call(object) : value;
					},
					set : function(rec, sName, val) {
						aObj[sName] = val;
						return true;
					},
					enumerate : function() {
						var aResult = [];
						for (var i = 0; i < aObj.length; i++) {
							aResult.push(aObj[i]);
						}

						return aResult;
					},
					keys : function() {
						return Object.keys(aObj);
					},
					getOwnPropertyDescriptor : function(sName) {
						return this._getDescription(Object.getOwnPropertyDescriptor(aObj, sName));
					},
					getPropertyDescriptor : function(sName) {
						return this._getDescription(Object.getPropertyDescriptor(aObj, sName));
					},
					_getDescription : function(sDescription) {
						if (sDescription === undefined) {
							return sDescription;
						}
						sDescription.configurable = true;
						return sDescription;
					},
					getOwnPropertyNames : function() {
						return Object.getOwnPropertyNames(aObj);
					},
					getPropertyNames : function() {
						return Object.getPropertyNames(aObj);
					},
					defineProperty : function(sName, sDescription) {
						Object.defineProperty(aObj, sName, sDescription);
					}
				};
			}
			

			return (typeof (Proxy) === "function") ? new Proxy(new Array(length), {
				get : function(target, name) {
					if (name === '#proxy') {
						return true;
					}
					var value = target[name];
					//Support resolve & root on an array proxy
					if ((name === "resolve" || name === "root") && value === undefined) {
						value = object[name];
					}
					return (typeof (value) === "function" && value.isaReference) ? value.call(object) : value;
				}
			}) : Proxy.create(addMethods(new Array()));
		}
		

		function myArrayProxy(array, object, attributesArray, context, propName) {
			if (typeof (Proxy) === "undefined") {
				var newArray = new _Array(array.length, context);
				var containsReferences = false;

				for ( var i = 0; i < array.length; i++) {
					var attributes = (attributesArray) ? attributesArray[i] : undefined;
					var value = deserializeValue.call(newArray, array[i], attributes, context);
					if (typeof (value) === "function" && value.isaReference) {
						containsReferences = true;
						newArray.push(value.call(newArray));
					} else {
						newArray.push(value);
					}
					newArray['#internal-array'].push(value);
				}
				

				if (containsReferences) {
					object.root().inform(newArray);
				}
				return newArray;
			} else {
				var newArray = makeArray(object, array.length);

				for ( var i = 0; i < array.length; i++) {
					var attributes = (attributesArray) ? attributesArray[i] : undefined;
					var value = deserializeValue.call(object, array[i], attributes, context, propName);

					newArray[i] = value;
				}
				

				return newArray;
			}
		}

		/**
		 * deserializeValue assumes that it is called with 'this' set to the JavaScript context (this) of the caller
		 * by calling deserializeValue.call(this, ...)
		 *
		 * The value is either a JavaScript native object or encapsulated in a JavaScript string.
		 * native values allowed by JSON are: objects and arrays
		 * all other values (including strings) are stored as strings.
		 *
		 * value serialization format:
		 * Constants:
		 *   undefined:
		 *   	regular expression: /^(undefined)?$/
		 *   numeric values:
		 *   	examples: 785, 5654.3242, -23, -234.256, 34.56e35, 34.4e-3, -3.2e3
		 *   	regular expression: /^-?[0-9]+(\.[0-9]+)?(e-?[0-9]+)?$/
		 *   string values:
		 *   	examples: "hello", 'hello world', "I said 'hello world", 'another "way" to say it', 'with\ttabs\nand new lines', 'don\'t', "don't", "don\"t"
		 *   	note: the '\' character is used as an escape character at the beginning of a string to distinguish between strings
		 *   		  starting with '@' & '=' and the references and expressions.
		 *   		  This implies that in the JSON object the string  "@hello" is encoded: "\\@hello", the string "\@hello" is encoded "\\\\@hello"
		 *   		  and the reference @hello is encoded "@hello"
		 *   boolean values:
		 *   	examples: true, false
		 *   	regular expression: (true)|(false)
		 *   date values: follows http://www.w3.org/TR/NOTE-datetime with the extension of negative years(-)
		 *   	examples: 2012, 2012-01, 2012-01-13, 1997-07-16T19:20+01:00, 2013-04-24T:01:01:56.023Z
		 *   	regular expression: /(^-?[0-9]{4})(-((0[0-9])|(1[0-2]))((-((0[1-9])|([1-2][0-9])|(3[0-1])))(T(([0-1][0-9])|(2[0-3])):([0-5][0-9])(:[0-5][0-9](\.[0-9]+)?)?(Z|([-,+](0[0-9]|1[0-1]):[0-5][0-9])))?)?)?$/
		 * Arrays:
		 * 		Arrays are represented as JavaScript (JSON) arrays.
		 * Objects:
		 * 		examples: {} {classID: "doc.dataModel", prop1: 'value1', prop2: 2, prop3: undefined}
		 * 		Objects are represented as JavaScript (JSON) Objects;
		 *
		 * Reference by identifier:
		 * 		examples: @an-object-identifier, @reference with spaces
		 * 		note: A string starting with '@' should be encoded as '\@'
		 * Reference: by path either absolute or relative, to an identifier or to the closest enclosing Object of a certain type
		 * 		the root of the absolute is set to the current doc.Document object
		 * 		reference by object ID start with @#  followed by the ID and optionally a path.
		 * 		reference to the closest enclosing starts with '@[' followed by the classID then ']' and optionally a path.
		 * 		examples: @information.author, @.name.path.from.This.place.onwards, @#FooObject-23.DataModel.dimensions
		 * 				  @[doc.DataModel].annotations, @[doc.Document].name
		 *
		 * Expressions:
		 * 		examples:
		 * 			constant expressions (no different than just the constants): =12, ="abc", =true, =[1,2,3], =#foo-object-1023
		 * 			expressions with operators:	=12+#foo.style.border.width
		 * 			expressions with function calls: = total(@.incoming, [@.bugsInWebI.weeks, @.bugsInWebI.component])
		 * 			or combined:
		 * 				=   total(@.bugsInWebI.incoming, [@.bugsInWebI.weeks, @.bugsInWebI.component])
		 * 				  + total(@.bugsInWebI.closed, [@.bugsInWebI.weeks, @.bugsInWebI.component])
		 * 		regular expression: /^=.+$/
		 * 	regular expression: /^\$[\w$]+\(.*\)$/
		 */

		var numberRegExp = /^-?[0-9]+(\.[0-9]+)?(e-?[0-9]+)?$/;
		var dateRegExp = /(^-?[0-9]{4})(-((0[0-9])|(1[0-2]))((-((0[1-9])|([1-2][0-9])|(3[0-1])))(T(([0-1][0-9])|(2[0-3])):([0-5][0-9])(:[0-5][0-9](\.[0-9]+)?)?(Z|([-,+](0[0-9]|1[0-1]):[0-5][0-9])))?)?)?$/;

		function deserializeValue(valueDef, attributes, context, optionalPropName) {
			if (valueDef == undefined) {
				return undefined;
			}
			if (!attributes) {
				attributes = {};
			}

			if (attributes.type === "native") {
				return valueDef;
			}
			if (typeof (valueDef) !== "string") {
				// native JavaScript Array
				if (Array.isArray(valueDef)) {
					// if the array contains references it is the place to use JavaScript v6 Proxy() object for the whole array.
					// Unfortunately this feature is only supported in FireFox and the experimental JavaScript mode in Chrome.
					return myArrayProxy(valueDef, this, attributes, context, optionalPropName);
				}

				// native JavaScript Objects
				if (typeof (valueDef) === "object") {
					// our type of objects - should invoke constructor
					if (valueDef.classID) {
						var constructor = doc.functionLookup(valueDef.classID) || _Object;
						// a doc document object
						if (constructor === _Object || constructor instanceof _Object) {
							return new constructor(valueDef, context);
						} else {
							// we have a proxy generator we should use
							var proxyLookup = valueDef["classID.proxy"] && doc.functionLookup(valueDef["classID.proxy"]) || D3Proxy;
							return proxyLookup(doc, valueDef, context);
						}
						
					}
					return new _Object(valueDef, context);
				}
				

				/* special case - it is for non-compliant JSON format that can include javascript scalar values */
				return valueDef;
			}

			// the empty string special case
			if (valueDef.length == 0 || valueDef === "undefined") {
				return undefined;
			}

			switch (valueDef.charAt(0)) {
			case '-':
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				// possibly a number
				if (numberRegExp.test(valueDef)) {
					return parseFloat(valueDef);
					// if not a check whether it is a date
				}

				/*
				 * limitation of this reference implementation:
				 * 	- only deals with dates post 1900 due to javascript Date() limitation
				 *  - some invalid date strings will be silently converted to dates (e.g. 2012-05-35)
				 *  - works with UTC or local time zone, if timezone is not UTC, local time zone is selected.
				 */
				dateRegExp.lastIndex = 0;
				var parts = dateRegExp.exec(valueDef);
				if (parts) {
					// new Date(year, month, day [, hour, minute, second, millisecond])
					var year = parts[1];
					// we know that at least the month is specified otherwise we would not have reached this point
					var month = parseInt(parts[3]) - 1;
					var day = (parts[8]) ? parseInt(parts[8]) - 1 : 0;
					var hours = (parts[13]) ? parseInt(parts[13]) : 0;
					var minutes = (parts[16]) ? parseInt(parts[16]) : 0;
					var seconds = (parts[17]) ? parseInt(parts[17].substring(1, 3)) : 0;
					var millis = (parts[17] && parts[17].length > 4) ? Math.round(parseFloat(parts[17].substring(3)) * 1000) : 0;

					var isUTC = parts[19] === 'Z';

					// TODO: (bug) we ignore any time zone other than UTC
					if (isUTC) {
						return new Date(Date.UTC(year, month, day, hours, minutes, seconds, millis));
					} else {
						return new Date(year, month, day, hours, minutes, seconds, millis);
					}

				}
				// else it is a string
				return valueDef;

			case "\\":
				return valueDef.substring(1);

			case '@':
				return resolveReference(valueDef.substring(1), attributes['default'], context, false, optionalPropName);

			case '=':
				return parseExpression.call(this, valueDef, attributes['default'], context, optionalPropName);

			case 'f':
				if (valueDef === "false") {
					return false;
				}

			case 't':
				if (valueDef === "true") {
					return true;
				}

			default:
				return valueDef;
			}
		}

		// define a utility function
		var quote;
		if (new String().quote != undefined) {
			quote = function(str) {
				return str.quote();
			};
		} else {
			quote = function(str) {
				var reg = /([^\t\n\r\""]*)([\t\n\r\""]*)/g;
				var replacements = {
					"\t" : "\\t",
					"\n" : "\\n",
					"\r" : "\\r",
					'"' : "\\\""
				};
				var quoted = "";

				var match = reg.exec(str);
				while (match == null || match[0].length == 0) {
					quoted += match[1];

					if (match[2].length > 0){
						quoted += replacements[match[2][0]];
					}
					match = reg.exec(str);
				}
				return '"' + quoted + '"';
			};
		}

		function parseExpression(expDefinition, defaultValue, context, optionalPropName) {
			// poor man approach to parsing
			var regexp = /\@((\#?([\w\.])|(\[[\w\.]+\]))+)/g;

			var optional = (optionalPropName) ? ',"' + optionalPropName + '"' : '';
			var expression = expDefinition.substring(1).replace(regexp, "(this.resolve('$1', false" + optional + "))");
			var func = undefined;
			try {
				var escaped = (defaultValue && typeof (defaultValue) === 'string') ? quote(defaultValue) : defaultValue;
				expression = '(function(){try{var $v=(' + expression + ');return ($v != undefined) ? $v : ' + escaped
						+ ';}catch(e){console.log(e);};})';
				//This eval is not that evil - an inputy validation and logic is done before it
				/*eslint-disable no-eval*/
				func = eval(expression); //NOSONAR
				/*eslint-enable no-eval*/
				func.isaReference = true;
			} catch (e) {
				console.log("evaluation of expression '" + expDefinition + "' failed");
			}

			return (func) ? func : defaultValue;
		}

		function resolveReference(identifier, defaultValue, context, silentlyFail, optionalPropName) {
			var notSupportedYet = /[A-Za-z0-9_$ ]/g;
			if (!notSupportedYet.test(identifier)) {
//				throw new SyntaxError("expressions in identifiers are not supported yet, only letters,digits,_ and blank are allowed: "
//						+ identifier);
				return undefined;
			}

			// additional information available to the object which has a reference when a ReferencedObjectChanged event is recieved
			var extraStuff = (optionalPropName ? {
				prop : optionalPropName
			} : undefined);

			// the function is called with 'this' being the enclosing object
			// f is a getter/setter function, if newValue is specified then it sets the value of the referred object to be newValue
			// the setter only works (by design) if the reference points to property and is not
			// a "class based" or "ID based" reference to an object.

			var f = function(newValue, setOperationFlag) {
				var pos = 0;
				var me = undefined;
				var value;
				var visited = {};

				function step() {
					var start, end;

					if (identifier.length == 0) {
						return me;
					}

					if (me.id !== undefined) {
						if (visited[me.id]) {
							throw new Error("cyclic reference from: " + me.id + " to : " + identifier);
						}
						visited[me.id] = true;
					}

					var ch0 = identifier[pos];

					// reference by ID
					if (ch0 === '#') {
						start = pos + 1;
						end = identifier.indexOf('.', start);
						end = (end < 0) ? identifier.length : end;
						// advance pos
						pos = end + 1;
						value = this.root().__$references$__[identifier.substring(start, end)];
						return value;
					}
					// reference by class
					if (ch0 === '[') {
						start = pos + 1;
						var index = identifier.indexOf("]", start);
						if (index < 0) {
							throw new SyntaxError("unterminated class identifier: " + identifier.substring(pos));
						}

						// advance pos
						pos = index + 1;
						var classID = identifier.substring(start, index); // extract class identifier
						var padre = this.parent();
						var classFunction = doc.functionLookup(classID);

						if (typeof (classFunction) != 'function') {
							if (!silentlyFail) {
								doc._NoteUnresolvedFunction(classID);
							}
							return undefined;
						}

						while (padre) {
							// path.length - 2 since we don't want to find ourselves. Right?
							if (padre instanceof classFunction) {
								return padre;
							}
							padre = padre.parent();
						}

						// couldn't find instance of classID in the reverse path to the root
						if (!silentlyFail) {
							doc._NoteUnresolvedInstance(me, classID);
						}
						return undefined;
					}

					// reference myself
					if (ch0 === '.') {
						pos++;
						// clear cyclic indicator since we are going to visit ourselves again
						visited[me.id] = false;
						return me;
					}

					start = pos;
					end = identifier.indexOf('.', start);
					end = (end < 0) ? identifier.length : end;
					var prop = identifier.substring(start, end);
					// advance pos
					pos = end + 1;

					if (me instanceof _Object) {
						me.inform(this, _ReferencedObjectChanged, undefined, extraStuff);
					}

					if (setOperationFlag && pos > identifier.length) {
						// setter scenario AND we reached the leaf
						me[prop] = newValue;
						return newValue;
					} else {
						// getter scenario OR we haven't reached the leaf yet
						if (!(prop in me)) {
							// undefined property prop - reference points to non-existant place (yet?)
							if (!silentlyFail) {
								doc._NoteUnresolvedElement(me, prop);
							}
							return undefined;
						}
						var next = me[prop];
						return next;
					}
				}

				// the starting point is a special case
				if (identifier[0] == '.') {
					if (identifier.length > 1 && identifier[1] == '.') {
						me = this.parent();
						pos++;
					} else {
						me = this;
					}
					
				} else {
					me = this.root();
				}
				

				while (pos < identifier.length && me) {
					me = step.call(this);
				}

				if (me instanceof _Object) {
					me.inform(this, _ReferencedObjectChanged, undefined, extraStuff);
				}

				return (me != undefined) ? me : defaultValue;
			};

			f.isaReference = true;
			return f;
		}

		/********************************************************************************
		 * default implementation of host hooks for handling unresolved situations
		 ********************************************************************************/

		doc.functionLookup = function functionLookup(functionIdentifier) {
			var list = functionIdentifier.split('.');
			var obj = global;
			for (var i = 0, len = list.length; i < len; i++) {
				obj = obj[list[i]];
				if (!obj) {
					// should handle script loading here
					console.log("'" + functionIdentifier + "' not found: " + list[i] + " is undefined");
					return undefined;
				}
			}
			if (typeof (obj) === "function") {
				return obj;
			}

			throw new TypeError("'" + functionIdentifier + "' is not refering to a javascript function but rather to a " + typeof (obj));
		};

		doc._NoteUnresolvedFunction = function _NoteUnresolvedFunction(classID) {
			console.log("could not resolve class <" + classID + ">");
		};

		doc._NoteUnresolvedElement = function _NoteUnresolvedElement(obj, element) {
//			console.log("reference to non-existent element <" + element + "> in obj #<" + obj.id + "> of type <" + obj.classID + ">");
		};

		doc._NoteUnresolvedInstance = function _NoteUnresolvedInstance(obj, classID) {
			console.log("could not find class instance from obj #<" + obj.id + "> to root of classID <" + classID + ">");
		};

		/*
		 * final touches, setting the public entry points into the doc object
		 */

		function _Document(definition, hostContext) {
			Object.defineProperty(this, "__$references$__", {
				value : {},
				writable : false,
				configurable : false,
				enumerable : false
			});
			_Object.call(this, definition, hostContext);
			// temporary workaround to force all the lazy-evaluated expressions and references to be executed
			doc.stringify(this);

			this.raise(new _LoadEvent(this));
			this.activate();
		}

		_Document.prototype = new _Object({
			id : "Document Prototype",
			revision : SPEC_VERSION
		});

		doc.Object = _Object;
		doc.Event = _Event;

		doc.deserializeValue = deserializeValue;
		doc.updateReferences = updateReferences;

		doc.stringify = function(object, tab) {
			return JSON.stringify(object, null, tab);
		};

		return doc;
	}
});