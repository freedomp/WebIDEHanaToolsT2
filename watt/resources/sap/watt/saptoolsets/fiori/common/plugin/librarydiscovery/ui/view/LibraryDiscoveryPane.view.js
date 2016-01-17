sap.ui.jsview("sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery.ui.view.LibraryDiscoveryPane", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery.ui.view.LibraryDiscoveryPane
	 */
	getControllerName: function() {
		return "sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery.ui.view.LibraryDiscoveryPane";
	},


	 
	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * @memberOf view.LibraryDiscoveryView
	 */
	createContent: function(oController) {
	    this._i18n = this.getViewData().i18n;
        var that = this;
        
        var oListVersionsItems = new sap.ui.core.ListItem({ text : "{name}"
        });
        
		//Create an instance of the table control
		var oTable = new sap.ui.table.TreeTable({
		    id: "oLibDiscoveryDataTable",
			columns: [
		        new sap.ui.table.Column({
			      label: "",
			      width: "5%",
			      
			      template: new sap.ui.commons.CheckBox({
			          checked : "{selected}",
			          visible : "{selectable}",
			           change : [oController.handleCheckBoxChange, oController]
			      })
		        }),
		        
		        new sap.ui.table.Column({
			       label: "{i18n>LibraryDiscovery_treeTable_name_column}",
			       width: "50%",
			       visible : {
    			        path : "RepositoryType",
            	        formatter: function(iRepositoryType) {
            			    return iRepositoryType  !== oController._mRepositoryTypeEnum.SAPUI5 ;
            			}
    			          
			       },
			       template: "name"
		        }),
		        
            	new sap.ui.table.Column({
			       label: "{i18n>LibraryDiscovery_treeTable_name_column}",
			       width: "50%",
			       template: new sap.ui.commons.Link({
			           press: [oController.showDocumentation, oController],
			           text : "{name}"
			       }),
			       visible : {
    			        path : "RepositoryType",
            	        formatter: function(iRepositoryType) {
            			    return iRepositoryType  === oController._mRepositoryTypeEnum.SAPUI5 ;
            			}
    			          
    			      }
		        }),
		        
		        
		        new sap.ui.table.Column({
			      label: "{i18n>LibraryDiscovery_treeTable_version_column}",
			       width: "10%",
			        visible : {
			        path : "RepositoryType",
        	        formatter: function(iRepositoryType) {
        	            var contentType = oController.getContentType();
        			    return ( contentType.library === false && contentType.control === true ) || iRepositoryType  !== oController._mRepositoryTypeEnum.HCP ;
        			}
			      },
			       template: "version"
		        }),
		       
		       
              new sap.ui.table.Column({
                    label: "{i18n>LibraryDiscovery_treeTable_version_column}",
                    width: "10%",
                     
                    visible : {
                        path : "RepositoryType",
                        formatter: function(RepositoryType) {
                            var contentType = oController.getContentType();
                    	    return    contentType.library === true && contentType.control === false && RepositoryType  === oController._mRepositoryTypeEnum.HCP;
                    	}
                    },
                    template:  new sap.ui.commons.DropdownBox({
                        value : "{version}",
                        enabled : "{selected}",
                        visible : {
                            path : "selectable",
                            formatter: function(iSelectable) {
                                return iSelectable;
                            }
                        },
                        items :  oListVersionsItems,
                        change: [oController._onVersionChange, oController]
                    }).bindItems("libraryVersions",oListVersionsItems)
                }),


		        new sap.ui.table.Column({
			      label: "{i18n>LibraryDiscovery_treeTable_account_column}",
			      width: "10%",
			      visible : {
			        path : "RepositoryType",
        	        formatter: function(iRepositoryType) {
        			    return iRepositoryType  === oController._mRepositoryTypeEnum.HCP ;
        			}
			          
			      },
			      template: "account"
		        }),
		        
                new sap.ui.table.Column({
			      label: "{i18n>LibraryDiscovery_treeTable_description_column}",
			      width: "15%",
			      template: "description"
		        })
	        ],
	        width : "100%",
	        
			selectionMode: sap.ui.table.SelectionMode.Single,
			enableColumnReordering: true,
			showNoData : "{bShowNoData}",
			visibleRowCount : "{VisibleRowCount}",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		});
		
	    oController._oTreeLibraryTable = oTable;
	    
	    oTable.bindRows({ 
            path: '/root',
            parameters: {
                arrayNames: ["items","controls"]
          }
         });

		// DropdownBox for the repositories
		var repositoryDropdownBox = new sap.ui.commons.DropdownBox({
		    id: "libraryDiscoveryRepositoryDropdownBox",
		    placeholder : "{i18n>LibraryDiscovery_placeholder_repository}",
		    value :"{sRepositoryValue}",
			width : "100%",
			enabled : "{bNotInProcess}",
			change: [oController._onRepositoryChange, oController]
		});
		
		var oListItem = new sap.ui.core.ListItem({
		    text : {
		        path: "Name",
				formatter: function(sName) {
					return that._i18n.getText(sName);
				}
		   }
		});
		
		
		// Repository label
		var repositoryLabel = new sap.ui.commons.Label({
			required : true,
			labelFor: repositoryDropdownBox,
			text : "{i18n>LibraryDiscovery_repository}",
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S2"
			})
		}).addStyleClass("label");
		
		repositoryDropdownBox.bindItems("aRepositories", oListItem);
		
		var oABAPSystemDropdownBox = new sap.ui.commons.DropdownBox( this.createId("oABAPSystemDropdownBox"), {
		    placeholder : "{i18n>LibraryDiscovery_placeholder_ABAP_system}",
			width : "100%",
			value : "{sDestinationValue}",
			visible : "{ABAPSystemLoaded}",
			enabled : "{bNotInProcess}",
			change: [oController._onABAPSystemChange, oController]
		});
		
		var oABAPSystemTemplate = new sap.ui.core.ListItem({
		    text : "{description}"
		});
		
		oABAPSystemDropdownBox.bindItems("aABAPSystems", oABAPSystemTemplate);
		
		// ABAP System label
		var oSystemLabel = new sap.ui.commons.Label({
			required : true,
			labelFor: oABAPSystemDropdownBox,
			text : "{i18n>LibraryDiscovery_ABAP_system}",
			width : "100%",
			visible : "{ABAPSystemLoaded}",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S2"
			})
		}).addStyleClass("label");

		// systems Grid
		var oRepositoryContentGrid = new sap.ui.layout.Grid({ 
		    width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			content : [ repositoryLabel, repositoryDropdownBox, oSystemLabel, oABAPSystemDropdownBox ]
		});
		
		var oGrid = new sap.ui.layout.Grid({
			content : [oRepositoryContentGrid, oTable],
			width : "100%",
			vSpacing : 0,
			height: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		
		return oGrid;

	}

});