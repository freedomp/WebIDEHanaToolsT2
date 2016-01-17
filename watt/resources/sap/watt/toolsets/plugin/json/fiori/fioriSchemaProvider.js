define(["sap/watt/toolsets/plugin/json/utils/fioriSchemaUtil", "sap/watt/toolsets/plugin/json/utils/getSchema"], function(fioriSchemaUtil, getSchema) {

    var appDescriptorSchema = null;

    return {

        baseSchemaUrl : "sap.watt.toolsets.json/fiori/schema/",

        getSchema : function(oJson){
            return this.getFlatSchema(oJson);
        },

        _getRootSchema : function(){
            if(appDescriptorSchema){
                return Q( appDescriptorSchema);
            }else{
                var sUrl = this.baseSchemaUrl+"schema.json";
                var that = this;
                return getSchema._getRemoteResource(sUrl).then(function(oSchema){
                    var aPromises = [];
                    oSchema = _.cloneDeep(oSchema);
                    that._getRefs(oSchema, aPromises);
                    return Q.all(aPromises).then(function(){
                        //schema pointer is udpated
                        appDescriptorSchema = oSchema;
                        return oSchema;
                    });
                });
            }
        },

        _getPropertyVersionFromUserInput : function(oManifestJson, sPropertyName){
           if(oManifestJson && oManifestJson[sPropertyName]){
               return oManifestJson[sPropertyName]._version;
           }
        },

        getFlatSchema : function(oManifestJson){
            var that = this;
            return this._getRootSchema().then(function(appDescriptorSchema){
                var oSchema = _.cloneDeep(appDescriptorSchema);
                var aProperties = oSchema.properties;
                _.each(aProperties, function(oProperty, sPropertyName){
                    var sVersion = that._getPropertyVersionFromUserInput(oManifestJson, sPropertyName);
                    fioriSchemaUtil.getSubSchemasByVersion(oProperty, sVersion, sPropertyName);
                });
                return oSchema;
            });
        },



        _getRefs : function(oSchema, aPromises){
            var that = this;
            _.each(oSchema , function(val, key, oWrappingObj) {
                if (_.isObject(val)) {
                    that._getRefs(val, aPromises);
                }else{
                    if(key === "$ref"){
                        aPromises.push(getSchema._getRemoteResource(that.baseSchemaUrl+val).then($.proxy(function(oOriginalWrappingObj, oSchema){
                            delete oOriginalWrappingObj["$ref"];
                            _.merge(oOriginalWrappingObj,oSchema);
                        }, this, oWrappingObj)));
                    }
                }
            });
        }

    };


});