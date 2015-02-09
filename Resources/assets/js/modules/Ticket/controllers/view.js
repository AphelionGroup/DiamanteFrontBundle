define(['app'], function(App){

  return App.module('Ticket.View', function(View, App, Backbone, Marionette, $, _){

    View.Controller = function(id){

      require(['Ticket/models/ticket', 'Ticket/views/view'], function(){

        App.request('ticket:model', id).done(function(ticketModel){

          var ticketView = new View.ItemView({
              model : ticketModel
          });
          ticketView.on('dom:refresh', function(){
            require(['Comment'], function(Comment){
              var options = {
                ticket : this.model,
                parentRegion : this.CommentsRegion
              };
              if(Comment.ready){
                Comment.render(options);
              } else {
                Comment.start(options);
              }

            }.bind(this));
          });
          ticketView.on('destroy', function(){
            require(['Comment'], function(Comment){
              Comment.stop();
            });
          });
          ticketView.on('ticket:close', function(){
            ticketModel.save({'status':'closed'}, {patch : true});
          });
          ticketView.on('ticket:open', function(){
            ticketModel.save({'status':'open'}, {patch : true});
          });

          App.mainRegion.show(ticketView);

        }).fail(function(){

          var missingView = new View.MissingView();
          App.mainRegion.show(missingView);

        });

      });

    };

  });

});