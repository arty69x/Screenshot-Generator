'use client';
import { useState } from 'react';
import { History, RotateCcw } from 'lucide-react';

export function VersionHistory() {
  const [versions, setVersions] = useState([
    { id: 1, timestamp: '2026-03-07 10:00:00', snapshot: 'v1' },
    { id: 2, timestamp: '2026-03-07 11:00:00', snapshot: 'v2' },
  ]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <History className="w-5 h-5" /> Version History
      </h2>
      <ul className="space-y-2">
        {versions.map((version) => (
          <li key={version.id} className="flex justify-between items-center text-sm p-2 bg-zinc-50 rounded">
            <span>{version.timestamp}</span>
            <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <RotateCcw className="w-4 h-4" /> Revert
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
