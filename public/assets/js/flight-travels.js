// @ts-check
luxon.Settings.defaultLocale = "fr";
// @ts-ignore
const DateTime = luxon.DateTime;
const userSpan = /** @type HTMLSpanElement */ (document.querySelector('.user-span'));
const user = userSpan.dataset.user;
const flightTravelsContainer = /** @type HTMLDivElement */ (document.querySelector('.flight-travels-container'));
const flightTravelsTable = /** @type HTMLTableElement */ (document.querySelector('.flight-travels-table'));
const spanKgCO2 = /** @type HTMLSpanElement */ (document.querySelector('.total-kg-co2-span'));
const formFlightTravel = /** @type HTMLFormElement */ (document.querySelector('.add-travel-form'))
const formLegend = /** @type HTMLLegendElement **/(formFlightTravel.querySelector('legend'))
const formSubmitButton = /** @type HTMLButtonElement **/(formFlightTravel.querySelector('button[type=submit]'))
/**
 * @typedef {Object} Axios
 * @property {function} get
 * @property {function} post
 * @property {function} put
 * @property {function} delete
 */

/** @type {Axios} */
// @ts-ignore
const axios = window.axios;

// const btnsEditFlightTravel = document.querySelectorAll('.row-edit-travel-btn');
const DATA_TEST_ATTRIBUTE_KEY = "data-test-id";
const DATA_ID = "data-flight-travel-id";
const DATA_AIRPORT_NAME_ATTRIBUTE_KEY = "data-name";
const DATA_AIRPORT_COUNTRY_ATTRIBUTE_KEY = "data-country";
const DATA_AIRPORT_MUNICIPALITY_ATTRIBUTE_KEY = "data-municipality";
const DATA_AIRPORT_IATACODE_ATTRIBUTE_KEY = "data-iata-code";




flightTravelsTable.addEventListener('click', e => {
  const clicked = /** @type HTMLButtonElement*/ (e.target)
  const editButtonClicked = /** @type HTMLButtonElement*/ (clicked.closest('.row-edit-travel-btn'));
  const deleteButtonClicked = /** @type HTMLButtonElement*/ (clicked.closest('.row-delete-travel-btn'));


  // if we click outside of any of the button, there is nothing to do
  if (!editButtonClicked && !deleteButtonClicked) return;

  const parentRowTrElement = /** @type HTMLTableRowElement*/ (editButtonClicked ? editButtonClicked.closest('tr') : deleteButtonClicked.closest('tr'));

  const id = parentRowTrElement.dataset.flightTravelId;

  if (editButtonClicked) {
    prepareEditForm(parentRowTrElement, id);
  }

  if (deleteButtonClicked) {
    deleteFlightTravel(id);
  }


});

formFlightTravel.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = formFlightTravel.dataset.flightTravelId;
  if (id) {
    editFlightTravel(id);
  } else {
    addFlightTravel();
  }

  clearForm();
})

const appendCellToRowWithText = (row, text, testAttributeValue) => {
  let originCell = row.insertCell();

  if (testAttributeValue) {
    originCell.setAttribute(DATA_TEST_ATTRIBUTE_KEY, testAttributeValue);
  }

  originCell.innerText = text ?? '';
}

/**
 * 
 * @param {HTMLTableRowElement} row 
 * @param {Airport} airport 
 * @param {string} testAttributeValue 
 */

const appendCellToRowWithAirport = (row, airport, testAttributeValue) => {
  let originCell = row.insertCell();

  if (testAttributeValue) {
    originCell.setAttribute(DATA_TEST_ATTRIBUTE_KEY, testAttributeValue);
  }

  if (airport) {
    originCell.setAttribute(DATA_AIRPORT_NAME_ATTRIBUTE_KEY, airport.name);
    originCell.setAttribute(DATA_AIRPORT_COUNTRY_ATTRIBUTE_KEY, airport.country);
    originCell.setAttribute(DATA_AIRPORT_MUNICIPALITY_ATTRIBUTE_KEY, airport.municipality);
    originCell.setAttribute(DATA_AIRPORT_IATACODE_ATTRIBUTE_KEY, airport.iataCode);
  }


  originCell.innerText = airport?.iataCode ?? '';
}

const appendCellToRowWithElement = (row, element) => {
  let originCell = row.insertCell();
  originCell.appendChild(element);
}

/**
 * 
 * @param {*} row 
 * @param {*} date 
 * @param {*} testAttributeValue 
 */
const appendDateCellToRow = (row, date, testAttributeValue) => {
  date ?
    appendCellToRowWithText(row, DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL), testAttributeValue) :
    appendCellToRowWithText(row, '', testAttributeValue);
}

const emptyElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const addFlightTravel = async () => {
  if (!user) return;

  console.log(`Adding a flight travel for user ${user}`);

  const formData = new FormData(formFlightTravel);

  const bodyParams = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key, value]) => value !== null && value !== '')
      .map(([key, value]) => [convertToCamelCase(key), value])
  );

  console.log('add', { bodyParams });

  const res = await axios.post(`/api/flight-travels`, {
    ...bodyParams,
    user
  });

  if (res.status !== 201 || res.data === undefined)
    return;

  fetchFlightTravels();
}

const editFlightTravel = async (id) => {
  if (!user || !id) return;

  console.log(`Editing flight travel with id ${id} for user ${user}`);

  const formData = new FormData(formFlightTravel);

  const bodyParams = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key, value]) => value !== null && value !== '')
      .map(([key, value]) => [convertToCamelCase(key), value])
  );

  console.log('edit', { bodyParams })

  const res = await axios.put(`/api/flight-travels/${id}`, {
    ...bodyParams
  });

  if (res.status !== 200 || res.data === undefined)
    return;

  fetchFlightTravels();
}
const deleteFlightTravel = async (id) => {
  if (!id) return;

  console.log(`Deleting flight travel with id ${id}`);

  const res = await axios.delete(`/api/flight-travels/${id}`);

  if (res.status !== 204 || res.data === undefined)
    return;

  fetchFlightTravels();
}

const fetchFlightTravels = async () => {
  console.log(`Fetching flight travels for user ${user}`);

  if (!user) return;

  const res = await axios.get(
    `/api/flight-travels?user=${user}`
  )

  if (res.status !== 200 || res.data === undefined)
    return;

  const flightTravels = res.data;

  if (flightTravels && flightTravels.length === 0) {
    //TODO: update with css classes instead of changing thru JS
    flightTravelsContainer.style.display = 'none';
    return;
  }
  //TODO: update with css classes instead of changing thru JS
  flightTravelsContainer.style.display = 'block';

  let tbody = flightTravelsTable.querySelector('tbody');
  if (!tbody) tbody = flightTravelsTable.createTBody();
  emptyElement(tbody);


  flightTravels.forEach(flightTravel => {
    addFlightTravelToTable(tbody, flightTravel);
  });

  spanKgCO2.innerText = (flightTravels.reduce((prev, curr) => (curr.kgCO2eqTotal + prev), 0))

}
fetchFlightTravels();

function clearForm() {
  const airportSpans = /** @type {HTMLSpanElement[]} */ (Array.from(document.querySelectorAll('.airport-span')));
  // clear the content of each airport span
  airportSpans.forEach(airportSpan => {
    airportSpan.innerText = '';
  });

  // clear the content of the data id attribute of the form
  formFlightTravel.removeAttribute('data-flight-travel-id');

  // legend of the form is back to 'Ajouter un voyage'
  formLegend.innerText = 'Ajouter un voyage';
  // submit button of the form is back to 'Ajouter un voyage'
  formSubmitButton.innerText = 'Ajouter un voyage';

  formFlightTravel.reset();
}

/**
 * 
 * @param {*} cell 
 * @param {'from'|'to'|'outbound-connection'|'inbound-connection'} inputType 
 */
function updateFormInputTypeWithCell(cell, inputType) {
  if (!cell.innerText || !cell.dataset.name) return;

  const input = /** @type HTMLInputElement */ (formFlightTravel.querySelector(`input[name=${inputType}-iata-code]`));
  input.value = cell.innerText;
  const span = /** @type HTMLSpanElement */ (document.querySelector(`.airport-span.${inputType}`));

  /** @type {Airport} */
  const { name, country, municipality, iataCode } = cell.dataset;
  span.innerText = getAirportDescriptionFromAirport({
    name,
    country,
    municipality,
    iataCode
  });
}


function prepareEditForm(parentRowTrElement, id) {
  const fromIataCodeCell = parentRowTrElement.querySelector('td:nth-child(1)');
  updateFormInputTypeWithCell(fromIataCodeCell, 'from');

  const toIataCodeCell = parentRowTrElement.querySelector('td:nth-child(2)');
  updateFormInputTypeWithCell(toIataCodeCell, 'to');


  const outboundDateCell = parentRowTrElement.querySelector('td:nth-child(3)');
  const outboundDateAddForm = /** @type HTMLInputElement */(formFlightTravel.querySelector('input[name=outbound-date]'));
  outboundDateAddForm.value = DateTime.fromFormat(outboundDateCell.innerText, "DDD").toISODate();

  const inboundDateCell = parentRowTrElement.querySelector('td:nth-child(4)');
  const inboundDateAddForm = /** @type HTMLInputElement */(formFlightTravel.querySelector('input[name=inbound-date]'));
  inboundDateAddForm.value = DateTime.fromFormat(inboundDateCell.innerText, "DDD").toISODate();

  const outboundConnectionCell = parentRowTrElement.querySelector('td:nth-child(5)');
  updateFormInputTypeWithCell(outboundConnectionCell, 'outbound-connection');


  const inboundConnectionCell = parentRowTrElement.querySelector('td:nth-child(6)');
  updateFormInputTypeWithCell(inboundConnectionCell, 'inbound-connection');

  formFlightTravel.setAttribute('data-flight-travel-id', id);

  formLegend.innerText = 'Éditer un voyage';
  formSubmitButton.innerText = 'Éditer un voyage';
}



function addFlightTravelToTable(tbody, flightTravel) {
  let row = tbody.insertRow();
  row.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'flight-travel');
  row.setAttribute(DATA_ID, flightTravel.id);
  appendCellToRowWithAirport(row, flightTravel.from, 'flight-travel-from');
  appendCellToRowWithAirport(row, flightTravel.to, 'flight-travel-to');
  appendDateCellToRow(row, flightTravel.outboundDate, 'flight-travel-outbound-date');
  appendDateCellToRow(row, flightTravel.inboundDate, 'flight-travel-inbound-date');
  appendCellToRowWithAirport(row, flightTravel.outboundConnection, 'flight-travel-outbound-connection');
  appendCellToRowWithAirport(row, flightTravel.inboundConnection, 'flight-travel-inbound-connection');
  appendCellToRowWithText(row, flightTravel.kgCO2eqTotal);

  const editButton = document.createElement('button');
  editButton.classList.add('row-edit-travel-btn');
  editButton.textContent = 'Éditer ce voyage';
  editButton.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'row-edit-travel-btn');
  appendCellToRowWithElement(row, editButton);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('row-delete-travel-btn');
  deleteButton.textContent = 'Supprimer ce voyage';
  deleteButton.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'row-delete-travel-btn');
  appendCellToRowWithElement(row, deleteButton);

}
function convertToCamelCase(key) {
  return key.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

