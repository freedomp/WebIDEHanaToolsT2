define({
    parseCsdl : function(oDataDoc) {


        //*** this is an addition for the CSDL parser - not part of the original odatalib ************************//
        // Configure which annotation to expose
        var annotationsConversion = {
            "sap:label": "label",
            "sap:addressable" : "addressable",
            "sap:creatable" : "creatable",
            "sap:updatable" : "updatable",
            "sap:deletable" : "deletable"
        };

        function getAnnotations(attributesObject) {
            var annotations = {};
            var attributeValue = null;
            var annotationValue = null;
            var annotationProperty = annotationsConversion;
            var attributes = attributesObject;
            for (var annotation in attributes) {
                attributeValue = attributes[annotation];
                annotationValue = attributeValue ? annotationProperty[attributeValue.name] : attributeValue;
                if (annotationValue) {
                    annotations[annotationValue] = attributes[annotation].value;
                }
            }

            return annotations;
        }

        //*******************************************************************************************************//

        var _ref;
        function readBoolAttribute(oElement, attributeName, defaultValue) {
            var value = oElement.attr(attributeName);
            if (value === "false") { return false; }
            else if (value === "true") { return true; }
            return defaultValue;
        }
        function readEdmTypeProperties(qualifiedName, property, oPropertyElement) {
            var tmpValue;

            property.sapType = oPropertyElement.attr("sap:type");
            switch(qualifiedName) {
                case "Edm.DateTimeOffset":
                    property.isDate = true;
                    tmpValue = oPropertyElement.attr("Precision");
                    if (tmpValue) {
                        tmpValue = parseInt(tmpValue, 10);
                        property.precision = isNaN(tmpValue) ? null : tmpValue;
                    }
                    break;
                case "Edm.Time":
                    property.isTime = true;
                    break;
                case "Edm.String":
                    property.unicode = readBoolAttribute(oPropertyElement, "Unicode", true);
                    tmpValue = oPropertyElement.attr("MaxLength");
                    if (tmpValue) {
                        if (tmpValue === "max") {
                            property.maxLength = Math.pow(2, property.unicode ? 30 : 31);
                        } else {
                            tmpValue = parseInt(tmpValue, 10);
                            if (!isNaN(tmpValue)) {
                                property.maxLength = tmpValue;
                            }
                        }
                    }
                    break;
                case "Edm.Decimal":
                    tmpValue = oPropertyElement.attr("Precision");
                    if (tmpValue) {
                        tmpValue = parseInt(tmpValue, 10);
                        if (!isNaN(tmpValue)) { property.precision = tmpValue; }
                    }

                    tmpValue = oPropertyElement.attr("Scale");
                    property.scale = 0;
                    if (tmpValue) {
                        tmpValue = parseInt(tmpValue, 10);
                        if (!isNaN(tmpValue)) { property.scale = tmpValue; }
                    }
                    break;
            }
        }
        function readEnumType(schema, oEnumElement) {
            var name = oEnumElement.attr("Name"),
                qualifiedName = schema.name + "." + name,
                enumType = getOrAddEntityType(qualifiedName);
            if (enumType.name) { return; }

            enumType.name = name;
            enumType.sapType = oEnumElement.attr("sap:type");
            enumType.qualifiedName = qualifiedName;
            enumType.isEnum = true;
            enumType.isComplex = false;
            enumType.schema = schema;
            enumType.members = [];
            enumType.annotations = oEnumElement[0] ? getAnnotations(oEnumElement[0].attributes) : {};

            schema.enumTypes.push(enumType);

            $("Member", oEnumElement).each(function() {
                var $this = $(this);
                enumType.members.push({
                    name: $this.attr("Name"),
                    value: $this.attr("Value") === undefined ? $this.attr("Value") : $this.attr("rdl:literal")
                });

            });
        }
        function readComplexType(schema, oComplexElemen) {
            var name = oComplexElemen.attr("Name"),
                qualifiedName = schema.name + "." + name,
                complexType = getOrAddEntityType(qualifiedName);
            if (complexType.name) { return; }

            complexType.name = name;
            complexType.qualifiedName = qualifiedName;
            complexType.isComplex = true;
            complexType.isEnum = false;
            complexType.schema = schema;
            complexType.elements = [];
            complexType.annotations = oComplexElemen[0] ? getAnnotations(oComplexElemen[0].attributes) : {};

            schema.complexTypes.push(complexType);
        }
        function readEntityType(schema, oEntityTypeElement) {
            var name = oEntityTypeElement.attr("Name"),
                qualifiedName = schema.name + "." + name,
                entityType = getOrAddEntityType(qualifiedName);
            if (entityType.name) { return; }

            entityType.name = name;
            entityType.qualifiedName = qualifiedName;
            entityType.isComplex = false;
            entityType.isEnum = false;
            entityType.isEntity = true;
            entityType.schema = schema;
            entityType.elements = [];
            entityType.actions = [];
            entityType.keysMap = {};
            entityType.annotations = oEntityTypeElement[0] ? getAnnotations(oEntityTypeElement[0].attributes) : {};

            schema.entityTypes.push(entityType);

            $("PropertyRef", oEntityTypeElement).each(function() {
                entityType.keysMap[$(this).attr("Name")] = true;
            });
        }
        function readAssociation(schema, oElement) {
            var name = oElement.attr("Name"),
                qualifiedName = schema.name + "." + name;
            if (_ref.associationMap[qualifiedName] && !$.isEmptyObject(_ref.associationMap[qualifiedName])) {return;}

            var association = {
                name: name,
                qualifiedName: qualifiedName,
                ends: {},
                annotations : oElement[0] ? getAnnotations(oElement[0].attributes) : {}
            };

//            _ref.associationMap[qualifiedName] = association;

            $("End", oElement).each(function() {
                var $this = $(this);
                var end = {
                    role: $this.attr("Role"),
                    type: getOrAddEntityType($this.attr("Type")),
                    multiplicity: $this.attr("Multiplicity"),
                    sapMinoccurs: $this.attr("sap:minoccurs"),
                    sapMaxoccurs: $this.attr("sap:maxoccurs")
                };
                association.ends[end.role] = end;
            });

            $.extend(_ref.associationMap[qualifiedName] ? _ref.associationMap[qualifiedName] : _ref.associationMap[qualifiedName] = {} , association);
            schema.associations.push(association);
        }
        function readProperty(type, oPropertyElement) {
            var qualifiedName = oPropertyElement.attr("Type"),
                index = qualifiedName.indexOf("Edm."),
                property = {
                    name: oPropertyElement.attr("Name"),
                    type: qualifiedName,
                    isAssoc: false,
                    value: null,
                    isNullable: readBoolAttribute(oPropertyElement, "Nullable", true),
                    isReadOnly: readBoolAttribute(oPropertyElement, "ReadOnly", false),
                    defaultValue: oPropertyElement.attr("DefaultValue"),
                    isComputed: readBoolAttribute(oPropertyElement, "rdl:ComputedDefaultValue", false),
                    isCalculated: readBoolAttribute(oPropertyElement, "rdl:Computed", false),
                    sapType: oPropertyElement.attr("sap:type"),
                    sapFilterable: readBoolAttribute(oPropertyElement, "sap:filterable", true),
                    annotations: oPropertyElement[0] ? getAnnotations(oPropertyElement[0].attributes) : {}
                };

            if (type.isEntity) { property.isKey = property.name in type.keysMap; }

            if (index === 0) {
                readEdmTypeProperties(qualifiedName, property, oPropertyElement);
            } else {
                property.value = getOrAddEntityType(qualifiedName);
                property.isComplex = property.value.isComplex;
                property.isEnum = property.value.isEnum;
            }

            type.elements.push(property);
        }
        function readNavigationProperty(type, oNavigationElement) {
            var qualifiedRelationName = oNavigationElement.attr("Relationship"),
                property = {
                    name: oNavigationElement.attr("Name"),
                    isAssoc: true,
                    toRole: oNavigationElement.attr("ToRole"),
                    fromRole: oNavigationElement.attr("FromRole"),
                    backlink: oNavigationElement.attr("sap:backlink")
                };

            if (!_ref.associationMap[qualifiedRelationName]) {
                //fallback
                qualifiedRelationName = type.schema.name + "." + oNavigationElement.attr("Relationship");
                if (!_ref.associationMap[qualifiedRelationName]) {
                    _ref.associationMap[qualifiedRelationName] = {};
                }
            }

            property.relationship = _ref.associationMap[qualifiedRelationName];
            property.annotations = oNavigationElement[0] ? getAnnotations(oNavigationElement[0].attributes) : {};

            type.elements.push(property);
        }
        function readEntityContainer(schema, oElement) {
            var name = oElement.attr("Name"),
                container = {
                    name: name,
                    qualifiedName: schema.name + "." + name,
                    schema: schema,
                    isDefaultContainer: false,
                    entitySets: [],
                    actions: [],
                    associationSets: [],
                    views: []
                };
            if (oElement.attr("m:IsDefaultEntityContainer") === "true") {
                container.isDefaultContainer = true;
                _ref.defaultEntityContainder = container;
            }
            _ref.entityContainersMap[container.qualifiedName] = container;
            schema.entityContainers.push(container);

            $("EntitySet", oElement).each(function() { readEntitySet(container, $(this)); });
            $("AssociationSet", oElement).each(function() { readAssociationSet(container, $(this)); });
            $("FunctionImport", oElement).each(function() { readFunctionImport(container, $(this)); });
        }
        function readEntitySet(container, oEntitySetElement) {
            var name = oEntitySetElement.attr("Name"),
                qualifiedName = container.qualifiedName + "." + name,
                entitySet = getOrAddEntitySet(qualifiedName);
            if (entitySet.name) {return;}

            entitySet.name = name;
            entitySet.qualifiedName = qualifiedName;
            entitySet.container = container;
            entitySet.type = getOrAddEntityType(oEntitySetElement.attr("EntityType"));
            entitySet.annotations = getAnnotations(oEntitySetElement[0].attributes);

            container.entitySets.push(entitySet);
        }
        function readAssociationSet(container, oAssociationSetElement) {
            var name = oAssociationSetElement.attr("Name"),
                qualifiedName = container.name + "." + name,
                associationName = oAssociationSetElement.attr("Association"),
                associationSet = {
                    name: name,
                    quailfiedName: qualifiedName,
                    ends: {}
                };


            if (!_ref.associationMap[associationName]) {
                _ref.associationMap[associationName] = {};
            }
            associationSet.association = _ref.associationMap[associationName];

            $("End", oAssociationSetElement).each(function() {
                var $this = $(this),
                    end = {
                        role: $this.attr("Role")
                    };
                var qualifiedEntitySetName = $this.attr("EntitySet");
                if (qualifiedEntitySetName.indexOf(".") === -1) {
                    qualifiedEntitySetName = container.qualifiedName + "." + qualifiedEntitySetName;
                }

                end.entitySet = getOrAddEntitySet(qualifiedEntitySetName);
                associationSet.ends[end.role] = end;
            });

            container.associationSets.push(associationSet);
            //_ref.associationMap[qualifiedName] = associationSet;
        }
        function getOrAddEntitySet(qualifiedEntitySetName) {
            if (!_ref.entitySetMap[qualifiedEntitySetName]) {
                _ref.entitySetMap[qualifiedEntitySetName] = { assoctionSetMap: {} };
            }
            return _ref.entitySetMap[qualifiedEntitySetName];
        }
        function getOrAddEntityType(qualifiedEntityTypeName) {
            if (!_ref.typeMap[qualifiedEntityTypeName]) {
                _ref.typeMap[qualifiedEntityTypeName] = {};
            }
            return _ref.typeMap[qualifiedEntityTypeName];
        }
        function readFunctionImport(container, oFunctionImportElement) {
            var action = {
                name: oFunctionImportElement.attr("Name"),
                container: container,
                parameters: [],
                returnTypes: [],
                bindable: oFunctionImportElement.attr("IsBindable") === "true",
                annotations: oFunctionImportElement[0] ? getAnnotations(oFunctionImportElement[0].attributes) : {}
            };

            readReturnType(action, oFunctionImportElement);
            $("Parameter", oFunctionImportElement).each(function() { readParameter(action, $(this)); });

            if (oFunctionImportElement.attr("rdl:source-object") === "action") { container.actions.push(action); }
            else if (oFunctionImportElement.attr("rdl:source-object") === "view") { container.views.push(action); }
            else {container.actions.push(action);} //default
        }
        function readReturnType(action, oFunctionImportElement) {
            if (oFunctionImportElement.attr("ReturnType")) {
                readReturnTypeCont(oFunctionImportElement, "ReturnType", action, "returnTypes");
            }
            else {
                $("ReturnType", oFunctionImportElement).each(function () {
                    readReturnTypeCont($(this), "Type", action, "returnTypes");
                });
            }
        }
        function readReturnTypeCont(oFunctionElement, attrName, action, colName, hasName) {
            var qualifedEntityType = oFunctionElement.attr(attrName),
                element = {
                    isMulti: qualifedEntityType.indexOf("Collection(") === 0
                };
            if (hasName) {
                element.name = oFunctionElement.attr("Name");
                element.mode = oFunctionElement.attr("Mode");
            }
            if (element.isMulti) {
                qualifedEntityType = qualifedEntityType.substring(11, qualifedEntityType.length - 1); //"Collection(".length
            }

            qualifedEntityType = checkRefType(qualifedEntityType);
            if (qualifedEntityType.indexOf(".") === -1){
                qualifedEntityType = action.container.schema.name + "." + qualifedEntityType;
            }

            if (qualifedEntityType.indexOf("Edm.") === 0) {
                readEdmTypeProperties(qualifedEntityType, element, oFunctionElement);

                element.isPrimitive = true;
                element.isComplex = false;
                element.isEntity = false;
                element.isEnum = false;
                element.type = qualifedEntityType;
            } else {
                element.value = getOrAddEntityType(qualifedEntityType);
                element.type = element.value.name;
                element.isPrimitive = false;
                element.isComplex = element.value.isComplex;
                element.isEnum = element.value.isEnum;
                element.isEntity = element.value.isEntity;
                if (oFunctionElement.attr("EntitySet")) {
                    var entitySetName = action.container.qualifiedName + "." + oFunctionElement.attr("EntitySet");
                    element.entitySet = getOrAddEntitySet(entitySetName);
                    element.isEntity = true;
                }
            }
            action[colName].push(element);
        }
        function checkRefType(qualifedEntityType) {
            if (qualifedEntityType.indexOf("Ref(") === 0) {
                return qualifedEntityType.substring(4, qualifedEntityType.length - 1); //"Ref(".length
            }
            return qualifedEntityType;
        }
        function readParameter(action, oFunctionElement) {
            if (action.bindable && oFunctionElement.attr("Name") === "bindingParam") {
                var entityType = getOrAddEntityType(oFunctionElement.attr("Type"));
                if (!entityType.actions) {entityType.actions = [];}
                entityType.actions.push(action);
            } else {
                readReturnTypeCont(oFunctionElement, "Type", action, "parameters", true);
            }
        }

        function readSchemaDefinitionPart(oSchemaElement) {
            var schemaName = oSchemaElement.attr("Namespace");
            if (schemaName in _ref.schemaMap) {return;}

            var schema = {
                name: schemaName,
                complexTypes: [],
                enumTypes: [],
                entityTypes: [],
                associations: [],
                entityContainers: []
            };
            _ref.schemaMap[schemaName] = schema;
            _ref.schemas.push(schema);

            $("ComplexType", oSchemaElement).each(function() { readComplexType(schema, $(this)); });
            $("EnumType", oSchemaElement).each(function() { readEnumType(schema, $(this)); });
            $("EntityType", oSchemaElement).each(function() { readEntityType(schema, $(this)); });
            $("Association", oSchemaElement).each(function() { readAssociation(schema, $(this)); });
            $("Property", oSchemaElement).each(function() {
                readProperty(_ref.typeMap[schemaName + "." + $(this).parent().attr("Name")], $(this));
            });
            $("NavigationProperty", oSchemaElement).each(function() {
                readNavigationProperty(_ref.typeMap[schemaName + "." + $(this).parent().attr("Name")], $(this));
            });
        }

        function readSchemaContainerPart(oSchemaElement , schema) {
            $("EntityContainer", oSchemaElement).each(function() { readEntityContainer(schema, $(this)); });
        }

        function copyElementsToEntitySet() {
            $.each(_ref.entitySetMap, function() {
                var entitySet = this,
                    entityType = entitySet.type;
                entitySet.elements = [];
                
                if(entityType){
                    $.each(entityType.elements, function() {
                        entitySet.elements.push(this);
                    });
                    
                    if(entitySet){
                        $.each(entitySet.elements, function() {
                            var property = this;
                            if (property.isAssoc) {
                                var relationship = property.relationship;
                                // search for associationSet with the same association type
                                $.each(entitySet.container.associationSets, function() {
                                    if (this.association.qualifiedName === relationship.qualifiedName) {
                                        property.value = this.ends[property.toRole].entitySet;
                                        property.type = relationship.ends[property.toRole].type;
                                    }
                                });
                            }
                        });
                     }
                }
            });
        }

        function ODataAst(oDataDoc) {
            _ref = this;
            this.schemas = [];
            this.schemaMap = {};
            this.typeMap = {};
            this.associationMap = {};
            this.entityContainersMap = {};
            this.entitySetMap = {};
            this.defaultEntityContainder = null;

            $("Schema", oDataDoc).each(function() {
                readSchemaDefinitionPart($(this));
            });

            //all definition parts from all schemas must end before parsing the container
            //as there may references from a container of one schema to a definition (*type, etc.) in another
            $("Schema", oDataDoc).each(function() {
                var schemaName = $(this).attr("Namespace");
                readSchemaContainerPart($(this) , _ref.schemaMap[schemaName]);
            });

            copyElementsToEntitySet();

            var that = this;
            this.getEntities = function() {
                if (!this.__entities) {
                    this.__entities = [];
                    $.each(this.schemas, function() {
                        $.each(this.entityContainers, function() {
                            $.each(this.entitySets, function() {
                                that.__entities.push(this);
                            });
                        });
                    });
                }
                return this.__entities;
            };
            this.getViews = function() {
                if (!this.__views) {
                    this.__views = [];
                    $.each(this.schemas, function() {
                        $.each(this.entityContainers, function() {
                            $.each(this.views, function() {
                                that.__views.push(this);
                            });
                        });
                    });
                }
                return this.__views;
            };
            this.getNonBindableActions = function() {
                if (!this.__globalActions) {
                    this.__globalActions = [];
                    $.each(this.schemas, function() {
                        $.each(this.entityContainers, function() {
                            $.each(this.actions, function() {
                                if (!this.bindable) {that.__globalActions.push(this);}
                            });
                        });
                    });
                }
                return this.__globalActions;
            };
        }

        _parse$Metadata = function(oDataDoc) {
            return new ODataAst(oDataDoc);
        };

        return _parse$Metadata(oDataDoc);
    }
});