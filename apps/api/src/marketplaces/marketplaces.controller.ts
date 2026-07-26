import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopeeService } from './shopee.service';
import { MarketplaceType, ConnectionStatus } from '@prisma/client';

@Controller('marketplaces')
export class MarketplacesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopeeService: ShopeeService,
  ) {}

  @Get()
  async getConnections() {
    return this.prisma.marketplaceConnection.findMany();
  }

  @Get('shopee/products')
  async getShopeeProducts(@Query('query') query?: string) {
    return this.shopeeService.getOffers(query);
  }

  @Post('shopee')
  async saveShopeeConnection(@Body() body: { appKey: string; appSecret: string; appId?: string }) {
    const { appKey, appSecret, appId } = body;

    return this.prisma.marketplaceConnection.upsert({
      where: {
        type: MarketplaceType.SHOPEE,
      },
      update: {
        apiKey: appKey,
        apiSecret: appSecret,
        merchantId: appId,
        status: ConnectionStatus.CONNECTED,
      },
      create: {
        type: MarketplaceType.SHOPEE,
        apiKey: appKey,
        apiSecret: appSecret,
        merchantId: appId,
        status: ConnectionStatus.CONNECTED,
      },
    });
  }
}