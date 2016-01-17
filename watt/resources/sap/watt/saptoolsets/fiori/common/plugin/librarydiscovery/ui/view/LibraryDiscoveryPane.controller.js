sap.ui.controller("sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery.ui.view.LibraryDiscoveryPane", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.LibraryDiscoveryView
	 */
	 
    _DEFAULT_ROW_VISIBLE_COUNT: 10,
	 
	onInit: function() {
	    this._oContext = this.getView().getViewData();
		var oModel = new sap.ui.model.json.JSONModel();
		//TODO: workaround for the sapui5 model size limitation
		oModel.iSizeLimit = 10000;
		this.getView().setModel(oModel);

		this.getView().bindElement("/modelData");

		this._oContext.i18n.applyTo(this.getView());

		this.initDataBeforeOpen(this._oContext.oContentType);
	},
	
	initDataBeforeOpen : function(oContentType){
	    this.setContentType(oContentType);
	    var oData = this._getInitialData();
	    this.getView().getModel().setData(oData);
	    this._sendValidationStatus({ isValid : false});
	},
	
	_mRepositoryTypeEnum: {
		SAPUI5: 0,
		ABAP: 1,
		HCP: 2,
		WORKSPACE: 3,
		NONE : 4
	},

	_oContentType: {
		library: false,
		control: false,
		reuseComponent: false
	},
	
	_mProgressStatusEnum : {
	    Start : 0,
	    End : 1
	},
	
	_fChangeHandler : null,
	_fValidationHandler : null,
	_fProgressHandler : null,
	
	_onVersionChange : function(oEvent){
	    
        var self = this;
        var libName = oEvent.getParameters().selectedItem.getBindingContext().getObject().key;
        var libVersion = oEvent.getParameters().selectedItem.getBindingContext().getObject().name;
        var item = oEvent.getSource().getBindingContext().getObject();
        if (item.externalName === libName){
            this._oContext.service.libraryDiscovery.getLibraryFromHCP(libName,libVersion).then(function(libraryResult){
              item.controls =   libraryResult.controls;
              for(var i = 0 ; i < item.controls.length ; i++ ){
                  item.controls[i].selected = false;
                  item.controls[i].selectable = self._oContentType.control;
			      item.controls[i].checked = true;
              }
              self.getLibraryModel().setData(self.getLibraryModel().getData());
            });
        }
        
	},
	
	_getInitialData: function() {
	    
	   
		var oData = {
			root: {
				name: "root",
				description: "libraries ",
				checked: false,
				items: []
				/*[{
					name: "sap.m",
					selected: false,
					selectable: this._oContentType.library,
					version: "1.2.7",
					account: "watt",
					description: "mobile",
					checked: true,
					controls: [{
						name: "sap.m.Button",
						selected: false,
						selectable: this._oContentType.control,
						documentationUrl: this._getDocumentationURL("sap.m.Button"),
						description: "Button",
						checked: true
					},
					{
						name: "sap.m.Label",
						selected: false,
						selectable: this._oContentType.control,
						documentationUrl: this._getDocumentationURL("sap.m.Label"),
						description: "Label",
						checked: true
					}]*/
			},
			modelData : {
    			aRepositories : this._getRepositoriesByContentType(),
    			sRepositoryValue : "",
    			aABAPSystems : [],
    			RepositoryType : this._mRepositoryTypeEnum.NONE, 
    			ABAPSystemLoaded : false,
    			VisibleRowCount : this._oContentType.library ? this._DEFAULT_ROW_VISIBLE_COUNT : 0,
    			sDestinationValue : "",
    			oABAPDestination : null,
    			bNotInProcess : true,
    			bShowNoData : false
			}
		};
        return oData;
	},
	
	_buildLibraryVersions : function(oLib){
        var aVersions = [];
        var key = oLib.externalName;
        aVersions.push( { name : "Active" , key : key} );
        for ( var i = 0 ; i < oLib.versions.length ; i++){
	       var versionName = oLib.versions[i].version;
	       aVersions.push( { name : versionName , key : key} );
	    }
	    return aVersions;
	},
	
	_getRepositoriesByContentType : function(){
	    var aRepositories = [
	    { 
	        Name : "",
	        Key : this._mRepositoryTypeEnum.NONE
	    },
	    { 
	        Name : "LibraryDiscovery_repository_workspace",
	        Key : this._mRepositoryTypeEnum.WORKSPACE
	    }, 
        { 
	        Name : "LibraryDiscovery_repository_abap",
	        Key : this._mRepositoryTypeEnum.ABAP
	    }, 
	    { 
	        Name : "LibraryDiscovery_repository_hana_cloud",
	        Key : this._mRepositoryTypeEnum.HCP
	    }];
	    if (!this._oContentType.library){
	        var oRepObj = { 
    		    Name : "LibraryDiscovery_repository_sapui5",
    			Key : this._mRepositoryTypeEnum.SAPUI5
    		};
    		 aRepositories.splice(1,0,oRepObj );
	    }
	    return aRepositories;
	},
	
	_getDocumentationURL : function (sControlName){
        return "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/" + sControlName + ".html";
    },

    getLibraryModel: function(){
       return  this.getView().getModel(); 
    },
    
	_showLibraryContent: function() {
		return  this._oContentType.library;
	},
	
	showDocumentation: function(oEvent){
	    var oBindingContext = oEvent.oSource.getBindingContext();
	    var sDocumentationUrl = oBindingContext.getProperty("documentationUrl");
	    if (sDocumentationUrl && sDocumentationUrl !== null & sDocumentationUrl !== ""){
	        window.open(sDocumentationUrl, '_blank');
	    }
	},
	
	getContentType : function(){
	    return this._oContentType;
	},
	
	setContentType: function(oContentType){
	    this._oContentType = oContentType;
	},
	
	getSelectedContent: function(){
	    var data = this.getLibraryModel().getData();
	    var modelData = data.modelData;
	    var rootModel = data.root;
	    var result = [];
	    
	    var aItems = rootModel.items;
	    
	    var size = aItems.length; 

	    for ( var i = 0 ; i < size ; i++){
	        if ( aItems[i].selected === true ){
	            result.push(this._cloneSelectedObject(aItems[i], modelData));
	        }
	        
	        var aControls = aItems[i].controls;
	        var selectedParent = null;
	        var internalSize = aControls.length; 
	        for( var j = 0 ; j <  internalSize ;j++){
                if ( aControls[j].selected === true ){
                    if (!selectedParent){
                        selectedParent = this._cloneSelectedObject(aItems[i], modelData);
                        selectedParent.controls = [];
                    }
                    selectedParent.controls.push(jQuery.extend(true, {}, aControls[j]));
                	result.push(selectedParent);
    	        }
	        }
	    }
	    return result;
	},
	
	_cloneSelectedObject : function(oItem, oModelData){
	    var oCloned =  jQuery.extend({}, oItem);   
        //selectedParent.controls = [];
        if (oModelData.oABAPDestination){
            oCloned.destinationValue =  oModelData.oABAPDestination.name;
        }
        return oCloned;
	},
	
	getRepositoryType: function(){
	    var oModel = this.getView().getModel();
	    return  oModel.getProperty("/modelData/RepositoryType");
	},

	_updateCheckboxChange : function(oEvent){
	    var oSource = oEvent.getSource();
        var oBindContext = oSource.getBindingContext();
        var oBindContextObject = oBindContext.getObject();
        
	    var rootModel = oSource.getModel().getData().root.items;

	    var size = rootModel.length;

	    for ( var i = 0 ; i < size ; i++){
	        if ( rootModel[i].selected === true && rootModel[i].name !== oBindContextObject.name){
	            rootModel[i].selected = false;
	            break;
            }
            	          
	        var aControls = rootModel[i].controls;
	        
	        var internalSize = aControls.length; 
	        for( var j = 0 ; j <  internalSize ;j++){
                if ( aControls[j].selected === true && aControls[j].name !== oBindContextObject.name ){
                    aControls[j].selected = false;
                    break;
    	        }
	        }
	    }
	    
        this.getLibraryModel().setData(oSource.getModel().getData());
	},
	
	handleCheckBoxChange : function(oEvent){
	    this._updateCheckboxChange(oEvent);
	    if (this._fChangeHandler){
	        this._fChangeHandler();
	    }
	},
	
	setSelectionChangeHandler : function(fChangeHandler){
	    this._fChangeHandler = fChangeHandler;
	},
	
	setValidationHandler : function(fValidationHandler){
	    this._fValidationHandler = fValidationHandler;
	},
	
	setProgressHandler : function(fProgressHandler){
	    this._fProgressHandler = fProgressHandler;
	},
	
	_sendValidationStatus : function( oStatus){
	     if (this._fValidationHandler){
	          this._fValidationHandler(oStatus);
	     }
	},
	
	_sendProgressStatus : function( oStatus){
	    var oTable = sap.ui.getCore().byId("oLibDiscoveryDataTable");
	    if (oTable && this._showLibraryContent()){
	        oTable.setBusy(oStatus === this._mProgressStatusEnum.Start);
	    }
	    if (this._fProgressHandler){
	        this._fProgressHandler(oStatus);
        }
        var oModel = this.getView().getModel();
        oModel.setProperty("/modelData/bNotInProcess", oStatus !== this._mProgressStatusEnum.Start);
	},
	
	_onRepositoryChange : function(oEvent){
	    this._sendValidationStatus({
				isValid : false
		});
	    var oModel = this.getView().getModel();
	    oModel.setProperty("/root/items", []);
	    oModel.setProperty("/modelData/ABAPSystemLoaded", false);
	    oModel.setProperty("/modelData/bShowNoData", false);
	    oModel.setProperty("/modelData/oABAPDestination", {});
	    oModel.setProperty("/modelData/VisibleRowCount", this._oContentType.library ? this._DEFAULT_ROW_VISIBLE_COUNT : 0);

	    var oSelectedItem = oEvent.getParameter("selectedItem");
	    if (oSelectedItem && oSelectedItem.getBindingContext()) {
			var oRepository = oSelectedItem.getModel().getProperty(oSelectedItem.getBindingContext().getPath());
			oModel.setProperty("/modelData/RepositoryType", oRepository.Key);
			switch (oRepository.Key) {
				case this._mRepositoryTypeEnum.SAPUI5 :
				    this._loadSAPUI5();
				    break;
				case this._mRepositoryTypeEnum.ABAP :
				    this._loadABAPSystems();
				    break;
			    case this._mRepositoryTypeEnum.HCP :
			        this._onHCPLogin();
			        break;
			    case this._mRepositoryTypeEnum.WORKSPACE :
			        this._loadWorkspaceLibs();
			        break;
			    case this._mRepositoryTypeEnum.NONE :
			        this.initDataBeforeOpen(this._oContentType);
			        break;
			}
	    }
	},
	
	_loadABAPSystems : function(){
	    var oModel = this.getView().getModel();
	    oModel.setProperty("/modelData/sDestinationValue", "");
	    oModel.setProperty("/modelData/bShowNoData", false);
	    var that = this;
	    this._sendProgressStatus(this._mProgressStatusEnum.Start);
		this._oContext.service.destination.getDestinations("dev_abap").then(function(foundDestinations) {
		    foundDestinations.unshift({description : ""});
			oModel.setProperty("/modelData/aABAPSystems", foundDestinations);
            oModel.setProperty("/modelData/ABAPSystemLoaded", true);
		}).fin(function() {
            that._sendProgressStatus(that._mProgressStatusEnum.End);
		}).done();
	},
	
	_onABAPSystemChange : function(oEvent){
	    var that = this;
	    that._sendValidationStatus({ isValid : false});
        var oModel = this.getView().getModel();
	    oModel.setProperty("/root/items", []);
        oModel.setProperty("/modelData/VisibleRowCount", this._oContentType.library ? this._DEFAULT_ROW_VISIBLE_COUNT : 0);
        
	    var oSelectedItem = oEvent.getParameter("selectedItem");
	    if (oSelectedItem && oSelectedItem.getBindingContext()) {
	        var oDestination = oSelectedItem.getModel().getProperty(oSelectedItem.getBindingContext().getPath());
	        oModel.setProperty("/modelData/oABAPDestination", oDestination);
	        if (oDestination.description !== ""){
	            this._sendProgressStatus(this._mProgressStatusEnum.Start);
    	        this._oContext.service.libraryDiscovery.getLibrariesFromABAP(oDestination).then(function(aResLibraries){
    	            that._updateModelWithRepositoryResults(aResLibraries,  that._mRepositoryTypeEnum.ABAP);
    	        }).fail(function(error) {
    	            that._error(error.message);
    			}).fin(function() {
    	            that._sendProgressStatus(that._mProgressStatusEnum.End);
    			}).done();
	        }
	    }
	},
	
	onCancelPushed : function(){
	    this.initDataBeforeOpen(this._oContentType);
	},
	
	_onHCPLogin : function(){
	    var that = this;
	    this._sendProgressStatus(this._mProgressStatusEnum.Start);
	    this._oContext.service.libraryDiscovery.getLibrariesFromHCP().then(function(aResLibraries){
	        that._updateModelWithRepositoryResults(aResLibraries, that._mRepositoryTypeEnum.HCP);
	    }).fail(function(error){
	    	 if (error.message !== "Authentication_Cancel"){
	    		that._error(error.message);
	    	 }
		}).fin(function() {
            that._sendProgressStatus(that._mProgressStatusEnum.End);
		}).done();
	},
	
	_error : function (sMessage){
	    var message;
		if (sMessage === "Unauthorized") {
			message = this._oContext.i18n.getText("i18n", "SystemSelection_WrongCredentials");
		} 
		else {
			message = this._oContext.i18n.getText("i18n", "SystemSelection_DiscoveryError");
		}
        this._sendValidationStatus({
			isValid : false,
			message : message
		});
	},
	
	_loadSAPUI5 : function(){
	    this._sendProgressStatus(this._mProgressStatusEnum.Start);
	    var that = this;
	    this._oContext.service.libraryDiscovery.getLibrariesFromSAPUI5().then(function(aResLibraries){
	        that._updateModelWithRepositoryResults(aResLibraries, that._mRepositoryTypeEnum.SAPUI5);
	    }).fin(function() {
            that._sendProgressStatus(that._mProgressStatusEnum.End);
		}).done();
	},
	
	_loadWorkspaceLibs : function(){

	    this._sendProgressStatus(this._mProgressStatusEnum.Start);
	    var that = this;
	    this._oContext.service.libraryDiscovery.getLibrariesFromWorkspace().then(function(aResLibraries){
	        that._updateModelWithRepositoryResults(aResLibraries, that._mRepositoryTypeEnum.WORKSPACE);
	    }).fin(function() {
            that._sendProgressStatus(that._mProgressStatusEnum.End);
		}).done();
	},
	
	_updateModelWithRepositoryResults : function(aResLibraries, eRepositoryType){
	    var oModel = this.getView().getModel();
        for (var i = 0; i < aResLibraries.length; i++) {
			var oLib = aResLibraries[i];
			if ( oLib.versions){
		        oLib.libraryVersions = this._buildLibraryVersions(oLib);
			}
			oLib.selected = false;
			oLib.selectable = this._oContentType.library;
			if (eRepositoryType === this._mRepositoryTypeEnum.SAPUI5){
			    oLib.documentationUrl = this._getDocumentationURL(oLib.name);
			}
			oLib.checked = true;
			if (oLib.controls && oLib.controls.length > 0){
				for (var j = 0; j < oLib.controls.length; j++) {
					var oControl = oLib.controls[j];
					oControl.selected = false;
					if (eRepositoryType === this._mRepositoryTypeEnum.SAPUI5){
					    oControl.documentationUrl = this._getDocumentationURL(oControl.name);
					}
					oControl.selectable = this._oContentType.control;
					oControl.checked = true;
				}
			}
		}

		oModel.setProperty("/root/items", aResLibraries);
		var iDataCount  = this._calcDataRowsCount(aResLibraries);
		oModel.setProperty("/modelData/VisibleRowCount", iDataCount > this._DEFAULT_ROW_VISIBLE_COUNT || this._oContentType.library ? this._DEFAULT_ROW_VISIBLE_COUNT : iDataCount);
		oModel.setProperty("/modelData/bShowNoData", iDataCount < 1 ); 
		
		if (iDataCount !==0){
		    var oTable = sap.ui.getCore().byId("oLibDiscoveryDataTable");
		    if (oTable){
		        if (this._showLibraryContent()){
		            oTable.collapse(0);
		        }
		        else{
		            oTable.expand(0);
		        }
		    }  
		}

		this._sendValidationStatus({ isValid : false});
	},
	
	_calcDataRowsCount : function(items){
	    var iLength = items.length;
	    for (var i = 0; i < items.length; i++) {
	        iLength += items[i].controls.length;
	    }
	    return iLength;
	},
	
	
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf view.LibraryDiscoveryView
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf view.LibraryDiscoveryView
	 */
	onAfterRendering: function() {
    	var oLibraryDiscoveryRepository = sap.ui.getCore().byId("libraryDiscoveryRepositoryDropdownBox");
    	if (oLibraryDiscoveryRepository){
    		oLibraryDiscoveryRepository.focus();
    	}
	}

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf view.LibraryDiscoveryView
	 */
	//	onExit: function() {
	//
	//	}

});