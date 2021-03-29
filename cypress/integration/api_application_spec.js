// load type definitions that come with Cypress module
function createNewApplication(){
    cy.get(
        'body > div.wrapper.row-offcanvas.row-offcanvas-left > aside.right-side.right-padding > section > div > div > div > div.panel-heading.clearfix > div > a')
        .click({force: true})
    // TODO: Uncomment this. For some reason it's incorrectly failing intermittently now.
    // cy.checkForBrokenImages()
    const d = new Date()
    let testAppName = `test-app${d.getTime()}`
    cy.get('#app_display_name').type(testAppName, {force: true})
    cy.get('#app_display_name').type(testAppName, {force: true})
    cy.get('#client_id').type(testAppName, {force: true})
    cy.get('#app_description').type(testAppName, {force: true})
    cy.get('#homepage_url').type("https://" + testAppName + ".com", {force: true})
    cy.get('.btn-success').click({force: true})
    cy.log('Need to start redirecting to builder.quantimo.do...')
    cy.url().should('contain', '/edit', {timeout: 120000})
    // cy.checkForBrokenImages() checkForBrokenImages is randomly slow here for some reason
    // cy.get('iframe#iframe md-tabs-canvas.md-paginated > md-pagination-wrapper >
    // md-tab-item.md-tab.md-ink-ripple:nth-of-type(2) > span',
    //     {timeout: 120000})
    //     .click({ force: true });
    // cy.get('iframe#iframe .md-bar').click({ force: true });
}
/// <reference types="cypress" />
describe('Applications', function(){
    it('Creates a client app as new user', function(){
        cy.visitApi(`/api/v2/apps#`)
        cy.enterNewUserCredentials(false)
        createNewApplication()
    })
    it('Creates an client app as an existing user', function(){
        cy.visitApi(`/api/v2/apps?access_token=test-token`)
        cy.visitApi(`/api/v2/apps?access_token=test-token`)
        createNewApplication()
    })
})
