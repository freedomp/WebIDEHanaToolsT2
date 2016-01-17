define([], function(){


	return {
		_getRemoteResource : function(sUrl){
			sUrl = require.toUrl(sUrl);
			return Q(
				$.ajax({
					dataType: "json",
					url: sUrl
				})
			);
		}
	};

});
