var CurrentSlidePage;
var userName;
var CurrentSeminarID = 190;
var SeminarServiceList = [];
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
function GoToSeminar(seminarID) {
    //Get The Seminar Information
    window.scrollTo(0, 0);
    CurrentSeminarID = seminarID;
    LastMessageId = -1;
    $.getJSON(ServerURL + "Session/SessionSearchDemo",
        {},
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

                ///////////////////ChatBoardUpdater(CurrentSeminar.m_seminarID);
                //}
                //Get List Of Files
                // id="SeminarFilesExplorer"
                //$("#SeminarFilesExplorerTable").empty();
                /////////       $( "#SeminarFilesExplorerTable tbody tr" ).each( function(){
                ////////////           this.parentNode.removeChild( this );
                ///////////       });
                ///////////       GetListOfSessionFilesForSeminar(seminarID);


                //End Of Files
                //Get The Session Service Information

                $.getJSON(ServerURL + "Session/GetUrlServiceForDemo",
                    {

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
                                CurrentSlidePage = 1;
                                var imageSrc = ServerURL + "Seminars/demo/PowerPoint/" + CurrentSlidePage + ".png";
                                $("#SeminarMasterContentImage").attr(
                                    'src',
                                    imageSrc
                                );
                                $("#SeminarMasterContent").show();

                                ShowSlide(1);
                            }
                            else {
                                $("#SeminarMasterContent").hide();
                            }

                            //Tell The Server That I AM here

                            //Show Seminar Information
                            ShowControlPanel(false);
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
$(document).ready(function () {
    GoToSeminar(190);

});

function ShowSlide(slideNumber) {

    var numberOfSlide = -1;


    $.ajax({
        type: 'GET',
        url: ServerURL + "Session/GetNumberOfDemoSessionSlides",
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

        },
        async: false
    });

    if (slideNumber <= numberOfSlide && slideNumber > 0) {
        CurrentSlidePage = slideNumber;
        var imageSrc = ServerURL + "Seminars/demo/PowerPoint/" + slideNumber + ".png";
        $("#SeminarMasterContentImage").attr(
            'src',
            imageSrc
        );
        $("#SeminarMasterContentPageNumber").html(slideNumber + "/" + numberOfSlide);
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
function SendMessageViaKeyboard(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        SendQuestionToMaster();
    }
}
