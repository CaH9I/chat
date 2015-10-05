angular.module('chatApp', [])
.directive('ownName', function() {
  return {
    template: '({{name}})'
  };
})
.directive('nickName', function() {
  return {
    template: '{{message.name}}: '
  };
})
.directive('messageText', function() {
  return {
    restrict: 'E',
    template: '{{message.text}}'
  }
})
.directive('scrollBottom', function() {
  return {
    scope: {
      collection: '=scrollBottom'
    },
    link: function(scope, element) {
      scope.$watchCollection('collection', function() {
        $(element).scrollTop($(element).prop('scrollHeight'));
      })
    }
  };
})
.factory('app', function($rootScope) {
  var socket = io.connect();
  var chat = new Chat(socket);
  return {
    socket: socket,
    chat: chat
  };
})
.controller('ChatController', function($scope, app) {
  $scope.name = '';
  $scope.newName = '';
  $scope.messages = [];
  $scope.currentMessage = '';
  $scope.error = '';
  $scope.isFormOpen = false;
  
  $scope.toggleForm = function() {
    $scope.isFormOpen = !$scope.isFormOpen;
    $scope.error = '';
    $scope.newName = '';
  }
  
  $scope.send = function($event) {
    $event && $event.preventDefault(); //prevents default action of Enter key after emitting message
    if ($scope.currentMessage.trim() === '') {
      $scope.currentMessage = '';
      return;
    }
    app.chat.sendMessage($scope.currentMessage);
    $scope.messages.push({name: $scope.name, text: $scope.currentMessage});
    $scope.currentMessage = '';
  };
  
  $scope.changeName = function(name) {
    app.chat.changeName(name);
  }
  
  app.socket.on('message', function(message) {
    $scope.$apply(function() {
      $scope.messages.push(message);
    });
  });  
  
  app.socket.on('nameResult', function(message) {
    if (message.success) {
      $scope.$apply(function() {
        $scope.name = message.name;
        $scope.newName = '';
        $scope.error = '';
      });
    } else {
      $scope.$apply(function() {
        $scope.error = message.cause;
      });
    }
  });
});
