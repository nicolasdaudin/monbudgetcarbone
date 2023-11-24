// @ts-check
const searchInputFrom = /** @type HTMLInputElement */(document.querySelector('.add-travel-form input[name="fromIataCode"]'));
// same as above but for to
const searchInputTo = /** @type HTMLInputElement */(document.querySelector('.add-travel-form input[name="toIataCode"]'));
// same as above but for outbound connection ,and another one for inbound connection
const searchInputOutboundConnection = /** @type HTMLInputElement */(document
  .querySelector('.add-travel-form input[name="outboundConnection"]'));
const searchInputInboundConnection = /** @type HTMLInputElement */(document
  .querySelector('.add-travel-form input[name="inboundConnection"]'));



const KEYBOARD_DOWN_ARROW_CODE = 40;
const KEYBOARD_UP_ARROW_CODE = 38;
const KEYBOARD_ENTER_CODE = 13;


function autocomplete(searchInput) {

  const autocompleteContainer = searchInput.parentNode.querySelector('.autocomplete-results');
  const searchResultsSpan = searchInput.parentNode.querySelector('.airport-span');

  let selectedIndexFrom = -1;

  function updateAutocompleteResults(airports) {
    // clean previous results
    autocompleteContainer.innerHTML = '';

    // add new results
    airports.forEach(airport => {
      const resultItem = document.createElement('div');
      const airportTextContent = getAirportDescriptionFromAirport(airport);
      // resultItem.setAttribute('data-iata-code', airport.iataCode);
      // resultItem.setAttribute('data-name', airport.name);
      // resultItem.setAttribute('data-municipality', airport.municipality);

      resultItem.textContent = airportTextContent;
      resultItem.classList.add('autocomplete-item');
      resultItem.onclick = function () {
        searchInput.value = airport.iataCode;
        searchResultsSpan.innerText = airportTextContent;
        autocompleteContainer.innerHTML = '';
      };
      autocompleteContainer.appendChild(resultItem);
    });
  }

  async function handleAutocompleteSearchInput(event) {
    const target = /** @type {HTMLInputElement}*/(event?.target);
    const query = target.value;

    closeAllLists();


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


      updateAutocompleteResults(airports);
    } catch (error) {
      console.error(`Error while fetching airports: ${error}`);
    }
  }

  function updateSelectionInAutocomplete(index) {

    // remove selected from all elements
    const items = autocompleteContainer.getElementsByClassName('autocomplete-item');
    for (const item of items) {
      item.classList.remove('selected');
    }

    // add selected to the actual selected element
    if (index >= 0 && index < items.length) {
      items[index].classList.add('selected');
      selectedIndexFrom = index;
    }

  }


  function handleKeyboardEvents(event) {
    const items = autocompleteContainer.getElementsByClassName('autocomplete-item');
    if (!items.length) return;

    if (event.keyCode === KEYBOARD_DOWN_ARROW_CODE) {
      if (selectedIndexFrom < items.length - 1) {
        updateSelectionInAutocomplete(selectedIndexFrom + 1);
      }
      event.preventDefault();
    }
    else if (event.keyCode === KEYBOARD_UP_ARROW_CODE) {
      if (selectedIndexFrom > 0) {
        updateSelectionInAutocomplete(selectedIndexFrom - 1);
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

  function closeAllLists(clickedElement) {
    const autocompleteLists = document.getElementsByClassName('autocomplete-results');
    for (let i = 0; i < autocompleteLists.length; i++) {
      if (clickedElement != autocompleteLists[i] && clickedElement != searchInput) {
        autocompleteLists[i].innerHTML = '';
      }
    }
  }

  /**
   * whenever someones clicks somewhere in the document, all the opened autocomplete lists are closed except the target of the click (if it's a list)
   */
  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });

  searchInput.addEventListener('keydown', handleKeyboardEvents);
  searchInput.addEventListener('input', handleAutocompleteSearchInput);
}

autocomplete(searchInputFrom);
autocomplete(searchInputTo);
autocomplete(searchInputOutboundConnection);
autocomplete(searchInputInboundConnection);

function getAirportDescriptionFromAirport(airport) {
  return `${airport.municipality} - ${airport.name} (${airport.iataCode}) - ${airport.country}`
}



