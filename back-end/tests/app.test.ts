import {faker} from '@faker-js/faker';
import supertest from 'supertest'


import { prisma } from '../src/database.js';
import app from './../src/app.js'
import recommendationsFactory from './factories/recommendationsFactory.js';
import scenarioFactory from './factories/scenarioFactory.js';

beforeEach(async()=>{
  await scenarioFactory.deleteAllData()
})

const agent = supertest(app);

const recommendation = {
  name: faker.music.songName(),
  youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
}

describe('create-recommendation', ()=>{
  it('Given valids inputs, should create a recommendation', async ()=>{
    await agent.post('/recommendations').send(recommendation)

    const createdRecommendation = await prisma.recommendation.findFirst({
      where:{
        name: recommendation.name
      }
    })

    expect(createdRecommendation).not.toBeNull();
  })

  it('Given an empty name input and valid youtubeLink input, should return 422 code', async()=>{
    const recommendation = {
      name: '',
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    }

    const response = await agent.post('/recommendations').send(recommendation)

    expect(response.status).toBe(422);
  })

  it('Given a valid name input and an empty youtubeLink input, should return 422 code', async()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: ''
    }

    const response = await agent.post('/recommendations').send(recommendation)

    expect(response.status).toBe(422);
  })

  it('Given a valid name input and an invalid Link, should return 422 code', async()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: faker.internet.url()
    }

    const response = await agent.post('/recommendations').send(recommendation)

    expect(response.status).toBe(422);
  })
})

describe('get-recommendations',()=>{
  it('Should return an array of recommendations', async()=>{
    await recommendationsFactory.insert(recommendation)

    const recommendations = await agent.get('/recommendations')

    expect(recommendations).not.toBeNull
  })
})