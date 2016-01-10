/**
 * Created by varunendra on 10/1/16.
 */
angular.module('shippable', []);

angular.module('shippable')
    .factory('dataService', ['$http', function ($http) {
        return {
            getIsuues: function (owner, repo) {
                return $http.get('https://api.github.com/repos/' + owner + '/' + repo + '/issues?q=state:open')
            }
        }
    }]);

angular.module('shippable')
    .filter('issue', [function () {
        return function (inputs, days) {
            var outputs = [];
            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var today = new Date();
            if (inputs) {
                switch (days) {
                    case 'lt24hrs':
                        angular.forEach(inputs, function (value, index) {
                            var createdAt = new Date(value['created_at']);
                            if (oneDay > today.getTime() - createdAt.getTime()) {
                                outputs.push(inputs[index]);
                            }
                        });
                        break;
                    case 'lt7days':
                        angular.forEach(inputs, function (value, index) {
                            var createdAt = new Date(value['created_at']);
                            if ((oneDay < today.getTime() - createdAt.getTime()) && (7 * oneDay > today.getTime() - createdAt.getTime())) {
                                outputs.push(inputs[index]);
                            }
                        });
                        break;
                    case 'mt7days':
                        angular.forEach(inputs, function (value, index) {
                            var createdAt = new Date(value['created_at']);
                            if (7 * oneDay < today.getTime() - createdAt.getTime()) {
                                outputs.push(inputs[index]);
                            }
                        });
                        break;
                }
            }
            return outputs;
        }
    }]);

angular.module('shippable')
    .controller('MainController', ['dataService', '$filter', function (dataService, $filter) {
        var mainCtrl = this;
        var issueFilter = $filter('issue');
        mainCtrl.issueList = [];
        mainCtrl.getIssues = getIssues;
        mainCtrl.errorMsg = 'Your result will show here';

        /*
         function to get total issues
         */
        function getIssues() {
            var url = mainCtrl.gitUrl.split("/"); // split the entered url
            if (url.length !== 5 || url[2] !== 'github.com') { // checked if entered url is valid github url or not
                mainCtrl.errorMsg = "Not a valid github url."
            } else {
                dataService.getIsuues(url[3], url[4])
                    .then(successHandler, errorHandler)
            }
        }

        /*
         function to handle success promise
         */
        function successHandler(response) {
            mainCtrl.errorMsg = '';
            mainCtrl.issueList = [];
            mainCtrl.issueList.push({
                'desc': 'Total no of open Issues',
                'count': response.data.length
            });
            mainCtrl.issueList.push({
                'desc': 'Number of open issues that were opened in the last 24 hours',
                'count': issueFilter(response.data, 'lt24hrs').length
            });
            mainCtrl.issueList.push({
                'desc': 'Number of open issues that were opened more than 24 hours ago but less than 7 days ago',
                'count': issueFilter(response.data, 'lt7days').length
            });
            mainCtrl.issueList.push({
                'desc': 'Number of open issues that were opened more than 7 days ago',
                'count': issueFilter(response.data, 'mt7days').length
            });
        }

        /*
         function to handle error
         */
        function errorHandler(error) {
            mainCtrl.errorMsg = error.statusText;
        }
    }]);
