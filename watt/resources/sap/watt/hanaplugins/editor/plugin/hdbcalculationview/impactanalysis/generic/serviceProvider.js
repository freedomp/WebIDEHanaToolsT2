/**
 * Defines a base class for the impact and lineage analysis service provider.
 * User: I063946
 * Date: 24/06/15
 * (c) Copyright 2013-2015 SAP SE. All rights reserved
 */


    "use strict";

    namespace("sap.hana.impactAnalysis",function(namespace){
    /**
     * @class
     * Impact and Lineage analysis service provide base class used to retrieve impact and lineage data from server.
     */
    	namespace.ServiceProvider = sap.galilei.core.defineClass({
        // Define class name
        fullClassName: "sap.hana.impactAnalysis.ServiceProvider",
        
        parent: sap.galilei.impactAnalysis.generic.ServiceProvider,
        
        // Define properties
        properties: {
            /**
             * Gets or sets the impact analyzer
             * @name impactAnalyzer
             * @memberOf sap.hana.impactAnalysis.ServiceProvider#
             * @type {sap.hana.impactAnalysis.ImpactAnalyzer}
             */
            impactAnalyzer: undefined,

            /**
             * Gets or sets the current object adapter
             * @name objectAdapter
             * @memberOf sap.galilei.impactAnalysis.ServiceProvider#
             * @type {sap.galilei.impactAnalysis.ObjectAdapter}
             */
            objectAdapter: undefined,
            
            /**
             * Indicates whether the service can retrieve multiple levels at once.
             * @name isSupportMultipleLevels
             * @memberOf sap.galilei.impactAnalysis.generic.ServiceProvider#
             * @type {Boolean}
             * @default true
             */
            isSupportMultipleLevels: true
        },

        // Define methods
        methods: {
          /**
             * Checks whether the object has impact or lineage objects asynchronously for the object URI.
             * @memberOf sap.galilei.impactAnalysis.ServiceProvider#
             * @param {String} sObjectUri The analysis object URI.
             * @param {Boolean} bGetImpact (Optional) Indicates whether to get impact objects. Default: true.
             * @param {Boolean} bGetLineage (Optional) Indicates whether to get lineage objects. Default: false.
             * @param {Object} oCustomData It can contain analysisObject, node and additional info.
             * @returns {jQuery.Deferred()}
             */
            getHasImpactAndLineageAsync: function (sObjectUri, bGetImpact, bGetLineage, oCustomData) {
                var oResult = jQuery.Deferred();

                // No impact and lineage
                oResult.resolve(false);

                return oResult;
            },
            /**
             * Gets the impact and lineage data asynchronously for the object URI.
             * @name getImpactAndLineageAsync
             * @memberOf sap.hana.impactAnalysis.ServiceProvider#
             * @param {String} sObjectUri The analysis object URI.
             * @param {Boolean} bGetImpact (Optional) Indicates whether to get impact objects. Default: true.
             * @param {Boolean} bGetLineage (Optional) Indicates whether to get lineage objects. Default: false.
             * @param {Number} nLevel (Optional) The depth of impact or lineage objects. Default: 1.
             * @returns {jQuery.Deferred()}
             */
             
      getImpactAndLineageAsync: function (sObjectUri, bGetImpact, bGetLineage, nLevel,oCustomData) { 
//          var a= editor.context;
          var oResult = jQuery.Deferred(),
                 sUri,
                 sUrlprefix = "/metadataapi/hdiservices/",
                 sEncodeObjectUri,
                 sUriParameters,
                 ajaxRequest,
                 oIAData,
                 oImpactData;
         

          function encodeObjectUri(sObjectUri) {

                 //var index,
                 //index2,
                 //sEncodeUri;

          /*if (sObjectUri) {
                 index = sObjectUri.indexOf(sUrlprefix);
                 if (index !== -1) {
                        // Removes the prefix /metadataapi/dbobjects/
                        sEncodeUri = sObjectUri.substring(index + sUrlprefix.length);
    var sDataUri = (sEncodeUri.match(/\./g) || []).length;
                        // Replaces . by %2E
                        sEncodeUri = sEncodeUri.replace(/\./g, "%2E");



   
                        // TODO: Should we encode :: ?

                        // Replaces the last / by %2F
                        index = sObjectUri.lastIndexOf(".");
                        if (index === -1) {
                               index = sObjectUri.lastIndexOf(":");
                        }
                        index2 = sObjectUri.lastIndexOf("/");
                        if (index !== -1 && index2 !== -1 && index2 > index) {
                               index2 = sEncodeUri.lastIndexOf("/");
                               if(sDataUri >1){
                               sEncodeUri = sEncodeUri.substring(0, index2) + "%2F" + sEncodeUri.substring(index2 + 1);
                               }

                                      else if(sDataUri ===1){
                                 sEncodeUri = sEncodeUri.substring(0, index2) + "/" + sEncodeUri.substring(index2 + 1); 



                               }

                        } else if (index2 !== -1 && index2 > index) {
                               index2 = sEncodeUri.lastIndexOf("/");

                               if(sDataUri >1){
                                   sEncodeUri = sEncodeUri.substring(0, index2) + "%2F" + sEncodeUri.substring(index2 + 1);


                               }
                               else if (sDataUri ===1){
                                   sEncodeUri = sEncodeUri.substring(0, index2) + "/" + sEncodeUri.substring(index2 + 1); 


                               }
                              
                        }

                




                 }


          } */
          if (sObjectUri) {
                          var sObjectUrichange = sObjectUri.replace('dbobjects', 'xref');
             var index = sObjectUrichange.indexOf(sUrlprefix);
                                                   if (index !== -1) {
                                                         
                               var sEncodeUri = sObjectUrichange.substring(index + sUrlprefix.length);
                                  }
                      var xrefurl = sEncodeUri.substring(sEncodeUri.indexOf("xref"),sEncodeUri.length);
                      
                  var sEncodeUri2 = sEncodeUri.replace(/xref.*$/i, "");
             
               
              var sEncodeUri3 = sEncodeUri2.substring(0, sEncodeUri2.length-1);
             
              var sEncodeUri4 = sEncodeUri3.replace(/\//g, "%2F");
               var sObjectUrinew = sUrlprefix + sEncodeUri4 + "/" + xrefurl;
          }
                                                                
          return sObjectUrinew;
         
         
   }

          function getUriParameters() {
                 var sParameters;
                       // nLevel = 1;

                 if (bGetImpact || bGetLineage) {
                        sParameters = "direction=";
                        if (bGetImpact) {
                               sParameters += "impact";
                        }
                        if (bGetLineage) {
                               if (bGetImpact) {
                                      sParameters += ",";
                               }
                               sParameters += "lineage";
                        }
                 }

                 //sParameters = "lineage";

                 if (nLevel !== undefined) {
                        if (sParameters) {
                               sParameters += "&";
                        }
                        sParameters += "level=" + nLevel;
                 }

                 return sParameters;
          }

          //sUri = "http://mo-610a10504.mo.sap.corp:49005/metadataapi/xref/";

          //sUri = "http://10.53.218.88:8081/metadataapi/xref/";
          if (sObjectUri) {
        	      
                 sEncodeObjectUri = encodeObjectUri(sObjectUri);
                 if (sEncodeObjectUri) {
                        sUri = sEncodeObjectUri;

                        sUriParameters = getUriParameters();
                        if (sUriParameters) {
                               sUri += "?" + sUriParameters;
                        }

                        // Returns the JSON data for the current object
                        ajaxRequest = new XMLHttpRequest();
                        //sUri = "http://mo-a96341a6e.mo.sap.corp:3000/metadataapi/xref/MINI/playground%2EVinayak_SP11%2EWHERE_USED%2FJOIN_CV";
                        ajaxRequest.open("GET", sUri, true);
                        //ajaxRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
                        ajaxRequest.send(null);
                        ajaxRequest.onload = function() {
                        	 var sServiceResponseJson,
                                      oServiceResponseJsonObject;

                               if (ajaxRequest.readyState === 4) {
                                      sServiceResponseJson = ajaxRequest.responseText;
                                      try{
                                      if (sServiceResponseJson) {
                                             oServiceResponseJsonObject = JSON.parse(sServiceResponseJson);
                                      }
                                      
                                      //oResult.resolve(oServiceResponseJsonObject.xref);
                                      oResult.resolve(oServiceResponseJsonObject);
                                      }catch(e){
                                    	  oResult.resolve();
                                      }
                               }
                        };
                 } else {
                        oResult.resolve();
                 }
          } else {
                 oResult.resolve();
          }
          
          return oResult;
  },
				getJSONData:function(){
				    var _IA_Data= {
                        "pd://pdserver.wdf.sap.corp:8000/-4560:4562": {
                            "impact": [
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4563",
                                    "name": "Customer.Id",
                                    "type": "COLUMN",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4563}",
                                    "link": {
                                        "type": "Join"
                                    }
                                }
                            ]
                        },
                        "pd://pdserver.wdf.sap.corp:8000/-4560:4563": {
                            "impact": [
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4571",
                                    "name": "Order.CustomerId",
                                    "type": "COLUMN",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4571}"
                                },
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4572",
                                    "name": "Order.Date",
                                    "type": "COLUMN",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4572}",
                                    "impact": [
                                        // Circular dependency
                                        {
                                            "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4563",
                                            "name": "Customer.Id",
                                            "type": "COLUMN"
                                        },
                                        // To an existing object
                                        {
                                            "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4592",
                                            "name": "OrderLine",
                                            "type": "TABLE",
                                            "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4592}"
                                        }
                                    ]
                                },
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4591",
                                    "name": "Order",
                                    "type": "TABLE",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4591}"
                                }
                            ]
                        },
                        "pd://pdserver.wdf.sap.corp:8000/-4560:4571": {
                            "impact": [
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4581",
                                    "name": "OrderLine.OrderId",
                                    "type": "COLUMN",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4581}",
                                    "impact": [
                                        // To an existing object
                                        {
                                            "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4592",
                                            "name": "OrderLine",
                                            "type": "TABLE",
                                            "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4592}"
                                        }
                                    ]
                                },
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4582",
                                    "name": "OrderLine.Quantity",
                                    "type": "COLUMN",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4581}"
                                },
                                {
                                    "uri": "pd://pdserver.wdf.sap.corp:8000/-4560:4592",
                                    "name": "OrderLine",
                                    "type": "TABLE",
                                    "editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4592}"
                                }
                            ]
                        }
                    };
                    return _IA_Data;
				}
        },

        // Define static members
        statics: {
            /**
             * The shared serailizer instance.
             * @static
             * @private
             */
            _instance: undefined,

            /**
             * Gets a shared instance of the generic object serializer.
             * @static
             * @function
             * @name getInstance
             * @memberOf sap.hana.impactAnalysis.ServiceProvider#
             * @returns {sap.hana.impactAnalysis.ServiceProvider}
             */
            getInstance: function () {
                if (!this._instance) {
                    this._instance = new sap.hana.impactAnalysis.ServiceProvider();
                }
                return this._instance;
            }
        }
    })});
