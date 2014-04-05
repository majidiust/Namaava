﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

// 
// This source code was auto-generated by Microsoft.VSDesigner, Version 4.0.30319.1.
// 
#pragma warning disable 1591

namespace Webinar.WebReference {
    using System;
    using System.Web.Services;
    using System.Diagnostics;
    using System.Web.Services.Protocols;
    using System.ComponentModel;
    using System.Xml.Serialization;
    
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Web.Services.WebServiceBindingAttribute(Name="SendSoap", Namespace="http://tempuri.org/")]
    [System.Xml.Serialization.XmlIncludeAttribute(typeof(BaseBL))]
    public partial class Send : System.Web.Services.Protocols.SoapHttpClientProtocol {
        
        private System.Threading.SendOrPostCallback SendSmsOperationCompleted;
        
        private System.Threading.SendOrPostCallback GetCreditOperationCompleted;
        
        private System.Threading.SendOrPostCallback GetDeliveryOperationCompleted;
        
        private System.Threading.SendOrPostCallback GetInboxCountOperationCompleted;
        
        private System.Threading.SendOrPostCallback getMessagesOperationCompleted;
        
        private System.Threading.SendOrPostCallback ScheduleSmsOperationCompleted;
        
        private bool useDefaultCredentialsSetExplicitly;
        
        /// <remarks/>
        public Send() {
            this.Url = global::Webinar.Properties.Settings.Default.Webinar_WebReference_Send;
            if ((this.IsLocalFileSystemWebService(this.Url) == true)) {
                this.UseDefaultCredentials = true;
                this.useDefaultCredentialsSetExplicitly = false;
            }
            else {
                this.useDefaultCredentialsSetExplicitly = true;
            }
        }
        
        public new string Url {
            get {
                return base.Url;
            }
            set {
                if ((((this.IsLocalFileSystemWebService(base.Url) == true) 
                            && (this.useDefaultCredentialsSetExplicitly == false)) 
                            && (this.IsLocalFileSystemWebService(value) == false))) {
                    base.UseDefaultCredentials = false;
                }
                base.Url = value;
            }
        }
        
        public new bool UseDefaultCredentials {
            get {
                return base.UseDefaultCredentials;
            }
            set {
                base.UseDefaultCredentials = value;
                this.useDefaultCredentialsSetExplicitly = true;
            }
        }
        
        /// <remarks/>
        public event SendSmsCompletedEventHandler SendSmsCompleted;
        
        /// <remarks/>
        public event GetCreditCompletedEventHandler GetCreditCompleted;
        
        /// <remarks/>
        public event GetDeliveryCompletedEventHandler GetDeliveryCompleted;
        
        /// <remarks/>
        public event GetInboxCountCompletedEventHandler GetInboxCountCompleted;
        
        /// <remarks/>
        public event getMessagesCompletedEventHandler getMessagesCompleted;
        
        /// <remarks/>
        public event ScheduleSmsCompletedEventHandler ScheduleSmsCompleted;
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/SendSms", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public int SendSms(string username, string password, string[] to, string from, string text, bool isflash, string udh, ref long[] recId, [System.Xml.Serialization.XmlElementAttribute(DataType="base64Binary")] ref byte[] status) {
            object[] results = this.Invoke("SendSms", new object[] {
                        username,
                        password,
                        to,
                        from,
                        text,
                        isflash,
                        udh,
                        recId,
                        status});
            recId = ((long[])(results[1]));
            status = ((byte[])(results[2]));
            return ((int)(results[0]));
        }
        
        /// <remarks/>
        public void SendSmsAsync(string username, string password, string[] to, string from, string text, bool isflash, string udh, long[] recId, byte[] status) {
            this.SendSmsAsync(username, password, to, from, text, isflash, udh, recId, status, null);
        }
        
        /// <remarks/>
        public void SendSmsAsync(string username, string password, string[] to, string from, string text, bool isflash, string udh, long[] recId, byte[] status, object userState) {
            if ((this.SendSmsOperationCompleted == null)) {
                this.SendSmsOperationCompleted = new System.Threading.SendOrPostCallback(this.OnSendSmsOperationCompleted);
            }
            this.InvokeAsync("SendSms", new object[] {
                        username,
                        password,
                        to,
                        from,
                        text,
                        isflash,
                        udh,
                        recId,
                        status}, this.SendSmsOperationCompleted, userState);
        }
        
        private void OnSendSmsOperationCompleted(object arg) {
            if ((this.SendSmsCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.SendSmsCompleted(this, new SendSmsCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/GetCredit", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public double GetCredit(string username, string password) {
            object[] results = this.Invoke("GetCredit", new object[] {
                        username,
                        password});
            return ((double)(results[0]));
        }
        
        /// <remarks/>
        public void GetCreditAsync(string username, string password) {
            this.GetCreditAsync(username, password, null);
        }
        
        /// <remarks/>
        public void GetCreditAsync(string username, string password, object userState) {
            if ((this.GetCreditOperationCompleted == null)) {
                this.GetCreditOperationCompleted = new System.Threading.SendOrPostCallback(this.OnGetCreditOperationCompleted);
            }
            this.InvokeAsync("GetCredit", new object[] {
                        username,
                        password}, this.GetCreditOperationCompleted, userState);
        }
        
        private void OnGetCreditOperationCompleted(object arg) {
            if ((this.GetCreditCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.GetCreditCompleted(this, new GetCreditCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/GetDelivery", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public byte GetDelivery(long recId) {
            object[] results = this.Invoke("GetDelivery", new object[] {
                        recId});
            return ((byte)(results[0]));
        }
        
        /// <remarks/>
        public void GetDeliveryAsync(long recId) {
            this.GetDeliveryAsync(recId, null);
        }
        
        /// <remarks/>
        public void GetDeliveryAsync(long recId, object userState) {
            if ((this.GetDeliveryOperationCompleted == null)) {
                this.GetDeliveryOperationCompleted = new System.Threading.SendOrPostCallback(this.OnGetDeliveryOperationCompleted);
            }
            this.InvokeAsync("GetDelivery", new object[] {
                        recId}, this.GetDeliveryOperationCompleted, userState);
        }
        
        private void OnGetDeliveryOperationCompleted(object arg) {
            if ((this.GetDeliveryCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.GetDeliveryCompleted(this, new GetDeliveryCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/GetInboxCount", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public int GetInboxCount(string username, string password, bool isRead) {
            object[] results = this.Invoke("GetInboxCount", new object[] {
                        username,
                        password,
                        isRead});
            return ((int)(results[0]));
        }
        
        /// <remarks/>
        public void GetInboxCountAsync(string username, string password, bool isRead) {
            this.GetInboxCountAsync(username, password, isRead, null);
        }
        
        /// <remarks/>
        public void GetInboxCountAsync(string username, string password, bool isRead, object userState) {
            if ((this.GetInboxCountOperationCompleted == null)) {
                this.GetInboxCountOperationCompleted = new System.Threading.SendOrPostCallback(this.OnGetInboxCountOperationCompleted);
            }
            this.InvokeAsync("GetInboxCount", new object[] {
                        username,
                        password,
                        isRead}, this.GetInboxCountOperationCompleted, userState);
        }
        
        private void OnGetInboxCountOperationCompleted(object arg) {
            if ((this.GetInboxCountCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.GetInboxCountCompleted(this, new GetInboxCountCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/getMessages", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public MessagesBL[] getMessages(string username, string password, int location, string from, int index, int count) {
            object[] results = this.Invoke("getMessages", new object[] {
                        username,
                        password,
                        location,
                        from,
                        index,
                        count});
            return ((MessagesBL[])(results[0]));
        }
        
        /// <remarks/>
        public void getMessagesAsync(string username, string password, int location, string from, int index, int count) {
            this.getMessagesAsync(username, password, location, from, index, count, null);
        }
        
        /// <remarks/>
        public void getMessagesAsync(string username, string password, int location, string from, int index, int count, object userState) {
            if ((this.getMessagesOperationCompleted == null)) {
                this.getMessagesOperationCompleted = new System.Threading.SendOrPostCallback(this.OngetMessagesOperationCompleted);
            }
            this.InvokeAsync("getMessages", new object[] {
                        username,
                        password,
                        location,
                        from,
                        index,
                        count}, this.getMessagesOperationCompleted, userState);
        }
        
        private void OngetMessagesOperationCompleted(object arg) {
            if ((this.getMessagesCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.getMessagesCompleted(this, new getMessagesCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/ScheduleSms", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public int ScheduleSms(string username, string password, string to, string from, string text, bool isflash, System.DateTime scheduleDateTime, PeriodType period) {
            object[] results = this.Invoke("ScheduleSms", new object[] {
                        username,
                        password,
                        to,
                        from,
                        text,
                        isflash,
                        scheduleDateTime,
                        period});
            return ((int)(results[0]));
        }
        
        /// <remarks/>
        public void ScheduleSmsAsync(string username, string password, string to, string from, string text, bool isflash, System.DateTime scheduleDateTime, PeriodType period) {
            this.ScheduleSmsAsync(username, password, to, from, text, isflash, scheduleDateTime, period, null);
        }
        
        /// <remarks/>
        public void ScheduleSmsAsync(string username, string password, string to, string from, string text, bool isflash, System.DateTime scheduleDateTime, PeriodType period, object userState) {
            if ((this.ScheduleSmsOperationCompleted == null)) {
                this.ScheduleSmsOperationCompleted = new System.Threading.SendOrPostCallback(this.OnScheduleSmsOperationCompleted);
            }
            this.InvokeAsync("ScheduleSms", new object[] {
                        username,
                        password,
                        to,
                        from,
                        text,
                        isflash,
                        scheduleDateTime,
                        period}, this.ScheduleSmsOperationCompleted, userState);
        }
        
        private void OnScheduleSmsOperationCompleted(object arg) {
            if ((this.ScheduleSmsCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.ScheduleSmsCompleted(this, new ScheduleSmsCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        public new void CancelAsync(object userState) {
            base.CancelAsync(userState);
        }
        
        private bool IsLocalFileSystemWebService(string url) {
            if (((url == null) 
                        || (url == string.Empty))) {
                return false;
            }
            System.Uri wsUri = new System.Uri(url);
            if (((wsUri.Port >= 1024) 
                        && (string.Compare(wsUri.Host, "localHost", System.StringComparison.OrdinalIgnoreCase) == 0))) {
                return true;
            }
            return false;
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.0.30319.1")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://tempuri.org/")]
    public partial class MessagesBL : BaseBL {
        
        private long msgIDField;
        
        private int userIDField;
        
        private int linkIDField;
        
        private int numberIDField;
        
        private byte msgTypeField;
        
        private string bodyField;
        
        private string udhField;
        
        private System.DateTime sendDateField;
        
        private string senderField;
        
        private string receiverField;
        
        private int firstLocationField;
        
        private int currentLocationField;
        
        private int partsField;
        
        private bool isFlashField;
        
        private bool isReadField;
        
        private bool isUnicodeField;
        
        private double creditField;
        
        private int moduleField;
        
        private int recCountField;
        
        private int recFailedField;
        
        private int recSuccessField;
        
        /// <remarks/>
        public long MsgID {
            get {
                return this.msgIDField;
            }
            set {
                this.msgIDField = value;
            }
        }
        
        /// <remarks/>
        public int UserID {
            get {
                return this.userIDField;
            }
            set {
                this.userIDField = value;
            }
        }
        
        /// <remarks/>
        public int LinkID {
            get {
                return this.linkIDField;
            }
            set {
                this.linkIDField = value;
            }
        }
        
        /// <remarks/>
        public int NumberID {
            get {
                return this.numberIDField;
            }
            set {
                this.numberIDField = value;
            }
        }
        
        /// <remarks/>
        public byte MsgType {
            get {
                return this.msgTypeField;
            }
            set {
                this.msgTypeField = value;
            }
        }
        
        /// <remarks/>
        public string Body {
            get {
                return this.bodyField;
            }
            set {
                this.bodyField = value;
            }
        }
        
        /// <remarks/>
        public string Udh {
            get {
                return this.udhField;
            }
            set {
                this.udhField = value;
            }
        }
        
        /// <remarks/>
        public System.DateTime SendDate {
            get {
                return this.sendDateField;
            }
            set {
                this.sendDateField = value;
            }
        }
        
        /// <remarks/>
        public string Sender {
            get {
                return this.senderField;
            }
            set {
                this.senderField = value;
            }
        }
        
        /// <remarks/>
        public string Receiver {
            get {
                return this.receiverField;
            }
            set {
                this.receiverField = value;
            }
        }
        
        /// <remarks/>
        public int FirstLocation {
            get {
                return this.firstLocationField;
            }
            set {
                this.firstLocationField = value;
            }
        }
        
        /// <remarks/>
        public int CurrentLocation {
            get {
                return this.currentLocationField;
            }
            set {
                this.currentLocationField = value;
            }
        }
        
        /// <remarks/>
        public int Parts {
            get {
                return this.partsField;
            }
            set {
                this.partsField = value;
            }
        }
        
        /// <remarks/>
        public bool IsFlash {
            get {
                return this.isFlashField;
            }
            set {
                this.isFlashField = value;
            }
        }
        
        /// <remarks/>
        public bool IsRead {
            get {
                return this.isReadField;
            }
            set {
                this.isReadField = value;
            }
        }
        
        /// <remarks/>
        public bool IsUnicode {
            get {
                return this.isUnicodeField;
            }
            set {
                this.isUnicodeField = value;
            }
        }
        
        /// <remarks/>
        public double Credit {
            get {
                return this.creditField;
            }
            set {
                this.creditField = value;
            }
        }
        
        /// <remarks/>
        public int Module {
            get {
                return this.moduleField;
            }
            set {
                this.moduleField = value;
            }
        }
        
        /// <remarks/>
        public int RecCount {
            get {
                return this.recCountField;
            }
            set {
                this.recCountField = value;
            }
        }
        
        /// <remarks/>
        public int RecFailed {
            get {
                return this.recFailedField;
            }
            set {
                this.recFailedField = value;
            }
        }
        
        /// <remarks/>
        public int RecSuccess {
            get {
                return this.recSuccessField;
            }
            set {
                this.recSuccessField = value;
            }
        }
    }
    
    /// <remarks/>
    [System.Xml.Serialization.XmlIncludeAttribute(typeof(MessagesBL))]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.0.30319.1")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://tempuri.org/")]
    public partial class BaseBL {
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.0.30319.1")]
    [System.SerializableAttribute()]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://tempuri.org/")]
    public enum PeriodType {
        
        /// <remarks/>
        Once,
        
        /// <remarks/>
        Daily,
        
        /// <remarks/>
        Weekly,
        
        /// <remarks/>
        Monthly,
        
        /// <remarks/>
        Yearly,
        
        /// <remarks/>
        Custom,
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void SendSmsCompletedEventHandler(object sender, SendSmsCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class SendSmsCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal SendSmsCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public int Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((int)(this.results[0]));
            }
        }
        
        /// <remarks/>
        public long[] recId {
            get {
                this.RaiseExceptionIfNecessary();
                return ((long[])(this.results[1]));
            }
        }
        
        /// <remarks/>
        public byte[] status {
            get {
                this.RaiseExceptionIfNecessary();
                return ((byte[])(this.results[2]));
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void GetCreditCompletedEventHandler(object sender, GetCreditCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class GetCreditCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal GetCreditCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public double Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((double)(this.results[0]));
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void GetDeliveryCompletedEventHandler(object sender, GetDeliveryCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class GetDeliveryCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal GetDeliveryCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public byte Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((byte)(this.results[0]));
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void GetInboxCountCompletedEventHandler(object sender, GetInboxCountCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class GetInboxCountCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal GetInboxCountCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public int Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((int)(this.results[0]));
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void getMessagesCompletedEventHandler(object sender, getMessagesCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class getMessagesCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal getMessagesCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public MessagesBL[] Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((MessagesBL[])(this.results[0]));
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void ScheduleSmsCompletedEventHandler(object sender, ScheduleSmsCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class ScheduleSmsCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal ScheduleSmsCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public int Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((int)(this.results[0]));
            }
        }
    }
}

#pragma warning restore 1591