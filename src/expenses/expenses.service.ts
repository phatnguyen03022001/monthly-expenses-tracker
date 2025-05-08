// File: src/expenses/expenses.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { FixedCost } from '../fixed-costs/schemas/fixed-costs.schema';
import { error } from 'console';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel('Expense') private expenseModel: Model<Expense>,
    @InjectModel('FixedCost') private fixedCostModel: Model<FixedCost>,
  ) {}

  async findExpensesByMonth(month: string): Promise<Expense[]> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('Invalid month format. Expected format: YYYY-MM');
    }

    // Tách year và month từ chuỗi nhập vào (ví dụ: '2025-05')
    const [year, monthIndex] = month.split('-');

    // Tạo ngày bắt đầu (ngày đầu tháng)
    const startDate = new Date(`${year}-${monthIndex}-01T00:00:00.000Z`);

    // Tạo ngày kết thúc (ngày cuối tháng)
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Dịch chuyển đến tháng tiếp theo
    endDate.setDate(0); // Ngày cuối cùng của tháng trước (tức là cuối tháng mà bạn cần)

    // Truy vấn MongoDB để lấy các chi phí trong khoảng thời gian từ startDate đến endDate
    return this.expenseModel
      .find({
        createdAt: { $gte: startDate, $lt: endDate }, // Sử dụng trường createdAt thay vì date
      })
      .exec();
  }

  async getDashboardStats(users: any[], month: string) {
    // Lấy chi phí cố định theo tháng
    const fixed = await this.fixedCostModel.findOne({ month });

    // Nếu không có chi phí cố định cho tháng đó, trả về thông báo
    if (!fixed) {
      return { message: 'No fixed cost data found for the specified month.' };
    }

    const room = fixed.roomCost || 0;
    const service = fixed.serviceFee || 0;

    // Lấy danh sách chi tiêu trong tháng theo ngày đầu và cuối tháng
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await this.expenseModel.find({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    // Tính toán chi phí của mỗi người và tổng chi phí đi chợ
    let totalMarket = 0;
    const stats = users.map((user) => {
      const marketPaid = expenses
        .filter((e) => e.userId === user._id)
        .reduce((sum, e) => sum + e.amount, 0);

      totalMarket += marketPaid;

      return {
        _id: user._id,
        name: user.name,
        marketPaid,
      };
    });

    // Trả về thống kê với totalMarket
    return {
      fixed: { roomCost: room, serviceFee: service },
      totalMarket, // Tổng chi phí đi chợ
      stats,
    };
  }

  async create(
    userId: string,
    amount: number,
    description: string,
  ): Promise<Expense> {
    // Tạo chi phí mới cho người dùng
    const expense = new this.expenseModel({
      userId,
      amount,
      description,
      date: new Date(), // Thêm ngày tạo để dễ dàng lọc theo tháng
    });
    return expense.save();
  }

  async findByUser(userId: string): Promise<Expense[]> {
    // Lấy chi phí của người dùng theo userId
    return this.expenseModel.find({ userId }).exec();
  }
  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.expenseModel.deleteOne({ _id: id }).exec();
    return { deleted: result.deletedCount > 0 };
  }

  async updateExpenseById(
    id: string,
    updateData: { month: string; amount: number },
  ): Promise<Expense> {
    const updated = await this.expenseModel.findByIdAndUpdate(
      id,
      {
        month: updateData.month,
        amount: updateData.amount,
      },
      { new: true },
    );

    if (!updated) {
      throw new error('Không tìm thấy khoản chi cần cập nhật');
    }

    return updated;
  }
}
