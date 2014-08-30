(function () {
    var $Container = $('#layoutContainer');

    $(window).resize(function () {
        var $this = $(this);
        if ($this.innerWidth() < 600)
            $this.width(600);
        var contentHeight = $this.innerHeight() - ($('#footer').height() + $('.navbar').height());
        //if($this.innerHeight() > 638 && $this.innerWidth() > 600)
        $Container.height(contentHeight);
    });

    $(window).resize();

    window.Room = {};
    window.vent = _.extend({}, Backbone.Events);
    window.template = function (id) {
        return _.template($('#' + id).html());
    }
    if (!Room.webinarInfoView) {
        $('#webinarInfoBtn').on('click', function () {
            Room.webinarInfoView = new Room.Views.webinarInfoView();
        });
    }

    $('#infoTab a:first').tab('show');
    $('#infoTab a').click(function (e) {
        e.preventDefault();
        var $this = $(this);
        //$this.addClass('fade');
        $this.tab('show');
    });


    /*
     var createChatItem = function(avatar,name,text){
     var chatItem = $('<li class="item">'
     +'<div class="close hidden"><i class="icon-remove"></i></div>'
     +'<div class="img avatar"><a><img width="32" height="32" src="img/'
     +avatar
     +'" alt="Small"></a></div>'
     +'<div class="title">'+name+'</div>'
     +'<div class="text">'+text+'</div>'
     +'</li>');
     chatItem.on('mouseenter',function(){
     var close = chatItem.find('.close');
     close.on('click',function(){
     chatItem.remove();
     });
     close.removeClass('hidden');
     close.show();
     chatItem.on('mouseleave',function(){
     close.hide();
     });
     })
     return chatItem;
     }
     $(function(){
     var mText ='با خبرنامه‌های روزانه می‌توانید هر صبح، صفحه اول روزنامه‌ها را دریافت کنید و یا از قیمت کالاها اطلاع پیدا کنید.';
     $('#chatList ul').append(createChatItem('avatar.png','Mr.Ali', mText));
     $('#chatList ul').append(createChatItem('avatar1.png','Mr.Hasan', mText));
     $('#chatList ul').append(createChatItem('avatar.png','Mr.Ali', mText));
     $('#chatList ul').append(createChatItem('avatar1.png','Mr.Hasan', mText));
     });
     var chatSend = $('.sendChat');
     chatSend.find('.btn').on('click',function(e){
     e.preventDefault();
     var message = chatSend.find('textarea').val();
     if(message != ""){
     $('#chatList ul').append(createChatItem('avatar.png','Me',message));
     }
     }); */
    // var downloadFiles = $('.nav .file-down');
    // downloadFiles.on('click'.function(){
    // 	$('#myModal').modal(options);
    // })
})();

