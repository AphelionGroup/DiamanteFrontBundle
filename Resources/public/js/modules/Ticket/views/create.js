define([
  'app',
  'tpl!../templates/form.ejs',
  'Common/views/modal',
  'Common/views/form'], function(App, formTemplate, Modal, Form){

  return App.module('Ticket.Create', function(Create, App, Backbone, Marionette, $, _){

    Create.ItemView = Form.LayoutView.extend({
      template: formTemplate,
      className: 'ticket-edit-form',

      regions : {
        attachmentRegion: '#ticket-attachment',
        dropRegion : '#ticket-attachment-drop'
      },

      templateHelpers : function(){
        return {
          'is_new' : true
        };
      },

      initialize : function(options){
        this.attachmentCollection = options.attachmentCollection;
      },

      onShow : function(){
        var formView = this;

        require(['Attachment/views/list', 'Attachment/views/dropzone'], function(TicketAttachment, TicketDropZone){
          var listView = new TicketAttachment.CollectionView({ collection: formView.attachmentCollection }),
              dropZone = new TicketDropZone.ItemView();

          dropZone.on('attachment:add', function(data){
            formView.trigger('attachment:add', data);
          });

          listView.on('childview:attachment:delete', function(childView, model){
            formView.trigger('attachment:delete', model);
          });

          formView.attachmentRegion.show(listView);
          formView.dropRegion.show(dropZone);

        });

        Form.LayoutView.prototype.onShow.call(this);
      }

    });

    Create.ModalView = Modal.LayoutView.extend({
      //onRoute: function(e){
      //  window.history.pushState(null, null, e.originalEvent.oldURL);
      //  Modal.LayoutView.prototype.onRoute.call(this);
      //},
      submitModal: function(){
        this.modalBody.currentView.submitForm();
        this.trigger('modal:submit');
      }
    });

  });

});