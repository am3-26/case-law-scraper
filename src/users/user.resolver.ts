import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly scrapperService: ScrapperService,
  ) {}

  @Query(() => User)
  async getUserById(@Args('id', { type: () => String }) id: string) {
    await this.scrapperService.scrape(
      'https://mfkn.naevneneshus.dk/soeg?sort=desc&types=ruling',
    );
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new NotFoundException(id);
    }

    return user;
  }
}
