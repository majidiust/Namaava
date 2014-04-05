using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Webinar.Models;

namespace Webinar.Utility
{
    public class SMS
    {
        private DataBaseDataContext m_model = new DataBaseDataContext();
        public void SendSmsEvent(string[] to, string message)
        {
            //long[] rec = null;
            //byte[] status = null;
            //WebReference.Send send = new WebReference.Send();
            //int settingsId = m_model.ApplicationSettings.Single(i => (i.SettingName == "smsSettings")).SettingsId;
            //var username = m_model.SettingsProperties.Single(j => (j.PropertyName.ToLower() == "smsusername") && (j.SettingsId == settingsId)).PropertyValue;
            //var password = m_model.SettingsProperties.Single(p => (p.PropertyName.ToLower() == "smspassword") && (p.SettingsId == settingsId)).PropertyValue;
            //var from = m_model.SettingsProperties.Single(q => (q.PropertyName.ToLower() == "smsfrom") && (q.SettingsId == settingsId)).PropertyValue;

            //send.SendSms(username, password, to, from, message, false, "", ref rec, ref status);
            for (int i = 0; i < to.Length; i++)
            {
                if (to[i] != string.Empty)
                {
                    TaskType taskType = m_model.TaskTypes.Single(P => P.TaskTypeName.ToLower().Contains("sendsms"));
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
                    param1.TaskParamName = "number";
                    param1.TaskParamValue = to[i];
                    m_model.TaskParams.InsertOnSubmit(param1);
                    TaskParam param2 = new TaskParam();
                    param2.TaskID = newTask.TaskId;
                    param2.TaskParamName = "msg";
                    param2.TaskParamValue = message;
                    m_model.TaskParams.InsertOnSubmit(param2);
                    m_model.SubmitChanges();
                }
            }
        }

    }
}