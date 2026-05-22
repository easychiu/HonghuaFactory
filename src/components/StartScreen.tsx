import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Sparkles, Calendar, User } from 'lucide-react';

export const StartScreen: React.FC = () => {
  const { initGame } = useGame();
  const [name, setName] = useState('小櫻');
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(20);

  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const defaultAvatar = `${prefix}sprites/daughter_10_default.png`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initGame(name, birthMonth, birthDay, defaultAvatar);
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
            className="w-32 h-32 rounded-full overflow-hidden border-2 bg-[rgba(255,255,255,0.03)] border-[#d4af37] flex items-center justify-center transition-all duration-300"
          >
            <img 
              src={defaultAvatar} 
              alt="Daughter preview" 
              className="w-full h-full object-cover float-animation" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <p className="text-xs text-[#f3e5ab] font-semibold tracking-wider">初始女兒年齡：10 歲 👧</p>
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
