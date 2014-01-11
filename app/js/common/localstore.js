"use strict";

angular.module('app.common.localstore', ['angular-local-storage'])

/*********************** Service ****************************/


  .factory('accountService', function ($rootScope, $location, storage) {
    var service = {};

    service.logout = function (redirect) {
      $rootScope.user = null;
      storage.remove('user');

      if (redirect) {
        $location.path(redirect);
      }
    };

    service.loadProfile = function () {
      storage.bind($rootScope, 'user');
    };

    service.login = function (email, password) {
      var user = storage.get(email);

      if (user && user.password === password) {
        storage.bind($rootScope, 'user');
        $rootScope.user = user;
        $location.path('/');
      } else {
        console.log(JSON.stringify("Incorrect login"));
        $rootScope.showAlert("Incorrect login");
      }
    };

    service.signUp = function (name, email, password) {
      var user = {
        email: email,
        name: name,
        password: password
      };


      storage.set(email, user);
      service.login(email, password);
    };

    service.isLoggedIn = function () {
      return $rootScope.user;
    };

    service.loadProfile();

    return service;
  })


/******************* Controller  ***************************/


  .controller('AccountController', function ($rootScope, accountService) {

    this.email = null;
    this.password = null;
    this.user = null;

    this.login = function () {
      accountService.login(this.email, this.password);
    };

    this.logout = function () {
      accountService.logout();
    };

    this.signUp = function () {
      accountService.signUp(this.name, this.email, this.password);
    };

    this.isLoggedIn = function () {
      return accountService.isLoggedIn();
    };

  })

  .factory('DataService', function ($rootScope, storage) {

    var dao = function (tableName) {
      this.tableName = tableName;
      this.identityName = tableName + 'Identity';

      storage.bind($rootScope, this.tableName);
      storage.bind($rootScope, this.identityName);

      this.data = $rootScope[this.tableName];
      this.identity = $rootScope[this.identityName];

      if (!this.data) {
        this.data = [];
        $rootScope[this.tableName] = this.data;
      }

      if (!this.identity) {
        this.identity = 0;
        $rootScope[this.identityName] = this.identity;
      }
    };

    dao.prototype.getNextId = function () {
      this.identity++;

      return this.identity;
    };

    dao.prototype.find = function (id) {
      var i, record;

      for (i = 0; i < this.data.length; i++) {
        record = this.data[i];
        if (record.Id === parseInt(id, 10)) {
          return this.data[i];
        }
      }

      return null;
    };

    dao.prototype.indexOf = function (id) {
      var i;

      for (i = 0; i < this.data.length; i++) {
        if (this.data[i].Id === parseInt(id, 10)) {
          return i;
        }
      }

      return -1;
    };

    dao.prototype.collection = function (scope, name) {
      scope[name] = $rootScope[this.tableName];
    };

    dao.prototype.getById = function (id, scope, name) {
      scope[name] = this.find(id);
    };

    dao.prototype.create = function (record, callback) {
      record.Id = this.getNextId();
      this.data.push(record);
      callback();
    };

    dao.prototype.update = function (record, callback) {
      callback();
    };

    dao.prototype.remove = function (id, callback) {
      var index = this.indexOf(id);

      if (0 <= index) {
        this.data.splice(index, 1);
      }

      callback();
    };

    return dao;
  }
);

