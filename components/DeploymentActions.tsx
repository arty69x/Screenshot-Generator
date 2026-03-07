'use client';
import { Rocket, Github } from 'lucide-react';

export function DeploymentActions() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold mb-4">Deployment</h2>
      <div className="space-y-4">
        <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700">
          <Rocket className="w-5 h-5" /> Deploy to Shareable URL
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800">
          <Github className="w-5 h-5" /> Publish to GitHub
        </button>
      </div>
    </div>
  );
}
