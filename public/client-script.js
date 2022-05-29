'use strict';

// hämtar socket io genom html script taggen
// io() används för client-side
const socket = io();

// referenser till html-element för DOM manipulering
let form = document.querySelector('form');
let nickName = document.querySelector('#nickname');
let btn = document.querySelector('a');
let message = document.querySelector('#msg');
let usr = document.querySelector('#usr');
let flow = document.querySelector('#flow');

window.addEventListener('load', function() {
	// validerar formuläret
	if (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (nickName.value.length < 3) {
				console.log("För få bokstäver");
				return;
			} else {
				// skapar kaka för att innehålla nickname värdet
				form.submit();
			}
		});
	}

	// lyssnar efter "skriv inlögg" knappen och validerar
	btn.addEventListener('click', function(e) {
		if (message.value.length < 2) {
			console.log("För få bokstäver");
			return;
		}

		// skicka socket anrop med data till servern
		socket.emit('send-message', {
			'message': message.value,
			'user': usr.value
		});

		// tömmer fälten
		message.value = "";
		usr.value = '';

	});

	// klienten tar emot data från servern och skriver ut det i chattflödet
	socket.on('print-message', (data) => {
		// skapar p-tagg med rimligt textformat och lägger det i DOM:en
		let p = document.createElement('p');
		// Skapar span-element
		let span = document.createElement('span');

		// skapar textnoder för varje data block för att kunna specifikt styla de 
		let dateText = document.createTextNode(data.date);
		let nameText = document.createTextNode(` ${data.name}: `);
		let messageText = document.createTextNode(data.message);

		// Lägger till text-nod i span-elementet
		span.appendChild(nameText);
		// Gör span-elementet till bold
		span.style.fontWeight = 'bold';

		// Lägger till alla noder till p-taggen
		p.appendChild(dateText);
		p.appendChild(span);
		p.appendChild(messageText);
		// Lägger till p-taggen till flow-section (chattflödet)
		flow.appendChild(p);
	});

	// extra: skriver ut en p-tagg när en användare ansluter till chatten
	socket.on('print-user', (user, namn) => {
		let p = document.createElement('p');
		let text = document.createTextNode(`Användaren ${namn} (${user}) är ansluten till chatten`);
		p.appendChild(text);
		flow.appendChild(p);
		p.style.color = "#aaa";
	})
});