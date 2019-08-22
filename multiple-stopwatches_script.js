//add multiple stopwatches at once, add macro keybinds, automatically fill in keyboard shortcuts

const allStopwatches = document.getElementById('all-stopwatches');
const template = document.getElementById('template');
const addStopwatchBtn = document.getElementById('add-stopwatch');
const removeAll = document.getElementById('remove-all');
const clearAll = document.getElementById('clear-all');
const addMacroDiv = document.getElementById('add-macro-div');
const addMacroBtn = document.getElementById('add-macro');
const addMacroInput = document.getElementById('add-macro-input');
const finalBlock = document.getElementById('0');
const sidebarList = document.querySelector('#sidebar ul')
let stopwatchArray = [];
let checkedObj = {};
let keybindObj = {};
let numStopwatches = 0;
let numIds = 1;
let dragged;

addStopwatchBtn.addEventListener('click', addStopwatch);
window.addEventListener('keydown', keyDownEvent);
removeAll.addEventListener('click', () => {
	let i = 0;
	while (i < stopwatchArray.length) {
		if (stopwatchArray[i].stopwatch) {
			removeStopwatch(stopwatchArray[i].stopwatch);
		} else {
			i++;
		}
	}
	numIds = 1; //reset IDs, since there is no chance of conflict
});
clearAll.addEventListener('click', () => stopwatchArray.forEach(sw => {
	if (sw.stopwatch) {
		clear(sw.stopwatch);
	}
}));
addMacroBtn.addEventListener('click', e => {
	if (addMacroDiv.classList.toggle('active')) {
		clearAll.disabled = 'true';
		removeAll.disabled = 'true';
		addStopwatchBtn.disabled = 'true';
	} else {
		clearAll.disabled = '';
		removeAll.disabled = '';
		addStopwatchBtn.disabled = '';
		addMacroKeybind();
		checkedObj = {};
		addMacroInput.value = '';
	}
	stopwatchArray.forEach(sw => {
		if (sw.stopwatch) {	
			let delButton = sw.stopwatch.querySelector('.remove');
			toggleMacroMode(delButton);
		}
	});
});
addDragEvents(finalBlock);
stopwatchArray.push({id: "0", dropCount: 0});
addStopwatch();

setInterval(updateStopwatches, 10);

function addStopwatch() {
	let newStopwatch = template.cloneNode(true);
	newStopwatch.id = numIds.toString();

	let newKeybind = newStopwatch.querySelector('.keybind input');
	newKeybind.addEventListener('change', keybindChangeEvent);
	newKeybind.addEventListener('focus', () => disableDrag(newStopwatch));
	newKeybind.addEventListener('focusout', () => enableDrag(newStopwatch));

	let newTimeButton = newStopwatch.querySelector('.time button');
	newTimeButton.addEventListener('click', clickTimeButtonEvent);

	let newName = newStopwatch.querySelector('.name');
	newName.value = 'Stopwatch ' + (numIds);
	newName.addEventListener('change', nameChangeEvent);
	newName.addEventListener('focus', e => disableDrag(newStopwatch));
	newName.addEventListener('focusout', e => enableDrag(newStopwatch));

	let newDelButton = newStopwatch.querySelector('.remove');
	newDelButton.addEventListener('click', removeStopwatchUsingEvent);

	let newClearButton = newStopwatch.querySelector('.clear');
	newClearButton.addEventListener('click', e => clear(e.target.parentNode));

	addDragEvents(newStopwatch);

	let newStopwatchObj = {id: numIds.toString(),
						name: newName.value,
						stopwatch: newStopwatch,
						keybind: numIds <= 10 ? (numIds % 10).toString() : '',
						timeButton: newTimeButton,
						prevTime: 0,
						startTime: 0,
						dropCount: 0,
						};
	stopwatchArray.push(newStopwatchObj);
	allStopwatches.insertBefore(newStopwatch, finalBlock);
	numIds++;
	numStopwatches++;
}

function disableDrag(newStopwatch) {
	newStopwatch.setAttribute('draggable', false);
}

function enableDrag(newStopwatch) {
	newStopwatch.setAttribute('draggable', true);
}

function addDragEvents(newStopwatch) {
	newStopwatch.addEventListener('dragover', e => {
		e.preventDefault();
	});
	newStopwatch.addEventListener('dragenter', () => {
		let dividerParent = newStopwatch;
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount++;
		dividerParent.querySelector('.divider').style.visibility = 'visible';
	});
	newStopwatch.addEventListener('dragleave', () => {
		let dividerParent = newStopwatch;
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount--;
		if (swObj.dropCount === 0) {
			dividerParent.querySelector('.divider').style.visibility = '';
		}
	})
	newStopwatch.addEventListener('dragstart', () => {
		let dividerParent = newStopwatch;
		finalBlock.style.visibility = 'visible';
		dragged = dividerParent;
	});
	newStopwatch.addEventListener('drop', e => {
		e.preventDefault();
		let dividerParent = newStopwatch;
		swObj = stopwatchArray.find(sw => sw.id === dividerParent.id);
		swObj.dropCount = 0;
		dividerParent.querySelector('.divider').style.visibility = '';
		finalBlock.style.visibility = '';
		if (dragged.id !== dividerParent.id) {
			dividerParent.parentNode.removeChild(dragged);
			dividerParent.parentNode.insertBefore(dragged, dividerParent);
		}
	});
}

function getParentStopwatch(child) {
	let parent = child;
	while (!parent.id) {
		parent = parent.parentNode;
	}
	return parent;
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

function removeStopwatchUsingEvent(e) {
	removeStopwatch(getParentStopwatch(e.target));
}

function toggleCheckForMacro(e) {
	let id = getParentStopwatch(e.target).id;
	let val = checkedObj[id];
	if (val) {
		delete checkedObj[id];
		e.target.style.color = '';
	} else {
		checkedObj[id] = true;
		e.target.style.color = 'black';
	}
}

function toggleMacroMode(button) {
	if (button.classList.toggle('check')) { // returns true if 'check' is added to classList
		button.removeEventListener('click', removeStopwatchUsingEvent);
		button.addEventListener('click', toggleCheckForMacro);
		button.textContent = '\u2714';
	} else {
		button.removeEventListener('click', toggleCheckForMacro);
		button.addEventListener('click', removeStopwatchUsingEvent);
		button.textContent = '\u2715';
		button.style.color = '';
	}
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
	let going = stopwatchArray.filter(sw => sw.timeButton && sw.timeButton.classList.contains('going'));
	for (let i = 0; i < going.length; i++) { //update each stopwatch in array
		let dur = (new Date() - going[i].startTime) / 1000;
		going[i].timeButton.textContent = parseFloat(Math.round((+going[i].prevTime + dur) * 100) / 100).toFixed(2); //round to 2 decimal places
	}
}

function keyDownEvent(e) {
	if (e.target.nodeName !== 'INPUT') { //do nothing if currently in a textbox
		//go through array to see if there is a stopwatch with this keybind
		let swArray = keybindObj[e.key];
		if (swArray) {
			swArray.forEach(sw => sw.timeButton.click());
		}
	}
}

function keybindChangeEvent(e) {
	if (e.target.value !== '') {
		if (!checkKeybindAvailable(e.target.value)) return;
		keybindObj[e.target.value] = [stopwatchArray.find(sw => getParentStopwatch(e.target).id === sw.id)];
	}
}

function checkKeybindAvailable(kb) {
	let swArray = keybindObj[kb];
	if (swArray && swArray.length > 0) {
		if (confirm('The stopwatch(es) ' + swArray.map(sw => sw.name).join() + ' already has this keybind. Replace?')) {
			if (swArray.length == 1) { //individual keybind
				swArray[0].stopwatch.querySelector('.keybind input').value = '';
			} else { //macro
				sidebarList.removeChild(sidebarList.querySelector('#' + kb));
			}
			keybindObj[kb] = [];
		} else {
			return false;
		}
	}
	return true;
}

function nameChangeEvent(e) {
	let stopwatchChanged = stopwatchArray.find(sw => getParentStopwatch(e.target).id === sw.id);
	if (stopwatchChanged) {
		stopwatchChanged.name = e.target.value;
	}
	for (let key in keybindObj) {
		if (keybindObj[key].indexOf(stopwatchChanged) >= 0) {
			let str = '';
			keybindObj[key].forEach(sw => str += sw.name + ', ');
			sidebarList.querySelector('#' + key).textContent = key + ': ' + str.slice(0, -2);
		}
	}
}

function addMacroKeybind() {
	if (!isEmpty(checkedObj) && addMacroInput.value.length > 0) {
		if (!checkKeybindAvailable(addMacroInput.value)) return;
		let listItem = document.createElement('li');
		let str = '';
		keybindObj[addMacroInput.value] = [];
		for (let key in checkedObj) {
			let sw = stopwatchArray.find(sw => key === sw.id);
			str += sw.name + ', ';
			keybindObj[addMacroInput.value].push(sw);
		}
		listItem.textContent = addMacroInput.value + ': ' + str.slice(0, -2);
		listItem.id = addMacroInput.value;
		sidebarList.appendChild(listItem);
	}
}

function isEmpty(obj) {
	for (let key in obj) {
		if (obj[key] !== undefined) {
			return false;
		}
	}
	return true;
}

//stopwatch array
//each stopwatch has:
/*
ID
keybind
time button
*/