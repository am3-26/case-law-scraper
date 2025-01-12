import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { ScrapperService } from './scrapper.service';

@Module({
  providers: [UserResolver, UserService, ScrapperService],
})
export class UserModule {}
