import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Sparkles, Calendar, User, Upload } from 'lucide-react';

const PRESETS = [
  { name: '主體形象', url: '/8719.png' },
  { name: '皇家公主', url: '/avatar_princess.png' },
  { name: '女武之星', url: '/avatar_warrior.png' },
  { name: '林間術士', url: '/avatar_mage.png' }
];

export const StartScreen: React.FC = () => {
  const { initGame } = useGame();
  const [name, setName] = useState('小櫻');
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(20);
  const [avatarUrl, setAvatarUrl] = useState('/8719.png');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initGame(name, birthMonth, birthDay, avatarUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[90vh]">
      <div className="glass-panel w-full max-w-lg p-8 animate-slide-up pulse-border text-center">
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2">美少女夢工廠</h1>
        <p className="text-sm font-semibold tracking-widest text-[#ffd700] uppercase mb-6">Princess Maker Web Simulation</p>
        
        {/* Avatar Setup Area */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Logo/Character Preview */}
          <div 
            className="w-32 h-32 rounded-full overflow-hidden border-2 bg-[rgba(255,255,255,0.03)] flex items-center justify-center transition-all duration-300"
            style={{
              borderColor: avatarUrl.startsWith('data:') ? 'var(--color-charisma)' : '#d4af37',
              boxShadow: avatarUrl.startsWith('data:') ? '0 0 15px rgba(0, 180, 216, 0.4)' : 'none'
            }}
          >
            <img 
              src={avatarUrl} 
              alt="Daughter preview" 
              className="w-full h-full object-cover float-animation" 
              onError={(e) => {
                // fallback if image not found or loaded yet
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>

          {/* Preset Avatar Selection Grid */}
          <div className="space-y-2 w-full">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#f3e5ab]">選擇女兒起手形象風格</p>
            <div className="flex items-center justify-center gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setAvatarUrl(preset.url)}
                  title={preset.name}
                  className={`w-12 h-12 rounded-full overflow-hidden border transition-all ${
                    avatarUrl === preset.url 
                      ? 'border-[#d4af37] scale-110 shadow-[0_0_8px_rgba(212,175,55,0.4)]' 
                      : 'border-slate-800 hover:border-slate-600 scale-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </button>
              ))}
              
              {/* Custom Upload Button */}
              <label 
                title="上傳自訂頭像"
                className={`w-12 h-12 rounded-full border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-all bg-slate-900/60 ${
                  avatarUrl.startsWith('data:')
                    ? 'border-[#00b4d8] scale-110 shadow-[0_0_8px_rgba(0,180,216,0.4)] text-[#00b4d8]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <Upload size={18} />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            {avatarUrl.startsWith('data:') && (
              <p className="text-[10px] text-emerald-400">已套用自訂上傳形象 ✨</p>
            )}
          </div>
        </div>
        
        <p className="text-xs text-[#a3a1bc] mb-8 leading-relaxed">
          作為曾經名震大陸的傳奇勇者，你在戰爭結束後收養了一名孤兒女童。<br />
          在未來的八年裡，你將親自為她規劃課業、打工與生活，<br />
          引導她走向命運的終點。
        </p>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-bold tracking-wider text-[#ffd700] flex items-center gap-2">
              <User size={16} /> 女兒的姓名
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value.slice(0, 10))}
              placeholder="請輸入姓名..." 
              required
              className="w-full bg-[rgba(10,8,22,0.6)] border border-[rgba(212,175,55,0.3)] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#d4af37] transition-all"
            />
          </div>

          {/* Birthday picker */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider text-[#ffd700] flex items-center gap-2">
                <Calendar size={16} /> 生日月份
              </label>
              <select 
                value={birthMonth} 
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="w-full bg-[rgba(10,8,22,0.6)] border border-[rgba(212,175,55,0.3)] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#d4af37] transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m} 月</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wider text-[#ffd700] flex items-center gap-2">
                <Calendar size={16} /> 生日日期
              </label>
              <select 
                value={birthDay} 
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="w-full bg-[rgba(10,8,22,0.6)] border border-[rgba(212,175,55,0.3)] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#d4af37] transition-all"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d} 日</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full btn-fantasy py-4 mt-4 text-lg">
            <Sparkles size={20} /> 展開養育之旅
          </button>
        </form>
      </div>
    </div>
  );
};
