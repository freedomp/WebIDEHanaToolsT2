/*!
 * @copyright@
 */
jQuery.sap.require("sap.collaboration.components.utils.CommonUtil");jQuery.sap.require("sap.collaboration.components.utils.OdataUtil");sap.ui.controller("sap.collaboration.components.socialprofile.SocialProfile",{onInit:function(){this.getView().getViewData().collaborationHostServiceUrl?this._sJamODataServiceUrl=this.getView().getViewData().collaborationHostServiceUrl:this._sJamODataServiceUrl="/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData";this.getView().getViewData().smiServiceUrl?this._sSMIODataServiceUrl=this.getView().getViewData().smiServiceUrl:this._sSMIODataServiceUrl="/sap/opu/odata/sap/SM_INTEGRATION_V2_SRV";this._oODataUtil=new sap.collaboration.components.utils.OdataUtil();this._oCommonUtil=new sap.collaboration.components.utils.CommonUtil();this._sPrefixId=this.getView().getId();this._sJamURL="";this._sJamUserId="";this._sPopoverPrefix=this.getView().getViewData().popoverPrefix;this._fnUserInfoFetchedCallback=this.getView().getViewData().afterUserInfoRetrieved;this._initializeModels();},onBeforeRendering:function(){this._sJamURL=this._sJamURL||this._getJamURL();if(this._memberId!==this.getView().getViewData().memberId){this.getView().resetHeader();this._clearViewData();this._memberId=this.getView().getViewData().memberId;var m=this.getView().getViewData().memberInfo;if(jQuery.isEmptyObject(m)){this._getMember();}else{this._setMember(m);if(this._fnUserInfoFetchedCallback){var u=m;u.userProfileURL=this.getProfileURL(m.id);this._fnUserInfoFetchedCallback(u);}}}},getProfileURL:function(j){if(j){this._sJamUserId=j;}var u=this._sJamURL+"/profile/wall/"+this._sJamUserId;return u;},_initializeModels:function(){var a=true;this._oJamODataModel=new sap.ui.model.odata.ODataModel(this._sJamODataServiceUrl,a);this._oSMIODataModel=new sap.ui.model.odata.ODataModel(this._sSMIODataServiceUrl,a);this._oJSONModel=new sap.ui.model.json.JSONModel({});this.getView().setModel(this._oJSONModel);},_getJamURL:function(){var t=this;var a=true;var f=new jQuery.Deferred();f.done(function(j){t._sJamURL=j;});f.fail(function(e){jQuery.sap.log.error("SAP Jam request failed at sap.collaboration.components.socialprofile.SocialProfileController._getJamURL()");t._oCommonUtil.displayError();});this._oODataUtil.getJamUrl(this._oSMIODataModel,f,a);},_getMember:function(){var t=this;if(this._oSocialProfileRequest){this._oSocialProfileRequest.abort();}var p="Members_FindByEmail";var P={};P.urlParameters={"Email":"'"+t._memberId+"'","$expand":"MemberProfile/PhoneNumbers","$select":"Id,FullName,Title,Email,MemberProfile"};P.success=function(d,r){var m=d.results;if(!jQuery.isEmptyObject(m)){var a=m.MemberProfile.PhoneNumbers.results;var b=a.length;for(var i=0;i<b;i++){if(a[i]['PhoneNumberType']==='Work'){m.MemberProfile.WorkPhoneNumber=a[i]['PhoneNumber'];}if(a[i]['PhoneNumberType']==='Mobile'){m.MemberProfile.MobilePhoneNumber=a[i]['PhoneNumber'];}}t._oJSONModel.setData(m);t._sJamUserId=m.Id;var I=t._sJamODataServiceUrl+"/Members('"+t._sJamUserId+"')/ThumbnailImage/$value";sap.ui.getCore().byId(t._sPrefixId+"_HeaderUserImage").setSrc(I);if(t._fnUserInfoFetchedCallback){m.userProfileURL=t.getProfileURL();t._fnUserInfoFetchedCallback(m);}}};P.error=function(e){if(e.response&&e.response.statusCode){jQuery.sap.log.error("SAP Jam request failed at sap.collaboration.components.socialprofile.SocialProfileController._getMember()");t.getView().setHeaderNoUser();}};this._oSocialProfileRequest=this._oJamODataModel.read(p,P);},_setMember:function(m){var M={"UserImage":m.picture,"Id":m.id,"FullName":m.fullname,"Title":m.title,"Email":m.email,"MemberProfile":{"Address":m.address,"WorkPhoneNumber":m.workPhoneNumber,"MobilePhoneNumber":m.mobilePhoneNumber}};this._sJamUserId=m.id;this._oJSONModel.setData(M);},_clearViewData:function(){sap.ui.getCore().byId(this._sPrefixId+"_HeaderUserImage").setSrc();sap.ui.getCore().byId(this._sPrefixId+"_FullName").setText();sap.ui.getCore().byId(this._sPrefixId+"_Role").setText();sap.ui.getCore().byId(this._sPrefixId+"_MobileNumber").setText();sap.ui.getCore().byId(this._sPrefixId+"_WorkNumber").setText();sap.ui.getCore().byId(this._sPrefixId+"_Email").setText();sap.ui.getCore().byId(this._sPrefixId+"_CompanyAddress").setText();},});
