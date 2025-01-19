import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cases')
@ObjectType({ description: 'cases' })
export class Case {
  @PrimaryColumn()
  @Field(() => ID)
  url: string;

  @Column('text', { array: true })
  @Field(() => [String])
  caseIds: string[];

  @Column()
  @Field()
  date: Date;

  @Column()
  @Field()
  areaOfLaw: string;

  @Column('text')
  @Field()
  ruling: string;
}
