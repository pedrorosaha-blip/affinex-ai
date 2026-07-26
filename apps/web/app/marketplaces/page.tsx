'use client';

import { useState, useEffect } from 'react';

interface MarketplaceLog {
  id: string;
  action: string;
  status: string;
  createdAt: string;
}

interface MarketplaceConnection {
  id: string;
  type: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  logs: MarketplaceLog[];
}

const MARKETPLACES = [
  { key: 'SHOPEE', name: 'Shopee' },
  { key: 'MERCADO_LIVRE', name: 'Mercado Livre' },
  { key: 'AMAZON', name: 'Amazon' },
  { key: 'MAGALU', name: 'Magalu' },
];

export default function MarketplacesPage() {
  const [connections, setConnections] = useState<Record<string, MarketplaceConnection>>({});
  const [loading, setLoading] = useState<string | null>(null);

  // Buscar conexões salvas no NestJS
  const fetchConnections = async () => {
    try {
      const res = await fetch('http://localhost:3001/marketplaces');
      if (res.ok) {
        const data = await res.json();
        const connectionMap: Record<string, MarketplaceConnection> = {};
        data.forEach((item: MarketplaceConnection) => {
          connectionMap[item.type] = item;
        });
        setConnections(connectionMap);
      }
    } catch (err) {
      console.error('Erro ao buscar marketplaces:', err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Conectar / Salvar
  const handleConnect = async (type: string) => {
    setLoading(type);
    try {
      await fetch(`http://localhost:3001/marketplaces/${type}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: 'chave-teste', apiSecret: 'segredo-teste' }),
      });
      await fetchConnections();
    } catch (err) {
      console.error('Erro ao conectar:', err);
    } finally {
      setLoading(null);
    }
  };

  // Testar Conexão
  const handleTest = async (type: string) => {
    setLoading(type);
    try {
      await fetch(`http://localhost:3001/marketplaces/${type}/test`, {
        method: 'POST',
      });
      await fetchConnections();
    } catch (err) {
      console.error('Erro ao testar:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Gerenciador de Marketplaces</h1>
      <p>Conecte e monitore suas integrações em tempo real.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {MARKETPLACES.map((m) => {
          const conn = connections[m.key];
          const isConnected = conn?.status === 'CONNECTED';

          return (
            <div
              key={m.key}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h2>{m.name}</h2>
              <p>
                Status:{' '}
                <strong style={{ color: isConnected ? 'green' : 'gray' }}>
                  {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                </strong>
              </p>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleConnect(m.key)}
                  disabled={loading === m.key}
                  style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  {isConnected ? 'Reconectar' : 'Conectar'}
                </button>

                {isConnected && (
                  <button
                    onClick={() => handleTest(m.key)}
                    disabled={loading === m.key}
                    style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                  >
                    Testar
                  </button>
                )}
              </div>

              {/* Logs do Banco de Dados */}
              {conn?.logs && conn.logs.length > 0 && (
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                  <h4>Últimos Logs (Prisma DB):</h4>
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {conn.logs.map((log) => (
                      <li key={log.id}>
                        [{new Date(log.createdAt).toLocaleTimeString()}] {log.action} -{' '}
                        <span style={{ color: log.status === 'SUCCESS' ? 'green' : 'red' }}>{log.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}