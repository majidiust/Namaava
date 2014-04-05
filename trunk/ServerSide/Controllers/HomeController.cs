using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Webinar.Utility;
using System.IO;

namespace Webinar.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewData["Message"] = "Welcome to ASP.NET MVC!";
            return Redirect("index.html");            
        }

        public ActionResult About()
        {
            return View();
        }
    }
}
