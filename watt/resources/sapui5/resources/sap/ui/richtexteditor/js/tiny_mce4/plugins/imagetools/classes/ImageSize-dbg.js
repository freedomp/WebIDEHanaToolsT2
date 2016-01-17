
define("tinymce/imagetoolsplugin/ImageSize", [], function() {
	function getWidth(image) {
		return image.naturalWidth || image.width;
	}

	function getHeight(image) {
		return image.naturalHeight || image.height;
	}

	return {
		getWidth: getWidth,
		getHeight: getHeight
	};
});
