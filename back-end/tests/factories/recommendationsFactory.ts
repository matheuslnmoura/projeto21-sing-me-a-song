import { faker } from '@faker-js/faker';


import { prisma } from '../../src/database.js';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';

async function insert(recommendation: CreateRecommendationData){
  return await prisma.recommendation.create({
    data: recommendation
  });
}

async function insertMany(amount: number, score: number) {
  const INSERT_AMOUNT = amount;
  const insertedRecommendations = [];
  for (let i = 0; i < INSERT_AMOUNT; i++) {
    const recommendation = {
      name: faker.music.songName() + i,
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    const insertedRecommendation =  await prisma.recommendation.create({
      data: {
        ...recommendation,
        score
      }
    });
    insertedRecommendations.push(insertedRecommendation);
  }
  return insertedRecommendations;
}

async function insertVotes(id: number, score: number) {
  return await prisma.recommendation.update({
    where:{
      id: id
    },
    data:{
      score: score
    }
  });
}



const recommendationsFactory = {
  insert,
  insertMany,
  insertVotes
};

export default recommendationsFactory;