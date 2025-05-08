import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FixedCostSchema } from './schemas/fixed-costs.schema';
import { FixedCostsService } from './fixed-costs.service';
import { FixedCostsController } from './fixed-costs.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FixedCost', schema: FixedCostSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Chọn file .env dựa trên NODE_ENV
    }),
  ],
  providers: [FixedCostsService],
  controllers: [FixedCostsController],
})
export class FixedCostsModule {}
