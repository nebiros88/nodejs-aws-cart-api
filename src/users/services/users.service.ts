import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { User } from '../models';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(name: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findOneBy({
        name,
      });
      if (user) {
        return user;
      }
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  createOne({ name, password }: User): UserEntity {
    const id = randomUUID();
    const newUser = { id, name, password };

    return this.userRepository.create(newUser);
  }
}
