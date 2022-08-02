/* eslint-disable @typescript-eslint/no-explicit-any */
import {jest} from '@jest/globals';

import {faker} from '@faker-js/faker';

import {recommendationService} from '../../src/services/recommendationsService.js';
import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';

describe ('Recommendations service tests', ()=>{
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
});