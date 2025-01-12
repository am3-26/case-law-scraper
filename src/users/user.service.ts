import { Injectable } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UserService {
  private users: User[];

  constructor() {
    this.users = [];
  }

  async findOneById(id: string): Promise<User> {
    const exampleUser = new User();
    exampleUser.id = 'user-1';
    exampleUser.firstname = 'Ava';
    exampleUser.lastname = 'Brown';
    exampleUser.age = 20;
    exampleUser.createdDate = new Date();

    return exampleUser;
    // const user = this.users.find((u) => u.id === id);
    // return user;
  }
}
