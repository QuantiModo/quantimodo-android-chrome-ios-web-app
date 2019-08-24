var appHostName = process.env.APP_HOST_NAME || 'https://local.quantimo.do';
var unixTime = Math.floor(Date.now() / 1000);
var physicianOAuthUrl = appHostName+ '/api/v1/oauth/authorize?response_type=token&scope=readmeasurements&client_id=m-thinkbynumbers-org';
var importUrl = appHostName+ '/import';
var registerUrl = appHostName+ '/api/v2/auth/register';
var usernameInput = '#username-group > input';
var emailInput = '#email-group > input';
var pw = '#password-group > input';
var pwConfirm = '#password-confirm-group > input';
var registerButton = '#submit-button-group > div > input.btn.btn-primary';
var acceptButton = '#button-approve';
var errorMessageSelector = '#error-messages > li';
var testUsername = 'testuser'+unixTime;
var testEmail = 'testuser'+unixTime+'@gmail.com';
function enterPasswordsAndClickRegister(){
    cy.get(pw).type('testing123');
    cy.get(pwConfirm).type('testing123');
    cy.get(registerButton).click();
}
function validRegistration(){
    changeTestUsernameAndEmail();
    cy.get(usernameInput)
        .clear()
        .type(testUsername);
    cy.get(emailInput)
        .clear()
        .type(testEmail);
    enterPasswordsAndClickRegister();
}
function changeTestUsernameAndEmail(){
    unixTime = Math.floor(Date.now() / 1000);
    testUsername = 'testuser'+unixTime;
    testEmail = 'testuser'+unixTime+'@gmail.com';
}
function checkIntroWithAccessToken(){
    cy.url().should('include', 'intro');
    cy.url().should('include', 'quantimodoAccessToken');
}
function skipIntro(){
    cy.get('.menu-content > .view-container > .pane > .slider > .slider-slides').click();
    cy.get('.menu-content > .view-container > .pane > .slider > .slider-slides').click();
    cy.get('.pane > div > div > #disableSpeechButton > span').click();
    cy.get('.slider > .slider-slides > .slider-slide:nth-child(1) > .button-bar > #skipButtonIntro').click();
    cy.get('.slider > .slider-slides > .slider-slide:nth-child(1) > .button-bar > #skipButtonIntro').click();
}
describe('Auth Tests', function() {
    it.only('Connect Withings', function() {
        cy.clearCookies();
        cy.visit(importUrl+"?accessToken=demo");
        cy.get(acceptButton).click();
        checkIntroWithAccessToken();
        skipIntro();
    });
    it('Patient creates account and is sent to OAuth url', function() {
        cy.clearCookies();
        cy.visit(physicianOAuthUrl);
        validRegistration();
        cy.url().should('include', physicianOAuthUrl);
        cy.get(acceptButton).click();
        checkIntroWithAccessToken();
        skipIntro();
    });
    it('Tries to create account with existing username', function() {
        cy.clearCookies();
        cy.visit(registerUrl);
        cy.get(usernameInput).type('mike');
        cy.get(emailInput).type(testEmail);
        enterPasswordsAndClickRegister();
        cy.contains(errorMessageSelector, 'The user login has already been taken.');
        validRegistration();
        checkIntroWithAccessToken();
    });
});
