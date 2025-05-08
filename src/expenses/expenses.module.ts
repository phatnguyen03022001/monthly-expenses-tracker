import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseSchema } from './schemas/expense.schema';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { FixedCostSchema } from '../fixed-costs/schemas/fixed-costs.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Expense', schema: ExpenseSchema },
      { name: 'FixedCost', schema: FixedCostSchema },
    ]),
    UsersModule, // 👈 Thêm dòng này để dùng được UsersService
    HttpModule, // 👈 Thêm dòng này để dùng được HttpService
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Chọn file .env dựa trên NODE_ENV
    }),
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService],
})
export class ExpensesModule {}
