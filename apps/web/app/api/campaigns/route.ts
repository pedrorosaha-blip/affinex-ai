import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { campaignQueue } from '../../../lib/queue';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedProduct, caption, selectedGroups, scheduledAt } = body;

    // Validação básica
    if (!selectedProduct || !selectedGroups || selectedGroups.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos para agendar a campanha.' },
        { status: 400 }
      );
    }

    // 1. Cria a campanha no Banco de Dados com status PENDING
    const campaign = await (prisma as any).campaign.create({
      data: {
        name: selectedProduct.name,
        status: 'PENDING',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      },
    });

    // 2. Calcula o atraso (delay) caso haja agendamento para o futuro
    let delay = 0;
    if (scheduledAt) {
      const targetTime = new Date(scheduledAt).getTime();
      const now = Date.now();
      delay = Math.max(0, targetTime - now);
    }

    // 3. Adiciona o job na fila do BullMQ
    await campaignQueue.add(
      'send-campaign',
      {
        campaignId: campaign.id,
        selectedProduct,
        caption,
        selectedGroups,
      },
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Campanha agendada com sucesso!',
      campaignId: campaign.id,
    });
  } catch (error: any) {
    console.error('Erro ao agendar campanha:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar agendamento.', details: error.message },
      { status: 500 }
    );
  }
}