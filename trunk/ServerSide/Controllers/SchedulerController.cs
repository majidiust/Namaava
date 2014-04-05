using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Webinar.Models;

using Webinar.Utility;

namespace Webinar.Controllers
{
    public class SchedulerController : Controller
    {
        private Logger m_logger = new Logger();
        private DataBaseDataContext m_model = new DataBaseDataContext();
        //
        // GET: /Scheduler/

        public ActionResult Index()
        {
            return View();
            
        }
        /// <summary>
        ///  This function checks if server is busy on the time of the new Session or not.
        /// </summary>
        /// <param name="tempSession">the session to check if we have available time or not</param>
        /// <returns></returns>
        
    }
}
