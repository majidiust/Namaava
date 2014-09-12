using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Webinar.Models;

using Webinar.Utility;


using System.Runtime.Serialization.Json;
using System.Web.Routing;

using Webinar.Controllers;
using System.Web.Security;
using System.IO;
using System.Collections;
using System.Drawing.Imaging;

namespace Webinar.Controllers
{
    public class SessionController : Controller
    {
        public ActionResult Index()
        {

            return View();
        }

        #region Variables
        public IMembershipService MembershipService { get; set; }
        private DataBaseDataContext m_model = new DataBaseDataContext();
        private Logger m_logger = new Logger();
        public static int m_costOfEachParticipate = 5000; //toman
        #endregion

        #region UtilityFunctions
        [HttpGet]
        public ActionResult CheckServerTime(string beginTime, string endTime)
        {
            //TODO : Using more than one server
            try
            {
                string[] parsedBeginDate = beginTime.Split(new char[] { ':' });
                WebinarDateTime begin = new WebinarDateTime();
                begin.Year = int.Parse(parsedBeginDate[0]);
                begin.Month = int.Parse(parsedBeginDate[1]);
                begin.Day = int.Parse(parsedBeginDate[2]);

                TimeSpan sessionStartTime = new TimeSpan(int.Parse(parsedBeginDate[3]), int.Parse(parsedBeginDate[4]), int.Parse(parsedBeginDate[5]));
                begin.Time = sessionStartTime;

                string[] parsedEndDate = endTime.Split(new char[] { ':' });
                WebinarDateTime end = new WebinarDateTime();
                end.Year = int.Parse(parsedEndDate[0]);
                end.Month = int.Parse(parsedEndDate[1]);
                end.Day = int.Parse(parsedEndDate[2]);

                TimeSpan sessionEndTime = new TimeSpan(int.Parse(parsedEndDate[3]), int.Parse(parsedEndDate[4]), int.Parse(parsedEndDate[5]));
                end.Time = sessionEndTime;

                foreach (var x in m_model.Sessions)
                {
                    UtilityController controller = new UtilityController();

                    if (controller.CompareDate(x.WebinarDateTime, begin))
                    {
                        if (begin.Time != null && x.WebinarDateTime.Time != null && end.Time != null && x.WebinarDateTime1.Time != null)
                        {
                            if (begin.Time < x.WebinarDateTime.Time && end.Time >= x.WebinarDateTime.Time)
                                return Json(new { Status = false, Message = "Sever is busy in this time. Try another time for your Seminar" }, JsonRequestBehavior.AllowGet);
                            if (begin.Time >= x.WebinarDateTime.Time && end.Time <= x.WebinarDateTime1.Time)
                                return Json(new { Status = false, Message = "Sever is busy in this time. Try another time for your Seminar" }, JsonRequestBehavior.AllowGet);
                            if (begin.Time <= x.WebinarDateTime1.Time && end.Time >= x.WebinarDateTime1.Time)
                                return Json(new { Status = false, Message = "Sever is busy in this time. Try another time for your Seminar" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                }
                return Json(new { Status = true, Message = "Server is idle and you can have this time" }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }

        }

        [Authorize]
        [HttpGet]
        public ActionResult GetUrlServiceForUser(int sessionId, string userName)
        {
            try
            {
                var user = m_model.aspnet_Users.Single(p => p.UserName == userName);
                var invites = (from p in m_model.SessionInvites where p.UserId == user.UserId && p.SessionId == sessionId select p).ToList();
                var requests = (from p in m_model.SessionRequests where p.Result == "Accepted" && p.UserId == user.UserId && p.SessionId == sessionId select p).ToList();
                var tmpSession = m_model.Sessions.Single(P => P.SessionId == sessionId);
                var isOwner = tmpSession.aspnet_User.UserName.ToLower().Equals(userName.ToLower()) || tmpSession.aspnet_User1.UserName.ToLower().Equals(userName.ToLower());
                //By Majid Sadeghi Alavijeh

                if (invites.Count > 0 || requests.Count > 0 || isOwner)
                {
                    if (tmpSession.StateId == 2)
                    {
                        var services = (from p in m_model.SessionServices
                                        where p.SessionId == sessionId
                                        select new
                                        {
                                            sessionServiceId = p.SessionServicesId,
                                            url = String.Format("http://{0}:{1}", p.ServerIP, p.ServerPort),
                                            codec = p.Codec,
                                            bitRate = p.Bitrate,
                                            serviceType = p.ServiceType.ServiceTypeName
                                        }).ToList();
                        if (services.Count > 0)
                        {
                            //TODO : Baba Jan Agar User Bod CHi ?  Alan N Ta Insert Mikone Hardafe
                            //Done By Shiva

                            for (int i = 0; i < services.Count; i++)
                            {
                                var userInService = (from p in m_model.UserInServices
                                                     where p.UserId == user.UserId && p.SessionServiceId == services[i].sessionServiceId
                                                     select p).ToList();
                                if (userInService.Count == 0)
                                {
                                    UserInService uis = new UserInService();
                                    uis.UserId = user.UserId;

                                    uis.SessionServiceId = services[i].sessionServiceId;

                                    m_model.UserInServices.InsertOnSubmit(uis);
                                }

                            }

                            m_model.SubmitChanges();


                            return Json(new { Status = true, Message = "User Services are available", Result = services, sessionStatus = 2 }, JsonRequestBehavior.AllowGet);

                        }
                        else
                        {
                            return Json(new { Status = false, Message = "No Services Available for this session now." }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    //TODO: VOD!
                    else if (tmpSession.StateId == 3)
                    {
                        var Result = (from p in m_model.SessionServices
                                      where p.SessionId == sessionId && !(p.VodAddress == null || p.VodAddress == "")
                                      select new
                                      {
                                          sessionServiceId = p.SessionServicesId,
                                          url = p.VodAddress,
                                          codec = p.Codec,
                                          bitRate = p.Bitrate,
                                          serviceType = p.ServiceType.ServiceTypeName
                                      }).ToList();
                        if (Result.Count > 0)
                        {

                            return Json(new
                            {
                                Status = true,
                                Message = "User Services are available",
                                Result,
                                sessionStatus = 3
                            }, JsonRequestBehavior.AllowGet);

                        }
                        else
                        {
                            return Json(new { Status = false, Message = "No Services Available for this session now." }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "This Status can not go inside the Seminar" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "You are not invited or have accepted request to come to seminar" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        public WebinarDateTime StringToDate(string time)
        {
            try
            {
                string[] parsedDate = time.Split(new char[] { ':' });
                WebinarDateTime result = new WebinarDateTime();
                result.Year = int.Parse(parsedDate[0]);
                result.Month = int.Parse(parsedDate[1]);
                result.Day = int.Parse(parsedDate[2]);

                TimeSpan timeOf = new TimeSpan(int.Parse(parsedDate[3]), int.Parse(parsedDate[4]), int.Parse(parsedDate[5]));
                result.Time = timeOf;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public string DateToStringLocal(WebinarDateTime dateTime)
        {
            try
            {
                string result = string.Format("ساعت {0} ، مورخ {1}/{2}/{3}", dateTime.Time.Value.Hours, dateTime.Day, dateTime.Month, dateTime.Year);// dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Time);
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public string DateToString(WebinarDateTime dateTime)
        {
            try
            {
                string result = string.Format("{0}:{1}:{2}:{3}", dateTime.Year, dateTime.Month, dateTime.Day, dateTime.Time);
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        protected override void Initialize(RequestContext requestContext)
        {
            if (m_logger == null) { m_logger = new Logger(); }
            //if (FormsService == null) { FormsService = new FormsAuthenticationService(); }
            if (MembershipService == null) { MembershipService = new AccountMembershipService(); }

            base.Initialize(requestContext);
        }

        public int SpaceLeft(int sessionId)
        {
            try
            {
                var inviteCount = m_model.SessionInvites.Count(p => p.SessionId == sessionId);
                var acceptedRequestsCount = m_model.SessionRequests.Count(p => p.SessionId == sessionId && p.Result.ToLower() == "accepted");
                int count = inviteCount + acceptedRequestsCount;
                return count;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public string AutoRegister(string email, string pass)
        {
            try
            {
                MembershipCreateStatus createStatus = MembershipService.CreateUser(email, pass, email);

                if (createStatus == MembershipCreateStatus.Success)
                {
                    //TODO setting roles and then checking! 
                    //Done
                    Roles.AddUserToRole(email, "UserRole");
                    string result = "true";
                    return result;
                }
                else
                {
                    return AccountValidation.ErrorCodeToString(createStatus);
                }
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }


        [HttpGet]
        public ActionResult GetNumberOfParticipants(int sessionId)
        {
            try
            {
                var result = (from p in m_model.UserInSessions
                              where p.SessionId == sessionId
                              select p).ToList();
                int res = result.Count;
                return Json(new { Status = true, Message = "Number Of participants Calculated Successfully", Result = res }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetOnlineUsersByPresentor(int sessionId)
        {
            try
            {
                var result = (from p in m_model.UserInSessions
                              where p.SessionId == sessionId
                              select new
                              {
                                  userName = p.aspnet_User.UserName,
                                  userFirstName = p.aspnet_User.Profile.FirstName,
                                  userLastName = p.aspnet_User.Profile.LastName
                              }).ToList();
                return Json(new { Status = true, Message = "User in Sessions is sent.", Result = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetParticipants(int sessionId)
        {
            try
            {
                var session = m_model.Sessions.Single(p => p.SessionId == sessionId);
                var users = (from p in m_model.UserInSessions
                             where p.SessionId == sessionId
                             select p).ToList();

                var userIdList = (from p in m_model.UserInSessions select p.UserId).ToList();

                var acceptedRequests = (from p in m_model.SessionRequests
                                        where
                                        p.SessionId == sessionId &&
                                        p.Result.ToLower() == "accepted" &&
                                        p.UserId != null
                                        select new
                                        {
                                            firstName = p.aspnet_User.Profile.FirstName,
                                            lastName = p.aspnet_User.Profile.LastName,
                                            userName = p.aspnet_User.UserName,
                                            status = userIdList.Contains((Guid)p.UserId),
                                            isInvited = false
                                        }).ToList();

                var invites = (from p in m_model.SessionInvites
                               where p.SessionId == sessionId
                               select new
                               {
                                   firstName = p.FirstName,
                                   lastName = p.LastName,
                                   userName = p.aspnet_User.UserName,
                                   status = userIdList.Contains((Guid)p.UserId),
                                   isInvited = true
                               }).ToList();

                // foreach (var x in acceptedRequests)
                // {
                //     invites.Add(x);
                // }


                return Json(new { Status = true, Message = "List of All participants and showing onlines", Result = invites }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        #region sessionEDit
        [Authorize]
        [HttpPost]
        public ActionResult EditSessionDesc(int sessionId, string desc, string why, string forWho, string level)
        {
            try
            {
                string userName = User.Identity.Name.ToLower();
                var isExistSession = m_model.Sessions.Count(P => P.SessionId.Equals(sessionId));
                if (isExistSession > 0)
                {
                    var session = m_model.Sessions.Single(P => P.SessionId.Equals(sessionId));
                    bool isOnline = m_model.Sessions.Single(P => P.SessionId.Equals(sessionId)).StateId != 3;
                    if (!isOnline)
                    {
                        var isExistUser = m_model.aspnet_Users.Count(P => P.UserName.ToLower().Equals(userName));
                        if (isExistUser > 0)
                        {
                            var currentUser = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                            if (session.PresentorId.Equals(currentUser.UserId) || session.SessionAdmin.Equals(currentUser.UserId))
                            {
                                session.Why = why;
                                session.Level = level;
                                session.Learner = forWho;
                                session.Description = desc;
                                m_model.SubmitChanges();
                                return Json(new { Status = true, Message = "Has been saved successfully" }, JsonRequestBehavior.AllowGet);
                            }
                            else
                            {
                                return ReturnError("You are not admin or presentor of the session");
                            }
                        }
                        else
                        {
                            return ReturnError("This User does not exist");
                        }
                    }
                    else
                    {
                        return ReturnError("Session Is On-line");
                    }
                }
                else
                {
                    return ReturnError("This Session Doesnot exist");
                }
            }
            catch (Exception ex)
            {
                return ReturnError(ex.Message);
            }
        }
        #endregion

        #region SessionCreate
        [HttpGet]
        public ActionResult CalculateCostSession(string sessionAdmin, string presentorName, string sessionName, int sessionType,
            string beginTime /*YY:MM:DD:HH:MM:SS*/, string endTime /*YY:MM:DD:HH:MM:SS*/, int capacity, string fee,
            string wallpaper, string keywords, string description, string emails, string mobiles, string firstNames, string lastNames)
        {
            try
            {
                // TODO: Calculate the cost of the system due to our policy. 

                return Json(new { Status = true, Message = "Hasn't have the policy of Calculating yet" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult CalculateCost(int hours, int number, bool hasPostPaid)
        {
            try
            {
                string userName = User.Identity.Name.ToLower();
                var user = m_model.aspnet_Users.Single(p => p.UserName == userName);
                PeymentPlan plan = null;
                if (hasPostPaid == true)
                {
                    plan = m_model.PeymentPlans.Single(P => P.NOU == number && P.PostPayment != "0");
                }
                else
                {
                    plan = m_model.PeymentPlans.Single(P => P.NOU == number && P.PostPayment == "0");
                }
                int cost = int.Parse(plan.PrePeyment) * hours;
                if (user.Profile != null)
                {
                    if (user.Profile.Balance > cost)
                    {
                        return Json(new { Status = true, Message = "After creation this cost will subtract from your balance ", Result = cost }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "You need to charge your account this cost", Result = cost }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "First Full Profile please." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ReturnError(string message)
        {
            return Json(new { Status = false, Message = message }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult CreateNewSession(string sessionAdmin, string presentorName, string sessionName, int sessionType,
            string beginTime /*YY:MM:DD:HH:MM:SS*/, string endTime /*YY:MM:DD:HH:MM:SS*/, int capacity, string fee,
            string wallpaper, string keywords, string description, string emails, string mobiles, string firstNames,
            string lastNames, string why, string forLearner, string level, bool isBilled, bool sendSms, string bp, string cf, int mode, string du)
        {

            int sId = -1;

            try
            {
                //bool sendSms = false;
                Session session = new Session();
                session.mode = mode;
                aspnet_User adminUser = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(User.Identity.Name));

                //Check For Admin Exist In System Or Not
                // Majid : What Happen If Admin DoesNot Exist In System ? I thnik that the pre condition is admin existanse
                var admin = (from p in m_model.aspnet_Memberships
                             where p.UserId == adminUser.UserId
                             select p).ToList();
                //Todo : If received admin does not exist we should handle it!

                if (adminUser != null)
                {
                    session.SessionAdmin = adminUser.UserId;
                    if (adminUser.Profile != null)
                    {
                        // admin[0].aspnet_User.Profile.Balance -= int.Parse(fee);
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "Fill your Profile First" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "You must set the admin correctly" }, JsonRequestBehavior.AllowGet);
                }
                session.SessionName = sessionName;
                session.Learner = forLearner;
                session.Why = why;
                session.Level = level;
                session.Duration = du;
                //Calc Start Time
                // the meaning of 2 is online
                if (mode == 1)
                {
                    string[] parsedBeginDate = beginTime.Split(new char[] { ':' });
                    WebinarDateTime sessionStartDate = new WebinarDateTime();
                    sessionStartDate.Year = int.Parse(parsedBeginDate[0]);
                    sessionStartDate.Month = int.Parse(parsedBeginDate[1]);
                    sessionStartDate.Day = int.Parse(parsedBeginDate[2]);
                    TimeSpan sessionStartTime = new TimeSpan(int.Parse(parsedBeginDate[3]), int.Parse(parsedBeginDate[4]), int.Parse(parsedBeginDate[5]));


                    //Calc End Time
                    string[] parsedEndDate = endTime.Split(new char[] { ':' });
                    WebinarDateTime sessionEndDate = new WebinarDateTime();
                    sessionEndDate.Year = int.Parse(parsedEndDate[0]);
                    sessionEndDate.Month = int.Parse(parsedEndDate[1]);
                    sessionEndDate.Day = int.Parse(parsedEndDate[2]);
                    //int duration = int.Parse(parsedEndDate[3]) - int.Parse(parsedBeginDate[3]);
                    TimeSpan sessionEndTime = new TimeSpan(int.Parse(parsedEndDate[3]), int.Parse(parsedEndDate[4]), int.Parse(parsedEndDate[5]));

                    sessionStartDate.Time = sessionStartTime;
                    sessionEndDate.Time = sessionEndTime;
                    //Add Dates To DataBase And Submit Changes In Order to Get Dates Key

                    m_model.WebinarDateTimes.InsertOnSubmit(sessionStartDate);
                    m_model.WebinarDateTimes.InsertOnSubmit(sessionEndDate);
                    m_model.SubmitChanges();//1
                    session.BeginTime = sessionStartDate.id;
                    session.EndTime = sessionEndDate.id;
                    session.WebinarDateTime = sessionStartDate;
                    session.WebinarDateTime1 = sessionEndDate;

                }

                #region payment calculation
                //We Know that bp == 1 is mean that there are post paid, we ry to find related record from plans and calculate seminar fee, after that we check the user balance and then if 
                // is ok, we continue to seminar creation other wise we try to retuen fault 
                PeymentPlan plan = null;

                if (int.Parse(bp) == 0) //we dont have post paid
                {
                    plan = m_model.PeymentPlans.Single(P => P.NOU.Equals(capacity) && P.PostPayment.Equals("0"));
                    cf = "0";
                }
                else
                {
                    plan = m_model.PeymentPlans.Single(P => P.NOU.Equals(capacity) && !P.PostPayment.Equals("0"));
                }


                int cost = (int)(int.Parse(plan.PrePeyment) * float.Parse(du));

                string userName = User.Identity.Name.ToLower();
                var user = m_model.aspnet_Users.Single(p => p.UserName.ToLower().Equals(userName));
                Profile userProfile = null;
                int lastBalance = 0;
                if (m_model.Profiles.Count(P => P.UserId.Equals(user.UserId)) > 0)
                {
                    userProfile = m_model.Profiles.Single(P => P.UserId.Equals(user.UserId));
                    if (userProfile.Balance != null && userProfile.Balance >= cost)
                    {
                        lastBalance = (int)userProfile.Balance;
                        userProfile.Balance = userProfile.Balance - cost;
                        isBilled = true;
                    }
                    else
                    {
                        isBilled = false;
                        return Json(new { Status = false, Message = "There is not enough balance for make payment and create Seminar" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    isBilled = false;
                    userProfile = new Profile();
                    userProfile.Balance = 0;
                    userProfile.UserId = user.UserId;
                    m_model.Profiles.InsertOnSubmit(userProfile);
                    return Json(new { Status = false, Message = "There is not enough balance for make payment and create Seminar" }, JsonRequestBehavior.AllowGet);
                }

                m_model.SubmitChanges();
                #endregion





                //Set The Webinar Keywords
                session.Keywords = keywords;
                //Set The Webinar Description
                session.Description = description;
                //Set The Webinar Wallpaper
                session.Wallpaper = wallpaper;

                //0 represents private webinar and 1 represents public webinar
                session.SessionType = sessionType;
                //Set The Seminar Capacity
                session.Capacity = capacity;
                //Set The Seminar Fee
                session.Fee = fee;
                session.SMSSend = sendSms;
                ///////////////////////////////////////Billing section
                if (!isBilled)
                {
                    //Return Back To Server If Bill Does Not Exist
                    //Todo : Created Date should be delete
                    return Json(new { Status = false, Message = "Bill the Seminar inorder to schedule it" }, JsonRequestBehavior.AllowGet);
                }
                else // satisfy if bill has been done
                {

                    var stateRecord = m_model.SessionStates.Single(p => p.State.Equals("Scheduled"));

                    session.StateId = stateRecord.StateId;
                    //check presentor membership status
                    var presentor = (from p in m_model.aspnet_Memberships
                                     where p.Email == presentorName
                                     select p).ToList();
                    bool announcePresentor = false;

                    {
                        if (presentor.Count > 0)
                        {
                            //Presentor exist In Members
                            session.PresentorId = presentor[0].UserId;
                            //Send Email To Presentor
                            if (announcePresentor)
                            {
                                EmailService service2 = new EmailService();
                                StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailPresentor.html"));
                                string tmpMsg = reader.ReadToEnd();
                                reader.Close();
                                tmpMsg = tmpMsg.Replace("{0}", presentor[0].Email);
                                tmpMsg = tmpMsg.Replace("{1}", session.SessionName);
                                tmpMsg = tmpMsg.Replace("{2}", DateToString(session.WebinarDateTime));
                                tmpMsg = tmpMsg.Replace("{3}", session.Capacity.ToString());

                                //Todo : Store Email Template In DataBase and this work should done automatically and out of order
                                //Done
                                service2.SendMail(presentorName, "درخواست برای سمینار", tmpMsg);
                            }
                        }
                        else
                        {
                            string generatedPAss = Webinar.Utility.Tools.RandomString(8);// System.Web.Security.Membership.GeneratePassword(24, 0);
                            string auto = AutoRegister(presentorName, generatedPAss);
                            if (auto == "true")
                            {
                                var presentorUser = m_model.aspnet_Users.Single(p => p.UserName == Membership.GetUserNameByEmail(presentorName));
                                session.PresentorId = presentorUser.UserId;
                                if (announcePresentor)
                                {
                                    EmailService service2 = new EmailService();
                                    StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailPresentorRegister.html"));
                                    string msg = reader.ReadToEnd();
                                    reader.Close();
                                    msg = msg.Replace("{0}", presentorUser.aspnet_Membership.Email);
                                    msg = msg.Replace("{1}", session.SessionName);
                                    msg = msg.Replace("{2}", DateToString(session.WebinarDateTime));
                                    msg = msg.Replace("{3}", session.Capacity.ToString());
                                    msg = msg.Replace("{4}", presentorUser.UserName);
                                    msg = msg.Replace("{5}", generatedPAss);

                                    // string msg = string.Format(reader.ReadToEnd(), presentor[0].Email, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity, presentorUser.UserName, generatedPAss);
                                    //   string primary = string.Format("<table> <tr><td>آقای/خانم</td><td>{0}</td></tr> <tr><td colspan=2> شما برای ارائه در کنفرانس.</td></tr><tr><td>نام کنفرانس</td><td>{1}</td></tr><tr><td>زمان کنفرانس</td><td>{2}</td></tr><tr><td>ظرفیت</td><td>{3}</td></tr><tr><td colspan=2>دعوت شده اید. لطفا به حساب کاربری خود قسمت دعوت ها مراجعه نمایید. </td></tr><tr><td>نام کاربری</td><td>{4}</td></tr><tr><td>گذرواژه</td><td>{5}</td></tr></table> ", presentorName, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity, presentorUser.UserName, generatedPAss);
                                    service2.SendMail(presentorName, "درخواست برای سمینار", msg);
                                }
                            }
                        }
                    }
                    //Todo : What Happen if autoregister return exception!

                    m_model.Sessions.InsertOnSubmit(session);
                    m_model.SubmitChanges(); // 2
                    sId = session.SessionId;



                    #region End Of Billing
                    WebinarPeyment webinarPeyment = new WebinarPeyment();
                    webinarPeyment.UseID = user.UserId;
                    webinarPeyment.WebinarID = sId;
                    webinarPeyment.For = "Create";
                    webinarPeyment.Fee = cost.ToString();
                    webinarPeyment.date = DateTime.Now;
                    webinarPeyment.PostPeymentFee = cf;

                    m_model.WebinarPeyments.InsertOnSubmit(webinarPeyment);
                    m_model.SubmitChanges();

                    #endregion end of billong

                    //SessionStatus status = new SessionStatus();
                    //status.StateId = stateRecord.StateId;
                    //status.SessionId = session.SessionId;
                    //m_model.SessionStatus.InsertOnSubmit(status);
                    //m_model.SubmitChanges();


                    //Invited User Emails


                    #region Critical Region

                    //Todo : what happen if string is not in proper format
                    string[] emailss = emails.Split(new char[] { ',' });
                    string[] mobiless = mobiles.Split(new char[] { ',' });
                    string[] firstNamess = firstNames.Split(new char[] { ',' });
                    string[] lastNamess = lastNames.Split(new char[] { ',' });

                    //Todo : shoud be change for mobile as user name
                    if (emails != string.Empty)
                    {
                        for (int i = 0; i < emailss.Length; i++)
                        {
                            InviteToParticipate(emailss[i], firstNamess[i], lastNamess[i], mobiless[i], sId);
                        }
                    }
                    #endregion
                    #region Session Creation Services

                    //TODO read bitrates and encoders from somewhere.
                    int[] bitrates = { 64, 128, 256 };
                    for (int i = 0; i < bitrates.Length; i++)
                    {
                        SessionService sessionService = new SessionService();
                        sessionService.AssignedCount = session.Capacity;
                        sessionService.Bitrate = bitrates[i];
                        sessionService.Codec = "OGG";
                        sessionService.ServerIP = "94.232.174.204";
                        sessionService.ServerPort = 8800 + i;
                        sessionService.ServiceTypeId = 3;
                        sessionService.SessionId = session.SessionId;
                        m_model.SessionServices.InsertOnSubmit(sessionService);
                    }
                    for (int i = 0; i < bitrates.Length; i++)
                    {
                        SessionService sessionService = new SessionService();
                        sessionService.AssignedCount = session.Capacity;
                        sessionService.Bitrate = bitrates[i];
                        sessionService.Codec = "WEBM";
                        sessionService.ServerIP = "94.232.174.204";
                        sessionService.ServerPort = 8810 + i;
                        sessionService.ServiceTypeId = 3;
                        sessionService.SessionId = session.SessionId;
                        m_model.SessionServices.InsertOnSubmit(sessionService);
                    }
                    //begin of Voice Only
                    SessionService sessionServiceVoice = new SessionService();
                    sessionServiceVoice.AssignedCount = session.Capacity;
                    sessionServiceVoice.Bitrate = 16;
                    sessionServiceVoice.Codec = "VORBIS";
                    sessionServiceVoice.ServerIP = "94.232.174.204";
                    sessionServiceVoice.ServerPort = 8807;
                    sessionServiceVoice.ServiceTypeId = 1;
                    sessionServiceVoice.SessionId = session.SessionId;
                    m_model.SessionServices.InsertOnSubmit(sessionServiceVoice);
                    //End of Voice Only
                    #endregion

                    m_model.SubmitChanges();
                }
                var Result = new { Fee = cost, Balance = userProfile.Balance, lastBalance = lastBalance };
                return Json(new { Status = true, Message = "Session Created Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                //if(sId != -1)
                //{
                //    var session = m_model.Sessions.Single(p => p.SessionId == sId);
                //    m_model.Sessions.DeleteOnSubmit(session);
                //    m_model.SubmitChanges();
                //}
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion
        #region Delete Seminar
        [HttpGet]
        public ActionResult DeleteSeminar(int sessionId)
        {
            try
            {
                if (m_model.Sessions.Count(P => P.SessionId == sessionId) > 0)
                {
                    var session = m_model.Sessions.Single(P => P.SessionId == sessionId);
                    var invited = m_model.SessionInvites.Where(P => P.SessionId == sessionId);
                    m_model.SessionInvites.DeleteAllOnSubmit(invited);
                    var requested = m_model.SessionRequests.Where(P => P.SessionId == sessionId);
                    m_model.SessionRequests.DeleteAllOnSubmit(requested);
                    var files = m_model.SessionFiles.Where(P => P.SessionId == sessionId);
                    m_model.SessionFiles.DeleteAllOnSubmit(files);
                    var videos = m_model.SessionVideos.Where(P => P.SessionID == sessionId);
                    m_model.SessionVideos.DeleteAllOnSubmit(videos);
                    var services = m_model.SessionServices.Where(P => P.SessionId == sessionId);
                    m_model.SessionServices.DeleteAllOnSubmit(services);
                    var chats = m_model.Chats.Where(P => P.SessionId == sessionId);
                    m_model.Chats.DeleteAllOnSubmit(chats);
                    m_model.Sessions.DeleteOnSubmit(session);

                    var dates = m_model.WebinarDateTimes.Where(P => P.id == session.EndTime || P.id == session.BeginTime);
                    m_model.WebinarDateTimes.DeleteAllOnSubmit(dates);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Session Deleted" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Session Not Found" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion
        #region InviteRequest

        [Authorize]
        [HttpGet]
        public ActionResult ReInviteUser(int inviteId)
        {
            try
            {
                var isExistInvite = m_model.SessionInvites.Count(P => P.InviteId == inviteId);
                if (isExistInvite <= 0)
                {
                    return ReturnError("There Is Not Exist This InviteId");
                }
                var invite = m_model.SessionInvites.Single(P => P.InviteId == inviteId);
                var session = m_model.Sessions.Single(p => p.SessionId == invite.SessionId);
                int sessionId = session.SessionId;
                int isExistInvitedUser = m_model.aspnet_Users.Count(P => P.UserId == invite.UserId);
                if (isExistInvitedUser <= 0)
                {
                    return ReturnError("This User Does Not Exist");
                }
                var invitedUser = m_model.aspnet_Users.Single(P => P.UserId == invite.UserId);
                string startTime = DateToStringLocal(session.WebinarDateTime);
                int duration = session.WebinarDateTime1.Time.Value.Hours - session.WebinarDateTime.Time.Value.Hours;
                string dur = duration.ToString();
                int countS = SpaceLeft(sessionId);
                var user = User.Identity.Name;
                if (session.aspnet_User.UserName.ToLower().Equals(user.ToLower()) || session.aspnet_User1.UserName.ToLower().Equals(user.ToLower()))
                {
                    var profileCount = m_model.Profiles.Count(P => P.UserId.Equals(invitedUser.UserId));
                    if (profileCount > 0)
                    {
                        var profile = m_model.Profiles.Single(P => P.UserId.Equals(invitedUser.UserId));
                        String memberTemplate = "کاربر {0} شما برای شرکت در سمینار {1} که در تاریخ {2} به مدت {3} ساعت و توسط {4} برگزار میگردد، دعوت شده اید. برای شرکت در سمینار به حساب کاربری خود وارد شوید.";
                        var smsText = String.Format(memberTemplate, invite.FirstName + " " + invite.LastName, session.SessionName, startTime, dur, session.aspnet_User1.UserName);
                        if (session.SMSSend == true)
                        {
                            if (invite.MobilePin != null && invite.MobilePin != "-1")
                            {
                                SMS sms = new SMS();
                                sms.SendSmsEvent(new string[] { invite.MobilePin }, smsText);
                            }
                        }

                        StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailInvites.html"));
                        var msg = reader.ReadToEnd();
                        reader.Close();
                        if (session.aspnet_User.UserName.ToLower().Equals(user.ToLower()))
                            msg = msg.Replace("{0}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        else
                            msg = msg.Replace("{0}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                        msg = msg.Replace("{1}", session.SessionName);
                        msg = msg.Replace("{3}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                        msg = msg.Replace("{2}", startTime);
                        msg = msg.Replace("{4}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        msg = msg.Replace("{5}", "-----");
                        msg = msg.Replace("{6}", (session.Capacity - countS).ToString());
                        msg = msg.Replace("{10}", session.aspnet_User.aspnet_Membership.Email);
                        msg = msg.Replace("{11}", session.aspnet_User1.aspnet_Membership.Email);
                        msg = msg.Replace("{7}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        msg = msg.Replace("{8}", session.Keywords);
                        msg = msg.Replace("{9}", session.Description == null ? "-----" : session.Description);
                        EmailService service = new EmailService();
                        service.SendMail(invite.Email, "دعوت به سمینار", msg);
                        var Result = new { date = DateToString(invite.WebinarDateTime), inviteId = invite.InviteId, FirstName = invite.FirstName, LastName = invite.LastName, Mobile = invite.MobilePin };
                        return Json(new { Status = true, Message = "Invited Successfully!", Result }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return ReturnError("User Should complete his/her profile before");
                    }
                }
                else
                {
                    return ReturnError("You dont have enough privilage in order to invite person in session");
                }
            }
            catch (Exception ex)
            {
                return ReturnError(ex.Message);
            }
        }


        [Authorize]
        [HttpGet]
        public ActionResult InviteToParticipate(string email, string firstName, string lastName, string mobile, int sessionId)
        {
            try
            {
                var user = User.Identity.Name;
                //TODO : Chera Iek Nafar Ro 2 bar mishavad Add Kard ?
                //Done By Shiva, Now it doesn't send another invitation and also if someone has requested it doesn't send invitation!
                var session = m_model.Sessions.Single(p => p.SessionId == sessionId);


                string startTime = DateToStringLocal(session.WebinarDateTime);
                int duration = session.WebinarDateTime1.Time.Value.Hours - session.WebinarDateTime.Time.Value.Hours;
                string dur = duration.ToString();

                int count = SpaceLeft(sessionId);
                if (count >= session.Capacity)
                {
                    return Json(new { Status = false, Message = "Full capacity no one can be invited" }, JsonRequestBehavior.AllowGet);
                }

                var presentor = session.aspnet_User.aspnet_Membership.Email;

                EmailService service = new EmailService();
                // int settingsId = m_model.ApplicationSettings.Single(i => (i.SettingName == "smsSettings")).SettingsId;
                //var smsSend = m_model.SettingsProperties.Single(w => (w.SettingsId == settingsId) && (w.PropertyName == "smsSendForEvent")).PropertyValue;
                SMS sms = new SMS();
                StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailInvites.html"));
                StreamReader reader2 = new StreamReader(Server.MapPath("~/Templates/EmailInvitesRegister.html"));

                string anonymousTemplate = "کاربر {0} شما برای شرکت در سمینار {1} که در تاریخ {2} به مدت {3} ساعت  و توسط {4} برگزار میگردد، دعوت شده اید. برای شرکت در سمینار به پست الکترونیکی خود مراجعه کنید.";
                anonymousTemplate += "نام کاربری پست الکترونیکی شما و کلمه عبور شما  {5} میباشد.";
                String memberTemplate = "کاربر {0} شما برای شرکت در سمینار {1} که در تاریخ {2} به مدت {3} ساعت و توسط {4} برگزار میگردد، دعوت شده اید. برای شرکت در سمینار به حساب کاربری خود وارد شوید.";

                SessionInvite invite = new SessionInvite();
                String msg = "";
                string smsText = "";
                // m_logger.Log("We recieved near Count");
                var isExist = m_model.aspnet_Memberships.Count(p => p.Email == email) > 0 ? true : false;

                //m_logger.Log("We passed Count");

                if (isExist != false)
                {
                    //  m_logger.Log("user Exist");
                    var userId = m_model.aspnet_Memberships.Single(p => p.Email == email).UserId;
                    var uis = (from p in m_model.SessionInvites where p.SessionId == sessionId && p.UserId == userId select p).ToList();
                    if (uis.Count > 0)
                    {
                        return Json(new { Status = false, Message = "This user has been invited previously." }, JsonRequestBehavior.AllowGet);
                    }
                    var requested = (from p in m_model.SessionRequests where p.SessionId == sessionId && p.UserId == userId select p).ToList();
                    if (requested.Count > 0)
                    {
                        return Json(new { Status = false, Message = "This user has requested previously" }, JsonRequestBehavior.AllowGet);
                    }
                    // m_logger.Log("found userid");
                    invite.UserId = userId;

                    //msg = String.Format(reader.ReadToEnd(), firstName + " " + lastName, session.SessionName, presentor, startTime, dur);
                    msg = reader.ReadToEnd();
                    reader.Close();
                    if (session.aspnet_User.UserName.ToLower().Equals(user.ToLower()))
                        msg = msg.Replace("{0}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                    else
                        msg = msg.Replace("{0}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                    msg = msg.Replace("{1}", session.SessionName);
                    msg = msg.Replace("{3}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                    msg = msg.Replace("{2}", startTime);
                    msg = msg.Replace("{4}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                    msg = msg.Replace("{5}", "-----");
                    msg = msg.Replace("{6}", (session.Capacity - count).ToString());
                    msg = msg.Replace("{10}", session.aspnet_User.aspnet_Membership.Email);
                    msg = msg.Replace("{11}", session.aspnet_User1.aspnet_Membership.Email);
                    msg = msg.Replace("{7}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                    msg = msg.Replace("{8}", session.Keywords);
                    msg = msg.Replace("{9}", session.Description == null ? "-----" : session.Description);

                    smsText = String.Format(memberTemplate, firstName + " " + lastName, session.SessionName, startTime, dur, presentor);
                }
                else
                {


                    //  m_logger.Log("user doesn't exist");
                    string generatedPAss = Webinar.Utility.Tools.RandomString(8);// System.Web.Security.Membership.GeneratePassword(24, 0);
                    string auto = AutoRegister(email, generatedPAss);
                    if (auto == "true")
                    {
                        //msg = String.Format(reader2.ReadToEnd(), firstName + " " + lastName, session.SessionName, presentor, startTime, dur, email, generatedPAss);
                        msg = reader2.ReadToEnd();
                        reader2.Close();

                        //MAJIDDDDDDDDDDDDD
                        if (session.aspnet_User.UserName.ToLower().Equals(User.Identity.Name.ToLower()))
                            msg = msg.Replace("{0}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        else
                            msg = msg.Replace("{0}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                        msg = msg.Replace("{1}", session.SessionName);
                        msg = msg.Replace("{3}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                        msg = msg.Replace("{2}", startTime);
                        msg = msg.Replace("{4}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        msg = msg.Replace("{5}", "-----");
                        msg = msg.Replace("{6}", (session.Capacity - count).ToString());
                        msg = msg.Replace("{10}", session.aspnet_User.aspnet_Membership.Email);
                        msg = msg.Replace("{11}", session.aspnet_User1.aspnet_Membership.Email);
                        msg = msg.Replace("{7}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                        msg = msg.Replace("{8}", session.Keywords);
                        msg = msg.Replace("{9}", session.Description == null ? "-----" : session.Description);
                        msg = msg.Replace("{12}", email);
                        msg = msg.Replace("{13}", generatedPAss);

                        //TODO MAY CAUSE SOME PROBLEMS
                        var asp_user = m_model.aspnet_Users.Single(p => p.UserName == email);
                        invite.UserId = asp_user.UserId;

                        //Create New User PROFILE
                        var profileCount = m_model.Profiles.Count(P => P.UserId.Equals(invite.UserId));
                        if (mobile != null && mobile != "")
                        {
                            asp_user.aspnet_Membership.MobilePIN = mobile;
                        }
                        if (profileCount <= 0)
                        {
                            Profile profile = new Profile();
                            profile.UserId = asp_user.UserId;
                            profile.FirstName = firstName;
                            profile.LastName = lastName;
                            m_model.Profiles.InsertOnSubmit(profile);
                        }
                    }
                    else
                    {
                        return Json(new { Status = false, Message = auto }, JsonRequestBehavior.AllowGet);
                    }
                    smsText = String.Format(anonymousTemplate, firstName + " " + lastName, session.SessionName, startTime, dur, presentor, generatedPAss);
                }

                var inviteCurrentDate = new System.Globalization.PersianCalendar();
                WebinarDateTime inviteDateTime = new WebinarDateTime();
                inviteDateTime.Year = inviteCurrentDate.GetYear(DateTime.Now);
                inviteDateTime.Month = inviteCurrentDate.GetMonth(DateTime.Now);
                inviteDateTime.Day = inviteCurrentDate.GetDayOfMonth(DateTime.Now);
                m_model.WebinarDateTimes.InsertOnSubmit(inviteDateTime);
                m_model.SubmitChanges();

                invite.InviteDate = inviteDateTime.id;

                invite.Email = email;
                invite.MobilePin = mobile;
                invite.SessionId = session.SessionId;
                invite.FirstName = firstName;
                invite.LastName = lastName;
                m_model.SessionInvites.InsertOnSubmit(invite);
                m_model.SubmitChanges();
                service.SendMail(email, "دعوت به سمینار", msg);
                if (session.SMSSend == true)
                {
                    if (mobile != null && mobile != "-1")
                    {
                        sms.SendSmsEvent(new string[] { mobile }, smsText);
                    }
                }

                var Result = new { inviteId = invite.InviteId, date = DateToString(invite.WebinarDateTime) };

                return Json(new { Status = true, Message = "Invitation Sent Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        [Authorize]
        [HttpGet]
        public ActionResult InviteExistUsetToParticipate(int sessionId, string email)
        {
            try
            {
                var session = m_model.Sessions.Single(p => p.SessionId == sessionId);
                string startTime = DateToStringLocal(session.WebinarDateTime);
                int duration = session.WebinarDateTime1.Time.Value.Hours - session.WebinarDateTime.Time.Value.Hours;
                string dur = duration.ToString();

                int countS = SpaceLeft(sessionId);
                if (countS >= session.Capacity)
                {
                    return Json(new { Status = false, Message = "Full capacity no one can be invited" }, JsonRequestBehavior.AllowGet);
                }

                var user = User.Identity.Name;
                if (session.aspnet_User.UserName.ToLower().Equals(user.ToLower()) || session.aspnet_User1.UserName.ToLower().Equals(user.ToLower()))
                {
                    var invitedUser = m_model.aspnet_Memberships.Single(p => p.LoweredEmail.Equals(email.ToLower()));
                    var count = m_model.SessionInvites.Count(P => P.Email.Equals(invitedUser));
                    if (count != 0)
                    {
                        return ReturnError("Has been invited before");
                    }
                    else
                    {
                        var profileCount = m_model.Profiles.Count(P => P.UserId.Equals(invitedUser.UserId));
                        if (profileCount > 0)
                        {

                            var profile = m_model.Profiles.Single(P => P.UserId.Equals(invitedUser.UserId));
                            SessionInvite newInvite = new SessionInvite();
                            newInvite.Email = email;
                            newInvite.FirstName = profile.FirstName;
                            newInvite.LastName = profile.LastName;
                            newInvite.MobilePin = profile.aspnet_User.aspnet_Membership.MobilePIN;
                            newInvite.UserId = profile.UserId;
                            var inviteCurrentDate = new System.Globalization.PersianCalendar();
                            WebinarDateTime inviteDateTime = new WebinarDateTime();
                            inviteDateTime.Year = inviteCurrentDate.GetYear(DateTime.Now);
                            inviteDateTime.Month = inviteCurrentDate.GetMonth(DateTime.Now);
                            inviteDateTime.Day = inviteCurrentDate.GetDayOfMonth(DateTime.Now);
                            m_model.WebinarDateTimes.InsertOnSubmit(inviteDateTime);
                            m_model.SubmitChanges();
                            newInvite.InviteDate = inviteDateTime.id;
                            newInvite.SessionId = session.SessionId;
                            m_model.SessionInvites.InsertOnSubmit(newInvite);
                            m_model.SubmitChanges();
                            String memberTemplate = "کاربر {0} شما برای شرکت در سمینار {1} که در تاریخ {2} به مدت {3} ساعت و توسط {4} برگزار میگردد، دعوت شده اید. برای شرکت در سمینار به حساب کاربری خود وارد شوید.";
                            var smsText = String.Format(memberTemplate, newInvite.FirstName + " " + newInvite.LastName, session.SessionName, startTime, dur, session.aspnet_User1.UserName);
                            if (session.SMSSend == true)
                            {
                                if (newInvite.MobilePin != null && newInvite.MobilePin != "-1")
                                {
                                    SMS sms = new SMS();
                                    sms.SendSmsEvent(new string[] { newInvite.MobilePin }, smsText);
                                }
                            }

                            StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailInvites.html"));
                            var msg = reader.ReadToEnd();
                            reader.Close();
                            if (session.aspnet_User.UserName.ToLower().Equals(user.ToLower()))
                                msg = msg.Replace("{0}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                            else
                                msg = msg.Replace("{0}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                            msg = msg.Replace("{1}", session.SessionName);
                            msg = msg.Replace("{3}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                            msg = msg.Replace("{2}", startTime);
                            msg = msg.Replace("{4}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                            msg = msg.Replace("{5}", "-----");
                            msg = msg.Replace("{6}", (session.Capacity - countS).ToString());
                            msg = msg.Replace("{10}", session.aspnet_User.aspnet_Membership.Email);
                            msg = msg.Replace("{11}", session.aspnet_User1.aspnet_Membership.Email);
                            msg = msg.Replace("{7}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                            msg = msg.Replace("{8}", session.Keywords);
                            msg = msg.Replace("{9}", session.Description == null ? "-----" : session.Description);
                            EmailService service = new EmailService();
                            service.SendMail(email, "دعوت به سمینار", msg);

                            var Result = new { date = DateToString(inviteDateTime), inviteId = newInvite.InviteId, FirstName = newInvite.FirstName, LastName = newInvite.LastName, Mobile = newInvite.MobilePin };
                            return Json(new { Status = true, Message = "Invited Successfully!", Result }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            return ReturnError("User Should complete his/her profile before");
                        }

                    }
                }
                else
                {
                    return ReturnError("You dont have enough privilage in order to invite person in session");
                }
            }
            catch (Exception ex)
            {
                return ReturnError(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult RequestToParticipate(int sessionId, string email, string mobile)
        {
            try
            {
                var exist = m_model.SessionRequests.Count(P => P.SessionId == sessionId && P.RequestEmail.ToLower().Equals(email.ToLower()));
                var invited = m_model.SessionInvites.Count(p => p.SessionId == sessionId && p.Email.ToLower().Equals(email.ToLower()));
                if (exist > 0)
                {
                    string msg = "Request With This Email Address Already Exist For This Seminar.";
                    return Json(new { Status = false, Message = msg }, JsonRequestBehavior.AllowGet);
                }
                else if (invited > 0)
                {
                    return Json(new { Status = false, Message = "This Email is invited Previously" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    int count = SpaceLeft(sessionId);
                    var session = m_model.Sessions.Single(p => p.SessionId == sessionId);
                    if (count >= session.Capacity)
                    {
                        return Json(new { Status = false, Message = "The Seminar is full and has no free space" }, JsonRequestBehavior.AllowGet);
                    }
                    var membership = (from p in m_model.aspnet_Memberships where p.Email == email select p).ToList();
                    SessionRequest request = new SessionRequest();
                    if (membership.Count > 0)
                    {
                        request.UserId = membership[0].UserId;
                    }
                    request.RequestEmail = email;
                    request.RequestMobile = mobile;
                    request.SessionId = sessionId;
                    request.Result = "Not Seen";

                    if (UserPeymentSession(sessionId) != "-1")
                    {
                        request.IsPayed = false;
                    }

                    var requestCurrentDate = new System.Globalization.PersianCalendar();
                    WebinarDateTime requestDateTime = new WebinarDateTime();
                    requestDateTime.Year = requestCurrentDate.GetYear(DateTime.Now);
                    requestDateTime.Month = requestCurrentDate.GetMonth(DateTime.Now);
                    requestDateTime.Day = requestCurrentDate.GetDayOfMonth(DateTime.Now);
                    m_model.WebinarDateTimes.InsertOnSubmit(requestDateTime);
                    m_model.SubmitChanges();

                    request.RequestDate = requestDateTime.id;
                    m_model.SessionRequests.InsertOnSubmit(request);
                    m_model.SubmitChanges();
                    int followCode = request.RequestId;
                    var Result = new
                    {
                        Code = followCode,
                    };



                    StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailRequest.html"));
                    //string msg = string.Format(reader.ReadToEnd(), email, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity, followCode);
                    string msg = reader.ReadToEnd();
                    reader.Close();
                    msg = msg.Replace("{0}", email);
                    msg = msg.Replace("{1}", session.SessionName);
                    msg = msg.Replace("{2}", DateToString(session.WebinarDateTime));
                    msg = msg.Replace("{3}", session.aspnet_User1.Profile == null ? session.aspnet_User1.UserName : session.aspnet_User1.Profile.FirstName + " " + session.aspnet_User1.Profile.LastName);
                    msg = msg.Replace("{4}", followCode.ToString());
                    EmailService service = new EmailService();
                    string smsText = string.Format(" در خواست شما برای شرکت در سمینار ثبت گردید. شماره پیگیری شما {0} است", followCode);
                    service.SendMail(request.RequestEmail, "درخواست برای سمینار", msg);
                    service.SendMail(request.Session.aspnet_User1.aspnet_Membership.Email, "درخواست جدید برای سمینار", "یک درخواست جدید برای سمینار شما ثبت شده است.");
                    SMS sms = new SMS();
                    if (session.SMSSend == true)
                    {
                        if (request.RequestMobile != null && request.RequestMobile != "-1")
                        {
                            sms.SendSmsEvent(new string[] { request.RequestMobile }, smsText);
                        }
                    }
                    return Json(new { Status = true, Message = "You must wait until your request process", Result }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        #region Helper

        #endregion

        [Authorize]
        [HttpGet]
        public ActionResult CheckRequestResult(int sessionID)
        {
            try
            {
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                int count = m_model.SessionRequests.Count(P => P.UserId.Equals(user.UserId) && P.SessionId.Equals(sessionID));
                if (count > 0)
                {

                    var Result = new { Exist = true, Code = m_model.SessionRequests.Single(P => P.UserId.Equals(user.UserId) && P.SessionId.Equals(sessionID)).RequestId };
                    return Json(new { Status = true, Result, Message = "Request Has Been Submitted Later" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var Result = new { Exist = false };
                    return Json(new { Status = true, Result, Message = "Request Does not exist" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ViewRequests(string userName)
        {
            try
            {
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName));
                var requests = (from p in m_model.SessionRequests
                                where p.UserId == user.UserId
                                select new
                                {
                                    sessionId = p.SessionId,
                                    sessionName = p.Session.SessionName,
                                    presentorUserName = p.Session.aspnet_User.UserName,
                                    presentorFirstName = p.Session.aspnet_User.Profile.FirstName,
                                    presentorLastName = p.Session.aspnet_User.Profile.LastName,
                                    adminUserName = p.Session.aspnet_User1.UserName,
                                    adminFirstName = p.Session.aspnet_User1.Profile.FirstName,
                                    adminLastName = p.Session.aspnet_User1.Profile.LastName,
                                    beginTime = DateToString(p.WebinarDateTime),
                                    duration = p.Session.WebinarDateTime1.Time.Value.Hours - p.Session.WebinarDateTime.Time.Value.Hours,
                                    status = p.Session.SessionState.State,
                                    result = p.Result,
                                    isVod = p.Session.StateId > 2 ? true : false,
                                    fee = UserPeymentSession(p.SessionId),
                                    isPayed = p.IsPayed == null ? false : p.IsPayed,
                                    requestID = p.RequestId
                                }).ToList();
                return Json(new { Status = true, Result = requests, Message = "List of Requests sent" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ViewInvitations(string userName)
        {

            try
            {
                var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName));
                var invites = (from p in m_model.SessionInvites
                               where p.UserId == user.UserId
                               select new
                               {
                                   sessionId = p.SessionId,
                                   sessionName = p.Session.SessionName,
                                   presentorUserName = p.Session.aspnet_User.UserName,
                                   presentorFirstName = p.Session.aspnet_User.Profile.FirstName,
                                   presentorLastName = p.Session.aspnet_User.Profile.LastName,
                                   adminUserName = p.Session.aspnet_User1.UserName,
                                   adminFirstName = p.Session.aspnet_User1.Profile.FirstName,
                                   adminLastName = p.Session.aspnet_User1.Profile.LastName,
                                   beginTime = DateToString(p.Session.WebinarDateTime),
                                   duration = p.Session.WebinarDateTime1.Time.Value.Hours - p.Session.WebinarDateTime.Time.Value.Hours,

                                   status = p.Session.SessionState.State,
                                   isVod = p.Session.StateId > 2 ? true : false

                               }).ToList();
                return Json(new { Status = true, Result = invites, Message = "List of Invites sent" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult SetResultForRequest(int requestId, bool result)
        {
            try
            {
                var request = m_model.SessionRequests.Single(p => p.RequestId == requestId);
                var session = m_model.Sessions.Single(p => p.SessionId == request.SessionId);
                int followCode = requestId;
                int countS = SpaceLeft(session.SessionId);
                if (request.Result != "Accepted")
                {
                    if (result)
                    {
                        if (SpaceLeft(request.SessionId) < session.Capacity)
                        {
                            request.Result = "Accepted";
                            var user = (from p in m_model.aspnet_Users where p.aspnet_Membership.Email == request.RequestEmail select p).ToList();
                            EmailService service = new EmailService();
                            SMS sms = new SMS();
                            if (user.Count > 0)
                            {
                                m_model.SubmitChanges();
                                StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailAcceptRequest.html"));
                                //string primary = string.Format(reader.ReadToEnd(), request.RequestEmail, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity);
                                string msg = reader.ReadToEnd();
                                reader.Close();
                                msg = msg.Replace("{0}", request.RequestEmail);
                                msg = msg.Replace("{1}", session.SessionName);
                                msg = msg.Replace("{2}", DateToString(session.WebinarDateTime));
                                msg = msg.Replace("{3}", session.Capacity.ToString());

                                string smsText = string.Format("درخواست شما بررسی شده و با درخواست شما موافقت شده است.", followCode);
                                smsText += string.Format(" برای ورود به آدرس http://{0} مراجعه کنید. ", Webinar.Utility.StaticParams.m_serverAddress);
                                service.SendMail(request.RequestEmail, "درخواست برای سمینار", msg);
                                if (session.SMSSend == true)
                                {
                                    if (request.RequestMobile != null && request.RequestMobile != "-1")
                                    {
                                        sms.SendSmsEvent(new string[] { request.RequestMobile }, smsText);
                                    }
                                }
                            }
                            else
                            {
                                string generatedPAss = Webinar.Utility.Tools.RandomString(8);// System.Web.Security.Membership.GeneratePassword(24, 0);

                                string auto = AutoRegister(request.RequestEmail, generatedPAss);

                                //string[] register = auto.Split(new char[] { ',' });

                                if (auto == "true")
                                {
                                    StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailAcceptRequestRegister.html"));
                                    //string primary = string.Format(reader.ReadToEnd(), request.RequestEmail, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity, request.RequestEmail, generatedPAss);
                                    string msg = reader.ReadToEnd();
                                    reader.Close();
                                    msg = msg.Replace("{0}", request.RequestEmail);
                                    msg = msg.Replace("{1}", session.SessionName);
                                    msg = msg.Replace("{2}", DateToString(session.WebinarDateTime));
                                    msg = msg.Replace("{3}", session.Capacity.ToString());
                                    msg = msg.Replace("{4}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                                    msg = msg.Replace("{5}", "-----");
                                    msg = msg.Replace("{6}", (session.Capacity - countS).ToString());
                                    msg = msg.Replace("{10}", session.aspnet_User.aspnet_Membership.Email);
                                    msg = msg.Replace("{11}", session.aspnet_User1.aspnet_Membership.Email);
                                    msg = msg.Replace("{7}", session.aspnet_User.Profile == null ? session.aspnet_User.UserName : session.aspnet_User.Profile.FirstName + " " + session.aspnet_User.Profile.LastName);
                                    msg = msg.Replace("{8}", session.Keywords);
                                    msg = msg.Replace("{9}", session.Description == null ? "-----" : session.Description);

                                    //TODO: may cause problems here
                                    var newUser = m_model.aspnet_Users.Single(p => p.UserName == request.RequestEmail);
                                    request.UserId = newUser.UserId;
                                    m_model.SubmitChanges();
                                    string smsText = "درخواست شما بررسی شده و با درخواست شما موافقت شده است .";
                                    //smsText += " نام کاربری شما : " + request.RequestEmail + " و کلمه عبور شما    " + register[1];
                                    smsText += "برای ورود به پست الکترونیکی خود مراجعه فرمایید";
                                    service.SendMail(request.RequestEmail, "درخواست برای سمینار", msg);
                                    if (session.SMSSend == true)
                                    {
                                        if (request.RequestMobile != null && request.RequestMobile != "-1")
                                        {
                                            sms.SendSmsEvent(new string[] { request.RequestMobile }, smsText);
                                        }
                                    }
                                }
                                else
                                {
                                    return Json(new { Status = false, Message = auto }, JsonRequestBehavior.AllowGet);
                                }

                            }
                        }
                        else
                        {
                            return Json(new { Status = false, Message = "You have not any free space to accept the user" }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    else
                    {
                        request.Result = "Rejected";
                        EmailService service = new EmailService();
                        SMS sms = new SMS();
                        StreamReader reader = new StreamReader(Server.MapPath("~/Templates/EmailRejectRequest.html"));
                        //string primary = string.Format(reader.ReadToEnd(), request.RequestEmail, session.SessionName, DateToString(session.WebinarDateTime), session.Capacity, followCode);
                        string msg = reader.ReadToEnd();
                        reader.Close();
                        msg = msg.Replace("{0}", request.RequestEmail);
                        msg = msg.Replace("{1}", session.SessionName);
                        msg = msg.Replace("{2}", DateToString(session.WebinarDateTime));
                        msg = msg.Replace("{3}", session.Capacity.ToString());
                        msg = msg.Replace("{4}", followCode.ToString());
                        string smsText = string.Format("درخواست شما با شماره پیگیری {0} بررسی و ", followCode);
                        smsText += "با درخواست شما برای شرکت در سمینار موافقت نشده است.";
                        service.SendMail(request.RequestEmail, "درخواست برای سمینار", msg);
                        if (session.SMSSend == true)
                        {
                            if (request.RequestMobile != null && request.RequestMobile != "-1")
                            {
                                sms.SendSmsEvent(new string[] { request.RequestMobile }, smsText);
                            }
                        }
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = " You have Accepted this person and it can not change." }, JsonRequestBehavior.AllowGet);
                }
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Result commited Successfully" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ViewSeminarRequests(int sessionId)
        {
            try
            {
                var users = (from p in m_model.SessionRequests
                             where p.SessionId == sessionId
                             select new
                             {
                                 //userName = p.aspnet_User.UserName,
                                 requestId = p.RequestId,
                                 userFirstName = p.aspnet_User.Profile.FirstName,
                                 userLastName = p.aspnet_User.Profile.LastName,
                                 email = p.RequestEmail,
                                 result = p.Result,
                                 requestDate = DateToString(p.WebinarDateTime),
                                 isVod = p.Session.StateId > 2 ? true : false

                             }).ToList();
                return Json(new { Status = true, Message = "List of User Requests Sent", Result = users }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ViewSeminarInvitations(int sessionId)
        {
            try
            {
                var users = (from p in m_model.SessionInvites
                             where p.SessionId == sessionId
                             select new
                             {
                                 inviteId = p.InviteId,
                                 userFirstName = p.FirstName,
                                 userLastName = p.LastName,
                                 email = p.Email,

                                 inviteDate = DateToString(p.WebinarDateTime),
                                 isVod = p.Session.StateId > 2 ? true : false

                             }).ToList();
                return Json(new { Status = true, Message = "List of User Invitations Sent", Result = users }, JsonRequestBehavior.AllowGet);
            }

            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion

        #region Search
        [Authorize]
        [HttpGet]
        public ActionResult SessionSearchByAdmin(string adminName)
        {
            try
            {
                var admin = m_model.aspnet_Users.Single(p => p.UserName.Equals(adminName));

                var result = (from p in m_model.Sessions
                              where p.SessionAdmin.Equals(admin.UserId)
                              select new
                              {
                                  id = p.SessionId,
                                  name = p.SessionName,
                                  presentorUserName = p.aspnet_User.UserName,
                                  adminUserName = p.aspnet_User1.UserName,
                                  capacity = p.Capacity,
                                  presentor = p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                  beginTime = DateToString(p.WebinarDateTime),
                                  duration = p.WebinarDateTime1.Time.Value.Hours - p.WebinarDateTime.Time.Value.Hours,
                                  status = p.SessionState.State//"In Progress" //p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State //"In Progress"// p.SessionStatus == null ? "In Progress" : (p.SessionStatus.Count > 0 ? p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State : "In Progress")

                              }).OrderByDescending(P => P.id).ToList();
                return Json(new { Status = true, Message = "Search done successfully", Result = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ViewCurrentSession(string sessionName)
        {
            try { return Json(new { }, JsonRequestBehavior.AllowGet); }
            catch (Exception ex)
            {
                return Json(new { Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }



        [HttpGet]
        public ActionResult SessionSearchById(int sessionId)
        {
            try
            {
                //var session = m_model.aspnet_Users.Single(p => p.UserName.Equals(adminName));
                var x = m_model.Sessions.Count(P => P.SessionId == sessionId);
                if (x > 0)
                {
                    Hashtable hashtable = new Hashtable();

                    var justForCapacity = (from p in m_model.Sessions
                                           where p.SessionType == 1
                                           select new
                                           {
                                               id = p.SessionId,
                                               capacity = p.Capacity
                                           });


                    foreach (var xx in justForCapacity)
                    {
                        hashtable[xx.id] = xx.capacity - SpaceLeft(xx.id);
                    }

                    var video = m_model.SessionVideos.Where(P => P.SessionID.Equals(sessionId) && P.IsAdvertise == true).ToList();
                    string ad = "--";
                    if (video.Count > 0)
                    {
                        FileInfo tmpFileIno = new FileInfo(video[0].VideoName);
                        ad = "http://94.232.174.204:7700/Namaava/" + sessionId + "/" + video[0].ID + tmpFileIno.Extension;
                    }
                    var result = (from p in m_model.Sessions
                                  where p.SessionId == sessionId
                                  select new
                                  {
                                      id = p.SessionId,
                                      name = p.SessionName,
                                      description = p.Description,
                                      capacity = p.Capacity,
                                      presentor = p.aspnet_User.Profile == null ? p.aspnet_User.UserName : p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                      admin = p.aspnet_User1.Profile == null ? p.aspnet_User1.UserName : p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                      presentorUserName = p.aspnet_User.UserName,
                                      adminUserName = p.aspnet_User1.UserName,
                                      beginTime = p.WebinarDateTime == null ? "آفلاین" : DateToString(p.WebinarDateTime),
                                      duration = p.Duration,
                                      primaryContent = p.PrimaryContentID == null ? -1 : p.PrimaryContentID,
                                      status = p.SessionState.State,//"In Progress" //p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State //"In Progress"// p.SessionStatus == null ? "In Progress" : (p.SessionStatus.Count > 0 ? p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State : "In Progress"),
                                      poster = p.Wallpaper,
                                      why = p.Why,
                                      forWho = p.Learner,
                                      remained = hashtable[p.SessionId],
                                      level = p.Level,
                                      fee = UserPeymentSession(p.SessionId),
                                      advertise = ad,
                                      mode = p.mode
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = "Search done successfully", Result = result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "The Id Does not exist" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult ViewUpcomingEvent()
        {
            try
            {
                return Json(new { }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult SessionSearch(string sessionName)
        {
            try
            {
                var session = (from p in m_model.Sessions where p.SessionName.Equals(sessionName) select p).ToList();
                return Json(new { Status = true, Message = "Search done successfully", Result = session }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetOfflineSeminars()
        {
            try
            {
                var result = (from p in m_model.Sessions
                              where p.mode == null || p.mode == 0
                              select new
                              {
                                  id = p.SessionId,
                                  name = p.SessionName,
                                  presentorUserName = p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                  adminUserName = p.aspnet_User1.UserName,
                                  capacity = p.Capacity,
                                  admin = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                  duration = p.Duration == null ? "1" : p.Duration,
                                  status = p.SessionState.State//"In Progress"// p.SessionStatus == null ? "In Progress" : (p.SessionStatus.Count > 0 ? p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State : "In Progress")

                              }).OrderByDescending(P => P.id).ToList();
                return Json(new { Status = true, Message = "Search done successfully", Result = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpGet]
        public ActionResult SessionSearchByPresentor(string presentorName)
        {

            try
            {
                //   m_logger.Log("started");
                var presentor = m_model.aspnet_Users.Single(p => p.UserName.Equals(presentorName));

                var result = (from p in m_model.Sessions
                              where p.PresentorId.Equals(presentor.UserId)
                              select new
                              {
                                  id = p.SessionId,
                                  name = p.SessionName,
                                  // presentorUserName = p.aspnet_User.UserName,
                                  presentorUserName = p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                  adminUserName = p.aspnet_User1.UserName,
                                  capacity = p.Capacity,
                                  admin = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                  beginTime = DateToString(p.WebinarDateTime),
                                  duration = p.WebinarDateTime1.Time.Value.Hours - p.WebinarDateTime.Time.Value.Hours,
                                  status = p.SessionState.State//"In Progress"// p.SessionStatus == null ? "In Progress" : (p.SessionStatus.Count > 0 ? p.SessionStatus[p.SessionStatus.Count - 1].SessionState.State : "In Progress")

                              }).OrderByDescending(P => P.id).ToList();
                return Json(new { Status = true, Message = "Search done successfully", Result = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult SessionSearchByKeywords(string keyword)
        {
            try
            {
                var session = (from p in m_model.Sessions where (p.Keywords.CompareTo(keyword) == 1) select p).ToList();
                //var session = (from p in m_model.Sessions where p.SessionName.Equals(sessionName) select p).ToList();
                // return Json(new { Status = true, Message = "Search done successfully" }, JsonRequestBehavior.AllowGet);
                return Json(new { Status = true, Message = "Search done successfully", Result = session }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult SessionSearchByDate(string date)
        {
            try
            {
                string[] parsedDate = date.Split(new char[] { ':' });
                WebinarDateTime dateTime = new WebinarDateTime();
                dateTime.Year = int.Parse(parsedDate[0]);
                dateTime.Month = int.Parse(parsedDate[1]);
                dateTime.Day = int.Parse(parsedDate[2]);
                //var dates = (from p in m_model.WebinarDateTimes where (p.Year == dateTime.Year) && (p.Month == dateTime.Month) && (p.Day == dateTime.Day)
                //            select p).ToList();

                List<Session> result = new List<Session>();
                foreach (var x in m_model.Sessions)
                {
                    UtilityController controller = new UtilityController();
                    if (controller.CompareDate(x.WebinarDateTime, dateTime))
                    {
                        result.Add(x);
                    }
                }
                return Json(new { Status = true, Message = "Search done successfully", Result = result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        private string UserPeymentSession(int sessionID)
        {
            try
            {
                return m_model.WebinarPeyments.Single(P => P.WebinarID.Equals(sessionID)).PostPeymentFee;
            }
            catch (Exception ex)
            {
                return "-1";
            }
        }

        [HttpGet]
        public ActionResult AllSearchSession(int index, int pageSize)
        {
            // m_logger.Log("SearchUsercp0");
            try
            {
                if (index < 0)
                {
                    index = 1;
                }
                Hashtable hashtable = new Hashtable();

                var justForCapacity = (from p in m_model.Sessions
                                       where p.SessionType == 1 && p.StateId == 1
                                       select new
                                           {
                                               id = p.SessionId,
                                               capacity = p.Capacity
                                           });


                foreach (var x in justForCapacity)
                {
                    hashtable[x.id] = x.capacity - SpaceLeft(x.id);
                }

                var baseSearch = (from p in m_model.Sessions
                                  where p.SessionType == 1 && p.StateId == 1
                                  select new
                                  {
                                      id = p.SessionId,
                                      name = p.SessionName,
                                      //presentorUserName = p.aspnet_User.UserName,
                                      presentorUserName = p.aspnet_User.Profile != null ? p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName : p.aspnet_User.UserName,
                                      //adminUserName = p.aspnet_User1.UserName,
                                      adminUserName = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                      remained = hashtable[p.SessionId],
                                      admin = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                      beginTime = DateToString(p.WebinarDateTime),
                                      duration = p.WebinarDateTime1.Time.Value.Hours - p.WebinarDateTime.Time.Value.Hours,
                                      status = p.SessionState.State,
                                      fee = UserPeymentSession(p.SessionId),
                                      poster = p.Wallpaper,
                                      presentor = p.aspnet_User.UserName,
                                      desc = p.Description
                                  }).OrderByDescending(p => p.id).ToList();

                var searchResult = baseSearch.Skip((index - 1) * pageSize).Take(pageSize);

                int count = baseSearch.Count;

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


        [HttpGet]
        public ActionResult AllNewSearchSession(int index, int pageSize)
        {
            // m_logger.Log("SearchUsercp0");
            try
            {
                if (index < 0)
                {
                    index = 1;
                }
                Hashtable hashtable = new Hashtable();

                var justForCapacity = (from p in m_model.Sessions
                                       where p.SessionType == 1 && (p.StateId != 3 || p.StateId == 2)
                                       //(p.WebinarDateTime.Year.ToString() + (p.WebinarDateTime.Month.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Month.ToString()) : p.WebinarDateTime.Month.ToString()) + (p.WebinarDateTime.Day.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Day.ToString()) : p.WebinarDateTime.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) >= 0 &&
                                       //p.WebinarDateTime.id == p.BeginTime
                                       select new
                                       {
                                           id = p.SessionId,
                                           capacity = p.Capacity,
                                           //bTime = p.BeginTime ,
                                           //eTime = p.EndTime, 
                                           //year = p.WebinarDateTime.Year,
                                           //month = p.WebinarDateTime.Month,
                                           //day = p.WebinarDateTime.Day

                                       });


                //foreach (var itm in justForCapacity)
                //{
                //    if (!((itm.year.ToString() + Tools.TwoDigitString(itm.month.ToString()) + Tools.TwoDigitString(itm.day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) >= 0))
                //    {
                //        justForCapacity.Remove(itm);
                //    }
                //}

                foreach (var x in justForCapacity)
                {
                    hashtable[x.id] = x.capacity - SpaceLeft(x.id);
                }

                int curMonth = 1;
                int curday = 2;


                var baseSearch = (from p in m_model.Sessions
                                  where p.SessionType == 1 && (p.StateId == 2 || p.StateId != 3)
                                  //(p.WebinarDateTime.Year.ToString() + (p.WebinarDateTime.Month.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Month.ToString()) : p.WebinarDateTime.Month.ToString()) + (p.WebinarDateTime.Day.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Day.ToString()) : p.WebinarDateTime.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) >= 0 &&
                                  //p.WebinarDateTime.id == p.BeginTime
                                  //join w in m_model.WebinarDateTimes.Where(wdt => (wdt.Year.ToString() + (string)Tools.TwoDigitString(wdt.Month.ToString()) + (string)Tools.TwoDigitString(wdt.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) >= 0)
                                  //on p.BeginTime equals w.id
                                  //where p.SessionType == 1 //&& p.StateId == 2
                                  select new
                                  {
                                      id = p.SessionId,
                                      name = p.SessionName,
                                      //presentorUserName = p.aspnet_User.UserName,
                                      presentorUserName = p.aspnet_User.Profile != null ? p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName : p.aspnet_User.UserName,
                                      //adminUserName = p.aspnet_User1.UserName,
                                      adminUserName = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                      remained = hashtable[p.SessionId],
                                      admin = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                      beginTime = DateToString(p.WebinarDateTime),
                                      duration = p.WebinarDateTime1.Time.Value.Hours - p.WebinarDateTime.Time.Value.Hours,
                                      status = p.SessionState.State,
                                      fee = UserPeymentSession(p.SessionId),
                                      poster = p.Wallpaper,
                                      presentor = p.aspnet_User.UserName,
                                      desc = p.Description,
                                      //year = p.WebinarDateTime.Year,
                                      //month = p.WebinarDateTime.Month,
                                      //day = p.WebinarDateTime.Day
                                  }).OrderByDescending(p => p.id).ToList();

                //foreach (var itm in baseSearch)
                //{
                //    if (!((itm.year.ToString() + Tools.TwoDigitString(itm.month.ToString()) + Tools.TwoDigitString(itm.day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) >= 0))
                //    {
                //        baseSearch.Remove(itm);
                //    }
                //}

                var searchResult = baseSearch.Skip((index - 1) * pageSize).Take(pageSize);

                int count = baseSearch.Count;

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

        [HttpGet]
        public ActionResult AllLastSearchSession(int index, int pageSize)
        {
            // m_logger.Log("SearchUsercp0");
            try
            {
                if (index < 0)
                {
                    index = 1;
                }
                Hashtable hashtable = new Hashtable();


                var justForCapacity = (from p in m_model.Sessions
                                       where p.SessionType == 1 && p.StateId == 3
                                       //(p.WebinarDateTime.Year.ToString() + (p.WebinarDateTime.Month.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Month.ToString()) : p.WebinarDateTime.Month.ToString()) + (p.WebinarDateTime.Day.ToString().ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Day.ToString()) : p.WebinarDateTime.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0 &&
                                       //p.EndTime == p.WebinarDateTime.id
                                       //join w in m_model.WebinarDateTimes.Where(wdt => (wdt.Year.ToString() + (string)Tools.TwoDigitString(wdt.Month.ToString()) + (string)Tools.TwoDigitString(wdt.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0)
                                       //on p.EndTime equals w.id
                                       //where p.SessionType == 1 //&& p.StateId == 3
                                       select new
                                       {
                                           id = p.SessionId,
                                           capacity = p.Capacity,
                                           //year = p.WebinarDateTime.Year,
                                           //month = p.WebinarDateTime.Month,
                                           //day = p.WebinarDateTime.Day
                                       });

                //foreach (var itm in justForCapacity)
                //{
                //    if (!((itm.year.ToString() + Tools.TwoDigitString(itm.month.ToString()) + Tools.TwoDigitString(itm.day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0))
                //    {
                //        justForCapacity.Remove(itm);
                //    }
                //}

                foreach (var x in justForCapacity)
                {
                    hashtable[x.id] = x.capacity - SpaceLeft(x.id);
                }

                var baseSearch = (from p in m_model.Sessions
                                  where p.SessionType == 1 && p.StateId == 3
                                  //(p.WebinarDateTime.Year.ToString() + (p.WebinarDateTime.Month.ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Month.ToString()) : p.WebinarDateTime.Month.ToString()) + (p.WebinarDateTime.Day.ToString().ToString().Length < 2 ? string.Format("0{0}", p.WebinarDateTime.Day.ToString()) : p.WebinarDateTime.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0 &&
                                  //p.EndTime == p.WebinarDateTime.id
                                  //join w in m_model.WebinarDateTimes.Where(wdt => (wdt.Year.ToString() + (string)Tools.TwoDigitString(wdt.Month.ToString()) + (string)Tools.TwoDigitString(wdt.Day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0)
                                  //on p.EndTime equals w.id
                                  //where p.SessionType == 1 //&& p.StateId == 3
                                  select new
                                  {
                                      id = p.SessionId,
                                      name = p.SessionName,
                                      //presentorUserName = p.aspnet_User.UserName,
                                      presentorUserName = p.aspnet_User.Profile != null ? p.aspnet_User.Profile.FirstName + " " + p.aspnet_User.Profile.LastName : p.aspnet_User.UserName,
                                      //adminUserName = p.aspnet_User1.UserName,
                                      adminUserName = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User1.Profile.LastName,
                                      remained = hashtable[p.SessionId],
                                      admin = p.aspnet_User1.Profile.FirstName + " " + p.aspnet_User.Profile.LastName,
                                      beginTime = DateToString(p.WebinarDateTime),
                                      duration = p.WebinarDateTime1.Time.Value.Hours - p.WebinarDateTime.Time.Value.Hours,
                                      status = p.SessionState.State,
                                      fee = UserPeymentSession(p.SessionId),
                                      poster = p.Wallpaper,
                                      presentor = p.aspnet_User.UserName,
                                      desc = p.Description
                                      //year = p.WebinarDateTime.Year ,
                                      //month = p.WebinarDateTime.Month ,
                                      //day = p.WebinarDateTime.Day
                                  }).OrderByDescending(p => p.id).ToList();

                //foreach (var itm in baseSearch)
                //{
                //    if (!((itm.year.ToString() + Tools.TwoDigitString(itm.month.ToString()) + Tools.TwoDigitString(itm.day.ToString())).CompareTo(Tools.JalaliNowDate("without/")) < 0 ))
                //    {
                //        baseSearch.Remove(itm);
                //    }
                //}

                var searchResult = baseSearch.Skip((index - 1) * pageSize).Take(pageSize);

                int count = baseSearch.Count;

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

        #endregion

        #region Chat Section
        [HttpGet]
        public ActionResult SendMessage(int sessionId, string message, string userName)
        {
            try
            {
                var user = m_model.aspnet_Users.Single(p => p.UserName.ToLower() == userName.ToLower());
                Chat chat = new Chat();
                chat.SenderId = user.UserId;
                chat.SessionId = sessionId;
                chat.Message = message;
                chat.Time = DateTime.Now;

                var x = m_model.Sessions.Count(P => P.SessionId == sessionId);
                if (x > 0)
                {
                    var s = m_model.Sessions.Single(P => P.SessionId == sessionId);
                    if (userName.ToLower() == s.aspnet_User.UserName.ToLower() || userName.ToLower() == s.aspnet_User1.UserName.ToLower())
                    {
                        chat.QuestionStatus = 2;
                    }
                    else
                    {
                        chat.QuestionStatus = 1;
                    }
                }
                else
                {
                    chat.QuestionStatus = 1;
                }
                m_model.Chats.InsertOnSubmit(chat);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Question Submitted to DataBase Successfully" }, JsonRequestBehavior.AllowGet);

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult AcceptQuestion(int questionID, string userName)
        {
            try
            {
                var question = m_model.Chats.Single(P => P.ChatId == questionID);
                if (userName.ToLower() == question.Session.aspnet_User.UserName.ToLower() || userName.ToLower() == question.Session.aspnet_User1.UserName.ToLower())
                {
                    question.QuestionStatus = 2;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Question Accepted" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Access Denied." }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult RejectQuestion(int questionID, string userName)
        {
            try
            {
                var question = m_model.Chats.Single(P => P.ChatId == questionID);
                if (userName.ToLower() == question.Session.aspnet_User.UserName.ToLower() ||
                    userName.ToLower() == question.Session.aspnet_User1.UserName.ToLower())
                {
                    question.QuestionStatus = 3;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Question Rejected" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Access Denied." }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult RecieveMessage(int sessionId, int chatId)
        {
            try
            {
                List<int> questionStatus = new List<int>();
                var x = m_model.Sessions.Count(P => P.SessionId == sessionId);
                if (x > 0)
                {
                    var s = m_model.Sessions.Single(P => P.SessionId == sessionId);
                    if (User.Identity.Name.ToLower() == s.aspnet_User.UserName.ToLower() ||
                        User.Identity.Name.ToLower() == s.aspnet_User1.UserName.ToLower())
                    {
                        questionStatus.Add(1);
                        questionStatus.Add(2);
                        questionStatus.Add(3);
                    }
                    else
                    {
                        //TODO : Should be Correct
                        questionStatus.Add(1);
                        //questionStatus.Add(2);
                        //questionStatus.Add(3);
                    }
                    var chat = (from p in m_model.Chats
                                where p.SessionId == sessionId && p.ChatId > chatId && questionStatus.Contains((int)p.QuestionStatus)
                                select new
                                {
                                    time = p.Time,
                                    userFirstName = p.aspnet_User.Profile.FirstName,
                                    userLastName = p.aspnet_User.Profile.LastName,
                                    userName = p.aspnet_User.UserName,
                                    message = p.Message,
                                    id = p.ChatId,
                                    status = p.QuestionStatus
                                }).Take(10).ToList();
                    return Json(new { Status = true, Message = "List of Ten new Messages Sent", Result = chat }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Session ID Is Incorrect" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        #region File Section



        //  [Authorize]
        [HttpPost]
        public ContentResult UploadFiles(int sessionId)
        {
            try
            {

                var session = (from p in m_model.Sessions where p.SessionId == sessionId select p).ToList()[0];

                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];

                //   return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + admin.UserName + "\"}", "application/json");

                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    // m_logger.Log("We recieved here and start!");
                    long size = 0;
                    string directoryPath = Server.MapPath(string.Format("~/Seminars/{0}", sessionId));
                    if (!System.IO.Directory.Exists(directoryPath))
                    {
                        //    m_logger.Log("we didn't find that directory");
                        System.IO.Directory.CreateDirectory(directoryPath);
                        //   m_logger.Log("Directory Created");

                    }
                    else
                    {
                        var x = Directory.GetFiles(directoryPath);

                        foreach (var z in x)
                        {
                            FileInfo info = new FileInfo(z);
                            size += info.Length;
                        }
                    }
                    int fixedSize = 1024 * 1024 * 100;

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

                            //  m_logger.Log("string directoryPath Created");

                            string savedFileName = Path.Combine(directoryPath, Path.GetFileName(hpf.FileName));

                            hpf.SaveAs(savedFileName); // Save the file
                            //    m_logger.Log("File Saved");


                            SessionFile sf = new SessionFile();
                            sf.FileURL = string.Format("~/Seminars/{0}/{1}", sessionId, hpf.FileName);
                            sf.SessionId = sessionId;
                            sf.FileSize = hpf.ContentLength;
                            //   m_logger.Log("Data Base Created has not submitted yet");
                            m_model.SessionFiles.InsertOnSubmit(sf);
                            m_model.SubmitChanges();
                            //    m_logger.Log("Submitted");
                            r.Add(new ViewDataUploadFilesResult()
                            {
                                Name = hpf.FileName,
                                Length = hpf.ContentLength,
                                Type = hpf.ContentType,
                                Id = sf.SessionFileId
                            });
                        }
                        // Returns json
                        //   m_logger.Log("Ready to return");
                        return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
                        //return Content("{\"name\":\"" + r[0].Name + "\",\"type\":\"" + r[0].Type + "\",\"size\":\"" + string.Format("{0} bytes", r[0].Length) + "\"}", "application/json");
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
                //      m_logger.Log("We couldn't do anything");
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }

        [HttpPost]
        public ContentResult UploadFiles2()
        {
            var r = new List<ViewDataUploadFilesResult>();

            foreach (string file in Request.Files)
            {
                HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                if (hpf.ContentLength == 0)
                    continue;

                string savedFileName = Path.Combine(Server.MapPath("~/Seminars/Test4MB"), Path.GetFileName(hpf.FileName));
                hpf.SaveAs(savedFileName); // Save the file

                r.Add(new ViewDataUploadFilesResult()
                {
                    Name = hpf.FileName,
                    Length = hpf.ContentLength,
                    Type = hpf.ContentType
                });
            }
            // Returns json
            return Content("{\"name\":\"" + r[0].Name + "\",\"type\":\"" + r[0].Type + "\",\"size\":\"" + string.Format("{0} bytes", r[0].Length) + "\"}", "application/json");
        }

        [Authorize]
        [HttpGet]
        public ActionResult DeleteFile(int fileId)
        {
            try
            {
                var file = m_model.SessionFiles.Single(p => p.SessionFileId == fileId);
                var session = (from p in m_model.Sessions where p.SessionId == file.SessionId select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    string path = Server.MapPath(file.FileURL);
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                    m_model.SessionFiles.DeleteOnSubmit(file);
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
        [HttpGet]
        public ActionResult GetContentInfo(int sessionId)
        {
            try
            {
                long fixedSize = 1024 * 1024 * 100;
                string directoryPath = Server.MapPath(string.Format("~/Seminars/{0}", sessionId));
                long size = 0;
                if (System.IO.Directory.Exists(directoryPath))
                {
                    var x = Directory.GetFiles(directoryPath);

                    foreach (var z in x)
                    {
                        FileInfo info = new FileInfo(z);
                        size += info.Length;
                    }
                }

                var Result = new { capacity = fixedSize, usedSize = size, remained = fixedSize - size };
                return Json(new { Status = true, Message = "The file information is sent.", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ShowFiles(int sessionId, int fileId)
        {
            try
            {

                var files = (from p in m_model.SessionFiles
                             where p.SessionId == sessionId && p.SessionFileId > fileId
                             select new
                             {
                                 // fileName = p.FileURL.Split(new char[] { '/' })[p.FileURL.Split(new char[] { '/' }).Length-1],
                                 fileUrl = p.FileURL,
                                 fileId = p.SessionFileId,
                                 fileSize = p.FileSize
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
        public ActionResult SetAsSessionContent(int fileId, int SessionId)
        {
            try
            {
                var fileCount = m_model.SessionFiles.Count(P => P.SessionFileId == fileId);
                if (fileCount < 0)
                    throw new Exception("File with specific ID does not exist");
                var file = m_model.SessionFiles.Single(p => p.SessionFileId == fileId);
                var session = (from p in m_model.Sessions where p.SessionId == file.SessionId select p).ToList()[0];
                var admin = (from p in m_model.aspnet_Users where p.UserId == session.SessionAdmin select p).ToList()[0];
                var presentor = (from p in m_model.aspnet_Users where p.UserId == session.PresentorId select p).ToList()[0];
                if (User.Identity.Name.ToLower() == presentor.UserName.ToLower() || User.Identity.Name.ToLower() == admin.UserName.ToLower())
                {
                    string path = Server.MapPath(file.FileURL);
                    FileInfo fileInfo = new FileInfo(path);
                    if (fileInfo.Extension.ToLower() == ".ppt" || fileInfo.Extension.ToLower() == ".pptx")
                    {

                        string destination = Server.MapPath(string.Format("~/Seminars/{0}/PowerPoint", session.SessionId));

                        session.PrimaryContentID = fileId;
                        m_model.SubmitChanges();

                        //We Add COnetent Service if there is not any content service for this session
                        /*  var isExistContentService = m_model.SessionServices.Count(P => P.SessionId == SessionId & P.ServiceTypeId == 2);
                          if (isExistContentService <= 0)
                          {
                              SessionService contentSessionService = new SessionService();
                              contentSessionService.SessionId = SessionId;
                              contentSessionService.ServiceTypeId = 2;
                              contentSessionService.ServerIP = "94.232.174.204";
                              m_model.SessionServices.InsertOnSubmit(contentSessionService);
                              m_model.SubmitChanges();
                          }*/

                        Webinar.Utility.FileUtility.ConvertPowerPointToImage(path, destination);
                        return Json(new { Status = true, Message = "Set As Seminar Presentation Successfully" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        throw new Exception("File Format is not proper for session slide:" + fileInfo.Extension);
                    }

                }
                else
                {
                    return Json(new { Status = false, Message = "You don't have permission to select seminar slide" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult GetCurrentContent(int seminarId)
        {
            try
            {
                var session = (from p in m_model.Sessions where p.SessionId == seminarId select p).ToList()[0];
                var Result = -1;
                if (session.PrimaryContentID != null)
                    Result = (int)session.PrimaryContentID;
                return Json(new { Status = true, Message = "Get Current Session Content ID Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult GetNumberOfSessionSlides(int seminarId)
        {
            try
            {
                var session = (from p in m_model.Sessions where p.SessionId == seminarId select p).ToList()[0];
                var Result = -1;
                if (session.PrimaryContentID != null)
                {
                    Result = (int)session.PrimaryContentID;
                    Result = System.IO.Directory.GetFiles(Server.MapPath("~/Seminars/" + seminarId + "/PowerPoint")).Length;
                    Result = (int)(Result / 2.0);
                }
                return Json(new { Status = true, Message = "Get Current Session Content ID Successfully", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }




        #endregion

        #region Messaging Secion


        #endregion

        #region Seminar

        [Authorize]
        [HttpGet]
        public ActionResult SetSessionStatus(string status, int sessionId)
        {
            try
            {
                var session = m_model.Sessions.Single(p => p.SessionId == sessionId);
                if (User.IsInRole("AdminRole") || User.Identity.Name.ToLower() == session.aspnet_User.UserName.ToLower() || User.Identity.Name.ToLower() == session.aspnet_User1.UserName.ToLower())
                {
                    var stateId = (from p in m_model.SessionStates where p.State == status select p).ToList();
                    if (stateId.Count > 0)
                    {
                        session.StateId = stateId[0].StateId;
                    }
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "State changed Successfully" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "You don't have permission to change status of seminar" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult SetUserInSession(string userName, int sessionId)
        {
            try
            {
                var user = m_model.aspnet_Users.Single(p => p.UserName == userName);
                UserInSession uis = new UserInSession();
                uis.SessionId = sessionId;
                uis.UserId = user.UserId;
                m_model.UserInSessions.InsertOnSubmit(uis);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "User Set to User In Sessions" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        #endregion

        #region TestSuite
        [HttpGet]
        public ActionResult LogInToTestSuite(string userName, string pass)
        {
            try
            {
                var x = m_model.SessionRequests.Count(P => P.RequestEmail.ToLower().Equals(userName));
                if (x > 0)
                {
                    SessionRequest req = m_model.SessionRequests.Single(P => P.RequestEmail.ToLower().Equals(userName));
                    TemporalTestsAccount tmp = m_model.TemporalTestsAccounts.Single(P => P.RequestID == req.RequestId);
                    if (tmp.Password != pass)
                    {
                        return Json(new { Status = false, Message = "Wrong Password" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { Status = true, URL = "http://94.232.174.204:8800/", Message = "OK" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "Does Not Exist" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult SubmitTestSuiteSuggestion(string userName, string pass, string bandwidth, string browser, string hasVideo, string codec, string suggestion)
        {
            try
            {
                var x = m_model.SessionRequests.Count(P => P.RequestEmail.ToLower().Equals(userName));
                if (x > 0)
                {
                    SessionRequest req = m_model.SessionRequests.Single(P => P.RequestEmail.ToLower().Equals(userName));
                    TemporalTestsAccount tmp = m_model.TemporalTestsAccounts.Single(P => P.RequestID == req.RequestId);
                    if (tmp.Password != pass)
                    {
                        return Json(new { Status = false, Message = "Wrong Password" }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        TestSuiteResult testResult = new TestSuiteResult();
                        testResult.Bandwidth = bandwidth;
                        testResult.Browser = browser;
                        testResult.DateTime = DateTime.Now;
                        testResult.Codec = codec;
                        testResult.TestAccountID = tmp.ID;
                        testResult.Suggestion = suggestion;
                        testResult.HasVideo = hasVideo;
                        m_model.TestSuiteResults.InsertOnSubmit(testResult);
                        m_model.SubmitChanges();
                        return Json(new { Status = true, Message = "OK" }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Json(new { Status = false, Message = "Does Not Exist" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpGet]
        public ActionResult RequestForParticipateInTest(int sessionId, string email)
        {
            //TODO : Check That Validity Of Service Input Arguments
            try
            {
                var exist = m_model.SessionRequests.Count(P => P.SessionId == sessionId && P.RequestEmail.ToLower().Equals(email));
                if (exist > 0)
                {
                    string msg = "Request With This Email Address Already Exist For This Seminar.";
                    return Json(new { Status = false, Message = msg }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    SessionRequest newRequest = new SessionRequest();
                    //Calculate Shamsi Date
                    var requestCurrentDate = new System.Globalization.PersianCalendar();
                    WebinarDateTime requestDateTime = new WebinarDateTime();
                    requestDateTime.Year = requestCurrentDate.GetYear(DateTime.Now);
                    requestDateTime.Month = requestCurrentDate.GetMonth(DateTime.Now);
                    requestDateTime.Day = requestCurrentDate.GetDayOfMonth(DateTime.Now);
                    m_model.WebinarDateTimes.InsertOnSubmit(requestDateTime);
                    m_model.SubmitChanges();
                    //End Of Calculate Current Shamsi Date
                    newRequest.RequestDate = requestDateTime.id;
                    newRequest.RequestEmail = email;
                    newRequest.SessionId = sessionId;
                    newRequest.Result = "Not Seen";
                    m_model.SessionRequests.InsertOnSubmit(newRequest);
                    m_model.SubmitChanges();
                    string msg = "Request Submitted Successfully";

                    int followCode = newRequest.RequestId;
                    string generatedPAss = Webinar.Utility.Tools.RandomString(24);// System.Web.Security.Membership.GeneratePassword(24, 5);
                    TemporalTestsAccount acc = new TemporalTestsAccount();
                    acc.RequestID = followCode;
                    acc.Password = generatedPAss;
                    acc.IsEnabled = true;
                    m_model.TemporalTestsAccounts.InsertOnSubmit(acc);
                    m_model.SubmitChanges();


                    var Result = new
                    {
                        followUpCode = followCode,
                    };
                    //  new System.Threading.Thread(new System.Threading.ThreadStart(() => {
                    EmailService emailService = new EmailService();
                    string finalMsg = "";
                    string header = "<p style='direction:rtl;'><strong style='font-family:Tahoma;'> با عرض سلام </string></p><br/>";
                    string primary = string.Format("درخواست شما بررسی شده و نتیجه آن به شما اعلام می گردد .  در خواست شما برای شرکت در سمینار ثبت گردید. شماره پیگیر شما {0} است", followCode);
                    primary += " نام کاربری شما : " + email + " و کلمه عبور شما    " + generatedPAss;
                    primary += " برای ورود به آدرس " + Webinar.Utility.StaticParams.m_serverAddress + " مراجعه کنید. ";
                    string body = "<p style='direction:rtl;font-family:Tahoma;'>" + primary + "</p><br/>";
                    string footer = "<p style='direction:rtl;'><strong style='font-family:Tahoma;'> تشکر از شما </string></p><br/>جامآ";
                    finalMsg = header + body + footer;
                    emailService.SendMail(email, "درخواست برای سمینار", primary);
                    //  })).Start();
                    return Json(new { Status = true, Message = msg, Result }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion

        #region Session Peyment
        [Authorize]
        [HttpGet]
        public ActionResult PayForSeminar(int sessionId, int requestID)
        {
            try
            {

                int existRequest = m_model.SessionRequests.Count(P => P.RequestId.Equals(requestID));
                if (existRequest <= 0)
                {
                    return ReturnError("There is no request with this id");
                }
                var request = m_model.SessionRequests.Single(P => P.RequestId.Equals(requestID));
                int existSession = m_model.Sessions.Count(p => p.SessionId == sessionId);
                if (existSession <= 0)
                {
                    return ReturnError("There is no session with this id");
                }
                int count = SpaceLeft(sessionId);
                var session = m_model.Sessions.Single(p => p.SessionId == sessionId);
                if (count >= session.Capacity)
                {
                    return ReturnError("The Seminar is full and has no free space");
                }

                var seminarFee = UserPeymentSession(sessionId);
                if (seminarFee == "-1")
                {
                    return ReturnError("This seminar is free for use.");
                }
                string userName = User.Identity.Name.ToLower();
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                var isFilledProfile = m_model.Profiles.Count(P => P.UserId.Equals(user.UserId));
                if (isFilledProfile <= 0)
                {
                    return ReturnError("There is no profile for this user.");
                }
                else
                {
                    Profile profile = m_model.Profiles.Single(P => P.UserId.Equals(user.UserId));
                    if (profile.Balance == null || profile.Balance < int.Parse(seminarFee) * 10)
                    {
                        return ReturnError("Your balance is not sufficient for make payment.");
                    }
                    else
                    {
                        var before = profile.Balance;
                        profile.Balance -= (int.Parse(seminarFee) * 10);
                        request.IsPayed = true;
                        m_model.SubmitChanges();
                        var Result = new { Balance = profile.Balance, LastBalance = before, Fee = (int.Parse(seminarFee) * 10).ToString() };
                        return Json(new { Status = true, Message = "پرداخت انجام شد", Result }, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion


        #region News Image Upload
        [Authorize]
        [HttpPost]
        public ContentResult UploadNewsImage()
        {
            try
            {
                var r = new List<ViewDataUploadFilesResult>();
                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    Temp temp = new Temp();
                    temp.TempName = "News";
                    m_model.Temps.InsertOnSubmit(temp);
                    m_model.SubmitChanges();

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                    string savedFileName = Path.Combine(Server.MapPath("~/News/Images/"), temp.TempID.ToString());
                    //bmp.Save(savedFileName + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);

                    temp.TemoValue = "News/Images/" + temp.TempID.ToString() + ".jpg";
                    m_model.SubmitChanges();

                    double aspectRatio = 320.0 / (double)bmp.Width;

                    int width = (int)(320);
                    int height = (int)((double)bmp.Height * aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedFileName + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = temp.TemoValue,
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType,
                        Id = temp.TempID
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
        #region Session Poster Upload
        [Authorize]
        [HttpPost]
        public ContentResult UploadWebinarPoster()
        {
            try
            {
                var r = new List<ViewDataUploadFilesResult>();
                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    Temp temp = new Temp();
                    temp.TempName = "Poster";
                    m_model.Temps.InsertOnSubmit(temp);
                    m_model.SubmitChanges();

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                    string savedFileName = Path.Combine(Server.MapPath("~/Seminars/Posters/"), temp.TempID.ToString());
                    //bmp.Save(savedFileName + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);

                    temp.TemoValue = "Seminars/Posters/" + temp.TempID.ToString() + ".jpg";
                    m_model.SubmitChanges();

                    double aspectRatio = 320.0 / (double)bmp.Width;

                    int width = (int)(320);
                    int height = (int)((double)bmp.Height * aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedFileName + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = temp.TemoValue,
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType,
                        Id = temp.TempID
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

        [Authorize]
        [HttpPost]
        public ContentResult EditWebinarPoster(int sessionId)
        {
            try
            {
                var r = new List<ViewDataUploadFilesResult>();
                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    Temp temp = new Temp();
                    temp.TempName = "Poster";
                    m_model.Temps.InsertOnSubmit(temp);
                    m_model.SubmitChanges();

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                    string savedFileName = Path.Combine(Server.MapPath("~/Seminars/Posters/"), temp.TempID.ToString());

                    ImageFormat format;
                    string extension = "";
                    switch (hpf.ContentType)
                    {
                        case "image/png":
                            format = ImageFormat.Png;
                            extension = ".png";
                            break;
                        case "image/gif":
                            format = ImageFormat.Gif;
                            extension = ".gif";
                            break;
                        default:
                            format = ImageFormat.Jpeg;
                            extension = ".jpeg";
                            break;
                    }

                    // bmp.Save(savedFileName + extension, format);

                    temp.TemoValue = "Seminars/Posters/" + temp.TempID.ToString() + extension;
                    m_model.SubmitChanges();

                    double aspectRatio = 320.0 / (double)bmp.Width;

                    int width = (int)(320);
                    int height = (int)((double)bmp.Height * aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedFileName + extension, format);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    m_model.Sessions.Single(P => P.SessionId.Equals(sessionId)).Wallpaper = temp.TemoValue;
                    m_model.SubmitChanges();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = temp.TemoValue,
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType,
                        Id = temp.TempID
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


        //TODO : security is very low - high risk
        //Todod : Check if user requested or invited ? and is payed mony ? 
        [Authorize]
        [HttpGet]
        public ActionResult IAmHere(int sessionId)
        {
            try
            {
                string userName = User.Identity.Name.ToLower();
                var isExistSession = m_model.Sessions.Count(P => P.SessionId.Equals(sessionId));
                if (isExistSession > 0)
                {
                    bool isOnline = m_model.Sessions.Single(P => P.SessionId.Equals(sessionId)).StateId != 3;
                    if (isOnline)
                    {
                        var isExistUser = m_model.aspnet_Users.Count(P => P.UserName.ToLower().Equals(userName));
                        if (isExistUser > 0)
                        {
                            aspnet_User aspUser = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                            var isEnterBefore = m_model.UserInSessions.Count(P => P.UserId.Equals(aspUser.UserId) && P.SessionId.Equals(sessionId));
                            if (isEnterBefore > 0)
                            {
                                var record = m_model.UserInSessions.Single(P => P.UserId.Equals(aspUser.UserId) && P.SessionId.Equals(sessionId));
                                record.ExitTime = DateTime.Now;
                                m_model.SubmitChanges();
                            }
                            else
                            {
                                UserInSession newRecord = new UserInSession();
                                newRecord.SessionId = sessionId;
                                newRecord.UserId = aspUser.UserId;
                                newRecord.EntranceTime = DateTime.Now;
                                newRecord.ExitTime = newRecord.EntranceTime;
                                m_model.UserInSessions.InsertOnSubmit(newRecord);
                                m_model.SubmitChanges();
                            }
                            return Json(new { Status = true, Message = "ثبت شد" }, JsonRequestBehavior.AllowGet);
                        }
                        else
                        {
                            return ReturnError("This User does not exist");
                        }
                    }
                    else
                    {
                        return ReturnError("Session Is Off-line");
                    }
                }
                else
                {
                    return ReturnError("This Session Doesnot exist");
                }
            }
            catch (Exception ex)
            {
                return ReturnError(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult DeleteUser(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName));
                    var membership = m_model.aspnet_Memberships.Single(P => P.UserId.Equals(user.UserId));
                    if (m_model.Profiles.Count(P => P.UserId.Equals(user.UserId)) > 0)
                    {
                        var profile = m_model.Profiles.Single(P => P.UserId.Equals(user.UserId));
                        m_model.Profiles.DeleteOnSubmit(profile);
                    }
                    if (m_model.Confirms.Count(P => P.UserId.Equals(user.UserId)) > 0)
                    {
                        try
                        {
                            var confirm = m_model.Confirms.Where(P => P.UserId.Equals(user.UserId));
                            m_model.Confirms.DeleteAllOnSubmit(confirm);
                        }
                        catch (Exception ex)
                        {
                        }
                    }
                    var roles = m_model.aspnet_UsersInRoles.Where(P => P.UserId.Equals(user.UserId));
                    var sessions = m_model.Sessions.Where(P => P.SessionAdmin.Equals(user.UserId) || P.PresentorId.Equals(user.UserId));
                    foreach (var x in sessions)
                        DeleteSeminar(x.SessionId);
                    var requests = m_model.SessionRequests.Where(P => P.UserId.Equals(user.UserId));
                    m_model.SessionRequests.DeleteAllOnSubmit(requests);
                    m_model.SubmitChanges();
                    Membership.DeleteUser(userName);
                    return Json(new { Status = true, Message = "Delete User Successfully" }, JsonRequestBehavior.AllowGet);
                }
                return Json(new { Status = false, Message = "User Does not exist" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
    }

}
