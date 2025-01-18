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

  @Query(() => Case)
  async scrape(@Args('amount', { type: () => Number }) amount: number) {
    await this.scrapperService.scrape(
      this.caseService,
      'https://mfkn.naevneneshus.dk/soeg?types=ruling&sort=score',
      amount,
    );
  }

  @Query(() => Case)
  async getCaseById(@Args('id', { type: () => String }) id: string) {
    await this.scrapperService.scrape(
      this.caseService,
      'https://mfkn.naevneneshus.dk/soeg?types=ruling&sort=score',
      50,
    );
    const ccase = await this.caseService.findById(id);
    if (!ccase) {
      throw new NotFoundException(id);
    }

    return ccase;
  }
}
