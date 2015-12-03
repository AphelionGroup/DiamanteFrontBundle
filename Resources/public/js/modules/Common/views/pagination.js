define([
  'app',
  'tpl!../templates/pagination.ejs',
  'tpl!../templates/pager.ejs'], function(App, paginationTemplate ,pagerTemplate) {

  return App.module('Common.Pagination', function(Pagination, App, Backbone, Marionette, $, _) {


    Pagination.PagerView = Marionette.ItemView.extend({
      template: pagerTemplate,
      tagName: 'nav',

      initialize : function(){
        this.listenTo(this.model, "change", this.render);
      },

      events: {
        'click a': 'navigateToPage'
      },

      navigateToPage: function(e){
        e.preventDefault();
        var page = e.target.hash.replace('#','');
        page = _.isFinite(page) ? parseInt(page, 10) : page;
        this.trigger('page:change', page);
      }

    });


    Pagination.LayoutView = Marionette.LayoutView.extend({
      template: paginationTemplate,

      regions: {
        paginationPagerRegion: '.js-pagination-pager',
        paginationMainRegion: '.js-pagination-main'
      },

      initialize: function(options){

        this.collection = options.collection;
        this.emptyView = options.emptyView;


        this.pagerView = new Pagination.PagerView({
          model: new Backbone.Model(this.collection.state)
        });
        this.mainView = new this.MainView(options);

        this.listenTo(this.pagerView, 'page:change', function(page){
          this.trigger('page:change', page);
        }.bind(this));

        this.on('show', function(){
          this.paginationPagerRegion.show(this.pagerView);
          this.paginationMainRegion.show(this.mainView);
        });

      }
    });

  });

});


