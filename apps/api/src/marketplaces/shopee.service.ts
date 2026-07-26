import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MarketplaceType } from '@prisma/client';
import * as crypto from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

type ShopeeOffer = {
  itemId: string;
  productName: string;
  price: string;
  commissionRate: string;
  commission: string;
  offerLink: string;
  imageUrl: string;
};

type ShopeeGraphqlResponse = {
  data?: {
    productOfferV2?: {
      nodes?: ShopeeOffer[];
    };
  };
  errors?: Array<{
    message?: string;
    extensions?: Record<string, unknown>;
  }>;
};

@Injectable()
export class ShopeeService {
  private readonly logger = new Logger(ShopeeService.name);

  private readonly apiUrl =
    'https://open-api.affiliate.shopee.com.br/graphql';

  constructor(private readonly prisma: PrismaService) {}

  private async getCredentials() {
    const connection =
      await this.prisma.marketplaceConnection.findUnique({
        where: {
          type: MarketplaceType.SHOPEE,
        },
      });

    if (
      !connection ||
      !connection.apiKey ||
      !connection.apiSecret
    ) {
      throw new BadRequestException(
        'A conexão com a Shopee não está configurada ou não possui credenciais.',
      );
    }

    return {
      apiKey: connection.apiKey,
      apiSecret: connection.apiSecret,
    };
  }

  private generateSignature(
    appKey: string,
    appSecret: string,
    timestamp: number,
    payload: string,
  ): string {
    const baseString =
      `${appKey}${timestamp}${payload}${appSecret}`;

    return crypto
      .createHash('sha256')
      .update(baseString)
      .digest('hex');
  }

  async getOffers(keyword = 'oferta'): Promise<ShopeeOffer[]> {
    const credentials = await this.getCredentials();
    const timestamp = Math.floor(Date.now() / 1000);

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

    const body = JSON.stringify({
      query,
      variables: {
        keyword: keyword.trim() || 'oferta',
      },
    });

    const signature = this.generateSignature(
      credentials.apiKey,
      credentials.apiSecret,
      timestamp,
      body,
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            `SHA256 Credential=${credentials.apiKey}, ` +
            `Timestamp=${timestamp}, Signature=${signature}`,
        },
        body,
        signal: controller.signal,
      });

      const responseText = await response.text();

      let result: ShopeeGraphqlResponse;

      try {
        result = JSON.parse(responseText) as ShopeeGraphqlResponse;
      } catch {
        this.logger.error(
          `A Shopee retornou uma resposta inválida: ${responseText}`,
        );

        throw new BadGatewayException(
          'A Shopee retornou uma resposta inválida.',
        );
      }

      if (!response.ok) {
        this.logger.error(
          `Erro HTTP da Shopee. Status: ${response.status}. Resposta: ${responseText}`,
        );

        throw new BadGatewayException(
          `Falha na comunicação com a Shopee. Código HTTP: ${response.status}.`,
        );
      }

      if (result.errors?.length) {
        const errorMessages = result.errors
          .map((error) => error.message)
          .filter(Boolean)
          .join('; ');

        this.logger.error(
          `Erro GraphQL da Shopee: ${errorMessages}`,
        );

        throw new BadGatewayException(
          errorMessages ||
            'A Shopee retornou um erro ao buscar os produtos.',
        );
      }

      return result.data?.productOfferV2?.nodes ?? [];
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        throw new BadGatewayException(
          'A Shopee demorou muito para responder.',
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido';

      this.logger.error(
        `Falha ao buscar produtos da Shopee: ${message}`,
      );

      throw new BadGatewayException(
        'Não foi possível consultar os produtos da Shopee.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}