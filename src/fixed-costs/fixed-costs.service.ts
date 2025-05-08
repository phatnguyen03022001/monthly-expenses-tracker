import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FixedCost } from './schemas/fixed-costs.schema';

@Injectable()
export class FixedCostsService {
  constructor(
    @InjectModel('FixedCost') // Tên model bạn đã đăng ký trong module
    private fixedCostModel: Model<FixedCost>,
  ) {}

  async create(
    month: string,
    _roomCost: number, // Không dùng giá trị này từ client
    serviceFee: number,
  ): Promise<FixedCost> {
    // Giá trị cố định cho `roomCost`
    const roomCost = 4300000;

    // Kiểm tra nếu `serviceFee` nhỏ hơn 0, không hợp lệ
    if (serviceFee < 0) {
      throw new BadRequestException(
        'Tổng chi phí không được nhỏ hơn tiền phòng.',
      );
    }

    // Kiểm tra sự tồn tại của `month` trong cơ sở dữ liệu
    const existingFixedCost = await this.fixedCostModel
      .findOne({ month })
      .exec();
    if (existingFixedCost) {
      throw new BadRequestException(`Chi phí cho tháng ${month} đã tồn tại!`);
    }

    // Tạo đối tượng FixedCost để lưu vào database
    const created = new this.fixedCostModel({
      month,
      roomCost,
      serviceFee,
    });

    // Lưu đối tượng vào database và trả về
    return created.save();
  }

  async findAll(): Promise<FixedCost[]> {
    return this.fixedCostModel.find().exec();
  }

  async findByMonth(month: string): Promise<FixedCost> {
    const cost = await this.fixedCostModel.findOne({ month }).exec();
    if (!cost) {
      throw new NotFoundException(`Không tìm thấy chi phí cho tháng: ${month}`);
    }
    return cost;
  }

  async deleteByMonth(month: string): Promise<{ deleted: boolean }> {
    const result = await this.fixedCostModel.deleteOne({ month }).exec();
    return { deleted: result.deletedCount > 0 };
  }

  // fixed-costs.service.ts
}
