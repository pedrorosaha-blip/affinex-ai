'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Key, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function ConnectionsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Exemplo de estado de conexões ativas
  const [connections, setConnections] = useState({
    whatsapp: { connected: true, label: '+55 19 99788-0071', limit: '1/3 Conectados' },
    telegram: { connected: true, label: '@meu_bot_ofertas', limit: 'Ativo' },
    shopee: { connected: true, label: 'App ID: 1029384', limit: 'API V2 Conectada' },
    mercadolivre: { connected: false, label: 'Não conectado', limit: 'Requer Auth' },
    amazon: { connected: false, label: 'Não conectado', limit: 'Requer Key' },
    magalu: { connected: false, label: 'Não conectado', limit: 'Requer Key' },
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Conexões & Integrações</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Conecte suas contas de mensagens e credenciais de afiliados para permitir a automação de ofertas.
          </p>
        </div>

        {/* SEÇÃO 1: Redes de Mensagens / Disparo */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Canais de Disparo
          </h2>
          
          <div className="grid grid-[#020617] grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* WhatsApp */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">WhatsApp</h3>
                      <p className="text-xs text-slate-400">Instâncias de disparo web</p>
                    </div>
                  </div>
                  {connections.whatsapp.connected ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Desconectado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  {connections.whatsapp.label}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400">{connections.whatsapp.limit}</span>
                <button 
                  onClick={() => setActiveModal('whatsapp')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {connections.whatsapp.connected ? 'Gerenciar QR Code' : 'Conectar WhatsApp'}
                </button>
              </div>
            </div>

            {/* Telegram */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Telegram Bot</h3>
                      <p className="text-xs text-slate-400">Envio para canais e grupos</p>
                    </div>
                  </div>
                  {connections.telegram.connected ? (
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Desconectado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-4">
                  {connections.telegram.label}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400">{connections.telegram.limit}</span>
                <button 
                  onClick={() => setActiveModal('telegram')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  {connections.telegram.connected ? 'Alterar Bot Token' : 'Conectar Telegram'}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO 2: Lojas e Marketplaces */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Marketplaces & Programas de Afiliados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Shopee */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-orange-500 text-lg">Shopee</span>
                  {connections.shopee.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Conexão via Affiliate API (App Key / Secret)</p>
              </div>
              <button 
                onClick={() => setActiveModal('shopee')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition border border-slate-700"
              >
                {connections.shopee.connected ? 'Editar Credenciais' : 'Conectar Shopee'}
              </button>
            </div>

            {/* Mercado Livre */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-yellow-400 text-lg">Mercado Livre</span>
                  {connections.mercadolivre.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Autenticação de Afiliado (OAuth2)</p>
              </div>
              <button 
                onClick={() => setActiveModal('mercadolivre')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition border border-slate-700"
              >
                Conectar Meli
              </button>
            </div>

            {/* Amazon */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-amber-500 text-lg">Amazon</span>
                  {connections.amazon.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Associados Amazon (PA-API Key + Tag)</p>
              </div>
              <button 
                onClick={() => setActiveModal('amazon')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition border border-slate-700"
              >
                Conectar Amazon
              </button>
            </div>

            {/* Magalu */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-blue-500 text-lg">Magalu</span>
                  {connections.magalu.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Parceiro Magalu / Lomadee Tag</p>
              </div>
              <button 
                onClick={() => setActiveModal('magalu')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition border border-slate-700"
              >
                Conectar Magalu
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}