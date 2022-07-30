import {faker} from '@faker-js/faker';
import supertest from 'supertest';


import { prisma } from '../../src/database.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import app from '../../src/app.js';
import recommendationsFactory from '../factories/recommendationsFactory.js';
import scenarioFactory from '../factories/scenarioFactory.js';

beforeEach(async()=>{
  await scenarioFactory.deleteAllData();
});

const agent = supertest(app);

const recommendation = {
  name: faker.music.songName(),
  youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
};

describe('POST/recommendation', ()=>{
  it('Given valids inputs, should create a recommendation', async ()=>{
    await agent.post('/recommendations').send(recommendation);

    const createdRecommendation = await prisma.recommendation.findFirst({
      where:{
        name: recommendation.name
      }
    });

    expect(createdRecommendation).not.toBeNull();
  });

  it('Given an empty name input and valid youtubeLink input, should return 422 code', async()=>{
    const recommendation = {
      name: '',
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    const response = await agent.post('/recommendations').send(recommendation);

    expect(response.status).toBe(422);
  });

  it('Given a valid name input and an empty youtubeLink input, should return 422 code', async()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: ''
    };

    const response = await agent.post('/recommendations').send(recommendation);

    expect(response.status).toBe(422);
  });

  it('Given a valid name input and an invalid Link, should return 422 code', async()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: faker.internet.url()
    };

    const response = await agent.post('/recommendations').send(recommendation);

    expect(response.status).toBe(422);
  });
});

describe('POST/:id/upvote',()=>{
  it('Given a valid id, should return upvotes number = 1', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);

    await agent.post(`/recommendations/${id}/upvote`);
    const insertedRecommendation = await recommendationRepository.find(id);

    expect(insertedRecommendation.score).toBe(1);
  });

  it('Given a valid id, should return upvotes number = 2 when recommendation has score number = 1', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);

    await agent.post(`/recommendations/${id}/upvote`);
    await agent.post(`/recommendations/${id}/upvote`);
    const insertedRecommendation = await recommendationRepository.find(id);

    expect(insertedRecommendation.score).toBe(2);
  });

  it('Given a non-existing id, should return status 404', async()=>{
    await recommendationsFactory.insert(recommendation);

    const response = await agent.post('/recommendations/298/upvote');

    expect(response.status).toBe(404);
  });

  it('Given an invalid id, should return status 500', async()=>{
    await recommendationsFactory.insert(recommendation);

    const response = await agent.post('/recommendations/banana/upvote');

    expect(response.status).toBe(500);
  });
});

describe('POST/:id/downvote',()=>{
  it('Given a valid id, should return upvotes number = -1', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);

    await agent.post(`/recommendations/${id}/downvote`);
    const insertedRecommendation = await recommendationRepository.find(id);

    expect(insertedRecommendation.score).toBe(-1);
  });

  it('Given a valid id, should return upvotes number = 0 when recommendation has score number = 1', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);

    await agent.post(`/recommendations/${id}/upvote`);
    await agent.post(`/recommendations/${id}/downvote`);
    const insertedRecommendation = await recommendationRepository.find(id);

    expect(insertedRecommendation.score).toBe(0);
  });

  it('Should remove a recommendation if score < -5', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);

    await recommendationsFactory.insertVotes(id, -5);

    await agent.post(`/recommendations/${id}/downvote`);

    const insertedRecommendation = await recommendationRepository.find(id);
    console.log(insertedRecommendation);

    expect(insertedRecommendation).toBeNull;
  });

  it('Given a non-existing id, should return status 404', async()=>{
    await recommendationsFactory.insert(recommendation);

    const response = await agent.post('/recommendations/298/upvote');

    expect(response.status).toBe(404);
  });

  it('Given an invalid id, should return status 500', async()=>{
    await recommendationsFactory.insert(recommendation);

    const response = await agent.post('/recommendations/banana/upvote');

    expect(response.status).toBe(500);
  });
});

describe('GET/recommendations',()=>{
  it('Should return an array of recommendations with length = 1', async()=>{
    await recommendationsFactory.insert(recommendation);

    const recommendations = await agent.get('/recommendations');
    expect(recommendations.body.length).toBe(1);
  });

  it('Should return an array of recommendations with length = 2', async()=>{
    const recommendation2 = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    await recommendationsFactory.insert(recommendation);
    await recommendationsFactory.insert(recommendation2);

    const recommendations = await agent.get('/recommendations');
    expect(recommendations.body.length).toBe(2);
  });

  it('Considering 20 recommendations registred on Database, Should return an array of recommendations with length = 10', async()=>{
    await recommendationsFactory.insertMany(20, 0);
    const recommendations = await agent.get('/recommendations');
    expect(recommendations.body.length).toBe(10);
  });
});

describe('GET/recommendations/:id',()=>{
  it('Given a valid id, should return a recommendation with the same id', async()=>{
    const {id} = await recommendationsFactory.insert(recommendation);
    const response = await agent.get(`/recommendations/${id}`);
    expect(response.body.id).toBe(id);
  });

  it('Given a non-existing id, should return status 404', async()=>{
    await recommendationsFactory.insert(recommendation);
    const response = await agent.get('/recommendations/999');
    expect(response.status).toBe(404);
  });

  it('Given an invalid id, should return status 500', async()=>{
    await recommendationsFactory.insert(recommendation);
    const response = await agent.get('/recommendations/banana');
    expect(response.status).toBe(500);
  });
});

describe('GET/recommendations/top/:amount',()=>{
  it('Should return an Array with the 5 recommendations with the highest scores', async()=>{
    const insertedRecommendations = await recommendationsFactory.insertMany(20, 100);
    const highestScoresIds = [];
    for(let i = 0; i < 10; i++) {
      await recommendationsFactory.insertVotes(insertedRecommendations[i].id, 101 + i);
      highestScoresIds.push(insertedRecommendations[i].id);
    }
    
    const response = await agent.get('/recommendations/top/5');

    expect(response.body.length).toBe(5);
  });

  it('Given a non-existing id, should return status 404', async()=>{
    await recommendationsFactory.insert(recommendation);
    const response = await agent.get('/recommendations/999');
    expect(response.status).toBe(404);
  });

  it('Given an invalid id, should return status 500', async()=>{
    await recommendationsFactory.insert(recommendation);
    const response = await agent.get('/recommendations/banana');
    expect(response.status).toBe(500);
  });
});

describe('GET/recommendations/random',()=>{
  it('Should return an recommendation', async()=>{
    await recommendationsFactory.insertMany(20, 100);
    
    const response = await agent.get('/recommendations/random');

    expect(response.body).not.toBeNull;
  });

  it('When no recommendations are registred on Database, should return status 404', async()=>{
    const response = await agent.get('/recommendations/random');
    expect(response.status).toBe(404);
  });
});

