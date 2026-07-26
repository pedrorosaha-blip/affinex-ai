'use client';

import { useState } from 'react';

// Tipagem básica de cada oferta adicionada ao carrinho
interface OfferItem {
  id: string;
  name: string;
  originalPrice: string;
  promoPrice: string;
  coupon: string;
  affiliateUrl: string;
  generatedCaption: string; // Legenda gerada pela IA automaticamente
  selected: boolean;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'groups'>('cart');

  // Estado do Carrinho de Ofertas (exemplo de itens)
  const [cartItems, setCartItems] = useState<OfferItem[]>([
    {
      id: '1',
      name: 'Smartphone Galaxy S23 Ultra 256GB',
      originalPrice: '5999.00',
      promoPrice: '3899.00',
      coupon: 'MEGADESCONTO',
      affiliateUrl: 'https://shopee.ee/exemplo123',
      generatedCaption: `🔥 *OFERTA IMPERDÍVEL!* 🔥\n\n*Smartphone Galaxy S23 Ultra 256GB*\n\nDe: ~R$ 5999.00~\nPor apenas: *R$ 3899.00*\n\n🎫 Cupom: \`MEGADESCONTO\`\n\n🛒 Compre aqui: https://shopee.ee/exemplo123`,
      selected: true,
    },
    {
      id: '2',
      name: 'Fone de Ouvido Bluetooth TWS',
      originalPrice: '199.00',
      promoPrice: '79.90',
      coupon: 'FONE20',
      affiliateUrl: 'https://shopee.ee/fone456',
      generatedCaption: `⚡ *PROMOÇÃO RELÂMPAGO!* ⚡\n\n*Fone de Ouvido Bluetooth TWS*\n\nDe: ~R$ 199.00~\nPor apenas: *R$ 79.90*\n\n🎫 Cupom: \`FONE20\`\n\n🛒 Compre aqui: https://shopee.ee/fone456`,
      selected: true,
    },
  ]);

  // Configurações do Disparo Agendado
  const [channel, setChannel] = useState<'telegram' | 'whatsapp'>('telegram');
  const [targetChatId, setTargetChatId] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(5); // Padrão: 5 minutos
  const [isScheduling, setIsScheduling] = useState(false);

  // Estados para simular a adição de um produto do catálogo ao carrinho
  const [newProductName, setNewProductName] = useState('');
  const [newOrigPrice, setNewOrigPrice] = useState('');
  const [newPromoPrice, setNewPromoPrice] = useState('');
  const [newCoupon, setNewCoupon] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Alternar seleção individual do item
  const toggleSelect = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Alternar seleção de todos os itens
  const toggleSelectAll = (selectAll: boolean) => {
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: selectAll })));
  };

  // Remover item do carrinho
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Função para adicionar produto ao carrinho gerando legenda de IA na hora
  const handleAddToCart = () => {
    if (!newProductName || !newPromoPrice || !newUrl) {
      alert('Preencha pelo menos o Nome, Preço Promocional e Link!');
      return;
    }

    // 🤖 Geração Automática da Legenda por IA
    const aiGeneratedCaption = `🔥 *OFERTA IMPERDÍVEL!* 🔥\n\n*${newProductName}*\n\n${
      newOrigPrice ? `De: ~R$ ${newOrigPrice}~\n` : ''
    }Por apenas: *R$ ${newPromoPrice}*\n${
      newCoupon ? `\n🎫 Cupom: \`${newCoupon}\`\n` : ''
    }\n🛒 Compre aqui: ${newUrl}`;

    const newItem: OfferItem = {
      id: Date.now().toString(),
      name: newProductName,
      originalPrice: newOrigPrice,
      promoPrice: newPromoPrice,
      coupon: newCoupon,
      affiliateUrl: newUrl,
      generatedCaption: aiGeneratedCaption,
      selected: true,
    };

    setCartItems((prev) => [...prev, newItem]);

    // Limpa os campos
    setNewProductName('');
    setNewOrigPrice('');
    setNewPromoPrice('');
    setNewCoupon('');
    setNewUrl('');

    alert('Produto adicionado ao Carrinho com Legenda IA gerada!');
    setActiveTab('cart');
  };

  // 🚀 Enviar a Fila do Carrinho com o Timer Programado (Corrigido para TypeScript)
  const handleStartQueue = async () => {
    const selectedOffers = cartItems.filter((item) => item.selected);

    if (selectedOffers.length === 0) {
      alert('Selecione pelo menos uma oferta no carrinho para agendar!');
      return;
    }

    if (!targetChatId) {
      alert('Informe o ID do Grupo ou Canal de destino!');
      return;
    }

    setIsScheduling(true);

    try {
      const now = Date.now();
      let index = 0;

      // Percorre cada oferta garantindo o tipo correto para o TypeScript
      for (const offer of selectedOffers) {
        const delayMs = index * (intervalMinutes * 60 * 1000);
        const scheduledTime = new Date(now + delayMs).toISOString();

        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedProduct: { name: offer.name },
            caption: offer.generatedCaption,
            selectedGroups: [targetChatId],
            channel: channel,
            scheduledAt: scheduledTime,
          }),
        });

        index++;
      }

      alert(
        `✅ Agendamento Concluído com Sucesso!\n\n` +
        `• ${selectedOffers.length} ofertas na fila.\n` +
        `• Intervalo entre postagens: ${intervalMinutes === 0 ? 'Imediato' : `${intervalMinutes} minuto(s)`}.\n` +
        `• As mensagens serão postadas automaticamente no seu grupo/canal!`
      );
    } catch (error) {
      console.error('Erro ao agendar a fila:', error);
      alert('Erro ao agendar as ofertas. Verifique o terminal.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-white font-sans overflow-hidden">
      {/* Sidebar / Menu Lateral */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Affinex AI</h1>
              <p className="text-xs text-slate-400">SaaS para Afiliados</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📦 Catálogo & Ofertas
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'cart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">🛒 Carrinho de Disparos</span>
              <span className="bg-slate-900/50 px-2 py-0.5 rounded-full text-xs font-bold">
                {cartItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'groups' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              📢 Meus Grupos
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
          🟢 APIs Conectadas
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* TELA 1: CATÁLOGO (Adicionar ao Carrinho com IA) */}
        {activeTab === 'catalog' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">📦 Adicionar Produto ao Carrinho</h2>
            <p className="text-sm text-slate-400">
              Ao adicionar o produto aqui, o sistema gera a legenda em IA e coloca na fila do seu carrinho automaticamente.
            </p>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Fone Bluetooth Xiaomi"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Preço De (R$)</label>
                  <input
                    type="text"
                    placeholder="199.00"
                    value={newOrigPrice}
                    onChange={(e) => setNewOrigPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Preço Por (R$)</label>
                  <input
                    type="text"
                    placeholder="89.90"
                    value={newPromoPrice}
                    onChange={(e) => setNewPromoPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cupom de Desconto (Opcional)</label>
                  <input
                    type="text"
                    placeholder="PROMOWEEK"
                    value={newCoupon}
                    onChange={(e) => setNewCoupon(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Link de Afiliado</label>
                  <input
                    type="text"
                    placeholder="https://shopee.ee/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition mt-2"
              >
                ✨ Gerar Legenda com IA & Adicionar ao Carrinho
              </button>
            </div>
          </div>
        )}

        {/* TELA 2: CARRINHO DE DISPAROS & TIMER */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🛒 Carrinho de Ofertas</h2>
                <p className="text-sm text-slate-400">
                  Configure o destino, defina o intervalo do timer e deixe o robô disparar sozinho ao longo do dia!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium"
              >
                + Adicionar Mais Ofertas
              </button>
            </div>

            {/* Painel de Configuração do Destino & Timer */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-semibold text-lg text-indigo-400 flex items-center gap-2">
                <span>⚙️</span> Configurações da Programação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Canal */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Canal / Rede</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                {/* Chat ID / Grupo */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {channel === 'telegram' ? 'Chat ID Telegram (ex: -100...)' : 'Número / ID WhatsApp'}
                  </label>
                  <input
                    type="text"
                    placeholder={channel === 'telegram' ? '-100xxxxxxxxx' : '55719xxxxxxxx'}
                    value={targetChatId}
                    onChange={(e) => setTargetChatId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Timer / Intervalo entre disparos */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">⏱️ Intervalo de Disparo</label>
                  <select
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm font-semibold text-emerald-400 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={0}>Imediato (Tudo de uma vez)</option>
                    <option value={5}>De 5 em 5 minutos</option>
                    <option value={10}>De 10 em 10 minutos</option>
                    <option value={15}>De 15 em 15 minutos</option>
                    <option value={30}>De 30 em 30 minutos</option>
                    <option value={60}>De 1 em 1 hora (60 min)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista das Ofertas no Carrinho */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && cartItems.every((item) => item.selected)}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-semibold text-sm">
                    Selecionar Todos ({cartItems.filter((i) => i.selected).length}/{cartItems.length})
                  </span>
                </div>

                <span className="text-xs text-slate-400">
                  Total estimado: {cartItems.filter((i) => i.selected).length * intervalMinutes} min de programação
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Seu carrinho está vazio. Adicione ofertas pelo menu "Catálogo & Ofertas"!
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    // Calcula a hora estimada em que a oferta vai sair
                    const scheduledFor = new Date(Date.now() + index * intervalMinutes * 60 * 1000);
                    const formattedTime = scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition ${
                          item.selected
                            ? 'bg-slate-800/60 border-indigo-500/50'
                            : 'bg-slate-800/20 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelect(item.id)}
                              className="w-5 h-5 accent-indigo-600 cursor-pointer mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800/50 rounded font-bold">
                                  #{index + 1}
                                </span>
                                <p className="font-bold text-sm">{item.name}</p>
                              </div>

                              <p className="text-xs text-slate-400 mt-1">
                                De: R$ {item.originalPrice || '---'} | Por:{' '}
                                <span className="text-emerald-400 font-bold">R$ {item.promoPrice}</span>
                                {item.coupon && <span className="ml-2 text-indigo-300">| Cupom: {item.coupon}</span>}
                              </p>

                              {/* Legenda IA pré-gerada */}
                              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-28 overflow-y-auto">
                                {item.generatedCaption}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-lg">
                              🕒 {index === 0 ? 'Disparo Inicial' : `Previsto: ${formattedTime}`}
                            </span>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 underline mt-4"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botão de Envio de Toda a Fila */}
              <button
                onClick={handleStartQueue}
                disabled={isScheduling || cartItems.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 mt-4 ${
                  isScheduling || cartItems.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                }`}
              >
                {isScheduling ? '⌛ Agendando Fila no Servidor...' : '🚀 Iniciar Programação dos Disparos'}
              </button>
            </div>
          </div>
        )}

        {/* TELA 3: MEUS GRUPOS */}
        {activeTab === 'groups' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">📢 Meus Grupos & Canais</h2>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              Aqui você pode consultar ou gerenciar os Chat IDs dos seus canais do Telegram e Grupos do WhatsApp.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}