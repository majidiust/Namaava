using System;
using System.Collections.Generic;

using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Webinar.Models;

using Webinar.Utility;


using System.Runtime.Serialization.Json;
using System.Web.Routing;
using System.IO;
using System.Globalization;

namespace Webinar.Controllers
{


    [HandleError]
    public class AccountController : Controller
    {

        public IFormsAuthenticationService FormsService { get; set; }
        public IMembershipService MembershipService { get; set; }
        private Logger m_logger;
        private DataBaseDataContext m_model = new DataBaseDataContext();
        public static string m_serverAddress = "http://www.iwebinar.ir:6060";
        

        protected override void Initialize(RequestContext requestContext)
        {
            if (m_logger == null) { m_logger = new Logger(); }
            if (FormsService == null) { FormsService = new FormsAuthenticationService(); }
            if (MembershipService == null) { MembershipService = new AccountMembershipService(); }

            base.Initialize(requestContext);
        }



        // **************************************
        // URL: /Account/LogOn
        // **************************************

        public ActionResult LogOn()
        {
            return View();
        }

        public ActionResult Register()
        {
            ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
            return View();
        }

        [Authorize]
        public ActionResult ChangePassword()
        {
            //Session["Salam"] = 
            ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
            return View();
        }

        #region Shiva Code

        // **************************************
        // URL: /Account/LogOff
        // **************************************

        [HttpGet]
        public ActionResult LogOutOfServer()
        {
            try
            {
                FormsService.SignOut();
                return Json(new { Status = true, Message = "Logged Out" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        // **************************************
        // URL: /Account/Register
        // **************************************

        [HttpGet]
        public ActionResult havij2(String userName)
        {
            try
            {
                String sd = userName;
                DataBaseDataContext db = new DataBaseDataContext();

                return Json(db.Cities, JsonRequestBehavior.AllowGet);
                //return Json(new { ID = 7, Name = "Shiva", GoodGirl = true }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

   
        [HttpPost]
        public ActionResult SignInToServer(String username, String password, bool rememberMe)
        {
            try
            {

                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                var membership = m_model.aspnet_Memberships.Single(Q => (Q.UserId == user.UserId));
                MembershipUser tmpuser = Membership.GetUser(user.UserName, false);
                //if (tmpuser.IsOnline)
                //{
                //    return Json(new { Status = false, Message = "You are logged in from another client" }, JsonRequestBehavior.AllowGet);
                //}
                if (MembershipService.ValidateUser(username, password))
                {
                    FormsService.SignIn(username, rememberMe);

                    return Json(new { Status = true, Message = "Signed In Successfully", Address = "" }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    if (membership.IsLockedOut)
                    {
                        return Json(new { Status = false, Message = "Your Username has not activated yet" }, JsonRequestBehavior.AllowGet);
                    }
                    else if (!membership.IsApproved)
                    {
                        return Json(new { Status = false, Message = "Admin has not approved you in system yet" }, JsonRequestBehavior.AllowGet);
                    }
                    return Json(new { Status = false, Message = "The user name or password provided is incorrect." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult NotApprovedMembersList(string username, bool isApproved)
        {
            try
            {
                if (User.IsInRole("AdminRole"))
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                    var membership = m_model.aspnet_Memberships.Single(Q => (Q.UserId == user.UserId));
                    var notApprovedMembers = (from p in m_model.aspnet_Memberships where p.IsApproved == false select p).ToList();
                    return Json(new { Status = true, List = notApprovedMembers }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You do not have permission to do this action" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult RegisterToServer(String username, String password, String email)
        {
            try
            {
                MembershipCreateStatus createStatus = MembershipService.CreateUser(username, password, email);
                if (createStatus == MembershipCreateStatus.Success)
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                    var membership = m_model.aspnet_Memberships.Single(Q => (Q.UserId == user.UserId));
                    var roleId = m_model.aspnet_Roles.Single(i => (i.LoweredRoleName == "userrole")).RoleId;
                    var userRole = new aspnet_UsersInRole();
                    userRole.RoleId = roleId;
                    userRole.UserId = user.UserId;
                    m_model.aspnet_UsersInRoles.InsertOnSubmit(userRole);
                    m_model.SubmitChanges();

                    StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailRegister.html"));
                    string msg = reader.ReadToEnd();
                    msg = msg.Replace("{0}", username);
                    msg = msg.Replace("{1}", username);
                    msg = msg.Replace("{2}", WaitUserConfirm(username));
                    reader.Close();
                    EmailService service = new EmailService();
                    service.SendMail(email, "عضویت در سامانه", msg);
                    //service.SendMail(membership.Email, "عضویت در سامانه", "!\nبرای تکمیل عضویت در سامانه به آدرس زیر مراجعه فرمایید\n" + "http://192.168.1.216/Account/confirm=" + membership.Password + "&user=" + username);
                   
                    return Json(new { Status = true, Message = "User Created Successfully." }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = AccountValidation.ErrorCodeToString(createStatus) }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [Authorize]
        [HttpGet]
        public ActionResult ApproveUser(string username, bool isApproved)
        {
            try
            {
                if (User.IsInRole("AdminRole"))
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                    var membership = m_model.aspnet_Memberships.Single(Q => (Q.UserId == user.UserId));
                    membership.IsApproved = isApproved;
                    m_model.SubmitChanges();
                    int settingsId = m_model.ApplicationSettings.Single(i => (i.SettingName == "smsSettings")).SettingsId;
                    var smsSend = m_model.SettingsProperties.Single(w => (w.SettingsId == settingsId) && (w.PropertyName == "smsSendForEvent")).PropertyValue;
                    EmailService service = new EmailService();
                    if (isApproved)
                    {
                        if (bool.Parse(smsSend))
                        {
                            SMS sms = new SMS();
                            sms.SendSmsEvent(new string[] { membership.MobilePIN }, "عضویت شما در سامانه ی سمینار تایید شد. به این سامانه خوش آمدید");
                        }
                        service.SendMail(membership.Email, "عضویت در سامانه", "عضویت شما در سامانه ی سمینار تایید شد. به این سامانه خوش آمدید");
                        return Json(new { Status = true, Message = "Member Approved Successfully" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        if (bool.Parse(smsSend))
                        {
                            SMS sms = new SMS();
                            sms.SendSmsEvent(new string[] { membership.MobilePIN }, "عضویت شما در سامانه ی سمینار تایید نشده است. برای حل مشکل با مدیر سیستم تماس بگیرید");
                        }
                        service.SendMail(membership.Email, "عدم عضویت در سامانه", "عضویت شما در سامانه ی سمینار تایید نشده است. برای حل مشکل با مدیر سیستم تماس بگیرید");
                        return Json(new { Status = true, Message = "Member Denied Successfully" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "You do not have permission to do this action" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult EditUser(string username, string email, string mobilePin, string comment)
        {
            try
            {
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                if (User.Identity.Equals(user.UserId))
                {
                    var membership = m_model.aspnet_Memberships.Single(Q => (Q.UserId == user.UserId));
                    membership.Email = email;
                    membership.MobilePIN = mobilePin;
                    membership.Comment = comment;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Profile Edited Successfully." }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You can not edit other profiles." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult DeleteUser(string username)
        {
            try
            {
                ////// To Be Continued: how to completely delete a user from the list?
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                return Json(new { Status = false, Message = "You can not edit other profiles." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [Authorize]
        [HttpGet]
        public ActionResult GetProfile(string username)
        {
            try
            {
               // m_logger.Log("CP 10");
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                if (m_model.Profiles.Count(P => P.UserId == user.UserId) > 0)
                {
                    var result = (from p in m_model.Profiles
                                  where p.UserId.Equals(user.UserId)
                                  select new
                                  {
                                      firstName = p.FirstName,
                                      lastName = p.LastName,
                                      photo = p.Photo,
                                      city = p.CityId,
                                      country = p.CountryId,
                                      nationId = p.NationalId,
                                      birthday = string.Format("{0}:{1}:{2}", p.WebinarDateTime.Year, p.WebinarDateTime.Month, p.WebinarDateTime.Day),
                                      gender = p.Gender,
                                      degree = p.DegreeId,
                                      email = user.aspnet_Membership.Email,
                                      mobile = user.aspnet_Membership.MobilePIN
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = "Profile Sent Correctly", Result = result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var result = new 
                                  {
                                      firstName = "",
                                      lastName = "",
                                      photo = "",
                                      city = "",
                                      country = "",
                                      nationId = "",
                                      birthday = "",
                                      gender = "",
                                      degree = "",
                                      email = user.aspnet_Membership.Email,
                                      mobile = user.aspnet_Membership.MobilePIN
                                  };
                    return Json(new { Status = true, Message = "Profile Sent Correctly", Result = result }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        //[Authorize]
        //[HttpGet]
        //public ActionResult EditProfile(string username, string firstName, string lastName, string city , string country, string photo , string nationalId, string birthday, bool gender) 
        //{
        //    try
        //    {
        //        bool hasProfile = false;
        //        var user = m_model.aspnet_Users.Single(P => P.UserName.Equals("shiva"));
        //        var x = m_model.Profiles.Count(P=>P.UserId.Equals(user.UserId));
        //        Profile profile = new Profile();

        //        if (x > 0)
        //        {
        //            profile = m_model.Profiles.Single(p => p.UserId.Equals(user.UserId));
        //            hasProfile = true;     
        //        }

        //        profile.FirstName= firstName;
        //        profile.LastName = lastName;
        //        profile.CityId = m_model.Cities.Single(p => p.Name.Equals(city)).CityId;
        //        profile.CountryId = m_model.Countries.Single(p => p.Name.Equals(country)).CountryId;
        //        if (photo != "")
        //        {
        //            profile.Photo = photo;
        //        }
        //        profile.NationalId = nationalId;
        //        string[] parsedBirthday = birthday.Split(new char[]{':'});
        //        WebinarDateTime birthdayDate = new WebinarDateTime();
        //        birthdayDate.Year = int.Parse(parsedBirthday[0]);
        //        birthdayDate.Month = int.Parse(parsedBirthday[1]);
        //        birthdayDate.Day = int.Parse(parsedBirthday[2]);
        //        m_model.WebinarDateTimes.InsertOnSubmit(birthdayDate);
        //        m_model.SubmitChanges();
        //        profile.Birthday = birthdayDate.id;
        //        m_logger.Log(profile.Birthday.ToString());
        //        profile.Gender = gender;
        //        if (hasProfile == false)
        //        {
        //            profile.UserId = user.UserId;
        //            m_model.Profiles.InsertOnSubmit(profile);
        //        }
        //        m_model.SubmitChanges();
        //        return Json(new { Status = true, Message = "Profile Updated Successfully" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (Exception ex)
        //    {
        //        m_logger.Log(ex.StackTrace);
        //        return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}
/*
        [Authorize]
        [HttpGet]
        public ActionResult EditProfile(string username, string firstName, string lastName, string city, string country, string photo, string nationalId, string birthday, bool gender)
        {
            try
            {

                m_logger.Log(firstName + "/" + lastName + "/" + city + "/" + country + "/" + photo + "/" + nationalId + "/" + birthday + "/" + gender);
                m_logger.Log("reached username");
                bool hasProfile = false;
                var user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(username.ToLower()));
                var x = m_model.Profiles.Count(P => P.UserId.Equals(user.UserId));
                Profile profile = new Profile();
               

                if (x > 0)
                {
                 
                    profile = m_model.Profiles.Single(p => p.UserId.Equals(user.UserId));
                    hasProfile = true;
                }
                
                profile.FirstName = firstName;
                profile.LastName = lastName;
     
                profile.CityId = int.Parse(city);
                
                profile.CountryId = int.Parse( country);
                
               
                // if (photo != "")
                //  {
                //   profile.Photo = photo;
                //  }
                profile.NationalId = nationalId;

                string[] parsedBirthday = birthday.Split(new char[] { ':' });
               
                WebinarDateTime birthdayDate = new WebinarDateTime();
                birthdayDate.Year = int.Parse(parsedBirthday[0]);
                birthdayDate.Month = int.Parse(parsedBirthday[1]);
                birthdayDate.Day = int.Parse(parsedBirthday[2]);
                m_model.WebinarDateTimes.InsertOnSubmit(birthdayDate);
                m_model.SubmitChanges();
        
                profile.Birthday = birthdayDate.id;
                
                profile.Gender = gender;
                if (hasProfile == false)
                {
                    profile.UserId = user.UserId;
                    m_model.Profiles.InsertOnSubmit(profile);
                }
                m_model.SubmitChanges();
                //return Json(new { Status = false, Message = "Be Patiant" }, JsonRequestBehavior.AllowGet);
                return Json(new { Status = true, Message = "Profile Updated Successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                m_logger.Log(ex.StackTrace);
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        */
        [Authorize]
        [HttpGet]
        public ActionResult RoleAssignment(string username, string role)
        {
            try
            {
                if (User.IsInRole("AdminRole"))
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                    var roleId = m_model.aspnet_Roles.Single(i => (i.LoweredRoleName == role)).RoleId;
                    var userRole = new aspnet_UsersInRole();
                    userRole.RoleId = roleId;
                    userRole.UserId = user.UserId;
                    m_model.aspnet_UsersInRoles.InsertOnSubmit(userRole);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Role Set to the User Correctly" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You do not have permission to set role to any user" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        [HttpGet]
        public string WaitUserConfirm(string userName) 
        {
            try 
            {
                //Check If This User Activate Before ? 
                bool isInDataBase = true;
                Guid id = Guid.NewGuid();
                while (isInDataBase == true)
                {  
                    var guid = (from p in m_model.Confirms where p.Guid == id select p).ToList();
                    if (guid.Count == 0)
                    {
                        isInDataBase = false;
                    }
                    id = Guid.NewGuid();
                }
                
                var user = (from p in m_model.aspnet_Users where p.UserName == userName select p).ToList();
                if (user.Count > 0)
                {
                    user[0].aspnet_Membership.IsLockedOut = true;
                    Confirm confirm = new Confirm();
                    confirm.UserId = user[0].UserId;
                    confirm.Guid = id;
                    confirm.isConfirm = true;
                    confirm.IsUsed = false;
                    m_model.Confirms.InsertOnSubmit(confirm);
                    m_model.SubmitChanges();
                    return (string.Format("http://{0}/confirmation.html?guid={1}",m_serverAddress ,id.ToString()));
                }
                else 
                {
                    return "User is not in database";
                }
                //return Json(new { Status = true, Message = "Guid is set and created"}, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex) 
            {
                return ex.Message;
            }
        }

        [HttpGet]
        public ActionResult Confirm(string guid) 
        {
            try 
            {
                var localGuid = (from p in m_model.Confirms where p.Guid == Guid.Parse(guid) select p).ToList();
                if (localGuid.Count > 0)
                {
                    if (localGuid[0].IsUsed == false)
                    {
                        if (localGuid[0].isConfirm == true)
                        {
                            var user = (from p in m_model.aspnet_Users where p.UserId == localGuid[0].UserId select p).ToList();
                            if (user.Count > 0)
                            {
                                user[0].aspnet_Membership.IsLockedOut = false;
                                localGuid[0].IsUsed = true;
                                m_model.SubmitChanges();
                                return Json(new { Status = true, Message = "User Activated Correctly" }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return Json(new { Status = false, Message = "User doesn't Exist" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else 
                        {
                            return Json(new {Status = false, Message ="This Guid is not for confirming" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "This Guid Has been used previously" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else 
                {
                    return Json(new { Status = false, Message = "This Guid Doesn't Exist"},JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex) 
            {
                return Json(new {Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //public void RecoverPasswordMail(string username)
        //{
        //    try
        //    {

        //        var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
        //        aspnet_Membership membership = m_model.aspnet_Memberships.Single(p => p.UserId == user.UserId);

        //        string Message = "سلام " + user + "!\nشما می‌توانید با استفاده از لینک زیر اقدام به بازیابی گذرواژه‌ی خود نمایید\n" + "http://192.168.1.216:8080/Account/ChangePass?validation=" + membership.Password + "&user=" + user;

        //        new EmailService().SendMail(membership.Email, "بازیابی گذرواژه", Message);
        //    }
        //    catch (Exception ex) 
        //    {
        //        throw;
        //    }
        //}
        [Authorize]
        [HttpGet]
        public ActionResult SearchUser(string username)
        {
            try
            {
                if (User.IsInRole("AdminRole"))
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                    aspnet_Membership membership = m_model.aspnet_Memberships.Single(p => p.UserId == user.UserId);
                    return Json(new { Status = true, Username = username, Email = membership.Email, PhoneNumber = membership.MobilePIN }, JsonRequestBehavior.AllowGet);
                    //       return Json(new {Status = true, Username= username, Email = membership.ToString();
                }
                else
                {
                    return Json(new { Status = false, Message = "You do not have permission to set role to any user" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        [HttpGet]
        public ActionResult AjaxSearchUser(string keyword, int index, int pageSize)
        {
            //m_logger.Log("SearchUsercp0");
            try
            {
                if (index < 0)
                {
                    index = 1;
                }
               // m_logger.Log("SearchUsercp1");
                var baseSearch = (from p in m_model.aspnet_Memberships
                                  where (p.LoweredEmail.Contains(keyword.ToLower()) ||
                                      p.aspnet_User.UserName.ToLower().Contains(keyword) || p.aspnet_User.Profile.FirstName.ToLower().Contains(keyword) ||
                                      p.aspnet_User.Profile.LastName.ToLower().Contains(keyword))
                                  select new
                                  {
                                      UseName = p.aspnet_User.UserName,
                                      Email = p.Email,
                                      FirstName = p.aspnet_User.Profile.FirstName,
                                      LastName = p.aspnet_User.Profile.LastName,
                                      Mobile = p.MobilePIN
                                  }).ToList();
              //  m_logger.Log("SearchUsercp2");

                var searchResult = baseSearch.Skip((index - 1) * pageSize).Take(pageSize);
              //  m_logger.Log("SearchUsercp3");

                int count = baseSearch.Count;
              //  m_logger.Log("SearchUsercp4");

                if (searchResult.Count() == 0)
                {
                    return Json(new { Status = false, Message = "There Is Not Any Record" }, JsonRequestBehavior.AllowGet);
                }

                var Result = new
                {
                    SearchResult = searchResult,
                    CurrentCount = searchResult.Count(),
                    TotalCount = count
                };


                return Json(new { Status = true, Message = "Search Is Ok", Result }, JsonRequestBehavior.AllowGet);
                //       return Json(new {Status = true, Username= username, Email = membership.ToString();
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult GetUserName()
        {
            try
            {
                String userName = User.Identity.Name;
                return Json(new { Status = true, user = userName, Message = "Logged In Succeessfully." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult IsLoggedIn()
        {
            try
            {
                if (Request.IsAuthenticated == false)
                {
                    return Json(new { Status = false, Message = "Does Not Authenticated" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    String userName = User.Identity.Name;
                    var user = m_model.aspnet_Users.Single(p => p.UserName == userName);
                    string email = user.aspnet_Membership.Email;
                    string mobile = user.aspnet_Membership.MobilePIN;
                    return Json(new { Status = true, user = userName, email = email, mobile = mobile,  Message = "Logged In Succeessfully." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult GetUserRole(string userName)
        {
            try
            {
                Guid userId = m_model.aspnet_Users.Single(P => P.UserName == userName).UserId;
                var result = from P in m_model.aspnet_UsersInRoles where P.UserId == userId select new { RoleName = P.aspnet_Role.RoleName };
                return Json(new { Status = true, Roles = result, Message = "Successfully Get The Roles." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }





        //[HttpPost]
        //public ActionResult Register(RegisterModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        // Attempt to register the user
        //        MembershipCreateStatus createStatus = MembershipService.CreateUser(model.UserName, model.Password, model.Email);

        //        if (createStatus == MembershipCreateStatus.Success)
        //        {
        //            FormsService.SignIn(model.UserName, false /* createPersistentCookie */);
        //            return RedirectToAction("Index", "Home");
        //        }
        //        else
        //        {
        //            ModelState.AddModelError("", AccountValidation.ErrorCodeToString(createStatus));
        //        }
        //    }

        //    // If we got this far, something failed, redisplay form
        //    ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
        //    return View(model);
        //}



        // **************************************
        // URL: /Account/ChangePassword
        // **************************************



        //[Authorize]
        //[HttpPost]
        //public ActionResult ChangePass()
        //{
        //    DataBaseDataContext db = new DataBaseDataContext();

        //}

        //[Authorize]
        //[HttpPost]
        //public ActionResult ChangePassword(ChangePasswordModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        if (MembershipService.ChangePassword(User.Identity.Name, model.OldPassword, model.NewPassword))
        //        {
        //            return RedirectToAction("ChangePasswordSuccess");
        //        }
        //        else
        //        {
        //            ModelState.AddModelError("", "The current password is incorrect or the new password is invalid.");
        //        }
        //    }

        //    // If we got this far, something failed, redisplay form
        //    ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
        //    return View(model);
        //}



        [Authorize]
        [HttpGet]
        public ActionResult ChangePassword(string username, string oldPassword, string newPassword)
        {
            try
            {
                if (MembershipService.ChangePassword(username, oldPassword, newPassword))
                {
                    return Json(new { Status = true, Message = "ChangePasswordSuccess" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "The current password is incorrect or the new password is invalid." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #region Gande Ola
        [Authorize]
        [HttpGet]
        public ActionResult ChangePasswordBeta(string userName, string oldPassword, string newPassword)
        {
            try
            {
                if (MembershipService.ChangePassword(userName, oldPassword, newPassword))
                {
                    return Json(new { Status = true, Message = "ChangePasswordSuccess" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "The current password is incorrect or the new password is invalid." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult ValidateEmail(string email) 
        {
            try 
            {
                var emails = (from p in m_model.aspnet_Memberships where p.Email == email select p).ToList();
                if (emails.Count > 0)
                {
                    return Json(new { Status = false, Message = "This Email Exist in system" }, JsonRequestBehavior.AllowGet);
                }
                else 
                {
                    return Json(new { Status = true , Message= "This email doesn't exist in system" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex) 
            {
                return Json(new {Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [Authorize]
        [HttpGet]
        public ActionResult EditProfile(string username, string firstName, string lastName, string city, string country, string photo, string nationalId, string birthday, bool gender , string degree, string email, string mobile)
        {
            try
            {

              //  m_logger.Log(firstName + "/" + lastName + "/" + city + "/" + country + "/" + photo + "/" + nationalId + "/" + birthday + "/" + gender);
                // string username = User.Identity.Name;

              //  m_logger.Log("reached username");
                bool hasProfile = false;
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                var membership = m_model.aspnet_Memberships.Single(p => p.UserId == user.UserId);
                var x = m_model.Profiles.Count(P => P.UserId.Equals(user.UserId));
                Profile profile = new Profile();

                if (x > 0)
                {
                    profile = m_model.Profiles.Single(p => p.UserId.Equals(user.UserId));
                    hasProfile = true;
                }
                if (hasProfile == false) 
                {
                    profile.Balance = 0;
                }

                profile.FirstName = firstName;
                profile.LastName = lastName;

                if (email != "")
                {
                    membership.Email = email;
                    membership.LoweredEmail = email.ToLower();
                }

                string path = Server.MapPath("~/Pics/Users/Originals/");
                path += username + ".png";
                if (System.IO.File.Exists(path))
                {
                    profile.Photo = path;
                }


                profile.CityId = int.Parse(city);
                profile.CountryId = int.Parse(country);

                profile.DegreeId = int.Parse(degree);

                profile.NationalId = nationalId;

                string[] parsedBirthday = birthday.Split(new char[] { ':' });
                WebinarDateTime birthdayDate = new WebinarDateTime();
                birthdayDate.Year = int.Parse(parsedBirthday[0]);
                birthdayDate.Month = int.Parse(parsedBirthday[1]);
                birthdayDate.Day = int.Parse(parsedBirthday[2]);
                m_model.WebinarDateTimes.InsertOnSubmit(birthdayDate);
                m_model.SubmitChanges();
                profile.Birthday = birthdayDate.id;
                profile.Gender = gender;
                var emails = (from p in m_model.aspnet_Memberships where p.Email == email select p).ToList();
                if (emails.Count > 0)
                {
                    if (email != membership.Email)
                    {
                        return Json(new { Status = false, Message = "This Email exist in the system and you can not change your email to this email." }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    membership.Email = email;
                }

                membership.MobilePIN = mobile;
                if (hasProfile == false)
                {
                    profile.UserId = user.UserId;
                    m_model.Profiles.InsertOnSubmit(profile);
                }
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Profile Updated Successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion
        #region Forget Password

        [HttpGet]
        public ActionResult ChangePasswordForget(Guid id, string newPassword) 
        {
            try 
            {
                var guid = (from p in m_model.Confirms where p.Guid == id select p).ToList();
                if (guid.Count > 0)
                {  
                    if (guid[0].isConfirm == false)
                    {
                        if (guid[0].IsUsed == false) 
                        {
                            var user = (from p in m_model.aspnet_Users where p.UserId == guid[0].UserId select p).ToList();
                            if (user.Count > 0)
                            {

                                MembershipUser usr = Membership.GetUser(user[0].UserName);
                                string resetPwd = usr.ResetPassword();

                                if (usr.ChangePassword(resetPwd, newPassword))
                                {

                                    guid[0].IsUsed = true;
                                    m_model.SubmitChanges();
                                    return Json(new { Status = true, Message = "ChangePasswordSuccess" }, JsonRequestBehavior.AllowGet);

                                }
                                else 
                                {
                                    return Json(new { Status = false, Message = "New Password is not valid" }, JsonRequestBehavior.AllowGet);
                                }
                            }
                            else 
                            {
                                return Json(new { Status = false, Message = "This User does not exist any more in the system" }, JsonRequestBehavior.AllowGet);
                            }
                        }
                        else 
                        {
                            return Json(new {Status = false, Message ="This Guid has been used previously" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "This is not for Password Reset." }, JsonRequestBehavior.AllowGet);
                    }
                }
                else 
                {
                    return Json(new {Status = false, Message = "This link is not valid" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex) 
            {
                return Json(new {Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public ActionResult ForgetPassword(string email)
        {
            try
            {
                var membership = (from p in m_model.aspnet_Memberships where p.Email == email select p).ToList();
                if (membership.Count > 0)
                {
                    string msg = "";
                    bool isInDataBase = true;
                    Guid id = Guid.NewGuid();
                    while (isInDataBase == true)
                    {
                        var guid = (from p in m_model.Confirms where p.Guid == id select p).ToList();
                        if (guid.Count == 0)
                        {
                            isInDataBase = false;
                        }
                        id = Guid.NewGuid();
                    }
                    var user = (from p in m_model.aspnet_Users where p.UserId == membership[0].UserId select p).ToList();
                    if (user.Count > 0)
                    {
                        Confirm confirm = new Confirm();
                        confirm.UserId = user[0].UserId;
                        confirm.Guid = id;
                        confirm.isConfirm = false;
                        confirm.IsUsed = false;
                        m_model.Confirms.InsertOnSubmit(confirm);
                        m_model.SubmitChanges();
                        StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailForgetPass.html"));
                        msg = reader.ReadToEnd();
                        reader.Close();
                        msg = msg.Replace("{0}", membership[0].Email);
                        string address = string.Format("{0}/confirmation.html?guid={1}&type=2", m_serverAddress,id.ToString());
                        msg = msg.Replace("{1}", address);
                       
                        EmailService service = new EmailService();
                        service.SendMail(email, "بازیابی کلمه عبور", msg);

                    }
                    return Json(new { Status = true, Message = "Your Password is sent to your mail" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "This Email has not registered yet." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion

        [Authorize]
        [HttpGet]
        public ActionResult GetBalance(string username)
        {
            try
            {

                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(username));
                var profile = m_model.Profiles.Single(q => q.UserId == user.UserId);
                return Json(new { Status = true, Balance = profile.Balance });
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        // **************************************
        // URL: /Account/ChangePasswordSuccess
        // **************************************

        #endregion
        public ActionResult ChangePasswordSuccess()
        {
            return View();
        }
        #region Advices

        [HttpPost]
        public ActionResult SendAdvice(string userName, string message) 
        {
            try
            {
                EmailService service = new EmailService();
                service.SendMail("namaavazendegi@gmail.com", "webinar advice " + userName, message);
                service.SendMail("majid.sadeghi.alavijeh@gmail.com", "webinar advice " + userName, message);
                return Json(new {Status = true, Message = "Advice sent to your gmail accounts Developers!" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex) 
            {
                return Json(new {Status = false, Message= ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        #region Upload Pictures

        [Authorize]
        [HttpPost]
        public ContentResult UploadPicture(string userName)
        {
            try
            {
                var r = new List<ViewDataUploadFilesResult>();


                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                    string savedFileName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), userName);
                    string savedThumbnailName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), userName);
                    bmp.Save(savedFileName + ".png", System.Drawing.Imaging.ImageFormat.Png);


                    double aspectRatio = 160.0 / (double)bmp.Width;

                    int width = (int)(160);
                    int height = (int)((double)bmp.Height*aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width ,height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedThumbnailName + "t.png", System.Drawing.Imaging.ImageFormat.Png);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = hpf.FileName,
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType
                    });
                }
                // Returns json

                return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
            }
            catch (Exception ex) 
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }

        #endregion

        [HttpGet]
        public ActionResult GetUserBalance()
        {
            try
            {
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                var Result = new
                {
                    balance = user.Profile.Balance
                };
                return Json(new { Status = true, Message = "Get User Balance Successfully", Result }, JsonRequestBehavior.AllowGet); 
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private int GetNumberOfInvitedForUser(Guid userId)
        {
            try
            {
                return m_model.SessionInvites.Count(P => P.UserId.Equals(userId));
            }
            catch 
            {
                return 0;
            }
        }

        private int GetNumberOfAcceptedRequestForUser(Guid userId)
        {
            try
            {
                return m_model.SessionRequests.Count(P => P.UserId.Equals(userId) && P.Result.Equals("Accepted"));
            }
            catch
            {
                return 0;
            }
        }

        private int GetNumberOfRejectedRequestForUser(Guid userId)
        {
            try
            {
                return m_model.SessionRequests.Count(P => P.UserId.Equals(userId) && P.Result.Equals("Rejected"));
            }
            catch
            {
                return 0;
            }
        }

        [HttpGet]
        public ActionResult GetUserSummery()
        {
            try
            {
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                int HasProfile = m_model.Profiles.Count(P => P.UserId.Equals(user.UserId));
                if (HasProfile <= 0)
                {
                    var Result = new
                    {
                        userName = userName,
                        balance = 0,
                        email = "-------",
                        HasProfile = false,
                        invited = 0,
                        accepted = 0,
                        rejected = 0
                    };
                    return Json(new { Status = true, Message = "Get User Info Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var Result = new
                    {
                        userName = userName,
                        balance = user.Profile.Balance,
                        email = user.aspnet_Membership.Email,
                        HasProfile = true,
                        invited = GetNumberOfInvitedForUser(user.UserId),
                        accepted = GetNumberOfAcceptedRequestForUser(user.UserId),
                        rejected = GetNumberOfRejectedRequestForUser(user.UserId)
                    };
                    return Json(new { Status = true, Message = "Get User Info Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetUserPeyments()
        {
            try
            {
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                BankDataBaseDataContext m_bank = new BankDataBaseDataContext();

                //foreach (var p in m_bank.Payments)
                //{
                //    if (p.UserId.Equals(user.UserId))
                //    {
                //        return Json(new { Status = false, Message = 12 }, JsonRequestBehavior.AllowGet);
                //    }
                //}
                var PeymentsID = (from P in m_bank.Payments where (P.UserId.Equals(user.UserId)) select P.PaymentId).ToList<int>();
                var Result = from p in m_bank.BankResponses where (PeymentsID.Contains((int)p.PaymentId) == true) select new
                        {
                            Peigiri = p.PaymentId,
                            Rahgiri = p.TransId,
                            Dargah = "دامون(بانک ملی)",
                            Status = p.ResponseCode,
                            Ammount = p.Amount
                        };
                return Json(new { Status = true, Message = "Get User Balance Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #region NEWS
        [HttpGet]
        public ActionResult GetNews(int n)
        {
            try
            {
                var Result = (from p in m_model.News select p).OrderByDescending(P => P.ID).Take(n).ToList();
                foreach (var x in Result)
                {
                    if(m_model.Temps.Count(P=>P.TempID.Equals(int.Parse(x.PictureID))) > 0)
                    {
                        x.PictureID = m_model.Temps.Single(P=>P.TempID == int.Parse(x.PictureID)).TemoValue;
                    }
                }
                return Json(new { Status = true, Message = "get News Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

    
        [HttpPost]
        public ActionResult News(string name, string desc, int picture)
        {
            try
            {
                New newNew = new New();
                newNew.Describtion = desc;
                newNew.Subject = name;
                newNew.PictureID = picture.ToString();
                DateTime d = DateTime.Now;
                PersianCalendar jc = new PersianCalendar();
                DateTime date = new DateTime(jc.GetYear(d), jc.GetMonth(d), jc.GetDayOfMonth(d));
                string print = string.Format("{0:0000}/{1:00}/{2:00}", date.Year, date.Month, date.Day);
                newNew.Date = d;

                m_model.News.InsertOnSubmit(newNew);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Add News Successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult DeleteNews(int newsID)
        {
            if (m_model.News.Count(P => P.ID == newsID) > 0)
            {
                var Result = m_model.News.Single(P => P.ID == newsID);
                m_model.News.DeleteOnSubmit(Result);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Delete News Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { Status = false, Message = "Not Found" }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetNewsDetails(int newsID)
        {
            try
            {
                if (m_model.News.Count(P => P.ID == newsID) > 0)
                {
                    var Result = m_model.News.Single(P => P.ID == newsID );
                    if (m_model.Temps.Count(P => P.TempID.Equals(int.Parse(Result.PictureID))) > 0)
                    {
                        Result.PictureID = m_model.Temps.Single(P => P.TempID == int.Parse(Result.PictureID)).TemoValue;
                    }
                    return Json(new { Status = true, Message = "Get News Details Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Not Found" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion
        #region Gallery
        [Authorize]
        [HttpPost]
        public ContentResult UploadGalleryPicture()
        {
            try
            {
                var r = new List<ViewDataUploadFilesResult>();


                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                        if (Directory.Exists(Server.MapPath("~/Pics/Gallery")) == false)
                        {
                            Directory.CreateDirectory(Server.MapPath("~/Pics/Gallery"));
                        }
                        if (Directory.Exists(Server.MapPath("~/Pics/Gallery/Originals")) == false)
                        {
                            Directory.CreateDirectory(Server.MapPath("~/Pics/Gallery/Originals"));
                        }
                        if (Directory.Exists(Server.MapPath("~/Pics/Gallery/Thumbnails")) == false)
                        {
                            Directory.CreateDirectory(Server.MapPath("~/Pics/Gallery/Thumbnails"));
                        }
                    
                    string savedFileName = Path.Combine(Server.MapPath("~/Pics/Gallery/Originals"), hpf.FileName);
                    string savedThumbnailName = Path.Combine(Server.MapPath("~/Pics/Gallery/Thumbnails"),  hpf.FileName);
                    bmp.Save(savedFileName + ".png", System.Drawing.Imaging.ImageFormat.Png);


                    double aspectRatio = 160.0 / (double)bmp.Width;

                    int width = (int)(160);
                    int height = (int)((double)bmp.Height * aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedThumbnailName + ".png", System.Drawing.Imaging.ImageFormat.Png);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = hpf.FileName,
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType
                    });
                }
                // Returns json

                return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
            }
            catch (Exception ex)
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }

        [HttpGet]
        public ActionResult DeletePictureFromGallery(string fileName)
        {
            try
            {
                string savedFileName = Path.Combine(Server.MapPath("~/Pics/Gallery/Originals"), fileName);
                string savedThumbnailName = Path.Combine(Server.MapPath("~/Pics/Gallery/Thumbnails"), fileName);
                FileInfo f = new FileInfo(savedFileName);
                if (f.Exists)
                {
                    f.Delete();
                }
                f = new FileInfo(savedThumbnailName);
                if (f.Exists)
                {
                    f.Delete();
                }

                return Json(new { Status = true, Message = "File Deleted Successfully"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetListOfGalleryFiles()
        {
            try
            {
                var fileName = Directory.GetFiles(Server.MapPath("~/Pics/Gallery/Thumbnails"));
                var Result = from p in fileName select new {
                   Name = (new FileInfo(p)).Name,
                   Length =  (new FileInfo(p)).Length,
                   Date = (new FileInfo(p)).LastWriteTimeUtc
                };
                
                return Json(new { Status = true, Message = "Get Files Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult GetMyRoles()
        {
            try
            {
                String username = User.Identity.Name;
                var Result =  Roles.GetRolesForUser(username);
                return Json(new { Status = true, Message = "Get Files Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet); 
            }
        }
#endregion
        #region Upload Session Videos
        [HttpGet]
        public ActionResult GetCurrentAdvertise(int sessionId)
        {
            try
            {
                var allFiles = m_model.SessionVideos.Where(p => p.SessionID == sessionId);
                var session = (from p in m_model.Sessions where p.SessionId == sessionId  select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    int Result = -1;
                    foreach (var x in allFiles)
                    {
                        if (x.IsAdvertise == true)
                        {
                            Result = x.ID;
                        }
                    }
                    return Json(new { Status = true, Message = "Get Current Seminar Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You don't have permission to delete any files" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [HttpGet]
        public ActionResult SetAsAdvertise(int fileID)
        {
            try
            {
                var file = m_model.SessionVideos.Single(p => p.ID == fileID);
                var session = (from p in m_model.Sessions where p.SessionId == file.SessionID select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    var allFiles = m_model.SessionVideos.Where(p => p.SessionID == file.SessionID);
                    foreach (var x in allFiles)
                    {
                        x.IsAdvertise = false;
                    }
                    file.IsAdvertise = true;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Has Been Updated" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You don't have permission to delete any files" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch(Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetListOfVideos(int sessionId)
        {
            try
            {

                var files = (from p in m_model.SessionVideos
                             where p.SessionID == sessionId
                             select new
                             {
                                 // fileName = p.FileURL.Split(new char[] { '/' })[p.FileURL.Split(new char[] { '/' }).Length-1],
                                 fileUrl = p.VideoName,
                                 fileId = p.ID,
                                 fileSize = p.ID
                             }).ToList().Take(10);
                if (files.Count() == 0)
                    return Json(new { Status = false, Message = "No Files listed" }, JsonRequestBehavior.AllowGet);
                return Json(new { Status = true, Message = "Files of this Session sent", Result = files }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [Authorize]
        [HttpGet]
        public ActionResult DeleteVideoFile(int fileID)
        {
            try
            {
                var file = m_model.SessionVideos.Single(p => p.ID == fileID);
                var session = (from p in m_model.Sessions where p.SessionId == file.SessionID select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    string path = file.VideoName;
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                    m_model.SessionVideos.DeleteOnSubmit(file);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "File Deleted Successfully" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You don't have permission to delete any files" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [Authorize]
        [HttpPost]
        public ContentResult UploadVideoFiles(int sessionId, string videoName)
        {
            try
            {
                var session = (from p in m_model.Sessions where p.SessionId == sessionId select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    string directoryPath = Server.MapPath(string.Format("~/Seminars/{0}", sessionId));
                    string videoPath = Server.MapPath(string.Format("~/Seminars/{0}/Videos", sessionId));
                    if (!System.IO.Directory.Exists(directoryPath))
                    {
                        System.IO.Directory.CreateDirectory(directoryPath);
                    }
                    if (!System.IO.Directory.Exists(videoPath))
                    {
                        System.IO.Directory.CreateDirectory(videoPath);
                    }
                    var size = 0;
                    int fixedSize = 1024 * 1024 * 1000;
                    if (size < fixedSize)
                    {
                        var r = new List<ViewDataUploadFilesResult>();
                        foreach (string file in Request.Files)
                        {
                            HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                            if (hpf.ContentLength == 0)
                                continue;
                            if (hpf.ContentLength + size > fixedSize)
                            {
                                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "Your Folder is full and you can not add more contents" + "\"}", "application/json");
                            }
                            string savedFileName = Path.Combine(videoPath, Path.GetFileName(hpf.FileName));
                            hpf.SaveAs(savedFileName);
                            SessionVideo sv = new SessionVideo();
                            if (videoName != "")
                                sv.VideoName = videoName;
                            else sv.VideoName = savedFileName;
                            sv.SessionID = sessionId;
                            sv.UploadDate = DateTime.Now;
                            m_model.SessionVideos.InsertOnSubmit(sv);
                            m_model.SubmitChanges();
                            Utility.FileUtility.UploadToVODServer(sv.ID, savedFileName, sessionId);
                            r.Add(new ViewDataUploadFilesResult()
                            {
                                Name = sv.VideoName,
                                Length = hpf.ContentLength,
                                Type = hpf.ContentType,
                                Id = sv.ID
                            });
                        }
                        return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
                    }

                    else
                    {
                        return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "Your Folder is full and you can not add more contents" + "\"}", "application/json");
                    }
                }
                else
                {
                    return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "You don't have permission to send file to the server" + "\"}", "application/json");
                }
            }
            catch (Exception ex)
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }
        #endregion
        #region Upload Sample Seminars
        [Authorize]
        [HttpPost]
        public ContentResult UploadSampleVideos(int sampleId)
        {
            try
            {

                string directoryPath = Server.MapPath(string.Format("~/Seminars"));
                    string videoPath = Server.MapPath(string.Format("~/Seminars/Samples"));
                    if (!System.IO.Directory.Exists(directoryPath))
                    {
                        System.IO.Directory.CreateDirectory(directoryPath);
                    }
                    if (!System.IO.Directory.Exists(videoPath))
                    {
                        System.IO.Directory.CreateDirectory(videoPath);
                    }
                  
                    var size = 0;
                    int fixedSize = 1024 * 1024 * 1000;
                    if (size < fixedSize)
                    {
                        var r = new List<ViewDataUploadFilesResult>();
                        foreach (string file in Request.Files)
                        {
                            HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                            if (hpf.ContentLength == 0)
                                continue;
                            if (hpf.ContentLength + size > fixedSize)
                            {
                                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "Your Folder is full and you can not add more contents" + "\"}", "application/json");
                            }
                            string savedFileName = Path.Combine(videoPath, sampleId + new FileInfo(hpf.FileName).Extension);
                            if (System.IO.File.Exists(savedFileName))
                            {
                                System.IO.File.Delete(savedFileName);
                            }
                            hpf.SaveAs(savedFileName);
                            Utility.FileUtility.UploadToVODServerAsSample(sampleId, savedFileName);
                            r.Add(new ViewDataUploadFilesResult()
                            {
                                Name = hpf.FileName,
                                Length = hpf.ContentLength,
                                Type = hpf.ContentType,
                            });
                        }
                        return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
                    }

                    else
                    {
                        return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "Your Folder is full and you can not add more contents" + "\"}", "application/json");
                    }
            }
            catch (Exception ex)
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }
        #endregion
        #region About Us Page
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult EditAboutUsPage(String text)
        {
            try
            {
                var count = m_model.Pages.Count(P=>P.Id == 1);
                Page aboutUsPage = new Page();
                if (count > 0)
                {
                    aboutUsPage = m_model.Pages.Single(P=>P.Id == 1);
                }
                aboutUsPage.PageContent = text;
                aboutUsPage.PageName = "AboutUs";
                if(count <= 0)
                    m_model.Pages.InsertOnSubmit(aboutUsPage);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Save about us page successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetAboutUsPage()
        {
            try
            {
                var count = m_model.Pages.Count(P => P.Id == 1);
                Page aboutUsPage = new Page();
                if (count > 0)
                {
                    aboutUsPage = m_model.Pages.Single(P => P.Id == 1);
                    var Result = aboutUsPage.PageContent;
                    return Json(new { Status = true, Message = "get About Us Page Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
                return Json(new { Status = false, Message = "About us page is empty"}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        #region Guide Page
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult EditGuidePage(String text)
        {
            try
            {
                var count = m_model.Pages.Count(P => P.Id == 2);
                Page aboutUsPage = new Page();
                if (count > 0)
                {
                    aboutUsPage = m_model.Pages.Single(P => P.Id == 2);
                }
                aboutUsPage.PageContent = text;
                aboutUsPage.PageName = "Guide";
                if (count <= 0)
                    m_model.Pages.InsertOnSubmit(aboutUsPage);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Save Guide page successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetGuidePage()
        {
            try
            {
                var count = m_model.Pages.Count(P => P.Id == 2);
                Page aboutUsPage = new Page();
                if (count > 0)
                {
                    aboutUsPage = m_model.Pages.Single(P => P.Id == 2);
                    var Result = aboutUsPage.PageContent;
                    return Json(new { Status = true, Message = "get guide Page Successfully", Result }, JsonRequestBehavior.AllowGet);
                }
                return Json(new { Status = false, Message = "guide page is empty" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion
    }
}
