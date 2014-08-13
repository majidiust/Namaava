// JavaScript Document
var userName = "";
var pass = "";

function LogInToTest() {
    //	LogInToTestSuite
    userName = $("#username").val();
    pass = $("#password").val();


    if (userName == "") {
        $("#LoginMessage").html("نام کاربری را وارد کنید");
        $("#LoginMessage").show();
        setTimeout(function () {
            $("#LoginMessage").hide();
        }, 5000);
    }
    else if (pass == "") {
        $("#LoginMessage").html("کلمه عبور را وارد کنید.");
        $("#LoginMessage").show();
        setTimeout(function () {
            $("#LoginMessage").hide();
        }, 5000);
    }
    else {
        $.getJSON(ServerURL + "Session/LogInToTestSuite",
            {
                userName: userName,
                pass: pass
            },
            function (result) {

                if (result.Status == true) {
                    $("#TestLogInForm").hide();
                    $("#SuggestionForm").show();
                    var myVideo = document.getElementById("videoPlayer");
                    myVideo.src = (result.URL);
                    myVideo.load();
                    myVideo.play();
                }
                else {
                    if (result.Message.indexOf("Exist") != -1) {
                        $("#LoginMessage").html("نام کاربری وجود ندارد");
                        $("#LoginMessage").show();
                        setTimeout(function () {
                            $("#LoginMessage").hide();
                        }, 5000);
                    }
                    else if (result.Message.indexOf("Password") != -1) {
                        $("#LoginMessage").html("کلمه عبور اشتباه است");
                        $("#LoginMessage").show();
                        setTimeout(function () {
                            $("#LoginMessage").hide();
                        }, 5000);
                    }
                    else {
                        $("#LoginMessage").html(result.Message);
                        $("#LoginMessage").show();
                        setTimeout(function () {
                            $("#LoginMessage").hide();
                        }, 5000);
                    }
                }
            });
    }
}

function SubmitSuggestion() {
    var bandwidth = $("#Bandwidth").val();
    var browser = $("#Browser").val();
    var vid = $("#SeenVideo").val();
    var suggestion = $("#Suggestion").val();
    var codec = $("#Codec").val();

    if (userName != "" && pass != "") {
        //public ActionResult SubmitTestSuiteSuggestion(string userName, string pass, string bandwidth, string browser, string hasVideo, string codec, string suggestion)
        $.getJSON(ServerURL + "Session/SubmitTestSuiteSuggestion",
            {
                userName: userName,
                pass: pass,
                bandwidth: bandwidth,
                browser: browser,
                hasVideo: vid,
                codec: codec,
                suggestion: suggestion
            },
            function (result) {
                if (result.Status == true) {
                    alert("نظر شما ثبت گردید");
                }
                else {
                    alert("لطفا مجددا تلاش کنید.");
                }
            });

    }
}