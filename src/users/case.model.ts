import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'cases' })
export class Case {
  @Field(() => ID)
  caseId: string;

  @Field()
  date: Date;

  @Field()
  areaOfLaw: string;
}
