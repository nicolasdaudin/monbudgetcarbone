luxon.Settings.defaultLocale = "fr";
const DateTime = luxon.DateTime;
const userSpan = document.querySelector('.user-span');
const user = userSpan.dataset.user;
const flightTravelsContainer = document.querySelector('.flight-travels-container');
const flightTravelsTable = document.querySelector('.flight-travels-table');
const spanKgCO2 = document.querySelector('.total-kg-co2-span');
const btnAddFlightTravel = document.querySelector('.add-travel-btn');
const formAddFlightTravel = document.querySelector('.add-travel-form')
const btnEditFlightTravel = document.querySelector('.edit-travel-btn');
const formEditFlightTravel = document.querySelector('.edit-travel-form');

// const btnsEditFlightTravel = document.querySelectorAll('.row-edit-travel-btn');
const DATA_TEST_ATTRIBUTE_KEY = "data-test-id";
const DATA_ID = "data-flight-travel-id";



flightTravelsTable.addEventListener('click', e => {
  const editButtonClicked = e.target.closest('.row-edit-travel-btn');
  const deleteButtonClicked = e.target.closest('.row-delete-travel-btn');


  // if we click outside of any of the button, there is nothing to do
  if (!editButtonClicked && !deleteButtonClicked) return;

  const parentRowTrElement = editButtonClicked ? editButtonClicked.closest('tr') : deleteButtonClicked.closest('tr');

  const id = parentRowTrElement.dataset.flightTravelId;

  if (editButtonClicked) {
    prepareEditForm(parentRowTrElement, id);
  }

  if (deleteButtonClicked) {
    deleteFlightTravel(id);
  }


});

formAddFlightTravel.addEventListener('submit', async (e) => {
  e.preventDefault();
  addFlightTravel();
})

formEditFlightTravel.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = formEditFlightTravel.dataset.flightTravelId;
  editFlightTravel(id);
  formEditFlightTravel.reset();
})


const appendCellToRowWithText = (row, text, testAttributeValue) => {
  let originCell = row.insertCell();

  if (testAttributeValue) {
    originCell.setAttribute(DATA_TEST_ATTRIBUTE_KEY, testAttributeValue);
  }

  originCell.innerText = text ?? '';
}

const appendCellToRowWithElement = (row, element) => {
  let originCell = row.insertCell();
  originCell.appendChild(element);
}

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

  const formData = new FormData(formAddFlightTravel);
  const bodyParams = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key, value]) => value !== null && value !== '')
      .map(([key, value]) => [key, value])
  );
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

  const formData = new FormData(formEditFlightTravel);

  const bodyParams = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key, value]) => value !== null && value !== '')
      .map(([key, value]) => [key, value])
  );

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

  const res = await axios({
    method: 'GET',
    url: `/api/flight-travels?user=${user}`,
  })

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

function prepareEditForm(parentRowTrElement, id) {
  const fromIataCodeRow = parentRowTrElement.querySelector('td:nth-child(1)');
  const fromIataCodeEditForm = formEditFlightTravel.querySelector('select[name=fromIataCode]');
  fromIataCodeEditForm.value = fromIataCodeRow.innerText;

  const toIataCodeRow = parentRowTrElement.querySelector('td:nth-child(2)');
  const toIataCodeEditForm = formEditFlightTravel.querySelector('select[name=toIataCode]');
  toIataCodeEditForm.value = toIataCodeRow.innerText;

  const outboundDateRow = parentRowTrElement.querySelector('td:nth-child(3)');
  const outboundDateEditForm = formEditFlightTravel.querySelector('input[name=outboundDate]');
  outboundDateEditForm.value = DateTime.fromFormat(outboundDateRow.innerText, "DDD").toISODate();

  const inboundDateRow = parentRowTrElement.querySelector('td:nth-child(4)');
  const inboundDateEditForm = formEditFlightTravel.querySelector('input[name=inboundDate]');
  inboundDateEditForm.value = DateTime.fromFormat(inboundDateRow.innerText, "DDD").toISODate();

  const outboundConnectionRow = parentRowTrElement.querySelector('td:nth-child(5)');
  const outboundConnectionEditForm = formEditFlightTravel.querySelector('select[name=outboundConnection]');
  outboundConnectionEditForm.value = outboundConnectionRow.innerText;


  const inboundConnectionRow = parentRowTrElement.querySelector('td:nth-child(6)');
  const inboundConnectionEditForm = formEditFlightTravel.querySelector('select[name=inboundConnection]');
  inboundConnectionEditForm.value = inboundConnectionRow.innerText;

  formEditFlightTravel.setAttribute('data-flight-travel-id', id);
}

function addFlightTravelToTable(tbody, flightTravel) {
  let row = tbody.insertRow();
  row.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'flight-travel');
  row.setAttribute(DATA_ID, flightTravel.id);
  appendCellToRowWithText(row, flightTravel.from, 'flight-travel-from');
  appendCellToRowWithText(row, flightTravel.to, 'flight-travel-to');
  appendDateCellToRow(row, flightTravel.outboundDate, 'flight-travel-outbound-date');
  appendDateCellToRow(row, flightTravel.inboundDate, 'flight-travel-inbound-date');
  appendCellToRowWithText(row, flightTravel.outboundConnection);
  appendCellToRowWithText(row, flightTravel.inboundConnection);
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
