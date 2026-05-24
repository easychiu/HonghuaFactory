import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Save, FolderOpen, Download, Upload, X, Trash2, Clock } from 'lucide-react';

const MAX_SLOTS = 5;
const SAVE_KEY_PREFIX = 'honghua_factory_slot_';

interface SaveSlotMeta {
  slotIndex: number;
  characterName: string;
  characterId: string;
  year: number;
  month: number;
  age: number;
  gold: number;
  savedAt: string; // ISO date string
}

const getSaveSlotKey = (index: number) => `${SAVE_KEY_PREFIX}${index}`;
const getSaveMetaKey = () => 'honghua_factory_slots_meta';

const readAllSlotMeta = (): (SaveSlotMeta | null)[] => {
  try {
    const raw = localStorage.getItem(getSaveMetaKey());
    if (!raw) return Array(MAX_SLOTS).fill(null);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== MAX_SLOTS) return Array(MAX_SLOTS).fill(null);
    return parsed;
  } catch {
    return Array(MAX_SLOTS).fill(null);
  }
};

const writeSlotMeta = (meta: (SaveSlotMeta | null)[]) => {
  localStorage.setItem(getSaveMetaKey(), JSON.stringify(meta));
};

export const SaveLoadPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, loadGameFromData } = useGame();
  const [slots, setSlots] = useState<(SaveSlotMeta | null)[]>(readAllSlotMeta());
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleSave = (index: number) => {
    const saveData = {
      daughter: state.daughter,
      time: state.time,
      schedule: state.schedule,
      inventory: state.inventory,
      activeScreen: state.activeScreen,
      logs: state.logs,
      currentEvent: state.currentEvent,
      currentEventStep: state.currentEventStep,
      adventure: state.adventure
    };

    localStorage.setItem(getSaveSlotKey(index), JSON.stringify(saveData));

    const meta: SaveSlotMeta = {
      slotIndex: index,
      characterName: state.daughter.name,
      characterId: state.daughter.characterId,
      year: state.time.year,
      month: state.time.month,
      age: state.daughter.age,
      gold: state.daughter.gold,
      savedAt: new Date().toISOString()
    };
    const newSlots = [...slots];
    newSlots[index] = meta;
    writeSlotMeta(newSlots);
    setSlots(newSlots);
    showMessage(`存檔至槽位 ${index + 1} 成功！`);
  };

  const handleLoad = (index: number) => {
    const raw = localStorage.getItem(getSaveSlotKey(index));
    if (!raw) {
      showMessage('此槽位沒有存檔資料！');
      return;
    }
    try {
      const data = JSON.parse(raw);
      loadGameFromData(data);
      showMessage(`已讀取槽位 ${index + 1} 的存檔！`);
      onClose();
    } catch {
      showMessage('存檔資料損壞，無法讀取。');
    }
  };

  const handleDelete = (index: number) => {
    if (!window.confirm(`確定要刪除槽位 ${index + 1} 的存檔嗎？`)) return;
    localStorage.removeItem(getSaveSlotKey(index));
    const newSlots = [...slots];
    newSlots[index] = null;
    writeSlotMeta(newSlots);
    setSlots(newSlots);
    showMessage(`已刪除槽位 ${index + 1} 的存檔。`);
  };

  const handleExport = (index: number) => {
    const raw = localStorage.getItem(getSaveSlotKey(index));
    if (!raw) {
      showMessage('此槽位沒有存檔，無法匯出。');
      return;
    }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const meta = slots[index];
    const filename = meta
      ? `save_${meta.characterName}_Y${meta.year}M${meta.month}.json`
      : `save_slot${index + 1}.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showMessage(`已匯出槽位 ${index + 1} 的存檔為 JSON 檔案。`);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showMessage('請先貼上存檔 JSON 字串！');
      return;
    }
    try {
      const data = JSON.parse(importText.trim());
      // Basic validation
      if (!data.daughter || !data.time) {
        showMessage('無效的存檔格式！');
        return;
      }
      // Find first empty slot, or use slot 0
      let targetSlot = slots.findIndex(s => s === null);
      if (targetSlot === -1) targetSlot = 0;

      localStorage.setItem(getSaveSlotKey(targetSlot), JSON.stringify(data));

      const meta: SaveSlotMeta = {
        slotIndex: targetSlot,
        characterName: data.daughter?.name || '未知',
        characterId: data.daughter?.characterId || 'honghua',
        year: data.time?.year || 1,
        month: data.time?.month || 1,
        age: data.daughter?.age || 10,
        gold: data.daughter?.gold || 0,
        savedAt: new Date().toISOString()
      };
      const newSlots = [...slots];
      newSlots[targetSlot] = meta;
      writeSlotMeta(newSlots);
      setSlots(newSlots);
      setImportText('');
      setShowImport(false);
      showMessage(`已匯入存檔至槽位 ${targetSlot + 1}！`);
    } catch {
      showMessage('JSON 格式錯誤，無法匯入！');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setImportText(text);
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '未知時間';
    }
  };

  const charEmoji = (id: string) => {
    switch (id) {
      case 'honghua': return '🌺';
      case 'erica': return '🦋';
      case 'emilia': return '⚔️';
      default: return '👤';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-2xl p-6 animate-slide-up border-2 border-[#d4af37]/35 shadow-[0_0_35px_rgba(212,175,55,0.2)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-[#d4af37] bg-clip-text text-transparent flex items-center gap-2">
              <Save size={20} /> 存/讀檔紀錄管理
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">可查看各槽位紀錄時間，並直接讀取檔案。</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-[rgba(212,175,55,0.15)] border border-[#d4af37]/30 text-sm text-[#ffd700] text-center animate-slide-up">
            {message}
          </div>
        )}

        {/* Save Slots */}
        <div className="space-y-3 mb-6">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-slate-700/50 hover:border-[#d4af37]/30 transition-all"
            >
              {/* Slot number */}
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,175,55,0.1)] border border-[#d4af37]/20 flex items-center justify-center text-sm font-bold text-[#d4af37] flex-shrink-0">
                {i + 1}
              </div>

              {/* Slot info */}
              <div className="flex-1 min-w-0">
                {slot ? (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span>{charEmoji(slot.characterId)}</span>
                      <span>{slot.characterName}</span>
                      <span className="text-xs text-slate-400">({slot.age}歲)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>第{slot.year}年{slot.month}月</span>
                      <span className="text-[#ffd700]/60">{slot.gold}G</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(slot.savedAt)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600 italic">— 空槽位 —</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleSave(i)}
                  title="存檔至此槽位"
                  className="px-2 py-1.5 rounded bg-[rgba(212,175,55,0.1)] border border-[#d4af37]/25 hover:border-[#d4af37]/60 text-[#d4af37] hover:text-[#ffd700] transition-all text-[11px] font-semibold flex items-center gap-1"
                >
                  <Save size={14} />
                  <span>存檔</span>
                </button>
                {slot && (
                  <>
                    <button
                      onClick={() => handleLoad(i)}
                      title="讀取此槽位"
                      className="px-2 py-1.5 rounded bg-[rgba(100,200,255,0.08)] border border-sky-500/30 hover:border-sky-500/60 text-sky-400 hover:text-sky-300 transition-all text-[11px] font-semibold flex items-center gap-1"
                    >
                      <FolderOpen size={14} />
                      <span>讀取</span>
                    </button>
                    <button
                      onClick={() => handleExport(i)}
                      title="匯出存檔"
                      className="px-2 py-1.5 rounded bg-[rgba(100,255,100,0.08)] border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 transition-all text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Download size={14} />
                      <span>匯出</span>
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      title="刪除此槽位"
                      className="px-2 py-1.5 rounded bg-[rgba(255,100,100,0.08)] border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 transition-all text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>刪除</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Import Section */}
        <div className="border-t border-slate-800 pt-4">
          <button
            onClick={() => setShowImport(!showImport)}
            className="btn-fantasy py-2 px-4 text-xs flex items-center gap-2 mx-auto"
          >
            <Upload size={14} /> {showImport ? '收起匯入面板' : '匯入外部存檔'}
          </button>

          {showImport && (
            <div className="mt-4 space-y-3 animate-slide-up">
              <p className="text-xs text-slate-400 text-center">
                貼上 JSON 存檔字串，或選擇先前匯出的 .json 檔案
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder='貼上存檔 JSON 字串...'
                className="w-full h-24 bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37] transition-all resize-none"
              />
              <div className="flex items-center justify-center gap-3">
                <label className="btn-fantasy py-2 px-4 text-xs flex items-center gap-2 cursor-pointer">
                  <FolderOpen size={14} /> 選擇檔案
                  <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                </label>
                <button
                  onClick={handleImport}
                  className="btn-fantasy py-2 px-4 text-xs flex items-center gap-2"
                >
                  <Upload size={14} /> 確認匯入
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
