/// <reference path="../../definedTypes/angular.d.ts" />
/// <reference path="../../definedTypes/angular-ui-router.d.ts" />

module App {
  export interface IUserService {
    getUser();
    login(login:string, password:string, success:(data:any, status:any) => void, error:() => void);
    logout();
    isLoggedIn(): boolean;
  }

  export interface IAdminController {
    logout (): void;
  }

  export interface ILoginScope extends ng.IScope {
    viewModel: AdminController
  }

  export class AdminController implements IAdminController {
    static $inject = ['$scope', 'user', '$state'];

    constructor(private $scope:ILoginScope, private user:IUserService, private $state:ng.ui.IStateService) {

      this.$scope.viewModel = this;

    }

    logout() {
      this.user.logout();
      this.$state.go('login');
    }
  }
}

angular.module('app').controller('adminController', App.AdminController);