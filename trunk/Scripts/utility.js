function validEmail(v) {
	if(v == null || v == undefined)
		return false;
    var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return (v.match(r) == null) ? false : true;
}// JavaScript Document

function GetCurrentPersianDayString()
{
	var d;
	d = new Date();
	var day = d.getJalaliDay();
	switch(day)
	{
		case 0:
			return "شنبه";
		case 1:
			return "یکشنبه";
		case 2:
			return "دوشنبه";
		case 3:
			return "سه‌شنبه";
		case 4:
			return "چهارشنبه";
		case 5:
			return "پنجشنبه";
		case 6:
			return "جمعه";
		default:
			return day;
	}
}

function GetCurrentPersianMonth()
{
	var d;
	d = new Date();
	return d.getJalaliMonth();
}


function GetCurrentPersianMonthString()
{
	var d;
	d = new Date();
	var _month;
	switch(d.getJalaliMonth())
	{
		case 0:
			_month = "فروردین";
			break;
		case 1:
			_month =  "اردیبهشت";
			break;
		case 2:
			_month =  "خرداد";
			break;
		case 3:
			_month =  "تیر";
			break;
		case 4:
			_month =  "مرداد";
			break;
		case 5:
			_month =  "شهریور";
			break;
		case 6:
			_month =  "مهر";
			break;
		case 7:
			_month =  "آبان";
			break;
		case 8:
			_month =  "آذر";
			break;
		case 9:
			_month =  "دی";
			break;
		case 10:
			_month =  "بهمن";
			break;
		case 11:
			_month =  "اسفند";
			break;
	}

	return _month;
}

function GetCurrentPersianYear()
{
	var d;
	d = new Date();
	return d.getJalaliFullYear();
}

function GetCurrentPersianDayOfMonth()
{
	var d;
	d = new Date();
	return d.getJalaliDate();
}