import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { MarketplaceType } from '@prisma/client';

import { MarketplacesService } from './marketplaces.service';
import { ShopeeService } from './shopee.service';

type SaveShopeeConnectionBody = {
  appKey: string;
  appSecret: string;
  appId?: string;
};

@Controller('marketplaces')
export class MarketplacesController {
  constructor(
    private readonly marketplacesService: MarketplacesService,
    private readonly shopeeService: ShopeeService,
  ) {}

  private getUserId(userId?: string): string {
    if (!userId?.trim()) {
      throw new BadRequestException(
        'O cabeçalho x-user-id é obrigatório temporariamente.',
      );
    }

    return userId.trim();
  }

  @Get()
  async getConnections(
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    return this.marketplacesService.findAll(userId);
  }

  @Get('shopee/products')
  async getShopeeProducts(
    @Headers('x-user-id') userIdHeader?: string,
    @Query('query') query?: string,
  ) {
    const userId = this.getUserId(userIdHeader);

    return this.shopeeService.getOffers(userId, query);
  }

  @Post('shopee')
  async saveShopeeConnection(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Body() body: SaveShopeeConnectionBody,
  ) {
    const userId = this.getUserId(userIdHeader);

    if (!body.appKey?.trim() || !body.appSecret?.trim()) {
      throw new BadRequestException(
        'appKey e appSecret são obrigatórios.',
      );
    }

    return this.marketplacesService.connect(
      userId,
      MarketplaceType.SHOPEE,
      {
        apiKey: body.appKey.trim(),
        apiSecret: body.appSecret.trim(),
        merchantId: body.appId?.trim() || undefined,
      },
    );
  }
}