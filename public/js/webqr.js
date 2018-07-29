// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com
//
// Adaptation by JCN for QR party

console.log("Loading webqr.js")

var gCtx = null;
var gCanvas = null;
var imageData = null;
var c=0;
var stype=0;
var gUM=false;
var webkit=false;
var v=null;

var camhtml='<object  id="iembedflash" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" width="320" height="240"> '+
  		    '<param name="movie" value="camcanvas.swf" />'+
  		    '<param name="quality" value="high" />'+
		    '<param name="allowScriptAccess" value="always" />'+
  		    '<embed  allowScriptAccess="always"  id="embedflash" src="camcanvas.swf" quality="high" width="320" height="240" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" mayscript="true"  />'+
            '</object>';

var imghtml='<div id="qrfile"><canvas id="out-canvas" width="320" height="240"></canvas>'+
    '<div id="imghelp">drag and drop a QRCode here'+
	'<br>or select a file'+
	'<input type="file" onchange="handleFiles(this.files)"/>'+
	'</div>'+
'</div>';

var vidhtml = '<video id="v" autoplay></video>';

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}
function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  if(files.length>0)
  {
	handleFiles(files);
  }
  else
  if(dt.getData('URL'))
  {
	qrcode.decode(dt.getData('URL'));
  }
}

function handleFiles(f)
{
	var o=[];
	
	for(var i =0;i<f.length;i++)
	{
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

			qrcode.decode(e.target.result);
        };
        })(f[i]);
        reader.readAsDataURL(f[i]);	
    }
}

function initCanvas(ww,hh)
{
    gCanvas = document.getElementById("qr-canvas");
    var w = ww;
    var h = hh;
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
    imageData = gCtx.getImageData( 0,0,320,240);
}

function passLine(stringPixels) { 

    var coll = stringPixels.split("-");

    for(var i=0;i<320;i++) { 
        var intVal = parseInt(coll[i]);
        r = (intVal >> 16) & 0xff;
        g = (intVal >> 8) & 0xff;
        b = (intVal ) & 0xff;
        imageData.data[c+0]=r;
        imageData.data[c+1]=g;
        imageData.data[c+2]=b;
        imageData.data[c+3]=255;
        c+=4;
    } 

    if(c>=320*240*4) { 
        c=0;
        gCtx.putImageData(imageData, 0,0);
        try{
            qrcode.decode();
        }
        catch(e){       
            console.log(e);
            setTimeout(captureToCanvas, 500);
        };
    } 
} 

function captureToCanvas() {
    if(stype!=1)
        return;
    if(gUM)
    {
        gCtx.drawImage(v,0,0);
        try{
            qrcode.decode();
        }
        catch(e){       
            console.log(e);
            setTimeout(captureToCanvas, 500);
        };
    }
    else
    {
        flash = document.getElementById("embedflash");
        try{
            flash.ccCapture();
        }
        catch(e)
        {
            console.log(e);
            setTimeout(captureToCanvas, 1000);
        }
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;' );
}



//
// JC
//

function read(a)
{


    var html="<br>";
    /*
    if(a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html+="<a target='_blank' href='"+a+"'>"+a+"</a><br>";
    html+="<b>"+htmlEntities(a)+"</b><br><br>";
    */
    
    //document.getElementById("result").innerHTML= 'Voted '+html ;

    //lightning();
    //document.bgColor='red';
   // document.getElementById(obj).style.backgroundColor = "red";

   // alert(a);    

   // document.getElementById(obj).style.backgroundColor = "red";

        //d3.json('/vote/test/'+a, function(data) {
	d3.json('/vote/'+partytag+'/'+a, function(data) {
	      
		if (data.vote == "allready")
		{
		  //alert( 'allready' );
		  //lightning();
		  d3.select("body").style("background-color", "#444444");
		  setTimeout(function(){ d3.select("body").style("background-color", "#000000"); setwebcam(); }, 2000);
		  
	          //setwebcam();	  
		}
		if (data.vote == "voted")
		{
                  d3.select("body").style("background-color", "darkgreen");
                  setTimeout(function(){ d3.select("body").style("background-color", "#000000"); setwebcam(); }, 3000);
		  //alert( 'new' );
		  //setwebcam();
		}
		//alert( data.vote );
		
	});


	// get
	//httpGet('/vote/test/123/1');     
   
    //alert('ok1');
   // loop: be reader for another cam   
    //setwebcam();
}	

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    if(webkit)
        v.src = window.webkitURL.createObjectURL(stream);
    else
        v.src = stream;
    gUM=true;
    setTimeout(captureToCanvas, 500);
}
		
function error(error) {
    gUM=false;
    return;
}

function load()
{
	if(isCanvasSupported() && window.File && window.FileReader)
	{
		initCanvas(800,600);
		qrcode.callback = read;
		document.getElementById("mainbody").style.display="inline";
	}
	else
	{
		document.getElementById("mainbody").style.display="inline";
		document.getElementById("mainbody").innerHTML='<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>'+
        '<br><p id="mp2">sorry your browser is not supported</p><br><br>'+
        '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
	}
}



function setwebcam() {
	
    if (stype==1) {
        setTimeout(captureToCanvas, 500);    
        return;
    }

    var n=navigator;

    if(n.getUserMedia) {
        document.getElementById("outdiv").innerHTML = vidhtml;
        v=document.getElementById("v");
        n.getUserMedia({video: true, audio: false}, success, error);
    }
    else
    if(n.webkitGetUserMedia) {
        document.getElementById("outdiv").innerHTML = vidhtml;
        v=document.getElementById("v");
        webkit=true;
        n.webkitGetUserMedia({video: true, audio: false}, success, error);
    } else if(n.mozGetUserMedia) {
        document.getElementById("outdiv").innerHTML = vidhtml;
        v=document.getElementById("v");
        n.mozGetUserMedia({video: true, audio: false}, success, error);
    } else
    document.getElementById("outdiv").innerHTML = camhtml;
    //document.getElementById("qrimg").src="qrimg2.png";
    //document.getElementById("webcamimg").src="webcam.png";
    stype=1;
    setTimeout(captureToCanvas, 500);
}


function setimg()
{
	document.getElementById("result").innerHTML="";
    if(stype==2)
        return;
    document.getElementById("outdiv").innerHTML = imghtml;
    document.getElementById("qrimg").src="qrimg.png";
    document.getElementById("webcamimg").src="webcam2.png";
    var qrfile = document.getElementById("qrfile");
    qrfile.addEventListener("dragenter", dragenter, false);  
    qrfile.addEventListener("dragover", dragover, false);  
    qrfile.addEventListener("drop", drop, false);
    stype=2;
}

function PlaySound(soundObj) {
  var sound = document.getElementById(soundObj);
  sound.Play();
}


