define(["STF"] , function(STF) {

	"use strict";
	var suiteName = "AnnotationSelectionStep_Integration", getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var _oMockServer,oFakeFileDAO, oAnnotationService,  iFrameWindow, stepContent,oModel, jProxies;//, catalogStepWizrd, oModel;

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/config.json"})
				.then(function (oWindow) {
					iFrameWindow = oWindow;
					oAnnotationService = getService('odataAnnotationSelectionStep');
					oFakeFileDAO = getService('fakeFileDAO');

					oModel = new iFrameWindow.sap.ui.model.json.JSONModel();
				    oModel.setData({
					    "connectionData": {
			            "url":"",
				        "annotationUrl" : "",
				        "annotationRuntimeUrl":"",
				        "runtimeUrl": "",
	                    "serviceName": "",
	                    "type": "",
				        "destinationBSP":"",
				        "metadataContent" :"",
				        "destination" : {
				    	}
				    }});

					if (!stepContent){
				    	return oAnnotationService.getContent().then(function(wizard) {
         	            stepContent = wizard.getStepContent();
         	            stepContent.getModel = function() {
         	                return oModel;
         	            };
		        	});
                }
                stepContent._cleanParams();
                return Q();
			});
			
		});
		
		beforeEach(function(){
			if (stepContent){
				stepContent._cleanParams();
			}
			
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			//oMockServer.stop();
			//oMockServer.destroy();
		});

		//Helpers
		jProxies =  "{\"d\":{\"results\":[{\"__metadata\":{\"id\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')\",\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')\",\"type\":\"CATALOGSERVICE.Annotation\",\"content_type\":\"application/xml\",\"media_src\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value\"},\"TechnicalName\":\"ZANNO4SAMPLE_ANNO_MDL\",\"Version\":\"0001\",\"Description\":\"ZANNO4SAMPLE_ANNO_MDL\",\"MediaType\":\"application/xml\",\"Services\":{\"__deferred\":{\"uri\":\"https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhanaui5/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/Services\"}}}]}}";
		function startMock(path,content,contentType){
			iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
			_oMockServer = new iFrameWindow.sap.ui.app.MockServer();
			_oMockServer.setRequests([{
                        method: "GET",
                        path:  new iFrameWindow.RegExp(path), //".*Annotations.*"
                        response: function (oXhr) {
                            oXhr.respond(200, {
                                "Content-Type": contentType //"application/text"
                            },content ); 
                        }
                    }]);
            _oMockServer.start();
			
		}
		function stopMock(){
			_oMockServer.stop();
		}
		
		function AddAnnoationsDataToModel(annTechnicalName, oXMLcontent, url, sRuntimeAnnotationURI, oDestination,isMetadata,isService,source){
			if(!isMetadata){
				var annotations = stepContent.addAnnotaions(annTechnicalName, oXMLcontent, url, sRuntimeAnnotationURI, oDestination);
			}
			stepContent.updateAnnotaionsUI(annTechnicalName,url,isMetadata,isService,source);
			stepContent.getModel().setProperty("/annotations",annotations);
		}
		
		function dataConnectionMock(){
			stepContent._dataConnectionUtils = {};
   	    	stepContent._dataConnectionUtils.getRuntimeUrl = function(){return "";};
   	    	stepContent._dataConnectionUtils.getDesigntimeUrl = function(){return "";};
   	    	stepContent._dataConnectionUtils.getUrlPath =  function(){return "";};
   	    	stepContent._dataConnectionUtils.removeAbsoluteURL =  function(){return "";};
		}
		
		
		//Test
		it("Annotation Step - test collectAnnotaionsFromProject", function (done) {
			var sComponentJsContent = "sap.ui.generic.app.AppComponent.extend(\"sdsd.Component\", {\metadata: {\
						\"manifest\": \"json\"}\\}\);";
			
			var aPromises = [];
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/metadata.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/localAnnotations.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/localAnnotations_1.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/localAnnotations_2.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/localAnnotations_3.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/localAnnotations_4.xml")));
            aPromises.push(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/SEPMRA_PROD_MAN_ANNO_MDL.xml")));
            
            return Q(jQuery.ajax({url: require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/resources/manifest.json"), dataType: "json"})).then(function (result) {
				var manifest = JSON.stringify(result);
				
				 return Q.all(aPromises).spread(function(oMetadata,localAnno,localAnno_1,localAnno_2,localAnno_3,localAnno_4,oAnnoFromService){
    
         	    var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
         	    
         	    var localAnnotations = new iFrameWindow.XMLSerializer().serializeToString(localAnno);
         	    var localAnnotations_1 = new iFrameWindow.XMLSerializer().serializeToString(localAnno_1);
         	    var localAnnotations_2 = new iFrameWindow.XMLSerializer().serializeToString(localAnno_2);
         	    var localAnnotations_3 = new iFrameWindow.XMLSerializer().serializeToString(localAnno_3);
         	    var localAnnotations_4 = new iFrameWindow.XMLSerializer().serializeToString(localAnno_4);
         	    var SEPMRA_PROD_MAN_ANNO_MDL = new iFrameWindow.XMLSerializer().serializeToString(oAnnoFromService);
         	    
         	    var oFileStructure = {
	         	    "SomeProject": 	{
		            	"webapp" : {
							"manifest.json" : manifest,
							"Component.js" : sComponentJsContent,
							"annotations" : {
								"localAnnotations.xml": localAnnotations,
								"localAnnotations_1.xml": localAnnotations_1,
								"localAnnotations_2.xml": localAnnotations_2,
								"localAnnotations_3.xml": localAnnotations_3,
								"localAnnotations_4.xml": localAnnotations_4
							},
							"localService" : {
								"metadata.xml": sMetadata,
								"SEPMRA_PROD_MAN_ANNO_MDL.xml": SEPMRA_PROD_MAN_ANNO_MDL
							}
	    				}
	         	    }
    			};
    			
    			
    			return oFakeFileDAO.setContent(oFileStructure).then(function() {
		    			var connectionData = stepContent.getModel().getProperty("/connectionData");
		    			connectionData.metadataContent = sMetadata;
     	    			dataConnectionMock();
	    	            return stepContent.collectAnnotaionsFromProject("/SomeProject", connectionData, connectionData.metadataContent).then(function(){
		         	        var annotation = stepContent.getModel().getProperty("/annotations");
		         	        assert.ok(annotation.length === 7, "All annotations from current project were collected");
		         	        done();
	         	    	});
	    			});
    			});
			});
	    });
		
	    it("Annotation Step - test fetchStepData metadata no inline annotation with service annotaion", function (done) {
	    	startMock(".*Annotations.*",jProxies,"application/json");
		    return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
         	    var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
         	    var connectionData = stepContent.getModel().getProperty("/connectionData");
         	    connectionData.metadataContent = sMetadata;
         	    dataConnectionMock();
         	    return stepContent.fetchStepData().then(function(){
         	        var annotation = stepContent.getModel().getProperty("/aAnntoationUrls");
         	        //var res = oMetaModel !== undefined;
         	        assert.ok(annotation, "fetchStepData failed to fetch annotation URLS");
         	        stopMock();
         	        done();
         	    });
    		});
	    });
	    it("Annotation Step - test fetchStepData metadata no inline annotation without service annotaion", function (done) {
	    	startMock(".*Annotations.*","{\"d\":{\"results\":[]}}","application/json");
		    return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
         	    var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
         	    var connectionData = stepContent.getModel().getProperty("/connectionData");
         	    connectionData.metadataContent = sMetadata;
         	    dataConnectionMock();
         	    return stepContent.fetchStepData().then(function(){
         	        var annotationUrls = stepContent.getModel().getProperty("/aAnntoationUrls");
         	        assert.ok(!annotationUrls, "fetchStepData no annotation URLS expected");
         	        stopMock();
         	        done();
         	    });
    		});
	    });
	    
	    it("Annotation Step - test addInlineAnnotaions metadata no inline annotation", function (done) {
	    	startMock(".*Annotations.*",jProxies,"application/json");
		    return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
         	    var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
         	    var connectionData = stepContent.getModel().getProperty("/connectionData");
         	    connectionData.metadataContent = sMetadata;
         	    stepContent._bDoBeforeRendering = true;
         	    dataConnectionMock();
         	    return stepContent.addInlineAnnotaions().then(function(){
         	        var annotation = stepContent.getModel().getProperty("/annotations");
         	        var annotationTbl = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
         	        //var res = oMetaModel !== undefined;
         	        assert.ok(!annotation, "no annotation expected but");
         	        assert.ok(annotationTbl.length===0, "metadata annotaion expected");
         	        stopMock();
         	        done();
         	    });
    		});
	    });
	    
	    it("Annotation Step - test addInlineAnnotaions metadata  inline annotation", function (done) {
	    	startMock(".*Annotations.*",jProxies,"application/json");
		    return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadataWithannotations.xml"))).then(function(oMetadata){
         	    var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
         	    var connectionData = stepContent.getModel().getProperty("/connectionData");
         	    connectionData.metadataContent = sMetadata;
         	    stepContent._bDoBeforeRendering = true;
         	     return stepContent.addInlineAnnotaions().then(function(){
         	        var annotation = stepContent.getModel().getProperty("/annotations");
         	         var annotationTbl = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
         	        //var res = oMetaModel !== undefined;
         	        assert.ok(!annotation, "no annotation expected");
         	        assert.ok(annotationTbl, "metadata annotaion expected");
					stopMock();
					done();
         	    });
    		});
	    });
	   
	    it("Annotation Step - test onAddServAnnotationassert.okButtonPressed", function(done) {
		   	var annotationUrls = [];//stepContent.getModel().getProperty("/aAnntoationUrls");
 	    	annotationUrls[0] = {__metadata: {media_src : "https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhan…2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value"},
 	    						 selected :true};
 	    	stepContent.getModel().setProperty("/aAnntoationUrls",annotationUrls);
      		return stepContent.onAddServAnnotationOkButtonPressed().then(function(){
      			var annotation = stepContent.getModel().getProperty("/annotations");
     			var aAnnotationsUI = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
				assert.ok(annotation, "Annotation expected");
				assert.ok(aAnnotationsUI, "Annotaion UI expected");
				stopMock();
				done();
     		});
		 });
	    
		it("Annotation Step - test removeAnnotationFromModel",function(done) {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
				var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/annotation.xml"))).then(function(oAnnotation) {
					var sAnnotation = new iFrameWindow.XMLSerializer().serializeToString(oAnnotation);
					startMock(".*Annotations.*",sAnnotation,"application/text");
	               	var connectionData = stepContent.getModel().getProperty("/connectionData");
	       	    	connectionData.metadataContent = sMetadata;
	       	    	connectionData.destination.path = "/sap/opu/odata";
	       	    	connectionData.destination.url = "/destinations/dewdflhanaui5";
			   		var annotationUrls = [];//stepContent.getModel().getProperty("/aAnntoationUrls");
	 	    		annotationUrls[0] = {TechnicalName:"ZANNO4SAMPLE_ANNO_MDL",__metadata: {media_src : "https://devint-x80be6fbb.dispatcher.neo.ondemand.com/destinations/dewdflhan…2/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value"},
	 	    						 selected :true};
	 	    		stepContent.getModel().setProperty("/aAnntoationUrls",annotationUrls);
	      			return stepContent.onAddServAnnotationOkButtonPressed().then(function(){
						return stepContent.removeAnnotationFromModel(0).then(function(){
							var annotation = stepContent.getModel().getProperty("/annotations");
	         				var aAnnotationsUI = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
	         				var metaModel =  stepContent.getModel().getProperty("/metaModel");
	        				assert.ok(annotation.length===0, " no annotation expected");
	        				assert.ok(aAnnotationsUI.length===0, "no annotaion UI expected");
	        				assert.ok(metaModel, "metaModel expected");
	        				done();
						});
			 		});
				});
			});
		});
		
		it("Annotation Step - test changeAnnotationPriority", function(done) {
		  startMock(".*Annotations.*",jProxies,"application/json");
		  stepContent._cleanParams(); //cleans the model
		  dataConnectionMock();
		  return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/annotation.xml"))).then(function(oAnnotation){
	    		var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
	    		var sAnnotation = new iFrameWindow.XMLSerializer().serializeToString(oAnnotation);
	     		var connectionData = stepContent.getModel().getProperty("/connectionData");
	     		connectionData.metadataContent = sMetadata;
	     		var oDestination = {};
	 	 		AddAnnoationsDataToModel("annTechnicalName", sAnnotation, "", "", oDestination,false,true,"Service");
	 	 		AddAnnoationsDataToModel("annTechnicalName1", sAnnotation, "", "", oDestination,false,true,"Service");
	      		return stepContent.changeAnnotationPriority(0,1).then(function(){
	      			var annotation = stepContent.getModel().getProperty("/annotations");
	 				var aAnnotationsUI = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
	 				var metaModel =  stepContent.getModel().getProperty("/metaModel");
					assert.ok(annotation[0].name==="annTechnicalName1", "change annotation priority failed");
					assert.ok(aAnnotationsUI[0].name==="annTechnicalName1", "change annotation priority failed");
					assert.ok(metaModel, "metaModel expected");
					done();
	      		});
			});
		  });
    	});
	    
		it.skip("Annotation Step - test changeAnnotationPriority with metadata",function() {
		  startMock(".*Annotations.*",jProxies,"application/json");
		  stepContent._cleanParams(); //cleans the model
		  dataConnectionMock();
		  return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/metadata.xml"))).then(function(oMetadata){
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UIAnnotation/annotation.xml"))).then(function(oAnnotation){
	    		var sMetadata = new iFrameWindow.XMLSerializer().serializeToString(oMetadata);
	    		var sAnnotation = new iFrameWindow.XMLSerializer().serializeToString(oAnnotation);
	     		var connectionData = stepContent.getModel().getProperty("/connectionData");
	     		connectionData.metadataContent = sMetadata;
	     		var oDestination = {};
	   			AddAnnoationsDataToModel("metadata", sMetadata, "", "", oDestination,true,false,"Service");
	   	 		AddAnnoationsDataToModel("annTechnicalName", sAnnotation, "", "", oDestination,false,true,"Service");
	   	 		AddAnnoationsDataToModel("annTechnicalName1", sAnnotation, "", "", oDestination,false,true,"Service");
	      		return stepContent.changeAnnotationPriority(1,2).then(function(){
	      			var annotation = stepContent.getModel().getProperty("/annotations");
         			var aAnnotationsUI = stepContent._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
        			var metaModel =  stepContent.getModel().getProperty("/metaModel");
        			assert.ok(annotation[0].name==="annTechnicalName1", "change annotation priority failed");
		        	assert.ok(aAnnotationsUI[1].name==="annTechnicalName1", "change annotation priority failed");
		        	assert.ok(metaModel, "metaModel expected");
		        	
	      		});
	   		});
		  });
	    });
	});
});