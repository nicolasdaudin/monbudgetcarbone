// @ts-check
luxon.Settings.defaultLocale = "fr";
// @ts-ignore
const DateTime = luxon.DateTime;
const userSpan = /** @type HTMLSpanElement */ (document.querySelector('.user-span'));
const user = userSpan.dataset.user;
const flightTravelsContainer = /** @type HTMLDivElement */ (document.querySelector('.flight-travels-container'));
const flightTravelsTable = /** @type HTMLTableElement */ (document.querySelector('.flight-travels-table'));
const formFlightTravel = /** @type HTMLFormElement */ (document.querySelector('.add-travel-form'))
const formLegend = /** @type HTMLLegendElement **/(formFlightTravel.querySelector('.travel-form-title'))
const formSubmitButton = /** @type HTMLButtonElement **/(formFlightTravel.querySelector('button[type=submit]'))

const CO2_QUOTA_KG = 2000;

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

/**
 * @typedef {import ('../../../src/domain/flight-travel.dto').ViewFlightTravelDto} FlightTravel
 */

/**
 * @typedef {Object} FlightTravelsByYear
 * @property {number} year The year of the flight travels
 * @property {number} totalCO2 The total CO2 for the corresponding year
 * @property {FlightTravel[]} flightTravels The array of flight travels for the corresponding year
 */




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

/**
 * @param {Object} arguments
 * @param {HTMLTableRowElement} arguments.row - the html row to append the cell to
 * @param {string} arguments.text - the text to append to the cell
 * @param {string} [arguments.testAttributeValue] - the value of the data-test-id attribute
 * @param {string} arguments.columnLabel -  the value of the data-label attribute
 */
const appendCellToRowWithText = ({ row, text, testAttributeValue, columnLabel }) => {
  let originCell = row.insertCell();

  if (testAttributeValue) {
    originCell.setAttribute(DATA_TEST_ATTRIBUTE_KEY, testAttributeValue);
  }

  originCell.setAttribute('data-label', columnLabel);

  originCell.innerText = text ?? '';
}


/**
 * @param {Object} arguments 
 * @param {HTMLTableRowElement} arguments.row - the html row to append the cell to
 * @param {Airport} [arguments.airport] - the airport to append to the cell
 * @param {string} arguments.testAttributeValue - the value of the data-test-id attribute
 * @param {string} arguments.columnLabel - the value of the data-label attribute
 */
const appendCellToRowWithAirport = ({ row, airport, testAttributeValue, columnLabel }) => {
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


  originCell.setAttribute('data-label', columnLabel);


  originCell.innerText = airport ? `${airport.municipality} (${airport.iataCode})` : '';
}

/**
 * @param {Object} arguments
 * @param {HTMLTableRowElement} arguments.row 
 * @param {HTMLElement} arguments.element 
 */
const appendActionCellToRowWithElement = (row, element) => {
  let originCell = row.insertCell();
  originCell.classList.add('is-actions-cell');
  originCell.appendChild(element);
}

/**
 * @param {Object} arguments
 * @param {HTMLTableRowElement} arguments.row - the html row to append the cell to
 * @param {string |  Date} [arguments.date] - the date to append to the cell
 * @param {string} arguments.testAttributeValue - the value of the data-test-id attribute
 * @param {string} arguments.columnLabel - the value of the data-label attribute
 */
const appendDateCellToRow = ({ row, date, testAttributeValue, columnLabel }) => {
  date ?
    appendCellToRowWithText({ row, text: DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL), testAttributeValue, columnLabel }) :
    appendCellToRowWithText({ row, text: '', testAttributeValue, columnLabel });
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

  let res;

  try {
    res = await axios.post(`/api/flight-travels`, {
      ...bodyParams,
      user
    });
  } catch (error) {
    if (error.response) {
      /**
       * @type {{message: string, errors: {code: string, message: string, path:string[]}[]}}
       */
      const errorObject = error.response.data;
      // concat all the error messages and separate them with a text return line except for the last message
      const errorMessage = errorObject.errors.reduce((prev, curr, index) => {
        const separator = index === errorObject.errors.length - 1 ? '' : '\n';
        return `${prev}${curr.message}${separator}`;
      }, '');

      showAndHideErrorMessageWithText(errorMessage);

    }
    return;
  }

  if (res.status !== 201 || res.data === undefined) {
    return;
  }


  showAndHideSuccessMessageWithSelector('add');


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

  showAndHideSuccessMessageWithSelector('edit');

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

  /** @type {FlightTravel[]} */
  const flightTravels = res.data;

  if (flightTravels && flightTravels.length === 0) {
    //TODO: update with css classes instead of changing thru JS
    flightTravelsContainer.style.display = 'none';
    return;
  }
  //TODO: update with css classes instead of changing thru JS
  flightTravelsContainer.style.display = 'block';

  // Generate a FlightTravelsByYear array from flightTravels
  /** @type {FlightTravelsByYear[]} */
  const flightTravelsByYear = flightTravels.reduce((/** @type {FlightTravelsByYear[]}*/prev, curr) => {
    const year = DateTime.fromISO(curr.outboundDate).year;
    const yearFlightTravels = prev.find(flightTravelsByYear => flightTravelsByYear.year === year);
    if (yearFlightTravels) {
      yearFlightTravels.flightTravels.push(curr);
      yearFlightTravels.totalCO2 += curr.kgCO2eqTotal;
    } else {
      prev.push({
        year,
        flightTravels: [curr],
        totalCO2: curr.kgCO2eqTotal
      });
    }
    return prev;
  }, []);

  // sort the array by year
  flightTravelsByYear.sort((a, b) => b.year - a.year);

  console.log({ flightTravelsByYear })


  let tbody = flightTravelsTable.querySelector('tbody');
  if (!tbody) tbody = flightTravelsTable.createTBody();
  emptyElement(tbody);


  flightTravelsByYear.forEach(({ year, totalCO2, flightTravels }) => {
    flightTravels.forEach(flightTravel => { addFlightTravelToTable(tbody, flightTravel); }
    );
    handleProgressBar(tbody, year, totalCO2);
  });

  const totalCO2 = flightTravels.reduce((prev, curr) => (curr.kgCO2eqTotal + prev), 0);

  // create tfoot with the total CO2
  let tfoot = flightTravelsTable.querySelector('tfoot');
  if (!tfoot) tfoot = flightTravelsTable.createTFoot();
  emptyElement(tfoot);
  const row = tfoot.insertRow();
  row.classList.add('total-row');
  const cell = row.insertCell();

  cell.classList.add('is-size-5');
  cell.setAttribute('colspan', '8');
  cell.innerText = `Total sur votre vie : ${totalCO2.toFixed(2)} kgCO2`;

}
fetchFlightTravels();

/**
 * 
 * @param {'add'|'edit'} cssSelector the css selector
 */
function showAndHideSuccessMessageWithSelector(cssSelector) {
  const notificationDiv = /** @type {HTMLDivElement}*/ (document.querySelector(`.notification.${cssSelector}`));
  notificationDiv.classList.remove('is-hidden');
  setTimeout(() => {
    notificationDiv.classList.add('is-hidden');
  }, 3000);
}

/**
 * 
 * @param {string} errorMessage the error message to display
 */
function showAndHideErrorMessageWithText(errorMessage) {
  const notificationDiv = /** @type {HTMLDivElement}*/ (document.querySelector(`.notification.error`));
  notificationDiv.classList.remove('is-hidden');
  notificationDiv.innerText = errorMessage;
  setTimeout(() => {
    notificationDiv.classList.add('is-hidden');
  }, 10000);
}

function handleProgressBar(tbody, year, yearCO2) {

  const row = tbody.insertRow();
  row.classList.add('progress-row');
  row.classList.add('detail');
  const cell = row.insertCell();
  cell.classList.add('is-size-5');
  cell.setAttribute('colspan', '8');
  const div = document.createElement('div');
  div.classList.add('progress-wrapper');
  const progressBar = document.createElement('progress');
  progressBar.classList.add('progress');
  progressBar.classList.add('co2-progress');
  progressBar.classList.add('is-medium');
  progressBar.value = yearCO2;
  progressBar.max = CO2_QUOTA_KG;
  div.appendChild(progressBar);
  cell.appendChild(div);

  // remove all classes from the progress bar
  progressBar.classList.remove('is-danger');
  progressBar.classList.remove('is-warning');
  progressBar.classList.remove('is-success');

  // if totalCO2 is greater than 75% of CO2_QUOTA_KG, add the class 'is-danger' to the progress bar, otherwise remove it
  if (yearCO2 > CO2_QUOTA_KG * 0.75) {
    progressBar.classList.add('is-danger');
  }
  // if totalCO2 is between 50 and 75% of CO2_QUOTA_KG, add the class 'is-warning' to the progress bar, otherwise remove it
  if (yearCO2 > CO2_QUOTA_KG * 0.5 && yearCO2 <= CO2_QUOTA_KG * 0.75) {
    progressBar.classList.add('is-warning');
  }
  // if totalCO2 is less than 50% of CO2_QUOTA_KG, add the class 'is-success' to the progress bar, otherwise remove it
  if (yearCO2 <= CO2_QUOTA_KG * 0.5) {
    progressBar.classList.add('is-success');
  }

  const progressValueParagraph = document.createElement('p');
  progressValueParagraph.classList.add('progress-value');
  progressValueParagraph.classList.add('has-text-black');
  const percentageOfCO2Used = Math.round((yearCO2 / CO2_QUOTA_KG) * 100);
  progressValueParagraph.innerText = `${year}: ${percentageOfCO2Used}% de votre quota de ${CO2_QUOTA_KG / 1000} tonnes`;
  div.appendChild(progressValueParagraph);

}

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
  input.value = cell.dataset.iataCode;
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
  const fromIataCodeCell = /** @type HTMLTableCellElement */(parentRowTrElement.querySelector('td:nth-child(1)'));
  updateFormInputTypeWithCell(fromIataCodeCell, 'from');

  const toIataCodeCell = /** @type HTMLTableCellElement */(parentRowTrElement.querySelector('td:nth-child(2)'));
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

  formFlightTravel.scrollIntoView({ behavior: 'smooth' });
}


/**
 * 
 * @param {*} tbody 
 * @param {FlightTravel} flightTravel 
 */
function addFlightTravelToTable(tbody, flightTravel) {
  let row = tbody.insertRow();
  row.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'flight-travel');
  row.setAttribute(DATA_ID, flightTravel.id);
  appendCellToRowWithAirport({ row, airport: flightTravel.from, testAttributeValue: 'flight-travel-from', columnLabel: "Origine" });
  appendCellToRowWithAirport({ row, airport: flightTravel.to, testAttributeValue: 'flight-travel-to', columnLabel: "Destination" });
  appendDateCellToRow({ row, date: flightTravel.outboundDate, testAttributeValue: 'flight-travel-outbound-date', columnLabel: "Aller" });
  appendDateCellToRow({ row, date: flightTravel.inboundDate, testAttributeValue: 'flight-travel-inbound-date', columnLabel: "Retour" });
  appendCellToRowWithAirport({ row, airport: flightTravel.outboundConnection, testAttributeValue: 'flight-travel-outbound-connection', columnLabel: "Escale aller" });
  appendCellToRowWithAirport({ row, airport: flightTravel.inboundConnection, testAttributeValue: 'flight-travel-inbound-connection', columnLabel: "Escale retour" });
  appendCellToRowWithText({ row, text: `${flightTravel.kgCO2eqTotal.toFixed(2)} kgCO2`, columnLabel: "Empreinte carbone" });

  // const editButton = document.createElement('button');
  // editButton.classList.add('row-edit-travel-btn');
  // editButton.textContent = 'Éditer ce voyage';
  // editButton.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'row-edit-travel-btn');
  // appendCellToRowWithElement(row, editButton);

  const editButton = document.createElement('a');
  editButton.classList.add('row-edit-travel-btn');
  // editButton.classList.add('button');
  editButton.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'row-edit-travel-btn');
  // inside this button, add a span with class icon and is-small and a fontawesome icon pen-to-square
  const editButtonSpan = document.createElement('span');
  editButtonSpan.classList.add('icon');
  editButtonSpan.classList.add('is-medium');
  const editButtonIcon = document.createElement('i');
  editButtonIcon.classList.add('fas');
  editButtonIcon.classList.add('fa-pen-square');
  editButtonSpan.appendChild(editButtonIcon);
  editButton.appendChild(editButtonSpan);



  const deleteButton = document.createElement('a');
  deleteButton.classList.add('row-delete-travel-btn');
  // deleteButton.classList.add('delete');
  deleteButton.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'row-delete-travel-btn');
  const deleteButtonSpan = document.createElement('span');
  deleteButtonSpan.classList.add('icon');
  deleteButtonSpan.classList.add('is-medium');
  const deleteButtonIcon = document.createElement('i');
  deleteButtonIcon.classList.add('fas');
  deleteButtonIcon.classList.add('fa-trash');
  deleteButtonSpan.appendChild(deleteButtonIcon);
  deleteButton.appendChild(deleteButtonSpan);

  // create a div button with classes buttons and is-right
  // and append edit and deleteButton to it
  const divButtons = document.createElement('div');
  divButtons.classList.add('buttons');
  divButtons.classList.add('is-right');
  divButtons.appendChild(editButton);
  divButtons.appendChild(deleteButton);
  appendActionCellToRowWithElement(row, divButtons);


}
function convertToCamelCase(key) {
  return key.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

