using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Webinar.Models;


namespace Webinar.Utility
{
    public class TaskUtility
    {
        private static DataBaseDataContext m_model = new DataBaseDataContext();
        public static void InsertTask(Task newTask)
        {
            m_model.Tasks.InsertOnSubmit(newTask);
            m_model.SubmitChanges();
        }
    }
}