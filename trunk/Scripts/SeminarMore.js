// JavaScript Document
var index = -1;
var pageSize = 50;
var selectId = -1;

function ParseCustomInt(argDate) {
    if (argDate[0] == '0')
        return argDate[1];
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
    var _msg = "ساعت " + _splitedDate[3] + " ، " + _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    return _msg;
}

function GetSeminarInfo(sessionId) {
    $('#PleaseWait').show();
    $.getJSON(ServerURL + "Session/SessionSearchById", {sessionId: sessionId}, function (result) {
        $('#PleaseWait').hide();
        if (result.Status == true) {
            $("#WebinarName").html(result.Result.name);
            $("#WebinarBeginTime").html(GetPrsianDate(result.Result.beginTime));
            $("#WebinarHolder").html(result.Result.admin);
            $("#WebinarPresentor").html(result.Result.presentor);
            $("#WebinarRemain").html(result.Result.remained);
            var status = "";
            if (result.Result.status.indexOf("Scheduled") != -1) {
                status = "برنامه‌ریزی شده";
            } else if (result.Result.status.indexOf("Close") != -1) {
                status = "بسته و ضبط شده";
            } else if (result.Result.status.indexOf("Open") != -1) {
                status = "در حال اجرا";
            }
            $("#WebinarStatus").html(status);
            $("#WebinarDuration").html(result.Result.duration);
            var fee = (result.Result.fee == -1 || result.Result.fee == 0) ? 'رایگان' : (result.Result.fee + ' تومان ');
            $("#WebinarFee").html(fee);
            $("#WebinarPresentorDetails").html(result.Result.presentor);
            $("#WebinarPresentorPic").prop('src', 'http://iwebinar.ir/Pics/Users/Originals/' + result.Result.presentorUserName + '.png');
            $("#WebinarHolderPic").prop('src', 'http://iwebinar.ir/Pics/Users/Originals/' + result.Result.adminUserName + '.png');
            $("#WebinarHolderDetails").html(result.Result.admin);
            $("#WebinarWhy").html(result.Result.why);
            $("#WebinarForWho").html(result.Result.forWho);
            $("#WebinarLevel").html(result.Result.level);
            $("#WebinarPoster").prop('src', 'http://iwebinar.ir/' + result.Result.poster);

            $("#Details").show();
        }
        else {
            alert(result.Message);
        }

        walk(document.body, replaceNumbers);
    });
}

function LoadSeminars() {
    $('#PleaseWait').show();
    $.getJSON(ServerURL + "Session/AllSearchSession",
        {
            index: index,
            pageSize: pageSize
        },
        function (result) {
            $('#PleaseWait').hide();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {
                    //  var newRow = "<tr>";
                    {
                        //alert(result.Result.SearchResult[i].poster);

                        var newRecord = '<center><div id="' + result.Result.SearchResult[i].id + '" style="width:80%;border:thin;border-radius:10px;border-style:solid;border-radius: 10px;-moz-border-radius: 10px;-webkit-border-radius: 10px; -moz-box-shadow:    inset 0 0 10px #000000;-webkit-box-shadow: inset 0 0 10px #000000;   box-shadow:         inset 0 0 10px #000000;;margin-top:10px;margin-bottom:10px">';

                        //var newRecord = '<td style="width:33%;">';
                        //newRecord += '<div class="imgholder"><a href="#"><img src="images/demo/290x100.gif" alt="" /></a></div>';
                        newRecord += '<br/><center><div style="width:100%;text-shadow: 1px 1px 10px #806e80;filter: dropshadow(color=#806e80, offx=1, offy=1);font-size:16px;font-family:tahoma;font-weight:bold;"  >' + result.Result.SearchResult[i].name + '</div></center>';
                        //newRecord +=  '<br/>' + result.Result.SearchResult[i].name ;
                        newRecord += '<center><table style="width:90%;border:none;">';
                        newRecord += '<tr>';
                        newRecord += '<td rowspan="8" height="100%" style="width:100px;border:none;text-align:center; vertical-align:middle;" align="center" valign="middle"><center><img style="border-radius:10px;	-webkit-border-radius:10px;	-moz-border-radius:10px;margin-top:10%; background-color:transparent; " src="' + result.Result.SearchResult[i].poster + '" width="150px" height="150px"/></center><center>' + '<table style="border:none"><tr onclick="alert(' + result.Result.SearchResult[i].id + ');" style="cursor:pointer;border:none"><td valign="middle" style="border:none"><img style="width:20px;height:20px;" src="images/chat.png"/></td><td style="border:none">اطلاعات بیشتر</td></tr></table></center></td>';
                        newRecord += '<td colspan="2"   style="float:right;width:100px;border:none;text-align:justify" align="center"><center></center></td>';

                        newRecord += '<td style="float:right;border:none;text-align:justify"></td>';
                        newRecord += '</tr>';

                        newRecord += '<tr>';
                        newRecord += '<td colspan="3" style="font-weight:bold;float:right;border:none;text-align:justify" id="SeinarTime" align="center" ><center>' + GetPrsianDate(result.Result.SearchResult[i].beginTime) + '</center></td>';
                        newRecord += '</tr>';


                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">برگزار کننده</td>';
                        newRecord += '<td colspan="2" style="float:right;;border:none;text-align:justify" id="SeminarHolder">' + result.Result.SearchResult[i].adminUserName + '</td>';
                        // newRecord += '<td style="float:right;border:none;text-align:justify"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">ارائه دهنده</td>';
                        newRecord += '<td  colspan="2" style="float:right;border:none;text-align:justify" id="SeminarPresentor">' + result.Result.SearchResult[i].presentorUserName + '</td>';
                        // newRecord += '<td  style="border:none;"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">ظرفیت باقی مانده</td>';
                        newRecord += '<td colspan="2" style="float:right;border:none;text-align:justify" id="SeminarRemain">' + result.Result.SearchResult[i].remained + '</td>';
                        //  newRecord += '<td colspan="2" style="border:none;"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">وضعیت سمینار</td>';
                        if (result.Result.SearchResult[i].status.indexOf("Scheduled") != -1) {
                            newRecord += '<td  style="float:right;border:none;text-align:justify" id="SeminarStatus">' + "برنامه‌ریزی شده" + '</td>';
                        } else if (result.Result.SearchResult[i].status.indexOf("Close") != -1) {
                            newRecord += '<td  style="float:right;border:none;text-align:justify" id="SeminarStatus">' + "بسته و ضبط شده" + '</td>';
                        } else if (result.Result.SearchResult[i].status.indexOf("Open") != -1) {
                            newRecord += '<td  style="float:right;border:none;text-align:justify" id="SeminarStatus">' + "در حال اجرا" + '</td>';
                        }
                        newRecord += '<td style="border:none;"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">مدت سمینار</td>';
                        newRecord += '<td style="float:right;border:none;text-align:justify" id="SeminarDuration">' + result.Result.SearchResult[i].duration + 'ساعت</td>';
                        newRecord += '<td style="float:right;border:none;text-align:justify"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  style="float:right;width:100px;border:none;text-align:justify">هزینه شرکت</td>';
                        var fee = (result.Result.SearchResult[i].fee == -1 || result.Result.SearchResult[i].fee == 0) ? 'رایگان' : (result.Result.SearchResult[i].fee + ' تومان ');
                        newRecord += '<td style="float:right;border:none;text-align:justify" id="SeminarFee">' + fee + '</td>';
                        newRecord += '<td style="float:right;border:none;text-align:justify"></td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td colspan="3" style="float:right;width:100px;border:none;text-align:justify"> <br/> </td>';
                        newRecord += '</tr>';
                        newRecord += '<tr>';
                        newRecord += '<td  colspan="3" style="width:100px;border:none;text-align:justify">';
                        newRecord += '<center>';
                        if (result.Result.SearchResult[i].status == 'Closed')
                            newRecord += '<input type="submit"  class="gobutton"   value="درخواست فیلم سمینار" onclick="ReuestForSeminar(' + result.Result.SearchResult[i].id + ',true);" style="font-family:Tahoma, Geneva, sans-serif; margin-bottom:5px;"/>';
                        else
                            newRecord += '<input type="submit"   class="gobutton"  value="درخواست شرکت در سمینار" onclick="ReuestForSeminar(' + result.Result.SearchResult[i].id + ',false);" style="font-family:Tahoma, Geneva, sans-serif; margin-bottom:5px;"/>';

                        newRecord += '</center>';
                        newRecord += '</td>';
                        newRecord += '</tr>';
                        newRecord += '</table></center>';
                        newRecord += '</div>';
                        newRecord += '</center>';
                        // newRow += newRecord;
                    }
                    //  newRow += "</tr>";

                    $("#services").append(newRecord);
                }
                walk(document.body, replaceNumbers);
            }
            else {
                alert(result.Message);
            }
        });
}
var userName;
var loggedIn;
var email;
var mobile;
var hasRequested;
function ReuestForSeminar(seminarID, offline) {
    $("#msg2").hide();
    $("#msg1").hide();

    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/IsLoggedIn",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                userName = result.user;
                email = result.email;
                mobile = result.mobile;
                loggedIn = true;
                _email = email;
                $("#EmailErrorMessage").html("");
                $("#RequestForm1").hide();
                $("#RequestForm2").hide();
                $("#RequestForm3").hide();
                $("#WaitingRequest").hide();
                $("#RequestMessage").hide();
                $("#EndOfRequest").hide();

                $.ajax({
                    type: 'GET',
                    url: ServerURL + "Session/CheckRequestResult",

                    dataType: 'json',
                    success: function (result) {
                        if (result.Status == true) {
                            if (result.Result.Exist == true) {
                                hasRequested = true;
                                $("#EmailErrorMessage").html("");
                                $("#RequestForm1").hide();
                                $("#RequestForm2").hide();
                                $("#RequestForm3").hide();

                                _message = "شما قبلا برای این سمینار درخواست داده اید و کد رهگیری شما " + result.Result.Code + " است.";
                                $("#RequestMessageText").html(_message);
                                $("#RequestMessage").show();
                                $("#EndOfRequest").show();
                            }
                            else {
                                hasRequested = false;
                                $("#msg3").show();
                                $("#RequestForm3").show();
                            }
                        }
                        else {
                            $("#msg3").show();
                            hasRequested = false;
                            $("#RequestForm3").show();
                        }
                    },
                    data: {sessionId: seminarID, email: _email},
                    async: true

                });


                $('#basic-modal-content').modal();
                selectId = seminarID;
            }
            else {
                //	$("#msg3").show();
                hasRequested = false;


                loggedIn = false;
                /*if (offline == true) {
                 $("#msg2").show();
                 }
                 else {
                 $("#msg1").show();
                 }
                 $("#EmailErrorMessage").html("");
                 $("#RequestForm1").show();
                 $("#RequestForm2").show();
                 $("#RequestForm3").show();
                 $("#WaitingRequest").hide();
                 $("#RequestMessage").hide();
                 $("#EndOfRequest").hide();
                 $('#basic-modal-content').modal();
                 selectId = seminarID;*/
                $("#MsgForRequest").show();
                $("#HeaderRequest").hide();
                $("#RegisterBox").modal();
            }
        },
        data: {},
        async: false
    });
}


function SendRequestForSeminar() {
    if (hasRequested != true) {
        $("#msg3").show();
        var seminarID = selectId;
        var _email = $("#SeminarRequestEmail").val();
        var _phone = $("#SeminarRequestMobile").val();
        if (_phone == "")
            _phone = -1;
        if (loggedIn == true) {
            _email = email;
            _phone = mobile;
            $("#EmailErrorMessage").html("");
            $("#RequestForm1").hide();
            $("#RequestForm2").hide();
            $("#RequestForm3").hide();
            $("#WaitingRequest").show();
            //		sessionId, string email, string mobile
            $.getJSON(ServerURL + "Session/RequestToParticipate",
                {
                    sessionId: seminarID,
                    email: _email,
                    mobile: _phone
                },
                function (result) {
                    if (result.Status == true) {
                        $("#WaitingRequest").hide();
                        $("#RequestMessage").show();
                        var _message = "درخواست شما ثبت شد و کد رهگیری شما : " + result.Result.followUpCode;
                        $("#RequestMessageText").html(_message);
                        $("#EndOfRequest").show();
                    }
                    else {
                        $("#WaitingRequest").hide();
                        $("#RequestMessage").show();
                        var _message = "ثبت درخواست با خطا روبرو شده است. لصفا دقایقی دیگر تلاش نمایید.";
                        if (result.Message.indexOf("Exist") != -1);
                        _message = "شما قبلا برای این سمینار درخواست داده اید و در حال بررسی است.";
                        $("#RequestMessageText").html(result.Message);
                        $("#EndOfRequest").show();
                    }
                });
        }
        else {

            if (_email == "") {
                $("#EmailErrorMessage").html("لطفا پست الکترونیکی را وارد کنید.");
                setTimeout(function () {
                    $("#EmailErrorMessage").html("");
                }, 5000);
            }
            else if (validEmail(_email) == false) {
                $("#EmailErrorMessage").html("لطفا پست الکترونیکی را  صحیح وارد کنید.");
                setTimeout(function () {
                    $("#EmailErrorMessage").html("");
                }, 5000);
            }

            else {
                $("#EmailErrorMessage").html("");
                $("#RequestForm1").hide();
                $("#RequestForm2").hide();
                $("#RequestForm3").hide();
                $("#WaitingRequest").show();
                //		sessionId, string email, string mobile
                $.getJSON(ServerURL + "Session/RequestToParticipate",
                    {
                        sessionId: seminarID,
                        email: _email,
                        mobile: _phone
                    },
                    function (result) {
                        if (result.Status == true) {
                            $("#WaitingRequest").hide();
                            $("#RequestMessage").show();
                            var _message = "درخواست شما ثبت شد و کد رهگیری شما : " + result.Result.followUpCode;
                            $("#RequestMessageText").html(_message);
                            $("#EndOfRequest").show();
                        }
                        else {
                            $("#WaitingRequest").hide();
                            $("#RequestMessage").show();
                            var _message = "ثبت درخواست با خطا روبرو شده است. لصفا دقایقی دیگر تلاش نمایید.";
                            if (result.Message.indexOf("Exist") != -1);
                            _message = "شما قبلا برای این سمینار درخواست داده اید و در حال بررسی است.";
                            $("#RequestMessageText").html(result.Message);
                            $("#EndOfRequest").show();
                        }
                    });
                //Send Request and Get ID
            }
        }
    }
}

