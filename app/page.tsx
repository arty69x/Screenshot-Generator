import { VersionHistory } from '@/components/VersionHistory';
import { AIContentGenerator } from '@/components/AIContentGenerator';
import { DeploymentActions } from '@/components/DeploymentActions';
import { AIAssistant } from '@/components/AIAssistant';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-zinc-50">
      <h1 className="text-4xl font-bold mb-8">Website Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <AIAssistant />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h2 className="text-xl font-semibold mb-4">Generated UI Preview</h2>
            <div className="h-64 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
              Generated UI will appear here
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <VersionHistory />
          <AIContentGenerator />
          <DeploymentActions />
        </div>
      </div>
    </main>
  );
}
