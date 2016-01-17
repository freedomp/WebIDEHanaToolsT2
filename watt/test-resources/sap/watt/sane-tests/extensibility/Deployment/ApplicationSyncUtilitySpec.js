"use strict";
define(["sap/watt/core/q", "sap/watt/platform/plugin/utils/common/RemoteDocument"],
	function (coreQ, RemoteDocument) {

	describe('Unit tests for ApplicationSyncUtility class', function () {

		var oRequiredApplicationSyncUtility;

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/utils/ApplicationSyncUtility").then(function(ApplicationSyncUtility) {
				oRequiredApplicationSyncUtility = ApplicationSyncUtility;
			});
		});

		it("Sync files", function () {
		    var resourcesInfo = [
		        {"name":".Ui5RepositoryIgnore","path":"DANY1%2f.Ui5RepositoryIgnore","type":"file"},
    		    {"name":".classpath","path":"DANY1%2f.classpath","type":"file"},
    		    {"name":".lint","path":"DANY1%2f.lint","type":"folder"},
    		    {"name":".project","path":"DANY1%2f.project","type":"file"},
    		    {"name":".project.json","path":"DANY1%2f.project.json","type":"file"},
    		    {"name":".settings","path":"DANY1%2f.settings","type":"folder"},
    		    {"name":"Component.js","path":"DANY1%2fComponent.js","type":"file"},
    		    {"name":"control","path":"DANY1%2fcontrol","type":"folder"},
    		    {"name":"css","path":"DANY1%2fcss","type":"folder"},
    		    {"name":"i18n","path":"DANY1%2fi18n","type":"folder"},
    		    {"name":"icon","path":"DANY1%2ficon","type":"folder"},
    		    {"name":"localIndex.html","path":"DANY1%2flocalIndex.html","type":"file"},
    		    {"name":"model","path":"DANY1%2fmodel","type":"folder"},
    		    {"name":"neo-app.json","path":"DANY1%2fneo-app.json","type":"file"},
    		    {"name":"readme.txt","path":"DANY1%2freadme.txt","type":"file"},
    		    {"name":"shopRouter.js","path":"DANY1%2fshopRouter.js","type":"file"},
    		    {"name":"view","path":"DANY1%2fview","type":"folder"},
    		    {"name":".eslintrc","path":"DANY1%2f.lint%2f.eslintrc","type":"file"},
    		    {"name":"ddd.txt","path":"DANY1%2f.lint%2fddd.txt","type":"file"},
    		    {"name":"shopStyles.css","path":"DANY1%2fcss%2fshopStyles.css","type":"file"},
    		    {"name":"RatingAndCount.js","path":"DANY1%2fcontrol%2fRatingAndCount.js","type":"file"},
    		    {"name":"i18n.properties","path":"DANY1%2fi18n%2fi18n.properties","type":"file"},
    		    {"name":"Main.controller.js","path":"DANY1%2fview%2fMain.controller.js","type":"file"},
    		    {"name":"Main.view.xml","path":"DANY1%2fview%2fMain.view.xml","type":"file"},
    		    {"name":"S2_ProductList.view.xml","path":"DANY1%2fview%2fS2_ProductList.view.xml","type":"file"},
    		    {"name":"S3_ProductDetails.controller.js","path":"DANY1%2fview%2fS3_ProductDetails.controller.js","type":"file"},
    		    {"name":"S3_ProductDetails.view.xml","path":"DANY1%2fview%2fS3_ProductDetails.view.xml","type":"file"},
    		    {"name":"S4_ShoppingCart.controller.js","path":"DANY1%2fview%2fS4_ShoppingCart.controller.js","type":"file"},
    		    {"name":"S4_ShoppingCart.view.xml","path":"DANY1%2fview%2fS4_ShoppingCart.view.xml","type":"file"},
    		    {"name":"S5_CheckOut.view.xml","path":"DANY1%2fview%2fS5_CheckOut.view.xml","type":"file", "contentUrl": "someprefix/view/S5_CheckOut.view.xml", "localFullName": "DANY1/view/S5_CheckOut.view.xml"},
    		    //  Same file name as prev, in different path
    		    {"name":"S5_CheckOut.view.xml","path":"DANY1%2fview%2finnerView%2fS5_CheckOut.view.xml","type":"file", "contentUrl": "someprefix/view/innerView/S5_CheckOut.view.xml", "localFullName": "DANY1/view/innerView/S5_CheckOut.view.xml"},
    		    {"name":"fragment","path":"DANY1%2fview%2ffragment","type":"folder"},
    		    {"name":"subview","path":"DANY1%2fview%2fsubview","type":"folder"},
    		    {"name":".jsdtscope","path":"DANY1%2f.settings%2f.jsdtscope","type":"file"},
    		    {"name":"com.eclipsesource.jshint.ui.prefs","path":"DANY1%2f.settings%2fcom.eclipsesource.jshint.ui.prefs","type":"file"},
    		    {"name":"org.eclipse.core.runtime.prefs","path":"DANY1%2f.settings%2forg.eclipse.core.runtime.prefs","type":"file"},
    		    {"name":"org.eclipse.jdt.core.prefs","path":"DANY1%2f.settings%2forg.eclipse.jdt.core.prefs","type":"file"},
    		    {"name":"org.eclipse.jdt.ui.prefs","path":"DANY1%2f.settings%2forg.eclipse.jdt.ui.prefs","type":"file"},
    		    {"name":"org.eclipse.wst.common.component","path":"DANY1%2f.settings%2forg.eclipse.wst.common.component","type":"file"},
    		    {"name":"org.eclipse.wst.common.project.facet.core.xml","path":"DANY1%2f.settings%2forg.eclipse.wst.common.project.facet.core.xml","type":"file"},
    		    {"name":"org.eclipse.wst.jsdt.core.prefs","path":"DANY1%2f.settings%2forg.eclipse.wst.jsdt.core.prefs","type":"file"},
    		    {"name":"org.eclipse.wst.jsdt.ui.prefs","path":"DANY1%2f.settings%2forg.eclipse.wst.jsdt.ui.prefs","type":"file"},
    		    {"name":"org.eclipse.wst.jsdt.ui.superType.container","path":"DANY1%2f.settings%2forg.eclipse.wst.jsdt.ui.superType.container","type":"file"},
    		    {"name":"org.eclipse.wst.jsdt.ui.superType.name","path":"DANY1%2f.settings%2forg.eclipse.wst.jsdt.ui.superType.name","type":"file"},
    		    {"name":"Currency.json","path":"DANY1%2fmodel%2fCurrency.json","type":"file"},
    		    {"name":"DimensionUnit.json","path":"DANY1%2fmodel%2fDimensionUnit.json","type":"file"},
    		    {"name":"FacetFilter.json","path":"DANY1%2fmodel%2fFacetFilter.json","type":"file"},
    		    {"name":"FacetFilterValue.json","path":"DANY1%2fmodel%2fFacetFilterValue.json","type":"file"},
    		    {"name":"Product.json","path":"DANY1%2fmodel%2fProduct.json","type":"file"},
    		    {"name":"QuantityUnit.json","path":"DANY1%2fmodel%2fQuantityUnit.json","type":"file"},
    		    {"name":"Review.json","path":"DANY1%2fmodel%2fReview.json","type":"file"},
    		    {"name":"ReviewAggregate.json","path":"DANY1%2fmodel%2fReviewAggregate.json","type":"file"},
    		    {"name":"SalesOrder.json","path":"DANY1%2fmodel%2fSalesOrder.json","type":"file"},
    		    {"name":"SalesOrderItem.json","path":"DANY1%2fmodel%2fSalesOrderItem.json","type":"file"},
    		    {"name":"ShoppingCart.json","path":"DANY1%2fmodel%2fShoppingCart.json","type":"file"},
    		    {"name":"ShoppingCartItem.json","path":"DANY1%2fmodel%2fShoppingCartItem.json","type":"file"},
    		    {"name":"SubCategory.json","path":"DANY1%2fmodel%2fSubCategory.json","type":"file"},
    		    {"name":"Supplier.json","path":"DANY1%2fmodel%2fSupplier.json","type":"file"},
    		    {"name":"WeightUnit.json","path":"DANY1%2fmodel%2fWeightUnit.json","type":"file"},
    		    {"name":"metadata.xml","path":"DANY1%2fmodel%2fmetadata.xml","type":"file"},
    		    {"name":"mockRequests.js","path":"DANY1%2fmodel%2fmockRequests.js","type":"file"},
    		    {"name":"F0866_My_Shops.ico","path":"DANY1%2ficon%2fF0866_My_Shops.ico","type":"file"},
    		    {"name":"launchicon","path":"DANY1%2ficon%2flaunchicon","type":"folder"},
    		    {"name":"ProductDetailOverflow.fragment.xml","path":"DANY1%2fview%2ffragment%2fProductDetailOverflow.fragment.xml","type":"file"},
    		    {"name":"ProductGroupingDialog.fragment.xml","path":"DANY1%2fview%2ffragment%2fProductGroupingDialog.fragment.xml","type":"file"},
    		    {"name":"ProductImage.fragment.xml","path":"DANY1%2fview%2ffragment%2fProductImage.fragment.xml","type":"file"},
    		    {"name":"ProductListOverflow.fragment.xml","path":"DANY1%2fview%2ffragment%2fProductListOverflow.fragment.xml","type":"file"},
    		    {"name":"ProductSortDialog.fragment.xml","path":"DANY1%2fview%2ffragment%2fProductSortDialog.fragment.xml","type":"file"},
    		    {"name":"ReviewDialog.fragment.xml","path":"DANY1%2fview%2ffragment%2fReviewDialog.fragment.xml","type":"file"},
    		    {"name":"ReviewRating.fragment.xml","path":"DANY1%2fview%2ffragment%2fReviewRating.fragment.xml","type":"file"}
		    ];
		    
		    var appName = "DANY1";
		    var localAppName = "DANY1";
		    var remoteDocument;
		    var application = {};
		    application.remoteDocuments = [];
		    application.name = "Dany1";
		    application.localPath = "Dany1";
		    
		    var rDocuments = application.remoteDocuments;
		    
		    //copy some files from remote files to local files
		    for (var i = 4; i < 10; i++) {
		        var path = "/" + resourcesInfo[i].path.split("%2f").join("/"); // relpace delimiter
				path = path.split("/" + appName).join(localAppName); // replace remote App name to local App name

				var lastSeparatorIndex = path.lastIndexOf("/"); //full path is without the file / folder name 
				if (lastSeparatorIndex !== -1) {
					path = path.substring(0, lastSeparatorIndex);
				}
		        remoteDocument = new RemoteDocument(resourcesInfo[i].name, resourcesInfo[i].type, "XX", path);
		        rDocuments.push(remoteDocument);
		    }
		    // Copy the two files named S5_CheckOut.view.xml
		    remoteDocument = new RemoteDocument("S5_CheckOut.view.xml", "file", "XX", "DANY1/view");
		    rDocuments.push(remoteDocument);
		    remoteDocument = new RemoteDocument("S5_CheckOut.view.xml", "file", "XX", "DANY1/view/innerView");
		    rDocuments.push(remoteDocument);

		    //all the files that are not copied will be marked for deletion 
		    
		    //create one file
		    remoteDocument = new RemoteDocument("DODLY.txt", "file", "XX", "DANY1%2fDODLY.txt");
		    rDocuments.push(remoteDocument);
		    
		    var syncActions = oRequiredApplicationSyncUtility.sync(application,resourcesInfo);
		    
			expect(syncActions.length).to.equal(79);
			
			// Assert proper contentUrl property for files with the same name
			expect(syncActions[6].remoteDocument.getEntity().getFullPath()).to.equal("DANY1/view");
			expect(syncActions[6].remoteDocument.getEntity().getContentUrl()).to.equal("someprefix/view/S5_CheckOut.view.xml");
			expect(syncActions[7].remoteDocument.getEntity().getFullPath()).to.equal("DANY1/view/innerView");
			expect(syncActions[7].remoteDocument.getEntity().getContentUrl()).to.equal("someprefix/view/innerView/S5_CheckOut.view.xml");
		});

		it("Compare equal remote and local resource", function () {
			var sRemoteDocumentName = "file1.js";
			var sRemoteDocumentPath = "path/to/file";
			var oResourceInfo = {
				name: sRemoteDocumentName,
				localFullName: sRemoteDocumentPath + "/" + sRemoteDocumentName
			};
			var bTheSame = oRequiredApplicationSyncUtility._isSameResource(sRemoteDocumentName, sRemoteDocumentPath, oResourceInfo);
			assert.equal(bTheSame, true);
		});
		
		it("Compare different remote and local resource", function () {
			var sRemoteDocumentName = "file1.js";
			var sRemoteDocumentPath = "path/to/file";
			var oResourceInfo = {
				name: sRemoteDocumentName,
				localFullName: "another/path/to/file" + "/" + sRemoteDocumentName
			};
			var bTheSame = oRequiredApplicationSyncUtility._isSameResource(sRemoteDocumentName, sRemoteDocumentPath, oResourceInfo);
			assert.equal(bTheSame, false);
		});

		afterEach(function () {
			oRequiredApplicationSyncUtility = undefined;
		});
	});
});
