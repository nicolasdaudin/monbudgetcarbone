describe('RootWebController (e2e)', () => {

  beforeEach(() => {
    cy.task("db:seed");
  })

  it('connects to homepage', () => {
    cy.visit('/');
    cy.get('[data-testid="welcome-message"]').should('include.text', 'Logge-toi avec ton user');
  })

  it('connects and gets a list of test user travels', () => {
    cy.visit('/test-user-cypress');

    cy.get('[data-testid="message"]').should('include.text', 'test-user-cypress');

    cy.get('[data-test-id="flight-travel"]').as('flightTravels');

    cy.get('@flightTravels').should('have.length', 2);

    cy.get('@flightTravels').first().as('firstFlightTravel');

    cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-from"]').should('have.text', 'CDG')
    cy.get('@firstFlightTravel').find('[data-test-id="flight-travel-to"]').should('have.text', 'DUB')

    cy.get('[data-test-id="total-kg-co2"]').should('not.equal', '0');





  })


})



