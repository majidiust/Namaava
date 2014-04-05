using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Webinar.Models;


namespace Webinar.Utility
{
    public class ViewDataUploadFilesResult
    {
        public string Name { get; set; }
        public int Length { get; set; }
        public string Type { get; set; }
        public int Id { get; set; }
    }
    public class FileUtility
    {
        public static void ConvertPowerPointToImage(string originalFilePath, string destinationPath)
        {
            try
            {
                DataBaseDataContext m_model = new DataBaseDataContext();
                TaskType taskType = m_model.TaskTypes.Single(P => P.TaskTypeName.ToLower().Contains("convertpowerpointtoimage"));
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
                param1.TaskParamName = "originalFilePath";
                param1.TaskParamValue = originalFilePath;
                m_model.TaskParams.InsertOnSubmit(param1);
                TaskParam param2 = new TaskParam();
                param2.TaskID = newTask.TaskId;
                param2.TaskParamName = "destinationPath";
                param2.TaskParamValue = destinationPath;
                m_model.TaskParams.InsertOnSubmit(param2);
                m_model.SubmitChanges();
            }
            catch (Exception ex)
            {
                //TODO : DO Somethings in hee as error logging 
                throw ex;
            }
        }

        public static void UploadToVODServer(int id, string videoFile, int sessionID)
        {
            try
            {
                DataBaseDataContext m_model = new DataBaseDataContext();
                TaskType taskType = m_model.TaskTypes.Single(P => P.TaskTypeName.ToLower().Contains("copyfiletoremote"));
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
                param1.TaskParamName = "source";
                param1.TaskParamValue = videoFile;
                m_model.TaskParams.InsertOnSubmit(param1);
                TaskParam param2 = new TaskParam();
                param2.TaskID = newTask.TaskId;
                param2.TaskParamName = "destination";
                param2.TaskParamValue = "/home/hiva/Videos/Namaava/" + sessionID;
                m_model.TaskParams.InsertOnSubmit(param2);
                TaskParam param3 = new TaskParam();
                param3.TaskID = newTask.TaskId;
                param3.TaskParamName = "id";
                param3.TaskParamValue = "" + id;
                m_model.TaskParams.InsertOnSubmit(param3);
                m_model.SubmitChanges();
            }
            catch (Exception ex)
            {
                //TODO : DO Somethings in hee as error logging 
                throw ex;
            }
        }


        public static void UploadToVODServerAsSample(int id, string videoFile)
        {
            try
            {
                DataBaseDataContext m_model = new DataBaseDataContext();
                TaskType taskType = m_model.TaskTypes.Single(P => P.TaskTypeName.ToLower().Contains("copyfiletoremote"));
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
                param1.TaskParamName = "source";
                param1.TaskParamValue = videoFile;
                m_model.TaskParams.InsertOnSubmit(param1);
                TaskParam param2 = new TaskParam();
                param2.TaskID = newTask.TaskId;
                param2.TaskParamName = "destination";
                param2.TaskParamValue = "/home/hiva/Videos/Namaava/Samples";
                m_model.TaskParams.InsertOnSubmit(param2);
                TaskParam param3 = new TaskParam();
                param3.TaskID = newTask.TaskId;
                param3.TaskParamName = "id";
                param3.TaskParamValue = "" + id;
                m_model.TaskParams.InsertOnSubmit(param3);
                m_model.SubmitChanges();
            }
            catch (Exception ex)
            {
                //TODO : DO Somethings in hee as error logging 
                throw ex;
            }
        }
    }
}