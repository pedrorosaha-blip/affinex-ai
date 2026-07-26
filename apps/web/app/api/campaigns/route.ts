import { NextResponse } from 'next/server';

import { campaignQueue } from '../../../lib/queue';
import { prisma } from '../../../lib/prisma';

type CampaignRequestBody = {
  selectedProduct?: {
    name?: string;
    [key: string]: unknown;
  };
  caption?: string;
  selectedGroups?: unknown[];
  scheduledAt?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CampaignRequestBody;

    const {
      selectedProduct,
      caption,
      selectedGroups,
      scheduledAt,
    } = body;

    if (
      !selectedProduct ||
      !selectedProduct.name ||
      !Array.isArray(selectedGroups) ||
      selectedGroups.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Dados incompletos para agendar a campanha.',
        },
        {
          status: 400,
        },
      );
    }

    const scheduledDate = scheduledAt
      ? new Date(scheduledAt)
      : new Date();

    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        {
          error: 'A data de agendamento é inválida.',
        },
        {
          status: 400,
        },
      );
    }

    const campaign = await (
      prisma as unknown as {
        campaign: {
          create: (args: {
            data: {
              name: string;
              status: string;
              scheduledAt: Date;
            };
          }) => Promise<{
            id: string;
          }>;
        };
      }
    ).campaign.create({
      data: {
        name: selectedProduct.name,
        status: 'PENDING',
        scheduledAt: scheduledDate,
      },
    });

    const delay = Math.max(
      0,
      scheduledDate.getTime() - Date.now(),
    );

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
          delay: 5_000,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Campanha agendada com sucesso!',
      campaignId: campaign.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro desconhecido';

    console.error('Erro ao agendar campanha:', error);

    return NextResponse.json(
      {
        error:
          'Erro interno ao processar o agendamento.',
        details: message,
      },
      {
        status: 500,
      },
    );
  }
}