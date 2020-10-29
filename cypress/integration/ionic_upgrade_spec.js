// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('Upgrade', function () {
  it('Enters credit card info', function () {
    if(!cy.oauthAppIsHTTPS()){
        cy.log("Skipping because Stripe requires HTTPS and url is "+cy.getOAuthAppUrl())
        return;
    }
    cy.visitIonicAndSetApiUrl('/#/app/upgrade?access_token=test-token&debug=true')
      cy.log("Going to app/upgrade again in case we got redirected by leftover redirect from previous test")
    cy.visitIonicAndSetApiUrl('/#/app/upgrade?access_token=test-token&debug=true')
    cy.wait(5000)
    cy.getWithinIframe('[name="cardnumber"]').type('4242424242424242')
    cy.getWithinIframe('[name="exp-date"]').type('1232')
    cy.getWithinIframe('[name="cvc"]').type('987')
    cy.getWithinIframe('[name="postal"]').type('12345')
    cy.get('#upgrade-button').click({ force: true })
  })
})
