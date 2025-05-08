import {
  Controller,
  Get,
  Res,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { FixedCostsService } from './fixed-costs.service';
import { FixedCost } from './schemas/fixed-costs.schema';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Controller('fixed-costs')
export class FixedCostsController {
  constructor(
    private readonly fixedCostsService: FixedCostsService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  private getApiBaseUrl(): string | undefined {
    return this.configService.get<string>('API_BASE_URL'); // Lấy giá trị API_BASE_URL từ môi trường
  }

  @Post()
  async create(
    @Body()
    createFixedCostDto: {
      month: string;
      cost: number; // chỉ gửi tổng chi phí
    },
    @Res() res: Response,
  ): Promise<void> {
    const roomCost = 4300000;
    const serviceFee = createFixedCostDto.cost - roomCost;

    try {
      await this.fixedCostsService.create(
        createFixedCostDto.month,
        roomCost,
        serviceFee,
      );
      // Redirect if successful
      const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
      res.redirect(`${apiBaseUrl}/`); // Dùng API_BASE_URL
    } catch (error) {
      // Nếu có lỗi (ví dụ, trùng tháng), trả về lỗi
      res.status(400).send({ message: error.message });
    }
  }

  @Get()
  findAll(): Promise<FixedCost[]> {
    return this.fixedCostsService.findAll();
  }

  @Get(':month')
  findByMonth(@Param('month') month: string): Promise<FixedCost> {
    return this.fixedCostsService.findByMonth(month);
  }

  // fixed-costs/:month
  @Post('del/:month')
  async deleteByMonth(
    @Param('month') month: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.fixedCostsService.deleteByMonth(month);

      if (result.deleted) {
        // Redirect to the correct page (update URL if needed)
        const apiBaseUrl = this.getApiBaseUrl(); // Lấy URL từ biến môi trường
        res.redirect(`${apiBaseUrl}/`); // Dùng API_BASE_URL
      } else {
        res
          .status(400)
          .send({ message: 'Không tìm thấy chi phí cho tháng này' });
      }
    } catch (error) {
      res.status(500).send({
        message: 'Có lỗi xảy ra khi xóa chi phí',
        error: error.message,
      });
    }
  }
}
