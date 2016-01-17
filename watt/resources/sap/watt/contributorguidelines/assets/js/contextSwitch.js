$(document).ready(function(){
	setDeviceContext();
});

$(window).resize(function(){
	setDeviceContext();
});

function setDeviceContext(){
	breakPointTablet = 600;
	breakPointDesktop = 1024;		

	windowWidth = window.innerWidth;

	if (windowWidth <= breakPointTablet) {
		$(".sapUiRespGrid")
			.removeClass("sapUiRespGridMedia-Std-Desktop")
			.removeClass("sapUiRespGridMedia-Std-Tablet")
			.addClass("sapUiRespGridMedia-Std-Phone");
	} else if ((windowWidth > breakPointTablet) && (windowWidth <= breakPointDesktop)) {
		$(".sapUiRespGrid")
			.removeClass("sapUiRespGridMedia-Std-Desktop")
			.removeClass("sapUiRespGridMedia-Std-Phone")
			.addClass("sapUiRespGridMedia-Std-Tablet");
	} else {
		$(".sapUiRespGrid")
			.removeClass("sapUiRespGridMedia-Std-Tablet")
			.removeClass("sapUiRespGridMedia-Std-Phone")
			.addClass("sapUiRespGridMedia-Std-Desktop");
	}
}