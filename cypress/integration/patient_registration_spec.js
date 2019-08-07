var appHostName = 'https://local.quantimo.do';
var unixTime = Math.floor(Date.now() / 1000);
var physicianOAuthUrl = appHostName+ '/api/v1/oauth/authorize?response_type=token&scope=readmeasurements&client_id=m-thinkbynumbers-org';
var registerUrl = appHostName+ '/api/v2/auth/register';
var usernameInput = '#username-group > input';
var emailInput = '#email-group > input';
var pw = '#password-group > input';
var pwConfirm = '#password-confirm-group > input';
var registerButton = '#register-button-group > div > input.btn.btn-primary';
var acceptButton = '#button-approve';

describe('Existing Username Test', function() {
    it('Creates an Account and is sent back the the OAuth url', function() {
        cy.clearCookies();
        cy.visit(registerUrl);
        cy.get(usernameInput).type('mike');
        cy.get(emailInput).type('testuser'+unixTime+'@gmail.com');
        cy.get(pw).type('testing123');
        cy.get(pwConfirm).type('testing123');
        cy.get(registerButton).click();
    })
});

describe('Physician Auth Test', function() {
    it('Creates an Account and is sent back the the OAuth url', function() {
        cy.clearCookies();
        cy.visit(physicianOAuthUrl);
        cy.get(usernameInput).type('testuser'+unixTime);
        cy.get(emailInput).type('testuser'+unixTime+'@gmail.com');
        cy.get(pw).type('testing123');
        cy.get(pwConfirm).type('testing123');
        cy.get(registerButton).click();
        cy.url().should('include', physicianOAuthUrl);
        cy.get(acceptButton).click();
        cy.url().should('include', physicianOAuthUrl);
    })
});

