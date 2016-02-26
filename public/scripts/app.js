/**
* Created by sujata.patne on 7/6/2015.
*/
var myApp = angular.module('myApp', ['ui.bootstrap', 'ui.router', 'ngProgress', 'underscore']);

myApp.filter('number', [function() {
    return function(input) {
        return parseInt(input, 10);
    };
}]);

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
myApp.config(function ($stateProvider) {
    $stateProvider

        .state("dashboard", {
            templateUrl: "partials/dashboard.html",
            controller: "dashboardCtrl",
            url: "/"
        })
        .state('users', {
            templateUrl: 'partials/add-edit-users.html',
            controller: 'usersCtrl',
            url: '/users'
        })
        .state('add-store', {
            templateUrl: 'partials/add-store.html',
            controller: 'storeCtrl',
            url: '/add-store'
        })
         .state('edit-store', {
             templateUrl: 'partials/add-store.html',
             controller: 'storeCtrl',
             url: '/edit-store/:id'
         })
        .state('assign-right', {
            templateUrl: 'partials/assign-right.html',
            controller: 'assignRightCtrl',
            url: '/assign-right'
        })
          .state('assign-right-manage', {
              templateUrl: 'partials/assign-right.html',
              controller: 'assignRightCtrl',
              url: '/assign-right/:id'
          })
        .state('manage-content', {
            templateUrl: 'partials/manage-content.html',
            controller: 'manageContentCtrl',
            url: '/manage-content'
        })
         .state('edit-content', {
             templateUrl: 'partials/manage-content.html',
             controller: 'manageContentCtrl',
             url: '/edit-content/:id'
         })
        .state('manage-country-list', {
            templateUrl: 'partials/manage-country-list.html',
            controller: 'manageCountryListCtrl',
            url: '/manage-country-list'
        })

        .state('accountforgot', {
            templateUrl: 'partials/account-changepassword.html',
            controller: '',
            url: '/accountforgot'
        })
        .state("changepassword", {
            templateUrl: 'partials/account-changepassword.html',
            controller: 'usersCtrl',
            url: '/changepassword'
        })
})
    .run(function ($state) {
        $state.go("add-store");
    })