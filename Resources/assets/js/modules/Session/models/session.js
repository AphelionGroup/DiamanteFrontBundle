define([
  'app',
  'config',
  'User/models/user',
  'helpers/wsse'], function(App, Config, User, Wsse) {

  return App.module('Session', function(Session, App, Backbone, Marionette, $, _){

    Session.startWithParent = false;


    Session.SessionModel = Backbone.Model.extend({

      url: Config.apiUrl.replace('api/diamante/rest/latest', 'diamantefront') + '/user',

      initialize: function(){
        var savedData = window.localStorage.getItem('authModel') || window.sessionStorage.getItem('authModel');
        if(savedData){
          this.set(JSON.parse(savedData));
        }
        this.addHeaders();
        $.ajaxSetup({
          statusCode: {
            401: function () {
              if(App.getCurrentRoute() !== 'login'){
                this.logout();
                App.alert({ title: "Authorization Required", messages: ["this action require authorization"] });
                App.trigger('session:login', { return_path: App.getCurrentRoute() });
              }
            }.bind(this)
          }
        });
      },

      validate: function(attrs, options){
        var errors = {};
        if(!attrs.email) {
          errors.email = "login is required";
        }
        if(!attrs.password) {
          errors.password = "password is required";
        }
        if(!_.isEmpty(errors)){
          return errors;
        }
      },

      addHeaders: function(){
        $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
          if(this.get('email') && this.get('password')){
            jqXHR.setRequestHeader('Authorization', 'WSSE profile="UsernameToken"');
            jqXHR.setRequestHeader('X-WSSE', Wsse.getUsernameToken(this.get('email'), this.get('password')));
          }
        }.bind(this));
      },

      loginSuccess: function(data) {
        this.set({
          id: data.id,
          logged_in: true
        });
        this.trigger('login:success');
        if(this.get('remember')){
          window.localStorage.setItem('authModel', JSON.stringify(this));
        } else {
          window.sessionStorage.setItem('authModel', JSON.stringify(this));
        }
        App.trigger('session:login:success');
      },

      loginFail: function(){
        this.trigger('login:fail');
        this.clear();
        this.set({ logged_in: false });
        App.trigger('session:login:fail');
        App.alert({ title: "Authorization Failed", messages: ["Username or password is wrong"] });
      },

      login: function(creds) {
        if(creds.password){
          creds.password = Wsse.encodePassword(creds.password);
        }
        if(this.set(creds, {validate: true})){
          this.getAuth().done(this.loginSuccess.bind(this)).fail(this.loginFail.bind(this));
        }
      },

      register: function(creds) {
        if(creds.password){
          creds.password = Wsse.encodePassword(creds.password);
        }
        this.save(creds,{
          success : function(){
            App.alert({ title: 'Registration Success', messages: [{
              status: 'success',
              text: 'Thank you. <br>' +
                'We have sent you email to ' + this.get('email') + '.<br>'+
                'Please click the link in that message to activate your account.'
            }] });
            this.clear();
            App.trigger('session:register:success');
          }.bind(this),
          error : function(){
            App.trigger('session:register:fail');
            App.alert({ title: "Registration Failed" });
          }
        });
      },

      confirm: function(hash){
        this.url += '/confirm';
        this.set('id', 1);
        this.save({ hash : hash },{
          patch: true,
          validate: false,
          success : function(){
            App.trigger('session:confirm:success');
            App.alert({ title: 'Email Confirmation Success', messages: [{
              status:'success',
              text: 'You may login and use application'}] });
            App.trigger('session:login');
          }.bind(this),
          error : function(){
            App.trigger('session:confirm:fail');
            App.alert({ title: 'Email Confirmation Failed', messages: ['Activation code is wrong'] });
            App.trigger('session:registration');
          }.bind(this),
          complete : function(){
            this.url = this.url.replace('/confirm', '');
            this.clear();
          }.bind(this)
        });
      },

      reset: function(data){
        this.url += '/reset';
        this.set('id', 1);
        this.save(data, {
          patch: true,
          validate: false,
          success : function(){
            App.trigger('session:reset:sent');
            App.alert({ title: 'Password Reset Info', messages: [{
              status:'info',
              text: 'We have sent you email to ' + this.get('email') + '.<br>' +
                'Please click the link in that message to reset your password.'
            }] });
          }.bind(this),
          error : function(){
            App.trigger('session:reset:fail');
            App.alert({ title: 'Password Reset Failed', messages: ['Email not found'] });
          }.bind(this),
          complete : function(){
            this.url = this.url.replace('/reset', '');
            this.clear();
          }.bind(this)
        });
      },

      newPassword: function(data){
        this.url += '/password';
        this.set('id', 1);
        data.password = Wsse.encodePassword(data.password);
        this.save(data, {
          patch: true,
          validate: false,
          success : function(){
            App.trigger('session:reset:success');
            App.alert({ title: 'Password Reset Success', messages: [{
              status:'success',
              text: 'Password successfully changed, you can use it to login'}] });
            App.trigger('session:password:change');
          }.bind(this),
          error : function(){
            App.trigger('session:reset:fail');
            App.alert({ title: 'Password Reset Failed', messages: ['Reset Code is invalid or expired'] });
            this.clear();
            App.trigger('session:reset');
          }.bind(this),
          complete : function(){
            this.url = this.url.replace('/password', '');
            this.clear();
          }.bind(this)
        });
      },

      logout: function() {
        this.clear();
        this.set({ logged_in: false });
        window.localStorage.removeItem('authModel');
        window.sessionStorage.removeItem('authModel');
        App.trigger('session:logout:success');
      },

      getAuth: function() {
        var defer = $.Deferred();
        if(this.get('email') && this.get('password')){
          return App.request('user:model:current');
        } else {
          defer.reject();
        }
        return defer.promise();
      }

    });



  });

});