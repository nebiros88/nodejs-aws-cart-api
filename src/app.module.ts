import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    CartModule,
    OrderModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.AWS_PG_HOST,
      port: Number(process.env.AWS_PG_PORT) ?? 5432,
      username: process.env.AWS_PG_USER,
      password: process.env.AWS_PG_PASSWORD,
      database: process.env.AWS_PG_DATABASE,
      entities: [],
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),
    TypeOrmModule.forFeature([]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
