describe('E2E: login and add a product to cart', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('login with existing user and add product to cart', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/products*').as('getProducts');
    cy.intercept('POST', '**/api/cart/add-product').as('addToCart');

    cy.visit('/login');

    cy.get('input[type="email"]')
      .should('exist')
      .clear()
      .type('brunodunay@outlook.com');

    cy.get('input[type="password"]')
      .should('exist')
      .clear()
      .type('Password123');

    cy.get('button[type="submit"]')
      .should('exist')
      .should('not.be.disabled')
      .click();

    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      expect(interception.response, 'login response').to.not.be.undefined;
      expect(interception.response!.statusCode).to.equal(200);
    });

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.not.be.null;
    });

    cy.visit('/products');

    cy.wait('@getProducts', { timeout: 10000 }).then((interception) => {
      expect(interception.response, 'products response').to.not.be.undefined;
      expect(interception.response!.statusCode).to.equal(200);
    });

    cy.get('[data-cy="product-card"]', { timeout: 10000 })
      .should('have.length.at.least', 1)
      .first()
      .as('firstProduct');

    cy.get('@firstProduct')
      .find('[data-cy="add-to-cart-btn"]')
      .should('exist')
      .click();

    cy.wait('@addToCart', { timeout: 10000 }).then((interception) => {
      expect(interception.response, 'add to cart response').to.not.be.undefined;
      expect(interception.response!.statusCode).to.equal(200);
    });
  });
});
