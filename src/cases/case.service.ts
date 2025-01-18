import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Case } from './case.model';
import { Repository } from 'typeorm';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
  ) {}

  async storeCase(
    caseID: string,
    date: Date,
    areaOfLaw: string,
    ruling: string,
  ): Promise<Case> {
    const ccase = this.caseRepository.create({
      caseID,
      date,
      areaOfLaw,
      ruling,
    });
    return this.caseRepository.save(ccase);
  }

  async getAllCases(): Promise<Case[]> {
    return this.caseRepository.find();
  }

  async findById(id: string): Promise<Case> {
    return this.caseRepository.findOneBy({ caseID: id });
  }
}
