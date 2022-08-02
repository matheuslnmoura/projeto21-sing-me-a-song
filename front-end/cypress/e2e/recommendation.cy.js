/* eslint-disable no-undef */
/// <reference types = "cypress" />

import {faker} from '@faker-js/faker';

const URL = 'http://localhost:3000/'


describe('POST/recommendation',  () => {
  beforeEach(()=>{
    cy.resetDatabase()
    cy.visit(URL)
  })
  it('Should post a recommendation', () => {
    cy.intercept('POST', '/recommendations').as('postRecommendations')    
    cy.intercept('GET', '/recommendations').as('getRecommendations')
    const recommendationObj = {
      name: faker.music.songName(),
      link: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    }
    cy.get('#name').type(recommendationObj.name);
    cy.get('#link').type(recommendationObj.link)
    cy.get('#button').click()

    cy.wait('@postRecommendations')
    cy.wait('@getRecommendations')
    cy.contains(recommendationObj.name).should("be.visible")
    cy.end()
  })

  it('Given an invalid name, should return an error', ()=>{
    cy.intercept('POST', '/recommendations').as('postRecommendations')
    const recommendationObj = {
      name: faker.music.songName(),
      link: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    }
    cy.get('#link').type(recommendationObj.link)
    cy.get('#button').click()
    cy.wait('@postRecommendations')
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Error creating recommendation!');
    });
    cy.end()
  })

  it('Should go to home page', ()=>{
    cy.get('[data-cy="home-icon"]').click()
    cy.url().should('eq', `${URL}`)
  })

  it('Should go to top page', ()=>{
    cy.get('[data-cy="top-icon"]').click()
    cy.url().should('eq', `${URL}top`)
  })

  it('Should go to random page', ()=>{
    cy.get('[data-cy="random-icon"]').click()
    cy.url().should('eq', `${URL}random`)
  })

  it('Should upvote a recommendation', ()=>{
    cy.intercept('POST', '/recommendations').as('postRecommendations')    
    cy.intercept('GET', '/recommendations').as('getRecommendations')
    const recommendationObj = {
      name: faker.music.songName(),
      link: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
    }
    cy.get('#name').type(recommendationObj.name);
    cy.get('#link').type(recommendationObj.link)
    cy.get('#button').click()

    cy.wait('@postRecommendations')
    cy.wait('@getRecommendations')

    cy.intercept('POST', `/recommendations/1/upvote`).as('upvoteRecommendation')  

    cy.get('[data-cy="upvote-icon"]').click()
    cy.wait('@upvoteRecommendation')
    cy.get('[data-cy="score-info"]').should('contain', '1')
    cy.end()
  })

  it('Should downvote a recommendation', ()=>{
    cy.intercept('POST', '/recommendations').as('postRecommendations')    
    cy.intercept('GET', '/recommendations').as('getRecommendations')
    const recommendationObj = {
      name: faker.music.songName(),
      link: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
    }
    cy.get('#name').type(recommendationObj.name);
    cy.get('#link').type(recommendationObj.link)
    cy.get('#button').click()

    cy.wait('@postRecommendations')
    cy.wait('@getRecommendations')

    cy.intercept('POST', `/recommendations/1/downvote`).as('downvoteRecommendation')  

    cy.get('[data-cy="downvote-icon"]').click()
    cy.wait('@downvoteRecommendation')
    cy.get('[data-cy="score-info"]').should('contain', '-1')
    cy.end()
  })
})

