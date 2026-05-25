import React, { useState } from 'react';
import type { LogEntry } from '../types'; // 引入您的類型定義
import { Calendar, ChevronDown, ListFilter } from 'lucide-react';

interface LogHistoryPanelProps {
  logs: LogEntry[]; // 接收從 Context 傳來的 logs 陣列
}

export const LogHistoryPanel: React.FC<LogHistoryPanelProps> = ({ logs }) => {
  // 控制過濾頁籤：'all' 全紀錄 | 'event' 重大事件 | 'stat' 數值變動
  const [activeTab, setActiveTab] = useState<'all' | 'event' | 'stat'>('all');

  if (!logs || logs.length === 0) {
    return (
      <div className="parchment-dialog text-center py-8 text-stone-600 italic">
        📜 尚無任何歷史紀錄。
      </div>
    );
  }

  // 1. 根據頁籤篩選日誌
  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'event') return log.type === 'event' || log.type === 'dialogue';
    if (activeTab === 'stat') return log.type === 'stat_up' || log.type === 'stat_down';
    return true;
  });

  // 2. 將平鋪的 Log 陣列按「年_月」聚合分組
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const key = `Y${log.year}_M${log.month}`;
    if (!acc[key]) {
      acc[key] = {
        year: log.year,
        month: log.month,
        title: `第 ${log.year} 年 — ${log.month} 月`,
        entries: [],
      };
    }
    acc[key].entries.push(log);
    return acc;
  }, {} as Record<string, { year: number; month: number; title: string; entries: LogEntry[] }>);

  // 3. 最新月份排在最上面 (逆序編年史)
  const sortedGroups = Object.values(groupedLogs).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const getPeriodLabel = (period: 'early' | 'mid' | 'late') => {
    if (period === 'early') return '上旬';
    if (period === 'mid') return '中旬';
    return '下旬';
  };

  const getLogClass = (type: LogEntry['type']) => {
    switch (type) {
      case 'event': return 'text-purple-300 font-bold border-l-2 border-purple-500 pl-2';
      case 'dialogue': return 'text-[#e5c483] italic';
      case 'stat_up': return 'text-emerald-400';
      case 'stat_down': return 'text-rose-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 頁籤篩選按鈕列 */}
      <div className="flex gap-2 border-b border-[#c5a059]/30 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
            activeTab === 'all' ? 'bg-[#6b1d2f] text-[#e5c483] border border-[#c5a059]' : 'bg-black-dark/60 text-slate-400'
          }`}
        >
          📜 全紀錄
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
            activeTab === 'event' ? 'bg-[#6b1d2f] text-[#e5c483] border border-[#c5a059]' : 'bg-black-dark/60 text-slate-400'
          }`}
        >
          ✨ 重大事件
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stat')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
            activeTab === 'stat' ? 'bg-[#6b1d2f] text-[#e5c483] border border-[#c5a059]' : 'bg-black-dark/60 text-slate-400'
          }`}
        >
          📊 屬性成長
        </button>
      </div>

      {/* 手風琴手動手風琴摺疊區 */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 v-scrollbar">
        {sortedGroups.map((group, index) => {
          // 只有最新的一個月 (index === 0) 預設展開 open，其餘月份自動摺疊
          const isLatestMonth = index === 0;

          return (
            <details 
              key={`${group.year}_${group.month}`} 
              className="group border border-[#c5a059]/35 bg-black-dark/40 rounded overflow-hidden"
              open={isLatestMonth}
            >
              <summary className="p-3 cursor-pointer text-xs sm:text-sm font-bold text-[#e5c483] bg-[#161412] hover:bg-[#231f1b] flex justify-between items-center select-none pointer-events-auto">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#c5a059]" />
                  <span>{group.title}</span>
                  {isLatestMonth && (
                    <span className="text-[9px] bg-[#6b1d2f] text-white px-1.5 py-0.5 rounded border border-[#c5a059]/40 animate-pulse">
                      最新月份
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-normal">
                  <span className="group-open:hidden">展開 ({group.entries.length} 條)</span>
                  <span className="hidden group-open:inline">收起</span>
                  <ChevronDown size={14} className="transform group-open:rotate-180 transition-transform duration-200" />
                </div>
              </summary>

              <div className="p-3 space-y-2 border-t border-[#c5a059]/20 bg-black-dark/20 text-left divide-y divide-[#c5a059]/10">
                {group.entries.map((log) => (
                  <div key={log.id} className={`pt-2 first:pt-0 flex items-start gap-2 text-xs leading-relaxed ${getLogClass(log.type)}`}>
                    <span className="text-[10px] font-mono text-slate-500 bg-black-dark/50 px-1.5 py-0.5 rounded shrink-0">
                      {getPeriodLabel(log.period)}
                    </span>
                    <div className="flex-1">{log.text}</div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
};