import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Case } from './case.model';
import { ArrayContains, Repository } from 'typeorm';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
  ) {}

  async storeCase(
    url: string,
    caseIds: string[],
    date: Date,
    areaOfLaw: string,
    ruling: string,
  ): Promise<Case> {
    const ccase = this.caseRepository.create({
      url,
      caseIds,
      date,
      areaOfLaw,
      ruling,
    });
    return this.caseRepository.save(ccase);
  }

  async getAllCases(): Promise<Case[]> {
    return this.caseRepository.find();
  }

  async findByCaseId(id: string): Promise<Case[]> {
    return this.caseRepository.find({
      where: {
        caseIds: ArrayContains([id]),
      },
    });
  }
}
