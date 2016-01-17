//---------------------------------------------------------------------
// JQUERY PLUGIN!
//---------------------------------------------------------------------

(function() {

	jQuery.fn.qrcode = function(sText) {

		// properties of the QRCode
		var iWidth = 256,
		    iHeight = 256,
		    iTypeNumber = 0,
		    iCorrectLevel = QRErrorCorrectLevel.H,
		    sBackground = "#FFFFFF",
		    sForeground = "#000000";
		
		// iterate through the jQuery elements
		return this.each(function(){
			var oQR = new QRCode(iTypeNumber, iCorrectLevel);
			oQR.addData(sText);
			oQR.make();
			
			// create the canvas area for the QRCode instance
			var oCanvas = document.createElement("canvas");
			if (oCanvas) {
				
				// apply the dimensions
				oCanvas.width = iWidth;
				oCanvas.height = iHeight;
				
				// get the convas context
				var oContext = oCanvas.getContext("2d");
				
				if (oContext) {
					
					// calculate the tile width and height based on the dimensions
					var iTileWidth = iWidth / oQR.getModuleCount();
					var iTileHeight = iHeight / oQR.getModuleCount();
					
					// draw in the canvas
					for (var row = 0; row < oQR.getModuleCount(); row++) {
						for (var col = 0; col < oQR.getModuleCount(); col++) {
							oContext.fillStyle = oQR.isDark(row, col) ? sForeground : sBackground;
							var w = (Math.ceil((col+1) * iTileWidth) - Math.floor(col * iTileWidth));
							var h = (Math.ceil((row+1) * iTileWidth) - Math.floor(row * iTileWidth));
							oContext.fillRect(Math.round(col * iTileWidth), Math.round(row * iTileHeight), w, h);  
						}	
					}

					// add the canvas to the jQuery element
					jQuery(oCanvas).appendTo(this);
					
				}
				
			}
			//var oQR = new QRCode(this, {text: sText, typeNumber: iTypeNumber, correctLevel: iCorrectLevel});
			// create the QRCode instance
			/*var oQR = new QRCode(iTypeNumber, iCorrectLevel);
			oQR.addData(sText);
			oQR.make();
			
			// create the canvas area for the QRCode instance
			var oCanvas = document.createElement("canvas");
			if (oCanvas) {
				
				// apply the dimensions
				oCanvas.width = iWidth;
				oCanvas.height = iHeight;
				
				// get the convas context
				var oContext = oCanvas.getContext("2d");
				
				if (oContext) {
					
					// calculate the tile width and height based on the dimensions
					var iTileWidth = iWidth / oQR.getModuleCount();
					var iTileHeight = iHeight / oQR.getModuleCount();
					
					// draw in the canvas
					for (var row = 0; row < oQR.getModuleCount(); row++) {
						for (var col = 0; col < oQR.getModuleCount(); col++) {
							oContext.fillStyle = oQR.isDark(row, col) ? sForeground : sBackground;
							var w = (Math.ceil((col+1) * iTileWidth) - Math.floor(col * iTileWidth));
							var h = (Math.ceil((row+1) * iTileWidth) - Math.floor(row * iTileWidth));
							oContext.fillRect(Math.round(col * iTileWidth), Math.round(row * iTileHeight), w, h);  
						}	
					}

					// add the canvas to the jQuery element
					jQuery(oCanvas).appendTo(this);
					
				}
				
			}*/
			
		});
		
	};
	
	
})();