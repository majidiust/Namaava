using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Webinar.Utility
{
    public class Tools
    {
        private static readonly Random _rng = new Random();
        private static string _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"; //Added 1-9

        public static string RandomString(int size)
        {
            char[] buffer = new char[size];

            for (int i = 0; i < size; i++)
            {
                buffer[i] = _chars[_rng.Next(_chars.Length)];
            }
            return new string(buffer);
        }

        public static string TwoDigitString(string digit)
        {
            if (digit.Length < 2)
            {
                digit = "0" + digit;
            }
            return digit;
        }

        public static string JalaliNowDate(string type)
        {
            System.Globalization.PersianCalendar pc = new System.Globalization.PersianCalendar();
            int jYearNow, jMonthNow, jDayNow, jTimeNow;
            jYearNow = pc.GetYear(DateTime.Now);
            jMonthNow = pc.GetMonth(DateTime.Now);
            jDayNow = pc.GetDayOfMonth(DateTime.Now);

            string jNow = "";

            if (type == "without/")
            {
                jNow = jYearNow.ToString() + TwoDigitString(jMonthNow.ToString()) + TwoDigitString(jDayNow.ToString());
            }
            else if (type == "with/")
            {
                jNow = jYearNow.ToString() + "/" + TwoDigitString(jMonthNow.ToString()) + "/" + TwoDigitString(jDayNow.ToString());
            }

            return jNow;
        }
    }
}