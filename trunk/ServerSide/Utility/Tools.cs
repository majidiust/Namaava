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
    }
}