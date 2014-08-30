var ServerURL = "/ServerSide/";
Room.Collections = {
    chats: Backbone.Collection.extend({
        model: Room.Models.chat,
        url: ServerURL + 'Session/RecieveMessage'
    }),

    users: Backbone.Collection.extend({
        model: Room.Models.user,
        url: ServerURL + 'Session/GetParticipants'
    }),

    slides: Backbone.Collection.extend({
        model: Room.Models.slide
    })
};