var jsondat = [];
var sec = 0;
function mapstoCSV(post, title){
	$("button").prop('disabled', true);
	$.get("https://api.reddit.com/r/TagPro/comments/" + post, function( data ) {
		console.log(data[0].data.children[0].data.permalink);
		var postlink = data[0].data.children[0].data.permalink.slice(0, -1);
		var postitle = postlink.substring(postlink.lastIndexOf("/"), postlink.length);
		data[1].data.children.forEach(function(item, idx){
			console.log(item);
			console.log(idx)
			// Check if comment is a submission
			if(item.kind === "t1" && item.data.body.split("\n\n").length > 3){
				item.data.body = item.data.body.split("\n\n");
				var title = item.data.body[0].replace("**Title:** ", "").replace("\n","");
				var type = item.data.body[1].replace("**Type:** ", "").replace("\n","");
				var map = item.data.body[2].replace("**Map:** ", "").replace("\n","");
				//check if Description has been added
				if(item.data.body[4] !== undefined){
					var preview = item.data.body[3].replace("**Preview:** ", "").replace("\n","");
					var description = item.data.body[4].replace("**Description:** ", "").replace("\n","");
				} else {
					var preview = item.data.body[3].replace("**Preview:** ", "").replace("\n","");
					var description = "None";
				}
				var text = title+" | "+type+" | "+map+" | "+preview+" | "+description;
				// push the submission
				jsondat.push({"Title": title,"reddit_name": item.data.author,"Type": type,"Map": map,"Preview": preview,"Description": description})
			} else if(item.kind === "more"){
				
				console.log("wut")
				item.data.children.forEach(function(item){
					sec += 25
					$.get("https://api.reddit.com/r/TagPro/comments/" + post + postitle + item, function( data ){
						console.log(data[1].data.children[0].data);
						// Check if comment is a submission
						if(data[1].data.children[0].data.body.split("\n\n").length > 3){
							data[1].data.children[0].data.body = data[1].data.children[0].data.body.split("\n\n");
							var title = data[1].data.children[0].data.body[0].replace("**Title:** ", "").replace("\n","");
							var type = data[1].data.children[0].data.body[1].replace("**Type:** ", "").replace("\n","");
							var map = data[1].data.children[0].data.body[2].replace("**Map:** ", "").replace("\n","");
							//check if Description has been added
							if(data[1].data.children[0].data.body[4] !== undefined){
								var preview = data[1].data.children[0].data.body[3].replace("**Preview:** ", "").replace("\n","");
								var description = data[1].data.children[0].data.body[4].replace("**Description:** ", "").replace("\n","");
							} else {
								var preview = data[1].data.children[0].data.body[3].replace("**Preview:** ", "").replace("\n","");
								var description = "None";
							}
							var text = title+" | "+type+" | "+map+" | "+preview+" | "+description;
							console.log(text);
							// push the submission
							jsondat.push({"Title": title,"Reddit_name": data[1].data.children[0].data.author,"Type": type,"Map": map,"Preview": preview,"Description": description});
						}
					})
				});
			}
		});
	}).done(function() {
		setTimeout(function(){
			console.log(jsondat);
			JSONToCSVConvertor(jsondat, title + "_" + post,true);
			$("button").prop('disabled', true);
		}, sec);
	});
}

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
