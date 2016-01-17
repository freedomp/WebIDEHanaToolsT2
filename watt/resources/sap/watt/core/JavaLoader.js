define(function(oRequest) {
	"use strict";
	// executed only when running locally - not for productive usage!
	return function(mEnv, oCallback) {

		// ui5/jQuery is not yet loaded, hence code getting url parameters with a helper function
		function getUriParameters() {
			var params = [];
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for ( var i = 0; i < hashes.length; i++) {
				var hash = hashes[i].split('=');
				params.push(hash[0]);
				params[hash[0]] = hash[1];
			}
			return params;
		}

		// Authentication is only evaluated/used if backend requires login (only when running locally - not for productive usage!)
		if (mEnv.orion_needs_login) {
			var sUsername = getUriParameters()["username"];
			var sPassword = getUriParameters()["password"];
			var oXHR = new XMLHttpRequest();

			oXHR.open("POST", mEnv.orion_server + "login/form?login=" + encodeURI(sUsername) + "&password=" + encodeURI(sPassword), true);
			oXHR.onreadystatechange = function() {
				if (this.readyState === 4 && this.status < 300) {
					return true;
				}
			};
			oXHR.send(null);
		}
		
		if (mEnv.che_needs_login) {
			var sUsername = getUriParameters()["username"];
			var sPassword = getUriParameters()["password"];
			var oXHR = new XMLHttpRequest();
			oXHR.open("POST", mEnv.che_server + "j_security_check", true);
			oXHR.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			oXHR.onreadystatechange = function() {
				if (this.readyState === 4 && this.status < 300) {
					return true;
				}
			};
			oXHR.send("j_username="+encodeURI(sUsername)+"&j_password="+encodeURI(sPassword)+"&login="+encodeURI("Log in"));
		}


		oCallback(mEnv);
	};
});