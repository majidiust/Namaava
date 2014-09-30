using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Net.Mail;
using System.Collections.Specialized;

using System.Web.UI.WebControls;


namespace TaskManagerEngine.Utility
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

            SmtpClient SmtpServer = new SmtpClient("mail.isc.org.ir");
            SmtpServer.Port = 25;
            SmtpServer.Credentials = new System.Net.NetworkCredential("sm_mahdavi@isc.org.ir", "13121315");
            try
            {
                SmtpServer.Send(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                //TODO: HANDLING EXCEPTION!
                //throw;
            }
		}


        public static void SendMailViaGMail(string To, string Subject, string Message)
        {
            var fromAddress = new MailAddress("namaava.zendegi@gmail.com", "نماآوای زندکی");
            var toAddress = new MailAddress(To, "Seminar");
            const string fromPassword = "P@ssw0rdmajid";
            string subject = Subject;
            string body = Message;

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
            };
            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            })
            {
                smtp.Send(message);
            }
        }

        public void SendMailNamaAvaMail(string To, string Subject, string Message)
        {
            var fromAddress = new MailAddress("iwebinar@chmail.ir", "Webinar");
            var toAddress = new MailAddress(To, "Client");
            const string fromPassword = "P@ssw0rd";
            string subject = Subject;
            string body = Message;
            var smtp = new SmtpClient
            {
                Host = "smtp.chmail.ir",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("iwebinar@chmail.ir", fromPassword)
            };
            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            })
            {
                smtp.Send(message);
            }
        }

        public void SendMail( string To, string Subject, string Message)
        {
            SendMailViaGMail( To,  Subject,  Message);
        }
	}

	#endregion
}
