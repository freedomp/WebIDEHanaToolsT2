define([], function() {

	var LREPConnector = function() {

		var getToken = function() {
			//TODO: take from user to which system to deploy
			var sGetTokenURL = "/destinations/flplrep_server/sap/bc/lrep/actions/getcsrftoken/?sap-client=120";
			return Q.sap.ajax({
				type: "GET",
				url: sGetTokenURL,
				headers: {
					"Accept": "*/*",
					"Content-Type": "application/octet-stream",
					"processData": false,
					"X-CSRF-Token": "fetch",
					"X-Requested-With": "XMLHttpRequest",
					"Connection": "keep-alive",
					"Accept-Encoding": "gzip, deflate, sdch"
				}
			});
		};

		this.updateChange = function(changes) {
			var content = JSON.stringify(changes);		
			var sPostFilePath = "/destinations/flplrep_server/sap/bc/lrep/changes/?sap-client=120";
			return getToken().then(function(response) {
				var token = response[1].getResponseHeader("X-CSRF-Token");
				return Q.sap.ajax({
					type: "POST",
					url: sPostFilePath,
					data: content,
					headers: {
						"Accept": "*/*",
						"Content-Type": "application/json",
						"processData": false,
						"X-CSRF-Token": token
					}
				});
			});
		};
	};

	return LREPConnector;
});
