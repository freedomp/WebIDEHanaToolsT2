/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require('sap.apf.ui.utils.formatter');
jQuery.sap.declare("sap.apf.ui.representations.table");
/** 
 * @class tableRepresentation constructor.
 * @param oParameters defines parameters required for chart such as Dimension/Measures, tooltip, axis information.
 * @returns table object 
 */
/*global window, document*/
sap.apf.ui.representations.table = function(oApi, oParameters) {
	var self = this;
	this.parameter = oParameters;
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION;
	this.fields = oParameters.dimensions.concat(oParameters.measures);
	this.columns = {
		name : [],
		value : [],
		width : []
	};
	jQuery.sap.require({
		modName : "sap.ui.thirdparty.d3"
	});
	this.aDataResponse = [];
	this.alternateRepresentation = oParameters.defaultListConfigurationTypeID;
	this.filter = oApi.createFilter();
	var skip = 0;
	var top = 100;
	var sortProperty;
	var sortOrderIsDescending;
	var triggerBool = false;
	var eventsFired = 0;
	var skipAction = 0;
	var respData = [];
	this.printMode = false;
	this.oModel = new sap.ui.model.json.JSONModel();
	this.oModel.setSizeLimit(10000);
	this.isAlternateRepresentation = oParameters.isAlternateRepresentation;
	/**
	 * @method getParameter
	 * @description returns the constructor arguments which will be used to create toggle representation.
	 */
	this.getParameter = function() {
		return this.parameter;
	};
	/**
	 * @method setData
	 * @param aDataResponse  Response from oData service
	 * @param metadata Metadata of the oData service
	 * @description Public API which Fetches the data from oData service and updates the selection if present 
	 */
	this.setData = function(aDataResponse, metadata) {
		if (skipAction === 0) {
			if (triggerBool) {
				aDataResponse.map(function(obj) {
					self.aDataResponse.push(obj);
				});
				skipAction++;
			} else {
				skip = 0;
				//top = 100;
				self.aDataResponse = [];
				aDataResponse.map(function(obj) {
					self.aDataResponse.push(obj);
				});
			}
		}
		respData = aDataResponse; // To check whether record exists or not		
		this.metadata = metadata;
		triggerBool = false;
		this.formatter = new sap.apf.ui.utils.formatter({
			getEventCallback : oApi.getEventCallback.bind(oApi),
			getTextNotHtmlEncoded : oApi.getTextNotHtmlEncoded
		}, metadata, aDataResponse);
	};
	/**
	 * @method getAlternateRepresentation
	 * @description returns the alternate representation of current step (i.e. list representation for the charts)  
	 */
	this.getAlternateRepresentation = function() {
		return this.alternateRepresentation;
	};
	/**
	 * @description returns meta data for representation type
	 */
	this.getMetaData = function() {
		return this.metadata;
	};
	/**
	 * @description returns data for representation type
	 */
	this.getData = function() {
		return this.aDataResponse;
	};
	/**
	 * @method  getRequestOptions 
	 **/
	this.getRequestOptions = function() {
		if (!triggerBool) {
			top = 100;
			skip = 0;
			skipAction = 0;
		}
		var requestObj = {
			paging : {
				top : top,
				skip : skip,
				inlineCount : true
			}
		};
		var orderByArray;
		if (sortProperty !== undefined) {
			orderByArray = [ {
				property : sortProperty,
				descending : sortOrderIsDescending
			} ];
			requestObj.orderby = orderByArray;
		} else {
			if (this.getParameter().orderby && this.getParameter().orderby.length) {
				var aOrderbyProps = this.getParameter().orderby.map(function(oOrderby) {
					return {
						property : oOrderby.property,
						descending : !oOrderby.ascending
					};
				});
				requestObj.orderby = aOrderbyProps;
			}
		}
		return requestObj;
	};
	this.createDataset = function() {
		if (self.getData().length !== 0) {
			for( var i = 0; i < self.fields.length; i++) {
				self.columns.value[i] = self.fields[i].fieldName;
				var name = "";
				var sUnitValue = "";
				if (self.getMetaData() !== undefined && self.getMetaData().getPropertyMetadata(self.fields[i].fieldName).unit !== undefined) {
					var sUnitReference = self.getMetaData().getPropertyMetadata(self.fields[i].fieldName).unit;
					sUnitValue = self.getData()[0][sUnitReference];// take value of unit from first data set.
					name = self.fields[i].fieldDesc === undefined || !oApi.getTextNotHtmlEncoded(self.fields[i].fieldDesc).length ? self.getMetaData().getPropertyMetadata(self.fields[i].fieldName).label + " (" + sUnitValue + ")" : oApi
							.getTextNotHtmlEncoded(self.fields[i].fieldDesc)
							+ " (" + sUnitValue + ")";
					self.columns.name[i] = name;
				} else {
					self.columns.name[i] = this.fields[i].fieldDesc === undefined || !oApi.getTextNotHtmlEncoded(self.fields[i].fieldDesc).length ? self.getMetaData().getPropertyMetadata(self.fields[i].fieldName).label : oApi
							.getTextNotHtmlEncoded(self.fields[i].fieldDesc);
				}
				if (self.parameter.width !== undefined) {
					self.columns.width[i] = self.parameter.width[self.columns.value[i]];
				}
			}
		}
	};
	this.drawSelection = function(e) {
		var sRequiredFilterProperty = self.getFilter().getInternalFilter().getProperties()[0], aFilterTerms = self.getFilter().getInternalFilter().getFilterTermsForProperty(sRequiredFilterProperty), aFilterValues = aFilterTerms.map(function(term) {
			return term.getValue();
		}), aListItems = this.getItems(), aSelectedListItems = aListItems.filter(function(item) {
			var reqFilterValue = item.getBindingContext().getProperty(sRequiredFilterProperty);
			return aFilterValues.indexOf(reqFilterValue) !== -1;
		});
		aSelectedListItems.forEach(function(item) {
			item.addStyleClass('sapMLIBSelected');
		});
	};
	/**
	 * @method getMainContent
	 * @param oStepTitle title of the main chart
	 * @param width width of the main chart
	 * @param height height of the main chart
	 * @description draws Main chart into the Chart area
	 */
	this.getMainContent = function(oStepTitle, height, width) {
		self.createDataset();
		var oMessageObject;
		if (!oStepTitle) {
			oMessageObject = oApi.createMessageObject({
				code : "6002",
				aParameters : [ "title", oApi.getTextNotHtmlEncoded("step") ]
			});
			oApi.putMessage(oMessageObject);
		}
		if (this.fields.length === 0) {
			oMessageObject = oApi.createMessageObject({
				code : "6002",
				aParameters : [ "dimensions", oStepTitle ]
			});
			oApi.putMessage(oMessageObject);
		}
		if (!this.aDataResponse || this.aDataResponse.length === 0) {
			oMessageObject = oApi.createMessageObject({
				code : "6000",
				aParameters : [ oStepTitle ]
			});
			oApi.putMessage(oMessageObject);
		}
		//var id = sap.apf.ui.getStepContainer().vLayout.sId;
		var chartHeight = height || 600;// jQuery('#' + id + '').height();
		chartHeight = chartHeight + "px";
		var chartWidth = width || 1000;// jQuery('#' + id + '').width();
		chartWidth = chartWidth + "px";
		self.title = oStepTitle;
		var obj = self.aDataResponse;
		self.oModel.setData({
			tableData : obj
		});
		var columnCells = [];
		var i;
		var fnCellValue = function(index) {
			return function(columnValue) {
				if (self.metadata === undefined) {
					return columnValue;
				} else {
					var formatedColumnValue = self.formatter.getFormattedValue(self.columns.value[index], columnValue);
					if (formatedColumnValue !== undefined) {
						return formatedColumnValue;
					} else {
						return columnValue;
					}
				}
			};
		};
		for(i = 0; i < self.columns.name.length; i++) {
			self.cellValues = new sap.m.Text().bindText(self.columns.value[i], fnCellValue(i), sap.ui.model.BindingMode.OneWay);
			columnCells.push(self.cellValues);
		}
		//Setting column widths for table with headers and without headers
		var columnsWithHeaders = [];
		var columnsWithoutHeaders = [];
		var bWidthExists;
		var pixelScale;
		var columnWidth;
		for(i = 0; i < self.columns.name.length; i++) {
			bWidthExists = false;
			if (self.columns.width !== undefined && self.columns.width instanceof Array && self.columns.width.length !== 0) {
				bWidthExists = true;
			}
			pixelScale = d3.scale.linear().domain([ 0, 8 ]).range([ 0, 72 ]);
			columnWidth = bWidthExists ? self.columns.width[i] : (pixelScale(self.columns.name[i].length)) + "px";
			self.columnName = new sap.m.Column({
				width : columnWidth,
				header : new sap.m.Text({
					text : self.columns.name[i]
				})
			});
			columnsWithHeaders.push(self.columnName);
			self.columnName1 = new sap.m.Column({
				width : columnWidth
			});
			columnsWithoutHeaders.push(self.columnName1);
		}
		//Table with Headers
		var oTableWithHeaders = new sap.m.Table({
			headerText : self.title,
			showNoData : false,
			columns : columnsWithHeaders
		}).addStyleClass("tableWithHeaders");
		//Table without Headers (built to get scroll only on the data part)
		this.oTableWithoutHeaders = new sap.m.Table({
			columns : columnsWithoutHeaders,
			items : {
				path : "/tableData",
				template : new sap.m.ColumnListItem({
					cells : columnCells
				})
			}
		});
		oTableWithHeaders.setModel(self.oModel);
		this.oTableWithoutHeaders.setModel(self.oModel);
		this.oTableWithoutHeaders.attachUpdateFinished(this.drawSelection.bind(this.oTableWithoutHeaders));
		var handleConfirm = function(oEvent) {
			var param = oEvent.getParameters();
			self.oTableWithoutHeaders.setBusy(true);
			skipAction = 0;
			sortProperty = param.sortItem.getKey();
			sortOrderIsDescending = param.sortDescending;
			top = 100;
			skip = 0;
			var sorter = [];
			if (param.sortItem) {
				if (self.isAlternateRepresentation) {
					var oTableBinding = self.oTableWithoutHeaders.getBinding("items");
					sorter.push(new sap.ui.model.Sorter(sortProperty, sortOrderIsDescending));
					oTableBinding.sort(sorter);
					self.oTableWithoutHeaders.setBusy(false);
					return;
				}
				oApi.updatePath(function(oStep, bStepChanged) {
					if (oStep === oApi.getActiveStep()) {
						self.oModel.setData({
							tableData : self.aDataResponse
						});
						self.oTableWithoutHeaders.rerender();
						self.oTableWithoutHeaders.setBusy(false);
					}
				});
			}
		};
		//sort of table using ViewSettingsDialog
		this.viewSettingsDialog = new sap.m.ViewSettingsDialog({
			confirm : handleConfirm
		});
		for(i = 0; i < oTableWithHeaders.getColumns().length; i++) {
			var oItem = new sap.m.ViewSettingsItem({
				text : self.columns.name[i],
				key : self.columns.value[i]
			});
			this.viewSettingsDialog.addSortItem(oItem);
		}
		//Set default values of radio buttons in view settings dialog.If sortfield and sort order is coming from the configuration set those else
		//by default set the first value in sort field and sort order respectively
		if (sortProperty === undefined && sortOrderIsDescending === undefined) {
			if (this.getParameter().orderby && this.getParameter().orderby.length) {
				for(i = 0; i < this.viewSettingsDialog.getSortItems().length; i++) {
					if (this.getParameter().orderby[0].property === this.viewSettingsDialog.getSortItems()[i].getKey()) {
						this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[i]);
						this.viewSettingsDialog.setSortDescending(!this.getParameter().orderby[0].ascending);
					}
				}
			} else {
				this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[0]);
				this.viewSettingsDialog.setSortDescending(false);
			}
		} else {
			for(i = 0; i < this.viewSettingsDialog.getSortItems().length; i++) {
				if (sortProperty === this.viewSettingsDialog.getSortItems()[i].getKey()) {
					this.viewSettingsDialog.setSelectedSortItem(this.viewSettingsDialog.getSortItems()[i]);
				}
			}
			this.viewSettingsDialog.setSortDescending(sortOrderIsDescending);
			var sorter = [];
			if (this.isAlternateRepresentation) {
				var oTableBinding = self.oTableWithoutHeaders.getBinding("items");
				sorter.push(new sap.ui.model.Sorter(sortProperty, sortOrderIsDescending));
				oTableBinding.sort(sorter);
			}
		}
		//aligning amount fields
		if (self.metadata !== undefined) {
			for(i = 0; i < self.columns.name.length; i++) {
				var oMetadata = self.metadata.getPropertyMetadata(self.columns.value[i]);
				if (oMetadata.unit) {
					var amountCol = self.oTableWithoutHeaders.getColumns()[i];
					amountCol.setHAlign(sap.ui.core.TextAlign.Right);
				}
			}
		}
		//Scroll container for table without headers(to get vertical scroll on data part used for pagination)
		var scrollContainer = new sap.m.ScrollContainer({
			content : self.oTableWithoutHeaders,
			height : "480px",
			horizontal : false,
			vertical : true
		}).addStyleClass("tableWithoutHeaders");
		var loadMoreLink = new sap.m.Link({
			text : "More"
		}).addStyleClass("loadMoreLink");
		//Scroll container to hold table with headers and scroll container containing table without headers)
		var scrollContainer1 = new sap.m.ScrollContainer({
			content : [ oTableWithHeaders, scrollContainer ],
			width : chartWidth,
			horizontal : true,
			vertical : false
		}).addStyleClass("scrollContainer");
		self.oModel.setSizeLimit(10000); // Set the size of data response to 10000 records
		//Event delegate to bind pagination action
		oTableWithHeaders.addEventDelegate({
			onAfterRendering : function() {
				//For IE-Full width for alternate representation 
				jQuery(".scrollContainer > div:first-child").css({
					"display" : "table",
					"width" : "inherit"
				});
				var scrollContainerHeight;
				if (self.offsetTop === undefined) {
					self.offsetTop = jQuery(".tableWithoutHeaders").offset().top;
				}
				if (jQuery(".tableWithoutHeaders").offset().top !== self.offsetTop) {
					//fullscreen
					scrollContainerHeight = ((window.innerHeight - jQuery('.tableWithoutHeaders').offset().top)) + "px";
				} else {
					scrollContainerHeight = ((window.innerHeight - jQuery('.tableWithoutHeaders').offset().top) - (jQuery(".applicationFooter").height()) - 20) + "px";
				}
				document.querySelector('.tableWithoutHeaders').style.cssText += "height : " + scrollContainerHeight;
				var dLoadMoreLink = sap.ui.getCore().getRenderManager().getHTML(loadMoreLink);
				//TODO for height issue on orientation change
				sap.ui.Device.orientation.attachHandler(function() {
					scrollContainer1.rerender();
				});
				var oActiveStep = oApi.getActiveStep();
				//Check if alternate representation else don't paginate
				if (oActiveStep.getSelectedRepresentation().bIsAlternateView === undefined || oActiveStep.getSelectedRepresentation().bIsAlternateView === false) {
					if (sap.ui.Device.browser.mobile) {
						//Add More Button for Mobile Device for Pagination
						if (respData.length > 0) {
							jQuery(jQuery(".tableWithoutHeaders > div:first-child")).append(dLoadMoreLink);
						}
						loadMoreLink.attachPress(function() {
							if (!jQuery(".openToggleImage").length && (respData.length > 0)) {
								if (eventsFired === 0) {
									triggerPagination();
									skipAction = 0;
									eventsFired++;
									jQuery(".loadMoreLink").remove();
									jQuery(jQuery(".tableWithoutHeaders > div:first-child")).append(dLoadMoreLink);
								}
							} else {
								jQuery(".loadMoreLink").remove();
							}
						});
					} else {
						//Mouse scroll, Mouse Down and Mouse Up Events for Desktop				
						jQuery('.tableWithoutHeaders').on("scroll", function() {
							var self = jQuery(this);
							var scrollTop = self.prop("scrollTop");
							var scrollHeight = self.prop("scrollHeight");
							var offsetHeight = self.prop("offsetHeight");
							var contentHeight = scrollHeight - offsetHeight - 5;
							if ((contentHeight <= scrollTop) && !jQuery(".openToggleImage").length && (respData.length > 0)) {
								if (eventsFired === 0) {
									triggerPagination();
									skipAction = 0;
									eventsFired++;
								}
							}
						});
					}
				}
				var triggerPagination = function() {
					self.oTableWithoutHeaders.setBusy(true);
					sap.ui.getCore().applyChanges();
					var oData = self.oModel.getData();
					skip += obj.length;
					top = 10;
					triggerBool = true;
					oApi.updatePath(function(oStep, bStepChanged) {
						if (oStep === oApi.getActiveStep()) {
							self.oModel.setData(oData);
							self.oTableWithoutHeaders.rerender();
							self.oTableWithoutHeaders.setBusy(false);
							eventsFired = 0;
						}
					});
				};
			}
		});
		return new sap.ui.layout.VerticalLayout({
			content : [ scrollContainer1 ]
		});
	};
	/**
	 *@method getThumbnailContent 
	 *@description draws Thumbnail for the current chart and returns to the calling object
	 *@returns thumbnail object for column
	 */
	this.getThumbnailContent = function() {
		if (this.aDataResponse !== undefined && this.aDataResponse.length !== 0) {
			var image = new sap.ui.core.Icon({
				src : "sap-icon://table-chart",
				size : "70px"
			}).addStyleClass('thumbnailTableImage');
			return image;
		} else {
			var noDataText = new sap.m.Text({
				text : oApi.getTextNotHtmlEncoded("noDataText")
			}).addStyleClass('noDataText');
			return new sap.ui.layout.VerticalLayout({
				content : noDataText
			});
		}
	};
	/**
	 * @method serialize 
	 * @description Getter for Serialized data for a representation
	 * @returns selectionObject
	 */
	this.serialize = function() {
		return {
			oFilter : this.getFilter().serialize()
		};
	};
	/**
	 * @method deserialize
	 * @param selectionObject from the serialized data
	 * @description deserialize data and sets the selection on representation
	 */
	this.deserialize = function(oSerializable) {
		var filter = oApi.createFilter();
		this.setFilter(filter.deserialize(oSerializable.oFilter));
	};
	/**
	 * @method getFilterMethodType
	 * @description This method helps in determining which method has to be used for the filter retrieval from a representation.
	 * @returns {sap.apf.constants.filterMethodTypes} The filter method type the representation supports
	 */
	this.getFilterMethodType = function() {
		return sap.apf.core.constants.filterMethodTypes.filter; // returns the filter method type the representation supports
	};
	/**
	 * @method getSelectionCount
	 * @description This method helps in determining the selection count of a representation
	 * @returns the selection count of the current representation.
	 */
	this.getSelectionCount = function() {
		var sRequiredFilterProperty = self.getFilter().getInternalFilter().getProperties()[0], aFilterTerms = self.getFilter().getInternalFilter().getFilterTermsForProperty(sRequiredFilterProperty);
		return aFilterTerms.length;
	};
	/**
	 * @method getFilter
	 * @description gets the current filter from the representation.
	 */
	this.getFilter = function() {
		return this.filter;
	};
	/**
	 * @method setFilter
	 * @param {sap.apf.utils.Filter} oFilter
	 * @description sets the initial filter to the representation. The filter holds the values of the start filter of the path.
	 */
	this.setFilter = function(oFilter) {
		this.filter = oFilter;
	};
	/**
	 * @method adoptSelection
	 * @param {object} oSourceRepresentation Source representation implementing the representationInterface.
	 * @description Called on representation by binding when a representation type is set.
	 */
	this.adoptSelection = function(oSourceRepresentation) {
		if (oSourceRepresentation && oSourceRepresentation.getFilter) {
			this.setFilter(oSourceRepresentation.getFilter());
		}
	};
	/**
	 * @method removeAllSelection
	 * @description removes all Selection from Chart
	 */
	this.removeAllSelection = function() {
		this.setFilter(oApi.createFilter());
		oApi.selectionChanged();
		self.oTableWithoutHeaders.getItems().forEach(function(item) {
			item.removeStyleClass('sapMLIBSelected');
		});
	};
	/**
	 * @method getPrintContent
	 * @param oStepTitle title of the step
	 * @description gets the printable content of the representation
	 */
	this.getPrintContent = function(oStepTitle) {
		this.createDataset();
		var obj = this.aDataResponse;
		this.oModel.setData({
			tableData : obj
		});
		var i;
		var columns = [];
		for(i = 0; i < self.columns.name.length; i++) {
			self.columnName = new sap.m.Column({
				width : "75px",
				header : new sap.m.Label({
					text : self.columns.name[i]
				})
			});
			columns.push(self.columnName);
		}
		var columnCells = [];
		var fnColumnValue = function(index) {
			return function(columnValue) {
				if (self.metadata === undefined) {
					return columnValue;
				} else {
					var oMetadata = self.metadata.getPropertyMetadata(self.columns.value[index]);
					if (oMetadata.dataType.type === "Edm.DateTime") {
						if (columnValue === null) {
							return "-";
						}
						var dateFormat = new Date(parseInt(columnValue.slice(6, columnValue.length - 2), 10));
						dateFormat = dateFormat.toLocaleDateString();
						if (dateFormat === "Invalid Date") {
							return "-";
						}
						return dateFormat;
					}
					if (oMetadata.unit) {
						if (columnValue === null) {
							return "-";
						}
						var currencyMetadata = self.metadata.getPropertyMetadata(oMetadata.unit);
						if (currencyMetadata.semantics === "currency-code") {
							var precision = self.aDataResponse[0][oMetadata.scale];
							columnValue = parseFloat(columnValue, 10).toFixed(precision).toString();
							var store = columnValue.split(".");
							var amountValue = parseFloat(store[0]).toLocaleString();
							var sample = 0.1;
							sample = sample.toLocaleString();
							if (amountValue.split(sample.substring(1, 2)).length > 1) {
								amountValue = amountValue.split(sample.substring(1, 2))[0];
							}
							amountValue = amountValue.concat(sample.substring(1, 2), store[1]);
							return amountValue;
						}
					} else {
						return columnValue;
					}
				}
			};
		};
		for(i = 0; i < self.columns.name.length; i++) {
			self.cellValues = new sap.m.Text().bindText(self.columns.value[i], fnColumnValue(i), sap.ui.model.BindingMode.OneWay);
			columnCells.push(self.cellValues);
		}
		var oTable = new sap.m.Table({
			headerText : oStepTitle,
			headerDesign : sap.m.ListHeaderDesign.Standard,
			columns : columns,
			items : {
				path : "/tableData",
				template : new sap.m.ColumnListItem({
					cells : columnCells
				})
			}
		}).addStyleClass("printTable");
		//aligning amount fields
		if (self.metadata !== undefined) {
			for(i = 0; i < self.columns.name.length; i++) {
				var oMetadata = self.metadata.getPropertyMetadata(self.columns.value[i]);
				if (oMetadata.unit) {
					var amountCol = oTable.getColumns()[i];
					amountCol.setHAlign(sap.ui.core.TextAlign.Right);
				}
			}
		}
		oTable.setModel(self.oModel);
		oTable.attachUpdateFinished(this.drawSelection.bind(oTable));
		return new sap.ui.layout.VerticalLayout({
			content : [ oTable ]
		});
	};
};
