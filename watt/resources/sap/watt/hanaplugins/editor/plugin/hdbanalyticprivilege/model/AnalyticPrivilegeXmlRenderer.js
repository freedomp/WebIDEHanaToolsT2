/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/common",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/XmlWriter",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/sharedmodel/sharedmodel"
    ],
    function(common, XmlWriter, sharedmodel) {
        "use strict";

        var Util = common.Util;

        var AnalyticPrivilegeXmlRenderer = {

            renderAnalyticPrivilege: function(model) {
                var that = this;

                var writer = new XmlWriter();
                // required for stable rendering of attributes in IE
                writer.configure({
                    attributesOrder: {
                        "*": ["xsi:type"],
                        "Privilege:analyticPrivilege": ["xmlns:xsi", "xmlns:AccessControl", "xmlns:Privilege", "schemaVersion", "id", "privilegeType"],
                        "metadata": ["activatedAt", "changedAt", "createdAt"],
                        "valueFilter": ["xsi:type", "operator", "including"],
                        "validity": ["xsi:type", "operator", "including"],
                        "procedureFilter": ["operator"],
                        "securedModels": ["allInformationModels"]
                    },
                    namespaces: [{
                        name: Util.XSI_NS,
                        prefix: "xsi"
                    }, {
                        name: sharedmodel.NameSpace.ACCESSCONTROL,
                        prefix: "AccessControl"
                    }, {
                        name: sharedmodel.NameSpace.PRIVILEGE,
                        prefix: "Privilege"
                    }, {
                        name: sharedmodel.NameSpace.VARIABLE,
                        prefix: "Variable"
                    }]
                });

                var analyticPrivilegeElementName = writer.addPrefix(sharedmodel.NameSpace.PRIVILEGE, "analyticPrivilege"); //OPTIONAL -> move to constants

                var attributeMapping = {
                    id: "{id}",
                    privilegeType: "{privilegeType}"
                };

                var fixedValues = [{
                    name: "schemaVersion",
                    value: "1.1" //OPTIONAL -> remove hard coding
                }];

                var rootElement = writer.writeRootElement(model.analyticPrivilege, analyticPrivilegeElementName, attributeMapping, fixedValues);

                writer.writeIntermediateElement(model.analyticPrivilege, rootElement, analyticPrivilegeElementName, "descriptions", {
                    label: "{defaultDescription}"
                });

                var securedModelsElement = writer.writeElement(model.analyticPrivilege.securedModels, rootElement, "securedModels", {
                    allInformationModels: "{allInformationModels}"
                });
                if (model.analyticPrivilege.securedModels) {
                    model.analyticPrivilege.securedModels.modelUris.foreach(function(modelUri) {
                        that.renderModelUri(modelUri, securedModelsElement, writer);
                    });
                }
                if (model.analyticPrivilege.validities) {
                    model.analyticPrivilege.validities.foreach(function(valueFilter) {
                        sharedmodel.renderValueFilter(valueFilter, rootElement, writer, "validity");
                    });
                }
                if (model.analyticPrivilege.restrictions) {
                    model.analyticPrivilege.restrictions.foreach(function(restriction) {
                        that.renderRestriction(restriction, rootElement, writer);
                    });
                }

                if (model.analyticPrivilege.conditionProcedureName) {
                    var conditionProcedureNameElement = writer.writeElement(model.analyticPrivilege, rootElement, "conditionProcedureName"); //no attributes
                    writer.writeTextContent(conditionProcedureNameElement, model.analyticPrivilege.conditionProcedureName);
                }

                if (model.analyticPrivilege.whereSql) {
                    var whereSqlElement = writer.writeElement(model.analyticPrivilege, rootElement, "whereSql"); //no attributes
                    writer.writeTextContent(whereSqlElement, model.analyticPrivilege.whereSql);
                }

                writer.close();
                return rootElement.parentNode;
            },

            renderModelUri: function(repositoryUri, parent, writer) {
                var modelUriElement = writer.writeElement(repositoryUri, parent, "modelUri"); //no attributes
                writer.writeTextContent(modelUriElement, repositoryUri.uriString);
                return modelUriElement;
            },

            renderRestriction: function(restriction, parent, writer) {
                var that = this;
                var restrictionElement = writer.writeElement(restriction, parent, "restriction"); //no attributes, deprecated logicalOperator is handled by skipped nodes
                restriction.filters.foreach(function(filter) {
                    that.renderFilter(filter, restrictionElement, writer);
                });
                //attributes to string XML elements
                if (restriction.dimensionUri) {
                    // pass the restriction object here, because that stores the skipped nodes of dimensionUri etc.
                    var dimensionUriElement = writer.writeElement(restriction, restrictionElement, "dimensionUri"); //no attributes
                    writer.writeTextContent(dimensionUriElement, restriction.dimensionUri);
                }
                if (restriction.attributeName) {
                    var attributeNameElement = writer.writeElement(restriction, restrictionElement, "attributeName"); //no attributes
                    writer.writeTextContent(attributeNameElement, restriction.attributeName);
                }
                if (restriction.originInformationModelUri) {
                    var originInformationModelUriElement = writer.writeElement(restriction, restrictionElement, "originInformationModelUri"); //no attributes
                    writer.writeTextContent(originInformationModelUriElement, restriction.originInformationModelUri);
                }
                return restrictionElement;
            },

            renderFilter: function(filter, parent, writer) {
                var writingFilterTypeMapper = function(value) {
                    return writer.addPrefix(sharedmodel.NameSpace.PRIVILEGE, value);
                };
                var filterElement = writer.writeElement(filter, parent, "filter", {
                    attributeName: "{attributeName}",
                    type: Util.createXsiSelector("type", writingFilterTypeMapper)
                });
                filter.valueFilters.foreach(function(valueFilter) {
                    sharedmodel.renderValueFilter(valueFilter, filterElement, writer, "valueFilter");
                });

                filter.procedureFilters.foreach(function(procedureFilter) {
                    writer.writeElement(procedureFilter, filterElement, "procedureFilter", {
                        operator: "{operator}",
                        procedureName: "{procedureName}"
                    });
                });
            },
        };

        return AnalyticPrivilegeXmlRenderer;
    });
