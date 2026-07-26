import { Module } from '@nestjs/common';
import { MarketplacesController } from './marketplaces.controller';
import { ShopeeService } from './shopee.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketplacesController],
  providers: [ShopeeService],
  exports: [ShopeeService],
})
export class MarketplacesModule {}