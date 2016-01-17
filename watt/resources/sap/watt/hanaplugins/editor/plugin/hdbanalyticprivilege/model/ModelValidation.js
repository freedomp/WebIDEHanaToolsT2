/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase"], function(modelbase) {
    var validator = {};
    validator.validateRestrictions = function(model) {
        var ModelException = modelbase.ModelException;
        var originalRestrictions = model._apeModel.analyticPrivilege.restrictions;
        var apeRestrictions = model.restrictions;
        var that = this;
        if (originalRestrictions && apeRestrictions) {
            // for (var i = 0; i < originalRestrictions.size(); i++) {
                for (var i in originalRestrictions._values){
                var restriction = originalRestrictions.get(i);
                var apeRestriction = apeRestrictions[i];
                

                if (apeRestriction.originInformationModelUri === "select") {
                    throw new ModelException("No model has been selected for restriction #" + (i + 1) + ".");
                }
                if (apeRestriction.attributeName === "select") {
                    throw new ModelException("No attributename has been selected for restriction #" + (i + 1) + ".");
                }
                if (apeRestriction.dimensionUri === "select") {
                    throw new ModelException("No model has been selected for restriction #" + i + ".");
                }

                var valueFilters = originalRestrictions.get(i).filters.get(apeRestriction.attributeName).valueFilters;
                var procedureFilters = originalRestrictions.get(i).filters.get(apeRestriction.attributeName).procedureFilters;

                // this.validateValueFilters(valueFilters, i + 1);
                // this.validateProcedureFilters(procedureFilters, i + 1);
            }
        }
    };

    validator.validateValueFilters = function(valueFilters, restrictionIndex) {
        var ModelException = modelbase.ModelException;

        for (var i = 0; i < valueFilters.size(); i++) {
            var filter = valueFilters.getAt(i);
            if (filter.operator === "select") {
                throw new ModelException("No operator has been selected for filter #" + (i + 1) + " of restriction #" + restrictionIndex);
            }
            if (filter.value === "select") {
                throw new ModelException("No value has been selected for filter #" + (i + 1) + "  of restriction #" + restrictionIndex);
            }
        }
    };

    validator.validateProcedureFilters = function(procedureFilters, restrictionIndex) {
        var ModelException = modelbase.ModelException;

        for (var i = 0; i < procedureFilters.size(); i++) {
            var filter = procedureFilters.getAt(i);
            if (filter.operator === "select") {
                throw new ModelException("No operator has been selected for procedure #" + (i + 1) + "  of restriction #" + restrictionIndex);
            }
            if (filter.procedureName === "select") {
                throw new ModelException("No procedurename has been selected for filter #" + (i + 1) + "  of restriction #" + restrictionIndex);
            }
        }
    };

    return validator;
});
