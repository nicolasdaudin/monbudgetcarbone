moment.locale('fr');
console.log('here in flight travels');
const userSpan = document.querySelector('.user-span');
const user = userSpan.dataset.user;
const flightTravelsContainer = document.querySelector('.flight-travels-container');
const flightTravelsTable = document.querySelector('.flight-travels-table');
const spanKgCO2 = document.querySelector('.total-kg-co2-span');
const btnAddFlightTravel = document.querySelector('.add-travel-btn');
const formAddFlightTravel = document.querySelector('.add-travel-form')

const DATA_TEST_ATTRIBUTE_KEY = "data-test-id";


formAddFlightTravel.addEventListener('submit', async (e) => {
  e.preventDefault();
  addFlightTravel();
})



const appendCellToRow = (row, text, testAttributeValue) => {
  let originCell = row.insertCell();

  if (testAttributeValue) {
    originCell.setAttribute(DATA_TEST_ATTRIBUTE_KEY, testAttributeValue);
  }

  originCell.innerText = text ?? '';
}

const appendDateCellToRow = (row, date) => {
  date ?
    appendCellToRow(row, moment(date).format("LL")) :
    appendCellToRow(row, '');
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
  const bodyParams = Object.fromEntries(formData.entries());
  const res = await axios.post(`/api/flight-travels`, {
    ...bodyParams,
    user: 'test-user-cypress'
  });


  // const res = await axios.post(`/api/flight-travels`, {
  //   fromIataCode: 'MAD',
  //   toIataCode: 'TLS',
  //   outboundDate: new Date('2023-08-30').toISOString(),
  //   user: 'test-user-cypress'
  // });

  console.log('response status from axios', res.status);

  if (res.status !== 201 || res.data === undefined)
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

  console.log(flightTravels);

  let tbody = flightTravelsTable.querySelector('tbody');
  if (!tbody) tbody = flightTravelsTable.createTBody();
  emptyElement(tbody);


  flightTravels.forEach(flightTravel => {
    let row = tbody.insertRow();
    row.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'flight-travel');
    appendCellToRow(row, flightTravel.from, 'flight-travel-from');
    appendCellToRow(row, flightTravel.to, 'flight-travel-to');
    appendDateCellToRow(row, flightTravel.outboundDate);
    appendDateCellToRow(row, flightTravel.inboundDate);
    appendCellToRow(row, flightTravel.outboundConnection);
    appendCellToRow(row, flightTravel.inboundConnection);
    appendCellToRow(row, flightTravel.kgCO2eqTotal);

  });

  spanKgCO2.innerText = (flightTravels.reduce((prev, curr) => (curr.kgCO2eqTotal + prev), 0))

}
fetchFlightTravels();