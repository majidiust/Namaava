var ServerURL = "/ServerSide/";
Room.Models = {
    chat: Backbone.Model.extend({
        defaults: {
            // id: -1,
            avatarUrl: 'avatar.png',
            userFirstName: '',
            userLastName: '',
            userName: '',
            message: '',
            time: '',
            cls: '',
            status: 1
        },
        // validate

        validate: function (attrs) {

        }
    }),
    webinarInfo: Backbone.Model.extend({
        defaults: {
            Result: {
                id: Room.webinarId,
                name: '',//seminarName
                description: '',//seminarDescription
                capacity: '',//seminarCapacity
                presentor: '',//presentorName
                presentorUserName: '',//seminarPresentorName
                adminUserName: '',//AdminName
                beginTime: '',//BeginTime
                duration: '',//seminarDuration
                primaryContent: -1,//p.PrimaryContentID == null ? -1 : p.PrimaryContentID
                status: ''//StateOfSeminar
            }
        },
        urlRoot: ServerURL + 'Session/SessionSearchByID'
    }),
    profileModel: Backbone.Model.extend({
        defaults: {
            Status: false,
            Message: '',
            username: '',
            Result: {}
        },
        urlRoot: ServerURL + 'Account/GetProfile'
    }),
    user: Backbone.Model.extend({
        defaults: {
            firstName: '',
            lastName: '',
            userName: '',
            status: false,
            isInvited: false
        }
    }),

    slide: Backbone.Model.extend({
        defaults: {
            seqNumber: 1,
            title: '',
            imageUrl: ''
        }
    }),

    player: Backbone.Model.extend({
        defaults: {
            sessions: [
                {
                    sesTitle: 'بخش اول',
                    TOC: ['موضوع یک', 'موضوع دو', 'موضوع سه', 'موضوع چهار']
                },
                {
                    sesTitle: 'بخش دوم',
                    TOC: ['موضوع یک', 'موضوع دو', 'موضوع سه', 'موضوع چهار']
                }
            ],
            title: 'تحقیق در عملیات',
            width: 640,
            height: 385
        }
    })
};