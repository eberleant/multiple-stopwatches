const allStopwatches = document.getElementById('all-stopwatches');
const stopwatch = document.querySelector('div.stopwatch');
const timeBtn = document.querySelector('.time button');
const keybind = document.querySelector('.keybind input');
const addStopwatchBtn = document.getElementById('add-stopwatch');
let stopwatchArray = [{id: 0, name: 'Stopwatch 1', stopwatch, keybind: 'a', timeButton: timeBtn, prevTime: 0, startTime: 0}];
let numStopwatches = 1;
let numIds = 1;

addStopwatchBtn.addEventListener('click', e => {
	let newStopwatch = stopwatch.cloneNode(true);
	clear(newStopwatch);
	newStopwatch.classList.remove("0");
	newStopwatch.classList.add(numIds);

	let newKeybind = newStopwatch.querySelector('.keybind input');
	newKeybind.addEventListener('change', e => keybindChangeEvent(e));
	newKeybind.classList.remove("0");
	newKeybind.classList.add(numIds);
	newKeybind.value = '';

	let newTimeButton = newStopwatch.querySelector('.time button');
	newTimeButton.addEventListener('click', clickTimeButtonEvent);

	let newName = newStopwatch.querySelector('.name');
	newName.value = 'Stopwatch ' + (numIds + 1);

	let newStopwatchObj = {id: numIds,
						name: newName.value,
						stopwatch: newStopwatch,
						keybind: '',
						timeButton: newTimeButton,
						prevTime: 0,
						startTime: 0,
						};
	stopwatchArray.push(newStopwatchObj);
	allStopwatches.appendChild(newStopwatch);
	numIds++;
	numStopwatches++;
});

function clear(sw) {
	let tb = sw.querySelector('.time button');
	tb.classList.remove('going');
	tb.textContent = '0.00';
}

timeBtn.addEventListener('click', e => clickTimeButtonEvent(e));

keybind.addEventListener('change', e => keybindChangeEvent(e));

window.addEventListener('keydown', keyDownEvent);

setInterval(updateStopwatches, 10);

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
	stopwatchArray.find(sw => e.target.classList.contains(sw.id)).keybind = e.target.value;
}

//stopwatch array
//each stopwatch has:
/*
ID
keybind
time button
*/