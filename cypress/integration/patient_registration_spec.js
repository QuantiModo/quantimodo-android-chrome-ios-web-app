var appHostName = process.env.APP_HOST_NAME || 'https://local.quantimo.do';
var unixTime = Math.floor(Date.now() / 1000);
var urls = {
    demo: {
        importPage: "https://demo.quantimo.do/#/app/import"
    },
    import: appHostName+ '/import',
    register: appHostName+ '/api/v2/auth/register',
    physicianOAuth: appHostName+ '/api/v1/oauth/authorize?response_type=token&scope=readmeasurements&client_id=m-thinkbynumbers-org',
};
var selectors = {
    usernameInput:'#username-group > input',
    emailInput:'#email-group > input',
    pw:'#password-group > input',
    pwConfirm:'#password-confirm-group > input',
    registerButton:'#submit-button-group > div > input.btn.btn-primary',
    acceptButton:'#button-approve',
    errorMessageSelector:'#error-messages > li',
};
var testUsername = 'testuser'+unixTime;
var testEmail = 'testuser'+unixTime+'@gmail.com';
function enterPasswordsAndClickRegister(){
    cy.get(selectors.pw).type('testing123');
    cy.get(selectors.pwConfirm).type('testing123');
    cy.get(selectors.registerButton).click();
}
function validRegistration(){
    changeTestUsernameAndEmail();
    cy.get(selectors.usernameInput)
        .clear()
        .type(testUsername);
    cy.get(selectors.emailInput)
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
    it.only('Check demo page', function() {
        cy.clearCookies();
        cy.visit(urls.demo.importPage);
        try {
            cy.get("#connect-weather-button").click();
        } catch (e) {
            console.info(e.message);
        }
    });
    it('Connect Canada Weather', function() {
        cy.clearCookies();
        cy.visit(urls.import+"?accessToken=demo");
        try {
            cy.get("#connect-weather-button").click();
        } catch (e) {
            console.info(e.message);
        }
    });
    it('Patient creates account and is sent to OAuth url', function() {
        cy.clearCookies();
        cy.visit(urls.physicianOAuth);
        validRegistration();
        cy.url().should('include', urls.physicianOAuth);
        cy.get(selectors.acceptButton).click();
        checkIntroWithAccessToken();
        skipIntro();
    });
    it('Tries to create account with existing username', function() {
        cy.clearCookies();
        cy.visit(urls.register);
        cy.get(selectors.usernameInput).type('mike');
        cy.get(selectors.emailInput).type(testEmail);
        enterPasswordsAndClickRegister();
        cy.contains(selectors.errorMessageSelector, 'The user login has already been taken.');
        validRegistration();
        checkIntroWithAccessToken();
    });
});
