describe('RootWebController (e2e)', () => {



  it('connects to homepage', () => {
    cy.visit('/');
    cy.get('[data-test-id="welcome-message"]').should('include.text', 'Logge-toi avec ton user');
  })

  describe('Flight travels', () => {

    beforeEach(() => {
      cy.task("db:seed");
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

    it('adds a basic flight travel to the list of users travels', () => {
      cy.visit('/test-user-cypress');

      // adding a flight
      cy.get('[data-test-id="add-travel-form-from-iata-code"]').select('BRU', { force: true });
      cy.get('[data-test-id="add-travel-form-to-iata-code"]').select('UIO');
      cy.get('[data-test-id="add-travel-form-outbound-date"]').type('2023-05-09');


      cy.get('[data-test-id="add-travel-btn"]').click();

      // checking it has been added

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 4);

      cy.get('@flightTravels').last().as('lastFlightTravel');

      cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'BRU')
      cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'UIO')
    });

    it('adds a complex flight travel (with return flight and connections) to the list of users travels', () => {
      cy.visit('/test-user-cypress');

      // adding a flight
      cy.get('[data-test-id="add-travel-form-from-iata-code"]').select('BRU', { force: true });
      cy.get('[data-test-id="add-travel-form-to-iata-code"]').select('UIO');
      cy.get('[data-test-id="add-travel-form-outbound-date"]').type('2023-05-09');
      cy.get('[data-test-id="add-travel-form-inbound-date"]').type('2023-05-28');
      cy.get('[data-test-id="add-travel-form-outbound-connection"').select('AMS');
      cy.get('[data-test-id="add-travel-form-inbound-connection"]').select('JFK')

      cy.get('[data-test-id="add-travel-btn"]').click();

      // checking it has been added

      cy.get('[data-test-id="flight-travel"]').as('flightTravels');

      cy.get('@flightTravels').should('have.length', 4);

      cy.get('@flightTravels').last().as('lastFlightTravel');

      cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'BRU')
      cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'UIO')
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

  describe.only('Airports', () => {

    beforeEach(() => {
      cy.intercept('GET', '**/api/airports?q=PAR', { fixture: 'get-airports-PAR.fixture.json' })
    })

    it('retrieves a list of airport and selects one airport', () => {
      cy.visit('/test-user-cypress');

      cy.get('[data-test-id="search-travel-from"]').type('PAR');


      cy.get('[data-test-id="autocomplete-results"]').as('autocomplete');

      cy.get('@autocomplete').children().last().as('lastAutocompleteResult');

      // Cliquer sur un div spécifique dans autocomplete-results
      cy.get('@lastAutocompleteResult').click().then(($div) => {
        const selectedItemText = $div.text();

        // Vérifier si airports-results-span a été mis à jour avec la même valeur
        cy.get('.airports-results-span').should('include.text', selectedItemText);
      });
    })

    it.only('retrieves a list of airport and moves to the first airport then to the next one using keyboard', () => {
      cy.visit('/test-user-cypress');

      cy.get('[data-test-id="search-travel-from"]').as('searchInput');

      cy.get('@searchInput').type('PAR');

      cy.get('@searchInput').type('{downarrow}');
      cy.get('@searchInput').type('{downarrow}');

      cy.get('.result-item.selected').should('contain.text', 'ORY');






    })
  })

})



