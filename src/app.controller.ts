import { Controller, Get, Query, Render, Redirect } from '@nestjs/common';
import { ExpensesService } from './expenses/expenses.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller()
export class AppController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  private async fetchFixedCostsByMonth(month: string): Promise<any[]> {
    try {
      const apiBaseUrl = this.configService.get<string>('API_BASE_URL'); // Lấy API_BASE_URL từ môi trường
      const fixedCosts$ = this.httpService.get(
        `${apiBaseUrl}/fixed-costs/${month}`, // Sử dụng URL từ biến môi trường
      );
      const response = await lastValueFrom(fixedCosts$);

      if (response?.data && !response.data.error) {
        return Array.isArray(response.data) ? response.data : [response.data];
      } else {
        console.error(
          'No valid fixed costs data received:',
          response?.data?.message ? 'error ' : 'Unknown error',
        );
        return [];
      }
    } catch (error) {
      console.error(
        'Error fetching fixed costs:',
        error.message ? 'Unknown' : 'error',
      );
      return [];
    }
  }

  private async fetchUsers(): Promise<any[]> {
    try {
      const apiBaseUrl = this.configService.get<string>('API_BASE_URL'); // Lấy API_BASE_URL từ môi trường
      const users$ = this.httpService.get(`${apiBaseUrl}/users`); // Sử dụng URL từ biến môi trường
      const response: any = await lastValueFrom(users$);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', 'error');
      return [];
    }
  }

  private async fetchExpensesByMonth(month: string): Promise<any[]> {
    try {
      const apiBaseUrl = this.configService.get<string>('API_BASE_URL'); // Lấy API_BASE_URL từ môi trường
      const expenses$ = this.httpService.get(
        `${apiBaseUrl}/expenses/month?month=${month}`, // Sử dụng URL từ biến môi trường
      );
      const response: any = await lastValueFrom(expenses$);

      if (response && response.data && !response.data.error) {
        return Array.isArray(response.data) ? response.data : [response.data];
      } else {
        console.error(
          'No valid expenses data received:',
          response?.data?.message ? 'null' : 'Unknown error',
        );
        return [];
      }
    } catch (error) {
      console.error('Error fetching expenses:', 'error');
      return [];
    }
  }

  @Get()
  @Redirect()
  async dashboard(@Query('month') monthQuery?: string) {
    const isValidMonth = (month: string) => /^\d{4}-\d{2}$/.test(month);
    const month = isValidMonth(monthQuery || '')
      ? monthQuery!
      : new Date().toISOString().substring(0, 7);

    return { url: `/dashboard?month=${month}` };
  }

  @Get('dashboard')
  @Render('index')
  async renderDashboard(@Query('month') monthQuery?: string) {
    const users = await this.fetchUsers();
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL');
    const isValidMonth = (month: string) => /^\d{4}-\d{2}$/.test(month);
    const month = isValidMonth(monthQuery || '')
      ? monthQuery!
      : new Date().toISOString().substring(0, 7);

    const expenses = await this.fetchExpensesByMonth(month);
    const totalMarket = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    const fixedCosts = await this.fetchFixedCostsByMonth(month);
    if (fixedCosts.length === 0) {
      console.error('No fixed costs data found for the specified month');
    }

    console.log('expenses:', expenses);
    console.log('fixedCosts:', fixedCosts);
    console.log('totalMarket:', totalMarket);
    console.log('month:', month);
    console.log('users:', users);

    return {
      apiBaseUrl,
      expenses,
      fixedCosts,
      totalMarket,
      month,
      users,
    };
  }
}
