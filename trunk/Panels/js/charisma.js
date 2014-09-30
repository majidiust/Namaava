var version = 2;
var peymentMethod;
var IsFirstLogIn = true;
var userName;
var InvitedUsersList = [];
var NewSminar;
var EditInviteRowSeleted;
var DeleteInviteRowSeleted;
var MySeminars = [];
var chatBoardUpdaterID;
var LastMessageId;
var CurrentSeminarID;
var SelectedFileForDelete;
var SelectedVideoForDelete;
var CurrentSearchAccountPage;
var SeletectedUserAccount;
var SelectedUserFirstName;
var SelectedUserLastName;
var SelectedUserMobile;
var CurrentSlidePage;
var SeminarPrimaryContent;
var isMember = -1;
var index = -1;
var NewsPictureID = -1;
var aboutUsEditor = null;
var seminarType;
var fee;
var WebinarPoster;


$(document).load(function () {
    CustomBlockingPanel('توجه', 'لطفا اندکی صبر کنید.', -1, null);
});
$(document).ready(function () {
    $("a[name=Management]").hide();
    $("#Management").hide();
    //themes, change CSS with JS
    //default theme(CSS) is cerulean, change it if needed
    var qs = getQueryStrings();
    if (qs["action"] == "payment") {
        if (qs["responseCode"] == 1) {
            $("#BankMessage").html("تراکنش شما با موفقیت انجام شد");
            var msg = "شماره پیگیری شما " + qs["refid"] + " است.";
            var paymentMsg = "شماره رهگیری شما " + qs["paymentCode"] + " است.";
            $("#BankRefId").html(msg);
            $("#VWorldPaymentId").html(paymentMsg);
            $("#BankResponseShow_PayedAmmuont").html('مبلغ پرداخت شده ' + qs["ammount"] + 'ریال می باشد. ');
            //Fetch The User Balanc Data
            CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
            $.ajax({
                type: 'POST',
                url: ServerURL + "Payment/ConfirmPayment",
                data: {paymentId:qs["paymentCode"]},
                dataType: 'json',
                success: function (result) {
                    CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
                    if (result.Status == true) {
                        $("#BankResponseShow_UserBalanace").html(result.balance + '  ریال است ');
                    } else {
                        CustomAlert('خطا', result.Message, null);
                    }
                },
                async: false
            });

            //End Of User balanc Data
            $("#BankResponseShow").show();
        } else {
            $("#BankMessage").html("تراکنش شما با خطا روبرو گردید");
            var msg = "شماره پیگیری شما " + qs["refid"] + " است.";
            var paymentMsg = "شماره رهگیری شما " + qs["paymentCode"] + " است.";
            $("#BankRefId").html(msg);
            $("#VWorldPaymentId").html(paymentMsg);
            $("#BankResponseShow_PayedAmmuont").html("");
            //Fetch The User Balanc Data
            CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
            $.ajax({
                type: 'GET',
                url: ServerURL + "Account/GetUserBalance",
                dataType: 'json',
                success: function (result) {
                    CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
                    if (result.Status == true) {
                        $("#BankResponseShow_UserBalanace").html(result.Result.balance);
                    } else {
                        CustomAlert('خطا', result.Message, null);
                    }
                },
                async: false
            });

            //End Of User balanc Data
            $("#BankResponseShow").show();
        }
    }

    initAboutUsEditor();

    var current_theme = $.cookie('current_theme') == null ? 'cerulean' : $.cookie('current_theme');
    switch_theme(current_theme);

    $('#themes a[data-value="' + current_theme + '"]').find('i').addClass('icon-ok');

    $('#themes a').click(function (e) {
        e.preventDefault();
        current_theme = $(this).attr('data-value');
        $.cookie('current_theme', current_theme, {
            expires: 365
        });
        switch_theme(current_theme);
        $('#themes i').removeClass('icon-ok');
        $(this).find('i').addClass('icon-ok');
    });


    function switch_theme(theme_name) {
        $('#bs-css').attr('href', 'css/bootstrap-' + theme_name + '.css');
    }

    //ajax menu checkbox
    $('#is-ajax').click(function (e) {
        $.cookie('is-ajax', $(this).prop('checked'), {
            expires: 365
        });
    });
    $('#is-ajax').prop('checked', $.cookie('is-ajax') === 'true' ? true : false);

    //disbaling some functions for Internet Explorer
    if ($.browser.msie) {
        $('#is-ajax').prop('checked', false);
        $('#for-is-ajax').hide();
        $('#toggle-fullscreen').hide();
        $('.login-box').find('.input-large').removeClass('span10');

    }


    //highlight current / active link
    $('ul.main-menu li a').each(function () {
        if ($($(this))[0].href == String(window.location)) $(this).parent().addClass('active');
    });

    //establish history variables
    var
        History = window.History, // Note: We are using a capital H instead of a lower h
        State = History.getState(),
        $log = $('#log');

    //bind to State Change
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        $.ajax({
            url: State.url,
            success: function (msg) {
                $('#content').html($(msg).find('#content').html());
                $('#loading').remove();
                $('#content').fadeIn();
                docReady();
            }
        });
    });

    //ajaxify menus
    $('a.ajax-link').click(function (e) {
        if ($.browser.msie) e.which = 1;
        if (e.which != 1 || !$('#is-ajax').prop('checked') || $(this).parent().hasClass('active')) return;
        e.preventDefault();
        if ($('.btn-navbar').is(':visible')) {
            $('.btn-navbar').click();
        }
        $('#loading').remove();
        $('#content').fadeOut().parent().append('<div id="loading" class="center">Loading...<div class="center"></div></div>');
        var $clink = $(this);
        History.pushState(null, null, $clink.attr('href'));
        $('ul.main-menu li.active').removeClass('active');
        $clink.parent('li').addClass('active');
    });

    //animating menus on hover
    $('ul.main-menu li:not(.nav-header)').hover(function () {
            $(this).animate({
                'margin-left': '+=5'
            }, 300);
        },

        function () {
            $(this).animate({
                'margin-left': '-=5'
            }, 300);
        });

    //other things to do on document ready, seperated for ajax calls
    docReady();

    //Rayan Hiva BLL Scripts
    $.getJSON(ServerURL + "Account/IsLoggedIn", {}, function (result) {
        if (result.Status == false) {
            window.location = "../index.htm";
        }
    });

    GetUserName();
    LoadCities();
    ShowControlPanel(true);
    GetUserProfile();
    CloseAllForm();
    $('#NewSeminarFileUpload').fileupload({
        dataType: 'json',
        formData: {
            sessionId: CurrentSeminarID
        },
        url: ServerURL + 'Session/UploadFiles',
        progressall: function (e, data) {
            $("#SeminarInfoFileProgress").show();
            $("#SeminarInfoFileInput").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#SeminarInfoFileProgress").css("width", per + "%");
        },
        done: function (e, data) {
            //	if(data.result.Status == true)
            {
                var _fileName = data.result.Name.split("/");
                var table = $("#SeminarInfoFiles");


                var _extensions = _fileName[_fileName.length - 1].split(".");
                var _isPowerPoint = false;
                if (_extensions.length >= 2) {
                    if (_extensions[_extensions.length - 1] == "ppt" || _extensions[_extensions.length - 1] == "pptx") {
                        _isPowerPoint = true;
                    }
                }

                var newRow = "<tr>";
                newRow += "<td style='text-align:center;'>" + data.result.Id + "</td>";
                newRow += "<td style='text-align:center;'>" + _fileName[_fileName.length - 1] + "</td>";
                newRow += "<td style='text-align:center;'>" + data.result.Size + "</td>";

                if (_isPowerPoint == true) {
                    newRow += '<td style="text-align:center;" class="center" id="SeminarContentButton' + data.result.Id + '"><button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarContent(' + data.result.Id + "," + CurrentSeminarID + ');"><i class="icon-trash icon-white"></i>به عنوان اسلاید</button></td>';
                } else {
                    newRow += "<td></td>";
                }

                newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-danger" style="font-family:tahoma;" onclick="deleteFiles(' + data.result.Id + '); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td>';


                newRow += "</tr>";
                table.append(newRow);
                //deleteFiles(data.result.Id)
                //$('#show_image').html('<img src="/home/image/' + data.result.name + '" />');
            }
            //	else{
            //		alert(data.result.Message);
            //	}
            $("#SeminarInfoFileProgress").css("width", "100%");
            setTimeout(function () {
                $("#SeminarInfoFileInput").show();
                $("#SeminarInfoFileProgress").hide();
                $("#SeminarInfoFileProgress").css("width", "0%");
            }, 1000);

        }
    });


    $('#NewSeminarVideoUpload').fileupload({
        dataType: 'json',
        formData: {
            sessionId: CurrentSeminarID,
            videoName : $("#sessionVideoName").val()
        },
        url: ServerURL + 'Account/UploadVideoFiles',
        progressall: function (e, data) {
            $("#SeminarInfoVideoProgress").show();
            $("#SeminarInfoVideoInput").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#SeminarInfoVideoProgress").css("width", per + "%");
        },
        done: function (e, data) {
            //	if(data.result.Status == true)
            {
                var _fileName = data.result.Name.split("/");
                var table = $("#SeminarInfoVideos");
                var _extensions = _fileName[_fileName.length - 1].split(".");
                var newRow = "<tr>";
                newRow += "<td style='text-align:center;'>" + data.result.Id + "</td>";
                newRow += "<td style='text-align:center;'>" + _fileName[_fileName.length - 1] + "</td>";
                newRow += "<td style='text-align:center;'>" + data.result.Size + "</td>";


                newRow += '<td style="text-align:center;" class="center" id="SeminarAdvertiseButton' + data.result.Id + '"><button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarAdvertise(' + data.result.Id + "," + CurrentSeminarID + ');"><i class="icon-trash icon-white"></i>به عنوان تبلیغ</button></td>';


                newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-danger" style="font-family:tahoma;" onclick="deleteVideos(' + data.result.Id + '); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td>';


                newRow += "</tr>";
                table.append(newRow);
            }
            $("#SeminarInfoVideoProgress").css("width", "100%");
            setTimeout(function () {
                $("#SeminarInfoVideoInput").show();
                $("#SeminarInfoVideoProgress").hide();
                $("#SeminarInfoVideoProgress").css("width", "0%");
            }, 1000);

        }
    });

    $('#NewSeminarFileUpload').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sessionId: CurrentSeminarID
        };
    });

    $('#NewSeminarVideoUpload').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sessionId: CurrentSeminarID
        };
    });

    if (IsFirstLogIn == true) {
        $("#Welcome").append("<p>لطفا قبل از هرکاری Profile  خود را کامل کنید.</p>");
        $("#UserPicture").prop("src", "http://www.vworld.ir/Pics/Users/default.png");
    } else {
        $("#UserPicture").prop("src", "http://www.vworld.ir/Pics/Users/Thumbnails/" + userName + "t.png");
    }


    $('#GalleryFileUpload').fileupload({
        dataType: 'json',
        url: ServerURL + 'Account/UploadGalleryPicture',
        progressall: function (e, data) {
            $("#GalleryFileProgress").show();
            $("#GalleryFileInput").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#GalleryFileProgress").css("width", per + "%");
        },
        done: function (e, data) {
            //	if(data.result.Status == true)
            {
                var _fileName = data.result.Name.split("/");
                var table = $("#GalleryFiles");


                var _extensions = _fileName[_fileName.length - 1].split(".");
                var _isPowerPoint = false;
                if (_extensions.length >= 2) {
                    if (_extensions[_extensions.length - 1] == "ppt" || _extensions[_extensions.length - 1] == "pptx") {
                        _isPowerPoint = true;
                    }
                }

                var newRow = "<tr>";
                newRow += "<td style='text-align:center;'>" + data.result.Id + "</td>";
                newRow += "<td style='text-align:center;'>" + _fileName[_fileName.length - 1] + "</td>";
                newRow += "<td style='text-align:center;'>" + data.result.Size + "</td>";


                newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-danger" style="font-family:tahoma;" onclick="DeleteGallery(' + _fileName[_fileName.length - 1] + '); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td>';

                newRow += "<td style='text-align:center;'></td>";
                newRow += "<td style='text-align:center;'></td>";
                newRow += "</tr>";
                table.append(newRow);
                //deleteFiles(data.result.Id)
                //$('#show_image').html('<img src="/home/image/' + data.result.name + '" />');
            }
            //	else{
            //		alert(data.result.Message);
            //	}
            $("#GalleryFileProgress").css("width", "100%");
            setTimeout(function () {
                $("#GalleryFileInput").show();
                $("#GalleryFileProgress").hide();
                $("#GalleryFileProgress").css("width", "0%");
            }, 1000);

        }
    });


    $('#ProfileImage').fileupload({
        dataType: 'json',
        formData: {
            sessionId: CurrentSeminarID
        },
        url: ServerURL + 'Account/UploadPicture',
        progressall: function (e, data) {
            $("#ProfileImageProgress").show();
            $("#ProfileImageFileInput").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#ProfileImageProgress").css("width", per + "%");
        },
        done: function (e, data) {
            $("#ProfileImageProgress").css("width", "100%");
            setTimeout(function () {
                $("#ProfileImageFileInput").show();
                $("#ProfileImageProgress").hide();
                $("#ProfileImageProgress").css("width", "0%");
            }, 1000);
        }
    });

    $('#ProfileImage').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            userName: userName
        };
    });


    $('#NewSeminarPoster').fileupload({
        dataType: 'json',
        url: ServerURL + 'Session/UploadWebinarPoster',
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
            var _fileName = data.result.Name;
            WebinarPoster = _fileName;
        }
    });


    $('#NewsPicture').fileupload({
        dataType: 'json',
        url: ServerURL + 'Session/UploadNewsImage',
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
            var _fileName = data.result.Id;
            NewsPictureID = _fileName;
        }
    });


    $('#NewSeminarPosterInfo').fileupload({
        dataType: 'json',
        formData: {
            sessionId: CurrentSeminarID
        },
        url: ServerURL + 'Session/EditWebinarPoster',
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
        }
    });

    $('#NewSeminarPosterInfo').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sessionId: CurrentSeminarID
        };
    });


    LoadSeminarTimes(true);

    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات حساب مالی ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserBalance",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'دریافت اطلاعات با موفقیت انجام شد.', 1000, null);
            if (result.Status == true) {
                $("#UpUserBalance_Balance").html('اعتبار شما ' + result.Result.balance + 'ریال');
            } else {
                CustomAlert("خطا", result.Message, null);
            }
        },
        async: false
    });
    //$("#testMessage").center();

    LoadRoles();

    $("#tabs").tabs();
});

function ShowEditAboutUs() {
    initAboutUsEditor();
    LoadAboutUsPage();
    ShowBox('#EditAboutUs');
}

function ShowHelp(){
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetGuidePage",
        dataType: 'json',
        success: function (result) {
            ShowBox("#HelpPanel")
            if (result.Status == true) {
                $("#HelpPanelContent").html(result.Result);
            }
            else {
                $("#HelpPanelContent").html("مطلبی وجود ندارد");

            }
        },
        error: function () {
            $("#HelpPanelContent").html("مطلبی وجود ندارد");
        },
        async: true
    });
}

function ShowContactUs(){


    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetAboutUsPage",
        dataType: 'json',
        success: function (result) {
            ShowBox('#ContactUs');
            if (result.Status == true) {
                $("#ContactUsPanel").html(result.Result);
            }
            else {
                $("#ContactUsPanel").html("مطلبی وجود ندارد");
            }
        },
        error: function () {

            $("#ContactUsPanel").html("مطلبی وجود ندارد");
        },
        async: true
    });

}

function EditSampleSeminars() {
    $('#SampleSeminarVideoUpload1').fileupload({
        dataType: 'json',
        formData: {
            sampleId: 1
        },
        url: ServerURL + 'Account/UploadSampleVideos',
        progressall: function (e, data) {
            $("#SampleSeminarVideoUpload1Progress").show();
            $("#SampleSeminarVideoUpload1Input").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#SampleSeminarVideoUpload1Progress").css("width", per + "%");
        },
        done: function (e, data) {
            $("#SampleSeminarVideoUpload1Progress").css("width", "100%");
            setTimeout(function () {
                $("#SampleSeminarVideoUpload1Input").show();
                $("#SampleSeminarVideoUpload1Progress").hide();
                $("#SampleSeminarVideoUpload1Progress").css("width", "0%");
            }, 1000);

        }
    });

    $('#SampleSeminarVideoUpload1').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sampleId: 1
        };
    });

    //
    $('#SampleSeminarVideoUpload2').fileupload({
        dataType: 'json',
        formData: {
            sampleId: 2
        },
        url: ServerURL + 'Account/UploadSampleVideos',
        progressall: function (e, data) {
            $("#SampleSeminarVideoUpload2Progress").show();
            $("#SampleSeminarVideoUpload2Input").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#SampleSeminarVideoUpload2Progress").css("width", per + "%");
        },
        done: function (e, data) {
            $("#SampleSeminarVideoUpload2Progress").css("width", "100%");
            setTimeout(function () {
                $("#SampleSeminarVideoUpload2Input").show();
                $("#SampleSeminarVideoUpload2Progress").hide();
                $("#SampleSeminarVideoUpload2Progress").css("width", "0%");
            }, 1000);

        }
    });

    $('#SampleSeminarVideoUpload2').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sampleId: 2
        };
    });
    //
    $('#SampleSeminarVideoUpload3').fileupload({
        dataType: 'json',
        formData: {
            sampleId: 3
        },
        url: ServerURL + 'Account/UploadSampleVideos',
        progressall: function (e, data) {
            $("#SampleSeminarVideoUpload3Progress").show();
            $("#SampleSeminarVideoUpload3Input").hide();
            var per = parseInt(data.loaded / data.total * 100, 10);
            $("#SampleSeminarVideoUpload3Progress").css("width", per + "%");
        },
        done: function (e, data) {
            $("#SampleSeminarVideoUpload3Progress").css("width", "100%");
            setTimeout(function () {
                $("#SampleSeminarVideoUpload3Input").show();
                $("#SampleSeminarVideoUpload3Progress").hide();
                $("#SampleSeminarVideoUpload3Progress").css("width", "0%");
            }, 1000);

        }
    });

    $('#SampleSeminarVideoUpload3').bind('fileuploadsubmit', function (e, data) {
        data.formData = {
            sampleId: 3
        };
    });


    ShowBox('#SampleSeminars');
}

function EditAboutUsDetails() {
    Debug('Alert SHow Box');
    var d = $("#AboutUsContent").val();
    Debug(d);
    CustomBlockingPanel("توجه", 'در حال ذخیره سازی محتویات صفحه  ......', -1, null);
    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/EditAboutUsPage",
        dataType: 'json',
        data: {text: d},
        success: function (result) {
            CustomBlockingPanel('توجه', 'ارسال اطلاعات با موفقیت انجام شد.', 1000, null);
            if (result.Status == true) {
                $("#EditAboutUs").hide();
            }
            else {
                CustomAlert("خطا", "امکان ذخیره سازی وجود ندارد لطفا مجددا تلاش نمایید.", null);
            }
        },
        async: true
    });
}

function initAboutUsEditor() {
    AboutUsEditor = $('#AboutUsContent').ckeditor();
}


function ShowEditGuidePage() {
    $('#EditGuideContent').ckeditor();
    LoadGuidePage();
    ShowBox('#EditGuide');
}

function EditGuidePage() {
    var d = $("#EditGuideContent").val();
    Debug(d);
    CustomBlockingPanel("توجه", 'در حال ذخیره سازی محتویات صفحه  ......', -1, null);
    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/EditGuidePage",
        dataType: 'json',
        data: {text: d},
        success: function (result) {
            CustomBlockingPanel('توجه', 'ارسال اطلاعات با موفقیت انجام شد.', 1000, null);
            if (result.Status == true) {
                $("#EditGuideContent").hide();
            }
            else {
                CustomAlert("خطا", "امکان ذخیره سازی وجود ندارد لطفا مجددا تلاش نمایید.", null);
            }
        },
        async: true
    });
}


function LoadGuidePage() {
    CustomBlockingPanel("توجه", 'در حال دریافت محتویات صفحه  ......', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetGuidePage",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'دریافت اطلاعات با موفقیت انجام شد.', 1000, null);
            if (result.Status == true) {
                $("#EditGuideContent").val(result.Result);
                $("#EditGuideContent").show();
                Debug(result.Result);
            }
            else {
                CustomAlert("خطا", "برای این صفحه داده ای وجود ندارد.", null);
            }
        },
        async: true
    });

}


function LoadAboutUsPage() {
    CustomBlockingPanel("توجه", 'در حال دریافت محتویات صفحه  ......', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetAboutUsPage",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'دریافت اطلاعات با موفقیت انجام شد.', 1000, null);
            if (result.Status == true) {
                $("#AboutUsContent").val(result.Result);
                $("#AboutUsContent").show();
                Debug(result.Result);
//					AboutUsEditor.setData(result.Result);
            }
            else {
                CustomAlert("خطا", "برای این صفحه داده ای وجود ندارد.", null);
            }
        },
        async: true
    });

}

function SetAsSeminarAdvertise(fileID, sessionId) {
    $.getJSON(ServerURL + "Account/GetCurrentAdvertise", {
            sessionId: sessionId
        },
        function (result) {
            var currentAdvertise = result.Result;
            if (result.Status == true) {

                $.getJSON(ServerURL + "Account/SetAsAdvertise", {
                        fileID: fileID
                    },
                    function (response) {
                        if (response.Status == true) {
                            $("#SeminarAdvertiseButton" + fileID).html('<span class="label label-success">تبلیغ</span>');
                            $("#SeminarAdvertiseButton" + currentAdvertise).html('<button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarAdvertise(' + currentAdvertise + "," + sessionId + ');"><i class="icon-trash icon-white"></i>به عنوان تبلیغ</button>');
                            //TODO : Remove Current Powerpoint Lable
                        } else {
                            alert(response.Message);
                        }
                    });
            }
        });
}

function NewNews() {
    ShowBox("#News");
}

function LoadCities() {

    $.getJSON(ServerURL + "Utility/GetCities", {},
        function (result) {
            //ProfileSelectCity
            if (result.Status == true) {
                for (var i = 0; i < result.Result.length; i++) {
                    var option = "<option id='ProfileSelectCity" + result.Result[i].CityId + "' value='" + result.Result[i].CityId + "'>" + result.Result[i].Name + "</option>";
                    Debug(option);
                    $("#ProfileSelectCity").append(option);
                }
            }
            else {
            }
        });
}

function LoadRoles() {
    CustomBlockingPanel('توجه', 'در حال دریافت نقش های سرور ...', -1, null);
    $("a[name=Management]").hide();
    $("#Management").hide();
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetMyRoles",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);

            if (result.Status == true) {
                for (var i = 0; i < result.Result.length; i++) {
                    Debug(result.Result[i]);
                    if (result.Result[i] == "AdminRole")
                        $("a[name=Management]").show();
                    $("#Management").show();
                }
            } else {
                Debug(result.Message);
            }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'دریافت اطلاعات با خطا روبرو گردید.', 1000, null);
        },
        async: true
    });
}

function AddNews() {
    CustomBlockingPanel('توجه', 'در حال ارسال به سرور ... ', -1, null);
    var desc = $("#NewsDesc").val();
    var topic = $("#NewsTopic").val();
    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/News",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات ارسال شد.', 1000, null);
            if (result.Status == true) {
                $("#News").hide();
                $("#NewsDesc").val("");
                $("#NewsTopic").val("");
            } else {
                CustomAlert('خطا', result.Message, null);
            }
        },
        error: function () {
        },
        data: {
            name: topic,
            desc: desc,
            picture: NewsPictureID
        },
        async: true
    });
}

function DeleteNews(newsID, table) {
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/DeleteNews",
        dataType: 'json',
        data: {
            newsID: newsID
        },
        success: function (result) {
            CustomBlockingPanel('توجه', 'اخبار حذف شد', 1000, null);
        },
        error: function () {
        },
        async: false
    });
}

function DeleteGallery(fileName) {
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/DeletePictureFromGallery",
        dataType: 'json',
        data: {
            fileName: fileName
        },
        async: true
    });
}

function ShowGallery() {
    ShowBox("#Gallery");
    ClearTableRows("#GalleryFiles tbody tr");
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfGalleryFiles",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                var table = $("#GalleryFiles");

                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += "<td style='text-align:center;'>" + i + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Name + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Length + "</td>";


                    newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-danger" style="font-family:tahoma;" onclick="DeleteGallery(' + "'" + result.Result[i].Name + "'" + '); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td>';

                    newRow += "<td style='text-align:center;'></td>";
                    newRow += "<td style='text-align:center;'></td>";
                    newRow += "</tr>";
                    table.append(newRow);
                }
            } else {
            }
        },
        error: function () {
        },
        async: true
    });
}

function LoadAllNews() {
    ShowBox("#AllNews");
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    ClearTableRows("#ListOfNewsTable tbody tr");
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetNews",
        dataType: 'json',
        data: {
            n: 1000
        },
        success: function (result) {
            if (result.Status == true) {
                CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = '<tr>';
                    newRow += '<td>' + result.Result[i].ID + '</td>';
                    newRow += '<td>' + result.Result[i].Subject + '</td>';
                    newRow += '<td>' + result.Result[i].Date + '</td>';
                    newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-danger" style="font-family:tahoma;" onclick="DeleteNews(' + result.Result[i].ID + '); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td>';
                    newRow += '<td style="text-align:center;" class="center" ><button class="btn btn-warning" style="font-family:tahoma;" onclick="EditNews(' + result.Result[i].ID + ');' + '"><i class="icon-trash icon-white"></i>ویرایش</button></td>';
                    newRow += '</tr>';
                    $("#ListOfNewsTable").append(newRow);
                }

            } else {
                CustomBlockingPanel('توجه', 'دریافت اطلاعات با خطا روبرو گردید.', 1000, null);
            }
        },
        error: function () {
        },
        async: true
    });
}

function GetUserPeyments() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    ClearTableRows("#UserPeymentsTable tbody tr");
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserPeyments",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
            if (result.Status == true) {
                var table = $("#UserPeymentsTable");
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Peigiri + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Rahgiri + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Ammount + "</td>";
                    if (result.Result[i].Status == 1) {
                        newRow += "<td style='text-align:center;'>با موفقیت انجام شده است</td>";
                    } else {
                        newRow += "<td style='text-align:center;'>با خطا مواجه شده</td>";
                    }
                    newRow += "<td style='text-align:center;'>" + result.Result[i].Dargah + "</td>";


                    newRow += "</tr>";
                    table.append(newRow);
                }
            } else {
                CustomAlert('خطا', result.Message, null);
            }
        },
        async: true
    });
}


function GetPrsianDate(currentDate) {
    var _splitedDate = currentDate.split(":");
    var _month = _splitedDate[1];
    switch (_month) {
        case "1":
            _month = "فروردین";
            break;
        case "2":
            _month = "اردیبهشت";
            break;
        case "3":
            _month = "خرداد";
            break;
        case "4":
            _month = "تیر";
            break;
        case "5":
            _month = "مرداد";
            break;
        case "6":
            _month = "شهریور";
            break;
        case "7":
            _month = "مهر";
            break;
        case "8":
            _month = "آبان";
            break;
        case "9":
            _month = "آذر";
            break;
        case "10":
            _month = "دی";
            break;
        case "11":
            _month = "بهمن";
            break;
        case "12":
            _month = "اسفند";
            break;
    }
    var _msg;
    if (_splitedDate[3] != "") {
        _msg = "ساعت " + _splitedDate[3] + " ، " + _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    } else {
        _msg = _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    }
    return _msg;
}

function getQueryStrings() {
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
}

function OpenWebinar(sessionID) {

}

function RefreshProfilePicture() {

    var picName = "http://www.vworld.ir/Pics/Users/Thumbnails/" + userName + "t.png";
    //var newImage = "<img src='" + picName + "'/>";
    //$("#UserPictureHolder").html("");
    $("#UserPicture").prop("src", picName);
    location.reload(true);
    //alert($("#UserPictureHolder").html());
}

function GetListOfSessionFilesForSeminarInfo(sessionID) {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    $.getJSON(ServerURL + "Session/ShowFiles", {
        sessionId: sessionID,
        fileId: index
    }, function (result) {
        CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
        if (result.Status == true) {
            var table = $("#SeminarInfoFiles");
            for (var i = 0; i < result.Result.length; i++) {
                //alert(result.Result[i].fileUrl);
                index = result.Result[i].fileId;
                var _fileUrl = result.Result[i].fileUrl.split("/");
                var _extensions = _fileUrl[_fileUrl.length - 1].split(".");
                var _isPowerPoint = false;
                if (_extensions.length >= 2) {
                    if (_extensions[_extensions.length - 1] == "ppt" || _extensions[_extensions.length - 1] == "pptx") {
                        _isPowerPoint = true;
                    }
                }
                var newRow = "<tr>";
                newRow += "<td style='text-align:center;'>" + result.Result[i].fileId + "</td>";
                newRow += "<td style='text-align:center;'>" + _fileUrl[_fileUrl.length - 1] + "</td>";
                newRow += "<td style='text-align:center;'>" + result.Result[i].fileSize + "</td>";

                if (_isPowerPoint == true) {
                    newRow += '<td style="text-align:center;" class="center" id="SeminarContentButton' + result.Result[i].fileId + '">';
                    if (SeminarPrimaryContent != -1 && SeminarPrimaryContent == result.Result[i].fileId) {
                        newRow += '<span class="label label-success">اسلاید سمینار</span>';
                    } else {
                        newRow += '<button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarContent(' + result.Result[i].fileId + "," + sessionID + ');"><i class="icon-trash icon-white"></i>به عنوان اسلاید</button>';
                    }

                    newRow += '</td>';


                } else {
                    newRow += "<td></td>";
                }
                newRow += '<td style="text-align:center;" class="center" ><button id="SeminarInfoButton' + result.Result[i].fileId + '" class="btn btn-danger" style="font-family:tahoma;" onclick=" SelectedFileForDelete = $(this).parent().parent(); deleteFiles(' + result.Result[i].fileId + '); "><i class="icon-trash icon-white"></i>حذف</button></td>';
                newRow += "</tr>";
                table.append(newRow);
            }
        } else {
            //alert(result.Message);
            index = -1;
        }
    });


    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    $.getJSON(ServerURL + "Account/GetListOfVideos", {
        sessionId: sessionID
    }, function (result) {
        CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
        if (result.Status == true) {
            var table = $("#SeminarInfoVideos");
            for (var i = 0; i < result.Result.length; i++) {
                //alert(result.Result[i].fileUrl);
                index = result.Result[i].fileId;
                var _fileUrl = result.Result[i].fileUrl.split("/");
                var _extensions = _fileUrl[_fileUrl.length - 1].split(".");
                var _isPowerPoint = false;
                if (_extensions.length >= 2) {
                    if (_extensions[_extensions.length - 1] == "ppt" || _extensions[_extensions.length - 1] == "pptx") {
                        _isPowerPoint = true;
                    }
                }
                var newRow = "<tr>";
                newRow += "<td style='text-align:center;'>" + result.Result[i].fileId + "</td>";
                newRow += "<td style='text-align:center;'>" + _fileUrl[_fileUrl.length - 1] + "</td>";
                newRow += "<td style='text-align:center;'>" + result.Result[i].fileSize + "</td>";


                newRow += '<td style="text-align:center;" class="center" id="SeminarAdvertiseButton' + result.Result[i].fileId + '"><button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarAdvertise(' + result.Result[i].fileId + "," + sessionID + ');"><i class="icon-trash icon-white"></i>به عنوان تبلیغ</button></td>';

                newRow += '<td style="text-align:center;" class="center" ><button id="SeminarInfoButton' + result.Result[i].fileId + '" class="btn btn-danger" style="font-family:tahoma;" onclick=" SelectedVideoForDelete = $(this).parent().parent(); deleteVideos(' + result.Result[i].fileId + '); "><i class="icon-trash icon-white"></i>حذف</button></td>';
                newRow += "</tr>";
                table.append(newRow);
            }
        } else {
            index = -1;
        }
    });
}


function CustomAlert(title, message, callback) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomMessageBoxLoadingPanel").hide();
    $("#CustomConfirmWindow").hide();
    $("#CustomAlertWindow").show();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    $('#CustomMessageBoxButton').click(function () {
        messageBox.hide();
        if (callback != null) {
            callback();
        }
        $('#CustomMessageBoxButton').unbind();
    });
}

function CustomBlockingPanel(title, message, timeout, callback) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomConfirmWindow").hide();
    $("#CustomAlertWindow").hide();
    $("#CustomMessageBoxLoadingPanel").show();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    if (timeout != -1) {
        setTimeout(function () {
            if (callback != null) {
                callback();
            }
            messageBox.hide();
        }, timeout);
    }
}

function CustomConfirm(title, message, callbackYes, callbackNo) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomConfirmWindow").show();
    $("#CustomAlertWindow").hide();
    $("#CustomMessageBoxLoadingPanel").hide();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    $('#CustomConfirmWindowYes').click(function () {
        messageBox.hide();
        if (callbackYes != null) {
            callbackYes();
        }
        $('#CustomConfirmWindowYes').unbind();
    });
    $('#CustomConfirmWindowNo').click(function () {
        messageBox.hide();
        if (callbackNo != null) {
            callbackNo();
        }
        $('#CustomConfirmWindowNo').unbind();
    });
}

function ShowParticipantList() {
    $("#SeminarParticipants").modal('show');
    GetListOfParticipant();
}

function Debug(dbg) {
    console.log(dbg);
}

function GetAmountPayment() {

    Debug("ARE YOU OK?");
    $.getJSON(ServerURL + "Account/GetBalance", {
        username: userName
    }, function (result) {
        if (result.Status == true) {
            $("#InfoAmount").html(result.Result);
        } else {
            alert(result.Message);
        }
    });
}


function GetUserBalance() {
    alert('Get User Balance from Server');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserBalance",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                alert(result.Result.balance);
            } else {
                alert(result.Message);
            }
        },
        async: false
    });
}

function GetPaymentHistory() {
    $.ajax({
        type: 'POST',
        url: ServerURL + "Payment/GetHistoryPayment",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {

            } else {
                alert(result.Message);
            }
        },
        data: content,
        async: true
    });
}

function GetListOfParticipant() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);

    try {
        $("#SeminarParticipantsHolderTable tbody tr").each(function () {
            this.parentNode.removeChild(this);
        });
        $.getJSON(ServerURL + "Session/GetParticipants", {
            sessionId: CurrentSeminarID
        }, function (result) {
            CustomBlockingPanel('توجه', 'لیست شرکت کنندگان دریافت شد ', 1000, null);
            if (result.Status == true) {
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].firstName + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].lastName + "</td>";
                    newRow += "<td style='text-align:center;'>" + result.Result[i].userName + "</td>";
                    if (result.Result[i].isInvited == true) {
                        newRow += "<td style='text-align:center;'>" + "مدعو" + "</td>";
                    } else {
                        newRow += "<td style='text-align:center;'>" + "درخواستی" + "</td>";
                    }
                    newRow += "</tr>";
                    $("#SeminarParticipantsHolderTable").append(newRow);
                }

            } else {
                alert(result.Message);
            }
        });
    } catch (exception) {
    }
}

function SetAsSeminarContent(fileID, sessionID) {
    //	public ActionResult SetAsSessionContent(int fileId, int SessionId)
    //TODO : Get current seminar content ID

    //public ActionResult GetCurrentContent(int seminarId)
    $.getJSON(ServerURL + "Session/GetCurrentContent", {
            seminarId: sessionID
        },
        function (result) {
            if (result.Status == true) {
                var currentContent = result.Result;


                $.getJSON(ServerURL + "Session/SetAsSessionContent", {
                        fileId: fileID,
                        SessionId: sessionID
                    },
                    function (response) {
                        if (response.Status == true) {
                            $("#SeminarContentButton" + fileID).html('<span class="label label-success">اسلاید سمینار</span>');
                            $("#SeminarContentButton" + currentContent).html('<button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarContent(' + currentContent + "," + sessionID + ');"><i class="icon-trash icon-white"></i>به عنوان اسلاید</button>');
                            //TODO : Remove Current Powerpoint Lable
                        } else {
                            alert(response.Message);
                        }
                    });
            } else {
                alert(result.Message);
            }
        });
}

function deleteFiles(fileID) {

    $("#SeminarInfoButton" + fileID).hide();
    $.getJSON(ServerURL + "Session/DeleteFile", {
        fileId: fileID
    }, function (result) {
        if (result.Status == true) {
            SelectedFileForDelete.remove();
        } else {
            //alert(result.Message);
            $("#SeminarInfoButton" + fileID).show();
        }
    });
}


function deleteVideos(fileID) {

    $("#SeminarInfoButton" + fileID).hide();
    $.getJSON(ServerURL + "Account/DeleteVideoFile", {
        fileID: fileID
    }, function (result) {
        if (result.Status == true) {
            SelectedVideoForDelete.remove();
        } else {
            //alert(result.Message);
            $("#SeminarInfoButton" + fileID).show();
        }
    });
}


var businessModel;

function SeminarWizard(step, isNext) {
    //alert(peymentMethod);
    if (peymentMethod == 1) {
        $("#PaymentForSomePlans").show();
    } else {
        $("#PaymentForSomePlans").hide();
    }
    //TODo : If isNext == true, Validation should be done
    //	alert("Call With : " + step + " Direction : " + isNext);
    var _hasError = false;
    if (isNext == true) {
        if (step == 6) {
            $("#NewSeminarAggrementError").hide();
            var _newSeminarIsIAgree = $("#NewSeminarIsIAgree").is(':checked');
            if (_newSeminarIsIAgree == false) {
                _hasError = true;
                $("#NewSeminarAggrementError").show();
            }
        } else if (step == 0) {

        } else if (step == 1) {
            var _seminarCapacityPredict = $("#NewSeminarCapacityPredict").val();
            var _seminarDurationPredict = $("#NewSeminarHourLength").val();
            if (peymentMethod == 1) {
                var customFee = $("#NewSeminarCustomFee").val();
                if (customFee == "") {
                    _hasError = true;
                    $("#NewSeminarCustomFeeError").show();
                    setTimeout(function () {
                        $("#NewSeminarCustomFeeError").hide();
                    }, 3000);
                }
            }
            if (_hasError == false) {

                $.ajax({
                    type: 'GET',
                    url: ServerURL + "Session/CalculateCost",
                    dataType: 'json',
                    success: function (result) {
                        if (result.Status == true) {

                            CustomAlert("کسر از شارژ", "شما برای ایجاد این سمینار به اعتبار " + result.Result + " ریال احتیاج دارید. درصورت ساخت این هزینه از حساب شما برداشته خواهد شد.", function () {
                            });

                            fee = result.Result;
                        } else if (result.Message.indexOf("charge") != -1) {
                            CustomAlert("کمبود شارژ", "شما برای ایجاد این سمینار به اعتبار " + result.Result + " ریال احتیاج دارید. لطفا حساب خود را شارژ کرده و دوباره تلاش نمایید.", function () {
                            });
                            fee = result.Result;
                            _hasError = true;
                        } else {
                            CustomAlert("خطا در برقراری ارتباط", result.Message, function () {
                            });
                            _hasError = true;
                        }
                    },
                    data: {
                        hours: _seminarDurationPredict,
                        number: _seminarCapacityPredict,
                        hasPostPaid: peymentMethod == 1 ? true : false
                    },
                    async: false
                });
            }
        } else if (step == 2) {
            var _seminarName = $("#NewSeminarName").val();
            var _seminarManager = "None";
            var _seminarPresentor = $("#NewSeminarPresentor").val();
            if (_seminarName == "") {
                _hasError = true;
                $("#NewSeminarNameError").show();
            } else $("#NewSeminarNameError").hide();
            // if (_seminarManager == "") {
            //	_hasError = true;
            //$("#NewSeminarManagerError").show();
            //} //else if(validEmail(_seminarManager) == false){
            //_hasError = true;
            //	$("#NewSeminarManagerError").show();
            //}
            //	else $("#NewSeminarManagerError").hide();
            if (_seminarPresentor == "") {
                _hasError = true;
                $("#NewSeminarPresentorError").show();
            } else if (validEmail(_seminarPresentor) == false) {
                _hasError = true;
                $("#NewSeminarPresentorError").show();
            } else $("#NewSeminarPresentorError").hide();
        } else if (step == 3) {
            var _seminarDescription = $("#NewSeminarDescription").val();
            var _seminarKeyWords = $("#NewSeminarKeyWords").val();
            if (_seminarKeyWords == "") {
                _hasError = true;
                $("#NewSeminarKeyWordsError").show();
            } else $("#NewSeminarKeyWordsError").hide();
        } else if (step == 4) {
            if(seminarType == 1) {
                var _seminarEndTime = $("#NewSeminarEndingHour").val();
                var _seminarBeginTime = $("#NewSeminarHeldingHour").val();
                var _seminarMonth = $("#NewSeminarDateMonth").val();
                var _seminarDay = $("#NewSeminarDateDay").val();
                var _seminarYear = $("#NewSeminarDateYear").val();
                var _seminarBaseTime = _seminarYear + ":" + _seminarMonth + ":" + _seminarDay;
                var _seminarBegin = _seminarBaseTime + ":" + _seminarBeginTime + ":00:00";
                var _seminarEnd = _seminarBaseTime + ":" + _seminarEndTime + ":00:00";
                var _firstDuration = $("#NewSeminarHourLength").val();
                //alert(_firstDuration);
                var _postDuration = _seminarEndTime - _seminarBeginTime;
                if (parseInt(_seminarEndTime) <= parseInt(_seminarBeginTime)) {
                    _hasError = true;
                    $("#NewSeminarEndingHourError").show();
                } else $("#NewSeminarEndingHourError").hide();

                if (_postDuration != _firstDuration) {
                    _hasError = true;
                    $("#NewSeminarDurationError").html('مدت سمینار شما نمیتواند بیشتر از ' + _firstDuration + ' ساعت باشد. ');
                    $("#NewSeminarDurationError").show();
                } else {
                    $("#NewSeminarDurationError").hide();
                }
                $.ajax({
                    type: 'GET',
                    url: ServerURL + "Session/CheckServerTime",
                    dataType: 'json',
                    success: function (result) {
                        if (result.Status == false) {
                            _hasError = true;
                            $("#NewSeminartimeExistError").show();
                            setTimeout(function () {
                                $("#NewSeminartimeExistError").hide();
                            }, 5000);
                        }
                    },
                    data: {
                        beginTime: _seminarBegin,
                        endTime: _seminarEnd
                    },
                    async: false
                });
            }
            else{
                _hasError = false;
            }
        }
    }


    if (isNext == false) {
        var currentWizard = step + 1;
        //alert("NewTerminalWizard"+currentWizard);
        //	alert("NewTerminalWizard"+step);
        $("#NewTerminalWizard" + currentWizard).hide();
        $("#NewTerminalWizard" + step).show();
    } else if (_hasError == false) {
        var currentWizard = step - 1;
        //alert (currentWizard);
        $("#NewTerminalWizard" + currentWizard).hide();
        $("#NewTerminalWizard" + step).show();
    }
}

function ReFetchVideo() {
    try {
        $("#SeminarMasterVideoPlayer").stop();
        $("#SeminarMasterVideoPlayer").load();
        $("#SeminarMasterVideoPlayer").play();
    } catch (exception) {
    }
}


function validEmail(v) {
    var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return (v.match(r) == null) ? false : true;
} // JavaScript Document

function GetUserName() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات حساب کاربری از سرور  ', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserName",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات حساب کاربری دریافت شد.', 1000, null);
            if (result.Status == true) {
                userName = result.user;
                $("#UserName").html(result.user);
            } else {
                window.location = "../index.htm";
            }
        },
        async: false
    });
}

function GetSeminarType() {
    //	NewSeminarType
}


function SearchForAccounts(page) {
    //	SearchUser(string keyword, int page, int pageSize)
    $("#FindPersonDialogTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });


    $("#FindPersonDialogTableNavigation").hide();
    $("#FindPersonDialogTableNavigationPrev").hide();
    $("#FindPersonDialogTableNavigationPrev").hide();

    var searchPhrase = $("#SearchPhrase").val();
    CurrentSearchAccountPage = page;

    if (searchPhrase == "") {
        alert("لطفا کلمه برای جستجو را وارد کنید.");
    } else {
        $.getJSON(ServerURL + "Account/AjaxSearchUser", {
            keyword: searchPhrase,
            index: page,
            pageSize: 8
        }, function (result) {
            if (result.Status == true) {
                //TODO : Static Page Size !!!
                //TODO : save Search result In cache
                if (result.Result.TotalCount <= 8) {
                    $("#FindPersonDialogTableNavigation").hide();
                } else {
                    $("#FindPersonDialogTableNavigation").show();
                    $("#FindPersonDialogTableNavigationNext").show();
                    $("#FindPersonDialogTableNavigationPrev").show();
                    if (page == 1) {
                        $("#FindPersonDialogTableNavigationPrev").hide();
                    } else if (page > 1 && result.Result.CurrentCount < 8) {
                        $("#FindPersonDialogTableNavigationPrev").show();
                        $("#FindPersonDialogTableNavigationNext").hide();
                    } else {
                        $("#FindPersonDialogTableNavigationPrev").show();
                        $("#FindPersonDialogTableNavigationNext").show();
                    }
                }
                for (var i = 0; i < result.Result.SearchResult.length; i++) {
                    var newRecord = "<tr style='cursor:pointer;' onclick='SeletectedUserAccount = " + '"' + result.Result.SearchResult[i].Email + '"' + ";SelectedUserFirstName = " + '"' + result.Result.SearchResult[i].FirstName + '"' + ";SelectedUserLastName =" + '"' + result.Result.SearchResult[i].LastName + '"' + ";SelectedUserMobile = " + '"' + result.Result.SearchResult[i].Mobile + '"' + ";SetMemberInviteTable();CloseFindPersonDialog();'>";


                    newRecord += "<td style='text-align:right;'>" + result.Result.SearchResult[i].Email + "</td>";
                    newRecord += "<td style='text-align:right;'>" + result.Result.SearchResult[i].FirstName + "</td>";
                    newRecord += "<td style='text-align:right;'>" + result.Result.SearchResult[i].LastName + "</td>";
                    newRecord += "<td style='text-align:right;'>" + result.Result.SearchResult[i].Mobile + "</td>";
                    newRecord += "</tr>";
                    $("#FindPersonDialogTable").append(newRecord);

                }


            } else {
                alert(result.Message);
            }
        });
    }
}

function SetMemberInviteTable() {
    $("#MemberInviteTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    var newRecord = "<tr style='cursor:pointer;'>";
    newRecord += "<td style='text-align:right;'>" + SeletectedUserAccount + "</td>";
    newRecord += "<td style='text-align:right;'>" + SelectedUserFirstName + "</td>";
    newRecord += "<td style='text-align:right;'>" + SelectedUserLastName + "</td>";
    newRecord += "<td style='text-align:right;'>" + SelectedUserMobile + "</td>";
    newRecord += "</tr>";
    $("#MemberInviteTable").append(newRecord);
}

function ClearMemberInviteTable() {
    $("#MemberInviteTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
}

function CloseFindPersonDialog() {
    $("#FindPersonDialogTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    $("#FindPersonDialog").modal('hide');
    var _properField = "#" + $("#SearchFor").val();
    $(_properField).val(SeletectedUserAccount);

}

function AcceptRequest(requestID) {
    //TODO : Call Accept Request Service
    //http://192.168.1.216:8080/Session/SetResultForRequest --> (requestId, result)
    //alert("Accept Request");
    $.getJSON(ServerURL + "Session/SetResultForRequest", {
            requestId: requestID,
            result: true
        },
        function (response) {
            if (response.Status == true) {
                $("#RequestLabel" + requestID).removeClass("label");
                $("#RequestLabel" + requestID).removeClass("label-warning");
                $("#RequestLabel" + requestID).addClass("label-success");
                $("#RequestLabel" + requestID).html("قبول شده");
            } else {
                //TODO : Response Of The Service is Not Ok
                alert(response.Message);
            }
        });
}

function RejectRequest(requestID) {
    //TODO : Call Reject Request Service
    //TODO : Call Accept Request Service
    //http://192.168.1.218:8080/Session/SetResultForRequest --> (requestId, result)
    $.getJSON(ServerURL + "Session/SetResultForRequest", {
            requestId: requestID,
            result: false
        },
        function (response) {
            if (response.Status == true) {
                //TODO : Response Of The Service Is OK
                //alert("Response Of The Service Is OK");
                $("#RequestLabel" + requestID).addClass("label");
                $("#RequestLabel" + requestID).removeClass("label-warning");
                $("#RequestLabel" + requestID).removeClass("label-success");
                $("#RequestLabel" + requestID).html("رد شده");

            } else {
                //TODO : Response Of The Service is Not Ok
                alert(response.Message);
            }
        });
}

function RejectQuestion(messageID) {
    var id = "#Chat" + messageID;
    var btnID = "#ChatReject" + messageID;
    var btnID2 = "#ChatAnswer" + messageID;
    //RejectQuestion(int questionID, string userName)
    $.getJSON(ServerURL + "Session/RejectQuestion", {
        questionID: messageID,
        userName: userName
    }, function (result) {
        $(id).removeClass("alert-info");
        $(id).addClass("alert-error");
        $(btnID).fadeOut(1000);
        $(btnID2).fadeOut(1000);
    });

}

function PublishQuestion(messageID) {
    var id = "#Chat" + messageID;
    var btnID = "#ChatReject" + messageID;
    var btnID2 = "#ChatAnswer" + messageID;
    //AcceptQuestion(int questionID, string userName)
    $.getJSON(ServerURL + "Session/AcceptQuestion", {
        questionID: messageID,
        userName: userName
    }, function (result) {
        $(id).removeClass("alert-info");
        $(id).addClass("alert-success");
        $(btnID).fadeOut(1000);
        $(btnID2).fadeOut(1000);
    });

}

function ChatBoardUpdateHandler(seminarID) {
    clearInterval(chatBoardUpdaterID);
    $.getJSON(ServerURL + "Session/RecieveMessage", {
        sessionId: seminarID,
        chatId: LastMessageId
    }, function (result) {
        if (result.Status == true) {
            for (var i = 0; i < result.Result.length; i++) {
                var msg = result.Result[i].time + " : " + result.Result[i].userName + " : " + result.Result[i].message;
                var colorify;
                var hasIcon = false;
                if (result.Result[i].status == 3) {
                    colorify = "alert-error";
                } else if (result.Result[i].status == 2) {
                    colorify = "alert-success";
                } else {
                    colorify = "alert-info";
                    hasIcon = true;
                }

                var newMessage = '<div class="alert ' + colorify + '" id=Chat' + result.Result[i].id + '>';
                if (hasIcon == true) {
                    newMessage += '<div id=ChatAnswer' + result.Result[i].id + ' class="btn btn-round" data-rel="popover" data-content="با زدن این دکمه سوال پرسیده شده به همه اعلام میشود." title="تایید سوال"><img src="img/correct.png" style="width:16px;height:16px;" onclick="PublishQuestion(' + result.Result[i].id + ');" /></div>';

                    newMessage += '<div id=ChatReject' + result.Result[i].id + ' class="btn btn-round" data-rel="popover" data-content="با زدن این دکمه سوال پرسیده شده به همه اعلام میشود." title="تایید سوال"><img src="img/cancel.png" style="width:16px;height:16px;" onclick="RejectQuestion(' + result.Result[i].id + ');" /></div>';

                }

                newMessage += '<h4  style="font-family:tahoma;direction:rtl;" class="alert-heading">' + result.Result[i].userName + ' گفت : </h4>\
							<p style="font-family:tahoma;direction:rtl;">' + result.Result[i].message + '</p>\
						</div>';
                $("#SeminarChatBoard").append(newMessage);


                $('#SeminarChatBoard').stop().animate({
                    scrollTop: $("#SeminarChatBoard")[0].scrollHeight
                }, 800);

                LastMessageId = result.Result[i].id;
            }
        } else {
            alert(result.Message);
        }

        chatBoardUpdaterID = setInterval(function () {
            ChatBoardUpdateHandler(seminarID);
        }, 1000);

    });
}

function ChatBoardUpdater(seminarID) {
    $("#SeminarChatBoard").html("");
    chatBoardUpdaterID = setInterval(function () {
        ChatBoardUpdateHandler(seminarID);
    }, 1000);
}

function ExitFromSeminar() {
    var contentPlayer = document.getElementById("SeminarMasterVideoPlayer");
    contentPlayer.src = "";
    contentPlayer.play();
    //var masterPlayer = document.getElementById("SeminarMasterContentPlayer");
    //masterPlayer.src = "";
    //masterPlayer.play();
    clearInterval(chatBoardUpdaterID);
    ShowControlPanel(true);
}

function SendMessageViaKeyboard(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        SendQuestionToMaster();
    }
}

function SendQuestionToMaster() {
    //Send Question To Master
    //<div style="width:80px;display:none;" >در حال ارسال</div>
    $("#WaitForMakeQuestion").html("در حال ارسال");
    $("#SendQuestionButton").hide();
    $("#WaitForMakeQuestion").show();

    if (userName != "") {
        var message = $("#SeminarChatMessage").val();
        $.getJSON(ServerURL + "Session/SendMessage", {
            sessionId: CurrentSeminarID,
            message: message,
            userName: userName
        }, function (result) {
            if (result.Status == true) {
                //alert("پیام شما ارسال شد");
                $("#WaitForMakeQuestion").html("سوال ارسال شد");
                $("#SeminarChatMessage").val(" ");
                setTimeout(function () {
                    $("#SendQuestionButton").show();
                    $("#WaitForMakeQuestion").hide();

                }, 5000);
            } else {
                $("#WaitForMakeQuestion").html("با خطا روبرو شد");
                setTimeout(function () {
                    $("#SendQuestionButton").show();
                    $("#WaitForMakeQuestion").hide();
                }, 5000);
            }
        });
    }
}


function InviteToSeminar(seminarID) {
    //TODO : Invite To Seminar and show in table
    $("#InviteUserFormSesionID").val(seminarID);
    $('#EditInviteModalType').val('AddSpatial');
    $('#InviteUserForm').modal('show');

}

function ReInviteUser(inviteId) {
    CustomBlockingPanel('توجه', 'در حال ارسال دعوتنامه', -1, null);
    $.getJSON(ServerURL + "Session/ReInviteUser", {
        inviteId: inviteId,
    }, function (result) {
        if (result.Status == true) {
            //alert("پیام شما ارسال شد");
            CustomBlockingPanel('توجه', 'دعوتنامه ارسال شد', 2000, null);
        } else {
            var msg = '<p style="font-family:tahoma;">دعوتنامه ارسال نشد.</p>';
            msg += '<p>' + result.Message + '</p>'
            CustomBlockingPanel('خطا', msg, 5000, null);
        }
    });
}

function SaveSeminarDesc(seminarId) {
    //EditSessionDesc(int sessionId, string desc, string why, string forWho, string level)
    CustomBlockingPanel('توجه', 'در حال ذخیره سازی اطلاعات', -1, null);
    var postData = {
        sessionId: seminarId,
        desc: $("#SeminarMoreInfoDesc").val(),
        why: $("#SeminarMoreInfoWhy").val(),
        forWho: $("#SeminarMoreInfoFor").val(),
        level: $("#SeminarMoreInfoPre").val()
    };
    $.ajax({
        type: 'POST',
        url: ServerURL + "Session/EditSessionDesc",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                CustomBlockingPanel('توجه', 'اطلاعات توصیفی سمینار ذخیره شد.', 3000, null);
            } else {
                CustomBlockingPanel('خطا', result.Message, 3000, null);
            }
        },
        data: postData,
        async: true
    });
}

function GetMoreSeminarInformation(seminarID) {
    //TODO : Get More Information About Seminars
    //Get Invited Users
    //http://192.168.1.218:8080/Session/ViewSeminarInvitations --> (Result --> {userFirstName, userLastName, email, inviteDate})
    //$("#SeminarDetailsInvited").show();
    //$("#SeminarDetailsRequested").show();

    CurrentSeminarID = seminarID;
    $("#SeminarMoreInfo").show();


    $("#SeminarDetailsInvitedTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    $("#SeminarInfoFiles tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    //SeminarDetailsRequestedTable
    $("#SeminarDetailsRequestedTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    $("#SeminarMoreInfoID").html("");
    $("#SeminarMoreInfoName").html("");
    $("#SeminarMoreInfoAdmin").html("");
    $("#SeminarMoreInfoPresentor").html("");
    $("#SeminarMoreInfoDate").html("");
    $("#SeminarMoreInfoStatus").html("");


    $.getJSON(ServerURL + "Session/SessionSearchByID", {
            sessionId: seminarID
        },
        function (response) {
            if (response.Status == true) {
                var CurrentSeminar = {
                    m_seminarID: response.Result.id,
                    m_seminarName: response.Result.name,
                    m_seminarPresentorName: response.Result.presentor,
                    m_seminarBeginTime: response.mode == 1 ? GetPrsianDate(response.Result.beginTime) : response.Result.beginTime,
                    m_seminarDuration: response.Result.duration,
                    m_seminarStatus: response.Result.status,
                    m_seminarDesc: response.Result.description,
                    m_seminarCapacity: response.Result.capacity,
                    m_seminarAdminID: response.Result.adminUserName,
                    m_seminarPresentorId: response.Result.presentorUserName,
                    m_primaryContent: response.Result.primaryContent,
                    m_poster: response.Result.poster,
                    m_seminarWhy: response.Result.why,
                    m_seminarFor: response.Result.forWho,
                    m_seminarLevel: response.Result.level
                }

                SeminarPrimaryContent = CurrentSeminar.m_primaryContent;

                $("#SeminarMoreInfoID").html(CurrentSeminar.m_seminarID);
                $("#SeminarMoreInfoName").html(CurrentSeminar.m_seminarName);
                $("#SeminarMoreInfoAdmin").html(CurrentSeminar.m_seminarAdminID);
                $("#SeminarMoreInfoPresentor").html(CurrentSeminar.m_seminarPresentorName);
                $("#SeminarMoreInfoDate").html(CurrentSeminar.m_seminarBeginTime);
                $("#SeminarMoreInfoStatus").html(CurrentSeminar.m_seminarStatus);
                $("#SeminarMoreInfoDesc").html(CurrentSeminar.m_seminarDesc);
                $("#SeminarMoreInfoWhy").html(CurrentSeminar.m_seminarWhy);
                $("#SeminarMoreInfoFor").html(CurrentSeminar.m_seminarFor);
                $("#SeminarMoreInfoPre").html(CurrentSeminar.m_seminarLevel);


                var saveBtn = "<button class='btn btn-large btn-primary' onclick='SaveSeminarDesc(" + CurrentSeminar.m_seminarID + ");'>ذخیره سازی اطلاعات عمومی سمینار</button>";
                $("#SeminarMoreInfoSaveDesc").html(saveBtn);


                document.getElementById('posterPreviewInfo').src = "../ServerSide/" + CurrentSeminar.m_poster;
                var addBtn = "<button class='btn btn-large btn-primary' onclick='InviteToSeminar(" + CurrentSeminar.m_seminarID + ");'>دعوت جدید</button>";
                $("#SeminarMoreInfoAddInvite").html(addBtn);


            } else {
                alert(result.Message);
            }
        });


    var _InviteList = [];
    $.getJSON(ServerURL + "Session/ViewSeminarInvitations", {
        sessionId: seminarID
    }, function (response) {
        if (response.Status == true) {
            for (var i = 0; i < response.Result.length; i++) {
                var _newInvitedUser = {
                    m_inviteID: response.Result[i].inviteId,
                    m_firstName: response.Result[i].userFirstName,
                    m_lastName: response.Result[i].userLastName,
                    m_email: response.Result[i].email,
                    m_invitedDate: GetPrsianDate(response.Result[i].inviteDate),
                    m_isVod: response.Result[i].isVod
                };
                _InviteList.push(_newInvitedUser);
                //Table : SeminarDetailsInvitedTable
                var newRow = '<tr><td><center>' + _newInvitedUser.m_inviteID + '</center></td>';
                newRow += '<td><center>' + _newInvitedUser.m_firstName + '</center></td>';
                newRow += '<td><center>' + _newInvitedUser.m_lastName + '</center></td>';
                newRow += '<td><center>' + _newInvitedUser.m_email + '</center></td>';
                newRow += '<td><center>' + _newInvitedUser.m_invitedDate + '</center></td>';
                newRow += '<td style="width:100px;"><center>' + '<div title="برای ارسال مجدد دعوتنامه کلیک کنید" data-rel="tooltip"  class="btn btn-success" onclick="ReInviteUser(' + _newInvitedUser.m_inviteID + ');">ارسال مجدد دعوتنامه</div>' + '</center></td>';


                newRow += '</tr>';
                $('#SeminarDetailsInvitedTable').append(newRow);
            }
        } else {
            alert(response.Message);
        }
    });
    //Get Reuqeuested Users
    //http://192.168.1.218:8080/Session/ViewSeminarRequests --> (Result --> {userName, userFirstName, userLastName, email, result, requestDate})
    var _RequestList = [];
    $.getJSON(ServerURL + "Session/ViewSeminarRequests", {
        sessionId: seminarID
    }, function (response) {
        if (response.Status == true) {
            for (var i = 0; i < response.Result.length; i++) {
                var _newRequestedUser = {
                    m_requestID: response.Result[i].requestId,
                    m_firstName: response.Result[i].userFirstName,
                    m_lastName: response.Result[i].userLastName,
                    m_email: response.Result[i].email,
                    m_requestDate: GetPrsianDate(response.Result[i].requestDate),
                    m_result: response.Result[i].result,
                    m_isVod: response.Result[i].isVod
                };
                _RequestList.push(_newRequestedUser);
                //Table : SeminarDetailsInvitedTable
                var newRow = '<tr><td><center>' + _newRequestedUser.m_requestID + '</center></td>';
                newRow += '<td><center>' + _newRequestedUser.m_firstName + '</center></td>';
                newRow += '<td><center>' + _newRequestedUser.m_lastName + '</center></td>';
                newRow += '<td><center>' + _newRequestedUser.m_email + '</center></td>';
                newRow += '<td><center>' + _newRequestedUser.m_requestDate + '</center></td>';

                if (_newRequestedUser.m_result.indexOf('Not Seen') != -1) {
                    newRow += '<td><center><span id="RequestLabel' + _newRequestedUser.m_requestID + '" class="label label-warning">بررسی نشده</span></center></td>';
                    newRow += '<td><button class="btn btn-success" onclick="AcceptRequest(' + _newRequestedUser.m_requestID + ');"><i class="icon-trash icon-white"></i>تایید</button><button class="btn btn-danger" onclick="RejectRequest(' + _newRequestedUser.m_requestID + ');"><i class="icon-trash icon-white"></i>رد</button></td>';
                } else if (_newRequestedUser.m_result.indexOf('Accepted') != -1) {
                    newRow += '<td><center><span id="RequestLabel' + _newRequestedUser.m_requestID + '" class="label label-success">قبول شده</span></center></td>';
                    newRow += '<td></td>'; //'<td><button class="btn btn-danger" onclick="RejectRequest('+_newRequestedUser.m_requestID+');"><i class="icon-trash icon-white"></i>رد</button></td>';
                } else if (_newRequestedUser.m_result.indexOf('Rejected') != -1) {
                    newRow += '<td><center><span id="RequestLabel' + _newRequestedUser.m_requestID + '" class="label label">رد شده</span></center></td>';
                    newRow += '<td><button class="btn btn-success" onclick="AcceptRequest(' + _newRequestedUser.m_requestID + ');"><i class="icon-trash icon-white"></i>تایید</button></td>';
                }

                newRow += '</tr>';
                $('#SeminarDetailsRequestedTable').append(newRow);
            }
            //Get File List
            GetListOfSessionFilesForSeminarInfo(seminarID);

        } else {
            alert(response.Message);
        }
    });


    //Managed Files
}

function ClearTableRows(argTable) {
    $(argTable).each(function () {
        this.parentNode.removeChild(this);
    });
}

function IsExistSminarInList(id) {
    for (var x = 0; x < MySeminars.length; x++) {
        if (MySeminars[x].m_seminarID == id)
            return true;
    }
    return false;
}


var SeminarServiceList = [];

function GetListOfSessionFilesForSeminar(sessionID) {
    $.getJSON(ServerURL + "Session/ShowFiles", {
        sessionId: sessionID,
        fileId: index
    }, function (result) {
        if (result.Status == true) {

            for (var i = 0; i < result.Result.length; i++) {

                var names = result.Result[i].fileUrl.split("/");
                var name = names[names.length - 1];
                var extensions = name.split(".");
                var extension = extensions[extensions.length - 1];
                index = result.Result[i].fileId;
                var n = result.Result[i].fileUrl.replace("~/", ServerURL);

                //alert(extension);
                //   var newRow  = "<tr>";
                //	newRow += "<td style='text-align:center;'>" + result.Result[i].fileId + "</td>";
                //	newRow += "<td style='text-align:center;'>" + result.Result[i].fileUrl + "</td>";
                //	newRow += "<td style='text-align:center;'>" + result.Result[i].fileSize + "</td>";
                //	table.append(newRow);

                //Last Version // as explorere
                //	 var newFile = '<div style="height:80px;width:80px;float:right;cursor:pointer;">';
                //	 newFile += '<table>';
                //	 if(extension == "pdf")
                //	 	newFile += '<tr><td><img src="img/pdf.png" style="width:50px; height:50px;"/> </td></tr>';
                //	 else  if(extension == "doc" || extension == "docx")
                //	 	newFile += '<tr><td><img src="img/doc.png" style="width:50px; height:50px;"/> </td></tr>';
                ///	 else  if(extension == "ppt" || extension == "pptx")
                //	 	newFile += '<tr><td><img src="img/ppt.png" style="width:50px; height:50px;"/> </td></tr>';
                //	 else if(extension == "wmv")
                //	 	newFile += '<tr><td><img src="img/mov.png" style="width:50px; height:50px;"/> </td></tr>';
                //	else if(extension == "mov")
                //	 	newFile += '<tr><td><img src="img/mov.png" style="width:50px; height:50px;"/> </td></tr>';
                //	else if(extension == "avi")
                //	 	newFile += '<tr><td><img src="img/avi.png" style="width:50px; height:50px;"/> </td></tr>';
                //	 newFile += '<tr><td><a target="_blank" href="' + n + '">' + name + '</a></td></tr>';
                //	 newFile += '</table>';
                //	 newFile += '</div>';
                //	 $("#SeminarFilesExplorer").append(newFile);

                var newRow = "<tr>";
                //newRow += "<td style='text-align:center;'>" + result.Result[i].fileId + "</td>";
                //newRow += "<td style='text-align:center;'>" + result.Result[i].fileUrl + "</td>";
                newRow += "<td style='text-align:center;'>" + result.Result[i].fileSize + "</td>";
                newRow += '<td style="text-align:center;"><a rel="nofollow" onclick="$(' + "'#SeminarResourcesDialog').modal(" + "'hide'" + ');" ' + 'href="' + n + '">' + name + '</a></td></tr>';
                $("#SeminarFilesExplorerTable").append(newRow);

            }
            setTimeout(function () {
                GetListOfSessionFilesForSeminarInfo(sessionID);
            }, 1000);
        } else {
            //alert(result.Message);
            index = -1;
        }
    });
}


function GoToSeminar(seminarID) {
    //Get The Seminar Information
    if (version == 2) {
        window.scrollTo(0, 0);
        CurrentSeminarID = seminarID;
        LastMessageId = -1;
        $.getJSON(ServerURL + "Session/SessionSearchByID", {
                sessionId: seminarID
            },
            function (response) {
                if (response.Status == true) {
                    window.location = "SeminarRoom/room.html?WebinarID=" + seminarID;
                } else {
                    //TODO : Error
                    alert("2" + response.Message);
                }
            });
    } else if (version == 1) {

        window.scrollTo(0, 0);
        CurrentSeminarID = seminarID;
        LastMessageId = -1;
        $.getJSON(ServerURL + "Session/SessionSearchByID", {
                sessionId: seminarID
            },
            function (response) {
                if (response.Status == true) {




                    //Set The Fields
                    //Field Sets : 
                    //Get Seminar Services Lists
                    //SeminarInformationName
                    //SeminarInformationPresentor
                    //SeminarInformationCapacity
                    //SeminarInformationTime
                    //SeminarInformationDesc
                    //Response Fields
                    var CurrentSeminar = {
                        m_seminarID: response.Result.id,
                        m_seminarName: response.Result.name,
                        m_seminarPresentorName: response.Result.presentor,
                        m_seminarBeginTime: response.Result.beginTime,
                        m_seminarDuration: response.Result.duration,
                        m_seminarStatus: response.Result.status,
                        m_seminarDesc: response.Result.description,
                        m_seminarCapacity: response.Result.capacity,
                        m_seminarAdminID: response.Result.adminUserName,
                        m_seminarPresentorId: response.Result.presentorUserName
                    }
                    $("#SeminarInformationName").html(CurrentSeminar.m_seminarName);
                    $("#SeminarInformationPresentor").html(CurrentSeminar.m_seminarPresentorName);
                    $("#SeminarInformationDesc").html(CurrentSeminar.m_seminarDesc);
                    $("#SeminarInformationTime").html(CurrentSeminar.m_seminarBeginTime);
                    $("#SeminarInformationCapacity").html(CurrentSeminar.m_seminarCapacity);

                    //Is Admind Or Presento
                    //if(userName == CurrentSeminar.m_seminarAdminID || userName == CurrentSeminar.m_seminarPresentorId){
                    //Get Session Chats

                    ChatBoardUpdater(CurrentSeminar.m_seminarID);
                    //}
                    //Get List Of Files
                    // id="SeminarFilesExplorer"
                    //$("#SeminarFilesExplorerTable").empty();
                    $("#SeminarFilesExplorerTable tbody tr").each(function () {
                        this.parentNode.removeChild(this);
                    });
                    GetListOfSessionFilesForSeminar(seminarID);


                    //End Of Files
                    //Get The Session Service Information

                    $.getJSON(ServerURL + "Session/GetUrlServiceForUser", {
                            sessionId: seminarID,
                            userName: userName
                        },
                        function (response) {
                            if (response.Status == true) {
                                var lower;
                                var tmpBandwidth = 214748;
                                var hasContent = false;
                                var minBandContent = 214748;
                                var defaultContent;
                                for (var j = 0; j < response.Result.length; j++) {
                                    var serviceIno = {
                                        m_url: response.Result[j].url,
                                        m_codec: response.Result[j].codec,
                                        m_bandwidth: response.Result[j].bitRate,
                                        m_serviceType: response.Result[j].serviceType
                                    };

                                    if (serviceIno.m_serviceType.indexOf("Content") != -1) {
                                        if (minBandContent > serviceIno.m_bandwidth) {
                                            minBandContent = serviceIno.m_bandwidth;
                                            defaultContent = serviceIno;
                                        }
                                        hasContent = true;
                                    } else if (serviceIno.m_serviceType.indexOf("VoiceOnly") == -1) {
                                        if (tmpBandwidth > serviceIno.m_bandwidth) {
                                            tmpBandwidth = serviceIno.m_bandwidth;
                                            lower = serviceIno;
                                        }
                                    }
                                    SeminarServiceList.push(serviceIno);
                                }
                                //Todo : Set Primitivve forms to user for select configs
                                //Load Master Videos
                                var seminarVideo = document.getElementById("SeminarMasterVideoPlayer");
                                seminarVideo.src = lower.m_url; //"http://94.232.174.204:7700/shahrokhi@13910929.ogg";//lower.m_url;
                                $("#SeminarMasterVideoBandwidth").html(lower.m_bandwidth + " کیلو بیت در ثانیه ");
                                $("#SeminarMasterVideoCodec").html(lower.m_codec);
                                seminarVideo.load();
                                seminarVideo.play();
                                //Load Content Video
                                if (hasContent == true) {
                                    /*	$("#SeminarMasterContent").show();
                                     var seminarContent = document.getElementById("SeminarMasterContentPlayer");
                                     seminarContent.src = defaultContent.m_url;
                                     $("#SeminarContentVideoBandwidth").html(defaultContent.m_bandwidth + " کیلو بیت در ثانیه ");
                                     $("#SeminarContentVideoCodec").html(defaultContent.m_codec);
                                     seminarContent.load();
                                     seminarContent.play();*/
                                    CurrentSlidePage = 1;
                                    var imageSrc = ServerURL + "Seminars/" + seminarID + "/PowerPoint/" + CurrentSlidePage + ".png";
                                    $("#SeminarMasterContentImage").attr(
                                        'src',
                                        imageSrc
                                    );
                                    $("#SeminarMasterContent").show();

                                    ShowSlide(1);
                                } else {
                                    $("#SeminarMasterContent").hide();
                                }

                                //Tell The Server That I AM here

                                SetMyAvailability(seminarID, userName, 0);
                                //Show Seminar Information
                                ShowControlPanel(true);
                            } else {
                                //TODO : Show Error Message that tel me there is not any access rule for seminar
                                alert("1" + response.Message);
                            }
                        });

                    //TODO : Calculate Remaining Time And Calculate Remaining Capacity
                } else {
                    //TODO : Error
                    alert("2" + response.Message);
                }
            }
        );
    }
}


function SetMyAvailability(_seminarID, _userName, ttl) {
    if (ttl < 10) {
        $.getJSON(ServerURL + "Session/SetUserInSession", {
            userName: _userName,
            sessionId: _seminarID
        }, function (result) {
            if (result.Status != true) {
                SetMyAvailability(_seminarID, _userName, ttl + 1);
                //						alert(result.Message);
            } else {
                //					alert(result.Message);
            }
        });
    }
}


function ShowSlide(slideNumber) {

    var numberOfSlide = -1;
    $.ajax({
        type: 'GET',
        url: ServerURL + "Session/GetNumberOfSessionSlides",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                numberOfSlide = result.Result;
            } else {
                alert(result.Message);
            }
        },
        data: {
            seminarId: CurrentSeminarID
        },
        async: false
    });

    if (slideNumber <= numberOfSlide && slideNumber > 0) {
        CurrentSlidePage = slideNumber;
        var imageSrc = ServerURL + "Seminars/" + CurrentSeminarID + "/PowerPoint/" + slideNumber + ".png";
        $("#SeminarMasterContentImage").attr(
            'src',
            imageSrc
        );
        $("#SeminarMasterContentPageNumber").html(slideNumber + "/" + numberOfSlide);
    }
}

function SaveMasterVideo() {
    //TODO : sometimes there is not physiscal server for some settings 
    //	alert("CP0");
    var bandwidth = $("input:radio[name=optionsRadiosBandwidth]:checked").val();
    //	alert(bandwidth);
    var codec = $("input:radio[name=optionsRadiosCodec]:checked").val();
    //alert(codec);
    var media = $("input:radio[name=optionsRadiosMedia]:checked").val();
    //alert(media);
    if (media.indexOf("Voice") == -1) {
        //alert(SeminarServiceList.length);
        for (var j = 0; j < SeminarServiceList.length; j++) {
            //alert("CP2");
            if (SeminarServiceList[j].m_serviceType.indexOf("Content") == -1 && SeminarServiceList[j].m_serviceType.indexOf("VoiceOnly") == -1) {
                //alert(SeminarServiceList[j].m_codec);
                if (SeminarServiceList[j].m_codec.indexOf(codec) != -1) {
                    //alert(SeminarServiceList[j].m_bandwidth);
                    if (SeminarServiceList[j].m_bandwidth == bandwidth) {
                        //alert("CP5");
                        var player = document.getElementById("SeminarMasterVideoPlayer");
                        //player.stop();
                        player.src = SeminarServiceList[j].m_url;
                        //player.load();
                        //TODO : Workd With Video API

                        player.play();
                        $("#SeminarMasterVideoBandwidth").html(bandwidth + " کیلو بیت در ثانیه");
                        $("#SeminarMasterVideoCodec").html(codec);
                        $("#MasterVideoSettingDialog").modal('hide');
                        break;
                    }
                }
            }
        }
        $("#MasterVideoSettingDialog").modal('hide');
    } else {
        //	alert("Voice Only");
        for (var j = 0; j < SeminarServiceList.length; j++) {
            //	alert(SeminarServiceList[j].m_serviceType);
            if (SeminarServiceList[j].m_serviceType.indexOf("MasterVoiceOnly") != -1) {
                var player = document.getElementById("SeminarMasterVideoPlayer");
                //player.stop();
                player.src = SeminarServiceList[j].m_url;
                //player.load();
                player.play();
                $("#SeminarMasterVideoPlayer").attr("poster", "../images/Audio_Icon.jpg");
                $("#SeminarMasterVideoBandwidth").html("16" + " کیلو بیت در ثانیه");
                $("#SeminarMasterVideoCodec").html("فقط صدا");
                $("#MasterVideoSettingDialog").modal('hide');
                break;
            }
        }
    }
}

function SaveContentSettings() {
    //TODO : sometimes there is not physiscal server for some settings 
    var bandwidth = $("input:radio[name=ContentOptionsRadiosBandwidth]:checked").val();
    var codec = $("input:radio[name=ContentOptionsRadiosCodec]:checked").val();
    var withContent = $("input:checkbox[id=MasterContentIsPlay]:checked").val();
    if (withContent == null) {
        withContent = "off";
    }
    if (withContent == "on") {
        for (var j = 0; j < SeminarServiceList; j++) {
            if (SeminarServiceList[j].m_serviceType.indexOf("Content") != -1) {
                if (SeminarServiceList[j].m_codec.indexOf(codec) != -1) {
                    if (SeminarServiceList[j].m_bandwidth == bandwidth) {
                        var player = document.getElementById("SeminarMasterContentPlayer");
                        //player.stop();
                        player.src = SeminarServiceList[j].m_url;
                        //player.load();
                        player.play();
                        $("#SeminarContentVideoBandwidth").html(bandwidth + " کیلو بیت در ثانیه");
                        $("#SeminarContentVideoCodec").html(codec);
                        $("#MasterVideoContentSettingDialog").modal('hide');
                    }
                }
            }
        }
    } else {
        var player = document.getElementById("SeminarMasterContentPlayer");
        player.stop();
        player.src = "";
        $("#SeminarContentVideoBandwidth").html("");
        $("#SeminarContentVideoCodec").html("");
        $("#MasterVideoContentSettingDialog").modal('hide');
    }
}


function ShowControlPanel(isControlPanel) {
    if (isControlPanel == true) {
        $("#SeminarMode").hide();
        $("#ControlPanelMode").show();
    } else {
        $("#SeminarMode").show();
        $("#ControlPanelMode").hide();

    }
}

function PayForSeminar(seminarID, fee, requestID) {

    CustomAlert("پرداخت هزینه ثبت نام", "شما برای پرداخت به " + fee + " تومان احتیاج دارید و این مبلغ از اعتبار شما کاسته میشود. ", function () {
        $.ajax({
            type: 'GET',
            url: ServerURL + "Session/PayForSeminar",
            dataType: 'Json',
            success: function (result) {
                $("div[name=PanelWindow]").hide();
                if (result.Status == true) {
                    var message = "";
                    message += "<div style='font-family:tahoma;text-align:right; font-size:12px;color:blue;'>"
                    message += "اعتبار شما قبل از پرداخت : " + result.Result.LastBalance;
                    message += "<br/>";
                    message += "مبلغ پرداخت شده : " + result.Result.Fee;
                    message += "<br/>";
                    message += "اعتبار باقی مانده :" + result.Result.Balance;
                    message += "</div>";
                    CustomAlert("پرداخت با موفقیت انجام شد ", message, null);
                    $("#UpUserBalance_Balance").html('اعتبار شما ' + result.Result.Balance + 'ریال');
                } else {
                    var msg = result.Result.Message;
                    var res = "";
                    if (msg.indexOf("no session") != -1) {
                        res = "جلسه ای با این شناسه وجود ندارد";
                    } else if (msg.indexOf("Seminar is full") != -1) {
                        res = "ظرفیت سمینار پر شده است";
                    } else if (msg.indexOf("seminar is free") != -1) {
                        res = "این سمینار رایگان بوده و نیازی به پرداخت ندارد";
                    } else if (msg.indexOf("no profile") != -1) {
                        res = "لطفا پروفایل خود را تکمیل کرده و حساب خود را شارژ کنید.";
                    } else if (msg.indexOf("not sufficient") != -1) {
                        res = "لطف حساب خود را شارژ کنید.";
                    } else {
                        res = msg;
                    }
                    CustomAlert("خطا در پرداخت", res, null);
                }
            },
            data: {
                sessionId: seminarID,
                requestID: requestID
            },
            async: true
        });
    });
}

function GetMyRequests() {
    //TODO : Get My Request
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    ClearTableRows("#MyRequestedSeminarsTable tbody tr");
    ShowBox("#MyRequestedSeminars");
    if (!(userName == null || userName == "")) {
        $.getJSON(ServerURL + "Session/ViewRequests", {
            userName: userName
        }, function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
            if (result.Status == true) {
                for (var j = 0; j < result.Result.length; j++) {
                    var _session = {
                        m_seminarID: result.Result[j].sessionId,
                        m_seminarName: result.Result[j].sessionName,
                        m_seminarPresentorName: result.Result[j].presentorUserName == userName ? 'خودم' : result.Result[j].presentorLastName,
                        m_seminarBeginTime: GetPrsianDate(result.Result[j].beginTime),
                        m_seminarDuration: result.Result[j].duration,
                        m_seminarStatus: result.Result[j].status,
                        m_seminarsAdmin: result.Result[j].adminUserName == userName ? 'خودم' : result.Result[j].adminLastName,
                        m_requestResult: result.Result[j].result,
                        m_isVod: result.Result[j].isVod,
                        m_fee: result.Result[j].fee,
                        m_isPayed: result.Result[j].isPayed,
                        m_requestID: result.Result[j].requestID
                    };
                    //MySeminars.push(_session);
                    // Table : OwnedSeminarsTable
                    //<tr>
                    //	<th>شماره سمینار</th>
                    //	<th>نام سمینار</th>
                    //	<th>مدیر</th>
                    //	<th>ارائه دهنده</th>
                    //	<th>تاریخ برگزاری</th>
                    //	<th>مدت (ساعت)</th>
                    //  <th>وضعیت</th>
                    //  <th></th>
                    //</tr>
                    var newRow = '<tr><td><center>' + _session.m_seminarID + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarsAdmin + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarPresentorName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarBeginTime + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarDuration + ' ساعت' + '</center></td>';


                    var fee = _session.m_fee == -1 ? 'رایگان' : (_session.m_fee + ' ریال ');
                    newRow += '<td><center>' + fee + '</center></td>';

                    if (_session.m_seminarStatus.indexOf('Scheduled') != -1) {
                        newRow += '<td><center>' + '<span class="label label-warning">زمان بندی شده</span>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Open') != -1) {
                        newRow += '<td><center>' + '<span class="label label-success">در حال اجرا</span>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Banned') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">ممنوع شده</span>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Closed') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important"> برگزارشده</span>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Canceled') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">لغو شده</span>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Full') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">ظرفیت تکمیل</span>' + '</center></td>';
                    }
                    //if(_session.m_isVod){
                    //	newRow += '<td><center>' +  "ضبط شده" + '</center></td>';			  
                    //  }
                    //else{
                    //newRow += '<td><center>' + "زنده"+ '</center></td>';
                    //}
                    if (_session.m_requestResult.indexOf('Not Seen') != -1) {
                        newRow += '<td><center>' + '<span class="label label-warning">بررسی نشده</span>' + '</center></td>';
                    } else if (_session.m_requestResult.indexOf('Accepted') != -1) {
                        if (_session.m_fee != -1) {
                            if (_session.m_isPayed == false) {
                                newRow += '<td><center>' + '<span class="label label-important">در انتظار پرداخت</span>' + '</center></td>';
                            } else {
                                newRow += '<td><center>' + '<span class="label label-success">پذیرفته و پرداخت شده</span>' + '</center></td>';
                            }
                        } else {
                            newRow += '<td><center>' + '<span class="label label-success">پذیرفته شده</span>' + '</center></td>';
                        }
                    } else if (_session.m_requestResult.indexOf('Rejected') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">رد شده</span>' + '</center></td>';
                    }

                    if ((_session.m_seminarStatus.indexOf('Open') != -1 || _session.m_seminarStatus.indexOf('Scheduled') != -1 || _session.m_seminarStatus.indexOf('Closed') != -1) && _session.m_fee != -1 && _session.m_isPayed == false && _session.m_requestResult.indexOf('Accepted') != -1) {
                        newRow += '<td style="width:100px;"><center>' + '<div  title="برای پرداخت کلیک کنید." data-rel="tooltip" class="btn btn-warning" onclick="PayForSeminar(' + _session.m_seminarID + ',' + _session.m_fee + ',' + _session.m_requestID + ');">پرداخت هزینه جلسه</div>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Open') != -1 && _session.m_requestResult.indexOf('Accepted') != -1) {
                        newRow += '<td style="width:100px;"><center>' + '<div  title="برای ورورد به سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GoToSeminar(' + _session.m_seminarID + ');">ورود به سمینار</div>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Close') != -1 && _session.m_requestResult.indexOf('Accepted') != -1) {
                        newRow += '<td style="width:100px;"><center>' + '<div  title="برای ورورد به سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GoToSeminar(' + _session.m_seminarID + ');">ورود به سمینار ضبط شده</div>' + '</center></td>';
                    } else {
                        newRow += "<td></td>";
                    }
                    newRow += '</tr>';
                    $('#MyRequestedSeminarsTable').append(newRow);
                }
            } else {
                //TODO : The Server Return False Status With 
                CustomAlert('خطا', result.Message, null);
            }
        });
    }
}


function GetListOfInvitedSeminars() {
    //TODO : List Of Seminars
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    ClearTableRows("#InvitedToSeminarTable tbody tr");
    ShowBox("#InvitedToSeminar");
    if (!(userName == null || userName == "")) {
        $.getJSON(ServerURL + "Session/ViewInvitations", {
            userName: userName
        }, function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
            if (result.Status == true) {

                //alert(result.Message);
                for (var j = 0; j < result.Result.length; j++) {
                    //alert("GetListOfInvitedSeminars");
                    var presentorName;
                    if (result.Result[j].presentorFirstName == null || result.Result[j].presentorLastName == null) {
                        presentorName = result.Result[j].presentorUserName;
                    }
                    var _session = {
                        m_seminarID: result.Result[j].sessionId,
                        m_seminarName: result.Result[j].sessionName,
                        m_seminarPresentorName: result.Result[j].presentorUserName == userName ? 'خودم' : presentorName,
                        m_seminarBeginTime: GetPrsianDate(result.Result[j].beginTime),
                        m_seminarDuration: result.Result[j].duration,
                        m_seminarStatus: result.Result[j].status,
                        m_seminarsAdmin: result.Result[j].adminUserName == userName ? 'خودم' : result.Result[j].adminLastName,
                        m_isVod: result.Result[j].isVod
                    };

                    //MySeminars.push(_session);
                    // Table : OwnedSeminarsTable
                    //<tr>
                    //	<th>شماره سمینار</th>
                    //	<th>نام سمینار</th>
                    //	<th>مدیر</th>
                    //	<th>ارائه دهنده</th>
                    //	<th>تاریخ برگزاری</th>
                    //	<th>مدت (ساعت)</th>
                    //  <th>وضعیت</th>
                    //  <th></th>
                    //</tr>
                    var newRow = '<tr><td><center>' + _session.m_seminarID + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarsAdmin + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarPresentorName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarBeginTime + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarDuration + ' ساعت' + '</center></td>';

                    if (_session.m_seminarStatus.indexOf('Scheduled') != -1) {
                        newRow += '<td><center>' + '<span class="label label-warning">زمان بندی شده</span>' + '</center></td>';
                        newRow += "<td></td>";
                    }
                    if (_session.m_seminarStatus.indexOf('Open') != -1) {
                        newRow += '<td><center>' + '<span class="label label-success">در حال اجرا</span>' + '</center></td>';
                        newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GoToSeminar(' + _session.m_seminarID + ');">ورود به سمینار</div>' + '</center></td>';
                    }
                    if (_session.m_seminarStatus.indexOf('Banned') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">ممنوع شده</span>' + '</center></td>';
                        newRow += "<td></td>";
                    }
                    if (_session.m_seminarStatus.indexOf('Close') != -1) {
                        newRow += '<td><center>' + '<span class="label label-important">بسته شده</span>' + '</center></td>';
                        newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GoToSeminar(' + _session.m_seminarID + ');"> ورود به سمینار ضبط شده</div>' + '</center></td>';
                        newRow += "<td></td>";
                    }

                    newRow += '</tr>';
                    $('#InvitedToSeminarTable').append(newRow);
                }
            } else {
                //TODO : The Server Return False Status With 
                CustomAlert('خطا', result.Message, null);
            }

        });
    }
}

function GetOfflineSeminars() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    ShowBox("#OwnedSeminars");
    ClearTableRows("#OwnedSeminarsTable tbody tr");
    MySeminars = [];
    if (!(userName == null || userName == "")) {
        $.getJSON(ServerURL + "Session/GetOfflineSeminars", {
            adminName: userName
        }, function (resultAdmin) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);
            if (resultAdmin.Status == true) {
                for (var j = 0; j < resultAdmin.Result.length; j++) {
                    if (IsExistSminarInList(resultAdmin.Result[j].id) == false) {
                        var _session = {
                            m_seminarID: resultAdmin.Result[j].id,
                            m_seminarBeginTime: 'آفلاین',
                            m_seminarName: resultAdmin.Result[j].name,
                            m_seminarPresentorName: resultAdmin.Result[j].presentorUserName == userName ? 'خودم' : resultAdmin.Result[j].presentorUserName,
                            m_seminarDuration: resultAdmin.Result[j].duration,
                            m_seminarStatus: resultAdmin.Result[j].status,
                            m_seminarsAdmin: 'خودم'
                        };
                        MySeminars.push(_session);

                        var newRow = '<tr><td><center>' + _session.m_seminarID + '</center></td>';
                        newRow += '<td><center>' + _session.m_seminarName + '</center></td>';
                        newRow += '<td><center>' + _session.m_seminarsAdmin + '</center></td>';
                        newRow += '<td><center>' + _session.m_seminarPresentorName + '</center></td>';
                        newRow += '<td><center>' + _session.m_seminarBeginTime + '</center></td>';
                        newRow += '<td><center>' + _session.m_seminarDuration + ' ساعت' + '</center></td>';
                        newRow += '<td><center>' + '<span class="label label-success">در حال اجرا</span>' + '</center></td>';
                       if (_session.m_seminarStatus.indexOf('Banned') != -1)
                            newRow += '<td><center>' + '<span class="label label-important">ممنوع شده</span>' + '</center></td>';
                        newRow += '<td style="width:100px;"><center>' + '<div  title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GetMoreSeminarInformation(' + _session.m_seminarID + ');">اطلاعات بیشتر</div>' + '</center></td>';

                      //  if (_session.m_seminarStatus.indexOf('Open') != -1) {
                            newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success" onclick="GoToSeminar(' + _session.m_seminarID + ');">مشاهده سمینار</div>' + '</center></td>';
                      //  } else if (_session.m_seminarStatus.indexOf('Close') != -1) {
                      //      newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success" onclick="GoToSeminar(' + _session.m_seminarID + ');">ورود به سمینار ضبط شده</div>' + '</center></td>';
                     //   } else {
                     //       newRow += "<td></td>";
                     //   }

                        newRow += '<td style="width:100px;"><center>' + '<div  title="برای حذف سمینار کلیک کنید." data-rel="tooltip" class="btn btn-error" onclick="DeleteSeminar(' + _session.m_seminarID + ');">حذف سمینار</div>' + '</center></td>';

                        newRow += '</tr>';
                        $('#OwnedSeminarsTable').append(newRow);
                    }
                }
            } else {
                //TODO : The Server Return False Status With
                alert(resultAdmin.Message);
            }
        });
    }
}

function GetMySeminars() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    ShowBox("#OwnedSeminars");
    ClearTableRows("#OwnedSeminarsTable tbody tr");
    MySeminars = [];
    if (!(userName == null || userName == "")) {
        $.getJSON(ServerURL + "Session/SessionSearchByPresentor", {
            presentorName: userName
        }, function (result) {
            if (result.Status == true) {
                for (var j = 0; j < result.Result.length; j++) {
                    var _session = {
                        m_seminarID: result.Result[j].id,
                        m_seminarName: result.Result[j].name,
                        m_seminarPresentorName: 'خودم',
                        m_seminarBeginTime: GetPrsianDate(result.Result[j].beginTime),
                        m_seminarDuration: result.Result[j].duration,
                        m_seminarStatus: result.Result[j].status,
                        m_seminarsAdmin: result.Result[j].adminUserName == userName ? 'خودم' : result.Result[j].admin
                    };
                    MySeminars.push(_session);
                    // Table : OwnedSeminarsTable
                    //<tr>
                    //	<th>شماره سمینار</th>
                    //	<th>نام سمینار</th>
                    //	<th>مدیر</th>
                    //	<th>ارائه دهنده</th>
                    //	<th>تاریخ برگزاری</th>
                    //	<th>مدت (ساعت)</th>
                    //  <th>وضعیت</th>
                    //  <th></th>
                    //</tr>
                    var newRow = '<tr><td><center>' + _session.m_seminarID + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarsAdmin + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarPresentorName + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarBeginTime + '</center></td>';
                    newRow += '<td><center>' + _session.m_seminarDuration + ' ساعت' + '</center></td>';

                    if (_session.m_seminarStatus.indexOf('Scheduled') != -1)
                        newRow += '<td><center>' + '<span class="label label-warning">زمان بندی شده</span>' + '</center></td>';
                    else if (_session.m_seminarStatus.indexOf('Open') != -1)
                        newRow += '<td><center>' + '<span class="label label-success">در حال اجرا</span>' + '</center></td>';
                    else if (_session.m_seminarStatus.indexOf('Banned') != -1)
                        newRow += '<td><center>' + '<span class="label label-important">ممنوع شده</span>' + '</center></td>';
                    else if (_session.m_seminarStatus.indexOf('Closed') != -1)
                        newRow += '<td><center>' + '<span class="label label-important">برگزارشده</span>' + '</center></td>';
                    else
                        newRow += '<td><center>' + '<span class="label label-important">نامشخص</span>' + '</center></td>';


                    newRow += '<td style="width:100px;"><center>' + '<div  title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GetMoreSeminarInformation(' + _session.m_seminarID + ');">اطلاعات بیشتر</div>' + '</center></td>';

                    if (_session.m_seminarStatus.indexOf('Open') != -1) {
                        newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success" onclick="GoToSeminar(' + _session.m_seminarID + ');">مشاهده سمینار زنده</div>' + '</center></td>';
                    } else if (_session.m_seminarStatus.indexOf('Close') != -1) {
                        newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success" onclick="GoToSeminar(' + _session.m_seminarID + ');">مشاهده سمینار آفلاین</div>' + '</center></td>';
                    } else {
                        newRow += "<td></td>";
                    }


                    newRow += '<td style="width:100px;"><center>' + '<div  title="برای حذف سمینار کلیک کنید." data-rel="tooltip" class="btn btn-error" onclick="DeleteSeminar(' + _session.m_seminarID + ');">حذف سمینار</div>' + '</center></td>';

                    newRow += '</tr>';

                    $('#OwnedSeminarsTable').append(newRow);
                }
            } else {
                //TODO : The Server Return False Status With 
                alert(result.Message);
            }

            $.getJSON(ServerURL + "Session/SessionSearchByAdmin", {
                adminName: userName
            }, function (resultAdmin) {
                if (resultAdmin.Status == true) {
                    for (var j = 0; j < resultAdmin.Result.length; j++) {

                        if (IsExistSminarInList(resultAdmin.Result[j].id) == false) {
                            var _session = {
                                m_seminarID: resultAdmin.Result[j].id,
                                m_seminarName: resultAdmin.Result[j].name,
                                m_seminarPresentorName: resultAdmin.Result[j].presentorUserName == userName ? 'خودم' : resultAdmin.Result[j].presentor,
                                m_seminarBeginTime: GetPrsianDate(resultAdmin.Result[j].beginTime),
                                m_seminarDuration: resultAdmin.Result[j].duration,
                                m_seminarStatus: resultAdmin.Result[j].status,
                                m_seminarsAdmin: 'خودم'
                            };
                            MySeminars.push(_session);
                            // Table : OwnedSeminarsTable
                            //<tr>
                            //	<th>شماره سمینار</th>
                            //	<th>نام سمینار</th>
                            //	<th>مدیر</th>
                            //	<th>ارائه دهنده</th>
                            //	<th>تاریخ برگزاری</th>
                            //	<th>مدت (ساعت)</th>
                            //  <th>وضعیت</th>
                            //  <th></th>
                            //</tr>

                            var newRow = '<tr><td><center>' + _session.m_seminarID + '</center></td>';
                            newRow += '<td><center>' + _session.m_seminarName + '</center></td>';
                            newRow += '<td><center>' + _session.m_seminarsAdmin + '</center></td>';
                            newRow += '<td><center>' + _session.m_seminarPresentorName + '</center></td>';
                            newRow += '<td><center>' + _session.m_seminarBeginTime + '</center></td>';
                            newRow += '<td><center>' + _session.m_seminarDuration + ' ساعت' + '</center></td>';
                            if (_session.m_seminarStatus.indexOf('Scheduled') != -1)
                                newRow += '<td><center>' + '<span class="label label-warning">زمان بندی شده</span>' + '</center></td>';
                            else if (_session.m_seminarStatus.indexOf('Open') != -1)
                                newRow += '<td><center>' + '<span class="label label-success">در حال اجرا</span>' + '</center></td>';
                            else if (_session.m_seminarStatus.indexOf('Banned') != -1)
                                newRow += '<td><center>' + '<span class="label label-important">ممنوع شده</span>' + '</center></td>';
                            else if (_session.m_seminarStatus.indexOf('Closed') != -1)
                                newRow += '<td><center>' + '<span class="label label-important">برگزارشده</span>' + '</center></td>';
                            else
                                newRow += '<td><center>' + '<span class="label label-important">نامشخص</span>' + '</center></td>';

                            newRow += '<td style="width:100px;"><center>' + '<div  title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip" class="btn btn-info" onclick="GetMoreSeminarInformation(' + _session.m_seminarID + ');">اطلاعات بیشتر</div>' + '</center></td>';

                            if (_session.m_seminarStatus.indexOf('Open') != -1) {
                                newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success"  onclick="GoToSeminar(' + _session.m_seminarID + ');">مشاهده سمینار زنده</div>' + '</center></td>';
                            } else if (_session.m_seminarStatus.indexOf('Close') != -1) {
                                newRow += '<td style="width:100px;"><center>' + '<div title="برای مشاهده جزئیات سمینار کلیک کنید." data-rel="tooltip"  class="btn btn-success"  onclick="GoToSeminar(' + _session.m_seminarID + ');">مشاهده سمینار آفلاین</div>' + '</center></td>';
                            } else {
                                newRow += "<td></td>";
                            }

                            newRow += '<td style="width:100px;"><center>' + '<div  title="برای حذف سمینار کلیک کنید." data-rel="tooltip" class="btn btn-error" onclick="DeleteSeminar(' + _session.m_seminarID + ');">حذف سمینار</div>' + '</center></td>';

                            newRow += '</tr>';
                            $('#OwnedSeminarsTable').append(newRow);
                        }
                    }
                } else {
                    //TODO : The Server Return False Status With 
                    alert(resultAdmin.Message);
                }
            });
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);
        });

    }
}

function DeleteSeminar(sessionId) {
    $.ajax({
        type: 'GET',
        url: ServerURL + "Session/DeleteSeminar",
        dataType: 'Json',
        success: function (result) {
            if (result.Status == true) {
                CustomBlockingPanel('توجه', 'حذف سمینار با موفقیت صورت پذیرفت', null);
                $("#Pishnahadat").hide();
            } else {
                CustomBlockingPanel('توجه', 'حذف سمینار با خطا روبرو گردید', null);

            }
        },
        data: {sessionId: sessionId },
        async: true
    });
}

function SendRecom() {
    if (!(userName == null || userName == "")) {
        var _message = $("#PishnahadatPanel").val();
        if (_message != "") {
            content = {
                userName: userName,
                message: _message
            };
            $.ajax({
                type: 'POST',
                url: ServerURL + "Account/SendAdvice",
                dataType: 'Json',

                success: function (result) {

                    if (result.Status == true) {

                        CustomAlert('توجه', "پیشنهاد شما با موفقیت ارسال گردید", null);
                        $("#Pishnahadat").hide();
                    } else {
                        CustomAlert('توجه', "ثبت پیشنهاد شما با خطا روبرو  گردید", null);
                    }
                },
                data: content,
                async: true
            });
        }
    } else {
        alert("not signed in");
    }
}

function LogoutFromServer() {
    $.getJSON(ServerURL + "Account/LogOutOfServer", {}, function (result) {
        window.location = "../index.htm";
    });
}

function GetUserProfile() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetProfile",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);
            if (result.Status == true) {
                $("#ProfileFirstName").val(result.Result.firstName);
                $("#ProfileLastName").val(result.Result.lastName);
                //$("#ProfileInterNationalID").val(result.Result.nationId);
                $("#ProfileEmail").val(result.Result.email);
                $("#ProfileMobile").val(result.Result.mobile);

                var gender;
                if (result.Result.gender == true) {
                    gender = 0;
                } else {
                    gender = 1;
                }
                $("#ProfileSelectCity option:selected").attr("selected", false);
                $("#ProfileSelectCity" + result.Result.city).attr("selected", true);
                $("#ProfileselectGender option:selected").attr("selected", false);
                $("#ProfileselectGender" + gender).attr("selected", true);
                $("#ProfileSelectDegree option:selected").attr("selected", false);
                $("#ProfileSelectDegree" + result.Result.degree).attr("selected", true);
                $("#ProfileBirthdateYear option:selected").attr("selected", false);
                $("#ProfileBirthdateMonth option:selected").attr("selected", false);
                $("#ProfileBirthdateDay option:selected").attr("selected", false);
                if (result.Result.photo != null && result.Result.photo != "") {
                    document.getElementById('ProfileImageImage').src = "http://iwebinar.ir:6060/ServerSide/Pics/Users/Originals/" + userName + ".png";
                }
                var splitedDate = result.Result.birthday.split(":");
                $("#ProfileBirthdateYear option[value=" + splitedDate[0] + "]").attr("selected", true);
                $("#ProfileBirthdateMonth option[value=" + splitedDate[1] + "]").attr("selected", true);
                $("#ProfileBirthdateDay option[value=" + splitedDate[2] + "]").attr("selected", true);
                IsFirstLogIn = false;
            } else {
                IsFirstLogIn = true;
            }
        },
        data: {
            username: userName
        },
        async: false
    });
}

function CloseAllForm() {
    //alert(IsFirstLogIn);
    if (IsFirstLogIn == true) {
        $('#ProfileDetails').show();
    } else {
        $('#ProfileDetails').hide();
    }
    $("#NewSeminar").hide();
    $("#ProfileLogInDetails").hide();
    $("#ProfileContactDetails").hide();
    $("#OwnedSeminars").hide();
    $("#SeminarMoreInfo").hide();
    //$("#SeminarDetailsRequested").hide();
    $("#InvitedToSeminar").hide();
    $("#MyRequestedSeminars").hide();
    $("#SeminarMode").hide();
    $("#SeminarInfoFileProgress").hide();

}

function CreateSeminar() {
    var _seminarName = $("#NewSeminarName").val();
    var _seminarManager = $("#NewSeminarManager").val();
    var _seminarPresentor = $("#NewSeminarPresentor").val();
    var _isSendSMS = $("#NewSeminarIsSendSMS").is(':checked');

    var _seminarDescription = $("#NewSeminarDescription").val();
    var _seminarForWho = $("#NewSeminarForWho").val();
    var _seminarWhy = $("#NewSeminarWhyParticipate").val();
    var _seminarLevel = $("#NewSeminarPrecondition").val();
    var _seminarKeyWords = $("#NewSeminarKeyWords").val();

    var _seminarType = $("#NewSeminarType").val();

    var _seminarCapacity = $("#NewSeminarCapacityPredict").val();
    var _seminarEndTime = $("#NewSeminarEndingHour").val();
    var _seminarBeginTime = $("#NewSeminarHeldingHour").val();
    var _seminarMonth = $("#NewSeminarDateMonth").val();
    var _seminarDay = $("#NewSeminarDateDay").val();
    var _seminarYear = $("#NewSeminarDateYear").val();
    var _seminarCustomFee = $('#NewSeminarCustomFee').val();
    var _seminarBaseTime = _seminarYear + ":" + _seminarMonth + ":" + _seminarDay;
    var _seminarFee = fee;

    console.log('step 3');
    var _participantEmail = "";
    var _participantMobiles = "";
    var _participantFirstNames = "";
    var _participantLastNames = "";

    for (var j = 0; j < InvitedUsersList.length; j++) {
        var mobile = ((InvitedUsersList[j].m_mobile == "") ? "-1" : InvitedUsersList[j].m_mobile);
        _participantEmail += (InvitedUsersList[j].m_email);
        _participantMobiles += mobile;
        _participantFirstNames += (InvitedUsersList[j].m_firstName);
        _participantLastNames += (InvitedUsersList[j].m_lastName);
        if (j != InvitedUsersList.length - 1) {
            _participantEmail += ",";
            _participantMobiles += ",";
            _participantFirstNames += ",";
            _participantLastNames += ",";
        }
    }
    var _hasError = false;

    if (_seminarName == "") {
        _hasError = true;
        $("#NewSeminarNameError").show();
    } else {
        $("#NewSeminarNameError").hide();
    }
    if (_seminarPresentor == "") {
        _hasError = true;
        $("#NewSeminarPresentorError").show();
    } else if (validEmail(_seminarPresentor) == false) {
        _hasError = true;
        $("#NewSeminarPresentorError").show();
    } else $("#NewSeminarPresentorError").hide();
    if(seminarType == 1) {
        if (parseInt(_seminarEndTime) <= parseInt(_seminarBeginTime)) {
            _hasError = true;
            $("#NewSeminarEndingHourError").show();
        } else $("#NewSeminarEndingHourError").hide();
    }
    if (_seminarKeyWords == "") {
        _hasError = true;
        $("#NewSeminarKeyWordsError").show();
    } else $("#NewSeminarKeyWordsError").hide();

    if (_hasError == false) {

        $("#NewTerminalWizard5").hide();
        $("#NewTerminalWizard7").show();
        console.log("There is no error and try to create seminar");
        //Send Request To Server
        NewSeminar = {
            sessionAdmin: "Null",
            presentorName: _seminarPresentor,
            sessionName: _seminarName,
            sessionType: _seminarType,
            beginTime: _seminarBaseTime + ":" + _seminarBeginTime + ":00:00",
            endTime: _seminarBaseTime + ":" + _seminarEndTime + ":00:00",
            capacity: _seminarCapacity,
            fee: _seminarFee,
            wallpaper: (WebinarPoster == "" || WebinarPoster == undefined) ? "NotHave" : WebinarPoster,
            keywords: _seminarKeyWords,
            description: _seminarDescription,
            emails: _participantEmail,
            mobiles: _participantMobiles,
            firstNames: _participantFirstNames,
            lastNames: _participantLastNames,
            why: _seminarWhy,
            forLearner: _seminarForWho,
            level: _seminarLevel,
            isBilled: true,
            sendSms: _isSendSMS,
            bp: peymentMethod,
            cf: _seminarCustomFee,
            mode: seminarType,
            du: $("#NewSeminarHourLength").val()
        };

        $.ajax({
            type: 'POST',
            url: ServerURL + "Session/CreateNewSession",
            dataType: 'json',
            success: function (result) {
                if (result.Status == true) {
                    $("#NewTerminalWizard7").hide();
                    $("#NewTerminalWizard8").show();
                    $("#NewSeminarLastBalance").html('اعتبار شما قبل از پرداخت ' + result.Result.lastBalance + ' ریال بوده است. ');
                    $("#NewSeminarBalance").html('میزان اعتبار باقی مانده : ' + result.Result.Balance + ' ریال است. ');
                    $("#NewSeminarFee").html('هزینه این سمینار  : ' + result.Result.Fee + ' ریال شده است. ');
                    $("#UpUserBalance_Balance").html('اعتبار شما ' + result.Result.Balance + 'ریال');
                    //alert("Shod");
                } else {
                    $("#NewTerminalWizard7").hide();
                    $("#NewTerminalWizard9").show();
                    $("#NewSemiarError").html(result.Message);
                }
            },
            data: NewSeminar,
            async: true
        });
    }
}

function InviteNewPerson() {
    var _hasError = false;
    if (isMember == 0) {
        if ($('#InviteFirstName').val() == "") {
            _hasError = true;
            $('#InviteFirstNameError').show();
        } else {
            $('#InviteFirstNameError').hide();
        }
        if ($('#InviteLastName').val() == "") {
            _hasError = true;
            $('#InviteLastNameError').show();
        } else {
            $('#InviteLastNameError').hide();
        }
        if ($('#InviteEmail').val() == "") {
            _hasError = true;
            $('#InviteEmailError').show();
        } else {
            $('#InviteEmailError').hide();
        }
        var _email = $('#InviteEmail').val();
        if (IsExistInInvited(_email) == true) {
            $('#InviteEmailExistError').show();
            _hasError = true;
        } else {
            $('#InviteEmailExistError').hide();
        }

        if (InvitedUsersList.length >= parseInt($("#NewSeminarCapacity").val())) {
            $('#InviteEmailCapacityError').show();
            _hasError = true;

        } else {
            $('#InviteEmailCapacitytError').hide();
        }


        if (_hasError == false) {
            var type = $('#EditInviteModalType').val();
            if (type.indexOf('Edit') != -1) {
                DoEditInvitedPerson();
            } else if (type.indexOf('AddSpatial') != -1) {
                AddOnDemandInvite();
            } else {
                AddNewInviteeRow();
            }
        }
    } else if (isMember == 1) {
        var _email = $('#MemberInvite').val();
        if (IsExistInInvited(_email) == true) {
            $('#MemberInviteEmailExistError').show();
            _hasError = true;
        } else {
            $('#MemberInviteEmailExistError').hide();
        }

        if (InvitedUsersList.length >= parseInt($("#NewSeminarCapacity").val())) {
            $('#MemberInviteEmailCapacityError').show();
            _hasError = true;

        } else {
            $('#MemberInviteEmailCapacitytError').hide();
        }


        if (_hasError == false) {
            var type = $('#EditInviteModalType').val();

            if (type.indexOf('Edit') != -1) {
                DoEditInvitedPerson();
            } else if (type.indexOf('AddSpatial') != -1) {
                //AddOnDemandInvite();
                InviteExistUser(_email);
            } else {
                AddNewInviteeRow();
            }
        }

    }
}


function AddOnDemandInvite() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    $('#InviteUserForm').modal('hide');
    var email = $('#InviteEmail').val();
    var firstName = $('#InviteFirstName').val();
    var lastName = $('#InviteLastName').val();
    var mobile = $('#InviteMobile').val();
    $("#OnDemandInviteMessages").html("در حال دعوت از " + email + "لطفا اندکی صبر کنید");
    $("#OnDemandInviteMessages").fadeIn(1000);
    var sessionID = CurrentSeminarID;
    console.log(sessionID);
    $.getJSON(ServerURL + "Session/InviteToParticipate", {
        email: email,
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        sessionID: sessionID
    }, function (result) {
        CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
        if (result.Status == true) {
            //TODO Add To table
            var inviteID = result.Result.inviteId;
            //Table : SeminarDetailsInvitedTable
            var newRow = '<tr><td><center>' + inviteID + '</center></td>';
            newRow += '<td><center>' + firstName + '</center></td>';
            newRow += '<td><center>' + lastName + '</center></td>';
            newRow += '<td><center>' + email + '</center></td>';
            newRow += '<td><center>' + GetPrsianDate(result.Result.date) + '</center></td>';
            newRow += '<td style="width:100px;"><center>' + '<div title="برای ارسال مجدد دعوتنامه کلیک کنید" data-rel="tooltip"  class="btn btn-success" onclick="ReInviteUser(' + inviteID + ');">ارسال مجدد دعوتنامه</div>' + '</center></td></tr>';

            $('#SeminarDetailsInvitedTable').append(newRow);

            $('#InviteEmail').val('');
            $('#InviteFirstName').val('');
            $('#InviteLastName').val('');
            $('#InviteMobile').val('');

            $("#OnDemandInviteMessages").fadeOut(1000);

        } else {
            $("#OnDemandInviteMessages").html(result.Message);
            setTimeout(function () {
                $("#OnDemandInviteMessages").fadeOut(1000);
            }, 3000);
        }
    });
}

function InviteExistUser(email) {
    //InviteExistUsetToParticipate
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ... ', -1, null);
    $('#InviteUserForm').modal('hide');
    $("#OnDemandInviteMessages").html("در حال دعوت از " + email + "لطفا اندکی صبر کنید");
    $("#OnDemandInviteMessages").fadeIn(1000);
    var sessionID = $('#InviteUserFormSesionID').val();
    $.getJSON(ServerURL + "Session/InviteExistUsetToParticipate", {
        sessionID: sessionID,
        email: email
    }, function (result) {
        CustomBlockingPanel('توجه', 'اطلاعات دریاف شد.', 1000, null);
        if (result.Status == true) {
            //TODO Add To table
            var inviteID = result.Result.inviteId;
            //Table : SeminarDetailsInvitedTable
            var newRow = '<tr><td><center>' + inviteID + '</center></td>';
            newRow += '<td><center>' + result.Result.FirstName + '</center></td>';
            newRow += '<td><center>' + result.Result.LastName + '</center></td>';
            newRow += '<td><center>' + email + '</center></td>';
            newRow += '<td><center>' + GetPrsianDate(result.Result.date) + '</center></td>';
            newRow += '<td style="width:100px;"><center>' + '<div title="برای ارسال مجدد دعوتنامه کلیک کنید" data-rel="tooltip"  class="btn btn-success" onclick="ReInviteUser(' + inviteID + ');">ارسال مجدد دعوتنامه</div>' + '</center></td></tr>';
            $('#SeminarDetailsInvitedTable').append(newRow);
            $('#InviteEmail').val('');
            $('#InviteFirstName').val('');
            $('#InviteLastName').val('');
            $('#InviteMobile').val('');

            var newPerson = {
                m_firstName: result.Result.FirstName,
                m_lastName: result.Result.LastName,
                m_email: email.toLowerCase(),
                m_mobile: result.Result.Mobile
            };
            InvitedUsersList.push(newPerson);
            $("#OnDemandInviteMessages").fadeOut(1000);
        } else {
            $("#OnDemandInviteMessages").html(result.Message);
            setTimeout(function () {
                $("#OnDemandInviteMessages").fadeOut(1000);
            }, 3000);
        }
    });
}

function LoadSeminarTimes(loadFirstTime) {

    $("#NewSeminarDateDay").html("");
    var _month = GetCurrentPersianMonth();
    var something = _month + 1;

    if (loadFirstTime == true) {
        $("#NewSeminarDateMonth" + _month).attr("selected", "selected");
    }

    var _dayOfMonth = GetCurrentPersianDayOfMonth();


    if ($('#NewSeminarDateMonth').val() == something) {
        for (var j = _dayOfMonth + 1; j < 32; j++) {
            ;

            $("#NewSeminarDateDay").html($("#NewSeminarDateDay").html() + "<option>" + j + "</option>");
        }
    } else {

        for (var j = 1; j < 32; j++) {
            $("#NewSeminarDateDay").html($("#NewSeminarDateDay").html() + "<option>" + j + "</option>");
        }
    }

    for (var j = 0; j < _month; j++) {
        $("#NewSeminarDateMonth" + j).hide();
    }
    //$("#NewSeminarDateMonth" + _month).attr("selected","selected");
}

function IsExistInInvited(emailAddress) {
    for (var i = 0; i < InvitedUsersList.length; i++) {
        if (InvitedUsersList[i].m_email == emailAddress) return true;
    }
    return false;
}


function AddNewInviteeRow() {
    Debug('cp 0');
    var FirstName;
    var LastName;
    var email;
    var mobile;

    if (isMember == 0) {
        Debug('cp 1');
        FirstName = $('#InviteFirstName').val();
        LastName = $('#InviteLastName').val();
        email = $('#InviteEmail').val();
        mobile = $('#InviteMobile').val();
    } else {
        Debug('cp 2');
        FirstName = SelectedUserFirstName;
        LastName = SelectedUserLastName;
        email = SeletectedUserAccount;
        mobile = SelectedUserMobile;
        //	alert(FirstName + " : " + LastName + " : " + email + " : " + mobile);

    }
    var newPerson = {
        m_firstName: FirstName,
        m_lastName: LastName,
        m_email: email.toLowerCase(),
        m_mobile: mobile
    };
    InvitedUsersList.push(newPerson);
    var commaSeparated = "'" + FirstName.toString() + "'" + ', ' + "'" + LastName.toString() + "'" + ', ';
    commaSeparated += "'" + email.toString() + "'" + ', ' + "'" + mobile.toString() + "'";
    var newRow = '<tr><td>' + FirstName + '</td><td class="center">' + LastName + '</td>';
    newRow += '<td class = "center" contenteditable=true>' + email + '</td>';
    newRow += '<td class = "center">' + mobile + '</td>';
    if (isMember == 0) {
        newRow += '<td class="center" ><button class="btn btn-info" onclick="' + 'EditInvitedPerson(' + commaSeparated + ', $(this).parent().parent()); EditInviteRowSeleted = $(this).parent().parent();" ><i class="icon-edit icon-white"></i>ویرایش</button><button class="btn btn-danger" onclick="' + ' DeleteInviteRowSeleted = $(this).parent().parent(); RemoveInvitedFromList(); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td></tr>';
    } else {
        newRow += '<td class="center" ><button class="btn btn-danger" onclick="' + ' DeleteInviteRowSeleted = $(this).parent().parent(); RemoveInvitedFromList(); $(this).parent().parent().remove();' + '"><i class="icon-trash icon-white"></i>حذف</button></td></tr>';
    }

    $('#Invited').append(newRow);
    $('#InviteUserForm').modal('hide');
    $('#InviteFirstName').val("");
    $('#InviteLastName').val("");
    $('#InviteEmail').val("");
    $('#InviteMobile').val("");
    $('#InviteFirstNameError').hide();
    $('#InviteLastNameError').hide();
    $('#InviteEmailError').hide();
    $('#InviteEmailExistError').hide();
    $('#InviteEmailCapacityError').hide();
    $('#MemberInviteEmailError').hide();
    $('#MemberInviteEmailExistError').hide();
    $('#MemberInviteEmailCapacityError').hide();

}

function EditInvitedPerson(firstName, lastName, email, mobile, row) {
    $('#InviteFirstName').val(firstName);
    $('#InviteLastName').val(lastName);
    $('#InviteEmail').val(email);
    $('#InviteMobile').val(mobile);
    $('#EditInviteModalType').val("Edit");
    $('#EditInviteRow').val(row);
    $('#InviteUserForm').modal('show');
}

function RemoveInvitedFromList() {
    var email;
    var index = 0;
    $('td', DeleteInviteRowSeleted).each(function () {
        switch (index) {
            case 2:
                email = $(this).html();
                break;
        }
        index++;
    });
    var deleted;
    $.each(InvitedUsersList, function (i, index) {
        if (index.m_email == email) {
            deleted = i;
        }
    });
    InvitedUsersList.splice(deleted, 1);

}

function DoEditInvitedPerson() {
    var FirstName = $('#InviteFirstName').val();
    var LastName = $('#InviteLastName').val();
    var email = $('#InviteEmail').val();
    var mobile = $('#InviteMobile').val();
    var row = $('#EditInviteRow').val();
    var index = 0;
    var lastEmail;
    $('td', EditInviteRowSeleted).each(function () {
        switch (index) {
            case 0:
                $(this).html(FirstName);
                break;
            case 1:
                $(this).html(LastName);
                break;
            case 2:
                lastEmail = $(this).html();
                $(this).html(email);
                break;
            case 3:
                $(this).html(mobile);
                break;
        }
        index++;
        /*if( $(this).html().indexOf('$(this)') == -1)
         {
         $(this).html('<input type="text" value="' + $(this).html() + '" />');
         }
         else
         {
         }*/
    });

    var edited;
    $.each(InvitedUsersList, function (i, index) {
        if (index.m_email == lastEmail) {
            edited = i;
            index.m_firstName = FirstName;
            index.m_lastName = LastName;
            index.m_email = email;
            index.m_mobile = mobile;
        }
    });

    $('#InviteUserForm').modal('hide');
    $('#InviteFirstName').val("");
    $('#InviteLastName').val("");
    $('#InviteEmail').val("");
    $('#InviteMobile').val("");
    $('#InviteFirstNameError').hide();
    $('#InviteLastNameError').hide();
    $('#InviteEmailError').hide();
    $('#InviteEmailExistError').hide();
    $('#InviteEmailCapacityError').hide();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function mp(seq, loginid, txnkey, msg, ammount, tstamp) {
    var sequence = seq;
    var fee = ammount;
    var rpUrl = "http://www.vworld.ir/Payment/GetResponse";
    var fingerprint = CalculateFP(loginid, txnkey, fee, sequence, tstamp, "Rial");
    var form = document.getElementById("MaleiForm");
    form.setAttribute("method", "post");
    form.setAttribute("action", "https://damoon.bankmelli-iran.com/DamoonPrePaymentController");
    var desc = document.createElement('input');
    desc.setAttribute('type', 'hidden');
    desc.setAttribute('name', 'x_description');
    desc.setAttribute('value', 'Just For Payment Test');
    var amount = document.createElement('input');
    amount.setAttribute('type', 'hidden');
    amount.setAttribute('name', 'x_amount');
    amount.setAttribute('value', fee);
    var seq = document.createElement('input');
    seq.setAttribute('type', 'hidden');
    seq.setAttribute('name', 'x_fp_sequence');
    seq.setAttribute('value', sequence);
    var tstmp = document.createElement('input');
    tstmp.setAttribute('type', 'hidden');
    tstmp.setAttribute('name', 'x_fp_timestamp');
    tstmp.setAttribute('value', tstamp);
    var fingerPrint = document.createElement('input');
    fingerPrint.setAttribute('type', 'hidden');
    fingerPrint.setAttribute('name', 'x_fp_hash');
    fingerPrint.setAttribute('value', fingerprint);
    var returnUrl = document.createElement('input');
    returnUrl.setAttribute('type', 'hidden');
    returnUrl.setAttribute('name', 'x_fp_receiptpage');
    returnUrl.setAttribute('value', rpUrl);
    var login = document.createElement('input');
    login.setAttribute('type', 'hidden');
    login.setAttribute('name', 'x_login');
    login.setAttribute('value', loginid);
    var currencyCode = document.createElement('input');
    currencyCode.setAttribute('type', 'hidden');
    currencyCode.setAttribute('name', 'x_currency_code');
    currencyCode.setAttribute('value', "Rial");
    //	var testMode = document.createElement('input');
    ///	testMode.setAttribute('type','hidden');
    //	testMode.setAttribute('name','x_test_request');
    //	testMode.setAttribute('value', "true");
    form.appendChild(desc);
    form.appendChild(amount);
    form.appendChild(seq);
    form.appendChild(tstmp);
    form.appendChild(fingerPrint);
    form.appendChild(returnUrl);
    form.appendChild(login);
    form.appendChild(currencyCode);
    //	form.appendChild(testMode);	
    form.submit();
}

function MakePayment(paymentStep) {
    //TODO : ReCalc Payment	
    $("#PaymentError").hide();
    //step.1 : check the ammount
    var _ammount = $("#PaymentPanelAmmount").val();
    var _discount = ""; //$("#PaymentPanelDiscount").val();
    var _bank = $("#PaymentPanelBank").val();
    if (_ammount == "") {
        $("#PaymentErrorMessage").html("مبلغ را وارد کنید.");
        $("#PaymentError").show();
        $("#PaymentConfirm").hide();
        return;
    }
    var _hasError = false;
    if (_discount != "") {
        //TODO : check the discount code and show eeror
        $("#PaymentConfirm").hide();
        $.ajax({
            type: 'GET',
            url: ServerURL + "Payment/CheckDiscount",
            dataType: 'json',
            success: function (result) {
                if (result.Status == false) {
                    if (result.Message == "There Is Not Specific Discount Code") {
                        $("#PaymentErrorMessage").html("کد شارژ وجود ندارد");
                        $("#PaymentError").show();
                        $("#PaymentConfirm").hide();
                        _hasError = true;
                    } else if (result.Message == "Discount Used Before") {
                        $("#PaymentErrorMessage").html("تخفیف قبلا استفاده شده است");
                        $("#PaymentError").show();
                        $("#PaymentConfirm").hide();
                        _hasError = true;
                    }
                }
            },
            data: {
                discountCode: _ammount
            },
            async: false
        });
    }

    if (_hasError == false) {
        if (paymentStep == 1) {
            //alert('salam');
            //$("#PaymentConfirmAmmount").html(_ammount);	
            //$("#PaymentConfirm").show();
            var peymentMsg = 'آیا مبلغ ' + _ammount + '  ریال پرداخت شود ؟';
            CustomConfirm('تایید پرداخت', peymentMsg, function () {
                MakePayment(2);
            }, function () {
                $("div[name=PanelWindow]").hide();
            });
        } else if (paymentStep == 2) {
            var tstamp = GetSecondsSince1970();
            if (_bank == 2) {
                //alert(ServerURL);
                CustomBlockingPanel("توجه", "در حال دریافت اطلاعات حساب", -1, null);
                $.ajax({
                    type: 'GET',
                    url: ServerURL + "Payment/PaymentRequest",
                    dataType: 'json',
                    success: function (result) {
                        if (result.Status == true) {
                            var seq = result.Result.PaymentID;
                            var loginid = "115750721";
                            var txnkey = "1zT//UnQUhhZqlcl";
                            var msg = "در صورتیکه پرداخت با موفقیت انجام نشد با کد  " + seq + "  می توانید پیگیری کنید.";
                            msg += "</br><center>";
                            msg += "در حال اتصال به بانک";
                            msg += "</center>";
                            CustomBlockingPanel("توجه", msg, 4000, function () {
                                mp(seq, loginid, txnkey, msg, result.Result.Ammount, tstamp);
                            });
                        } else {
                            alert(result.Message);
                        }
                    },
                    data: {
                        price: _ammount,
                        //amount : _ammount,
                        bankId: _bank,
                        timeStamp: tstamp
                    },
                    async: false
                });
            }
        }
    }
}

function ShowBox(box) {
    $("div[name=PanelWindow]").hide();
    if (IsFirstLogIn == true) {
        CloseAllForm();
        return;
    } else if (box.indexOf("ProfileDetails") != -1) {
        GetUserProfile();
    } else if (box.indexOf("NewSeminar") != -1) {

        $("#NewSeminarNameError").hide();
        $("#NewSeminarManagerError").hide();
        $("#NewSeminarPresentorError").hide();
        $("#NewSeminarEndingHourError").hide();
        $("#NewSeminarKeyWordsError").hide();
        $("#NewSeminarDurationError").hide();
        for (var i = 0; i < 10; i++)
            $("#NewTerminalWizard" + i).hide();
        $("#NewTerminalWizard-1").show();
    } else if (box.indexOf("OwnedSeminars") != -1) {
        $("#SeminarMoreInfo").hide();
        //$("#SeminarDetailsRequested").hide();
    } else if (box.indexOf("UserPeyments") != -1) {
        GetUserPeyments();
    }

    $(box).fadeIn(500);
}

function CleanInviteForm() {
    $('#InviteUserForm').modal('hide');
    $('#InviteFirstName').val("");
    $('#InviteLastName').val("");
    $('#InviteEmail').val("");
    $('#InviteMobile').val("");
    $('#InviteFirstNameError').hide();
    $('#InviteLastNameError').hide();
    $('#InviteEmailError').hide();
    $('#InviteEmailExistError').hide();
    $('#InviteEmailCapacityError').hide();
}

function SaveUserProfile() {
    //(string username, string firstName, string lastName, string city , string country, string photo , string nationalId, string birthday, bool gender)
    var _firstName = $("#ProfileFirstName").val();
    var _lastName = $("#ProfileLastName").val();
    //TODO : Upload Photo Via Json And MVC
    var _picture = "Nadarad"; //$("#ProfilePictureName").val();
    // var _nationalID = $("#ProfileInterNationalID").val();
    var _gender = $("#ProfileselectGender").val();
    var _city = $("#ProfileSelectCity").val();
    var _country = $("#ProfileSelectCountry").val();
    var _birthdayYear = $("#ProfileBirthdateYear").val();
    var _birthdayMonthr = $("#ProfileBirthdateMonth").val();
    //alert(_birthdayMonthr);
    var _birthdayDay = $("#ProfileBirthdateDay").val();
    var _birthdate = _birthdayYear + ":" + _birthdayMonthr + ":" + _birthdayDay;
    //alert(_birthdate);
    var _email = $("#ProfileEmail").val();
    var _mobile = $("#ProfileMobile").val();
    var _degree = $("#ProfileSelectDegree").val();


    var _hasError = false;
    if (_firstName == "") {
        _hasError = true;
        Eorrify("#ProfileFirstNameGroup", 5);
    }
    if (_lastName == "") {
        _hasError = true;
        Eorrify("ProfileLastNameGroup", 5);
    }
    if (_degree == "") {
        _hasError = true;
        Eorrify("ProfileSelectDegreeGroup", 5);
    }
    if (_city == "انتخاب نشده") {
        _hasError = true;
        Eorrify("#ProfileSelectCityGroup", 5);
    }
    if (_country == "انتخاب نشده") {
        _hasError = true;
        Eorrify("#ProfileSelectCountryGroup", 5);
    }
    if (_gender == "انتخاب نشده") {
        Eorrify("#ProfileSelectGenderGroup", 5);
        _hasError = true;
    }
    //   if (_nationalID == "") {
    //       _hasErroe = true;
    //       Eorrify("#ProfileInterNationalIDGroup");
    //   }
    if (_email == "") {
        _hasError = true;
        Eorrify("#ProfileEmailGroup", 5);
    }
    if (_mobile == "") {
        _hasError = true;
        Eorrify("#ProfileMobileGroup", 5);
    }

    var __gender;
    if (_gender == 1) {
        __gender = false;
    } else {
        __gender = true;
    }

    if (_hasError != true) {
        //  alert("Error Nadare Baba");
        CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سمت سرور... ', -1, null);
        $.getJSON(ServerURL + "Account/EditProfile", {
            username: userName,
            firstName: _firstName,
            lastName: _lastName,
            city: _city,
            country: _country,
            photo: _picture,

            birthday: _birthdate,
            gender: __gender,
            degree: _degree,
            email: _email,
            mobile: _mobile
        }, function (RESULT) {
            //alert(RESULT.Message);
            CustomBlockingPanel('توجه', 'اطلاعات ارسال شد', 1000, null);
            if (RESULT.Status == true) {
                $('#ProfileDetails').fadeOut(1000);
                IsFirstLogIn = false;
            } else {
                CustomAlert('توجه', 'امکان ذخیره سازی در سرور در حال حضور وجود ندارد. لطفا مجددا تلاش نمایید و در صورت مشاهده مجدد این خطا، از سیستم خارج شده و مجددا وارد شوید.', null);
                //TODO : Do SomeThings If Server did not response
            }
        });

    } else {
        CustomAlert('توجه', "لطفا فرم را تکمیل کنید.", null);
    }
}

function ChangePassword() {
    var _currentPassword = $("#ProfileCurrentPassword").val();
    var _newPassword = $("#ProfilePassword").val();
    var _confirmPassword = $("#ProfileConfirmPassword").val();

    var _hasError = false;
    if (_newPassword != _confirmPassword) {
        CustomAlert('توجه', "تکرار کلمه عبور با کلمه عبور وارد شده متفاوت است", null);
        _hasError = true;
    }
    if (_hasError == false && _currentPassword == "") {
        CustomAlert('توجه', "کلمه عبور فعلی را وارد نمایید", null);
        _hasError = true;
    }
    if (_hasError == false && _newPassword == "") {
        CustomAlert('توجه', "کلمه عبور جدید را وارد نمایید", null);
        _hasError = true;
    }
    if (_hasError == false && _confirmPassword == "") {
        CustomAlert('توجه', "تکرار کلمه عبور جدید را وارد نمایید", null);
        _hasError = true;
    }

    if (_hasError == false) {
        var pds = {
            userName: userName,
            oldPassword: _currentPassword,
            newPassword: _newPassword
        };
        CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
        $.getJSON(ServerURL + "Account/ChangePasswordBeta",
            pds, function (result) {
                CustomBlockingPanel('توجه', 'اطلاعات ارسال شد', 1000, null);
                if (result.Status == true) {
                    CustomAlert('توجه', "کلمه عبور شما با موفقیت تغییر گردید.", null);
                } else {
                    CustomAlert('توجه', "خطا در هنکام تغییر رمز عبور", null);
                    CustomAlert('توجه', result.Message, null);
                }
            });
    }
}

function Eorrify(control, step) {
    var controlName = control;

    $(controlName).removeClass("control-group");
    $(controlName).addClass("control-group error CustomtextBoxError");
    setTimeout(function () {
        $(controlName).removeClass("control-group error CustomtextBoxError");
        $(controlName).addClass("control-group");
        if (step > 0) {
            Eorrify(control, step - 1);
        }
    }, 1000);
}

function SearchKeyDown(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        SearchForAccounts(1);
    }
    //	alert ("The Unicode key code is: " + keyCode);
}

function docReady() {
    //prevent # links from moving to top
    $('a[href="#"][data-top!=true]').click(function (e) {
        e.preventDefault();
    });

    //rich text editor
    $('.cleditor').cleditor();

    //datepicker
    $('.datepicker').datepicker();

    //notifications
    $('.noty').click(function (e) {
        e.preventDefault();
        var options = $.parseJSON($(this).attr('data-noty-options'));
        noty(options);
    });


    //uniform - styler for checkbox, radio and file input
    $("input:checkbox, input:radio, input:file").not('[data-no-uniform="true"],#uniform-is-ajax').uniform();

    //chosen - improves select
    $('[data-rel="chosen"],[rel="chosen"]').chosen();

    //tabs
    $('#myTab a:first').tab('show');
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    //makes elements soratble, elements that sort need to have id attribute to save the result
    $('.sortable').sortable({
        revert: true,
        cancel: '.btn,.box-content,.nav-header',
        update: function (event, ui) {
            //line below gives the ids of elements, you can make ajax call here to save it to the database
            //console.log($(this).sortable('toArray'));
        }
    });

    //slider
    $('.slider').slider({
        range: true,
        values: [10, 65]
    });

    //tooltip
    $('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
        "placement": "bottom",
        delay: {
            show: 400,
            hide: 200
        }
    });

    //auto grow textarea
    $('textarea.autogrow').autogrow();

    //popover
    $('[rel="popover"],[data-rel="popover"]').popover();

    //file manager
    var elf = $('.file-manager').elfinder({
        url: 'misc/elfinder-connector/connector.php' // connector URL (REQUIRED)
    }).elfinder('instance');

    //iOS / iPhone style toggle switch
    $('.iphone-toggle').iphoneStyle();

    //star rating
    $('.raty').raty({
        score: 4 //default stars
    });

    //uploadify - multiple uploads
    $('#file_upload').uploadify({
        'swf': 'misc/uploadify.swf',
        'uploader': 'misc/uploadify.php'
        // Put your options here
    });

    //gallery controlls container animation
    $('ul.gallery li').hover(function () {
        $('img', this).fadeToggle(1000);
        $(this).find('.gallery-controls').remove();
        $(this).append('<div class="well gallery-controls">' + '<p><a href="#" class="gallery-edit btn"><i class="icon-edit"></i></a> <a href="#" class="gallery-delete btn"><i class="icon-remove"></i></a></p>' + '</div>');
        $(this).find('.gallery-controls').stop().animate({
            'margin-top': '-1'
        }, 400, 'easeInQuint');
    }, function () {
        $('img', this).fadeToggle(1000);
        $(this).find('.gallery-controls').stop().animate({
            'margin-top': '-30'
        }, 200, 'easeInQuint', function () {
            $(this).remove();
        });
    });


    //gallery image controls example
    //gallery delete
    $('.thumbnails').on('click', '.gallery-delete', function (e) {
        e.preventDefault();
        //get image id
        //alert($(this).parents('.thumbnail').attr('id'));
        $(this).parents('.thumbnail').fadeOut();
    });
    //gallery edit
    $('.thumbnails').on('click', '.gallery-edit', function (e) {
        e.preventDefault();
        //get image id
        //alert($(this).parents('.thumbnail').attr('id'));
    });

    //gallery colorbox
    $('.thumbnail a').colorbox({
        rel: 'thumbnail a',
        transition: "elastic",
        maxWidth: "95%",
        maxHeight: "95%"
    });

    //gallery fullscreen
    $('#toggle-fullscreen').button().click(function () {
        var button = $(this),
            root = document.documentElement;
        if (!button.hasClass('active')) {
            $('#thumbnails').addClass('modal-fullscreen');
            if (root.webkitRequestFullScreen) {
                root.webkitRequestFullScreen(
                    window.Element.ALLOW_KEYBOARD_INPUT);
            } else if (root.mozRequestFullScreen) {
                root.mozRequestFullScreen();
            }
        } else {
            $('#thumbnails').removeClass('modal-fullscreen');
            (document.webkitCancelFullScreen || document.mozCancelFullScreen || $.noop).apply(document);
        }
    });

    //tour
    if ($('.tour').length && typeof (tour) == 'undefined') {
        var tour = new Tour();
        tour.addStep({
            element: ".span10:first",
            /* html element next to which the step popover should be shown */
            placement: "top",
            title: "Custom Tour",
            /* title of the popover */
            content: "You can create tour like this. Click Next." /* content of the popover */
        });
        tour.addStep({
            element: ".theme-container",
            placement: "left",
            title: "Themes",
            content: "You change your theme from here."
        });
        tour.addStep({
            element: "ul.main-menu a:first",
            title: "Dashboard",
            content: "This is your dashboard from here you will find highlights."
        });
        tour.addStep({
            element: "#for-is-ajax",
            title: "Ajax",
            content: "You can change if pages load with Ajax or not."
        });
        tour.addStep({
            element: ".top-nav a:first",
            placement: "bottom",
            title: "Visit Site",
            content: "Visit your front end from here."
        });

        tour.restart();
    }

    //datatable
    $('.datatable').dataTable({
        "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span12'i><'span12 center'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": {
            "sLengthMenu": "_MENU_ records per page"
        }
    });
    $('.btn-close').click(function (e) {
        e.preventDefault();
        $(this).parent().parent().parent().fadeOut();
    });
    $('.btn-minimize').click(function (e) {
        e.preventDefault();
        var $target = $(this).parent().parent().next('.box-content');
        if ($target.is(':visible')) $('i', $(this)).removeClass('icon-chevron-up').addClass('icon-chevron-down');
        else $('i', $(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
        $target.slideToggle();
    });
    $('.btn-setting').click(function (e) {
        e.preventDefault();
        $('#myModal').modal('show');
    });


    //initialize the external events for calender

    $('#external-events div.external-event').each(function () {

        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true, // will cause the event to go back to its
            revertDuration: 0 //  original position after the drag
        });

    });


    //initialize the calendar
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar !!!
        drop: function (date, allDay) { // this function is called when something is dropped

            // retrieve the dropped element's stored Event Object
            var originalEventObject = $(this).data('eventObject');

            // we need to copy it, so that multiple events don't have a reference to the same object
            var copiedEventObject = $.extend({}, originalEventObject);

            // assign it the date that was reported
            copiedEventObject.start = date;
            copiedEventObject.allDay = allDay;

            // render the event on the calendar
            // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
            $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
                // if so, remove the element from the "Draggable Events" list
                $(this).remove();
            }

        }
    });


    //chart with points
    if ($("#sincos").length) {
        var sin = [],
            cos = [];

        for (var i = 0; i < 14; i += 0.5) {
            sin.push([i, Math.sin(i) / i]);
            cos.push([i, Math.cos(i)]);
        }

        var plot = $.plot($("#sincos"), [
            {
                data: sin,
                label: "sin(x)/x"
            },
            {
                data: cos,
                label: "cos(x)"
            }
        ], {
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            },
            grid: {
                hoverable: true,
                clickable: true,
                backgroundColor: {
                    colors: ["#fff", "#eee"]
                }
            },
            yaxis: {
                min: -1.2,
                max: 1.2
            },
            colors: ["#539F2E", "#3C67A5"]
        });

        function showTooltip(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css({
                position: 'absolute',
                display: 'none',
                top: y + 5,
                left: x + 5,
                border: '1px solid #fdd',
                padding: '2px',
                'background-color': '#dfeffc',
                opacity: 0.80
            }).appendTo("body").fadeIn(200);
        }

        var previousPoint = null;
        $("#sincos").bind("plothover", function (event, pos, item) {
            $("#x").text(pos.x.toFixed(2));
            $("#y").text(pos.y.toFixed(2));

            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);

                    showTooltip(item.pageX, item.pageY,
                            item.series.label + " of " + x + " = " + y);
                }
            } else {
                $("#tooltip").remove();
                previousPoint = null;
            }
        });


        $("#sincos").bind("plotclick", function (event, pos, item) {
            if (item) {
                $("#clickdata").text("You clicked point " + item.dataIndex + " in " + item.series.label + ".");
                plot.highlight(item.series, item.datapoint);
            }
        });
    }

    //flot chart
    if ($("#flotchart").length) {
        var d1 = [];
        for (var i = 0; i < Math.PI * 2; i += 0.25)
            d1.push([i, Math.sin(i)]);

        var d2 = [];
        for (var i = 0; i < Math.PI * 2; i += 0.25)
            d2.push([i, Math.cos(i)]);

        var d3 = [];
        for (var i = 0; i < Math.PI * 2; i += 0.1)
            d3.push([i, Math.tan(i)]);

        $.plot($("#flotchart"), [
            {
                label: "sin(x)",
                data: d1
            },
            {
                label: "cos(x)",
                data: d2
            },
            {
                label: "tan(x)",
                data: d3
            }
        ], {
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                ticks: [0, [Math.PI / 2, "\u03c0/2"],
                    [Math.PI, "\u03c0"],
                    [Math.PI * 3 / 2, "3\u03c0/2"],
                    [Math.PI * 2, "2\u03c0"]
                ]
            },
            yaxis: {
                ticks: 10,
                min: -2,
                max: 2
            },
            grid: {
                backgroundColor: {
                    colors: ["#fff", "#eee"]
                }
            }
        });
    }

    //stack chart
    if ($("#stackchart").length) {
        var d1 = [];
        for (var i = 0; i <= 10; i += 1)
            d1.push([i, parseInt(Math.random() * 30)]);

        var d2 = [];
        for (var i = 0; i <= 10; i += 1)
            d2.push([i, parseInt(Math.random() * 30)]);

        var d3 = [];
        for (var i = 0; i <= 10; i += 1)
            d3.push([i, parseInt(Math.random() * 30)]);

        var stack = 0,
            bars = true,
            lines = false,
            steps = false;

        function plotWithOptions() {
            $.plot($("#stackchart"), [d1, d2, d3], {
                series: {
                    stack: stack,
                    lines: {
                        show: lines,
                        fill: true,
                        steps: steps
                    },
                    bars: {
                        show: bars,
                        barWidth: 0.6
                    }
                }
            });
        }

        plotWithOptions();

        $(".stackControls input").click(function (e) {
            e.preventDefault();
            stack = $(this).val() == "With stacking" ? true : null;
            plotWithOptions();
        });
        $(".graphControls input").click(function (e) {
            e.preventDefault();
            bars = $(this).val().indexOf("Bars") != -1;
            lines = $(this).val().indexOf("Lines") != -1;
            steps = $(this).val().indexOf("steps") != -1;
            plotWithOptions();
        });
    }

    //pie chart
    var data = [
        {
            label: "Internet Explorer",
            data: 12
        },
        {
            label: "Mobile",
            data: 27
        },
        {
            label: "Safari",
            data: 85
        },
        {
            label: "Opera",
            data: 64
        },
        {
            label: "Firefox",
            data: 90
        },
        {
            label: "Chrome",
            data: 112
        }
    ];

    if ($("#piechart").length) {
        $.plot($("#piechart"), data, {
            series: {
                pie: {
                    show: true
                }
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            legend: {
                show: false
            }
        });

        function pieHover(event, pos, obj) {
            if (!obj) return;
            percent = parseFloat(obj.series.percent).toFixed(2);
            $("#hover").html('<span style="font-weight: bold; color: ' + obj.series.color + '">' + obj.series.label + ' (' + percent + '%)</span>');
        }

        $("#piechart").bind("plothover", pieHover);
    }

    //donut chart
    if ($("#donutchart").length) {
        $.plot($("#donutchart"), data, {
            series: {
                pie: {
                    innerRadius: 0.5,
                    show: true
                }
            },
            legend: {
                show: false
            }
        });
    }


    // we use an inline data source in the example, usually data would
    // be fetched from a server
    var data = [],
        totalPoints = 300;

    function getRandomData() {
        if (data.length > 0) data = data.slice(1);

        // do a random walk
        while (data.length < totalPoints) {
            var prev = data.length > 0 ? data[data.length - 1] : 50;
            var y = prev + Math.random() * 10 - 5;
            if (y < 0) y = 0;
            if (y > 100) y = 100;
            data.push(y);
        }

        // zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < data.length; ++i)
            res.push([i, data[i]])
        return res;
    }

    // setup control widget
    var updateInterval = 30;
    $("#updateInterval").val(updateInterval).change(function () {
        var v = $(this).val();
        if (v && !isNaN(+v)) {
            updateInterval = +v;
            if (updateInterval < 1) updateInterval = 1;
            if (updateInterval > 2000) updateInterval = 2000;
            $(this).val("" + updateInterval);
        }
    });

    //realtime chart
    if ($("#realtimechart").length) {
        var options = {
            series: {
                shadowSize: 1
            }, // drawing is faster without shadows
            yaxis: {
                min: 0,
                max: 100
            },
            xaxis: {
                show: false
            }
        };
        var plot = $.plot($("#realtimechart"), [getRandomData()], options);

        function update() {
            plot.setData([getRandomData()]);
            // since the axes don't change, we don't need to call plot.setupGrid()
            plot.draw();

            setTimeout(update, updateInterval);
        }

        update();
    }
}


//additional functions for data table
$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
    return {
        "iStart": oSettings._iDisplayStart,
        "iEnd": oSettings.fnDisplayEnd(),
        "iLength": oSettings._iDisplayLength,
        "iTotal": oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
    };
}
$.extend($.fn.dataTableExt.oPagination, {
    "bootstrap": {
        "fnInit": function (oSettings, nPaging, fnDraw) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function (e) {
                e.preventDefault();
                if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
                    fnDraw(oSettings);
                }
            };

            $(nPaging).addClass('pagination').append('<ul>' + '<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' + '<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' + '</ul>');
            var els = $('a', nPaging);
            $(els[0]).bind('click.DT', {
                action: "previous"
            }, fnClickHandler);
            $(els[1]).bind('click.DT', {
                action: "next"
            }, fnClickHandler);
        },

        "fnUpdate": function (oSettings, fnDraw) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

            if (oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            } else if (oPaging.iPage <= iHalf) {
                iStart = 1;
                iEnd = iListLength;
            } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }

            for (i = 0, iLen = an.length; i < iLen; i++) {
                // remove the middle elements
                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                // add the new list items and their event handlers
                for (j = iStart; j <= iEnd; j++) {
                    sClass = (j == oPaging.iPage + 1) ? 'class="active"' : '';
                    $('<li ' + sClass + '><a href="#">' + j + '</a></li>')
                        .insertBefore($('li:last', an[i])[0])
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
                            fnDraw(oSettings);
                        });
                }

                // add / remove disabled classes from the static elements
                if (oPaging.iPage === 0) {
                    $('li:first', an[i]).addClass('disabled');
                } else {
                    $('li:first', an[i]).removeClass('disabled');
                }

                if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
                    $('li:last', an[i]).addClass('disabled');
                } else {
                    $('li:last', an[i]).removeClass('disabled');
                }
            }
        }
    }
});