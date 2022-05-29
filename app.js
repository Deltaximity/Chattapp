'use strict';

// 4 bibliotek. http, express, cookie-parser, socket.io
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const io = require('socket.io')(http);

app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

// lyssnar efter port 3001
http.listen(3001);

app.get('/', (req, res) => {
    // kontroll för cookies sker här
    if (req.cookies.nickName) {
        res.sendFile(__dirname + '/index.html');
	} else {
        res.sendFile(__dirname + '/loggain.html');
	}
});

// när en post sker på "/" skapas en cookie med nickname värdet
app.post('/', function(req, res){
	// skapar cookie
    res.cookie('nickName', req.body.nickname);
	// laddar in chattflödet
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	// Om kakan finns, anropa funktion för parsing av användarnamnet
	if(checkForNickname()) {
		// Parsar användarnamnet och sparar det returnerade värdet i variabel
		let nickname = checkForNickname();
		// Skickar data för att skriva ut varje individuellt användare ovanför chatten
		io.emit('print-user', socket.id, nickname);
	}
	
	// Tar emot anrop från klienten med data
    socket.on('send-message', (msg) => {

		// Parsar användarnamnet och sparar det returnerade värdet i variabel
		let namnet = checkForNickname();
		
		// genererar tidstämpel
		let date = new Date();
		date = new Intl.DateTimeFormat('sv-SE').format(date);
		
		if (msg.user === '') {
			// skickar ut data till alla klienter
			io.emit("print-message",{
				'message': msg.message,
				'name': namnet,
				'user': socket.id,
				'date': date
			});
		} else {
			// Skickar ut data till specifik klient
			io.to(msg.user).emit("print-message",{
				'message': msg.message,
				'name': namnet,
				'user': socket.id,
				'date': date
			});
		}
  	});

	// letar efter cookien "nickName" och returnerar värdet från den (allt parsat)
	function checkForNickname() {
		// hämtar cookie strängen
		let cookie = socket.handshake.headers.cookie;
		// om det finns inga kakor så avbryts funktionen
		if (!cookie) return false;
		// delar cookie strängen i delar
		cookie = cookie.split("; ");
		// letar efter cookie namnet "nickName"
		for (let i = 0; i < cookie.length; i++) {
			let nickname = cookie[i].split("=").shift();
			// om den hittas returneras värdet från den cookien, alltså "Johan" t.ex.
			if (nickname === "nickName") {
				return cookie[i].split('=').pop();
			}
		}
	}
});