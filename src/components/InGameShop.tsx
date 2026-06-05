import React, { useState } from 'react';
import { User, ShopItem } from '../types';
import { ArrowLeft, ShoppingBag, CheckCircle, Lock, Sparkles, Coins } from 'lucide-react';

interface InGameShopProps {
  user: User;
  shopItems: ShopItem[];
  inventory: string[];
  onPurchaseItem: (itemId: string) => Promise<void>;
  onEquipItem: (itemId: string) => Promise<void>;
  onClose: () => void;
}

export default function InGameShop({
  user,
  shopItems,
  inventory,
  onPurchaseItem,
  onEquipItem,
  onClose
}: InGameShopProps) {
  const [activeTab, setActiveTab] = useState<'paddle' | 'board'>('paddle');
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const filteredItems = shopItems.filter(item => item.category === activeTab);

  const handleAction = async (item: ShopItem) => {
    const isOwned = inventory.includes(item.id) || item.unlockedByDefault;

    setLoadingItemId(item.id);
    setPurchaseStatus(null);

    try {
      if (isOwned) {
        // Equip skin
        await onEquipItem(item.id);
        setPurchaseStatus(`Successfully equipped ${item.name}!`);
      } else {
        // Buy skin
        if (user.currency < item.cost) {
          setPurchaseStatus('Error: Insufficient Cyber Credits.');
          return;
        }
        await onPurchaseItem(item.id);
        setPurchaseStatus(`Successfully purchased ${item.name}!`);
      }
    } catch (err: any) {
      setPurchaseStatus(err.message || 'Action failed inside matrix.');
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3" id="shop-panel-module">
      {/* Outer Banner header card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-[#00FF41]/20 pb-5" id="shop-banner">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            id="btn-shop-back"
            className="p-2 bg-black border border-[#00FF41]/30 text-[#00FF41] hover:border-[#00FF41] hover:text-white rounded cursor-pointer transition-all mr-2"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block">Nexkey Terminal</span>
            <h1 className="font-sans font-bold text-3xl text-white tracking-tighter uppercase flex items-center gap-2">
              <ShoppingBag size={28} className="neon-text-cyan" /> Skins & Grid Store
            </h1>
          </div>
        </div>

        {/* User Balance Wallet indicator */}
        <div className="flex items-center gap-3 px-5 py-3 glass-panel rounded-lg" id="shop-wallet-indicator">
          <Coins className="text-[#00FF41]" size={20} />
          <div className="font-mono">
            <span className="text-[10px] text-white/50 uppercase block">Wallet Balance</span>
            <span className="text-xl font-bold neon-text-green">{user.currency} <span className="text-xs text-white opacity-50 font-normal">NEX</span></span>
          </div>
        </div>
      </div>

      {/* Tabs selectors bar */}
      <div className="flex border-b border-[#00FF41]/10 mb-6" id="shop-category-tabs">
        <button
          onClick={() => { setActiveTab('paddle'); setPurchaseStatus(null); }}
          className={`flex-1 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'paddle'
              ? 'border-[#BF00FF] neon-text-purple bg-[#BF00FF]/5'
              : 'border-transparent text-[#00FF41]/40 hover:text-[#00FF41]'
          }`}
        >
          Paddle Transducers
        </button>
        <button
          onClick={() => { setActiveTab('board'); setPurchaseStatus(null); }}
          className={`flex-1 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'board'
              ? 'border-[#00F0FF] neon-text-cyan bg-[#00F0FF]/5'
              : 'border-transparent text-[#00FF41]/40 hover:text-[#00FF41]'
          }`}
        >
          Cyber Playfields
        </button>
      </div>

      {purchaseStatus && (
        <div className={`p-3 rounded mb-6 font-mono text-xs text-center border ${
          purchaseStatus.includes('Error')
            ? 'bg-red-950/20 border-red-900/40 text-red-400'
            : 'bg-[#00FF41]/5 border-[#00FF41]/40 text-[#00FF41]'
        }`} id="shop-feedback-alert">
          {purchaseStatus}
        </div>
      )}

      {/* Grid inventory skins displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5" id="shop-skins-display-grid">
        {filteredItems.map((item) => {
          const isOwned = inventory.includes(item.id) || item.unlockedByDefault;
          const isEquipped = activeTab === 'paddle' 
            ? user.activePaddleSkin === item.id 
            : user.activeBoardSkin === item.id;
          
          return (
            <div
              key={item.id}
              className={`relative glass-panel rounded-lg p-5 flex flex-col justify-between transition-all duration-350 ${
                isEquipped
                  ? 'border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)] bg-black/90'
                  : 'hover:border-[#00FF41]/55 bg-black/50'
              }`}
            >
              {/* Top aesthetic item preview badge */}
              <div className="w-full h-32 rounded bg-black/60 border border-[#00FF41]/10 flex items-center justify-center relative mb-4 overflow-hidden">
                {item.category === 'paddle' ? (
                  // Paddle interactive preview icon
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 duration-200 border-4 border-white/25"
                    style={{
                      backgroundColor: item.styleValue,
                      boxShadow: `0 0 15px ${item.styleValue}`,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                ) : (
                  // Grid playfield previews
                  <div className="w-20 h-24 border border-dashed rounded flex flex-col items-center justify-center overflow-hidden"
                       style={{ borderColor: item.styleValue === 'matrix' ? '#00FF41' : item.styleValue === 'vaporwave' ? '#BF00FF' : item.styleValue === 'solar' ? '#eab308' : '#00F0FF' }}>
                    <div className="w-full text-[8px] font-mono text-center py-1 opacity-50 uppercase tracking-widest block border-b border-dashed"
                         style={{ borderStyle: 'dashed', borderColor: 'inherit' }}>
                      Opponent
                    </div>
                    {item.styleValue === 'matrix' && (
                      <span className="text-[10px] text-[#00FF41] font-mono font-bold scale-75 animate-pulse text-shadow">MATRIX</span>
                    )}
                    {item.styleValue === 'vaporwave' && (
                      <span className="text-[10px] text-[#BF00FF] font-mono font-bold scale-75 animate-pulse text-shadow">VAPOR</span>
                    )}
                    {item.styleValue === 'solar' && (
                      <span className="text-[10px] text-amber-500 font-mono font-bold scale-75 animate-pulse">SOLAR</span>
                    )}
                    {item.styleValue === 'grid' && (
                      <span className="text-[10px] text-[#00F0FF] font-mono font-bold scale-75 animate-pulse text-shadow">CYBER</span>
                    )}
                    <div className="w-full text-[8px] font-mono text-center py-1 opacity-50 uppercase tracking-widest block border-t border-dashed mt-auto"
                         style={{ borderStyle: 'dashed', borderColor: 'inherit' }}>
                      Player
                    </div>
                  </div>
                )}

                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-black/70 border border-[#00FF41]/40 text-[#00FF41] font-mono text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Equipped
                  </div>
                )}
              </div>

              {/* Description tags */}
              <div className="mb-4">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block">
                  SKIN METADATA
                </span>
                <h3 className="font-sans font-bold text-base text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="font-mono text-xs text-white/60 mt-1.5 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Action buttons controls */}
              <button
                disabled={isEquipped || loadingItemId === item.id}
                onClick={() => handleAction(item)}
                className={`w-full py-2.5 font-sans font-semibold text-xs tracking-wider uppercase rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isEquipped
                    ? 'bg-black/60 border border-[#00FF41]/10 text-white/40 cursor-not-allowed'
                    : isOwned
                    ? 'bg-[#BF00FF]/10 border border-[#BF00FF]/50 text-[#BF05FF] hover:bg-[#BF00FF]/25 hover:text-white font-bold'
                    : 'neon-border-cyan bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 font-bold'
                }`}
              >
                {loadingItemId === item.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isEquipped ? (
                  'Active'
                ) : isOwned ? (
                  <>Equip Skin</>
                ) : (
                  <>
                    <Coins size={14} className="text-cyan-400" /> Buy {item.cost} CC
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12 text-zinc-650 font-mono text-[10px] uppercase tracking-wider" id="shop-credits">
        credits by Zidandev
      </div>
    </div>
  );
}
