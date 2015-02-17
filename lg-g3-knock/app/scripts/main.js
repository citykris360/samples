'use strict';

/* Language Setter */
var uiText = [];

// get url parameters
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


uiText['en'] = {
	'prompt_start': '<p>Watch the pattern and try to repeat it to unlock your phone!</p>',
	'play': 'Play',
	'you_try': '<p>Now you try!</p>',
	'win': '<h2>CONGRATS!</h2><p>You unlocked your phone, protected with the enhanced security of KnockCode &#8482;.</p>',
	'game_end_negative': '<h2>PROTECTING YOUR DATA.</h2><p>Your unique KnockCode &#8482; pattern helps to ensure your information stays safe and secure. Don’t worry though – if it’s not for you, you can always disable this feature in the device settings.</p>',
	'game_end_positive': '<h2>PROTECTING YOUR DATA.</h2><p>For enhanced security that you can access with a single hand, create a unique 3 to 8 point KnockCode™ pattern to help ensure your information stays safe and secure.</p>',
	'wrong': '<h2>TRY AGAIN!</h2><p>Your phone is safe and secure: watch the pattern closely and try to repeat it to unlock your phone!</p>'
};

uiText['es'] = {
	'prompt_start': '<p>¡Observa el patrón y trata de repetirlo para quitarle el seguro a tu teléfono!</p>',
	'play': 'Jugar',
	'you_try': '<p>¡Ahora tú!</p>',
	'win': '<h2>¡FELICIDADES!</h2><p>Has quitado el seguro de tu teléfono, protegido con la seguridad optimizada de KnockCode &#8482;.</p>',
	'game_end_negative': '<h2>PROTEGE TUS DATOS.</h2><p>Tu patrón KnockCode™ único te ayuda a que tu información permanezca segura y a salvo. No te preocupes, si no es para ti, puedes deshabilitar esta función en la configuración del aparato.</p>',
	'game_end_positive': '<h2>PROTEGE TUS DATOS.</h2><p>Para acceder con una sola mano a mayor seguridad, crea un patrón KnockCode™ único de 3 a 8 puntos que te ayuda a que tu información permanezca segura y a salvo.</p>',
	'wrong': '<h2>¡INTENTA DE NUEVO!</h2><p>Tu teléfono está seguro y a salvo: observa cuidadosamente el patrón ¡e intenta repetirlo para quitarle el seguro a tu teléfono!</p>'
};

/* KnockCode Generator */
function generateCode(step) {
	// get a random integer in range
	this.randomRange = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	// get a random array order
	this.randomArray = function(array) {
		var currentIndex = array.length,
				temporaryValue,
				randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	};

	var codeLength = step + 3;
	var order = new Array(codeLength);
	for (var i = 0, y = 0; i < codeLength; i++) {
		// after each sector is represented get random values
		if (y > 3) {
			order[i] = this.randomRange(0,3);
		} else {
			order[i] = y++;
		}
	}

	return this.randomArray(order);
}


var lang = getParameterByName("lang") || "en";

/* App Logic */
function App(success,fail) {
	// Get language parameter

	// the knockcode
	var code;
	// Set the default step
	this.step = 1;
	// Set the number of times the app has failed
	this.failCount = 0;
	// these are used by touch functions
	var times, touchX, touchY, movX, movY, go, validTouch, CorrectInRow;
	// nodes to be created for UI
	var element, notifyContainer, start, notify;
	// game node
	var game = document.getElementById('game');
	// container node
	var container = document.getElementById('container');
	// container children
	var children = Array.prototype.slice.call(document.getElementById('container').children);
	//console.log('the language is ' + lang);
	document.body.className = lang

	function touchPrevent(event){
		event.preventDefault();
	};
	// Fired when user first touches dvice
	function touchStart(event){
		times++;
		go = false;
		container.addEventListener("touchmove", touchPrevent, false);
		touchX = event.touches[0].pageX;
		touchY = event.touches[0].pageY;

		// Prep the touch element
		element = document.createElement('div');
		element.style.left = (touchX - 45) + 'px';
		element.style.top = (touchY - 45) + 'px';
		element.id = 'touch';

		console.log('touch times = '+times);
		console.log('you touched this node = '+children.indexOf(event.touches[0].target));
		// Determine the element validity
		if( code[times] === children.indexOf(event.touches[0].target) ) {
			element.className = 'valid color-' + children.indexOf(event.touches[0].target);
			validTouch = true;
		} else {
			element.className = 'invalid';
			validTouch = false
		}

		// Append the element
		document.body.appendChild(element);

	};
	// Fired when user drags finger on device
	function touchMove(event){
	//	console.log('move is firing');
		movX = event.touches[0].pageX - touchX;
		movY = event.touches[0].pageY - touchY;
		if(!go) {
			(Math.abs(movY) < Math.abs(movX)) ? go = true : stop(event);
		} else {
			//console.log('Mover');
		}
	};
	// Fired when user stops touching device
	function touchStop(event){
		container.removeEventListener("touchmove", touchPrevent, false);
		// Lets make sure this doesn't run too quickly
		if(!element) return;

		element.parentNode.removeChild(element);

		if(!validTouch){
			fail();
			return;
		};

		CorrectInRow++;
		if(CorrectInRow === code.length) {
			success();
		}

	};

	this.init = function(){

		// generate knockcode
		code = new generateCode(this.step);
		// convert screen to lock
		game.className = 'game';
		// deactivate start button event listener
		start.removeEventListener('click', runTime, false);
		// remove the notification container
		notifyContainer.parentNode.removeChild(notifyContainer);

		console.log('Hello Welcome to the App');
		console.log('You are currently on level ' + this.step);
		console.log('For reference the KnockCode = ' + code);
	};
	this.eventsOn = function(){
		times = -1;
		CorrectInRow = 0;
		container.addEventListener("touchstart", touchStart, true);
		container.addEventListener("touchmove", touchMove, true);
		container.addEventListener("touchend", touchStop, true);
		container.addEventListener("touchleave", touchStop, true);
		//container.addEventListener("touchcancel", stop, true);
		console.log('Touch is initiated');
	};
	this.eventsOff = function(){
		container.removeEventListener("touchstart", touchStart, true);
		container.removeEventListener("touchmove", touchMove, true);
		container.removeEventListener("touchend", touchStop, true);
		container.removeEventListener("touchleave", touchStop, true);
		//container.removeEventListener("touchcancel", stop, true);
		console.log('Touch is deactivated');
	};
	this.prompt = function(){
		// construct notify div
		notifyContainer = document.createElement('div');
		notify = document.createElement('div');
		notifyContainer.id = 'notify';
		notify.className = 'text';

		// action button
		start = document.createElement('div');
		start.id = 'start';

		// set play button text
		if (this.step > 1) {
			start.innerHTML = 'Play Round ' + app.step;
			notify.innerHTML = uiText[lang].win;
			game.className = 'game complete';
		} else {
			start.innerHTML = uiText[lang].play;
			notify.innerHTML = uiText[lang].prompt_start;
		}
		// Append prompt container
		game.appendChild(notifyContainer);
		// Append the prompt
		notifyContainer.appendChild(notify);
		// Append start button
		notifyContainer.appendChild(start);
		// turn on button listener
		start.className = '';
		start.addEventListener('click', runTime, false);

	};
	this.timeMessage = function(message, time, callBack){

		// construct notify div
		notifyContainer = document.createElement('div');
		notify = document.createElement('div');
		notifyContainer.id = 'notify';
		notify.className = 'text';
		notify.innerHTML = message;

		// Append prompt container
		game.appendChild(notifyContainer);
		// Append the prompt
		notifyContainer.appendChild(notify);

		var timeout = setTimeout(function(){
			notifyContainer.parentNode.removeChild(notifyContainer);
			callBack();
		}, time);

	};
	this.setup = function(){
		// Set the default step
		this.step = 1;
		// Set the number of times the app has failed
		this.failCount = 0;

	};
	// Demo the code for the user
	this.demo = function(callBack){
		var c = 0;
		var length = code.length;
		function interval(){
			// create element
			var element = document.createElement('div');
			element.id = 'touch';
			element.className = 'color-'+code[c];
			// append element
			container.children[code[c]].appendChild(element);

			c++;
			// delete element
			var timeout = setTimeout(function(){
				element.parentNode.removeChild(element);
				// If it's time - callback!
				if(c === code.length)
					callBack();
			}, 500);

			// clear timeout
			if(c === code.length) {
				clearInterval(interval);
				return;
			}
		}

		interval();
		var interval = setInterval(interval, 1000);
	};

}


// create a new app
var app = new App(runTimeSuccess, runTimeFail);

// let's get things setup
app.setup();
// create the level button
app.prompt();

// start/restart the app
function runTime(){
	// turn it on
	app.init();
	// demo the knockCode, then enable touch listener
	app.demo(function(){
		app.timeMessage(uiText[lang].you_try, 1500, function(){
			// enable click events
			app.eventsOn();
		});
	});


};

// progress experience to next step
function runTimeSuccess(){
	console.log('You completed step ' + app.step)

	// forgive any previous failures
	app.failCount = 0;
	// turn off click events
	app.eventsOff();
	// progress to next step
	app.step++;

	if (app.step < 4) {
		// Create prompt to continue to next level
		app.prompt();
	} else {
		game.className = 'game complete';
		app.timeMessage(uiText[lang].game_end_positive, 3000, function(){
			// convert screen to lock
			game.className = 'game';
			app.setup();
			app.prompt();
		});
	}
}

// restart experience
function runTimeFail() {
	// Add to fails
	app.failCount++;
	// turn off click events
	app.eventsOff();

	if(app.failCount < 3) {
		app.timeMessage(uiText[lang].wrong, 2000, function(){
			// demo the knockCode, then enable touch listener
			app.demo(function(){
				app.eventsOn();
			});
		});
	} else {
		app.timeMessage(uiText[lang].game_end_negative, 4000, function(){
			app.setup();
			app.prompt();
		});
	}

};
