import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FixedCostsModule } from './fixed-costs/fixed-costs.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Load env file based on NODE_ENV
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Chọn file .env dựa trên NODE_ENV
    }),

    // Use Mongoose connection string from config
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    FixedCostsModule,
    ExpensesModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
