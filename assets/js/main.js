(function($) {
	var $window = $(window),
		$body = $('body');
  
	$window.on('load', function() {
	  window.setTimeout(function() {
		$body.removeClass('is-preload');
	  }, 100);
	});
  
	// 將函式掛到全域 window，供 HTML 調用
	window.checkUser = function() {
	  alert("Message has been sent！");
	};
  
  })(jQuery);