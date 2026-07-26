'use client';

import { useState } from 'react';
import { Sparkles, Send, Calendar, Users, ShoppingBag, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function NewCampaignWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [caption, setCaption] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState('');

  const mockProducts = [
    { id: 'p1', name: 'Fone de Ouvido Bluetooth TWS 5.3', price: 'R$ 49,90', commission: 'R$ 7,50 (15%)', store: 'Shopee', url: 'https://shopee.com.br/exemplo1' },
    { id: 'p2', name: 'Smartwatch D20 Pro Relógio Inteligente', price: 'R$ 65,00', commission: 'R$ 9,75 (15%)', store: 'Mercado Livre', url: 'https://mercadolivre.com.br/exemplo2' },
    { id: 'p3', name: 'Suporte Articulado para Notebook / Mesa', price: 'R$ 89,90', commission: 'R$ 13,48 (15%)', store: 'Shopee', url: 'https://shopee.com.br/exemplo3' }
  ];

  const mockGroups = [
    { id: 'g1', name: '🔥 Achadinhos da Shopee Oficial', members: '12.4k', platform: 'Telegram' },
    { id: 'g2', name: '💎 Promoções Relâmpago Tech', members: '8.1k', platform: 'WhatsApp' },
    { id: 'g3', name: '🛒 Ofertas do Dia - Utilidades', members: '15.9k', platform: 'Telegram' }
  ];

  const handleProductSelect = (prod: any) => {
    setSelectedProduct(prod);
    setCaption(`🔥 IMPERDÍVEL! Olha o que eu acabei de achar para vocês!\n\n✨ ${prod.name}\n💰 Por apenas ${prod.price}\n\n👉 Garanta o seu antes que acabe o estoque:\n${prod.url}\n\n#achadinhos #${prod.store.toLowerCase().replace(' ', '')} #promocao`);
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleFinishCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedProduct,
          caption,
          selectedGroups,
          scheduleTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar campanha');
      }

      alert('Campanha criada e agendada na fila com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Nova Campanha de Afiliado
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure o fluxo automatizado para disparar ofertas nos seus grupos.</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { num: 1, label: 'Produto' },
            { num: 2, label: 'Legenda & IA' },
            { num: 3, label: 'Grupos' },
            { num: 4, label: 'Agendamento' },
          ].map((s) => (
            <div key={s.num} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${step === s.num ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : step > s.num ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.num ? 'bg-indigo-500 text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-medium hidden md:inline">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" /> Selecione o Produto Afiliado
              </h2>
              <div className="space-y-3">
                {mockProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    onClick={() => handleProductSelect(prod)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedProduct?.id === prod.id ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
                  >
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">{prod.store}</span>
                      <h3 className="font-medium text-white mt-1">{prod.name}</h3>
                      <p className="text-sm text-emerald-400 font-semibold mt-1">{prod.price} <span className="text-xs text-slate-400 font-normal">| Comissão est.: {prod.commission}</span></p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedProduct?.id === prod.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'}`}>
                      {selectedProduct?.id === prod.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Revisão e Legenda Persuasiva (IA)
              </h2>
              <p className="text-sm text-slate-400 mb-4">Editando oferta para: <strong className="text-indigo-300">{selectedProduct?.name}</strong></p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Texto da Legenda:</label>
                  <textarea 
                    rows={8}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Escolha os Grupos de Destino ({selectedGroups.length} selecionados)
              </h2>
              <div className="space-y-3">
                {mockGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group.id);
                  return (
                    <div 
                      key={group.id}
                      onClick={() => handleGroupToggle(group.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">{group.platform}</span>
                          <span className="text-xs text-slate-400">{group.members} membros</span>
                        </div>
                        <h3 className="font-medium text-white mt-1">{group.name}</h3>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700'}`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Agendamento e Envio na Fila
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data e Horário do Disparo (Fuso: America/Sao_Paulo)</label>
                  <input 
                    type="datetime-local" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  ℹ️ O item será encaminhado para a fila do <strong>BullMQ</strong> e processado automaticamente no horário estipulado.
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : <div />}

            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !selectedProduct}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Próximo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleFinishCampaign}
                disabled={loading || !scheduleTime || selectedGroups.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Enviando...' : 'Confirmar e Enviar para a Fila'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}