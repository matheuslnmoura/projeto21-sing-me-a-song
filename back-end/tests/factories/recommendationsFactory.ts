import { faker } from "@faker-js/faker";


import { prisma } from "../../src/database.js";
import { CreateRecommendationData } from "../../src/services/recommendationsService.js";

async function insert(recommendation: CreateRecommendationData){
  return await prisma.recommendation.create({
    data: recommendation
  })
}

const recommendationsFactory = {
  insert
}

export default recommendationsFactory