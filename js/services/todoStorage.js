angular.module('todomvc')
	.factory('todoStorage', function ($http, $injector) {
		'use strict';


		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

	.factory('api', function ($http) {
		'use strict';

		var store = {
			todos: [],

			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var completeTodos = [];
				var incompleteTodos = [];
				store.todos.forEach(function (todo) {
					if (todo.completed) {
						completeTodos.push(todo);
					} else {
						incompleteTodos.push(todo);
					}
				});

				angular.copy(incompleteTodos, store.todos);

				return $http.delete('/api/task/')
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);

				return $http.get('/api/task/destroy/' + todo.id)
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			},

			get: function () {
				return $http.get('/api/task/')
					.then(function (resp) {
						angular.copy(resp.data, store.todos);
						return store.todos;
					});
			},

			insert: function (todo) {
				var originalTodos = store.todos.slice(0);

				return $http.post('/api/task/create', todo)
					.then(function success(resp) {
						todo.id = resp.data.id;
						store.todos.push(todo);
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return store.todos;
					});
			},

			put: function (todo) {
				var originalTodos = store.todos.slice(0);

				return $http.post('/api/task/update/' + todo.id, todo)
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'todos-angularjs';

		var store = {
			todos: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (todos) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var completeTodos = [];
				var incompleteTodos = [];
				store.todos.forEach(function (todo) {
					if (todo.completed) {
						completeTodos.push(todo);
					} else {
						incompleteTodos.push(todo);
					}
				});

				angular.copy(incompleteTodos, store.todos);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			delete: function (todo) {
				var deferred = $q.defer();

				store.todos.splice(store.todos.indexOf(todo), 1);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			insert: function (todo) {
				var deferred = $q.defer();

				store.todos.push(todo);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			put: function (todo, index) {
				var deferred = $q.defer();

				store.todos[index] = todo;

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			}
		};

		return store;
	});
