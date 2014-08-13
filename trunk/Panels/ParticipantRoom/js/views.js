var ServerURL = "/ServerSide/";
Room.Views = {
    // Global App View
    App: Backbone.View.extend({
        el: '#layoutContainer',
        webinarId: 1,
        initialize: function () {
            //_.bindAll(this,'signInToServer','collectDatas');
            this.isLoggedInToServer();
            this.getWebinarId();
            this.getWebinarInformation();
            this.createLayout();
            new Room.Views.listOfPresentView();
        },
        isLoggedInToServer: function () {
            $.ajax({
                type: 'GET',
                url: ServerURL + "Account/IsLoggedIn",
                dataType: 'json',
                success: function (result) {
                    if (result.Status == true) {
                        Room.userName = result.user;
                        //alert(Room.userName);
                    }
                    else {
                        //	window.location="http://www.iwebinar.ir";
                    }
                },
                async: false
            });
        },
        getWebinarId: function () {
            var qs = this.getQueryStrings();
            Room.webinarId = qs["WebinarID"];
            //alert(Room.webinarId);
            if (Room.webinarId == undefined) {
                //window.location = "http://www.iwebinar.ir";
            }
        },
        getQueryStrings: function () {
            var assoc = {};
            var decode = function (s) {
                return decodeURIComponent(s.replace(/\+/g, " "));
            };
            var queryString = location.search.substring(1);
            var keyValues = queryString.split('&');
            for (var i in keyValues) {
                var key = keyValues[i].split('=');
                if (key.length > 1) {
                    assoc[decode(key[0])] = decode(key[1]);
                }
            }
            return assoc;
        },
        getWebinarInformation: function () {
            var _this = this;
            Room.webinarInfo = new Room.Models.webinarInfo();
            Room.webinarInfo.fetch({
                data: { sessionId: Room.webinarId },
                success: function (model, response) {
                    if (response.Status) {
                        Room.Info = response.Result;
                        //	alert("Try To Get Data");
                        _this.collectDatas();
                    }
                }
            });

            console.log("Try To Get List Of Video Files");
            $.ajax({
                type: 'GET',
                url: ServerURL + "Account/GetListOfVideos",
                dataType: 'json',
                data: { sessionId: Room.webinarId },
                success: function (result) {
                    console.log(result.Message);
                    if (result.Status == true) {
                        $("#SessionVideo").html("");
                        console.log(result.Message);
                        $("#SessionVideo").append("<option value='-1'>" + "انتخاب ویدیو" + "</option>");

                        for (var i = 0; i < result.Result.length; i++) {
                            var url = "http://94.232.174.206:7700/Namaava/" + Room.webinarId + "/" + result.Result[i].fileId + ".webm";
                            $("#SessionVideo").append("<option value='" + url + "'>" + result.Result[i].fileId + "</option>");
                            console.log(url);
                        }

                        $("#SessionVideo").change(function (e) {
                            var videoUrl = $(this).val();
                            console.log("Video is : " + videoUrl);
                            $("#mediaContainer").jPlayer("setMedia", {
                                ogv: videoUrl // Defines the counterpart ogv url
                            }).jPlayer("play"); // Attempts to Auto-Play the media
                            $("#mediaContainer").jPlayer("size", { width: "320" });
                        });

                        var videoUrl = "http://94.232.174.206:7700/Namaava/" + Room.webinarId + "/" + result.Result[0].fileId + ".webm";
                        console.log("Video is : " + videoUrl);
                        $("#mediaContainer").jPlayer("setMedia", {
                            ogv: videoUrl // Defines the counterpart ogv url
                        }).jPlayer("play"); // Attempts to Auto-Play the media
                        $("#mediaContainer").jPlayer("size", { width: "320" });
                    }
                    else {
                        $("#SessionVideo").html("");
                    }
                },
                async: false
            });
        },
        signInToServer: function () {
            var that = this;
            var serverUrl = '/';
            Room.serverUrl = serverUrl;
            var loginData = { username: 'mk', password: '110@110', rememberMe: true };
            $.ajax({
                type: 'POST',
                url: ServerURL + "Account/SignInToServer",
                dataType: 'json',
                data: loginData
            }).done(function (msg) {
                Room.webinarInfo = new Room.Models.webinarInfo();
                Room.webinarInfo.fetch({
                    data: { sessionId: Room.webinarId },
                    success: function (model, response) {
                        if (response.Status) {
                            Room.Info = response.Result;
                            that.collectDatas();
                        }
                    }
                });
            });
        },
        collectDatas: function () {
            Room.userProfile = new Room.Models.profileModel({ username: Room.userName });
            Room.userProfile.fetch({
                data: { username: Room.userName },
                success: function (result) {
                    var info = Room.Info;
                    var presentorUserName = info.presentorUserName;
                    if (presentorUserName != '') {
                        Room.presentorProfile = new Room.Models.profileModel;
                        Room.presentorProfile.fetch({ data: { username: presentorUserName} });
                    } //
                    var adminUserName = info.adminUserName;
                    if (adminUserName != '') {
                        Room.adminUserNameProfile = new Room.Models.profileModel;
                        Room.adminUserNameProfile.fetch({ data: { username: adminUserName} });
                    }
                }
            });
            //Room.userProfile.toJSON().Result
            //Room.userProfile.toJSON().username
            Room.users = new Room.Collections.users;
            Room.users.fetch({
                data: {
                    sessionId: Room.webinarId
                },
                success: function (response) {
                    var res = response.toJSON();
                    if (res[0].Result.length > 0) {
                        var users = res[0].Result;
                        for (var i = 0; i < users.length; i++) {
                            var user = new Room.Models.user(users[i]);
                            Room.users.add(user);
                        }
                    }
                },
                error: function () {
                }
            });
            this.seedChatList();
            Room.sendChat = new Room.Views.sendChat();
            Room.slideView = new Room.Views.slideView();
            Room.videoView = new Room.Views.videoView();
            $.ajax({
                url: ServerURL + 'Session/ShowFiles',
                data: { sessionId: Room.webinarId, fileId: -1 },
                dataType: 'json',
                success: function (result, textStatus, jqXHR) {
                    if (result.Status) {
                        //fileUrl":"~/Seminars/190/ShahrokhiPresentation.pptx","fileId":168,"fileSize":971396
                        Room.files = result.Result;
                        new Room.Views.fileListView();
                    }
                },
                fail: function (da) {
                    alert(da);
                },
                async: false
            });

        },
        seedChatList: function () {
            var mText = 'با خبرنامه‌های روزانه می‌توانید هر صبح، صفحه اول روزنامه‌ها را دریافت کنید و یا از قیمت کالاها اطلاع پیدا کنید.';
            var sampleChatList = [
                {
                    avatarUrl: 'avatar.png',
                    userName: 'Mr.Ali',
                    message: mText
                },
                {
                    avatarUrl: 'avatar1.png',
                    userName: 'Mr.Hasan',
                    message: mText
                },
                {
                    avatarUrl: 'avatar.png',
                    userName: 'Mr.Ali',
                    message: mText
                }
            ];
            Room.chatList = new Room.Views.chatList(sampleChatList);
        },
        createLayout: function () {
            //myLayout.toggle('west');
            var roomLayout = this.$el.layout({
                west__paneSelector: '#layoutWest',
                east__paneSelector: '#layoutEast',
                center__paneSelector: '#layoutCenter',
                west__initClosed: true,
                east__initClosed: true,
                autoBindCustomButtons: true,
                west__size: .46,
                west__maxSize: .50,
                west__minSize: .46,
                east__size: .24,
                east__maxSize: .35,
                east__minSize: .24,
                center__size: .40,
                center__maxSize: .50,
                center__minSize: .21,
                livePaneResizing: true
            });

            // $('#sliderClose').on('click', function(){
            // 	roomLayout.toggle('center');
            // 	roomLayout.resize('west');
            // });
            //roomLayout.close('center');
            //roomLayout.hide('center');

        }
    }),

    // Single chat view
    chat: Backbone.View.extend({
        tagName: 'li',
        className: 'item',
        model: Room.Models.chat,
        template: template('chatItemTempalte'),
        initialize: function () {
            _.bindAll(this, 'deleteItem', 'render', 'remove', 'showClose', 'hideClose');
            this.render();
            // this.closeEl = this.$el.find('.close');
            this.model.on('destroy', this.remove);
        },
        events: {
            'click .icon-remove': 'remove',
            'mouseenter': 'showClose',
            'mouseleave': 'hideClose'
        },
        showClose: function () {
            var close = this.$el.find('.close');
            close.removeClass('hidden');
        },
        hideClose: function () {
            var close = this.$el.find('.close');
            close.addClass('hidden');
        },
        remove: function () {
            this.$el.remove();
        },
        deleteItem: function () {
            this.model.destroy();
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    }),
    sendChat: Backbone.View.extend({
        el: '.sendChat',
        events: {
            'click #toTeacher': 'addItem',
            'click #toTechnical': 'addItem',
            'click #ShowAllChats': 'showChats'
        },
        initialize: function (initialList) {

        },
        showChats: function (e) {
            //alert( Room.chats.length);
            //jQuery('#chatList').html('');
            //	for(var i = 0 ; i <  Room.chats.length; i++){
            //			var item = new Room.Models.chat(Room.chats[i]);
            Room.chatList.render(true);
            //	}
        },
        addItem: function (e) {
            e.preventDefault();
            var Data = {};
            Data.userName = Room.userName;
            Data.avatarUrl = 'avatar.png';
            var textArea = this.$el.find('textarea');
            Data.message = textArea.val();
            // textArea.val() = '';
            if (Data.message != "") {
                //Room.chatList.collection.add(new Room.Models.chat(Data))
                this.send(Data.message, Room.userName);
                //var thisOverview = $('#chatSlider').find('.overview');
                //var thisListLength = (thisOverview != null) ? thisOverview[0].children.length:0;
                //Room.chatSlider.tinycarousel_move(thisListLength);
            }
        },
        send: function (message, userName) { //SendMessage
            $.ajax({
                //type:'POST', 
                url: ServerURL + "session/SendMessage",
                dataType: 'json',
                data: { sessionId: Room.webinarId, message: message, userName: userName },
                success: function (result, textStatus, jqXHR) {
                    if (result.Status) {
                        //alert('ارسال شد');
                    }
                },
                fail: function (result) {
                    if (result.Status) {
                        //alert('مشکلی در ارسال پیام به سرور وجود دارد');
                    } else {
                        //alert(result);
                    }
                }
            });
        }
    }),
    chatList: Backbone.View.extend({
        el: '#chatList ul',
        initialize: function (initialList) {
            var that = this;
            that.chatIndex = -1;
            this.collection = new Room.Collections.chats();
            //this.render(false);
            this.collection.fetch({
                data: {
                    sessionId: Room.webinarId,
                    chatId: -1
                },
                success: function (model, response) {
                    if (response.Status) {
                        Room.chats = model.toJSON()[0].Result;
                        that.render(false);
                    }
                },
                error: function (e) {
                    //alert('مشکلی در دریافت لیست چت ها از سرور وجود دارد'+ 'خطا:'+ e.message);
                }
            });
            // if(this.collection.length == 0){
            // 	this.collection = new Room.Collections.chats({collection:initialList});
            // 	this.render(false);
            // }
            Room.chatSlider = $('#chatSlider');
            //Room.chatSlider.tinyscrollbar();
            //Room.chatSlider.tinycarousel({ 
            //	axis: 'y',
            //	start: Room.chatSlider.find('.overview')[0].children.length,
            //	display: 1,
            // pager: true,
            //	animation: true
            //});
            this.collection.on('add', this.renderItem, this);
            this.doInterval();
        },
        events: {

        },
        doInterval: function () {
            var that = this;
            var timer = setInterval(function () {
                $.ajax({
                    url: ServerURL + "session/RecieveMessage",
                    dataType: 'json',
                    data: { sessionId: Room.webinarId, chatId: that.chatIndex },
                    success: function (result, textStatus, jqXHR) {
                        if (result.Status) {
                            var newChats = result.Result;
                            if (newChats.length >= 1) {
                                for (var i = 0; i < newChats.length; i++) {
                                    var item = new Room.Models.chat(newChats[i]);
                                    that.collection.add(item);
                                }
                                ;
                                that.chatIndex = newChats[newChats.length - 1].id;
                            }
                        }
                    },
                    fail: function (result) {
                        if (result.Status) {
                            //alert('مشکلی در ارسال پیام به سرور وجود دارد');
                        } else {
                            //alert(result);
                        }
                    }
                });

                $.ajax({
                    url: ServerURL + "session/IAmHere",
                    dataType: 'json',
                    data: { sessionId: Room.webinarId },
                    success: function (result, textStatus, jqXHR) {
                        if (result.Status) {
                            //I am Here
                            $("#WebinarConnectivityMessage").html('سمینار در حالت آنلاین است.');
                            $("#OfflineLed").hide();
                            $("#OnlineLed").show();
                            $("#chatList").show();
                        }
                        else {
                            if (result.Message.indexOf("Off-line") != -1) {
                                $("#WebinarConnectivityMessage").html('سمینار در حالت آفلاین است.');
                                $("#OfflineLed").show();
                                $("#OnlineLed").hide();
                                $("#chatList").show();
                            }
                        }
                    }
                });


            }, 1000);


            //clearInterval(timer);
        },
        AddManualItem: function (item) {
            var itemView = new Room.Views.chat({
                model: item
            });
            chatList.$el.append(itemView.render().el);
            $('#chatList').stop().animate({ scrollTop: $("#chatList")[0].scrollHeight }, 800);
        },
        render: function (bDest) {
            var that = this;
            if (bDest) {
                var childs = that.$el.children();
                for (var i = 0; i < childs.length; i++) {
                    childs[i].remove();
                }
                ;
                that.collection.each(function (item) {
                    if (item.get('message') != '')
                        that.renderItem(item);
                }, that);
            } else {
                if (Room.chats.length >= 1) {
                    for (var i = 0; i < Room.chats.length; i++) {
                        var item = new Room.Models.chat(Room.chats[i]);
                        that.collection.add(item);
                        //this.renderItem(item);
                    }
                    ;
                    that.chatIndex = Room.chats[Room.chats.length - 1].id;
                }
                // that.collection.each(function(item){
                // 	that.renderItem(item);
                // },that);
            }
            // this.$el.jcarousel({
            //        vertical: true,
            //        scroll: 1,
            //        size: 5
            //    });
        },
        renderItem: function (item) {
            if (Room.Info.presentorUserName) {
                var UN = item.toJSON();
                if (UN.userName == Room.Info.presentorUserName)
                    item.set('cls', 'Teacher');
            }

            var itemView = new Room.Views.chat({
                model: item
            });

            // this.$el.jcarousel.add(this.index+1, itemView.render().el); //carousel.add(i + 1, mycarousel_getItemHTML(this));
            // this.index = this.index+1;
            this.$el.append(itemView.render().el);
            $('#chatList').stop().animate({ scrollTop: $("#chatList")[0].scrollHeight }, 800);
            //Room.chatSlider.tinycarousel_move(Room.chats[Room.chats.length-1]);
        }
    }),
    videoView: Backbone.View.extend({
        el: '#my_video_1',
        initialize: function () {
            var player = $("#mediaContainer").jPlayer({
                solution: "flash, html", // Flash with an HTML5 fallback.
                supplied: "ogv",
                swfPath: "http://www.iwebinar.ir:6060/Panels/ParticipantRoom/jPlayer/Jplayer.swf",
                size: {
                    width: "100%",
                    height: "100%"
                }
            });

            $('#playButton').click(function () {
                $('#mediaContainer').jPlayer('play');
            });
            $('#pauseButton').click(function () {
                $('#mediaContainer').jPlayer('pause');
            });
            $('#stopButton').click(function () {
                $('#mediaContainer').jPlayer('stop');
            });
            // player.ready(function(){ if(navigator.userAgent.indexOf("Trident/5")>-1 || navigator.userAgent.indexOf("Trident/6")>-1){
            // 	 _V_.options.techOrder = ["flash"];
            // 	 _V_.options.flash.swf = "js/video-js.swf";
            // 	}
            // });
            // .ready(function(){
            // 	player = this;
            // 	//player.play();

            // });
            new Room.Views.videoControlsView();
            //	new Room.Views.videoThumbsView();
        }
    }),
    videoControlsView: Backbone.View.extend({
        el: '#videoControls',
        initialize: function () {
            _.bindAll(this, 'settings', 'setSound', 'refresh', 'vidFull', 'vidPause');
            this.playerObject = $("#mediaContainer");
            this.playerObject.bind($.jPlayer.event.progress, function (event) {
                //	$("#VideoStatus").html("در حال دریافت اطلاعات از سرور ....");
            });
            this.playerObject.bind($.jPlayer.event.play, function (event) {
                $("#VideoStatus").html("در حال پخش مدیا");
            });
            this.playerObject.bind($.jPlayer.event.playing, function (event) {
                $("#VideoStatus").html("در حال پخش مدیا");
            });
            this.playerObject.bind($.jPlayer.event.stalled, function (event) {
                $("#VideoStatus").html("دریافت اطلاعات با خطا روبرو شده است. لطفا دکمه مشخص شده با علامت تازه سازی را بزنید.");
            });
            this.playerObject.bind($.jPlayer.event.pause, function (event) {
                $("#VideoStatus").html("پخش ویدیو متوقف شده است . برای ادامه دکمه Play را فشار دهید و برای همزمان شدن با کلاس دکمه رفرش را فشار دهید.");
            });
            this.playerObject.bind($.jPlayer.event.timeupdate, function (event) {
                //$("#VideoTime").html(event.jPlayer.status.currentTime);
                //TODO : get Video Time
            })
            this.getVideoData();
        },

        events: {
            'click #onlySound': 'setSound',
            'click #videoRefresh': 'refresh',
            'click #videoSettings': 'settings',
            'click #videoFull': 'vidFull',
            'click #videoPause': 'vidPause',
            'click #videoPlay': 'vidPause'
        },
        getVideoData: function () {
            //Session/GetUrlServiceForUser(int sessionId, string userName)
            var that = this;
            $.ajax({
                url: ServerURL + "Session/GetUrlServiceForUser",
                dataType: 'json',
                data: { sessionId: Room.webinarId, userName: Room.userName },
                success: function (result, textStatus, jqXHR) {
                    if (result.Status) {
                        //{"sessionServiceId":538,"url":null,"codec":"OGG","bitRate":256,"serviceType":"MasterVideo"}
                        Room.videoData = result.Result;
                        //var _m_video = document.getElementById("my_video_1_html5_api");
                        var videos = new Array;
                        for (var i = 0; i < result.Result.length; i++) {
                            videos[i] = result.Result[i].url;
                            //	alert(videos[i]);
                        }
                        that.playerObject.jPlayer("setMedia", {
                            ogv: videos[0].url // Defines the counterpart ogv url
                        }).jPlayer("play"); // Attempts to Auto-Play the media
                        setTimeout(function () {
                            that.refresh();
                        }, 2000);
                        //.playerObject.play();
                        //that.playerObject.src(videos);
                        //that.playerObject.play();
                    }
                },
                fail: function (result) {
                    if (result.Status) {
                        alert('مشکلی در ارسال پیام به سرور وجود دارد');
                    } else {
                        alert(result);
                    }
                }
            });
        },
        setSound: function () {
            this.playerObject.jPlayer("setMedia", {
                ogv: "http://94.232.174.206:8810"//Room.videoData[0].url // Defines the counterpart ogv url
            }).jPlayer("play"); // Attempts to Auto-Play the media


        },
        refresh: function () {
            this.playerObject.jPlayer("setMedia", {
                ogv: Room.videoData[0].url // Defines the counterpart ogv url
            }).jPlayer("play"); // Attempts to Auto-Play the media


        },
        vidPause: function () {
            if ($("#videoPlay").is(":visible")) {
                $("#videoPlay").hide();
                $("#videoPause").show();
                this.playerObject.jPlayer("play");
            }
            else {
                this.playerObject.jPlayer("pause");
                $("#videoPlay").show();
                $("#videoPause").hide();
            }

        },
        vidFull: function () {
            this.playerObject.jPlayer("fullScreen");
        },
        settings: function () {
            var that = this;
            var thisModal = $('#videoStsModal');
            thisModal.find('.cb input[type="radio"]').on('click', function () {
                var $this = $(this);
                $this.closest('.cb').find('input[type="radio"]').removeAttr('checked');
                $this.attr('checked', true);
            });
            var codec;
            var bitRate;
            thisModal.find('#cancel').on('click', function () {
                var thisAlert = thisModal.find('#videoAlert');
                if (thisAlert != null) {
                    thisAlert.remove();
                }
            });
            thisModal.find('#accept').on('click', function () {
                codec = thisModal.find('.cb input[name="codecRadios"][checked]').val();
                bitRate = thisModal.find('.cb input[name="bitRateRadios"][checked]').val();
                bitRate = +bitRate;
                var alert = $('<div id="videoAlert" class="alert alert-error fade" data-alert="alert">' +
                    '<button type="button" class="close" data-dismiss="alert">×</button>' +
                    'گزینه های انتخابی برای تنظیمات ویدئو در دسترس نیست، لطفا ترکیب دیگری را انتخاب نمایید.' +
                    '</div>');
                var videoData = Room.videoData;
                var vidDataLength = videoData.length;
                //var popover = $('')
                for (var i = 0; i < vidDataLength; i++) {
                    var dt = videoData[i];
                    if (dt.codec == codec && dt.bitRate == bitRate) {
                        if (dt.url != null) {
                            var url = 'http://cdn1.iwebinar.ir' + dt.url.substr(21);
                            that.playerObject.ready(function () {
                                that.playerObject.src(url);
                                thisModal.modal('hide');
                                that.playerObject.play();
                            });

                        } else {
                            var thisAlert = thisModal.find('#videoAlert');
                            for (var i = 0; i < thisAlert.length; i++) {
                                thisAlert[i].remove();
                            }
                            ;
                            thisModal.find('.modal-body').prepend(alert);
                            alert.addClass("in");
                            var notFoundAlert = function () {
                                var thisAlert = thisModal.find('#videoAlert');
                                thisAlert.fadeOut('slow', function () {
                                    for (var i = 0; i < thisAlert.length; i++) {
                                        thisAlert[i].remove();
                                    }
                                    ;
                                });
                            };
                            setTimeout(notFoundAlert, 3000);
                        }
                        break;
                    }
                }
                ;
            });
            var options = thisModal.modal();
        }
    }),
    webinarInfoView: Backbone.View.extend({
        el: '#webinarInfo',
        initialize: function () {
            var info = Room.Info;
            var presentorInfo = Room.presentorProfile ? Room.presentorProfile.toJSON().Result : null;
            if (presentorInfo != null) {
                var tab1 = this.$el.find('#tab1');
                tab1.find('h4').html('عنوان سمینار :' + '<br />' + info.name);
                tab1.find('p').html(info.description);
                var tab2 = this.$el.find('#tab2');
                tab2.find('h4').html('ارائه دهنده :' + '<br />' + info.presentor);
                tab2.find('p').html('توضیحات').append(
                        '<br />' +
                        'نام: ' + presentorInfo.firstName + ' ' + presentorInfo.lastName +
                        '<br />' +
                        'آدرس ایمیل: ' + presentorInfo.email);
                var img = tab2.find('img');
                var imgPath = presentorInfo.photo ? presentorInfo.photo : '';
                if (imgPath != '') {
                    imgPath = imgPath.substr(imgPath.indexOf('Pics'));
                    imgPath = imgPath.split("\\");
                    var src = 'http://www.iwebinar.ir:6060/ServerSide/Pics/Users/Originals/' + imgPath[3];
                    img.attr('width', 90);
                    img.attr('height', 90);
                    img.attr('src', src);
                }
                //status:Closed
            }
        },
        render: function () {

        }
    }),
    listOfPresentView: Backbone.View.extend({
        el: '#ListOfPresent',
        initialize: function () {
            //alert('لطفا دکمه تایید را فشار دهید');
            _.bindAll(this, 'render', 'addRow', 'sendMessage', 'Exit');
            this.tableBody = this.$el.find('.modal-body .table tbody');
            this.render();
        },
        template: template('PresentListRow'),
        events: {
            'click .sendMessageToPresent': 'sendMessage',
            'click .exitPresent': 'Exit'
        },
        sendMessage: function (e) {
            var userName = $(e.target).data('fileUrl');
            //alert('sendMessageToUser : ' + e);
        },
        Exit: function (e) {
            var userName = $(e.target).data('fileUrl');
            //alert('ExitUser : ' + userName);
        },
        addRow: function (userData) {
            this.tableBody.append(this.template(userData));
        },
        render: function () {
            var that = this;
            for (var i = 0; i < 10; i++) {
                var userData = {};
                userData.userName = i;
                userData.lastName = 'Sadeghi';
                userData.firstName = 'Majid';
                userData.presentStatus = 'Yes';
                that.addRow(userData);
            }
            ;
        }
    }),
    fileListView: Backbone.View.extend({
        el: '#myModal',
        initialize: function () {
            _.bindAll(this, 'render', 'addRow', 'downloadFile');
            var that = this;
            this.tableBody = this.$el.find('.modal-body .table tbody');
            this.render();
        },
        template: template('fileListRow'),
        events: {
            'click tbody button': 'downloadFile'
        },
        downloadFile: function (e) {
            e.preventDefault();
            var url = $(e.target).data('fileurl');
            window.open('http://www.iwebinar.ir:6060/ServerSide/' + url, '_blank');
        },
        addRow: function (fileData) {
            this.tableBody.append(this.template(fileData));
        },
        extractFileData: function (raw, index) {
            var fileData = {};
            var url = raw.fileUrl;
            fileData.index = index + 1;
            fileData.url = url.substr(1);
            var fileSize = raw.fileSize;
            fileSize = fileSize / 1024;
            var name = url.split('/')[3];
            var nameFraction = name.split('.');
            fileData.fileName = nameFraction[0];
            fileData.type = nameFraction[1];
            fileData.fileSize = fileSize.toFixed(2) + ' KB';
            switch (fileData.type) {
                case 'pptx':
                    fileData.fileClass = 'pptIcon';
                    break;
                case 'pdf':
                    fileData.fileClass = 'pdfIcon';
                    break;
                case 'docx':
                    fileData.fileClass = 'wordIcon';
                    break;
                case 'xlsx':
                    fileData.fileClass = 'xlsIcon';
                    break;
                case 'mp4':
                    fileData.fileClass = 'mp4Icon';
                    break;
                case 'txt':
                    fileData.fileClass = 'txtIcon';
                    break;
                default:
                    fileData.fileClass = 'txtIcon';
                    break;
            }
            return fileData;
        },
        render: function () {
            var that = this;
            if (Room.files) {
                var length = Room.files.length;
                for (var i = 0; i < length; i++) {
                    var fileData = that.extractFileData(Room.files[i], i);
                    that.addRow(fileData);
                }
                ;
            }
        }
    }),
    slideView: Backbone.View.extend({
        el: '.slideWrapper',
        initialize: function () {
            _.bindAll(this, 'render', 'startSlide', 'syncWTeacher', 'fetchSlides', 'NumberOfSessionSlides', 'goToNextImage', 'goToPreviousImage', 'goToFirstImage', 'goToLastImage');
            this.gallery = this.$el.find('#images');
            if (Room.Info) {
                var that = this;
                this.$el.find('.slideTitle').append(': ' + Room.Info.name);
                var time = +Room.Info.duration;
                time = time * 60 * 60;
                var timeContainer = that.$el.find('.time span');
                var timeCounter = new this.Countdown({
                    seconds: time,  // number of seconds to count down
                    onUpdateStatus: function (sec) {
                        //console.log(sec);
                        var hour = Math.floor(sec / 3600);
                        var min = Math.floor((sec - (hour * 3600)) / 60);
                        var s = sec - (hour * 3600 + min * 60);
                        // if(s==0 &&  min >0){
                        // 	min -= 1;
                        // 	s = 59;
                        // }
                        // if(min == 0 && hour >0){
                        // 	hour -=1;
                        // 	min = 59;
                        // }
                        if (hour < 10)
                            hour = '0' + hour;
                        if (min < 10)
                            min = '0' + min;
                        if (s < 10)
                            s = '0' + s;

                        timeContainer.html(hour + ' : ' + min + ' : ' + s);
                    }, // callback for each second
                    onCounterEnd: function () {
                        //alert('counter ended!');
                        timeContainer.css('background', '#FD7F2A');
                    } // final action
                });

                timeCounter.start();

            }
            var that = this;
            this.slideNavActions = this.$el.find('.slideNavActions');
            var $gotoSlide = this.slideNavActions.find('input[name=gotoSlide]');
            $gotoSlide.val(1);
            $gotoSlide.on('input', function () {
                var slideNum = $gotoSlide.val();
                var pageNum = that.gallery.pageNumberForImage(+slideNum);
                that.gallery.goToPage(pageNum, +slideNum);
            });
            this.NumberOfSessionSlides();
            Room.currentSlide = 10;
            // this.gallery.on('onPageChanged', 'setCurrent', this);
        },
        events: {
            // 'click .btnSlideFull':'slideFull',
            //
            'click #syncWithT': 'syncWTeacher',
            'click .slideNav .btnNext': 'goToNextImage',
            'click .slideNav .btnPrevious': 'goToPreviousImage',
            'click .slideNav .btnLast': 'goToLastImage',
            'click .slideNav .btnFirst': 'goToFirstImage',
            'click #slideshow': 'startSlide'
        },
        // setCurrent:function(){
        // 	var currImage = this.gallery.currentImage();
        // 	this.slideNavActions.find('.goToSlideLabel input[type="text"]').val(currImage);
        // },
        // template: template('slideItemTempalte'),
        syncWTeacher: function () {
            var that = this;
            var pageSize = this.gallery.pageSize;
            var imageNumber = Room.currentSlide % pageSize;
            var pageNum = this.gallery.pageNumberForImage(Room.currentSlide);
            this.gallery.goToPage(pageNum, Room.currentSlide);
            this.slideNavActions.find('input[name=gotoSlide]').val(Room.currentSlide + 1);
        },
        fetchSlides: function () {
            var gallery = this.gallery;
            if (Room.numberOfImages > 0) {
                for (var i = 1; i <= Room.numberOfImages; i++) {

                    var slideItem = {
                        //http://www.iwebinar.ir/Seminars/190/PowerPoint/1.png
                        imgUrl: "http://www.iwebinar.ir:6060/ServerSide/Seminars/" + Room.webinarId + "/PowerPoint/" + i + ".gif",
                        thumbUrl: "http://www.iwebinar.ir:6060/ServerSide/Seminars/" + Room.webinarId + "/PowerPoint/" + i + "_thumbnail.gif",
                        title: ''
                    };
                    gallery.append(
                        $('<li>').append($('<a>').attr('href', slideItem.imgUrl)
                            .append($('<img>').attr('src', slideItem.thumbUrl)
                                .attr('title', slideItem.title == '' ? 'بدون عنوان' : slideItem.title))));


                }
                ;
            }
        },
        NumberOfSessionSlides: function () {
            var that = this;
            $.ajax({
                url: ServerURL + 'Session/GetNumberOfSessionSlides',
                data: { seminarId: Room.webinarId },
                dataType: 'json',
                success: function (result, textStatus, jqXHR) {
                    if (result.Status) {
                        Room.numberOfImages = result.Result;
                        that.fetchSlides();
                        that.render();
                        var totalImages = that.gallery.numberOfImages();
                        that.slideNavActions.find('.goToSlideLabel span').html('/' + totalImages);
                    }
                },
                fail: function (da) {
                    alert(da);
                }
            });
        },
        goToFirstImage: function () {
            var that = this;
            this.gallery.last();
            this.slideNavActions.find('input[name=gotoSlide]').val(that.gallery.numberOfImages());
        },
        goToLastImage: function () {
            this.gallery.first();
            this.slideNavActions.find('input[name=gotoSlide]').val(1);
        },
        goToPreviousImage: function () {
            var that = this;
            this.gallery.nextImage();
            this.slideNavActions.find('input[name=gotoSlide]').val(that.gallery.currentImage() + 1);
        },
        goToNextImage: function () {
            var that = this;
            this.gallery.prevImage();
            this.slideNavActions.find('input[name=gotoSlide]').val(that.gallery.currentImage() + 1);
        },
        // slideFull:function(){
        // 	this.gallery.wrapper.hide();
        // 	this.gallery.fitToWindow();
        // },
        startSlide: function () {
            this.gallery.toggleSlideshow();
        },
        Countdown: function (options) {
            var timer,
                instance = this,
                seconds = options.seconds || 10,
                updateStatus = options.onUpdateStatus || function () {
                },
                counterEnd = options.onCounterEnd || function () {
                };

            function decrementCounter() {
                updateStatus(seconds);
                if (seconds === 0) {
                    counterEnd();
                    instance.stop();
                }
                seconds--;
            }

            this.start = function () {
                clearInterval(timer);
                timer = 0;
                seconds = options.seconds;
                timer = setInterval(decrementCounter, 1000);
            };

            this.stop = function () {
                clearInterval(timer);
            };
        },
        render: function () {
            var gallery = this.gallery;
            var currentImNumberInput = this.slideNavActions.find('input[name=gotoSlide]');
            gallery.exposure({
                carouselControls: true,
                controls: { prevNext: true, pageNumbers: true, firstLast: false },
                visiblePages: 2,
                pageSize: 4,
                imageControls: true,
                showCaptions: false,
                //slideshowControlsTarget : '#slideshow',
                fixedContainerSize: true,
                maxWidth: 600,
                maxHeight: 445,
                stretchToMaxSize: true,
                // jsonSource
                onThumb: function (thumb) {
                    var li = thumb.parents('li');
                    var fadeTo = li.hasClass($.exposure.activeThumbClass) ? 1 : 0.3;

                    thumb.css({ display: 'none', opacity: fadeTo }).stop().fadeIn(200);

                    thumb.hover(function () {
                        thumb.fadeTo('fast', 1);
                    }, function () {
                        li.not('.' + $.exposure.activeThumbClass).children('img').fadeTo('fast', 0.3);
                    });
                },
                onNext: function () {
                    currentImNumberInput.val(gallery.currentImage() + 1);
                },
                onImage: function (image, imageData, thumb) {
                    // Fade out the previous image.
                    image.siblings('.' + $.exposure.lastImageClass).stop().fadeOut(500, function () {
                        $(this).remove();
                    });

                    // Fade in the current image.
                    image.hide().stop().fadeIn(1000);

                    // Fade in selected thumbnail (and fade out others).
                    if (gallery.showThumbs && thumb && thumb.length) {
                        thumb.parents('li').siblings().children('img.' + $.exposure.selectedImageClass).stop().fadeTo(200, 0.3, function () {
                            $(this).removeClass($.exposure.selectedImageClass);
                        });
                        thumb.fadeTo('fast', 1).addClass($.exposure.selectedImageClass);
                    }
                },
                onPageChanged: function () {
                    // Fade in thumbnails on current page.
                    gallery.find('li.' + $.exposure.currentThumbClass).hide().stop().fadeIn('fast');
                    currentImNumberInput.val(gallery.currentImage());
                }
            });
        }
    })
};