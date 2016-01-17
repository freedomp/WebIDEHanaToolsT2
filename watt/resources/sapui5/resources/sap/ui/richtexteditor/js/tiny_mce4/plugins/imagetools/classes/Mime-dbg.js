
define("tinymce/imagetoolsplugin/Mime", [], function() {
	function getUriPathName(uri) {
		var a = document.createElement('a');

		a.href = uri;

		return a.pathname;
	}

	function guessMimeType(uri) {
		var parts = getUriPathName(uri).split('.'),
			ext = parts[parts.length - 1],
			mimes = {
				'jpg': 'image/jpeg',
				'jpeg': 'image/jpeg',
				'png': 'image/png'
			};

		if (ext) {
			ext = ext.toLowerCase();
		}

		return mimes[ext];
	}

	return {
		guessMimeType: guessMimeType
	};
});
