import { Module } from '@nestjs/common';

import { UsersService } from './services';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [UserEntity],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
