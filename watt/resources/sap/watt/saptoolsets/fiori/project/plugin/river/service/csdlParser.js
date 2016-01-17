define([ "sap.watt.saptoolsets.fiori.river/service/docslib" ], function(docslib) {
    //comment
	return {
		_parseCsdl : function(value, applicationName, fileUri) {

			if (applicationName === undefined) {
				applicationName = "APPLICATION_NAME_NOT_PROVIDED"; //remark
			}
			if (fileUri === undefined) {
				fileUri = "FILE_URI_NOT_PROVIDED";
			}

			try {
				var oDataDoc = $.parseXML(value);
			} catch (e) {
				return null;//TODO throw error to console
			}

			var _mEntities = {};
			var _mAssociationNodes = [];
			var _mDependencies;

			function _reset() {
				_mDependencies = {};
			}

			function _convert() {

				if (ast.schemas.length) {
					applicationName = ast.schemas[0].name;
				}

				if (ast.schemas[0].entityContainers.length) {
					for (var i = 0; i < ast.schemas[0].entityContainers.length; i++) {
						if (ast.schemas[0].entityContainers[i].isDefaultContainer) {
							_defaultEntityContainer = ast.schemas[0].entityContainers[i].name;
							break;
						}
					}
				}

				var nodeCounter = {
					id : 2
				};

				var nodeApplication = {
					$id : 1,
					$intf : 'IRdlContext',
					componentType : 'APPLICATION',
					fullyQualifiedName : applicationName,
					name : applicationName,
					symbolCategory : 'SYMBOL_APPLICATION',
					positions : [ {
						src : 0
					} ],
					nestedEntities : [],
					nestedContexts : []
				};

				var responseSingle = {
					isSuccess : true,
					nodes : [ {
						$id : 0,
						$intf : 'IRdlContext',
						componentType : 'CONTEXT',
						fullyQualifiedName : 'Context',
						name : 'Context',
						positions : [ {
							src : 0
						} ],
						nestedContexts : [ {
							$node_id : 1
						} ],
						symbolCategory : 'SYMBOL_CONTEXT'
					} ],
					roots : [ 0 ],
					sources : [ {
						resourceName : "/" + fileUri
					} ],
					issues : [],
					interfaces : {
						IAction : 'IRdlSymbol',
						IDataMember : 'IRdlSymbol',
						IElement : 'IDataMember',
						IEnumValueType : 'IRdlSymbol',
						IAssociationType : "IStreamType",
						IStreamType : "ITypeBase",
						IPrimitiveBoolean : 'IPrimitiveType',
						IPrimitiveDate : 'IPrimitiveType',
						IPrimitiveUTCDateTime : 'IPrimitiveType',
						IPrimitiveTime : 'IPrimitiveType',
						IPrimitiveTimestamp : 'IPrimitiveType',
						IPrimitiveInteger : 'IPrimitiveType',
						IPrimitiveDecimal : 'IPrimitiveType',
						IPrimitiveDouble : 'IPrimitiveType',
						IPrimitiveDecimalFloat : 'IPrimitiveType',
						IPrimitiveSizedType : 'IPrimitiveType',
						IPrimitiveString : 'IPrimitiveSizedType',
						IPrimitiveLargeString : 'IPrimitiveString',
						IPrimitiveBinary : 'IPrimitiveString',
						IPrimitiveLargeBinary : 'IPrimitiveString',
						IPrimitiveType : 'ITypeBase',
						IRdlAction : 'IAction',
						IRdlContext : 'IRdlStructuredType',
						IRdlEntity : 'IRdlStructuredType',
						IRdlNamedParameter : 'IRdlParameter',
						IRdlParameter : 'IRdlSymbol',
						IRdlStructuredType : 'ITypeBase',
						IRdlSymbol : 'IRdlSymbol',
						ITypeBase : 'IRdlSymbol'
					}
				};
				var result = {
					status : 'OK',
					response : []
				};

				var aEntities = [], mTypes = {};

				aEntities = ast.getEntities();

				jQuery.each(aEntities, function() {
					if (!this.qualifiedName) {
						return;
					}
//                if (this.isEntity) {
					var node = _createEntityNode(responseSingle, nodeCounter, this);
					nodeApplication.nestedEntities.push({
						$node_id : node.$id
					});
//                } else {
//                    _createTypeNode(responseSingle, nodeCounter, this);
//                }
				});

				var dependencies = _normalizeDependencies();
				var globalActions = _convertActions(ast.getNonBindableActions());
				jQuery.each(_mAssociationNodes, function(idx, node) {
					if (_mEntities[node.targetEntity]) {
						node.targetEntity = {
							$node_id : _mEntities[node.targetEntity].$id
						};
					} else {
						//shouldnt happen
						node.targetEntity = {
							$node_id : ''
						};
					}
				});
				nodeApplication.actions = _createActionNodes(globalActions || [], responseSingle, nodeCounter);
				responseSingle.nodes.push(nodeApplication);
				result.response.push(responseSingle);
				return result;
			}

			function _createTypeNode(responseSingle, nodeCounter, self) {
				jQuery.each(responseSingle.nodes, function(self) {
					if (this.fullyQualifiedName === self.fullyQualifiedName) {
						return this;
					}
				});

				nodeCounter.id++;
				var node = {
					$id : nodeCounter.id,
					$intf : "",
					fullyQualifiedName : (self.type || self.name || self.remoteType),
					name : (self.type || self.name || self.remoteType),
					positions : [ {
						src : 0
					} ],
					symbolCategory : ""
				};

				var elements;
				var symbolCat;
				var intf;
				if (self.isComplex || self.type === "Complex") {
					symbolCat = 'SYMBOL_ENTITY';
					intf = 'IRdlEntity';
					elements = _convertElements(self.value.elements);
					elements = _createElementNodes(elements || [], responseSingle, nodeCounter, self);
				} else if (self.isAssoc) {
					symbolCat = 'SYMBOL_TYPE';
					intf = 'IAssociationType';
					node.displayName = "Association to " + self.remoteType;
					var cnode = _createCardinalityNode(responseSingle, nodeCounter, self);
					node.cardinality = {
						$node_id : cnode.$id
					};
					node.targetEntity = self.value ? self.value.qualifiedName : '';
					_mAssociationNodes.push(node);
				} else {
					symbolCat = 'SYMBOL_PRIMITIVE';
					intf = _getInterface(self);
				}

				node.$intf = intf;
				node.symbolCategory = symbolCat;
				if (self.maxLength) {
					node.maxLength = self.maxLength;
				}
				if (elements) {
					node.elements = elements;
				}
				responseSingle.nodes.push(node);
				return node;
			}

			function _createCardinalityNode(responseSingle, nodeCounter, self) {
				var fqn = (self.remoteType || self.name || self.type) + '.CARDINALITY';
				jQuery.each(responseSingle.nodes, function(self) {
					if (fqn === self.fullyQualifiedName) {
						return this;
					}
				});
				nodeCounter.id++;
				var node = {
					$id : nodeCounter.id,
					$intf : 'ICardinality',
					name : 'CARDINALITY',
					fullyQualifiedName : fqn,
					positions : [ {
						src : 0
					} ],
					symbolCategory : 'SYMBOL_CARDINALITY',
					lowerBound : self.minOccurs ? self.minOccurs : 0,
					upperBound : self.isMulti ? (self.maxOccurs ? self.maxOccurs : 4294967295) : 1
				//4294967295 is the parser highest value
				};

				responseSingle.nodes.push(node);
				return node;
			}

			function _createEntityNode(responseSingle, nodeCounter, self) {
				jQuery.each(responseSingle.nodes, function(self) {
					if (this.fullyQualifiedName === self.qualifiedName) {
						return this;
					}
				});
				var actions = _convertActions(self.type.actions);
				var elements = _convertElements(self.type.elements);
				nodeCounter.id++;
				var node = {
					$id : nodeCounter.id,
					$intf : 'IRdlEntity',
					name : (self.container.name === _defaultEntityContainer) ? self.name : self.container.name + '.' + self.name,
					annotations : self.annotations,
					fullyQualifiedName : self.qualifiedName,
					elements : _createElementNodes(elements || [], responseSingle, nodeCounter, self),
					actions : _createActionNodes(actions || [], responseSingle, nodeCounter, self),
					positions : [ {
						src : 0
					} ],
					symbolCategory : 'SYMBOL_ENTITY'
				};
				var entityType = self.type ? self.type.qualifiedName : null;
				node.annotations ? node.annotations.entityType = entityType : node.annotations = {
					'entityType' : entityType
				};
				var entityType = self.type ? self.type.qualifiedName : null;
				node.annotations ? node.annotations.entityType = entityType : node.annotations = {
					'entityType' : entityType
				};
				responseSingle.nodes.push(node);
				_mEntities[node.fullyQualifiedName] = node;
				return node;
			}

			function _createElementNodes(elements, responseSingle, nodeCounter) {
				var aRes = [];
				if (elements.length === 0) {
					return [];
				}
				jQuery.each(elements, function() {
					nodeCounter.id++;
					var node = {
						$id : nodeCounter.id,
						$intf : 'IElement',
						name : this.name,
						isKey : this.isKey || false,
						fullyQualifiedName : this.name,
						annotations : this.annotations,
						positions : [ {
							src : 0
						} ],
						type : {
							$node_id : _createTypeNode(responseSingle, nodeCounter, this).$id
						},
						symbolCategory : 'SYMBOL_ELEMENT'
					};
					responseSingle.nodes.push(node);
					aRes.push({
						$node_id : node.$id
					});
				});
				return aRes;
			}

			function _createParameterNodes(elements, responseSingle, nodeCounter) {
				var aRes = [];
				if (elements.length === 0) {
					return [];
				}
				jQuery.each(elements, function() {
					nodeCounter.id++;
					var node = {
						$id : nodeCounter.id,
						$intf : 'IRdlNamedParameter',
						name : this.name || null,
						fullyQualifiedName : this.name || null,
						annotations : this.annotations || null,
						positions : [ {
							src : 0
						} ],
						type : {
							$node_id : _createTypeNode(responseSingle, nodeCounter, this).$id
						},
						symbolCategory : 'SYMBOL_PARAMETER'
					};
					responseSingle.nodes.push(node);
					aRes.push({
						$node_id : node.$id
					});
				});
				return aRes;
			}

			function _createActionNodes(actions, responseSingle, nodeCounter) {
				var aRes = [];
				jQuery.each(actions.sort(_sort), function() {
					nodeCounter.id++;
					var node = {
						$id : nodeCounter.id,
						$intf : 'IRdlAction',
						name : this.name,
						fullyQualifiedName : this.name,
						annotations : this.annotations,
						parameters : _createParameterNodes(this.parameters || [], responseSingle, nodeCounter, self),
						returnTypes : _createParameterNodes(this.returnTypes || [], responseSingle, nodeCounter, self),
						positions : [ {
							src : 0
						} ],
						symbolCategory : 'SYMBOL_ACTION'
					};
					responseSingle.nodes.push(node);
					aRes.push({
						$node_id : node.$id
					});
				});
				return aRes;
			}

			function _convertElements(aElements, sPrefix, mExtra) {
				var aRes = [];
				if (!aElements || aElements.length === 0) {
					return [];
				}
				mExtra = mExtra || {};
				jQuery.each(aElements, function() {
					var sName = sPrefix ? sPrefix + "/" + this.name : this.name;
					mExtra.isEnum = false;
					if (this.value) {
						if (this.value.isComplex) {
							aRes = aRes.concat(_convertElements(this.value.elements || [], sName, {
								required : mExtra.required || (this.isNullable !== undefined && !this.isNullable),
								isReadOnly : mExtra.isReadOnly || this.isReadOnly
							}));
							return;
						}
						mExtra.isEnum = this.value.isEnum;
					}
					var oElement = _fillObject(this, _normalizeType(this), sName, mExtra);
					if (oElement) {
						aRes.push(oElement);
					}
				});
				return aRes;
			}

			function _convertActions(aActions) {
				var aRes = [];
				jQuery.each(aActions.sort(_sort), function() {
					aRes.push({
						name : this.name,
						annotations : this.annotations,
						context : !this.bindable && this.schemaName || undefined,
						parameters : _convertParameters(this.parameters || []),
						returnTypes : _convertReturnTypes(this.returnTypes || [])
					});
				});
				return aRes;
			}

			function _convertParameters(aParameters, sPrefix, mExtra) {
				if (aParameters.length === 0) {
					return [];
				}
				var aRes = [];
				mExtra = mExtra || {};
				jQuery.each(aParameters, function() {
					var sName = sPrefix ? sPrefix + "/" + this.name : this.name;
					mExtra.isEnum = false;
					if (this.value) {
						if (this.value.isComplex && !this.isMulti) {
							aRes = aRes.concat(_convertParameters(this.value.elements || [], sName));
							return;
						}
						mExtra.isEnum = this.value.isEnum;
					}
					var oParameter = _fillObject(this, _normalizeType(this), sName, mExtra);
					if (oParameter) {
						aRes.push(oParameter);
					}
				});
				return aRes;
			}

			function _convertReturnTypes(aTypes) {
				var aRes = [];
				jQuery.each(aTypes, function() {
					var oType = _fillObject(this, _normalizeType(this), null, {
						isEnum : this.isEnum
					});
					if (oType) {
						aRes.push(oType);
					}
				});
				return aRes;
			}

			function _fillObject(mObject, sType, sName, mExtra) {
				var mRes = {};
				mExtra = mExtra || {};
				if (sName) {
					mRes.name = sName;
				}

				if (mObject.annotations) {
					mRes.annotations = mObject.annotations;
				}
				if (mObject.isKey) {
					mRes.isKey = mObject.isKey;
				}
				if (sType) {
					mRes.type = sType;
					if (sType.indexOf(".") !== -1) {
						mRes.remoteType = sType;
						mRes.type = mObject.isComplex ? "Complex" : "Reference";
						if (mObject.value) {
							mRes.value = mObject.value;
						}
					}
				}
				if (mObject.maxLength && mObject.maxLength !== 5000) {
					mRes.maxLength = mObject.maxLength;
				}
				if (mObject.precision && sType === "Decimal") {
					mRes.precision = mObject.precision;
				}
				if (mObject.scale && sType === "Decimal") {
					mRes.scale = mObject.scale;
				}
				if (mObject.defaultValue !== undefined && mObject.defaultValue !== null) {
					// fix UTCTimestamp - milliseconds still not supported by SAPUI5
					if (sType === "UTCTimestamp") {
						mRes.defaultValue = mObject.defaultValue.replace(/\..*$/, "");
					} else {
						mRes.defaultValue = mObject.defaultValue;
					}
				}
				if (mObject.isComputed) {
					// mRes.isComputed = mObject.isComputed;
					delete mRes.defaultValue; // remove calculated default value

					if (mRes.isKey) {
						return null; // mRes.isCalculated = true; //key is complex/association
					}
				}
				if (mObject.isAssoc) {
					mRes.isAssoc = mObject.isAssoc;
					mRes.remoteType = sType;
					mRes.type = "Reference";
					var mEnds = mObject.relationship.ends;
					if (mEnds[mObject.toRole].multiplicity === "*") {
						mRes.isMulti = true;
					} else if (mEnds[mObject.toRole].multiplicity === "1") {
						mRes.required = true;
					}
					if (mRes.isMulti || mObject.backlink || mEnds[mObject.fromRole].type === mEnds[mObject.toRole].type) {
						_addDependencies(mEnds[mObject.fromRole].type, mEnds[mObject.toRole].type);
					}
					if (mEnds[mObject.toRole].sapMinoccurs) {
						mRes.minOccurs = parseInt(mEnds[mObject.toRole].sapMinoccurs, 10);
						mRes.required = true;
					}
					if (mEnds[mObject.toRole].sapMaxoccurs) {
						mRes.maxOccurs = parseInt(mEnds[mObject.toRole].sapMaxoccurs, 10);
					}
				}
				if (mExtra.isReadOnly || mObject.isReadOnly || mObject.isCalculated) {
					mRes.isCalculated = true;
				}
				if (mExtra.isMulti || mObject.isMulti) {
					mRes.isMulti = true;
				}
				if (mExtra.required || (mObject.isNullable !== undefined && !mObject.isNullable && !mObject.isKey)) {
					mRes.required = true;
				}
				if (mExtra.isEnum) {
					mRes.type = "Enum";
					mRes.remoteType = sType;
				}
				return mRes;
			}

			function _addDependencies(oFrom, oTo) {
				var sFrom = oFrom.qualifiedName.replace(/_entityType$/, ""), sTo = oTo.qualifiedName.replace(/_entityType$/, "");

				if (!_mDependencies[sFrom]) {
					_mDependencies[sFrom] = {};
				}
				if (!_mDependencies[sTo]) {
					_mDependencies[sTo] = {};
				}
				_mDependencies[sFrom][sTo] = true;
				_mDependencies[sFrom][sFrom] = true;
				_mDependencies[sTo][sFrom] = true;
			}

			function _normalizeDependencies() {
				var mRes = {};
				jQuery.each(_mDependencies, function(sKey1, oValue) {
					mRes[sKey1] = [];
					jQuery.each(oValue, function(sKey2) {
						mRes[sKey1].push(sKey2);
					});
				});
				return mRes;
			}

			function _normalizeType(oElement) {

				if (oElement.sapType) {
					return oElement.sapType;
				}
				if (oElement.isAssoc) {
					return oElement.relationship.ends[oElement.toRole].type.qualifiedName.replace(/_entityType$/, "");
				}
				if (oElement.isEntity) {
					return oElement.value.qualifiedName.replace(/_entityType$/, "");
				}
				if (oElement.isEnum || oElement.isComplex) {
					return oElement.value.qualifiedName;
				}

				var sType = oElement.type;
				switch (sType) {
				case "Edm.String":
					if (oElement.sapFilterable === false) {
						return "LargeString";
					}
					return "String"; // default type
				case "Edm.Decimal":
					if (oElement.precision) {
						return "Decimal";
					}
					return "DecimalFloat";
				case "Edm.Single":
					return "Decimal";
				case "Edm.DateTimeOffset":
				case "Edm.DateTime":
					if (oElement.precision === 7) {
						return "UTCTimestamp";
					}
					return "UTCDateTime";
				case "Edm.Time":
					return "LocalTime";
				case "Edm.Int16":
				case "Edm.Int64":
				case "Edm.Int32":
				case "Edm.SByte":
					return "Integer";
				case "Edm.Double":
					return "BinaryFloat";
				case "Edm.Boolean":
					return "Boolean";
				case "Edm.Guid":
					return "UUID";
				case "Edm.Binary":
					if (oElement.sapFilterable === false) {
						return "LargeBinary";
					}
					return "Binary";
				}
				return sType;
			}

			function _normalizeFQN(fqn) {
				return fqn ? fqn.replace('.__container', '') : ''; // this to deal River CSDLs
			}

			function _getInterface(oElement) {
				

				var sType = oElement.type;
				switch (sType) {
				case "String":
					return "IPrimitiveString";
				case "LargeString":
					return "IPrimitiveLargeString";
				case "Decimal":
					return "IPrimitiveDecimal";
				case "DecimalFloat":
					return "IPrimitiveDecimalFloat";
				case "UTCDateTime":
					return "IPrimitiveUTCDateTime";
				case "UTCTimestamp":
					return "IPrimitiveTimestamp";
				case "LocalTime":
					return "IPrimitiveTime";
				case "LocalDate":
					return "IPrimitiveDate";
				case "Integer":
					return "IPrimitiveInteger";
				case "BinaryFloat":
					return "IPrimitiveDouble";
				case "Boolean":
					return "IPrimitiveBoolean";
				case "UUID":
					return "IPrimitiveString";
				case "Binary":
					return "IPrimitiveBinary";
				case "LargeBinary":
					return "IPrimitiveLargeBinary";
				default:
					return "IPrimitiveString";
				}
				return sType;
			}

			function _sort(oObj1, oObj2) {
				var aPath1 = (oObj1.qualifiedName || oObj1.name).toLowerCase().split("."), aPath2 = (oObj2.qualifiedName || oObj2.name)
						.toLowerCase().split("."), iLen1 = aPath1.length, iLen2 = aPath2.length, i, len;
				for (i = 0, len = Math.min(iLen1, iLen2); i < len; i++) {
					if (iLen1 - i === 1 || iLen2 - i === 1) {
						if (iLen1 - i === 1 && iLen2 - i === 1) {
							return _compare(aPath1[i], aPath2[i]);
						}
						if (iLen1 - i !== 1) {
							return 1;
						}
						return -1;
					}
					if (aPath1[i] !== aPath2[i]) {
						return _compare(aPath1[i], aPath2[i]);
					}
				}
				return 0;
			}

			function _compare(sName1, sName2) {
				return sName1 < sName2 ? -1 : (sName1 > sName2 ? 1 : 0);
			}

			var ast;
			var parseResult;

			_reset();

			ast = docslib.parseCsdl(oDataDoc);
			parseResult = _convert();
			return parseResult;

		},

		/**
		 * Returns a River AST Library object from OData metadata
		 * @param 	{object}		oMetadataXML		XML OData metadata
		 * @param 	{string}		sApplicationName	Application Name
		 * @param 	{string}		sFileUri			File URI
		 * @returns {object} 		River AST library
		 */
		parse : function(oMetadataXML, sApplicationName, sFileUri) {
			return this._parseCsdl(oMetadataXML, sApplicationName, sFileUri);
		}
	};
});