describe('E2E: register then login', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should register (201) and then login (200)', () => {
    cy.intercept('POST', '**/api/auth/register').as('registerRequest');
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    const timestamp = Date.now();
    const emailTest = `cypress${timestamp}@example.com`;
    const passwordTest = 'Password123!';

    cy.visit('/register');

    cy.get('#displayName').should('exist').clear().type(`cypress ${timestamp}`);
    cy.get('#dateOfBirth').should('exist').clear().type('1990-01-01');
    cy.get('#email').should('exist').clear().type(emailTest);
    cy.get('#phone').should('exist').clear().type('1234567890');
    cy.get('#password').should('exist').clear().type(passwordTest);
    cy.get('#repeatPassword').should('exist').clear().type(passwordTest);

    cy.get('button[type="submit"]')
      .should('exist')
      .should('not.be.disabled')
      .click();

    cy.wait('@registerRequest', { timeout: 15000 }).then((interception) => {
      expect(interception.response, 'register response').to.not.be.undefined;
      expect(interception.response!.statusCode).to.equal(201);
    });

    cy.visit('/login');

    cy.get('input[type="email"]')
      .should('exist')
      .clear()
      .type(emailTest);

    cy.get('input[type="password"]')
      .should('exist')
      .clear()
      .type(passwordTest);

    cy.get('button[type="submit"]')
      .should('exist')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
      expect(interception.response, 'login response').to.not.be.undefined;
      expect(interception.response!.statusCode).to.equal(200);
    });

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });

    cy.url({ timeout: 10000 }).should('not.include', '/login');
  });
});
