import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ShopeeService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCredentials() {
    const connection = await this.prisma.marketplaceConnection.findUnique({
      where: { type: MarketplaceType.SHOPEE },
    });

    if (!connection || !connection.apiKey || !connection.apiSecret) {
      throw new HttpException(
        'Conexão com a Shopee não configurada ou sem credenciais.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return connection;
  }

  // Gera a assinatura de autenticação exigida pela Open API da Shopee
  private generateSignature(appKey: string, appSecret: string, timestamp: number, payload: string) {
    const baseString = `${appKey}${timestamp}${payload}${appSecret}`;
    return crypto.createHash('sha256').update(baseString).digest('hex');
  }

  async getOffers(keyword?: string) {
    const creds = await this.getCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Query GraphQL padrão da Affiliate Open API da Shopee
    const query = `
      query GetOfferList($keyword: String) {
        productOfferV2(keyword: $keyword, limit: 10) {
          nodes {
            itemId
            productName
            price
            commissionRate
            commission
            offerLink
            imageUrl
          }
        }
      }
    `;

    const body = JSON.stringify({ query, variables: { keyword: keyword || 'oferta' } });
    const signature = this.generateSignature(creds.apiKey!, creds.apiSecret!, timestamp, body);

    try {
      const response = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `SHA256 Credential=${creds.apiKey}, Timestamp=${timestamp}, Signature=${signature}`,
        },
        body,
      });

      const data = await response.json();
      return data?.data?.productOfferV2?.nodes || [];
    } catch (error) {
      console.error('Erro ao buscar produtos da Shopee:', error);
      throw new HttpException('Falha na comunicação com a API da Shopee', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}