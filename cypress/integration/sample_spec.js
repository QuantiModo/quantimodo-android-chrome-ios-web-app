describe('Physician Auth Test', function() {
    it('Creates an Account and is sent back the the OAuth url', function() {
        var unixtime = Math.floor(Date.now() / 1000);
        var authUrl = 'https://local.quantimo.do/api/v1/oauth/authorize?response_type=token&scope=readmeasurements&client_id=m-thinkbynumbers-org';
        cy.visit(authUrl);
        //var loginPageLink = '#login-page-link';
        //cy.get(loginPageLink).click();
        var emailSelector = '#form-login > div.panel-body.col-sm-offset-3 > div.col-xs-12.col-sm-8 > form > div:nth-child(2) > div > div > input';
        cy.get(emailSelector).type('testuser'+unixtime+'@gmail.com');
        var pw1 = '#form-login > div.panel-body.col-sm-offset-3 > div.col-xs-12.col-sm-8 > form > div:nth-child(3) > div > div > input';
        cy.get(pw1).type('testing123');
        var pw2 = '#form-login > div.panel-body.col-sm-offset-3 > div.col-xs-12.col-sm-8 > form > div:nth-child(4) > div > div > input';
        cy.get(pw2).type('testing123');
        var submitButton = '#form-login > div.panel-body.col-sm-offset-3 > div.col-xs-12.col-sm-8 > form > div:nth-child(6) > div > input.btn.btn-primary';
        cy.get(submitButton).click();
        cy.url().should('include', authUrl);
        var acceptButton = '#button-approve';
        cy.get(acceptButton).click();
        cy.url().should('include', authUrl);
    })
})