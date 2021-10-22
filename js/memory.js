"use strict";

// CONSTRUCT CARD OBJECTS
class Card {
	constructor(cardObject) {
		this.card1 = cardObject.card1;
		this.card2 = cardObject.card2;
		this.set = cardObject.set;
		this.sound = cardObject.sound;
	}
}

// SELECT FIELD
const myField = document.querySelector('#field');
myField.addEventListener('click', onClickCard);

// FETCH ARRAY
let myCardArray
fetch('js/cards.json')
	.then(response => response.json())
	// CREATE ARRAY WITH CARD OBJECTS
	.then(data => {
		myCardArray = data.map(card => new Card(card));
	})

// SELECT DIFFICULTY SELECT ELEMENT
const difficulty = document.getElementById('difficulty');
// CHECK DIFFICULTY SETTING ON CHANGE
difficulty.addEventListener('change', onSelectFieldSize);

// DIFFICULTY CHANGED
function onSelectFieldSize(e) {
	let boardClass;
	let pairs;
	switch (e.target.value) {
		case '4':boardClass = 'board4';pairs = 8;break;
		case '5':boardClass = 'board5';pairs = 12;break;
		case '6':boardClass = 'board6';pairs = 18;break;
	}
	
	// SHUFFLE ARRAY
	const shuffled = shuffle(myCardArray);
	// SELECT WHICH PAIRS TO USE
	const subsetCardArray = shuffled.slice(0, pairs);
	// DOUBLE & SHUFFLE ARRAY
	const shuffledDblCardArray = shuffle([...subsetCardArray, ...subsetCardArray]);
	
	// CALL POPULATE FIELD
	populateField(boardClass, shuffledDblCardArray);
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

// FILL HTML WITH CARD ELEMENTS
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

// FLIP CARD
function onClickCard(e) {
	// SOME CHECK WHICH ISN'T NEEDED IF I PUT THE EVENTLISTENERS ON THE CARDS INSTEAD ON #FIELD
	if (e.target.className === 'covered') {
		e.target.className = 'uncovered';
//		console.log(e.target.parentNode.firstChild.getAttribute('name'));
//		console.log(e.target.parentNode.firstChild);
	} else if (e.target.className === 'uncovered') {// DELETE THIS <-------------------------------------------------------------- DELETE THIS
		e.target.className = 'covered';// DELETE THIS <-------------------------------------------------------------- DELETE THIS
	}
}