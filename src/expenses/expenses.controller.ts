import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Query,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ExpensesService } from './expenses.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  private getApiBaseUrl(): string | undefined {
    return this.configService.get<string>('API_BASE_URL'); // Lấy giá trị API_BASE_URL từ môi trường
  }

  @Get('month')
  async fetchExpensesByMonth(@Query('month') month: string) {
    const expenses = await this.expensesService.findExpensesByMonth(month);
    return expenses;
  }

  @Get()
  private async fetchUsers() {
    const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
    const users$ = this.httpService.get(`${apiBaseUrl}/users`); // Sử dụng API_BASE_URL
    const response: any = await lastValueFrom(users$);
    return response.data;
  }

  @Get('form')
  @Render('expense-form')
  async showForm(@Res() res: Response) {
    const users = await this.fetchUsers();
    const message = res.locals.message || '';
    return { users, message };
  }

  @Post()
  async create(
    @Body()
    createExpenseDto: {
      userId: string;
      amount: number;
      description: string;
    },
    @Res() res: Response,
  ) {
    await this.expensesService.create(
      createExpenseDto.userId,
      +createExpenseDto.amount,
      createExpenseDto.description,
    );
    // Redirect về URL động
    const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
    return res.redirect(`${apiBaseUrl}/`); // Dùng API_BASE_URL
  }

  // ✅ XÓA theo ID
  @Post('del/id/:id')
  async deleteById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.expensesService.deleteById(id);
      const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
      if (result.deleted) {
        res.redirect(`${apiBaseUrl}/`); // Dùng API_BASE_URL
      } else {
        res.status(404).send({ message: 'Không tìm thấy chi phí cần xóa' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Lỗi khi xóa', error: error.message });
    }
  }

  // ✅ SỬA theo ID
  @Post('update/id/:id')
  async updateById(
    @Param('id') id: string,
    @Body() body: { month: string; amount: number },
    @Res() res: Response,
  ): Promise<void> {
    console.log('body', body);
    const roomCost = 4300000;

    try {
      const updated = await this.expensesService.updateExpenseById(id, {
        month: body.month,
        amount: body.amount,
      });
      const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
      if (updated) {
        res.redirect(`${apiBaseUrl}/`); // Dùng API_BASE_URL
      } else {
        res.status(404).send({ message: 'Không tìm thấy chi phí để sửa' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Lỗi khi sửa', error: error.message });
    }
  }
}
