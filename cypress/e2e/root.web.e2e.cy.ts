describe('RootWebController (e2e)', () => {



  it('connects to homepage', () => {
    cy.visit('/');
    cy.get('[data-test-id="welcome-message"]').should('include.text', 'Logge-toi avec ton user');
  })

  describe('Flight travels', () => {

    beforeEach(() => {
      cy.task("db:seed");
      // cy.intercept('GET', '**/api/airports?q=PAR', { fixture: 'get-airports-PAR.fixture.json' })

    })

    it('gets a list of test user travels', () => {
      cy.visit('/test-user-cypress');

      // Preparing the test
      cy.get('[data-test-id="message"]').should('include.text', 'test-user-cypress');


      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 3);

      cy.get('@flightTravels').first().as('firstFlightTravel');

      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'MAD')
      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'UIO')

      cy.get('[data-test-id="total-kg-co2"]').should('not.equal', '0');

    })

    it('adds a basic flight travel to the list of users travels', async () => {
      cy.visit('/test-user-cypress');


      // Arrange
      const fromIataCode = "BRU"
      const toIataCode = "MAD"
      typeInsideInput('from', fromIataCode);
      typeInsideInput('to', toIataCode);

      cy.get('[data-test-id="add-travel-form-outbound-date"]').type('2023-05-09');

      // Act
      cy.get('[data-test-id="add-travel-btn"]').click();

      // Assert

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');
      cy.get('@flightTravels').should('have.length', 4);
      cy.get('@flightTravels').last().as('lastFlightTravel');

      checkAddedTravelIsCorrect('lastFlightTravel');




    });

    it('adds a complex flight travel (with return flight and connections) to the list of users travels', () => {
      cy.visit('/test-user-cypress');

      // Arrange
      const fromIataCode = "BRU"
      const toIataCode = "UIO"
      const outboundConnectionIataCode = 'AMS';
      const inboundConnectionIataCode = 'JFK';
      typeInsideInput('from', fromIataCode);
      typeInsideInput('to', toIataCode);
      typeInsideInput('outbound-connection', outboundConnectionIataCode);
      typeInsideInput('inbound-connection', inboundConnectionIataCode);

      cy.get('[data-test-id="add-travel-form-outbound-date"]').type('2023-05-09');
      cy.get('[data-test-id="add-travel-form-inbound-date"]').type('2023-05-28');

      // Act
      cy.get('[data-test-id="add-travel-btn"]').click();

      // Assert
      cy.get('[data-test-id="flight-travel"]').as('flightTravels');
      cy.get('@flightTravels').should('have.length', 4);
      cy.get('@flightTravels').last().as('lastFlightTravel');

      checkAddedTravelIsCorrect('lastFlightTravel', { checkOutboundConnection: true, checkInboundConnection: true });
    });

    it('edits a basic flight travel and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      // Editing the flight
      cy.get('[data-test-id="row-edit-travel-btn"]').eq(1).click();

      cy.get('[data-test-id="edit-travel-form-to-iata-code"]').select("PRG");

      cy.get('[data-test-id="edit-travel-form-outbound-date"]').type("2023-09-04");
      cy.get('[data-test-id="edit-travel-btn"]').click();

      // Checking if it's correctly edited

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 3);

      cy.get('@flightTravels').eq(1).as('secondFlightTravel');

      cy.get('@secondFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'CDG')
      cy.get('@secondFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'PRG')
      cy.get('@secondFlightTravel').find('[data-test-id="flight-travel-outbound-date"]').should('have.text', '4 septembre 2023')
    });

    it('edits a complex flight travel (with connections and return flights) and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      // Editing the flight
      cy.get('[data-test-id="row-edit-travel-btn"]').first().click();

      cy.get('[data-test-id="edit-travel-form-to-iata-code"]').select("PRG");
      cy.get('[data-test-id="edit-travel-form-inbound-connection"]').select("BRU");
      cy.get('[data-test-id="edit-travel-form-inbound-date"]').type("2023-09-24");
      cy.get('[data-test-id="edit-travel-btn"]').click();

      // Checking if it's correctly edited

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 3);

      cy.get('@flightTravels').first().as('firstFlightTravel');

      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'MAD')
      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'PRG')
      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-inbound-date"]').should('have.text', '24 septembre 2023')
    });

    it('deletes a flight travel and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      // Deleting the flight
      cy.get('[data-test-id="row-delete-travel-btn"]').first().click();

      // Checking it doesn't appear anymore in the list
      cy.get('[data-test-id="flight-travel"]').as('flightTravels');
      cy.get('@flightTravels').should('have.length', 2);
      cy.get('@flightTravels').first().as('firstFlightTravel');

      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'CDG')
      cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'DUB')
    })
  })
})

function typeInsideInput(inputType: 'from' | 'to' | 'outbound-connection' | 'inbound-connection', where: string) {
  cy.get(`[data-test-id="add-travel-${inputType}-input"]`).type(where);
  cy.get(`[data-test-id="autocomplete-results-${inputType}-div"]`).as('autocomplete');

  cy.get('@autocomplete').children().first().click();
  cy.get(`[data-test-id="airport-${inputType}-span"]`).then(($span) => {
    const spanText = $span.text();
    expect(spanText.toLowerCase()).to.contain(where.toLowerCase());
  });
}

function checkAddedTravelIsCorrect(alias: string,
  check: { checkOutboundConnection?: boolean, checkInboundConnection?: boolean } = { checkOutboundConnection: false, checkInboundConnection: false }) {
  cy.get(`@${alias}`)
    .find('[data-test-id="flight-travel-from"]')
    .then(($span) => {
      const fromText = $span.text();
      cy.get('[data-test-id="add-travel-from-input"]').should('have.value', fromText);;
    });

  cy.get(`@${alias}`)
    .find('[data-test-id="flight-travel-to"]')
    .then(($span) => {
      const toText = $span.text();
      cy.get('[data-test-id="add-travel-to-input"]').should('have.value', toText);;
    });

  if (check.checkOutboundConnection) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-outbound-connection"]')
      .then(($span) => {
        const outboundConnectionText = $span.text();
        cy.get('[data-test-id="add-travel-outbound-connection-input"]').should('have.value', outboundConnectionText);
      });
  }

  if (check.checkInboundConnection) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-inbound-connection"]')
      .then(($span) => {
        const inboundConnectionText = $span.text();
        cy.get('[data-test-id="add-travel-inbound-connection-input"]').should('have.value', inboundConnectionText);
      });
  }

}


