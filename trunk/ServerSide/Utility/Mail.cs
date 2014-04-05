using System;
using System.Net;
using System.Net.Mail;

using System.Linq;

using Webinar.Models;
using System.Web.UI.WebControls;
using System.Collections.Specialized;

namespace Webinar.Utility
{

    #region Email Message Class

    public class EmailMessage
    {
        public string To
        {
            get;
            set;
        }

        public string From
        {
            get;
            set;
        }

        public string Subject
        {
            get;
            set;
        }

        public string Message
        {
            get;
            set;
        }
    }

    #endregion

    #region Email Service Class

    public class EmailService
    {
        private DataBaseDataContext m_model = new DataBaseDataContext();
        public void SendMessage(MailMessage message, string username, string password, string host, int port, bool enableSsl)
        {
            //MailMessage mm = new MailMessage(message.From, message.To, message.Subject, message.Message);
            NetworkCredential credentials = new NetworkCredential(username, password);
            SmtpClient sc = new SmtpClient(host, port);
            sc.EnableSsl = enableSsl;
            sc.Credentials = credentials;
            try
            {
                sc.Send(message);
            }
            catch (Exception)
            {
                //TODO: HANDLING EXCEPTION!
                //throw;
            }
        }

        public void SendMail(string To, string Subject, string Message)
        {
            //MailDefinition md = new MailDefinition();
            //md.From = "hiva.webinar@gmail.com";
            //md.IsBodyHtml = true;
            ////md.Subject = "Test of MailDefinition";
            //md.Subject = Subject;
            //ListDictionary replacements = new ListDictionary();
            ////replacements.Add("<%Name%>", "Martin");
            ////replacements.Add("<%Country%>", "Denmark");
            //string body = Message;
            ////string body = "<center><strong style='font-family:Tahoma;'>جامآ</strong></center><br/><br/>" + "Hello <%Name%>You're from <%Country%>.";
            //MailMessage msg = md.CreateMailMessage(To, replacements, body, new System.Web.UI.Control());
            //EmailMessage emailMessege = new EmailMessage();
            //emailMessege.Subject = Subject;

            //emailMessege.To = To;
            //emailMessege.Message = Message;

            //int settingsId = m_model.ApplicationSettings.Single(i => (i.SettingName == "EmailSettings")).SettingsId;
            //var emailAddress = m_model.SettingsProperties.Single(j => (j.PropertyName.ToLower() == "emailaddress") && (j.SettingsId == settingsId)).PropertyValue;
            //var emailPassword = m_model.SettingsProperties.Single(p => (p.PropertyName.ToLower() == "emailpassword") && (p.SettingsId == settingsId)).PropertyValue;
            //var emailHost = m_model.SettingsProperties.Single(q => (q.PropertyName.ToLower() == "emailhost") && (q.SettingsId == settingsId)).PropertyValue;
            //var emailPort = m_model.SettingsProperties.Single(j => (j.PropertyName.ToLower() == "emailport") && (j.SettingsId == settingsId)).PropertyValue;
            //var emailEnableSsl = m_model.SettingsProperties.Single(p => (p.PropertyName.ToLower() == "emailenablessl") && (p.SettingsId == settingsId)).PropertyValue;
            //emailMessege.From = emailAddress;
            //new EmailService().SendMessage(msg, emailAddress, emailPassword, emailHost, int.Parse(emailPort), bool.Parse(emailEnableSsl));
            ////new EmailService().SendMessage(emailMessege, "shahrokhi@rayanhiva.ir", "shiva123", "mail.rayanhiva.ir", 25, false);


                
                TaskType taskType = m_model.TaskTypes.Single(P => P.TaskTypeName.ToLower().Contains("email"));
                Task newTask = new Task();
                newTask.TaskInitDate = DateTime.Now;
                newTask.TaskRunTime = DateTime.Now;
                newTask.TaskPriority = 1;
                newTask.TaskStatus = 1;
                newTask.TaskTypeId = taskType.TaskTypeID;
                m_model.Tasks.InsertOnSubmit(newTask);
                m_model.SubmitChanges();
                TaskParam param1 = new TaskParam();
                param1.TaskID = newTask.TaskId;
                param1.TaskParamName = "to";
                param1.TaskParamValue = To;
                m_model.TaskParams.InsertOnSubmit(param1);
                TaskParam param2 = new TaskParam();
                param2.TaskID = newTask.TaskId;
                param2.TaskParamName = "subject";
                param2.TaskParamValue = Subject;
                m_model.TaskParams.InsertOnSubmit(param2);
                TaskParam param3 = new TaskParam();
                param3.TaskID = newTask.TaskId;
                param3.TaskParamName = "msg";
                param3.TaskParamValue = Message;
                m_model.TaskParams.InsertOnSubmit(param3);

                m_model.SubmitChanges();
            
        }


    }

    #endregion
}
