import { faker } from '@faker-js/faker';


import { prisma } from '../../src/database.js';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';

async function insert(recommendation: CreateRecommendationData){
  return await prisma.recommendation.create({
    data: recommendation
  });
}

async function insertTwenty() {
  const INSERT_AMOUNT = 20;
  const insertedRecommendations = [];
  for (let i = 0; i < INSERT_AMOUNT; i++) {
    console.log('entrou no for');
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    const insertedRecommendation =  await prisma.recommendation.create({
      data: recommendation
    });
    insertedRecommendations.push(insertedRecommendation);
  }
  return insertedRecommendations;
}

async function insertFiveDownVotes(id: number) {
  return await prisma.recommendation.update({
    where:{
      id: id
    },
    data:{
      score: -5
    }
  });
}

const recommendationsFactory = {
  insert,
  insertTwenty,
  insertFiveDownVotes
};

export default recommendationsFactory;