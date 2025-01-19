import { Args, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { Case } from './case.model';
import { CaseService } from './case.service';

@Resolver(() => Case)
export class CaseResolver {
  constructor(
    private readonly caseService: CaseService,
    private readonly scrapperService: ScrapperService,
  ) {}

  @Query(() => [Case])
  async scrape(@Args('pages', { type: () => Number }) pages: number) {
    await this.scrapperService.scrapeWebsite(
      this.caseService,
      'https://mfkn.naevneneshus.dk/soeg?types=ruling&sort=score',
      pages,
    );

    return await this.caseService.getAllCases();
  }

  @Query(() => [Case])
  async getRulingsByCaseId(@Args('id', { type: () => String }) id: string) {
    const ccase = await this.caseService.findByCaseId(id);
    if (!ccase) {
      throw new NotFoundException(id);
    }

    return ccase;
  }
}
