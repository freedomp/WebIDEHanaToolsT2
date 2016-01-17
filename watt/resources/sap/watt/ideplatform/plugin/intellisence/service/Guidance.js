define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"
], function ( AbstractPart) {	
	"use strict";
	
	return AbstractPart.extend("sap.watt.common.plugin.intellisence.service.Guidance", {	
		_oUIType : {
			help : 0,
			translate : 1
		},
		UIType:0,
		_sTranslationTitle:"Translations",
		_sAPITitle:"API Reference",
		_sAPIMoreInfo:"See full API documentation",
		_sHint:"To display context-aware API reference support in this pane, press Ctrl + space in code editor.",
		
		configure: function (mConfig) {		
			this._aStyles = mConfig.styles;
			this._bStyleLoaded=false;			
		},
		
		getContent : function() {		
			if (this._aStyles && !this._bStyleLoaded) {
				var that = this;
				this.context.service.resource.includeStyles(this._aStyles).done();
				this._bStyleLoaded=true;
			} 			
			if(this.oUIShell == null){	
				this._createUI();
			}			
			this.bVisible = true;
			var oDeferred = Q.defer();
			oDeferred.resolve(this.oUIShell);
			return oDeferred.promise;		
		},
		
		setVisible: function(bVisible) {
			// call super implementation of setVisible
			var that = this;
			return AbstractPart.prototype.setVisible.apply(this, arguments).then(function(){
				return that._initGuidance(bVisible);
			});
		},				
		
		onHelpTipShown: function (oEvent) {					
			var bRefresh;			
			if (oEvent){
				this.iApiIndex = oEvent.params.index;
				this.aProposals = oEvent.params.proposals;
				this.sHelpWebsite = oEvent.params.website;				
				bRefresh = oEvent.params.refresh;
			} else {
				return;
			}							
			if (this.bVisible) {
				this._initHelpTipUI(bRefresh);
			}
			
			this.UIType=this._oUIType.help;
			
		},
		
		clearGuidance : function(){
			if (this.oUIContainer && this.oUIContainer.getDomRef() && this.oUIContainer.getDomRef().offsetWidth>0){
				this.oUIContainer.removeAllContent();
			}							
		},
		
		onTermTranslated: function (oEvent) {					
			var sSearchText, aTerms,iIndex,bRefresh;
			if (oEvent){
				this.sSearchText = oEvent.params.text;
				this.aTerms = oEvent.params.terms;
				this.iTermIndex = oEvent.params.index;
				bRefresh = oEvent.params.refresh;
			} else {
				return;
			}	
			
			if (this.bVisible){				
				this._initTranslationUI(bRefresh);
			}
			
			this.UIType=this._oUIType.translate;
		},
		
		_initTranslationUI: function(bRefresh){
			if (this.oUIShell == null){			
				this._createUI();
			}	
			
			this.oRightPaneTitle.setText(this._sTranslationTitle);							
		
			if ((this.aTerms != null) && this.iTermIndex > -1) {
				if (!bRefresh) {
					this._updateTranslation(this.aTerms, this.iTermIndex);
				} else {				
					this._showTranslation(this.sSearchText, this.aTerms, this.iTermIndex);				
				}
			}
		},
		
		_initHelpTipUI: function(bRefresh){
			if(this.oUIShell == null){
				this._createUI();
			}		
			if (this.UIType!==this._oUIType.help) {
				this.oRightPaneTitle.setText(this._sAPITitle);			
			}
			//if (!(this.oUIContainer && this.oUIContainer.getDomRef() && this.oUIContainer.getDomRef().offsetWidth>0)){
				//return;
			//}
			var sTip = this.aProposals[this.iApiIndex].helpDescription;
			if ((sTip == undefined) || (sTip == null)) {				
				sTip="";
			}
			var sHelpTarget = this.aProposals[this.iApiIndex].helpTarget,
				sHelpTargetLink=sHelpTarget;
			if ((sHelpTarget == undefined) || (sHelpTarget === "") || (sHelpTarget == null)) {
				sHelpTarget = "sap.ui";
			}			
			var iPos=sHelpTarget.lastIndexOf(".");
			if (this.aProposals[this.iApiIndex].category==="function"){			
				sHelpTargetLink=sHelpTarget.substring(0,iPos)+'.html#'+sHelpTarget.substring(iPos+1);				
			} else {
				sHelpTargetLink +='.html';
			}			
			sHelpTarget=sHelpTarget.substring(0,iPos);				
			
			var regx = /{@link\s+(#[\w|.]+)\s+([\w|.]+)}/g;			
			var sNewTip = sTip.replace(regx, '<a href="' + this.sHelpWebsite + sHelpTargetLink + '$1" target="_new" >$2 </a>');
			
			
			regx = /{@link\s+([[\w|.|:]+]{0,1})([#[\w|.|:]+]{0,1})\s+([\w|.|:]+)}/g;
			sNewTip = sNewTip.replace(regx, '<a href="' + this.sHelpWebsite + '$1.html$2" target="_new" >$3 </a>');
			
			regx = /{@link\s+([\w|.|:]+)}/g;
			sNewTip = sNewTip.replace(regx, '<a href="' + this.sHelpWebsite + '$1.html" target="_new" >$1 </a>');
						
			regx = /\r\n\r\n|\n\n/g;
			sNewTip = sNewTip.replace(regx, '\r\r');
			
			regx = /\r\n|\n/g;
			sNewTip = sNewTip.replace(regx, ' ');			
			
			sNewTip = sNewTip.replace(/{/g, '&#123').replace(/}/g, '&#125');			
			
			var sDes=this.aProposals[this.iApiIndex].description,
				sCategoryDesc = this.aProposals[this.iApiIndex].categoryDesc;
			
			if (sDes) {
				sDes=sDes.replace(/{/g, '&#123').replace(/}/g, '&#125');			
			}
			
			if (sCategoryDesc) {
				sDes = sDes+' ('+sCategoryDesc +')';
			}
			
			
			//jQuery.sap.encodeHTML(sTip)
			var html="";
			html += '<div class="intellisence_apiheader">' + sDes + '</div>';
			html += '<div class="intellisence_apibody">' + sNewTip;
			html += "<br><br>";	
			
			if (this.aProposals[this.iApiIndex].helpUrl){
				html += '<a href="' + this.aProposals[this.iApiIndex].helpUrl + '"' + 'class="intellisence_apilink" target="_new">' +this.context.i18n.getText("i18n", "pane_api_moreinfo") + '</a>';
				html += "<br><br>";
			}
			
			html += "</div>";
	    
			if (!bRefresh){
				this._updateHelpTip(html);
			} else {				
				this._showHelpTip(sHelpTarget,html,this.iApiIndex);
			}
		},
		
		_createUI : function(){			
		
			this._sAPITitle=this.context.i18n.getText("i18n", "pane_api_title");
			this._sTranslationTitle=this.context.i18n.getText("i18n", "pane_translation_title");
			this._sAPIMoreInfo=this.context.i18n.getText("i18n", "pane_api_moreinfo");
			this._sHint = this.context.i18n.getText("i18n", "pane_api_hint");	
			
			this.oUIShell = new sap.ui.commons.layout.VerticalLayout({width : "100%"});
			this.oUIShell.addStyleClass("intellisence_panel");			
			
			//Title			
			var oTitlePanel = new sap.ui.commons.layout.HorizontalLayout({width : "100%"});
			oTitlePanel.addStyleClass("intellisence_title");				
			this.oRightPaneTitle = new sap.ui.commons.Label();				
			this.oRightPaneTitle.setText(this._sAPITitle);			
			oTitlePanel.addContent(this.oRightPaneTitle);
			this.oUIShell.addContent(oTitlePanel);

			//divider
			var oDivider = new sap.ui.commons.HorizontalDivider();
			oDivider.addStyleClass("intellisence_item_divider");
			this.oUIShell.addContent(oDivider,{left: "0px", top: "0px"});
			
			//Topic
			this.oUIContainer = new sap.ui.commons.layout.VerticalLayout({width : "100%"});
			this.oUIShell.addContent(this.oUIContainer);
			var oHint = new sap.ui.core.HTML({
							content : '<div class="intellisence_api_hint">' + jQuery.sap.encodeHTML(this._sHint) + '</div>',
							preferDOM : false,
							width:"100%"							
						});	
			this.oUIContainer.addContent(oHint);
					
			this.oUIShell.attachBrowserEvent("contextmenu", function (event) {
				event.preventDefault();	
			}, 	this);			

		},
		
		_updateHelpTip: function(sActive){
			var oPanel,oItemContainer,oPreItem, oCurItem;
			
			if (this.oUIContainer) {
				oPanel=this.oUIContainer.getContent()[2];
			} else {
				return;
			}			
			
			if (oPanel) {
				oItemContainer=oPanel.getContent()[0];
			} else {
				return;
			}
			
			
			if (this.preSelectedIndex>-1) {
				oPreItem=oItemContainer.getContent()[this.preSelectedIndex*2];
				var des=this.aProposals[this.preSelectedIndex].description;
				if (this.aProposals[this.preSelectedIndex].categoryDesc) {
					des = des+' ('+this.aProposals[this.preSelectedIndex].categoryDesc +')';
				}
				oPreItem.setContent('<div class="intellisence_api_deactive">'+des+'</div>');
			}

			if (this.iApiIndex>-1) {
				oCurItem=oItemContainer.getContent()[this.iApiIndex*2];
				oCurItem.setContent('<div class="intellisence_api_active">'+sActive+'</div>');
				this.preSelectedIndex=this.iApiIndex;
			}
			
			setTimeout(function(){
				var oElement=oCurItem.getDomRef();				
				var oPane=oPanel.getDomRef();
				if (oPane && oPane.childNodes.length>1){
					oPane=oPane.childNodes[1];
				}
				if (oElement && oPane && (oPane.scrollTop!==undefined)){
					if (oElement.offsetTop < oPane.scrollTop) {
						oElement.scrollIntoView(true);
					} else if ((oElement.offsetTop + oElement.offsetHeight) > (oPane.scrollTop + oPane.clientHeight)) {
						oElement.scrollIntoView(false);
					}					
				}
			},0);			
		},
		
		_showHelpTip : function(sParent,sActive,index,sFilter){
		
			var oParent,oActive,oItem,oDivider,aDeactive;						
			oParent = new sap.ui.commons.Label();
			oParent.setText(sParent);
			oParent.addStyleClass("intellisence_topic");			
			
			this.oUIContainer.removeAllContent();
			oDivider = new sap.ui.commons.HorizontalDivider();
			oDivider.addStyleClass("intellisence_item_divider");
			this.oUIContainer.addContent(oParent);
			this.oUIContainer.addContent(oDivider);			
			var that=this;				
				
			var oPanel;	
			if (that.oUIShell.getDomRef() && that.oUIShell.getDomRef().parentNode) {
				oPanel = new sap.ui.commons.Panel({height: that.oUIShell.getDomRef().parentNode.clientHeight-80+'px',
													showCollapseIcon:false,
													borderDesign : sap.ui.commons.enums.BorderDesign.None});
			} else {
				oPanel = new sap.ui.commons.Panel({	showCollapseIcon:false,
													borderDesign : sap.ui.commons.enums.BorderDesign.None});
			}
			
			oPanel.addStyleClass("intellisence_api_panel");
			
			var oItemContainer=new sap.ui.commons.layout.VerticalLayout({width : "100%"});						
			
			for (var i = 0; i < this.aProposals.length; i++) {
			
				if (!this.aProposals[i].unselectable){

				if ((sFilter!=undefined) &&(sFilter.trim()!="")) {
						if (this.aProposals[i].description.indexOf(sFilter.trim())<0) {
							continue;
						}
					}
					
					if (i==index) {
						oActive = new sap.ui.core.HTML({
							content : '<div class="intellisence_api_active">'+ sActive + '</div>',
							preferDOM : false,
							width:"100%"
							
						});						
						
						oDivider = new sap.ui.commons.HorizontalDivider();
						oDivider.addStyleClass("intellisence_item_divider");
						oItemContainer.addContent(oActive);
						oItemContainer.addContent(oDivider);
						this.preSelectedIndex=index;
					} else {					     			
						var des = (this.aProposals[i].description==undefined) ? "" : this.aProposals[i].description;
						
						if (this.aProposals[i].categoryDesc) {
							des = des+' ('+this.aProposals[i].categoryDesc +')';
						}
						
						oItem = new sap.ui.core.HTML({
							content : '<div class="intellisence_api_deactive">'+des.replace(/{/g, '&#123').replace(/}/g, '&#125')+'</div>',
							preferDOM : false
						});
				
						oDivider = new sap.ui.commons.HorizontalDivider();
						oDivider.addStyleClass("intellisence_item_divider");						
						oItemContainer.addContent(oItem);
						oItemContainer.addContent(oDivider);
					}					
					
				} else {
						oItem = new sap.ui.core.HTML({
							content : '<div style="display:none;height:0px" />',
							preferDOM : false
						});
				
						oDivider = new sap.ui.core.HTML({
							content : '<div style="display:none;height:0px" />',
							preferDOM : false
						});						
						oItemContainer.addContent(oItem);
						oItemContainer.addContent(oDivider);					
				}
			}			
			oPanel.addContent(oItemContainer);
			this.oUIContainer.addContent(oPanel);
			
			setTimeout(function(){
				var oElement=oActive.getDomRef();				
				var oPane=oPanel.getDomRef();
				if (oPane && oPane.childNodes.length>1){
					oPane=oPane.childNodes[1];
				}
				if (oElement){
					if (oElement.offsetTop < oPane.scrollTop) {
						oElement.scrollIntoView(true);
					} else if ((oElement.offsetTop + oElement.offsetHeight) > (oPane.scrollTop + oPane.clientHeight)) {
						oElement.scrollIntoView(false);
					}					
				}
			},0);

		},		
		
		_initGuidance : function(bVisible){
			var oResult = undefined;
			if (bVisible) {
				this.bVisible=true;
				var that=this;
				this.context.service.intellisence.isShowPopup().then( function(visible) {
					if (visible) {
						that._initHelpTipUI(true);
					} else {
						oResult = that.context.service.translation.isShowPopup().then( function(visible) {
							if (visible) {
								that._initTranslationUI(true);
							}
						}).done();
					}
				}).done();				
			} else {
				this.bVisible=false;
				if (this.oUIContainer) {
					this.oRightPaneTitle.setText(this._sAPITitle);
					this.oUIContainer.removeAllContent();					
					var oHint = new sap.ui.core.HTML({
							content : '<div class="intellisence_api_hint">' + jQuery.sap.encodeHTML(this._sHint) + '</div>',
							preferDOM : false,
							width:"100%"							
						});	
					this.oUIContainer.addContent(oHint);
				}
			}
			return !!oResult ? oResult : Q();
		},		
		
		_showTranslation: function(sSearchText, aTerms,iIndex) {
			var oParent,oActive,oDeactive,oItem,oDivider,aDeactive;											
			oParent = new sap.ui.commons.Label();
			oParent.setText('Translation Term:"'+sSearchText+'"');
			oParent.addStyleClass("translation_topic");			
			
			this.oUIContainer.removeAllContent();
			oDivider = new sap.ui.commons.HorizontalDivider();
			oDivider.addStyleClass("intellisence_item_divider");
			this.oUIContainer.addContent(oParent);
			this.oUIContainer.addContent(oDivider);			

			var oPanel;	
			if (this.oUIShell.getDomRef() && this.oUIShell.getDomRef().parentNode) {
				oPanel = new sap.ui.commons.Panel({height: this.oUIShell.getDomRef().parentNode.clientHeight-80+'px',
													showCollapseIcon:false,
													borderDesign : sap.ui.commons.enums.BorderDesign.None});
			} else {
				oPanel = new sap.ui.commons.Panel({	showCollapseIcon:false,
													borderDesign : sap.ui.commons.enums.BorderDesign.None});
			}
			
			oPanel.addStyleClass("intellisence_api_panel");
			
			var oItemContainer=new sap.ui.commons.layout.VerticalLayout({width : "100%"});						
			
			for (var i = 0; i < aTerms.length; i++) {
			
					oItem = new sap.ui.commons.layout.VerticalLayout({width : "100%"});									
					
					if (i==iIndex) {							
						oActive = new sap.ui.core.HTML({
							content : '<div class="intellisence_translation_active">'+aTerms[i].value+'</div>',
							preferDOM : false,
							width:"100%"								
						});	
						this.preTermIndex=i;							
						oItem.addContent(oActive);	
					} else {									
						
						oDeactive = new sap.ui.core.HTML({
							content : '<div class="intellisence_translation_deactive">'+aTerms[i].value+'</div>',
							preferDOM : false
						});					
						oItem.addContent(oDeactive);	
					}
					
					
					if (aTerms[i].translations) {
						var oTranslationContainer=new sap.ui.commons.layout.VerticalLayout({width : "100%"});						
						oTranslationContainer.addStyleClass("translation_container");			
						var	oTranslationHeader = new sap.ui.commons.Label();
						oTranslationHeader.setText("Translations");
						oTranslationHeader.addStyleClass("translation_header");			
						oTranslationContainer.addContent(oTranslationHeader);							
						for (var j = 0; j < aTerms[i].translations.length; j++) {
							var lang = aTerms[i].translations[j].language;
							var value = aTerms[i].translations[j].value;
							var	oTranslationItem = new sap.ui.commons.Label();
							oTranslationItem.setText(lang+":"+value);
							oTranslationItem.addStyleClass("translation_item");			
							oTranslationContainer.addContent(oTranslationItem);	
						}
						oItem.addContent(oTranslationContainer);
					}
					oDivider = new sap.ui.commons.HorizontalDivider();
					oDivider.addStyleClass("intellisence_item_divider");						
					oItem.addContent(oDivider);
					oItemContainer.addContent(oItem);					
					
			}
			
			oPanel.addContent(oItemContainer);
			this.oUIContainer.addContent(oPanel);
			
			setTimeout(function(){
				var oElement=oActive.getDomRef();				
				var oPane=oPanel.getDomRef();
				if (oPane && oPane.childNodes.length>1){
					oPane=oPane.childNodes[1];
				}
				if (oElement){
					if (oElement.offsetTop < oPane.scrollTop) {
						oElement.scrollIntoView(true);
					} else if ((oElement.offsetTop + oElement.offsetHeight) > (oPane.scrollTop + oPane.clientHeight)) {
						oElement.scrollIntoView(false);
					}					
				}
			},0);
		},
		
		_updateTranslation: function(aTerms,iIndex) {
			var oPanel,oItemContainer,oPreItem, oCurItem;
			
			if (this.oUIContainer) {
				oPanel=this.oUIContainer.getContent()[2];
			} else {
				return;
			}
			
			if (oPanel) {
				oItemContainer=oPanel.getContent()[0];
			} else {
				return;
			}

			
			if (this.preTermIndex>-1) {
				oPreItem=oItemContainer.getContent()[this.preTermIndex];
				oPreItem.removeAllContent();
				
				var oDeactive = new sap.ui.core.HTML({
							content : '<div class="intellisence_translation_deactive">'+aTerms[this.preTermIndex].value+'</div>',
							preferDOM : false
						});				
				oPreItem.addContent(oDeactive);		
				
				var oDivider = new sap.ui.commons.HorizontalDivider();
				oDivider.addStyleClass("intellisence_item_divider");						
				oPreItem.addContent(oDivider);					
			}

			if (iIndex>-1) {
				oCurItem=oItemContainer.getContent()[iIndex];
				oCurItem.removeAllContent();
				
				var oActive = new sap.ui.core.HTML({
							content : '<div class="intellisence_translation_active">'+aTerms[iIndex].value+'</div>',
							preferDOM : false,
							width:"100%"								
						});	
						
				oCurItem.addContent(oActive);	
				
				if (aTerms[iIndex].translations) {
					var oTranslationContainer=new sap.ui.commons.layout.VerticalLayout({width : "100%"});						
					oTranslationContainer.addStyleClass("translation_container");			
					var	oTranslationHeader = new sap.ui.commons.Label();
					oTranslationHeader.setText("Translations");
					oTranslationHeader.addStyleClass("translation_header");			
					oTranslationContainer.addContent(oTranslationHeader);							
					for (var j = 0; j < aTerms[iIndex].translations.length; j++) {
						var lang = aTerms[iIndex].translations[j].language;
						var value = aTerms[iIndex].translations[j].value;
						var	oTranslationItem = new sap.ui.commons.Label();
						oTranslationItem.setText(lang+":"+value);
						oTranslationItem.addStyleClass("translation_item");			
						oTranslationContainer.addContent(oTranslationItem);	
					}
					oCurItem.addContent(oTranslationContainer);
				}	
				this.preTermIndex=iIndex;					
			}
			
			setTimeout(function(){
				var oElement=oCurItem.getDomRef();				
				var oPane=oPanel.getDomRef();
				if (oPane && oPane.childNodes.length>1){
					oPane=oPane.childNodes[1];
				}
				if (oElement){
					if (oElement.offsetTop < oPane.scrollTop) {
						oElement.scrollIntoView(true);
					} else if ((oElement.offsetTop + oElement.offsetHeight) > (oPane.scrollTop + oPane.clientHeight)) {
						oElement.scrollIntoView(false);
					}					
				}
			},0);			
		}
	});
});