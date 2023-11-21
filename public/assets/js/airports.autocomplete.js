// @ts-check
const searchInput = /** @type HTMLInputElement */(document.querySelector('.airport-form-autocomplete-test input[name="searchTravelFrom"]'));
const searchResultsSpan = /** @type HTMLSpanElement */(document.querySelector('.airports-results-span'));
const autocompleteContainer =  /** @type {HTMLDivElement}*/ (document.getElementById('autocomplete-results'));

searchInput.addEventListener('input', async (e) => {
  const target = /** @type {HTMLInputElement}*/(e?.target);
  const query = target.value;

  if (query.length < 3) { return; }


  // @ts-ignore
  const res = await axios({
    method: 'GET',
    url: `/api/airports?q=${query}`,
  })

  if (res.status !== 200 || res.data === undefined)
    return;

  const airports = res.data.data.airports;
  updateAutocompleteResults(airports);

})

function updateAutocompleteResults(airports) {
  // clean previous results
  autocompleteContainer.innerHTML = '';

  // add new results
  airports.forEach(airport => {
    const resultItem = document.createElement('div');
    const airportTextContent = `${airport.name} (${airport.iataCode})`;
    // resultItem.setAttribute('data-iata-code', airport.iataCode);
    // resultItem.setAttribute('data-name', airport.name);
    // resultItem.setAttribute('data-municipality', airport.municipality);

    resultItem.textContent = airportTextContent;
    resultItem.classList.add('result-item');
    resultItem.onclick = function () {
      searchInput.value = airport.iataCode;
      searchResultsSpan.innerText = airportTextContent;
      autocompleteContainer.innerHTML = '';
    };
    autocompleteContainer.appendChild(resultItem);
  });
}



// these are divs that can not be focused and unfocused (like options in a select)
// so we follow the selection by hand
let selectedIndex = -1;

function updateSelectionInAutocomplete(index) {

  // remove selected from all elements
  const items = autocompleteContainer.getElementsByClassName('result-item');
  for (const item of items) {
    item.classList.remove('selected');
  }

  // add selected to the actual selected element
  if (index >= 0 && index < items.length) {
    items[index].classList.add('selected');
    selectedIndex = index;
  }

}

const KEYBOARD_DOWN_ARROW_CODE = 40;
const KEYBOARD_UP_ARROW_CODE = 38;
const KEYBOARD_ENTER_CODE = 13;

// Fonction pour gérer les touches du clavier
function handleKeyboardEvents(event) {
  const items = autocompleteContainer.getElementsByClassName('result-item');
  if (!items.length) return;

  if (event.keyCode === KEYBOARD_DOWN_ARROW_CODE) {
    if (selectedIndex < items.length - 1) {
      updateSelectionInAutocomplete(selectedIndex + 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_UP_ARROW_CODE) {
    if (selectedIndex > 0) {
      updateSelectionInAutocomplete(selectedIndex - 1);
    }
    event.preventDefault();
  }
  else if (event.keyCode === KEYBOARD_ENTER_CODE) {
    if (selectedIndex >= 0) {
      /** @type {HTMLDivElement} */(items[selectedIndex]).click();


      selectedIndex = -1;
    }
    event.preventDefault();
  }
}

searchInput.addEventListener('keydown', handleKeyboardEvents);

