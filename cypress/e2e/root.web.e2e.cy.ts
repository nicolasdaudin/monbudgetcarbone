import axios from "axios";

describe('RootWebController (e2e)', () => {

  beforeEach(() => {
    cy.task("db:seed");
  })

  it('connects to homepage', () => {
    cy.visit('/');
    cy.get('[data-test-id="welcome-message"]').should('include.text', 'Logge-toi avec ton user');
  })

  it('gets a list of test user travels', () => {
    cy.visit('/test-user-cypress');

    cy.get('[data-test-id="message"]').should('include.text', 'test-user-cypress');

    cy.get('[data-test-id="flight-travel"]').as('flightTravels');

    cy.get('@flightTravels').should('have.length', 2);

    cy.get('@flightTravels').first().as('firstFlightTravel');

    cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'CDG')
    cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'DUB')

    cy.get('[data-test-id="total-kg-co2"]').should('not.equal', '0');

  })

  it.only('adds a flight travel to the list of users travels', () => {
    // await axios.post(`http://localhost:3000/api/flight-travels`, {
    //   fromIataCode: 'MAD',
    //   toIataCode: 'TLS',
    //   outboundDate: new Date('2023-08-30').toISOString(),
    //   user: 'test-user-cypress'
    // });

    cy.visit('/test-user-cypress');
    cy.get('[data-test-id="add-travel-form-from-iata-code"]').select('BRU', { force: true });
    cy.get('[data-test-id="add-travel-form-to-iata-code"]').select('UIO');
    cy.get('[data-test-id="add-travel-form-outbound-date"]').type('2023-05-09');
    cy.get('[data-test-id="add-travel-form-inbound-date"]').type('2023-05-28');
    cy.get('[data-test-id="add-travel-form-outbound-connection"').select('AMS');
    cy.get('[data-test-id="add-travel-form-inbound-connection"]').select('JFK')

    cy.get('[data-test-id="add-travel-btn"]').click();

    cy.get('[data-test-id="flight-travel"]').as('flightTravels');

    cy.get('@flightTravels').should('have.length', 3);

    cy.get('@flightTravels').last().as('lastFlightTravel');

    cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'BRU')
    cy.get('@lastFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'UIO')
  });


})



