/* eslint-disable @typescript-eslint/no-explicit-any */
import {jest} from '@jest/globals';

import {faker} from '@faker-js/faker';

import {recommendationService} from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import { conflictError, notFoundError } from '../../src/utils/errorUtils.js';

describe ('Insert Recommendation Test Suite', ()=>{
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('Should create a recommendation', async()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => {return null;});
    jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(():any =>{return null;});

    await recommendationService.insert(recommendation);
    expect(recommendationRepository.create).toBeCalled();
  });

  it('Should not create a recommendation if there\'s one with the same name', async ()=>{
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any => {return 'something';});

    const promise = recommendationService.insert(recommendation);

    expect(promise).rejects.toEqual(conflictError('Recommendations names must be unique'));
    expect(recommendationRepository.create).not.toBeCalled();
  });

});

describe ('Vote on Recommendation Test Suite', ()=>{
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('Should upvote a recommendation', async()=>{
    const recommendation = {
      id: +faker.random.numeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => {return recommendation;});
    jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any =>{return null;});

    await recommendationService.upvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it('Given an invalid id, should return not_found error', async ()=>{
    const recommendation = {
      id: +faker.random.numeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => {return null;});

    const promise =  recommendationService.upvote(recommendation.id);
    expect(promise).rejects.toEqual(notFoundError());
    expect(recommendationRepository.updateScore).not.toBeCalled();
  });

  it('Should downvote a recommendation', async()=>{
    const recommendation = {
      id: +faker.random.numeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => {return recommendation;});
    jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any =>{return recommendation;});

    await recommendationService.downvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it('Given an invalid id, should return not_found error', async ()=>{
    const recommendation = {
      id: +faker.random.numeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => {return null;});

    const promise =  recommendationService.downvote(recommendation.id);
    expect(promise).rejects.toEqual(notFoundError());
    expect(recommendationRepository.updateScore).not.toBeCalled();
  });

  it('Should remove a recommendation if score < -5', async()=>{
    const recommendation = {
      id: +faker.random.numeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };

    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any => {return recommendation;});
    jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce(():any =>{
      return {
        ...recommendation,
        score: -6
        
      };
    });

    jest.spyOn(recommendationRepository, 'remove').mockImplementationOnce(():any => {return null;});

    await recommendationService.downvote(recommendation.id);
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
  });

});

describe('Get Recommendations Test Suite', ()=>{
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('Should return all recommendations', async()=>{
    jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any =>{
      return 'something';
    });
    const promise = recommendationService.get();
    expect(promise).resolves.toEqual('something');
  });

  it('Given a valid id, should return the corresponding recommendation', async()=>{
    const recommendation = {
      id: +faker.random.alphaNumeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{
      return 'something';
    });

    const promise = await recommendationService.getById(recommendation.id);

    expect(promise).toEqual('something');

  });

  it('Given an invalid id, should return notFoundError', async()=>{
    const recommendation = {
      id: +faker.random.alphaNumeric(),
      name: faker.music.songName(),
      youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc'
    };
    jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{
      return null;
    });

    const promise = recommendationService.getById(recommendation.id);

    expect(promise).rejects.toEqual(notFoundError());

  });

});

describe('Get Top Amount', ()=>{
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it('Should return the top amount', async()=>{
    const amount = faker.datatype.number({min: 1, max: 10});
    jest.spyOn(recommendationRepository, 'getAmountByScore').mockImplementationOnce(():any => {return 'something';});
    
    const promise = recommendationService.getTop(amount);
    expect(promise).resolves.toEqual('something');
  });
});


describe('getRandom tests', () => {
  it('random < 0.7', async () => {
    const random = jest.spyOn(Math, 'random').mockImplementationOnce(():any =>{
      return faker.datatype.float({min: 0, max: 0.6, precision: 0.1});
    });

    jest.spyOn(recommendationRepository, 'findAll').mockImplementationOnce(():any =>{
      return [
        {
          id: 1,
          name: faker.random.word(),
          youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
          score: faker.datatype.number({ min: 11, max: 50 }),
        },
        {
          id: 2,
          name: faker.random.word(),
          youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
          score: faker.datatype.number({ min: 11, max: 50 }),
        },
      ];
    });

    const result = await recommendationService.getRandom();

    expect(result.id).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.youtubeLink).toBeDefined();
    expect(result.score).toBeDefined();
    expect(result.score).toBeGreaterThan(10);
    expect(random).toBeCalled();
  });

  it('random >= 0.7', async () => {
    const random = jest.spyOn(Math, 'random').mockImplementationOnce((): any => {
      return faker.datatype.float({ min: 0.7, max: 1, precision: 0.1 });
    });

    jest.spyOn(recommendationRepository, 'findAll') .mockImplementationOnce((): any => {
      return [
        {
          id: 1,
          name: faker.random.word(),
          youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
          score: faker.datatype.number({ min: -4, max: 10 }),
        },
        {
          id: 2,
          name: faker.random.word(),
          youtubeLink: 'https://www.youtube.com/watch?v=HLLuYxE-dgc',
          score: faker.datatype.number({ min: -4, max: 10 }),
        },
      ];
    });

    const result = await recommendationService.getRandom();

    expect(result.id).toBeDefined();
    expect(result.name).toBeDefined();
    expect(result.youtubeLink).toBeDefined();
    expect(result.score).toBeDefined();
    expect(result.score).toBeLessThanOrEqual(10);
    expect(random).toBeCalled();
  });
});  