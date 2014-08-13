/**
 * Created with JetBrains WebStorm.
 * User: hiva
 * Date: 1/23/13
 * Time: 5:12 PM
 * To change this template use File | Settings | File Templates.
 */

var CurrentSlidePage;
var userName;
var CurrentSeminarID;
var SeminarServiceList = [];
var index = -1;

function GetUserName() {
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserName",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                userName = result.user;

            } else {
                window.location = ServerURL + "index.html";
            }
        },
        async: false
    });
}

function ShowControlPanel(isControlPanel) {
    if (isControlPanel == true) {
        window.location = "blank.html";
        //$("#SeminarMode").hide();
        //$("#ControlPanelMode").show();
    }
    else {
        //$("#SeminarMode").hide();
        //$("#ControlPanelMode").hide();
        window.location = "presentationroom.html";
    }
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

function GoToSeminar(seminarID) {
    GetUserName();
    //Get The Seminar Information
    window.scrollTo(0, 0);
    CurrentSeminarID = seminarID;
    LastMessageId = -1;
    $.getJSON(ServerURL + "Session/SessionSearchByID",
        {sessionId: seminarID},
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
                var CurrentSeminar =
                {
                    m_seminarID: response.Result.id,
                    m_seminarName: response.Result.name,
                    m_seminarPresentorName: response.Result.presentor,
                    m_seminarBeginTime: GetPrsianDate(response.Result.beginTime),
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
                //	$( "#SeminarFilesExplorerTable tbody tr" ).each( function(){
                //	this.parentNode.removeChild( this );


                //});
                //GetListOfSessionFilesForSeminar(seminarID);


                //End Of Files
                //Get The Session Service Information

                $.getJSON(ServerURL + "Session/GetUrlServiceForUser",
                    {
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
                                var serviceIno =
                                {
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
                                }
                                else if (serviceIno.m_serviceType.indexOf("VoiceOnly") == -1) {
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
                            seminarVideo.src = "http://94.232.174.204:7700/Test3.ogg";//lower.m_url;
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
                            }
                            else {
                                //$("#SeminarMasterContent").hide();
                            }

                            //Tell The Server That I AM here

                            SetMyAvailability(seminarID, userName, 0);
                            //Show Seminar Information
                            //ShowControlPanel(false);
                        }
                        else {
                            //TODO : Show Error Message that tel me there is not any access rule for seminar
                            alert("1" + response.Message);
                        }
                    });

                //TODO : Calculate Remaining Time And Calculate Remaining Capacity
            }
            else {
                //TODO : Error
                alert("2" + response.Message);
            }
        }
    );

}

function SetMyAvailability(_seminarID, _userName, ttl) {
    if (ttl < 10) {
        $.getJSON(ServerURL + "Session/SetUserInSession",
            {
                userName: _userName,
                sessionId: _seminarID
            }, function (result) {
                if (result.Status != true) {
                    SetMyAvailability(_seminarID, _userName, ttl + 1);
                    //						alert(result.Message);
                }
                else {
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
            }
            else {
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
    }
    else {
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
    }
    else {
        var player = document.getElementById("SeminarMasterContentPlayer");
        player.stop();
        player.src = "";
        $("#SeminarContentVideoBandwidth").html("");
        $("#SeminarContentVideoCodec").html("");
        $("#MasterVideoContentSettingDialog").modal('hide');
    }
}

var SeminarServiceList = [];

function GetListOfSessionFilesForSeminar(sessionID) {
    $.getJSON(ServerURL + "Session/ShowFiles",
        {
            sessionId: sessionID,
            fileId: index
        }
        , function (result) {
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
            }
            else {
                //alert(result.Message);
                index = -1;
            }
        });
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
        $.getJSON(ServerURL + "Session/SendMessage",
            {
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
                }
                else {
                    $("#WaitForMakeQuestion").html("با خطا روبرو شد");
                    setTimeout(function () {
                        $("#SendQuestionButton").show();
                        $("#WaitForMakeQuestion").hide();
                    }, 5000);
                }
            });
    }
}


function RejectQuestion(messageID) {
    var id = "#Chat" + messageID;
    var btnID = "#ChatReject" + messageID;
    var btnID2 = "#ChatAnswer" + messageID;
    //RejectQuestion(int questionID, string userName)
    $.getJSON(ServerURL + "Session/RejectQuestion",
        {
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
    $.getJSON(ServerURL + "Session/AcceptQuestion",
        {
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
                }
                else if (result.Result[i].status == 2) {
                    colorify = "alert-success";
                }
                else {
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


                $('#SeminarChatBoard').stop().animate({ scrollTop: $("#SeminarChatBoard")[0].scrollHeight }, 800);

                LastMessageId = result.Result[i].id;
            }
        }
        else {
            alert(result.Message);
        }

        chatBoardUpdaterID = setInterval(function () {
            ChatBoardUpdateHandler(seminarID);
        }, 1000);

    });
}


function ReFetchVideo() {
    try {
        $("#SeminarMasterVideoPlayer").stop();
        $("#SeminarMasterVideoPlayer").load();
        $("#SeminarMasterVideoPlayer").play();
    }
    catch (exception) {
    }
}

function ShowParticipantList() {
    $("#SeminarParticipants").modal('show');
    GetListOfParticipant();
}

function GetListOfParticipant() {
    try {
        $("#SeminarParticipantsHolderTable tbody tr").each(function () {
            this.parentNode.removeChild(this);
        });
        $.getJSON(ServerURL + "Session/GetParticipants",
            {
                sessionId: CurrentSeminarID
            }, function (result) {
                if (result.Status == true) {
                    for (var i = 0; i < result.Result.length; i++) {
                        var newRow = "<tr>";
                        newRow += "<td style='text-align:center;'>" + result.Result[i].firstName + "</td>";
                        newRow += "<td style='text-align:center;'>" + result.Result[i].lastName + "</td>";
                        newRow += "<td style='text-align:center;'>" + result.Result[i].userName + "</td>";
                        if (result.Result[i].isInvited == true) {
                            newRow += "<td style='text-align:center;'>" + "مدعو" + "</td>";
                        }
                        else {
                            newRow += "<td style='text-align:center;'>" + "درخواستی" + "</td>";
                        }
                        newRow += "</tr>";
                        $("#SeminarParticipantsHolderTable").append(newRow);
                    }

                }
                else {
                    alert(result.Message);
                }
            });
    }
    catch (exception) {
    }
}
function ChatBoardUpdater(seminarID) {
    $("#SeminarChatBoard").html("");
    chatBoardUpdaterID = setInterval(function () {
        ChatBoardUpdateHandler(seminarID);
    }, 1000);
}
function GetListOfSessionFilesForSeminarInfo(sessionID) {
    $.getJSON(ServerURL + "Session/ShowFiles",
        {
            sessionId: sessionID,
            fileId: index
        }
        , function (result) {
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
                        }
                        else {
                            newRow += '<button  class="btn btn-inverse" style="font-family:tahoma;" onclick="SetAsSeminarContent(' + result.Result[i].fileId + "," + sessionID + ');"><i class="icon-trash icon-white"></i>به عنوان اسلاید</button>';
                        }

                        newRow += '</td>';


                    }
                    else {
                        newRow += "<td></td>";
                    }
                    newRow += '<td style="text-align:center;" class="center" ><button id="SeminarInfoButton' + result.Result[i].fileId + '" class="btn btn-danger" style="font-family:tahoma;" onclick=" SelectedFileForDelete = $(this).parent().parent(); deleteFiles(' + result.Result[i].fileId + '); "><i class="icon-trash icon-white"></i>حذف</button></td>';
                    newRow += "</tr>";
                    table.append(newRow);
                }
                setTimeout(function () {
                    GetListOfSessionFilesForSeminarInfo(sessionID);
                }, 1000);
            }
            else {
                //alert(result.Message);
                index = -1;
            }
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
    }
    else {
        _msg = _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    }
    return _msg;
}
