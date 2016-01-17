define({

		getFileData: function(sDocContent, oEsprimaParser) {

			var aFuncList = [];
				//call the esprima parser
				return oEsprimaParser.parse(sDocContent).then(function(parsedContent){
					//get the functions
					var aFunctionsList = parsedContent.getFunctions();
					//create the functions array
					aFunctionsList.forEach(function(oFuncEntry) {
						aFuncList.push({
							objectName: "anonymous",
							functionName: oFuncEntry.functionName,
							selected: false,
							aFunctionParameters: oFuncEntry.getFunctionParameter()
						});
					});
					//get the objects
					var aObjectsList = parsedContent.getObjects();
					//create the object array
					aObjectsList.forEach(function(oObjEntry) {
						// get the functions for the object
						oObjEntry.getFunctions().forEach(function(oFuncEntry) {
						    var objectName;
						    if (!oObjEntry.objectName) {
							    objectName = "anonymous";
							 } else {
							    objectName = oObjEntry.objectName;	
							 }
							aFuncList.push({
								objectName: objectName,
								functionName: oFuncEntry.functionName,
								selected: false,
								aFunctionParameters: oFuncEntry.getFunctionParameter()
							});
						});
					});
					return aFuncList;
				});

		},
		
		//convert the ui model into the wizard model
		updateWizardModel: function(aTableFuncList) {
			//create the model for the generation process
			var oQunitData = {
				aObjectList: [{
					objectName: null,
					aFunctionsList: [{
						functionName: null,
						sFunctionParameters: null,
						aFunctionParameters: []
					                    }]
					                }],
				aFunctionsList: [{
					functionName: null,
					sFunctionParameters: null,
					aFunctionParameters: []
					                    }]
			};

			var aObjectList = oQunitData.aObjectList;
			var aObjectFunctionsList = aObjectList[0].aFunctionsList;
			var aFunctionsList = oQunitData.aFunctionsList;
			
			//convert the ui model to the generation model
			for (var i = 0; i < aTableFuncList.length; i++) {
			    var objectName;
			    if (aTableFuncList[i].objectName === "anonymous" || aTableFuncList[i].objectName === null) {
				    objectName = null;	
				} else {
					objectName = aTableFuncList[i].objectName;
				}
				//if object name is not null
				if (objectName) {
					//if the line is selected
					if (aTableFuncList[i].selected) {
						//search for the object list in the model
						var iPostion = aObjectList.map(function(x) {
							return x.objectName;
						}).indexOf(aTableFuncList[i].objectName);
						//when the object is found add the function 
						if (iPostion >= 0) {
							aObjectFunctionsList = aObjectList[iPostion].aFunctionsList;
							aObjectFunctionsList.push({
								functionName: aTableFuncList[i].functionName,
								sFunctionParameters: null,
								aFunctionParams: aTableFuncList[i].aFunctionParameters
							});
						} else {
							//when the object is not found and the object and the function
							aObjectFunctionsList = [];
							aObjectFunctionsList.push({
								functionName: aTableFuncList[i].functionName,
								sFunctionParameters: null,
								aFunctionParams: aTableFuncList[i].aFunctionParameters
							});

							aObjectList.push({
								objectName: aTableFuncList[i].objectName,
								aFunctionsList: aObjectFunctionsList
							});

						}

					}
				} else {
					//when the function is not part of an object
					if (aTableFuncList[i].selected) {
						aFunctionsList.push({
							functionName: aTableFuncList[i].functionName,
							sFunctionParameters: null,
							aFunctionParams: aTableFuncList[i].aFunctionParameters
						});
					}
				}

			}
			//delete the null values from the array
			var iElementPos = aObjectList.map(function(x) {
				return x.objectName;
			}).indexOf(null);
			aObjectList.splice(iElementPos, 1);
			//delete the null values from the array
			iElementPos = aFunctionsList.map(function(x) {
				return x.functionName;
			}).indexOf(null);
			aFunctionsList.splice(iElementPos, 1);

			//update the generation model
			oQunitData.aObjectList = aObjectList;
			oQunitData.aFunctionsList = aFunctionsList;
			return oQunitData;
		}
});