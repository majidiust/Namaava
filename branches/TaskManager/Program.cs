using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;
using TaskManagerEngine.Utility;
using Renci.SshNet;
using System.IO;
using System.Globalization;


namespace TaskManagerEngine
{
    class Program
    {
        static void InspectSeminars(DataBaseDataContext db)
        {
            try
            {
                var sessions = db.Sessions.Where(P => P.StateId == 1 || P.StateId == 2 || P.StateId == 7);
                foreach (var session in sessions)
                {
                    DateTime zero = new DateTime(
                            1300,
                            1,
                            1,
                            12,
                            0,
                            0
                        );
                    DateTime begin = new DateTime(
                        (int)session.WebinarDateTime.Year,
                        (int)session.WebinarDateTime.Month,
                        (int)session.WebinarDateTime.Day,
                        session.WebinarDateTime.Time.Value.Hours,
                        session.WebinarDateTime.Time.Value.Minutes,
                        session.WebinarDateTime.Time.Value.Seconds);
                    DateTime end = new DateTime(
                        (int)session.WebinarDateTime1.Year,
                        (int)session.WebinarDateTime1.Month,
                        (int)session.WebinarDateTime1.Day,
                        session.WebinarDateTime1.Time.Value.Hours,
                        session.WebinarDateTime1.Time.Value.Minutes,
                        session.WebinarDateTime1.Time.Value.Seconds);
                    DateTime now = DateTime.Now;
                    if (IsDateInRange(begin, end, now) == true)
                    {
                        session.StateId = 2;
                    }
                    else if (IsDateInRange(zero, begin, now) == true)
                    {
                        session.StateId = 1;
                    }
                    else
                        session.StateId = 3;

                }
                db.SubmitChanges();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public static bool IsDateInRange(DateTime begin, DateTime end, DateTime date)
        {
            if (date == null)
                return false;
            PersianCalendar pc = new PersianCalendar();
            DateTime ndate = new DateTime(pc.GetYear(date), pc.GetMonth(date), pc.GetDayOfMonth(date));
            if (ndate.Subtract(begin).TotalMilliseconds > 0 && end.Subtract(ndate).TotalMilliseconds > 0)
                return true;
            else return false;
        }

        static void Main(string[] args)
        {

            while (true)
            {
                DataBaseDataContext db = new DataBaseDataContext();
                InspectSeminars(db);
                var tasks = (from p in db.Tasks where p.TaskStatus == 1 || p.TaskStatus == 4 select p).AsParallel();

                foreach (var task in tasks)
                {
                    Console.WriteLine("-------------------------------------");
                    Console.WriteLine("Task Id : " + task.TaskId);
                    Console.WriteLine("Task Type : " + task.TaskType.TaskTypeName);
                    Console.WriteLine("Task Params : ");
                    if (task.TaskType.TaskTypeName.ToLower().Contains("convertpowerpointtoimage"))
                    {
                        try
                        {
                            string originalFilePath = task.TaskParams[0].TaskParamValue;
                            string destinationPath = task.TaskParams[1].TaskParamValue;
                            if (System.IO.Directory.Exists(destinationPath))
                            {
                                if (System.IO.Directory.GetFiles(destinationPath).Length > 0)
                                {
                                    System.IO.Directory.Delete(destinationPath, true);
                                }
                            }
                            System.IO.Directory.CreateDirectory(destinationPath);


                            destinationPath = task.TaskParams[1].TaskParamValue + @"\";
                            Application pptApplication = new Application();
                            Presentation pptPresentation = pptApplication.Presentations
                            .Open(originalFilePath, MsoTriState.msoFalse, MsoTriState.msoFalse
                            , MsoTriState.msoFalse);
                            foreach (Slide s in pptPresentation.Slides)
                            {
                                s.Export(destinationPath + s.SlideNumber.ToString() + ".gif", "gif", 640, 480);
                                s.Export(destinationPath + s.SlideNumber.ToString()+ "_thumbnail" + ".gif", "gif", 150, 79);
                            }

                            task.TaskStatus = 3;
                            db.SubmitChanges();
                           
                            Console.WriteLine(task.TaskId + " : Done Successfully");
                        }
                        catch (Exception ex)
                        {
                            //TODO : Save Task Log Error
                            Console.WriteLine(task.TaskId + " : " + ex.Message);
                            task.TaskStatus = 4;
                            db.SubmitChanges();
                        }

                    }
                    else if (task.TaskType.TaskTypeName.ToLower().Contains("sendsms"))
                    {
                        try
                        {
                            string number = task.TaskParams[0].TaskParamValue;
                            string msg = task.TaskParams[1].TaskParamValue;
                            SMS sms = new SMS();
                            sms.SendSmsEvent(new string[] { number }, msg);
                            task.TaskStatus = 3;
                            db.SubmitChanges();
                            Console.WriteLine(task.TaskId + " : Done Successfully");
                        }
                        catch (Exception ex)
                        {
                            //TODO : Save Task Log Error
                            Console.WriteLine(task.TaskId + " : " + ex.Message);
                            task.TaskStatus = 4;
                            db.SubmitChanges();
                        }

                    }
                    else if (task.TaskType.TaskTypeName.ToLower().Contains("email"))
                    {
                        try 
                        {
                            string to = task.TaskParams[0].TaskParamValue;
                            string subject = task.TaskParams[1].TaskParamValue;
                            string msg = task.TaskParams[2].TaskParamValue;
                            EmailService service = new EmailService();
                            service.SendMail(to, subject, msg);
                            task.TaskStatus = 3;
                            db.SubmitChanges();
                            Console.WriteLine(task.TaskId + " : Done Successfully");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(task.TaskId + " : " + ex.Message);
                            task.TaskStatus = 4;
                            db.SubmitChanges();
                        }
                    }
                    else if (task.TaskType.TaskTypeName.ToLower().Contains("copyfiletoremote"))
                    {
                        try
                        {
                            string source = task.TaskParams[0].TaskParamValue;
                            string destination = task.TaskParams[1].TaskParamValue;
                            string ext = task.TaskParams[2].TaskParamValue;
                            var dd = new FileInfo(source).Extension;
                            var rdest = destination + "/" + ext + dd;
                            Console.WriteLine("Source : " + source);
                            Console.WriteLine("Dest : " + destination);
                            Console.WriteLine("Ext : " + ext);
                            Console.WriteLine("dd : " + dd);
                            Console.WriteLine("rDest : " + rdest);

                            using (var client = new SshClient("94.232.174.206", 3435, "admin", "StreamerP@ssw0rd"))
                            {
                                client.Connect();
                                var cmd1 = client.RunCommand("mkdir " + destination);
                                var cmd2 = client.RunCommand("sudo chmod 777 " + destination);
                                client.Disconnect();
                            }

                            using (var scp = new ScpClient("94.232.174.206", 3435, "admin", "StreamerP@ssw0rd"))
                            {
                                scp.Connect();
                                scp.Upload(new FileInfo(source), rdest);
                                scp.Disconnect();
                            }

                            task.TaskStatus = 3;
                            db.SubmitChanges();
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                    }
                }
                System.Threading.Thread.Sleep(5 * 1000);
            }

        }
    }
}
