function ShowMoreNewsInfo(newsID)
{
	window.location = "NewsDetails.html?NewsID=" + newsID;
}

function LoadTopNews(count){
	
    $.ajax({
        type:'GET',
        url:ServerURL + "Account/GetNews",
        dataType:'json',
		data: { n : count },
        success:function (result) {
			alert(result.Message);},
		error: function(){},
		async: true
		});
}
