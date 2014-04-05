using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;


using Webinar.Models;

using Webinar.Utility;


using System.Runtime.Serialization.Json;
using System.Web.Routing;

namespace Webinar.Controllers
{
    public class UtilityController : Controller
    {
        private DataBaseDataContext m_model = new DataBaseDataContext();
        
        //
        // GET: /Utility/

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult NewspaperSubscribe(string email)
        {
            try
            {
                if (m_model.NewspaperMembers.Count(P => P.EmailAddress.ToLower().Equals(email)) == 0)
                {
                    NewspaperMember newMember = new NewspaperMember();
                    newMember.EmailAddress = email;
                    newMember.Enabled = true;
                    newMember.SubmitDate = DateTime.Now;
                    m_model.NewspaperMembers.InsertOnSubmit(newMember);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Add To Newspaper Successfully." }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { Status = false, Message = "Your Email Address Exist Already." }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetCities() 
        {
            try 
            {
                var cities = (from p in m_model.Cities where p.CityId < 1000 select new { CityId = p.CityId, Name = p.Name }).ToList();
                return Json(new { Status = true, Result = cities }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex) 
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetCountries()
        {
            try
            {
                var countries = (from p in m_model.Countries where p.CountryId < 1000 select p).ToList();
                return Json(new { Status = true, Countries =countries }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetDegrees()
        {
            try
            {
                var degrees = (from p in m_model.Degrees where p.DegreeId<100 select p).ToList();
                return Json(new { Status = true,Message = "Degrees Sent", Result = degrees }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetSessionStates() 
        {
            try
            {
                var states = (from p in m_model.SessionStates where p.StateId < 100 select p).ToList();
                return Json(new { Status = true, States=states }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public bool CompareDate(WebinarDateTime date1, WebinarDateTime date2)
        {
            return ((date1.Year == date2.Year) && (date1.Month == date2.Month) && (date1.Day == date2.Day));

        }

    }
}
