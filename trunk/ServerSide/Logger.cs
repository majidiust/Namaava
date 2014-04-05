using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using Webinar.Models;

namespace Webinar
{
    public class Logger
    {
        public DataBaseDataContext m_model;
        public Logger()
        {
            m_model = new DataBaseDataContext();
        }

        public void Log(string message)
        {
            try
            {
                LogTable log = new LogTable();
                log.Message = message;
                log.Time = DateTime.Now;
                m_model.LogTables.InsertOnSubmit(log);
                m_model.SubmitChanges();
            }
            catch (Exception ex)
            {
                //TODO ::  
                throw new Exception(ex.Message);
            }
        }

        public void Log(string message, int loc)
        {
            LogTable log = new LogTable();
            log.Message = message;
            log.Time = DateTime.Now;
            log.LineOfCode = loc;
            m_model.LogTables.InsertOnSubmit(log);
            m_model.SubmitChanges();
        }

    }
}