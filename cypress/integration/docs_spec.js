// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('Docs', function () {
  let docsUrl = 'https://docs.quantimo.do'

  function expandAndTryOutEndpoint (sectionId) {
    cy.get(`${sectionId} > .opblock-summary.opblock-summary-get`)
            .click()
    cy.get('button.btn.try-out__btn').click()
    cy.get(':nth-child(1) > .response-col_description > .response-col_description__inner > .markdown > div > span > p')
            .should('contain', 'Successful operation')
    cy.get('.example').should('contain', '[')
    //cy.checkForBrokenImages() // checkForBrokenImages doesn't work for some reason
  }
  it('Tries out correlations', function () {
    cy.visit(docsUrl)
    let sectionId = '#operations-analytics-getCorrelations'

    expandAndTryOutEndpoint(sectionId)
    cy.get('table.parameters > tbody > tr:nth-of-type(2) > td.col.parameters-col_description > input[type="text"]')
            .click()
            .type('230')
  })
  it('Tries out units', function () {
    cy.visit(docsUrl)
    expandAndTryOutEndpoint('#operations-units-getUnits')
    cy.get(
      '#operations-units-getUnits > div:nth-of-type(2) > .opblock-body > .execute-wrapper > button.btn.execute.opblock-control__btn')
            .click({ force: true })
  })
})
