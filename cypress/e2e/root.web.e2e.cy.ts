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

      checkTravelIsCorrectInListOfTravels('firstFlightTravel', { from: 'MAD', to: 'UIO' });


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

      checkTravelIsCorrectInListOfTravels('lastFlightTravel', { from: 'BRU', to: 'MAD' });

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

      checkTravelIsCorrectInListOfTravels('lastFlightTravel', { from: 'BRU', to: 'UIO', outboundConnection: 'AMS', inboundConnection: 'JFK' });
    });

    it('edits a basic flight travel and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      cy.get('[data-test-id="row-edit-travel-btn"]').eq(1).click();

      checkFormInputsAreCorrect({ from: 'CDG', to: 'DUB', outboundDate: '2023-09-03' })

      // Arrange
      // Editing the flight
      // const fromIataCode = "BRU"
      const toIataCode = "PRG";
      typeInsideInput('to', toIataCode);
      cy.get('[data-test-id="add-travel-form-outbound-date"]').type("2023-09-04");

      // Act
      cy.get('[data-test-id="add-travel-btn"]').click();


      // Assert

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 3);

      cy.get('@flightTravels').eq(1).as('secondFlightTravel');

      checkTravelIsCorrectInListOfTravels('secondFlightTravel', { from: 'CDG', to: toIataCode, outboundDate: '4 septembre 2023' });

    });

    it('edits a complex flight travel (with connections and return flights) and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      // Editing the flight
      cy.get('[data-test-id="row-edit-travel-btn"]').first().click();

      checkFormInputsAreCorrect({ from: 'MAD', to: 'UIO', outboundConnection: 'AMS', inboundConnection: 'BOG', outboundDate: '2023-09-10', inboundDate: '2023-09-25' });


      // Arrange

      const toIataCode = "PRG";
      const inboundConnectionIataCode = "BRU";
      const inboundDate = "2023-09-24";

      typeInsideInput('to', toIataCode);
      typeInsideInput('inbound-connection', inboundConnectionIataCode);
      cy.get('[data-test-id="add-travel-form-inbound-date"]').type(inboundDate);

      // Act
      cy.get('[data-test-id="add-travel-btn"]').click();

      // Assert

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 3);

      cy.get('@flightTravels').first().as('firstFlightTravel');

      checkTravelIsCorrectInListOfTravels('firstFlightTravel', { from: 'MAD', to: toIataCode, inboundConnection: inboundConnectionIataCode, inboundDate: '24 septembre 2023' });
    });

    it('deletes a flight travel and updates the list of users travels', () => {

      cy.visit('/test-user-cypress');

      // Deleting the flight
      cy.get('[data-test-id="row-delete-travel-btn"]').first().click();

      // Checking it doesn't appear anymore in the list
      cy.get('[data-test-id="flight-travel"]').as('flightTravels');
      cy.get('@flightTravels').should('have.length', 2);
      cy.get('@flightTravels').first().as('firstFlightTravel');

      checkTravelIsCorrectInListOfTravels('firstFlightTravel', { from: 'CDG', to: 'DUB' });
    })
  })
})

function typeInsideInput(inputType: 'from' | 'to' | 'outbound-connection' | 'inbound-connection', where: string) {
  cy.get(`[data-test-id="add-travel-${inputType}-input"]`).clear();
  cy.get(`[data-test-id="add-travel-${inputType}-input"]`).type(where);
  cy.get(`[data-test-id="autocomplete-results-${inputType}-div"]`).as('autocomplete');

  cy.get('@autocomplete').children().first().click();
  cy.get(`[data-test-id="airport-${inputType}-span"]`).then(($span) => {
    const spanText = $span.text();
    expect(spanText.toLowerCase()).to.contain(where.toLowerCase());
  });
}

function checkTravelIsCorrectInListOfTravels(alias: string,
  expected: { from: string, to: string, outboundConnection?: string, inboundConnection?: string, outboundDate?: string, inboundDate?: string }) {

  cy.get(`@${alias}`)
    .find('[data-test-id="flight-travel-from"]').should('contain.text', expected.from);

  cy.get(`@${alias}`)
    .find('[data-test-id="flight-travel-to"]').should('contain.text', expected.to);

  if (expected.outboundConnection) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-outbound-connection"]').should('contain.text', expected.outboundConnection);
  }

  if (expected.inboundConnection) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-inbound-connection"]').should('contain.text', expected.inboundConnection);
  }

  if (expected.outboundDate) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-outbound-date"]').should('have.text', expected.outboundDate);
  }

  if (expected.inboundDate) {
    cy.get(`@${alias}`)
      .find('[data-test-id="flight-travel-inbound-date"]').should('have.text', expected.inboundDate);
  }

}

/**
 * 
 * @param expected 
 * 
 */
function checkFormInputsAreCorrect(expected: { from: string; to: string; outboundConnection?: string; inboundConnection?: string; outboundDate: string; inboundDate?: string; }) {
  cy.get('[data-test-id="add-travel-from-input"]').should('have.value', expected.from);
  cy.get('[data-test-id="add-travel-to-input"]').should('have.value', expected.to);
  cy.get('[data-test-id="add-travel-form-outbound-date"]').should('have.value', expected.outboundDate);
  if (expected.outboundConnection)
    cy.get('[data-test-id="add-travel-outbound-connection-input"]').should('have.value', expected.outboundConnection);
  if (expected.inboundConnection)
    cy.get('[data-test-id="add-travel-inbound-connection-input"]').should('have.value', expected.inboundConnection);
  if (expected.inboundDate)
    cy.get('[data-test-id="add-travel-form-inbound-date"]').should('have.value', expected.inboundDate);
}

