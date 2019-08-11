const allStopwatches = document.getElementById('all-stopwatches');
const template = document.getElementById('template');
const addStopwatchBtn = document.getElementById('add-stopwatch');
const removeAll = document.getElementById('remove-all');
const clearAll = document.getElementById('clear-all');
const dividerFinal = document.getElementById('divider-final');
let stopwatchArray = [];
let numStopwatches = 0;
let numIds = 0;
let dragged;

addStopwatchBtn.addEventListener('click', addStopwatch);
window.addEventListener('keydown', keyDownEvent);
removeAll.addEventListener('click', () => {
	while (stopwatchArray.length > 0) {
		removeStopwatch(stopwatchArray[0].stopwatch);
	}
	numIds = 0; //reset IDs, since there is no chance of conflict
});
clearAll.addEventListener('click', () => stopwatchArray.forEach(sw => clear(sw.stopwatch)));
addStopwatch();

setInterval(updateStopwatches, 10);

function addStopwatch() {
	let newStopwatch = template.cloneNode(true);
	newStopwatch.id = numIds.toString();

	let newKeybind = newStopwatch.querySelector('.keybind input');
	newKeybind.addEventListener('change', keybindChangeEvent);
	newKeybind.value = '';

	let newTimeButton = newStopwatch.querySelector('.time button');
	newTimeButton.addEventListener('click', clickTimeButtonEvent);

	let newName = newStopwatch.querySelector('.name');
	newName.value = 'Stopwatch ' + (numIds + 1);

	let newDelButton = newStopwatch.querySelector('.remove');
	newDelButton.addEventListener('click', e => removeStopwatch(e.target.parentNode.parentNode));

	let newClearButton = newStopwatch.querySelector('.clear');
	newClearButton.addEventListener('click', e => clear(e.target.parentNode));

	let newDivider = newStopwatch.querySelector('.divider');
	newStopwatch.addEventListener('dragover', e => {
		e.preventDefault();
	});
	newStopwatch.addEventListener('dragenter', e => {
		let dividerParent = e.target;
		while (!dividerParent.querySelector('.divider')) {
			dividerParent = dividerParent.parentNode;
		}
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount++;
		dividerParent.querySelector('.divider').style.visibility = 'visible';
	});
	newStopwatch.addEventListener('dragleave', e => {
		let dividerParent = e.target;
		while (!dividerParent.querySelector('.divider')) {
			dividerParent = dividerParent.parentNode;
		}
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount--;
		if (swObj.dropCount === 0) {
			dividerParent.querySelector('.divider').style.visibility = '';
		}
	})
	newStopwatch.addEventListener('dragstart', e => {
		let dividerParent = e.target;
		while (!dividerParent.querySelector('.divider')) {
			dividerParent = dividerParent.parentNode;
		}
		dragged = dividerParent;
	});
	newStopwatch.addEventListener('drop', e => {
		e.preventDefault();
		let dividerParent = e.target;
		while (!dividerParent.querySelector('.divider')) {
			dividerParent = dividerParent.parentNode;
		}
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount = 0;
		dividerParent.querySelector('.divider').style.visibility = '';
		if (dragged.id !== dividerParent.id) {
			dividerParent.parentNode.removeChild(dragged);
			dividerParent.parentNode.insertBefore(dragged, dividerParent);
		}
	});

	let newStopwatchObj = {id: numIds.toString(),
						name: newName.value,
						stopwatch: newStopwatch,
						keybind: '',
						timeButton: newTimeButton,
						prevTime: 0,
						startTime: 0,
						dropCount: 0,
						};
	stopwatchArray.push(newStopwatchObj);
	allStopwatches.insertBefore(newStopwatch, dividerFinal);
	numIds++;
	numStopwatches++;
}

function clear(sw) {
	let tb = sw.querySelector('.time button');
	tb.classList.remove('going');
	tb.textContent = '0.00';
}

function removeStopwatch(toRemove) {
	stopwatchArray.splice(stopwatchArray.findIndex(sw => toRemove.id === sw.id), 1);
	allStopwatches.removeChild(toRemove);
	numStopwatches--;
}

function clickTimeButtonEvent(e) {
	e.target.classList.toggle('going');
	let stopwatchObj = stopwatchArray.find(sw => e.target === sw.timeButton);
	if (stopwatchObj) {
		stopwatchObj.startTime = new Date();
		stopwatchObj.prevTime = stopwatchObj.timeButton.textContent;
	}
}

function updateStopwatches() {
	//get array of stopwatches that are currently going
	let going = stopwatchArray.filter(sw => sw.timeButton.classList.contains('going'));
	for (let i = 0; i < going.length; i++) { //update each stopwatch in array
		let dur = (new Date() - going[i].startTime) / 1000;
		going[i].timeButton.textContent = parseFloat(Math.round((+going[i].prevTime + dur) * 100) / 100).toFixed(2); //round to 2 decimal places
		//console.log(going[i].startTime);
	}
}

function keyDownEvent(e) {
	if (e.target.nodeName !== 'INPUT') { //do nothing if currently in a textbox
		//go through array to see if there is a stopwatch with this keybind
		let filtered = stopwatchArray.filter(sw => sw.keybind === e.key);
		if (filtered.length > 0) {
			filtered[0].timeButton.click();
		}
	}
}

function keybindChangeEvent(e) {
	if (e.target.value !== '') {	
		let stopwatchWithKeybind = stopwatchArray.find(sw => sw.keybind === e.target.value);
		if (stopwatchWithKeybind) {
			if (confirm('The stopwatch called ' + stopwatchWithKeybind.name + ' already has this keybind. Replace?')) {
				stopwatchWithKeybind.stopwatch.querySelector('.keybind input').value = '';
				stopwatchWithKeybind.keybind = '';
			} else {
				return;
			}
		}
	}
	stopwatchArray.find(sw => e.target.parentNode.parentNode.parentNode.id === sw.id).keybind = e.target.value;
}

//stopwatch array
//each stopwatch has:
/*
ID
keybind
time button
*/