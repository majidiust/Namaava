var isShowRegisterationForm = false;
var index = -1;
var pageSize = 50;
var selectId = -1;
var news = [];

function LoginToAccountUp() {
    var m_userName = $("#usernameUp").val();
    var m_password = $("#passwordUp").val();
    if (m_userName == "" || m_password == "") {
        $("#LoginMessageUp").html("نام کاربری و کلمه عبور را وارد کنید.");
        $("#LoginMessageUp").show('slow');
        setTimeout(function () {
            $("#LoginMessageUp").hide('slow');
        }, 3000);
    } else {
        $("#LoginMessageUp").html("در حال بررسی نام کاربری و کلمه عبور");
        $("#LoginButtonUp").hide('slow');
        $("#LoginMessageUp").show('slow');
        //Call Ajax
        LoginData = {
            username: m_userName,
            password: m_password,
            rememberMe: true
        };

        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/SignInToServer",
            dataType: 'json',
            success: function (result) {

                if (result.Status == true) {
                    $("#LoginMessageUp").html("در حال ورود به سامانه");
                    $("#LoginMessageUp").show('slow');
                    //Login To System
                    setTimeout(function () {
                        DetectLoggedInUser();
                        $.modal.close();
                    }, 1000);

                    try {
                        $("#UserDetails").show();
                        $("#loginbox2").hide();
                    }
                    catch (err) {
                        console.log(err);
                    }
                } else {
                    //alert(result.Message);
                    if (result.Message.indexOf("another") != -1) {
                        $("#LoginMessageUp").html("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");
                        setTimeout(function () {
                            $("#LoginMessageUp").hide('slow');
                            $("#LoginButtonUp").show('slow');
                        }, 3000);
                    } else {

                        if (result.Message.indexOf("activated") != -1) {
                            $("#LoginMessageUp").html("نام کاربری شما فعال نشده است.");
                        } else if (result.Message.indexOf("approved") != -1) {
                            $("#LoginMessageUp").html("نام کاربری شما هنوز تایید نشده است.");
                        } else {

                            $("#LoginMessageUp").html("نام کاربری و یا کلمه عبور نادرست است.");
                        }

                        setTimeout(function () {
                            $("#LoginMessageUp").hide('slow');
                            $("#LoginButtonUp").show('slow');
                        }, 3000);
                    }

                }
            },
            data: LoginData,
            async: true

        });
    }
}


function LoginToAccountCenter() {
    var m_userName = $("#usernamecenter").val();
    var m_password = $("#passwordcenter").val();
    if (m_userName == "" || m_password == "") {
        $("#LoginMessageUp2").html("نام کاربری و کلمه عبور را وارد کنید.");
        $("#LoginMessageUp2").show('slow');
        setTimeout(function () {
            $("#LoginMessageUp2").hide('slow');
        }, 3000);
    } else {
        $("#LoginMessageUp2").html("در حال بررسی نام کاربری و کلمه عبور");
        $("#LoginButtonUp2").hide('slow');
        $("#LoginMessageUp2").show('slow');
        //Call Ajax
        LoginData = {
            username: m_userName,
            password: m_password,
            rememberMe: true
        };

        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/SignInToServer",
            dataType: 'json',
            success: function (result) {

                if (result.Status == true) {
                    $("#LoginMessageUp2").html("در حال ورود به سامانه");
                    $("#LoginMessageUp2").show('slow');
                    //Login To System
                    setTimeout(function () {
                        DetectLoggedInUser();
                        $.modal.close();
                    }, 1000);

                    $("#UserDetails").show();
                    $("#loginbox2").hide();
                } else {
                    //alert(result.Message);
                    if (result.Message.indexOf("another") != -1) {
                        $("#LoginMessageUp2").html("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");
                        setTimeout(function () {
                            $("#LoginMessageUp2").hide('slow');
                            $("#LoginButtonUp2").show('slow');
                        }, 3000);
                    } else {

                        if (result.Message.indexOf("activated") != -1) {
                            $("#LoginMessageUp2").html("نام کاربری شما فعال نشده است.");
                        } else if (result.Message.indexOf("approved") != -1) {
                            $("#LoginMessageUp2").html("نام کاربری شما هنوز تایید نشده است.");
                        } else {

                            $("#LoginMessageUp2").html("نام کاربری و یا کلمه عبور نادرست است.");
                        }

                        setTimeout(function () {
                            $("#LoginMessageUp2").hide('slow');
                            $("#LoginButtonUp2").show('slow');
                        }, 3000);
                    }

                }
            },
            data: LoginData,
            async: true

        });
    }
}

function LoginToAccount() {
    var m_userName = $("#username").val();
    var m_password = $("#password").val();
    if (m_userName == "" || m_password == "") {
        $("#LoginMessage").html("نام کاربری و کلمه عبور را وارد کنید.");
        $("#LoginMessage").show('slow');
        setTimeout(function () {
            $("#LoginMessage").hide('slow');
        }, 3000);
    } else {
        $("#LoginMessage").html("در حال بررسی نام کاربری و کلمه عبور");
        $("#LoginButton").hide('slow');
        $("#LoginMessage").show('slow');
        //Call Ajax
        LoginData = {
            username: m_userName,
            password: m_password,
            rememberMe: true
        };

        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/SignInToServer",
            dataType: 'json',
            success: function (result) {

                if (result.Status == true) {
                    $("#LoginMessage").html("در حال ورود به سامانه");
                    $("#LoginMessage").show('slow');
                    //Login To System
                    setTimeout(function () {
                        DetectLoggedInUser();
                    }, 1000);
                } else {
                    //				alert (result.Message);
                    if (result.Message.indexOf("another") != -1) {
                        $("#LoginMessage").html("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");
                        setTimeout(function () {
                            $("#LoginMessage").hide('slow');
                            $("#LoginButton").show('slow');
                        }, 3000);
                    } else {

                        if (result.Message.indexOf("activated") != -1) {
                            $("#LoginMessage").html("نام کاربری شما فعال نشده است.");
                        } else if (result.Message.indexOf("approved") != -1) {
                            $("#LoginMessage").html("نام کاربری شما هنوز تایید نشده است.");
                        } else {
                            $("#LoginMessage").html("نام کاربری و یا کلمه عبور نادرست است.");
                        }

                        setTimeout(function () {
                            $("#LoginMessage").hide('slow');
                            $("#LoginButton").show('slow');
                        }, 3000);
                    }

                }
            },
            data: LoginData,
            async: true

        });
    }
}

function LoginKeyDown(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        LoginToAccount();
    }
}

function LoginCenterKeyDown(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        LoginToAccountCenter();
    }
}

function RegisterKeyDown(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        RegisterToServer();
    }
}

function LoginKeyDownUp(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        LoginToAccountUp();
    }
}

function RegisterToServer() {
    var m_uname = $("#uname").val();
    var m_email = $("#email").val();
    var m_pass = $("#pass").val();
    var m_confirmPass = $("#passConfirm").val();
    if (m_uname == "") {
        ShowRegisterationError(3);
    } else if (m_email == "") {
        ShowRegisterationError(3);
    } else if (validEmail(m_email) == false) {
        ShowRegisterationError(3);
    } else if (m_pass == "") {
        ShowRegisterationError(3);
    } else if (m_confirmPass == "") {
        ShowRegisterationError(3);
    } else if (m_confirmPass != m_pass) {
        $("#RegisterMessage").html("کلمه عبور و تکرار آن با هم برابر نیستند.");
        $("#RegisterMessage").show();
        setTimeout(function () {
            $("#RegisterMessage").hide();
        }, 3000);
    } else {
        $("#RegisterMessage").html("در حال ثبت نام....");
        $("#RegisterMessage").show();
        $.getJSON(ServerURL + "Account/RegisterToServer", {
                username: m_uname,
                password: m_pass,
                email: m_email
            },
            function (result) {
                if (result.Status == false) {
                    if (result.Message.indexOf("Username already exists. Please enter a different user name") != -1) {
                        $("#RegisterMessage").html("کاربری با این نام در سامانه وجود دارد");
                    } else if (result.Message.indexOf("A username for that e-mail address already exists. Please enter a different e-mail address.") != -1) {
                        $("#RegisterMessage").html("کاربری با این پست الکترونیکی در سیستم وجود دارد.");
                    } else if (result.Message.indexOf("The password provided is invalid. Please enter a valid password value.") != -1) {
                        $("#RegisterMessage").html("کلمه عبور وارد شده معتبر نیست. لطفا یک کلمه عبور معتبر وارد نمایید");
                    } else if (result.Message.indexOf("The e-mail address provided is invalid. Please check the value and try again.") != -1) {
                        $("#RegisterMessage").html("آدرس پست الکترونیکی وارد شده معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The password retrieval answer provided is invalid. Please check the value and try again.") != -1) {
                        $("#RegisterMessage").html(" پاسخ شما به سوال امنیتی معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The password retrieval question provided is invalid. Please check the value and try again.") != -1) {
                        $("#RegisterMessage").html("سوال امنیتی شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The user name provided is invalid. Please check the value and try again.") != -1) {
                        $("#RegisterMessage").html("نام کاربری شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        $("#RegisterMessage").html("در بخش پشتیبانی اعتبارسنجی خطایی رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
                    } else if (result.Message.indexOf("The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        $("#RegisterMessage").html("درخواست ساخت این کاربر لغو شده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید. ");
                    } else if (result.Message.indexOf("An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        $("#RegisterMessage").html("خطای ناشناخته ای در سیستم رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
                    }
                    $("#RegisterMessage").show();
                    setTimeout(function () {
                        $("#RegisterMessage").hide();
                    }, 3000);
                } else {
                    $("#RegisterMessage").hide();
                    $("#RegisterMessage").html("ثبت نام شما با موفقیت انجام شد و اطلاعات آن به پست الکترونیکی شما ارسال میشود. برای تکمیل ثیت نام به پست الکترونیکی خود مراجعه کنید.");
                    $("#RegisterMessage").show();
                    setTimeout(function () {
                        $("#RegisterMessage").hide();
                        ShowRegisterForm();
                        ClearRegisterForm();
                    }, 5000);
                }
            }
        );
    }
}


function ClearRegisterForm() {
    $("#RegisterMessage").html("");
    $("#uname").val("");
    $("#email").val("");
    $("#pass").val("");
    $("#passConfirm").val("");
    $("#ExplainRegister").show();
    $("#RegisterFields").hide();
}


function ShowRegisterationError(errorType) {
    var m_uname = $("#uname").val();
    var m_email = $("#email").val();
    var m_pass = $("#pass").val();
    var m_confirmPass = $("#passConfirm").val();
    if (errorType == 1) {
        if (m_uname == "") {
            $("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
            $("#RegisterMessageUserName").show();
            setTimeout(function () {
                $("#RegisterMessageUserName").hide();
            }, 3000);
        }
    } else if (errorType == 2) {
        if (m_uname == "") {
            $("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
            $("#RegisterMessageUserName").show();
            setTimeout(function () {
                $("#RegisterMessageUserName").hide();
            }, 3000);
        }
        if (m_email == "") {
            $("#RegisterMessageEmail").html("لطفا پست الکترونیکی را وارد کنید.");
            $("#RegisterMessageEmail").show();
            setTimeout(function () {
                $("#RegisterMessageEmail").hide();
            }, 3000);
        } else if (validEmail(m_email) == false) {

            $("#RegisterMessageEmail").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
            $("#RegisterMessageEmail").show();
            setTimeout(function () {
                $("#RegisterMessageEmail").hide();
            }, 3000);
        }
    } else if (errorType == 3) {
        if (m_uname == "") {
            $("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
            $("#RegisterMessageUserName").show();
            setTimeout(function () {
                $("#RegisterMessageUserName").hide();
            }, 3000);
        }
        if (m_email == "") {
            $("#RegisterMessageEmail").html("لطفا پست الکترونیکی را وارد کنید.");
            $("#RegisterMessageEmail").show();
            setTimeout(function () {
                $("#RegisterMessageEmail").hide();
            }, 3000);
        } else if (validEmail(m_email) == false) {

            $("#RegisterMessageEmail").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
            $("#RegisterMessageEmail").show();
            setTimeout(function () {
                $("#RegisterMessageEmail").hide();
            }, 3000);
        }
        if (m_pass == "") {
            $("#RegisterMessagePass").html("لطفا کلمه عبور را وارد کنید.");
            $("#RegisterMessagePass").show();
            setTimeout(function () {
                $("#RegisterMessagePass").hide();
            }, 3000);
        }
    }

}

var userName = "";

function DetectLoggedInUser() {
    $("#LoginModal").css("display", "none");
    $("#login-box").hide();
    $("#RegisterBox").hide();
    $("#LogInDetails").hide();
    $("#LoginMessage").hide();
    $("#LogInDetails").hide();

    $.getJSON(ServerURL + "Account/IsLoggedIn", {}, function (result) {
        if (result.Status == true) {
            userName = result.user;
            $("#LogInDetails").show();
            $("#LogInDetailsUserName").html(result.user);
            $("#login-box").hide();
            $("#RegisterBox").hide();
            $("#UserInfo").show();
            $("#UserName").html(result.user);
            $("#Login").hide();

            try {
                GetUserSummery();


                $("#UserDetails").show();
                $("#loginbox2").hide();
            }
            catch (err) {
            }
        } else {
            $("#login-box").show();
            $("#RegisterBox").hide();
            $("#LogInDetails").hide();
            $("#LoginMessage").hide();
            $("#LogInDetails").hide();
            $("#UserInfo").hide();
            $("#Login").show();
            try {

                $("#UserDetails").hide();
                $("#loginbox2").show();
            }
            catch (err) {
            }
        }
    });
}

function GoToPanel() {
    if (userName != "") {
        window.location = "Panels/blank.html";
    } else {
        DetectLoggedInUser();
    }
}

function LogOut() {
    $.getJSON(ServerURL + "Account/LogOutOfServer", {}, function (result) {
        userName = "";
        $("#username").val("");
        $("#password").val("");
        $("#login-box").show();
        $("#LoginButton").show();
        $("#RegisterBox").hide();
        $("#LogInDetails").hide();
        $("#LoginMessage").hide();
        $("#UserInfo").hide();
        $("#UserName").html(result.user);
        $("#Login").show();
        try {
            $("#UserDetails").hide();
            $("#loginbox2").show();
        }
        catch (err) {
        }
    });
}


function SubscribeToNewspaper() {
    var email = $('#NewspaperEmail').val();
    if (email == "") {
        SubscribeMessages("لطفا پست الکترونیکی را  وارد کنید.");
    } else if (validEmail(email) == false) {
        SubscribeMessages("لطفا پست الکترونیکی را صحیح وارد کنید.");
    } else {
        $.getJSON(ServerURL + "Utility/NewspaperSubscribe", {
                email: email
            },
            function (result) {
                if (result.Status == true) {
                    SubscribeMessages("درخواست شما با موفقیت ثبت گردید");
                    $("#NewspaperEmail").val("آدرس پست الکترونیکی شما");
                } else {
                    if (result.Message.indexOf("Exist") != -1) {
                        SubscribeMessages("پست الکترونیکی قبلا در سیستم ثبت شده است.");
                    } else {
                        SubscribeMessages("امکان ثبت درخواست وجود ندارد. دقایقی دیگر مجددا تلاش کنید");
                    }
                }
            }
        );
    }
}

function SubscribeMessages(msg) {
    $("#NewspaperEmailError").html(msg);
    $("#NewspaperEmailError").fadeIn(1000);
    setTimeout(function () {
        $("#NewspaperEmailError").fadeOut(1000);
    }, 5000);
}

function ShowAnnounceRequestForm() {
    $("#AnnounceSeminar").hide();
    $("#RequestForAnnounce").fadeIn();
}

function SubmitRequestForAnnounce() {
    var email = $("#RequestForSeminarEmail").val();
    if (email == "") {
        $("#RequestForSeminarError").html("لطفا پست الکترونیکی را  وارد کنید.");
        $("#RequestForSeminarError").show();
        setTimeout(function () {
            $("#RequestForSeminarError").hide();
        }, 5000);
    } else if (validEmail(email) == false) {
        $("#RequestForSeminarError").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
        $("#RequestForSeminarError").show();
        setTimeout(function () {
            $("#RequestForSeminarError").hide();
        }, 5000);
    } else {
        //		RequestForParticipateInTest
        $.getJSON(ServerURL + "Session/RequestToParticipate", {
                sessionId: 36,
                email: email
            },
            function (result) {
                if (result.Status == true) {
                    $("#RequestForSeminarError").html("درخواست شما با موفقیت ثبت گردید و شماره پیگیری شما " + result.Result.followUpCode + "می باشد.");
                    $("#RequestForSeminarError").show();
                    setTimeout(function () {
                        $("#RequestForSeminarError").hide();
                        { //TODO: CHeck If Is Visible 	
                            RequestForSeminarCancel();
                        }
                    }, 10000);
                } else {
                    if (result.Message.indexOf("Exist") != -1) {
                        $("#RequestForSeminarError").html("درخواستی با این پست الکترونیکی قبلا ثبت شده است!");
                        $("#RequestForSeminarError").show();
                        setTimeout(function () {
                            $("#RequestForSeminarError").hide();
                        }, 5000);
                    } else {
                        $("#RequestForSeminarError").html("امکان ثبت درخواست وجود ندارد، دقایقی دیگر مجددا تلاش نمایید.");
                        $("#RequestForSeminarError").show();
                        setTimeout(function () {
                            $("#RequestForSeminarError").hide();
                        }, 5000);
                    }
                }
            });
    }
}

function RequestForSeminarCancel() {
    $("#RequestForAnnounce").hide();
    $("#AnnounceSeminar").fadeIn();
}

function ForgetPassword() {
    var m_email = $("#forgetEmail").val();
    if (m_email == "") {
        $("#ForgetPassMessage").html("لطفا پست الکترونیکی را  وارد کنید.");
        $("#ForgetPassMessage").show();
        setTimeout(function () {
            $("#RequestForSeminarError").hide();
        }, 5000);
    } else if (validEmail(m_email) == false) {
        $("#ForgetPassMessage").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
        $("#ForgetPassMessage").show();
        setTimeout(function () {
            $("#RequestForSeminarError").hide();
        }, 5000);
    } else {
        $("#ForgetPassMessage").html("در حال ارسال....");
        $("#ForgetPassMessage").show();
        $("input[name=forgetPassBtn]").hide();
        $("label[name=forgetPassBtn]").hide();


        $.getJSON(ServerURL + "Account/ForgetPassword", {
                email: m_email
            },
            function (result) {
                if (result.Status == true) {
                    $('#ForgetPassMessage').removeClass("ErrorLink");
                    $('#ForgetPassMessage').addClass("SuccessLink");
                    $("#ForgetPassMessage").html("درخواست شما با موفقیت ثبت گردید و پیامی به پست الکترونیکی شما ارسال شده است. لطفا به پست الکترونیکی خود مراجعه فرمایید. ");
                    $("#ForgetPassMessage").show();
                } else {
                    if (result.Message.indexOf("registered") != -1) {
                        $("#ForgetPassMessage").html("این پست الکترونیکی در سامانه موجود نیست");
                        $("#ForgetPassMessage").show();
                        setTimeout(function () {
                            $("#RequestForSeminarError").hide();
                        }, 5000);
                        $("input[name=forgetPassBtn]").show();
                    } else {
                        $("#ForgetPassMessage").html(result.Message); // "امکان ثبت درخواست وجود ندارد، دقایقی دیگر مجددا تلاش نمایید.");
                        $("#ForgetPassMessage").show();
                        setTimeout(function () {
                            $("#RequestForSeminarError").hide();
                        }, 5000);
                        $("input[name=forgetPassBtn]").show();
                    }
                }
            });
    }


}

//////////////////////////////////////
///New Codes
//////////////////////////////////////

function ForgotPassword(email) {
    var m_email = email; //$("#forgot_password_email").val();
    var m_message = "پست الکترونیکی : " + m_email + "<br/> در حال بازیابی کلمه عبور، لطفا منتظر بمانید ....";
    ShowModalWindow("توجه", m_message);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/ForgetPassword",
        dataType: 'json',
        data: {
            email: m_email
        },
        success: function (result) {
            if (result.Status == true) {

               // var message = "درخواست شما با موفقیت ثبت گردید و پیامی به پست الکترونیکی شما ارسال شده است. لطفا به پست الکترونیکی خود مراجعه فرمایید. ";
                ShowModalWindow("توجه", "message");
                ShowModalCloseButton();
                ShowRegisterForm(false);
            } else {
                if (result.Message.indexOf("registered") != -1) {
                    var message = "این پست الکترونیکی در سامانه موجود نیست";
                    ShowModalWindow("خطا", message);
                    ShowModalCloseButton();
                } else {
                    var message = result.Message; // "امکان ثبت درخواست وجود ندارد، دقایقی دیگر مجددا تلاش نمایید.");
                    ShowModalWindow("خطا", message);
                    ShowModalCloseButton();
                }
            }
        },
        error: function () {
            var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
            ShowModalWindow("خطا", message);
            ShowModalCloseButton();
        },
        async: true
    });
}

function ShowModalWindow(topic, message) {
    $("#openModel_Title").html(topic);
    $("#openModal_Message").html(message);
    DoSelfPageAct("#openModal");
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
    $("#openModal_Close").hide();
}

function ShowModalCloseButton() {
    $("#openModal_Close").show();
}

function ChangefModalWindow() {
    $("#openModel_Title").html(topic);
    $("#openModal_Message").html(message);
}

function CloseModalWindow() {
    DoSelfPageAct("#close");
}

function DoSelfPageAct(url) {
    window.location = url;
    // history.pushState('', document.title, window.location.pathname);
}


function ShowLoginForms(state) {
    if (state == true) {
        $("#login-wrapper").slideToggle("slow");
        $("#banner-wrapper").slideToggle("slow");

    } else {
        $("#login-wrapper").css("display", "none");
        $("#banner-wrapper").slideToggle("slow");
    }
}


function ShowRegisterForm(state) {
    if (state == true) {
        if ($("#login-wrapper").is(":visible")) {
            $("#login-wrapper").slideToggle("slow", function () {
                $("#register-wrapper").slideToggle();
            });
        } else
            $("#banner-wrapper").slideToggle("slow", function () {
                $("#register-wrapper").slideToggle();
            });
    } else {
        if ($("#login-wrapper").is(":visible") == true) {
            $("#login-wrapper").slideToggle("slow", function () {
                $("#banner-wrapper").slideToggle();
            });
        } else {
            if ($("#register-wrapper").is(":visible") == true) {
                $("#register-wrapper").slideToggle("slow", function () {
                    $("#banner-wrapper").slideToggle();
                });
            }
            else if ($("#banner-wrapper").is(":visible") == false) {
                $("#banner-wrapper").slideToggle();
            }


        }

    }
}

function RegisterToServer2() {
    var m_uname = $("#uname2").val();
    var m_email = $("#email2").val();
    var m_pass = $("#pass2").val();
    var m_confirmPass = $("#passConfirm2").val();
    var hasError = false;
    if (m_uname == "") {
        ShowRegisterationError(1);
        hasError = true;
    } else if (m_email == "") {
        ShowRegisterationError(2);
        hasError = true;
    } else if (validEmail(m_email) == false) {
        ShowRegisterationError(3);
        hasError = true;
    } else if (m_pass == "") {
        ShowRegisterationError(4);
        hasError = true;
    } else if (m_confirmPass == "") {
        ShowRegisterationError(5);
        hasError = true;
    } else if (m_confirmPass != m_pass) {
        var message = "کلمه عبور و تکرار آن برابر نیستند. لطفا مجددا تلاش نمایید.";
        ShowModalWindow("خطا", message);
        ShowModalCloseButton();
        hasError = true;

    }
    if (hasError == false) {
        ShowModalWindow("توجه", 'در حال ارسال اطلاعات ثبت نام به سرور، لطفا منتظر بمانید ...');
        $.ajax({
            type: 'GET',
            url: ServerURL + "Account/RegisterToServer",
            dataType: 'json',
            data: {
                username: m_uname,
                password: m_pass,
                email: m_email
            },
            success: function (result) {
                var errorMessage;
                if (result.Status == false) {
                    if (result.Message.indexOf("Username already exists. Please enter a different user name") != -1) {
                        errorMessage = ("کاربری با این نام در سامانه وجود دارد");
                    } else if (result.Message.indexOf("A username for that e-mail address already exists. Please enter a different e-mail address.") != -1) {
                        errorMessage = ("کاربری با این پست الکترونیکی در سیستم وجود دارد.");
                    } else if (result.Message.indexOf("The password provided is invalid. Please enter a valid password value.") != -1) {
                        errorMessage = ("کلمه عبور وارد شده معتبر نیست. لطفا یک کلمه عبور معتبر وارد نمایید");
                    } else if (result.Message.indexOf("The e-mail address provided is invalid. Please check the value and try again.") != -1) {
                        errorMessage = ("آدرس پست الکترونیکی وارد شده معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The password retrieval answer provided is invalid. Please check the value and try again.") != -1) {
                        errorMessage = (" پاسخ شما به سوال امنیتی معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The password retrieval question provided is invalid. Please check the value and try again.") != -1) {
                        errorMessage = ("سوال امنیتی شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The user name provided is invalid. Please check the value and try again.") != -1) {
                        errorMessage = ("نام کاربری شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
                    } else if (result.Message.indexOf("The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        errorMessage = ("در بخش پشتیبانی اعتبارسنجی خطایی رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
                    } else if (result.Message.indexOf("The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        errorMessage = ("درخواست ساخت این کاربر لغو شده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید. ");
                    } else if (result.Message.indexOf("An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1) {
                        errorMessage = ("خطای ناشناخته ای در سیستم رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
                    }
                    ShowModalWindow("خطا", errorMessage);
                    ShowModalCloseButton();

                } else {

                    errorMessage = ("ثبت نام شما با موفقیت انجام شد و اطلاعات آن به پست الکترونیکی شما ارسال میشود. برای تکمیل ثیت نام به پست الکترونیکی خود مراجعه کنید.");
                    ShowModalWindow("موفقیت", errorMessage);
                    ShowModalCloseButton();
                    ShowRegisterForm(false);

                    ClearRegisterForm();
                }
            },
            error: function () {
                var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
                ShowModalWindow("خطا", message);
                ShowModalCloseButton();
            },
            async: true
        });
    }
}

function ClearRegisterForm() {
    $("#RegisterMessage2").html("");
    $("#uname2").val("");
    $("#email2").val("");
    $("#pass2").val("");
    $("#passConfirm2").val("");
}

function LoginToAccountNew() {
    var m_userName = $("#username").val();
    var m_password = $("#password").val();
    {
        ShowModalWindow("توجه", 'در حال بررسی نام کاربری و کلمه عبور. لطفا اندکی منتظر بمانید...');

        LoginData = {
            username: m_userName,
            password: m_password,
            rememberMe: true
        };

        setTimeout(function () {
            ClearLoginForm();
            $.ajax({
                type: 'POST',
                url: ServerURL + "Account/SignInToServer",
                dataType: 'json',
                success: function (result) {
                    var message;
                    if (result.Status == true) {
                        message = ("با موفقیت به سامانه وارد شدید.");
                        ShowModalWindow("توجه", message);
                        ShowModalCloseButton();
                        GetUserSummery();
                    } else {
                        //				alert (result.Message);
                        if (result.Message.indexOf("another") != -1) {
                            message = ("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");

                        } else {
                            message = result.Message;
                            if (result.Message.indexOf("activated") != -1) {
                                message = ("نام کاربری شما فعال نشده است.");
                            } else if (result.Message.indexOf("approved") != -1) {
                                message = ("نام کاربری شما هنوز تایید نشده است.");
                            } else {
                                message = ("نام کاربری و یا کلمه عبور نادرست است.");
                            }


                        }
                        ShowModalWindow("خطا", message);
                        ShowModalCloseButton();

                    }
                },
                data: LoginData,
                error: function () {
                    var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
                    ShowModalWindow("خطا", message);
                    ShowModalCloseButton();
                },
                async: true

            });
        }, 1000);
    }
}

function LogOutNew() {
    ShowModalWindow("توجه", 'در حال اعمال تغییرات ....');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/LogOutOfServer",
        dataType: 'json',
        success: function () {
            ShowModalWindow("موفقیت آمیز", "شما با موفقیت از سیستم خارج شدید");
            ShowModalCloseButton();

            try {
                DetectLoggedInUser();
                $("#UserDetails").hide();
                $("#loginbox2").show();
            }
            catch (err) {
            }
        },
        error: function () {
            var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
            ShowModalWindow("خطا", message);
            ShowModalCloseButton();
        },
        async: true
    });
}

function GetUserSummery() {
    ShowModalWindow("توجه", 'در حال دریافت اطلاعات کاربری ....');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserSummery",
        dataType: 'json',
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                var userDetails = {};
                userDetails.username = result.Result.userName;
                userDetails.balance = result.Result.balance;
                userDetails.email = result.Result.email;
                userDetails.invited = result.Result.invited;
                userDetails.accepted = result.Result.accepted;
                userDetails.rejected = result.Result.rejected;
                if (result.Result.HasProfile == true) {

                } else {
                    var errorMessage = "لطفا پروفایل خود را تکمیل کنید. برای این کار وارد پانل مدیریت شدهو از بالای صفحه نام کاربری و سپس پروفایل خود را انتخاب کرده و سپس فرم نمایش داده شده را تکمیل نمایید.";
                    $("#loggedinuser_systemMessage").html(errorMessage);
                }

                $("#loggedin_userName").html("نام کاربری : " + userDetails.username);
                $("#loggedin_email").html("پست الکترونیکی : " + userDetails.email);
                $("#loggedin_invited").html("سمینارهای دعوت شده  : " + userDetails.invited);
                $("#loggedin_acceptedRequest").html("سمینارهای پذیرفته شده : " + userDetails.accepted);
                $("#loggedin_rejectedRequest").html("سمینارهای رد شده : " + userDetails.rejected);
                $("#loggedin_credit").html("اعتبار : " + userDetails.balance + ' ریال ');
                ShowUserInfo(true);
            } else {
                ShowModalWindow("خطا", "خطا در دریافت اطلاعات کاربری از سیستم");
                LogOutNew();
            }
        },
        error: function () {
            var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
            ShowModalWindow("خطا", message);
            ShowModalCloseButton();
        },
        async: true
    });
}

function ClearLoginForm() {
    document.getElementById("password").value = "";
}

function ShowUserInfo(state) {
    if (state == true) {
        $("#loggedin-wrapper").slideToggle('slow');
        $("#login-wrapper").css("display", "none");
        $("#banner-wrapper").css("display", "none");
        $("#register-wrapper").css("display", "none");
    } else {
        $("#loggedin-wrapper").css("display", "none");
        ShowLoginForms(false);
    }
}

function DetectLoggedInUserNew() {
    ShowModalWindow("توجه", 'در حال دریافت اطلاعات سرور ....');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/IsLoggedIn",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                GetUserSummery();
            } else {
                CloseModalWindow();
                ShowRegisterForm(false);
            }
        },
        error: function () {
            var message = "امکان دسترسی به سرور وجود ندارد، لطفا دقایقی دیگر مجددا تلاش نمایید.";
            ShowModalWindow("خطا", message);
            ShowModalCloseButton();
        },
        async: false
    });
}

function GetSeminarInfo(sessionId) {
    ShowModalWindow("توجه", "در حال دریافت اطلاعات سمینار از سرور ...");
    $.getJSON(ServerURL + "Session/SessionSearchById", { sessionId: sessionId }, function (result) {
        $('#PleaseWait').hide();
        if (result.Status == true) {
            $("#seminar_title").html(result.Result.name);
            console.log("mode is : " + result.Result.mode);
            if(result.Result.mode == 1)
            {
            $("#seminar_time").html(GetPrsianDate(result.Result.beginTime));
                if (result.Result.remained == 0) {
                    $("#seminar_capacity").html("ظرفیت تکمیل شده است");
                }
                else {
                    $("#seminar_capacity").html("ظرفیت برای ثبت نام وجود دارد");
                }
            }
            else if(result.Result.mode == 0)
            {
                $("#seminar_time").html('-------');
                $("#seminar_capacity").html('-------');
            }

            //$("#WebinarHolder").html(result.Result.admin);
            $("#seminar_presenter").html(result.Result.presentor);

            //$("#seminar_capacity").html(result.Result.remained);

            $("#seminar_explain").html(result.Result.description);
            var status = "";
            var st = 0;
            if (result.Result.status.indexOf("Scheduled") != -1) {
                st = 1;
                status = "زمانبندی شده";
            } else if (result.Result.status.indexOf("Close") != -1) {
                st = 2;
                status = "تمام شده است";
            } else if (result.Result.status.indexOf("Open") != -1) {
                st = 3;
                status = "در حال برگزاری";
            }
            //			$("#seminar_status").html(status); // بنابر درخواست کارفرما در تاریخ 11/3/93 حذف گردید
            $("#seminar_duration").html(result.Result.duration + '  ساعت  ');
            var fee = (result.Result.fee == -1 || result.Result.fee == 0) ? 'رایگان' : (result.Result.fee + ' ریال ');
            $("#seminar_fee").html(fee);
            //$("#WebinarPresentorDetails").html(result.Result.presentor);
            $("#seminar_presentor_pic").prop('src', 'ServerSide/Pics/Users/Originals/' + result.Result.presentorUserName + '.png');
            //	$("#WebinarHolderPic").prop('src','http://iwebinar.ir/Pics/Users/Originals/' + result.Result.adminUserName + '.png');
            //$("#WebinarHolderDetails").html(result.Result.admin);
            $("#seminar_why").html(result.Result.why);
            $("#seminar_for").html(result.Result.forWho);
            //$("#WebinarLevel").html(result.Result.level);
            $("#seminar_pic").prop('src', 'ServerSide/' + result.Result.poster);

            $("#details-wrapper").show();

            if (st == 1) {
                $("#seminar_action").html('<input type="button" name="go"  class="customButton1" value="درخواست برای شرکت" onclick="RequestForSeminar(' + sessionId + ', false);" style="font-family:Tahoma, Geneva, sans-serif;"/>');
            } else if (st == 2) {
                $("#seminar_action").html('<input type="button" name="go"  class="customButton1" value="درخواست برای فیلم سمینار" onclick="RequestForSeminar(' + sessionId + ', true);" style="font-family:Tahoma, Geneva, sans-serif;"/>');
            }

            var src = result.Result.advertise;
            console.log(src);

            $('#videoPlayer source').attr('src', src);
            $("#videoPlayer")[0].load();

            CloseModalWindow();
        }
        else {
            ShowModalWindow("خطا", result.Message);
            ShowModalCloseButton();

        }

        walk(document.body, replaceNumbers);
    });
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
    var _msg = _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0] + " ، " + "ساعت " + _splitedDate[3];
    return _msg;
}

function RequestForSeminar(seminarID, offline) {
    ShowModalWindow("توجه", 'در حال بررسی نام کاربری و کلمه عبور...');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/IsLoggedIn",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                var userName = result.user;
                var email = result.email;
                var mobile = result.mobile;
                loggedIn = true;
                _email = email;
                ShowModalWindow("توجه", 'اطلاعات کاربری صحیح می باشد. در حال بررسی اطلاعات سمینار ....');

                $.ajax({
                    type: 'GET',
                    url: ServerURL + "Session/RequestToParticipate",
                    data: {
                        sessionId: seminarID,
                        email: result.email,
                        mobile: result.mobile
                    },
                    dataType: 'json',
                    success: function (result) {
                        if (result.Status == true) {

                            hasRequested = true;

                            //ShowModalWindow("توجه" , 'در خواست شما برای سمینار  گردید و شماره پیگیری شما ' + result.Result.Code + ' می باشد. ' );
                            ShowModalWindow("توجه", 'کاربر گرامی درخواست شما با شماره پیگیری  ' + result.Result.Code + ' ثبت گردید و منتظر تایید برگزار کننده می باشد . لطفا به قسمت پنل کاربری وارد شوید و از قسمت مشاهده ی سمینار ، وضعیت سمینار را ملاحظه فرمایید. ');
                            ShowModalCloseButton();


                            hasRequested = false;

                        }
                        else {
                            ShowModalWindow("توجه",
                                'شما قبلا برای شرکت در سمینار درخواست داده اید، لطفا برای بررسی وضعیت درخواست خود، به پنل کاربری خود وارد شوید.');
                            ShowModalCloseButton();
                            hasRequested = false;

                        }
                    },
                    data: { sessionId: seminarID, email: _email },
                    async: true

                });
            }
            else {
                //	$("#msg3").show();
                hasRequested = false;
                ShowModalWindow("توجه", "برای شرکت در سمینار لطفا با نام کاربری خود وارد سامانه شوید. برای این کار از قسمت بالا استفاده نمایید.");
                ShowModalCloseButton();
            }
        },
        async: false
    });
}

function GetMiddleTag(name, presentor, describtion, pic, webinarID, time) {
    var msg = '<div>';
    msg += '<center><img src="' + pic + '" alt=""  style="width:90%;height:250px;border-style:solid;border-radius: 10px;-moz-border-radius: 10px;-webkit-border-radius: 10px; -moz-box-shadow:    inset 0 0 10px #000000;-webkit-box-shadow: inset 0 0 10px #000000;   box-shadow:         inset 0 0 10px #000000;margin-top:10px;margin-bottom:10px;"/></center>';
    msg += ' </div>';
    msg += '<hr/>';
    msg += ' <div style="height:400px;">';
    msg += '<div style="vertical-align:middle; height:100px;text-align:center;width:100%;text-shadow: 1px 1px 10px #806e80;filter: dropshadow(color=#806e80, offx=1, offy=1);font-size:16px;font-family:tahoma;font-weight:bold;">';
    msg += name;
    msg += '</div>';
    msg += '<span class="byline" style="text-align:center;width:100%;text-shadow: 1px 1px 10px #806e80;filter: dropshadow(color=#806e80, offx=1, offy=1);font-size:12px;font-family:tahoma;font-weight:bold;">';
    msg += time;
    msg += '</span>';

    msg += ' <div style="height:150px;font-size:14px;margin-left:10px;margin-right:10px;"><p>';
    msg += GenerateMinSummery(describtion);
    msg += '  </p></div>';
    msg += ' <div class="Animated3DButton" style="vertical-align : bottom;cursor:pointer;" onClick="ShowMoreInfo(' + webinarID + ' );">';
    msg += '   جزئیات بیشتر...';
    msg += '</div>';
    msg += '</div>';
    return msg;

}

function GenerateMinSummery(text) {
    var _result = text;
    var _orig = text;
    if (_orig.length > 200) {
        var _index = _result.lastIndexOf(' ', 200);
        if (_index != -1 && _index < _orig.length) {
            _result = _result.substring(0, _index);
        } else {
            _result = _result.substring(0, 200);
        }
    }
    _result += "..........";
    console.log(_result);
    return _result;
}

function ShowMoreInfo(webinarID) {
    window.location = "eventInfo.html?WebinarID=" + webinarID;
}

function ShowMoreInfoB(webinarID) {
    window.location = "eventInfo.htm?WebinarID=" + webinarID;
}


function LoadSeminars(topEventsCount) {
    //$('.PleaseWait').show();
    $.getJSON(ServerURL + "Session/AllSearchSession",
        {
            index: -1,
            pageSize: topEventsCount
        },
        function (result) {
            // $('.PleaseWait').hide();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {

                    //alert(result.Result.SearchResult[i].poster);
                    var sdf = GetMiddleTag(
                        result.Result.SearchResult[i].name,
                        result.Result.SearchResult[i].presentorUserName,
                        result.Result.SearchResult[i].desc,
                        result.Result.SearchResult[i].poster,
                        result.Result.SearchResult[i].id,
                        GetPrsianDate(result.Result.SearchResult[i].beginTime)
                    );
                    console.log(sdf);
                    if (i == 0)
                        $("#seminar_top_1").html(sdf);
                    if (i == 1)
                        $("#seminar_top_2").html(sdf);
                    if (i == 2)
                        $("#seminar_top_3").html(sdf);

                }
                walk(document.body, replaceNumbers);
            }
            else {
                console.log(result.Message);
            }
        });
}

function CreateRow(a, b, c) {
    var row = '<div class="container"><div class="row" style="direction:rtl; ">';
    if (a) {
        row += '<div class="4u">';
        row += ' <section class="box box-feature">';
        row += ' <div>';
        row += a;
        row += ' </div>';
        row += '</section>';
        row += ' </div>';
    }
    if (b) {
        row += '<div class="4u">';
        row += ' <section class="box box-feature">';
        row += ' <div>';
        row += b;
        row += ' </div>';
        row += '</section>';
        row += ' </div>';
    }
    if (c) {
        row += '<div class="4u">';
        row += ' <section class="box box-feature">';
        row += ' <div >';
        row += c;
        row += ' </div>';
        row += '</section>';
        row += ' </div>';
    }
    row += ' </div></div>';
    return row;
}

function LoadPastSeminars(topEventsCount) {
    //$('.PleaseWait').show();
    $.getJSON(ServerURL + "Session/AllLastSearchSession",
        {
            index: -1,
            pageSize: topEventsCount
        },
        function (result) {
            // $('.PleaseWait').hide();
            var elements = new Array();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {
                    //alert(result.Result.SearchResult[i].poster);
                    var element = GetMiddleTag(
                        result.Result.SearchResult[i].name,
                        result.Result.SearchResult[i].presentorUserName,
                        result.Result.SearchResult[i].desc,
                        result.Result.SearchResult[i].poster,
                        result.Result.SearchResult[i].id,
                        GetPrsianDate(result.Result.SearchResult[i].beginTime)
                    );
                    elements[i] = element;
                }

                for (var i = 0; i < result.Result.CurrentCount; i += 3) {
                    $("#seminar_wrapper").append(CreateRow(elements[i], elements[i + 1], elements[i + 2]));
                }

                walk(document.body, replaceNumbers);
            }
            else {
               console.log(result.Message);
            }
        });
}

function ShowNewsDetails() {

}

function LoadTopNews(count) {
    ShowModalWindow("توجه", 'در حال دریافت آخرین اخبار ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetNews",
        dataType: 'json',
        data: { n: count },
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                var topNews = "";
                for (var i = 0; i < result.Result.length; i++) {
                    topNews += '<div style="cursor:pointer;" onclick="ShowModalWindow(' + "'" + result.Result[i].Subject + "','" + result.Result[i].Describtion + "'" + ');			ShowModalCloseButton();">' + result.Result[i].Subject + '</div>';
                }
                $("#NewsContainer").html(topNews);
                console.log(topNews);
            }
            else {
            }
        },
        error: function () {
            ShowModalWindow("توجه", 'خطا در دریافت اطلاعات از سرور ...');
            ShowModalCloseButton();
        },
        async: true
    });

}

function LoadTopNewsB(count) {
    ShowModalWindow("توجه", 'در حال دریافت آخرین اخبار ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetNews",
        dataType: 'json',
        data: { n: count },
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                var topNews = "";
                for (var i = 0; i < result.Result.length; i++) {
                    news[i] = { topic: result.Result[i].Subject, desc: result.Result[i].Describtion, ID: result.Result[i].ID, Pic: result.Result[i].PictureID };
                    var tag = GetNewsMiddleTag(news[i].topic, news[i].desc, news[i].Pic, news[i].ID);
                    $("#NewsContainer").append(tag);
                }
                console.log(topNews);
            }
            else {
            }
        },
        error: function () {
            ShowModalWindow("توجه", 'خطا در دریافت اطلاعات از سرور ...');
            ShowModalCloseButton();
        },
        async: true
    });

}

function ShowNews(index) {
    $("#openModel_Title").html(news[index].topic);
    $("#openModal_Message").css("color", "#00C");
    $("#openModal_Message").html(news[index].desc);
    DoSelfPageAct("#openModal");
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
    $("#openModal_Close").hide();
    ShowModalCloseButton();

}
function LoadSeminarsB(topEventsCount) {
    $("#latestSeminars").html("");
    //$('.PleaseWait').show();
    $.getJSON(ServerURL + "Session/AllSearchSession",
        {
            index: -1,
            pageSize: topEventsCount
        },
        function (result) {
            // $('.PleaseWait').hide();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {

                    //alert(result.Result.SearchResult[i].poster);
                    var sdf = GetMiddleTagB(
                        result.Result.SearchResult[i].name,
                        result.Result.SearchResult[i].presentorUserName,
                        result.Result.SearchResult[i].desc,
                        result.Result.SearchResult[i].poster,
                        result.Result.SearchResult[i].id,
                        GetPrsianDate(result.Result.SearchResult[i].beginTime)
                    );
                    console.log(sdf);
                    $("#latestSeminars").append(sdf);

                }
                walk(document.body, replaceNumbers);
            }
            else {
            }
        });
}

function GetMiddleTagB(name, presentor, describtion, pic, webinarID, time) {
    var msg = '<li class="clear">';
    msg += '<div class="imgl"><img src="ServerSide/' + pic + '" alt="" style="width:125px;height:125px;"/></div>';
    msg += '<div class="latestnews">';
    msg += '<p><a style="cursor:pointer;" onClick="ShowMoreInfoB(' + webinarID + ' );">' + name + '</a></p>';
    msg += '<p>' + GenerateMinSummery(describtion) + '</p>';
    msg += '</div>';
    msg += '</li>';
    return msg;
}


function GetNewsMiddleTag(topic, describtion, pic, NewsID) {
    var msg = '<li class="clear">';
    msg += '<div class="imgl"><img src="ServerSide/' + pic + '" alt="" style="width:125px;height:125px;"/></div>';
    msg += '<div class="latestnews">';
    msg += '<p><a style="cursor:pointer;" onClick="ShowMoreEvent(' + NewsID + ' );">' + topic + '</a></p>';
    msg += '<p style="text-align:justify;">' + GenerateMinSummery(describtion) + '</p>';
    msg += '<p><a style="cursor:pointer;" onClick="ShowMoreEvent(' + NewsID + ' );">' + 'ادامه مطلب' + '</a></p>';
    msg += '</div>';

    msg += '</li>';
    return msg;
}

function GetNewsMiddleTagB(topic, describtion, pic, NewsID) {
    var msg = '<li class="clear">';
    msg += '<div class="imgl"><img src="ServerSide/' + pic + '" alt="" style="width:125px;height:125px;"/></div>';
    msg += '<div class="latestnews">';
    msg += '<p><a style="cursor:pointer;" onClick="ShowMoreEvent(' + NewsID + ' );">' + topic + '</a></p>';
    msg += '<p style="text-align:justify;">' + describtion + '</p>';
    msg += '</div>';
    msg += '</li>';
    return msg;
}

function ShowMoreEvent(newsID) {
    window.location = "newsinfo.htm?NewsID=" + newsID;
}

function GetEventInfo(newsID) {
    //public ActionResult GetNewsDetails(int newsID)
    ShowModalWindow("توجه", 'در حال دریافت آخرین اخبار ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetNewsDetails",
        dataType: 'json',
        data: { newsID: newsID },
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                var topNews = "";
                //for(var i = 0 ; i < result.Result.length ; i++){
                var news = { topic: result.Result.Subject, desc: result.Result.Describtion, ID: result.Result.ID, Pic: result.Result.PictureID };
                var tag = GetNewsMiddleTagB(news.topic, news.desc, news.Pic, news.ID);
                $("#NewsContainer").html(tag);
                //}
                console.log(topNews);
            }
            else {
            }
        },
        error: function () {
            ShowModalWindow("توجه", 'خطا در دریافت اطلاعات از سرور ...');
            ShowModalCloseButton();
        },
        async: true
    });
}

function GetMiddleTagC(name, presentor, describtion, pic, webinarID, time, i) {
    var msg = "";
    if (i % 2 == 0)
        msg = '<li  class="last">';
    else
        msg = '<li>';
    msg += '<img src="ServerSide/' + pic + '" alt="" style="width:420px;height:190px;"/>';
    msg += '<h2>' + name + '</h2>';
    msg += '<span class="byline" style="text-align:center;width:100%;text-shadow: 1px 1px 10px #806e80;filter: dropshadow(color=#806e80, offx=1, offy=1);font-size:12px;font-family:tahoma;font-weight:bold;">';
    msg += time;
    msg += '</span>';
    msg += '<p>' + GenerateMinSummery(describtion) + '</p>';
    msg += '<p class="readmore"><a style="cursor:pointer;" onClick="ShowMoreInfoB(' + webinarID + ' );">جزئیات بیشتر</a></p>';
    msg += '</li>';
    return msg;
}

function GetMiddleTagCNew(name, presentor, describtion, pic, webinarID, time, i) {
    var msg = '<center><table style="-webkit-box-shadow: 3px 3px 13px 0px rgba(50, 50, 50, 0.75);-moz-box-shadow:    3px 3px 13px 0px rgba(50, 50, 50, 0.75);box-shadow:         3px 3px 13px 0px rgba(50, 50, 50, 0.75);width:80%;">';
    msg += '<tr>';
    msg += '<td style="border:0;vertical-align:middle;alignment-adjust:central;width:200px;text-align:center;">' + '<img src="ServerSide/' + pic + '" alt="" style="width:80%; padding: 20px;background: #eeeeee;border: 1px solid #bbbbbb;border-radius: 10px;-moz-border-radius: 10px;-webkit-border-radius: 10px;"/>';
    msg += '</td>';
    msg += '<td style="border:0;">';
    msg += '<table style="border:0;">';
    msg += '<tr  style="border:0;">';
    msg += '<td style="border:0;">' + '<h2>' + name + '</h2>';
    msg += '</td>';
    msg += '</tr>';
    msg += '<tr  style="border:0;">';
    msg += '<td style="border:0;">';
    msg += '<span class="byline" style="text-align:center;width:100%;text-shadow: 1px 1px 10px #806e80;filter: dropshadow(color=#806e80, offx=1, offy=1);font-size:12px;font-family:tahoma;font-weight:bold;">';
   // msg += time;
    msg += '</span>';
    msg += '</td>';
    msg += '</tr>';
    msg += '<tr  style="border:0;">';
    msg += '<td style="border:0;">' + '<p>' + GenerateMinSummery(describtion) + '</p>';
    msg += '</td>';
    msg += '</tr>';
    msg += '<tr  style="border:0;">';
    msg += '<td style="border:0;">' + '<p class="readmore"><a style="cursor:pointer;" onClick="ShowMoreInfoB(' + webinarID + ' );">جزئیات بیشتر</a></p>';
    msg += '</td>';
    msg += '</tr>';
    msg += '</table>';
    msg += '</td>';
    msg += '</tr>';
    msg += '</table></center>';
    return msg;

}

function LoadPastSeminarsB(topEventsCount) {
    //$('.PleaseWait').show();
    $("#seminars").html("");
    $.getJSON(ServerURL + "Session/AllOfflineSession",
        {
            index: -1,
            pageSize: topEventsCount
        },
        function (result) {
            // $('.PleaseWait').hide();
            var elements = new Array();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {
                    //alert(result.Result.SearchResult[i].poster);
                    var element = GetMiddleTagCNew(
                        result.Result.SearchResult[i].name,
                        result.Result.SearchResult[i].presentorUserName,
                        result.Result.SearchResult[i].desc,
                        result.Result.SearchResult[i].poster,
                        result.Result.SearchResult[i].id,
                        'افلاین', i
                    );
                    $("#seminars").append(element);
                }
                walk(document.body, replaceNumbers);
            }
            else {
                console.log(result.Message);
            }
        });
}


function LoadNextSeminarsB(topEventsCount) {
    //$('.PleaseWait').show();
    $("#seminars").html("");
    $.getJSON(ServerURL + "Session/AllNewSearchSession",
        {
            index: -1,
            pageSize: topEventsCount
        },
        function (result) {
            // $('.PleaseWait').hide();
            var elements = new Array();
            if (result.Status == true) {
                for (var i = 0; i < result.Result.CurrentCount; i++) {
                    //alert(result.Result.SearchResult[i].poster);
                    var element = GetMiddleTagCNew(
                        result.Result.SearchResult[i].name,
                        result.Result.SearchResult[i].presentorUserName,
                        result.Result.SearchResult[i].desc,
                        result.Result.SearchResult[i].poster,
                        result.Result.SearchResult[i].id,
                        GetPrsianDate(result.Result.SearchResult[i].beginTime), i
                    );
                    $("#seminars").append(element);
                }
                walk(document.body, replaceNumbers);
            }
            else {
                console.log(result.Message);
            }
        });
}


function LoadPictureGallery() {
    ShowModalWindow("توجه", 'در حال دریافت گالری تصاویر ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfGalleryFiles",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                var html = "";
                for (var i = 0; i < result.Result.length; i++) {
                    var _fileName = result.Result[i].Name.split("/");
                    var fileUrl = "/ServerSide/Pics/Gallery/Originals/" + _fileName[_fileName.length - 1];
                    html += '<li><img src="' + fileUrl + '"style="width:90%;height:100%;max-height:300px;border-radius:10px;	"/></li>';
                }
                $("#Gallery").html(html);
                $('.bxslider').bxSlider({
                    auto: true,
                    adaptiveHeight: true,
                    mode: 'horizontal',
                    useCSS: true,
                    hideControlOnEnd: true,
                    easing: 'easeOutElastic',
                    speed: 2000,
                    pager: false
                });
            }
        },
        error: function () {
        },
        async: true
    });

}

function LoadAboutUsPage() {
    ShowModalWindow("توجه", 'در حال دریافت محتویات صفحه  ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetAboutUsPage",
        dataType: 'json',
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                $("#container").html(result.Result);
            }
            else {
                $("#container").html("مطلبی وجود ندارد");
            }
        },
        error: function () {
            CloseModalWindow();
            $("#container").html("مطلبی وجود ندارد");
        },
        async: true
    });

}

function LoadGuidePage() {
    ShowModalWindow("توجه", 'در حال دریافت محتویات صفحه  ......');
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetGuidePage",
        dataType: 'json',
        success: function (result) {
            CloseModalWindow();
            if (result.Status == true) {
                $("#container").html(result.Result);
            }
            else {
                $("#container").html("مطلبی وجود ندارد");
            }
        },
        error: function () {
            CloseModalWindow();
            $("#container").html("مطلبی وجود ندارد");
        },
        async: true
    });

}

function LoadPageComponents() {
    $("#pagefooter").load("footer.htm");
}
