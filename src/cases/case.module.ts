import { Module } from '@nestjs/common';
import { CaseResolver } from './case.resolver';
import { ScrapperService } from './scrapper.service';
import { CaseService } from './case.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './case.model';

@Module({
  imports: [TypeOrmModule.forFeature([Case])],
  exports: [CaseService],
  providers: [CaseResolver, CaseService, ScrapperService],
})
export class CaseModule {}
