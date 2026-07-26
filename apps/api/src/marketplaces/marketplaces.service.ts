import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ConnectionStatus,
  MarketplaceLogStatus,
  MarketplaceType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type MarketplaceCredentials = {
  apiKey?: string;
  apiSecret?: string;
  merchantId?: string;
};

@Injectable()
export class MarketplacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.marketplaceConnection.findMany({
      where: {
        userId,
      },
      include: {
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async connect(
    userId: string,
    type: MarketplaceType,
    credentials: MarketplaceCredentials,
  ) {
    const connection = await this.prisma.marketplaceConnection.upsert({
      where: {
        userId_type: {
          userId,
          type,
        },
      },
      update: {
        ...credentials,
        status: ConnectionStatus.CONNECTED,
      },
      create: {
        userId,
        type,
        ...credentials,
        status: ConnectionStatus.CONNECTED,
      },
    });

    await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'CONNECT',
        status: MarketplaceLogStatus.SUCCESS,
        responseData: {
          message: `Conexão estabelecida com ${type}`,
        },
      },
    });

    return connection;
  }

  async testConnection(userId: string, type: MarketplaceType) {
    const connection =
      await this.prisma.marketplaceConnection.findUnique({
        where: {
          userId_type: {
            userId,
            type,
          },
        },
      });

    if (!connection) {
      throw new NotFoundException(
        `Conexão com ${type} não encontrada.`,
      );
    }

    const connected =
      connection.status === ConnectionStatus.CONNECTED;

    const log = await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'TEST_CONNECTION',
        status: connected
          ? MarketplaceLogStatus.SUCCESS
          : MarketplaceLogStatus.FAILED,
        statusCode: connected ? 200 : 400,
        responseData: {
          status: connection.status,
        },
      },
    });

    return {
      status: connection.status,
      log,
    };
  }

  async disconnect(userId: string, type: MarketplaceType) {
    const existingConnection =
      await this.prisma.marketplaceConnection.findUnique({
        where: {
          userId_type: {
            userId,
            type,
          },
        },
      });

    if (!existingConnection) {
      throw new NotFoundException(
        `Conexão com ${type} não encontrada.`,
      );
    }

    const connection =
      await this.prisma.marketplaceConnection.update({
        where: {
          userId_type: {
            userId,
            type,
          },
        },
        data: {
          status: ConnectionStatus.DISCONNECTED,
        },
      });

    await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'DISCONNECT',
        status: MarketplaceLogStatus.SUCCESS,
      },
    });

    return connection;
  }
}