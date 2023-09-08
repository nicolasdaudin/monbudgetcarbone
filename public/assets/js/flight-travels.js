moment.locale('fr');
console.log('here in flight travels');
const userSpan = document.querySelector('.span-user');
const user = userSpan.dataset.user;
const container = document.querySelector('.flight-travels-container');

const DATA_TEST_ATTRIBUTE_KEY = "data-test-id";


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

  if (flightTravels && flightTravels.length === 0) return;

  console.log(flightTravels);

  const table = document.createElement('table');
  const thead = table.createTHead();
  const row = thead.insertRow();
  const headers = ['Origine', 'Destination', 'Aller', 'Retour (facultatif)', 'Escales', 'Empreinte carbone'];
  headers.forEach(header => {
    let th = document.createElement("th");
    let text = document.createTextNode(header);
    th.appendChild(text);
    row.appendChild(th);
  });

  const tbody = table.createTBody();
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

  container.appendChild(table);

  const totalKgCO2H3 = document.createElement('h3');
  const totalKgCO2H3Span = document.createElement('span');
  totalKgCO2H3Span.innerText = (flightTravels.reduce((prev, curr) => (curr.kgCO2eqTotal + prev), 0))
  totalKgCO2H3Span.setAttribute(DATA_TEST_ATTRIBUTE_KEY, 'total-kg-co2');

  totalKgCO2H3.append(`Total kgCO2: `);
  totalKgCO2H3.appendChild(totalKgCO2H3Span);

  container.appendChild(totalKgCO2H3);

}
fetchFlightTravels();