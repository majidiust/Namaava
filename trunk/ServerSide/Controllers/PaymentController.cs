using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Webinar.Models;
using Webinar.Utility;
using System.Security.Cryptography;
using System.Text;
using System.Net;

namespace Webinar.Controllers
{
    public class PaymentController : Controller
    {
        private DataBaseDataContext m_model = new DataBaseDataContext();
        private BankDataBaseDataContext m_bankDb = new BankDataBaseDataContext();
        //
        // GET: /Payment/

        [Authorize]
        [HttpGet]
        public ActionResult PaymentRequest(string price, int bankId, string timeStamp)
        {
            try
            {
                
                #region TODO : Fetch Bank Info
                #endregion
                #region Fetch User Info
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                
                #endregion
                #region calc payment
                
                int fee = int.Parse(price);
                #endregion
               
                
                #region DataBase Fields
                Payment payment = new Payment();

                payment.UserId = user.UserId;
                payment.Amount = price;
                payment.BankId = 2;
                payment.TimeStamp = timeStamp;
                payment.Date = DateTime.Now;
                payment.ApplicationCode = user.ApplicationId;
                m_bankDb.Payments.InsertOnSubmit(payment);
                m_bankDb.SubmitChanges();
                var Result = new
                {
                    PaymentID = payment.PaymentId,
                    Ammount = fee
                };
                #endregion
                return Json(new { Status = true, Message = "Payment Set to DataBase", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GetResponse(FormCollection post)
        {
            try
            {
                #region Create BankResultObject
                var bankResult = new
                {
                    Status = true,
                    transActionID = post["x_trans_id"],
                    responseCode = post["x_response_code"],
                    reasonCode = post["x_response_reason_code"],
                    reasonText = post["x_response_reason_text"],
                    login = post["x_login"],
                    sequence = post["x_fp_sequence"],
                    timestamp = post["x_fp_timestamp"],
                    amount = post["x_amount"],
                    currency = post["x_currency_code"],
                    hashCode = post["x_fp_hash"]
                };
                #endregion

                #region Refetch PaymentInfo
                var paymentCount = m_bankDb.Payments.Count(P => P.PaymentId == int.Parse(bankResult.sequence));
                Application application = null;
                Payment payment = null;
                if (paymentCount > 0)
                {
                    //    application = m_bank.Payments.Single(P=>P.PaymentId == int.Parse(bankResult.sequence)).Application;
                    payment = m_bankDb.Payments.Single(P => P.PaymentId == int.Parse(bankResult.sequence));
                }
                #endregion
                #region Insert To BankResult
                BankResponse response = new BankResponse();
                response.Amount = payment.Amount;
                response.CurrencyCode = "Rial";
                response.FpSequence = bankResult.sequence;
                response.MerchantId = payment.BankInfo.MerchantId;
                response.Payment = payment;
                response.ResponseReasonCode = bankResult.reasonCode == "" ? -1 : int.Parse(bankResult.reasonCode);
                response.ResponseReasonText = bankResult.reasonText;
                response.SignatureHash = bankResult.hashCode;
                response.TimeStamp = bankResult.timestamp;
                response.TransId = bankResult.transActionID;
                response.ResponseCode = int.Parse(bankResult.responseCode);
                m_bankDb.BankResponses.InsertOnSubmit(response);
                m_bankDb.SubmitChanges();
                #endregion
                #region Create Post Request To Specific Site
                //TODO : POST instead Of Get action=payment&Status=true&Message=SuccessfullyDone
                if (bankResult.responseCode == "1")
                {
                    #region Post To Specific Site
                    if (payment.Application.ApplicationName.ToLower() == "webinar")
                    {
                        #region Add Money To User Balance
                        aspnet_User user = m_model.aspnet_Users.Single(P => P.UserId.Equals(payment.UserId));
                        if (m_model.Profiles.Count(P=>P.UserId.Equals(payment.UserId)) != 0)
                        {
                            Profile profile = m_model.Profiles.Single(P=>P.UserId.Equals(payment.UserId));
                            if(profile.Balance != null)
                                profile.Balance += int.Parse(payment.Amount);
                            else
                                profile.Balance = int.Parse(payment.Amount);
                        }
                        else
                        {
                            Profile prof = new Profile();
                            prof.Balance = int.Parse(payment.Amount);
                            prof.UserId = (Guid)payment.UserId;
                            m_model.Profiles.InsertOnSubmit(prof);
                        }
                        m_model.SubmitChanges();
                        #endregion
                        //Example : http://www.iwebinar.ir/Panels/blank.html?action=payment&Status=true&Message=SuccessfullyDone&responseCode=1&responseText=hamechikhobe&refid=12&paymentCode=10;
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence + "&ammount=" + response.Amount;
                        string returnUrl = "http://www.iwebinar.ir/Panels/blank.html?action=payment&Status=true&Message=SuccessfullyDone&" + postData;
                        return Redirect(returnUrl);
                    }
                    else if (payment.Application.ApplicationName.ToLower() == "namaava")
                    {
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence + "&ammount=" + response.Amount;
                        string returnUrl = "http://www.iwebinar.ir:6060/Panels/blank.html?action=payment&Status=true&Message=SuccessfullyDone&" + postData;
                        return Redirect(returnUrl);
                    }
                    else// (payment.Application.ApplicationName.ToLower() == "salamatyar")
                    {
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence;
                        string returnUrl = "http://95.38.118.45:8080/Panels/PatientWizard.html?action=payment&Status=true&Message=SuccessfullyDone&" + postData;
                        return Redirect(returnUrl);
                    }
                    #endregion
                }
                else
                {
                    #region Post To Specific Site
                    if (payment.Application.ApplicationName.ToLower() == "webinar")
                    {
                        //Example : http://www.iwebinar.ir/Panels/blank.html?action=payment&Status=true&Message=SuccessfullyDone&responseCode=1&responseText=hamechikhobe&refid=12&paymentCode=10;
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence;
                        string returnUrl = "http://www.iwebinar.ir/Panels/blank.html?action=payment&Status=false&Message=ErrorInPayment&" + postData;
                        return Redirect(returnUrl);
                    }
                    else if (payment.Application.ApplicationName.ToLower() == "namaava")
                    {
                        //Example : http://www.iwebinar.ir:6060/Panels/blank.html?action=payment&Status=true&Message=SuccessfullyDone&responseCode=1&responseText=hamechikhobe&refid=12&paymentCode=10;
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence;
                        string returnUrl = "http://www.iwebinar.ir:6060/Panels/blank.html?action=payment&Status=false&Message=ErrorInPayment&" + postData;
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        throw new Exception("BankError&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence);
                    }
                    #endregion
                }
                #endregion
            }
            catch (Exception ex)
            {
                string returnUrl = "http://95.38.118.45:8080/Panels/PatientWizard.html?action=payment&Status=false&Message=" + ex.Message;
                return Redirect(returnUrl);
            }
        }

        [HttpGet]
        public ActionResult BankResponse(string transId, int responseCode, int responseSubCode, int responseReasonCode, string reasonText
            , string merchantId, string fbSequence, string timeStamp, string amount, string currencyCode, string signatureHash, int paymentId)
        {
            try
            {
                BankResponse bankResponse = new BankResponse();
                bankResponse.TransId = transId;
                bankResponse.ResponseCode = responseCode;
                bankResponse.ResponseSubCode = responseSubCode;
                bankResponse.ResponseReasonCode = responseReasonCode;
                bankResponse.ResponseReasonText = reasonText;
                bankResponse.MerchantId = merchantId;
                bankResponse.FpSequence = fbSequence;
                bankResponse.TimeStamp = timeStamp;
                bankResponse.Amount = amount;
                bankResponse.CurrencyCode = currencyCode;
                bankResponse.SignatureHash = signatureHash;
                bankResponse.PaymentId = paymentId;
                m_bankDb.BankResponses.InsertOnSubmit(bankResponse);
                m_bankDb.SubmitChanges();
                var userPayment = (from p in m_bankDb.Payments where p.PaymentId == paymentId select p).ToList();
                if (userPayment.Count > 0) 
                {
                    var user = (from p in m_model.aspnet_Users where p.UserId == userPayment[0].UserId select p).ToList();
                    if (user.Count > 0) 
                    {
                        user[0].Profile.Balance += int.Parse(amount);
                    }
                }
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = "Response sent to databse ", Result = bankResponse.BankResponseId }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult MakeZareenPayment(string price, string discountCode)
        {
            try
            {
                #region Fetch User Info
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                #endregion
                #region calc payment
                int paymentToman = int.Parse(price) / 10;
                #endregion
                #region Fetch Discount Code
                //var discountN = m_model.Discounts.Count(P => P.DiscountCode == discountCode && P.DiscountIsUsed == false);
                //if (discountN > 0)
                //{
                //    var discount = m_model.Discounts.Single(P => P.DiscountCode == discountCode);
                //    discount.DiscountIsUsed = true;
                //    discount.DiscountUsedDate = DateTime.Now;
                //    discount.DiscountUsedBy = user.UserId;
                //    discountN = discount.DiscountID;
                //    if (discount.DiscountValue != null)
                //        paymentToman = paymentToman - paymentToman * (int)discount.DiscountValue / 100;
                //    m_model.SubmitChanges();
                //}
                #endregion
                #region DataBase Fields
                Payment payment = new Payment();
                //payment.DiscountCode = discountN.ToString();
                payment.UserId = user.UserId;
                payment.Amount = paymentToman.ToString();
                payment.BankId = 1;
                payment.TimeStamp = new TimeSpan(DateTime.Now.Day, DateTime.Now.Hour, DateTime.Now.Minute, DateTime.Now.Second, DateTime.Now.Millisecond).ToString();
                payment.Date = DateTime.Now;
                m_bankDb.Payments.InsertOnSubmit(payment);
                m_bankDb.SubmitChanges();
                #endregion

                System.Net.ServicePointManager.Expect100Continue = false;
                Zarinpal.WebServices zp = new Zarinpal.WebServices();
                string au = zp.PaymentRequest("50b9d5fb-959c-46fc-8c8b-3ced5ee8aeb5", paymentToman, "http://95.38.118.45:8080/Payment/GetPaymentInfo?PaymentID=" + payment.PaymentId + "&price=" + paymentToman, "Salamat-yar System");
                // string au = zp.PaymentRequest("50b9d5fb-959c-46fc-8c8b-3ced5ee8aeb5", paymentToman, "http://95.38.118.45:8080/ConfirmPayment.html", "Salamat-yar System");
                if (au.Length == 36)
                {
                    return Json(new { Status = true, Message = "Response sent to databse ", Result = "http://www.zarinpal.com/users/pay_invoice/" + au }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Could Not Create Connection To Bank, Try Later.");
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetUserPaymentInfo()
        {
            try
            {

                var user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(User.Identity.Name));

                var Result = from p in m_bankDb.BankResponses
                             where p.Payment.UserId == user.UserId & p.ResponseCode != null && p.ResponseCode == 1
                             select new
                             {
                                 RefID = p.TransId,
                                 Balance = p.Amount
                             };
                return Json(new { Status = true, Message = "Fetched Successfully.", Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult GetPaymentInfo(string PaymentID, string price, string refID, string au)
        {
            try
            {
                Payment payment = m_bankDb.Payments.Single(P => P.PaymentId == int.Parse(PaymentID));
                Zarinpal.WebServices zp = new Zarinpal.WebServices();
                int a = zp.PaymentVerification("50b9d5fb-959c-46fc-8c8b-3ced5ee8aeb5", au, int.Parse(price));
                #region DataBase Section
                BankResponse bankResponse = new BankResponse();
                bankResponse.TransId = refID;
                bankResponse.ResponseCode = a;
                bankResponse.ResponseSubCode = a;
                bankResponse.ResponseReasonCode = a;
                bankResponse.ResponseReasonText = a.ToString();
                bankResponse.MerchantId = "50b9d5fb-959c-46fc-8c8b-3ced5ee8aeb5";
                bankResponse.FpSequence = a.ToString();
                bankResponse.TimeStamp = payment.TimeStamp;
                bankResponse.Amount = payment.Amount;
                bankResponse.CurrencyCode = "Rial";
                bankResponse.SignatureHash = a.ToString();
                bankResponse.PaymentId = payment.PaymentId;
                m_bankDb.BankResponses.InsertOnSubmit(bankResponse);
                m_bankDb.SubmitChanges();
                #endregion
                if (a == 1)
                {
                    var user = m_model.aspnet_Memberships.Single(P => P.UserId == payment.UserId);

                    SMS sms = new SMS();
                    string msg = "ثبت نام شما تکمیل گردید و شماره پیگیری شما " + refID + " می باشد. میزان مبلغ شارژ شده " + int.Parse(payment.Amount) * 10 + " ریال می باشد " + " جهت آشنای با نحوه استفاده از خدمات سامانه به آدرس اینترنتی www.salamat-yar.ir مراجعه نمایید و وارد سیستم شوید.";
                    sms.SendSmsEvent(new string[] { user.aspnet_User.UserName }, msg);
                    m_model.SubmitChanges();
                    var url = "http://95.38.118.45:8080/Panels/PatientWizard.html?action=payment&Status=true&Message=SuccessfullyDone&refid=" + refID + "&au=" + au;
                    Response.Redirect(url);
                    return Redirect(url);
                }
                else
                {

                    if (a == -1)
                    {
                        throw new Exception("اطلاعات ناقص میباشد");
                    }
                    if (a == -2)
                    {
                        throw new Exception("درگاه پرداخت دچار مشکل شده است");
                    }
                    if (a == 0)
                    {
                        throw new Exception("عملیات با مشکل مواجه شده است");
                    }
                    else throw new Exception();
                }
            }
            catch (Exception ex)
            {
                return Redirect("http://95.38.118.45:8080/Panels/PatientWizard.html?action=payment&Status=false&Message=" + ex.Message);
            }
        }

        //public ActionResult Payment()
        //{
        //    try 
        //    {

        //    }
        //    catch (Exception ex) 
        //    {
        //        return Json(new { Status = false, Message= ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public ActionResult VerifyPayment(string paymentID)
        {
            try
            {
                using (var client = new WebClient())
                {
                    var paymentCount = m_bankDb.Payments.Count(P => P.PaymentId.ToString().Equals(paymentID));
                    if (paymentCount <= 0)
                    {
                        throw new Exception("کد رهگیری وارد شده وجود ندارد.");
                    }
                    var tmpPayment = m_bankDb.Payments.Single(P => P.PaymentId.ToString().Equals(paymentID));
                    var resultCount = m_bankDb.BankResponses.Count(P => P.PaymentId.ToString().Equals(paymentID));
                    if (resultCount > 0)
                    {
                        var payment = (from P in m_bankDb.BankResponses where P.PaymentId.ToString().Equals(paymentID) select P).ToList()[resultCount - 1];
                        if (payment.ResponseCode == 1)
                        {
                            throw new Exception("پرداخت شما با موفقیت انجام شده است.");
                        }
                        if (payment.ResponseCode != 4)
                        {
                            throw new Exception("پرداخت به علت خطای دریافتی از بانک انجام نشده است.");
                        }
                    }

                    DateTime now = DateTime.Now;
                    TimeSpan tmpstmp = new TimeSpan(now.Hour, now.Minute, now.Second);
                    string emza = createfpHash("TestMer33^" + paymentID + "^" + tmpPayment.TimeStamp + "^" + tmpPayment.Amount + "^Rial");
                    var datatopost = Encoding.Default.GetBytes(""); //encoding.default.getbytes("param1=value1&param2=value2");
                    var result = client.UploadData(@"https://damoon.bankmelli-iran.com/DamoonVerificationController?x_description=Verification&x_login=TestMer33&x_fp_sequence=" + paymentID + "&x_fp_timestamp=" + tmpPayment.TimeStamp + "&x_amount=" + tmpPayment.Amount + "&x_currency_code=Rial&x_fp_hash=" +
                       emza, "post", datatopost);
                    string dd = Encoding.ASCII.GetString(result);
                    string[] arrayofdata = dd.Remove(dd.IndexOf("<")).Split(new char[2] { '&', '=' });
                    Dictionary<string, string> results = new Dictionary<string, string>();

                    for (int i = 0; i < arrayofdata.Length; i += 2)
                    {
                        results.Add(arrayofdata[i], arrayofdata[i + 1]);
                    }
                    #region Create BankResultObject
                    var bankResult = new
                    {
                        Status = true,
                        transActionID = results["x_trans_id"],
                        responseCode = results["x_response_code"],
                        reasonCode = results["x_response_reason_code"],
                        reasonText = results["x_response_reason_text"],
                        login = results["x_login"],
                        sequence = results["x_fp_sequence"],
                        timestamp = results["x_fp_timestamp"],
                        amount = results["x_amount"],
                        currency = results["x_currency_code"],
                        hashCode = results["x_fp_hash"]
                    };
                    #endregion

                    BankResponse response = new BankResponse();
                    if (resultCount > 0)
                    {
                        response = (from P in m_bankDb.BankResponses where P.PaymentId.ToString().Equals(paymentID) select P).ToList()[resultCount - 1];
                    }
                    else
                    {
                        response.Amount = tmpPayment.Amount;
                        response.CurrencyCode = "Rial";
                        response.FpSequence = bankResult.sequence;
                        response.MerchantId = tmpPayment.BankInfo.MerchantId;
                        response.Payment = tmpPayment;
                        response.ResponseReasonCode = bankResult.reasonCode == "" ? -1 : int.Parse(bankResult.reasonCode);
                        response.ResponseReasonText = bankResult.reasonText;
                        response.SignatureHash = bankResult.hashCode;
                        response.TimeStamp = bankResult.timestamp;
                        response.TransId = bankResult.transActionID;
                        response.ResponseCode = int.Parse(bankResult.responseCode);
                        m_bankDb.BankResponses.InsertOnSubmit(response);
                        m_bankDb.SubmitChanges();
                    }

                    if (bankResult.responseCode == "1")
                    {

                        response.ResponseCode = 1;
                        m_bankDb.SubmitChanges();
                        string postData = "responseCode=" + bankResult.responseCode + "&responseText=" + bankResult.reasonText + "&refid=" + bankResult.transActionID + "&paymentCode=" + bankResult.sequence;
                        string returnUrl = "http://95.38.118.45:8888/Panels/PatientWizard.html?action=payment&Status=true&Message=SuccessfullyDone&" + postData;
                        return Redirect(returnUrl);
                    }
                    else if (bankResult.responseCode == "3")
                    {

                        response.ResponseCode = 3;
                        m_bankDb.SubmitChanges();

                        throw new Exception("پرداخت لغو شده است");

                    }
                    else if (bankResult.responseCode == "4")
                    {
                        throw new Exception("پرداخت در حالت انتظار قرار دارد");
                    }
                    else
                    {
                        response.ResponseCode = int.Parse(bankResult.responseCode);
                        m_bankDb.SubmitChanges();
                        throw new Exception("پرداخت به علت خطای دریافتی از بانک انجام نشده است.");
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        [Authorize]
        [HttpGet]
        public ActionResult MarkAsPayed(string isOk, string paymentID)
        {
            try
            {
                bool ISOK = bool.Parse(isOk);

                #region Fetch User Info
                string userName = User.Identity.Name;
                aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                if (ISOK == true)
                {

                    BankResponse response = m_bankDb.BankResponses.Single(P => P.TransId == paymentID);
                    Payment payment = response.Payment;
                    //if (payment.DiscountCode != "0")
                    //{
                    //    m_model.Discounts.Single(P => P.DiscountID == int.Parse(payment.DiscountCode)).DiscountIsUsed = true;
                    //}
                    m_model.SubmitChanges();
                }
                else
                {


                    BankResponse response = m_bankDb.BankResponses.Single(P => P.TransId == paymentID);

                    Payment payment = response.Payment;

                    //if (payment.DiscountCode != "0")
                    //{
                    //    m_model.Discounts.Single(P => P.DiscountID == int.Parse(payment.DiscountCode)).DiscountIsUsed = false;
                    //}
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "OK" }, JsonRequestBehavior.AllowGet);
                }
                #endregion
                return Json(new { Status = true, Message = "submit ok" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult ConfirmPayment(int paymentId)
        {
            try
            {
                if (m_bankDb.Payments.Count(P => P.PaymentId == paymentId) > 0)
                {
                    string userName = User.Identity.Name;
                    aspnet_User user = m_model.aspnet_Users.Single(P => P.UserName.ToLower().Equals(userName));
                    var profile = m_model.Profiles.Single(P => P.UserId == user.UserId);
                    var payment = m_bankDb.Payments.Single(P => P.PaymentId == paymentId);
                    var fee = payment.Amount;
                    if (payment.IsCalculated == null || payment.IsCalculated == false)
                    {
                        profile.Balance += int.Parse(fee);
                        payment.IsCalculated = true;
                        m_bankDb.SubmitChanges();
                        m_model.SubmitChanges();
                    }
                   
                    return Json(new { Status = true, balance = profile.Balance, Message = "ok" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Payment is incorrect" }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        private string createfpHash(string signacher)
        {
            string key = "eoXaEm2LUnz2OiyQ";
            System.Text.ASCIIEncoding encoding = new System.Text.ASCIIEncoding();
            byte[] keyByte = encoding.GetBytes(key);
            HMACMD5 hmacmd5 = new HMACMD5(keyByte);
            byte[] messageBytes = encoding.GetBytes(signacher);
            byte[] hashmessage = hmacmd5.ComputeHash(messageBytes);
            return signacher = ByteToString(hashmessage);
        }
        private string ByteToString(byte[] buff)
        {
            string sbinary = "";
            for (int i = 0; i < buff.Length; i++)
            {
                sbinary += buff[i].ToString("X2"); // hex format
            }
            return (sbinary);
        }

        //[HttpGet]
        //public ActionResult SubmitManualPayment(string userName, string code)
        //{
        //    try
        //    {
        //        var user = m_model.aspnet_Users.Count(P => P.UserName.Equals(userName));

        //        if (user > 0)
        //        {
        //            var userA = m_model.aspnet_Users.Single(P => P.UserName == userName);
        //            var x = m_model.ManualPayments.Count(P => P.UserName == userA.UserId);
        //            if (x > 0)
        //            {
        //                throw new Exception("user does not exist");
        //            }
        //            ManualPayment payment = new ManualPayment();
        //            payment.ManualPaymentCode = code;
        //            payment.PaymentDate = DateTime.Now;
        //            payment.UserName = userA.UserId;
        //            m_model.ManualPayments.InsertOnSubmit(payment);
        //            m_model.SubmitChanges();
        //            return Json(new { Status = true, Message = "submit ok" }, JsonRequestBehavior.AllowGet);
        //        }
        //        else
        //        {
        //            throw new Exception("user does not exist");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

    }
}
