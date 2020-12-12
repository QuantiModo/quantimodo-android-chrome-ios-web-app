// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('WordPress', function(){
    function htmlAtUrlContains(urlWithoutSlashAtEnd, expected){
        cy.visit(urlWithoutSlashAtEnd)
        cy.get('html').should('contain', expected)
        cy.visit(urlWithoutSlashAtEnd + '/')
        cy.get('html', {timeout: 30000}).should('contain', expected)
    }
    function iFrameAttUrlContains(urlWithoutSlashAtEnd, expected){
        cy.visit(urlWithoutSlashAtEnd)
        cy.getWithinIframe('html').should('contain', expected)
        cy.visit(urlWithoutSlashAtEnd + '/')
        cy.getWithinIframe('html', {timeout: 30000}).should('contain', expected)
    }
    it('Checks the privacy policy', function(){
        cy.visit('https://quantimo.do')
        cy.get('a[href*="/privacy-policy/"]').click({force: true})
        cy.getWithinIframe('html').should('contain', 'committed to protecting')

        iFrameAttUrlContains('https://quantimo.do/privacy-policy', 'committed to protecting')
    })
    it('Clicks pricing page link', function(){
        cy.visit('https://quantimo.do')
        cy.get('a').contains("Pricing").click({force: true})
        cy.get('a').contains("Request Demo").should('exist')

        htmlAtUrlContains('https://quantimo.do/pricing', "Pricing")
    })
    it('Clicks the Drift chat button', function(){
        cy.visit('https://quantimo.do')
        cy.get('.template-page > .wrap-content > #post-18196 > .article-content > .container-wrap:nth-child(3)',
            {timeout: 20000}).click({force: true, multiple: true})
    })
    it('Clicks to email mike', function(){
        cy.visit('https://quantimo.do')
        cy.get('a[href="mailto:mike@quantimo.do"]').should('exist')
    })
    it('Checks the data sources page', function(){
        cy.visit('https://quantimo.do')
        cy.get('a[href*="/data-sources/"]').click({force: true})
        cy.get('#post-18731 > div > div.portfolio-header > h3 > a').click({force: true})
        cy.get('#feature-bullets > ul > li:nth-child(1) > span').should('contain', 'Ultra precise weight')
    })
    it('Clicks the QuantiModo floating action button', function(){
        cy.visit('https://quantimo.do')
        cy.get('#single-floating-action-button').click({force: true, multiple: true})
    })
    it('Checks the end user terms of service', function(){
        cy.visit('https://quantimo.do')
        cy.get('a[href*="/end-user-terms-of-service/"]').click({force: true})
        cy.get('html').should('contain', 'End Users authorize')

        htmlAtUrlContains('https://quantimo.do/tos', 'End Users authorize')
    })
    it('Checks the data security page', function(){
        cy.visit('https://quantimo.do')
        cy.get('a[href*="/developer-platform/security/"]').click({force: true})
        cy.get('html').should('contain', 'Data Encryption')

        htmlAtUrlContains('https://quantimo.do/developer-platform/security', 'Data Encryption')
    })
})
