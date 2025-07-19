
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { MidiExplorer } from './MidiExplorer';
import { MidiPlayer } from './MidiPlayer';
import { MidiComposer } from './MidiComposer';
import { GrooveStudio } from './GrooveStudio';
import { AdvancedMidiEditor } from './AdvancedMidiEditor';
import { WaveformEditor } from './WaveformEditor';
import { Music, Play, Edit, Layers, Waveform, Settings } from 'lucide-react';

export const MidiStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explorer');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">MIDI Studio Pro</h1>
        <p className="text-white/60">
          Professional music editing, composition, and production suite
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/10 border border-white/20">
          <TabsTrigger 
            value="explorer" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Music className="w-4 h-4" />
            Explorer
          </TabsTrigger>
          <TabsTrigger 
            value="player" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Play className="w-4 h-4" />
            Player
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Edit className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger 
            value="waveform" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Waveform className="w-4 h-4" />
            Waveform
          </TabsTrigger>
          <TabsTrigger 
            value="composer" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Settings className="w-4 h-4" />
            Composer
          </TabsTrigger>
          <TabsTrigger 
            value="groove" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20"
          >
            <Layers className="w-4 h-4" />
            Groove Studio
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="explorer" className="space-y-6">
            <MidiExplorer />
          </TabsContent>

          <TabsContent value="player" className="space-y-6">
            <MidiPlayer />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <AdvancedMidiEditor />
          </TabsContent>

          <TabsContent value="waveform" className="space-y-6">
            <WaveformEditor />
          </TabsContent>

          <TabsContent value="composer" className="space-y-6">
            <MidiComposer />
          </TabsContent>

          <TabsContent value="groove" className="space-y-6">
            <GrooveStudio />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
