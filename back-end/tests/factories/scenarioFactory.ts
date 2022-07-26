import { prisma } from "../../src/database.js";

async function deleteAllData(){
  await prisma.$executeRaw`TRUNCATE TABLE recommendations`
}

const scenarioFactory = {
  deleteAllData,
}

export default scenarioFactory