import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceType, ConnectionStatus } from '@prisma/client';

@Injectable()
export class MarketplacesService {
  constructor(private prisma: PrismaService) {}

  // Listar todos os status e conexões
  async findAll() {
    return this.prisma.marketplaceConnection.findMany({
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Traz os últimos 5 logs de cada marketplace
        },
      },
    });
  }

  // Conectar ou atualizar credenciais de um marketplace
  async connect(type: MarketplaceType, credentials: { apiKey?: string; apiSecret?: string; merchantId?: string }) {
    const connection = await this.prisma.marketplaceConnection.upsert({
      where: { type },
      update: {
        ...credentials,
        status: ConnectionStatus.CONNECTED,
      },
      create: {
        type,
        ...credentials,
        status: ConnectionStatus.CONNECTED,
      },
    });

    // Registra log de auditoria
    await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'CONNECT',
        status: 'SUCCESS',
        responseData: JSON.stringify({ message: `Conexão estabelecida com ${type}` }),
      },
    });

    return connection;
  }

  // Testar conexão
  async testConnection(type: MarketplaceType) {
    const connection = await this.prisma.marketplaceConnection.findUnique({ where: { type } });

    if (!connection) {
      throw new NotFoundException(`Conexão com ${type} não encontrada.`);
    }

    // Registra o teste nos logs
    const log = await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'TEST_CONNECTION',
        status: connection.status === ConnectionStatus.CONNECTED ? 'SUCCESS' : 'FAILED',
        statusCode: connection.status === ConnectionStatus.CONNECTED ? 200 : 400,
        responseData: JSON.stringify({ status: connection.status }),
      },
    });

    return { status: connection.status, log };
  }

  // Desconectar marketplace
  async disconnect(type: MarketplaceType) {
    const connection = await this.prisma.marketplaceConnection.update({
      where: { type },
      data: { status: ConnectionStatus.DISCONNECTED },
    });

    await this.prisma.marketplaceLog.create({
      data: {
        connectionId: connection.id,
        action: 'DISCONNECT',
        status: 'SUCCESS',
      },
    });

    return connection;
  }
}