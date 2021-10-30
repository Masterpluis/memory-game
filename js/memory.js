"use strict";
// FIND OR ASK AND SAVE USERNAME IN LOCAL STORAGE
let username;
if (!window.localStorage) {
	alert("Cannot save username: localStorage is not supported");
} else if (localStorage.activeUser) {
	username = localStorage.activeUser;
	//alert("Welcome back " + username);
} else {
	while (!username) {
		username = prompt('What is your name?');
	}
	localStorage.activeUser = username;
	alert("Welcome " + username);
}

let userData;
if (window.localStorage) {
	// CREATE DEFAULT USER DATA OBJECT IF USER IS NEW
	if (!localStorage[username.toLowerCase()]) {
		localStorage[username.toLowerCase()] = JSON.stringify({"easy":{"highscore": "", "time": ""},"normal":{"highscore": "", "time": ""},"hard":{"highscore": "", "time": ""}});
	}
	// GET USER DATA FROM LOCAL STORAGE
	userData = JSON.parse(localStorage[username.toLowerCase()]);
}

// FETCH ARRAY
let myCardArray;
fetch('js/cards.json')
.then(response => response.json())
// CREATE ARRAY WITH CARD OBJECTS
.then(data => {
	myCardArray = data.map(card => new Card(card));
})

// CONSTRUCT CARD OBJECTS
class Card {
	constructor(cardObject) {
		this.card1 = cardObject.card1;
		this.card2 = cardObject.card2;
		this.set = cardObject.set;
		this.sound = cardObject.sound;
	}
}

// SELECT DIFFICULTY SELECT ELEMENT
const difficulty = document.getElementById('difficulty');
// CHECK DIFFICULTY SETTING ON CHANGE
difficulty.addEventListener('change', onSelectFieldSize);

// SELECT FIELD SIZE BASED ON DIFFICULTY
let pairs;
function onSelectFieldSize(e) {
	let boardClass;
	switch (e.target.value) {
		case 'easy':boardClass = 'board4';pairs = 8;break;
		case 'normal':boardClass = 'board5';pairs = 12;break;
		case 'hard':boardClass = 'board6';pairs = 18;break;
	}
	
	// SHUFFLE ARRAY
	const shuffled = shuffle(myCardArray);
	// SELECT WHICH PAIRS TO USE
	const subsetCardArray = shuffled.slice(0, pairs);
	// DOUBLE & SHUFFLE ARRAY
	const shuffledDblCardArray = shuffle([...subsetCardArray, ...subsetCardArray]);
	
	// FILL FIELD
	populateField(boardClass, shuffledDblCardArray);

	// RESET VALUES OF PREVIOUS GAME. WHAT THEY DO IS EXPLAINED LATER
	resetGame()
}

// SHUFFLE ARRAY
function shuffle(array) {
	let l = array.length, r;
	while (l) {
		r = Math.floor(Math.random() * l--);
		[array[l],array[r]] = [array[r],array[l]];
	}
	return array;
}

// FILL FIELD WITH CARD TILES
const myField = document.querySelector('#field');
function populateField(boardClass, shuffledDblCardArray) {
	myField.innerHTML = "";
	shuffledDblCardArray.forEach((element) => {
		element = element.card1;
		const newTile = document.createElement('div');
		newTile.setAttribute("class", boardClass);
		const newCard = document.createElement('img');
		const imageURL = `img/${element}.jpg`;
		newCard.setAttribute('src', imageURL);
		newCard.setAttribute('name', element);
		const coveredCard = document.createElement('img');
		const coveredImageURL = `img/cover.png`;
		coveredCard.setAttribute('src', coveredImageURL);
		coveredCard.setAttribute('class', 'covered');
		newTile.appendChild(newCard);
		newTile.appendChild(coveredCard);
		myField.appendChild(newTile);
	});
}

function resetGame() {
	// STOP TIMER
	if (timerRuns === true) {
		clearInterval(runtimer);
		timerRuns = false;
	}

	// RESET STORED CARDS
	[a,b] = ["",""];
	
	// (RE)SET SCORE & COLLECTED PAIRS & TIME
	[score, collectedPairs, time] = [0,0,0];
	
	// RESET SCOREBOARD
	scoreboard.querySelector('#score').innerHTML = score;
	scoreboard.querySelector('#collected').innerHTML = collectedPairs;
	scoreboard.querySelector('#time').innerHTML = `${Math.floor(time/60)} min ${time%60} sec`;
}

// CHECK FOR CLICKS IN FIELD
myField.addEventListener('click', onClickCard);

// TELLS IF TIMER IS RUNNING
let timerRuns = false;

// KEEP SCORE
let score, collectedPairs;

// FLIP CARD
let a,b;
function onClickCard(e) {
	// CHECK IF CLICKED ELEMENT IS A COVERED CARD
	if (e.target.className === 'covered') {
		// START TIMER
		if (timerRuns === false) {
			timerRuns = true;
			timer();
		}	
		
		// SHOW ANIMAL
		e.target.className = 'uncovered';
		
		// PLAY SOUND OF SHOWED ANIMAL
		playAudio(e);
		
		// STORE CARDS THAT NEED TO BE EVALUATED
		if (!a){
			a = e.target;
		} else if (!b) {
			b = e.target;
			
			// STOP EVENT LISTENER
			myField.removeEventListener('click', onClickCard);
			
			setTimeout(() => {
				// EVALUATE STORED CARDS
				evaluateMatch();
				// RESET CLICKED CARDS STORAGE
				a = "";
				b = "";
				// RESUME EVENT LISTENER
				myField.addEventListener('click', onClickCard);
			}, 1800);	
			
			// ADD TO SCORE
			score++;
		}	
	}	
}	

// TIMER
let time, runtimer;
function timer() {
	runtimer = setInterval(() => {
		// ADD A SECOND
		time++;
		
		// UPDATE SCORE ON SCREEN
		showScore();
	}, 1000);
}

function playAudio(event) {
	const audio = new Audio('snd/'+ event.target.parentNode.firstChild.getAttribute('name') + '.wav');
	audio.volume = 0.2;
	audio.play();
}

let scoreboard = document.getElementById('scoreboard');
function showScore() {
	scoreboard.querySelector('#score').innerHTML = score;
	scoreboard.querySelector('#collected').innerHTML = collectedPairs;
	scoreboard.querySelector('#time').innerHTML = `${Math.floor(time/60)} min ${time%60} sec`;
}	

// EVALUATE STORED CARDS
function evaluateMatch() {
	if (a.parentNode.firstChild.getAttribute('name') === b.parentNode.firstChild.getAttribute('name')) {
		// REMOVE CARDS FROM PLAYING FIELD
		a.parentNode.classList.add('collected');
		b.parentNode.classList.add('collected');
		collectedPairs++;

		// CHECK IF ALL CARDS ARE COLLECTED
		if (collectedPairs === pairs) {
			// STOP TIMER
			clearInterval(runtimer);
			timerRuns = false;
			gameFinished();
		}	
	} else {
		// FLIP CARDS BACK
		a.className = "covered";
		b.className = "covered";
	}	
}	

function gameFinished() {
	// UPDATE HIGHSCORE IF SCORE IS BETTER
	if (!window.localStorage) {
		alert("Cannot save high score: localStorage is not supported");
	} else if (score < userData[difficulty.value].highscore || userData[difficulty.value].highscore === "") {
		userData[difficulty.value].highscore = score;
		userData[difficulty.value].time = `${Math.floor(time/60)} min ${time%60} sec`;
		localStorage[username.toLowerCase()] = JSON.stringify(userData);
	}
	
	// FILL FIELD WITH VICTORY SCREEN
	victoryScreen();
}

function victoryScreen() {
	myField.innerHTML = "";
	const newTile = document.createElement('div');
	newTile.setAttribute('id', 'victoryBox')
	const heading = document.createElement('h2');
	const hText = document.createTextNode("CONGRATULATIONS, YOU WON!");
	const highscores = document.createElement('p');
	const pText = document.createTextNode("Highscores:");
	heading.appendChild(hText);
	highscores.appendChild(pText);
	newTile.appendChild(heading);
	newTile.appendChild(highscores);
	myField.appendChild(newTile);

	// HIGHSCORE TABLE
	let t;
	t = document.createElement('table');
	for (let i = 0, r, c, difficulties = ["Easy", "Normal", "Hard"]; i < 3; i++) {
		r = t.insertRow(i);
		c = r.insertCell(0);
		c.innerHTML = difficulties[i];
		c = r.insertCell(1);
		if (userData[difficulties[i].toLowerCase()].highscore) {
			c.innerHTML = `Score: ${userData[difficulties[i].toLowerCase()].highscore}, time: ${userData[difficulties[i].toLowerCase()].time}`;
		} else {
			c.innerHTML = "No score yet";
		}
	}
	newTile.appendChild(t);
}