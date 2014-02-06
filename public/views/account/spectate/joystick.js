// main requestAnimFrame for all the animation
﻿window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 30);
    };
})();


var arrow = new VectorLED(0, 0, 0, 0);	// vector for LED direction

var touches; // collections of pointers

/////////////////////////////// ARDUINO SETUP 

// LED setup
//var led1; //-90 D
//var led2; //0 R
//var led3; //90 U
//var led4; //180=-180 L
var LEDloopON = false;

///////////////////////////// ARDUINO SETUP END

var username = "noname";	// for socket.io
var socket;					// for socket.io

document.addEventListener("DOMContentLoaded", init);


function init() {
    setupD3();
    touches = new Collection();
    onReady();
}

function onReady() {
////// jQuery for the socket.io
    // username input
        $('input[name=setUsername]').click(function(){
        	if($('input[name=usernameTxt]').val() != ""){
                username = $('input[name=usernameTxt]').val();
                    var msg = {type:'setUsername', user:username};
                    socket.json.send(msg);
                }
            $('#username').slideUp("slow",function(){
                $('#entergame').slideDown("slow");
            });
        });
        
    // chats and score postings        
        socket = new io.connect('http://171.65.102.132:3002');
        var chat = $('#chat');
        var board = $('#board');

        socket.on('connect', function() {
            console.log("Connected!");
            socket.emit('message', {channel:'realtime'});
        });
        
        socket.on('message', function(message){
		var str = message.split("&&");
		if (Number(str[0]))
		{
			chat.append(str[1] + '<br />');
		}else{
			var ledArray = str[1].split("^");
			arrow.int1 = ledArray[0];
			arrow.int2 = ledArray[1];
			arrow.int3 = ledArray[2];
			arrow.int4 = ledArray[3];
		}
        });
                
        socket.on('postscore', function(score){
                board.empty();
                for (var i=0;i<score.length;i++){
                        if(i==0){
                                board.append('<span style="color: #FA6600">'+ score[i][0]+'  :  '+score[i][1]+'</span> <br />');
                        }else{
                                board.append(score[i][0]+'  :  '+score[i][1]+ '<br />');
                        }
                }
                board.fadeOut('fast');
                board.fadeIn('fast');
                board.fadeOut('fast');
                board.fadeIn('fast');
        });

        socket.on('disconnect', function() {
                console.log('disconnected');
                chat.html("<b>Disconnected!</b>");
        });

        $("input[name=sendBtn]").click(function(){
                var msg = {type:'chat',message:username + " : " + $("input[name=chatTxt]").val()}
                socket.json.send(msg);
                $("input[name=chatTxt]").val("");
        });
}