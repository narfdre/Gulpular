var deps = [ 'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
];

var MyApp = angular.module('MyApp', deps);

MyApp.constant('UTC_DATE_FORMAT', 'YYYY-MM-DDTHH:mm:ssZZ');

MyApp.run(function($rootScope, $state, $stateParams){
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;

	$rootScope.globals = {
		jsBaseUrl : window.globals.jsBaseUrl
	}
});

MyApp.factory('progressRequestInterceptor', function($q, ngProgressService){
	var reqsTotal = 0,
		reqsCompleted = 0;

	function setCompleted(){
	  reqsTotal = 0;
	  reqsCompleted = 0;
	  ngProgressService.complete();
	}

	return {
	  request: function(config){
		  if (reqsTotal === 0){
			  ngProgressService.start();
		  }
		  reqsTotal++;
		  return config;
	  },
	  response: function(response){
		  reqsCompleted++;
		  if (reqsCompleted >= reqsTotal){ setCompleted(); }
		  return response;
	  },
	  responseError: function(rejection){
		  reqsCompleted++;
		  if (reqsCompleted >= reqsTotal) { setCompleted(); }
		  return $q.reject(rejection);
	  }
	};
})

MyApp.config(function($urlRouterProvider, $httpProvider){
	$urlRouterProvider.otherwise('/');
	$httpProvider.interceptors.push('progressRequestInterceptor');
});

MyApp.controller('navController', function($scope){
    $scope.isCollapsed = true;
});
