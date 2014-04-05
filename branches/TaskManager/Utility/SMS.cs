using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using TaskManagerEngine;
using System.Net;
using System.IO;


namespace TaskManagerEngine.Utility
{

    public class SMS
    {
        private DataBaseDataContext m_model = new DataBaseDataContext();
        public  void SendSmsEvent(string[] to, string message)
        {
            foreach (string d in to)
            {
                try
                {
                    string dest = d;
                    if (dest[0] == '0')
                        dest = dest.Substring(1, dest.Length - 1);
                    if (dest.Substring(0, 3).Equals("+98"))
                        dest = dest.Substring(1, dest.Length - 1);
                    if (!dest.Substring(0, 2).Equals("98") || !dest.Substring(0, 3).Equals("+98"))
                        dest = "98" + dest;
                    SMSServiceADP.JaxRpcMessagingServiceClient client = new SMSServiceADP.JaxRpcMessagingServiceClient();
                    var result = client.send("namaava", "kimia835754", "9820001520", new string[] { dest }, null, null, new string[] { "7686" }, (short)1, (short)2, true, DateTime.Now, message);
                    Console.WriteLine(result.id[0] + ":" + result.status);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
        }

        public static void SendSmsEventTest(string[] to, string message)
        {
            foreach (string d in to)
            {
                try
                {
                    string dest = d;
                    if (dest[0] == '0')
                        dest = dest.Substring(1, dest.Length - 1);
                    if (dest.Substring(0, 3).Equals("+98"))
                        dest = dest.Substring(1, dest.Length - 1);
                    if (!dest.Substring(0, 2).Equals("98") || !dest.Substring(0, 3).Equals("+98"))
                        dest = "98" + dest;
                    SMSServiceADP.JaxRpcMessagingServiceClient client = new SMSServiceADP.JaxRpcMessagingServiceClient();
                    var result = client.send("namaava", "kimia835754", "9820001520", new string[] { dest }, null, null, new string[] { "7686" }, (short)1, (short)2, true, DateTime.Now, message);
                    Console.WriteLine(result.id[0] +":" + result.status);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
        }
    }
}