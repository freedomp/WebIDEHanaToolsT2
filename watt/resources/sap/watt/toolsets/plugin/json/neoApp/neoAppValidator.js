define([ "sap/watt/toolsets/plugin/json/utils/getSchema"], function( getSchema) {
	var oSchemaDescription = null;

	return {

		baseSchemaUrl : "sap.watt.toolsets.json/neoApp/schema/",

		getSchema: function () {
				if(oSchemaDescription){
					return Q(oSchemaDescription);
				}else{
					var sUrl = this.baseSchemaUrl+"neoAppSchema.json";
					return getSchema._getRemoteResource(sUrl).then(function(oSchema){
							oSchemaDescription = oSchema;
							return oSchema;
					});
				}
			}


		};
});