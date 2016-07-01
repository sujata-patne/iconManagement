/**
 * Created by Sujata.Halwai on 29-06-2016.
 */
myApp.directive('futureDateOnly', function ($http,$rootScope,$filter) {
    var toId;
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            var d1,d2;
            console.log(attr.ngModel)
            scope.$watch(attr.ngModel, function (value) {
                if(typeof value != 'undefined') {
                    d2 = Date.parse(getDate(value));
                    d1 = new Date();
                    d1 = Date.parse(d1);
                    if(d1 > d2) {
                        ctrl.$setValidity('futureonly', false);
                    } else {
                        ctrl.$setValidity('futureonly', true);
                    }
                }else{
                    ctrl.$setValidity('futureonly', false);
                }
            });
        }
    };
})