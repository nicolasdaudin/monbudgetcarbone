// @ts-check
const searchInputFrom = /** @type HTMLInputElement */(document.querySelector('.add-travel-form input[name="fromIataCode"]'));
const searchResultsSpanFrom = /** @type HTMLSpanElement */(document.querySelector('.airport-from-span'));
const autocompleteContainerFrom =  /** @type {HTMLDivElement}*/ (document.getElementById('autocomplete-results-from-div'));
// same as above but for to
const searchInputTo = /** @type HTMLInputElement */(document.querySelector('.add-travel-form input[name="toIataCode"]'));
const searchResultsSpanTo = /** @type HTMLSpanElement */(document.querySelector('.airport-to-span'));
const autocompleteContainerTo =  /** @type {HTMLDivElement}*/ (document.getElementById('autocomplete-results-to-div'));

async function handleAirportSearchInput(autocompleteContainer, searchInput, searchResultsSpan, event) {

  const target = /** @type {HTMLInputElement}*/(event?.target);
  const query = target.value;

  if (query.length < 3) { return; }


  try {
    // @ts-ignore
    const res = await axios({
      method: 'GET',
      url: `/api/airports?q=${query}`,
    })

    if (res.status !== 200 || res.data === undefined)
      return;

    const airports = res.data.data.airports;
    updateAutocompleteResults(airports, autocompleteContainer, searchInput, searchResultsSpan);
  } catch (error) {
    console.error(`Error while fetching airports: ${error}`);
  }
}

searchInputFrom.addEventListener('input', handleAirportSearchInput.bind(null, autocompleteContainerFrom, searchInputFrom, searchResultsSpanFrom));

searchInputTo.addEventListener('input', handleAirportSearchInput.bind(null, autocompleteContainerTo, searchInputTo, searchResultsSpanTo));


function updateAutocompleteResults(_airports, _autocompleteContainer, _searchInput, _searchResultsSpan) {
  // clean previous results
  _autocompleteContainer.innerHTML = '';

  // add new results
  _airports.forEach(airport => {
    const resultItem = document.createElement('div');
    const airportTextContent = getAirportDescriptionFromAirport(airport);
    // resultItem.setAttribute('data-iata-code', airport.iataCode);
    // resultItem.setAttribute('data-name', airport.name);
    // resultItem.setAttribute('data-municipality', airport.municipality);

    resultItem.textContent = airportTextContent;
    resultItem.classList.add('result-item');
    resultItem.onclick = function () {
      _searchInput.value = airport.iataCode;
      _searchResultsSpan.innerText = airportTextContent;
      _autocompleteContainer.innerHTML = '';
    };
    _autocompleteContainer.appendChild(resultItem);
  });
}



// these are divs that can not be focused and unfocused (like options in a select)
// so we follow the selection by hand
let selectedIndexFrom = -1;
let selectedIndexTo = -1;

function updateSelectionInAutocompleteFrom(index) {

  // remove selected from all elements
  const items = autocompleteContainerFrom.getElementsByClassName('result-item');
  for (const item of items) {
    item.classList.remove('selected');
  }

  // add selected to the actual selected element
  if (index >= 0 && index < items.length) {
    items[index].classList.add('selected');
    selectedIndexFrom = index;
  }

}

function updateSelectionInAutocompleteTo(index) {

  // remove selected from all elements
  const items = autocompleteContainerTo.getElementsByClassName('result-item');
  for (const item of items) {
    item.classList.remove('selected');
  }

  // add selected to the actual selected element
  if (index >= 0 && index < items.length) {
    items[index].classList.add('selected');
    selectedIndexFrom = index;
  }

}

const KEYBOARD_DOWN_ARROW_CODE = 40;
const KEYBOARD_UP_ARROW_CODE = 38;
const KEYBOARD_ENTER_CODE = 13;

// Fonction pour gérer les touches du clavier
function handleKeyboardEventsFrom(event) {
  const items = autocompleteContainerFrom.getElementsByClassName('result-item');
  if (!items.length) return;

  if (event.keyCode === KEYBOARD_DOWN_ARROW_CODE) {
    if (selectedIndexFrom < items.length - 1) {
      updateSelectionInAutocompleteFrom(selectedIndexFrom + 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_UP_ARROW_CODE) {
    if (selectedIndexFrom > 0) {
      updateSelectionInAutocompleteFrom(selectedIndexFrom - 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_ENTER_CODE) {
    if (selectedIndexFrom >= 0) {
      /** @type {HTMLDivElement} */(items[selectedIndexFrom]).click();


      selectedIndexFrom = -1;
    }
    event.preventDefault();
  }
}

function handleKeyboardEventsTo(event) {
  const items = autocompleteContainerTo.getElementsByClassName('result-item');
  if (!items.length) return;

  if (event.keyCode === KEYBOARD_DOWN_ARROW_CODE) {
    if (selectedIndexTo < items.length - 1) {
      updateSelectionInAutocompleteTo(selectedIndexTo + 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_UP_ARROW_CODE) {
    if (selectedIndexTo > 0) {
      updateSelectionInAutocompleteTo(selectedIndexTo - 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_ENTER_CODE) {
    if (selectedIndexTo >= 0) {
      /** @type {HTMLDivElement} */(items[selectedIndexTo]).click();


      selectedIndexTo = -1;
    }
    event.preventDefault();
  }
}

searchInputFrom.addEventListener('keydown', handleKeyboardEventsFrom);
searchInputTo.addEventListener('keydown', handleKeyboardEventsTo);

function getAirportDescriptionFromAirport(airport) {
  return `${airport.municipality} - ${airport.name} (${airport.iataCode}) - ${airport.country}`
}

