import { randomString } from '../../../support/commands';

describe.skip('Content builder Text component', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.visit(`/admin/projects/${projectId}/description`);
        cy.get('#e2e-toggle-enable-content-builder')
          .find('input')
          .click({ force: true });
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Text component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes Text component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-single-column').should('be.visible');

    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-single-column').should('be.visible');
    cy.contains('Edited text.').should('not.exist');
  });
});
