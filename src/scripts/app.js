const apiBaseUrl = 'http://127.0.0.1:8000/api';

var app = angular.module('farmClubApp', ['ui.bootstrap']);

app.controller('mainCtrl', function($scope, dataService) {
	$scope.newStore = {};
	$scope.newStoreForm = false;
	$scope.failureAlert = '';

	$scope.stores = dataService.getAllStores(
		function(response) {
			$scope.stores = response.data;
		}
	);

	$scope.addStore = function(newStore) {
		dataService.addNewStore(newStore, function(response) {
			if (response.status === 201) {
				$scope.newStoreForm = false;
				$scope.failureAlert = '';
				$scope.stores.push(response.data);
			} else {
				if (response.data.errors.name) {
					$scope.failureAlert = response.data.errors.name[0];
				} else if (response.data.errors.address) {
					$scope.failureAlert = response.data.errors.address[0];
				} else {
					$scope.failureAlert = "Your new location could not be processed."
				};
			};
		})
	};

	$scope.closeNewStoreForm = function() {
		$scope.newStore = {};
		$scope.newStoreForm = false;
		$scope.failureAlert = '';
	}

	$scope.deleteStore = function(storeId) {
		dataService.removeStore(storeId, function(response) {
			let storeIndex = $scope.stores.indexOf(storeId);
			$scope.stores.splice(storeIndex, 1);
		})
	};

})

app.service('dataService', function($http) {

	this.getAllStores = function(cb) {
		$http.get(apiBaseUrl + '/stores')
		.then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.getStore = function(index, cb) {
		$http.get(apiBaseUrl + '/stores/' + index)
		.then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.getStoreArticles = function(index, cb) {
		$http.get(apiBaseUrl + '/stores/' + index + '/articles')
		.then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.addNewStore = function(newStore, cb) {
		$http({
			method: 'POST',
			url: apiBaseUrl + '/stores',
			data: newStore
		})
		.then(resp => cb(resp))
		.catch(err => cb(err))
	};

	this.updateStore = function(updated, cb) {
		$http({
			method: 'PUT',
			url: apiBaseUrl + '/stores/' + updated.id,
			data: updated,
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.addNewArticle = function(newItem, cb) {
		$http({
			method: 'POST',
			url: apiBaseUrl + '/articles',
			data: newItem
		})
		.then(resp => cb(resp))
		.catch(err => cb(err))
	};

	this.updateArticle = function(updated, cb) {
		$http({
			method: 'PUT',
			url: apiBaseUrl + '/articles/' + updated.id,
			data: updated,
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.removeStore = function(storeId, cb) {
		$http({
			method: 'DELETE',
			url: apiBaseUrl + '/stores/' + storeId
		}).then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};

	this.removeArticle = function(articleId, cb) {
		$http({
			method: 'DELETE',
			url: apiBaseUrl + '/articles/' + articleId
		}).then(resp => {
			cb(resp)
		}).catch(err => console.log(err))
	};
})

app.controller('ModalCtrl', function($scope, $uibModal, dataService) {
	$scope.storeAdmin = false;

	$scope.open = function(clickedId) {
		var modalInstance =  $uibModal.open({
			templateUrl: "modalContent.html",
			controller: "ModalContentCtrl",
			size: 'lg',
			resolve: {
				clicked: function() {
					return clickedId;
				}
			}
		});
	};

	$scope.updateStoreInfo = function(updatedStore) {
		dataService.updateStore(updatedStore, function(response) {
			let updatedIndex = $scope.stores.findIndex((store) => store.id == updatedStore.id);
			$scope.storeAdmin = false;
			$scope.stores[updatedIndex] = updatedStore;
 		})
	};
})

app.controller('ModalContentCtrl', function($scope, dataService, $uibModalInstance, clicked) {
	$scope.clicked = clicked;
	$scope.newItemForm = false;
	$scope.newItem = {};
	$scope.failureAlert = '';

	$scope.cancel = function() {
		$uibModalInstance.dismiss();
	}

	$scope.storeInfo = dataService.getStore(clicked, function(response) {
		$scope.storeInfo = response.data;
	})

	$scope.storeArticles = dataService.getStoreArticles(clicked, function(response) {
		$scope.storeArticles = response.data;
	})

	$scope.addArticle = function(newItem) {
		newItem.store_id = clicked;
		dataService.addNewArticle(newItem, function(response) {
			if (response.status === 201) {
				$scope.newItemForm = false;
				$scope.newItem = {};
				$scope.storeArticles.unshift(response.data);
			} else {
				if (response.data.errors.name) {
					$scope.failureAlert = response.data.errors.name[0];
				} else if (response.data.errors.price) {
					$scope.failureAlert = response.data.errors.price[0];
				} else if (response.data.errors.description) {
					$scope.failureAlert = response.data.errors.description[0];
				} else if (response.data.errors.total_in_shelf) {
					$scope.failureAlert = response.data.errors.total_in_shelf[0];
				} else if (response.data.errors.total_in_vault) {
					$scope.failureAlert = response.data.errors.total_in_vaultf[0];
				} else {
					$scope.failureAlert = "Your new item could not be processed."
				};
			};
		})
	};

	$scope.closeNewArticleForm = function() {
		$scope.newItemForm = false;
		$scope.newItem = {};
		$scope.failureAlert = '';
	};

	$scope.deleteArticle = function(article) {
		dataService.removeArticle(article.id, function(response) {
			let itemIndex = $scope.storeArticles.indexOf(article);
			$scope.storeArticles.splice(itemIndex, 1);
		})
	};

})

app.controller('ItemController', function($scope, dataService) {
	$scope.editShelf = false;
	$scope.editVault = false;

	$scope.updateArticle = function(updated) {
		dataService.updateArticle(updated, function(response) {
			$scope.editShelf = false;
			$scope.editVault = false;
		})
	};

});