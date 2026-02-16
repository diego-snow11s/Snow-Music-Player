import { usePlayer } from '@/contexts/PlayerContext';
import { X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

interface EqualizerViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const BANDS = [
  { id: 0, label: 'Bass', frequency: '60 Hz' },
  { id: 1, label: 'Low Mid', frequency: '250 Hz' },
  { id: 2, label: 'Mid', frequency: '1 kHz' },
  { id: 3, label: 'High Mid', frequency: '4 kHz' },
  { id: 4, label: 'Treble', frequency: '16 kHz' },
];

const PRESETS = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [6, 4, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 4, 6] },
  { name: 'Rock', gains: [4, 2, -1, 3, 4] },
  { name: 'Pop', gains: [-1, 2, 4, 2, -1] },
  { name: 'Jazz', gains: [3, 0, 2, 3, 4] },
  { name: 'Electronic', gains: [5, 3, 0, 2, 4] },
  { name: 'Classical', gains: [0, 0, 0, 2, 3] },
];

export function EqualizerView({ isOpen, onClose }: EqualizerViewProps) {
  const { equalizerGains, updateEqualizerBand } = usePlayer();
  const isMobile = useIsMobile();

  const applyPreset = (gains: number[]) => {
    gains.forEach((gain, index) => updateEqualizerBand(index, gain));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <h2 className="font-display font-bold text-xl md:text-2xl">Equalizador</h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 md:mb-4">Predefinições</h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button key={preset.name} onClick={() => applyPreset(preset.gains)} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-secondary hover:bg-muted text-xs md:text-sm font-medium transition-colors">
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 md:p-8">
            <div className={`flex items-end justify-between ${isMobile ? 'gap-3' : 'gap-8'} h-48 md:h-64`}>
              {BANDS.map((band) => (
                <div key={band.id} className="flex-1 flex flex-col items-center h-full">
                  <div className="flex justify-between h-full w-full flex-col text-[10px] md:text-xs text-muted-foreground mb-2">
                    <span>+12</span>
                    <span className="opacity-0">0</span>
                    <span>0</span>
                    <span className="opacity-0">0</span>
                    <span>-12</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center w-full relative">
                    <div className="absolute left-0 right-0 h-px bg-border/50 top-1/2" />
                    <div className="h-full flex items-center">
                      <Slider value={[equalizerGains[band.id] + 12]} max={24} step={0.5} orientation="vertical" onValueChange={(value) => updateEqualizerBand(band.id, value[0] - 12)} className={`${isMobile ? 'h-28' : 'h-40'}`} />
                    </div>
                  </div>
                  <div className="mt-2 md:mt-4 text-center">
                    <p className="text-xs md:text-sm font-medium">{isMobile ? band.frequency : band.label}</p>
                    {!isMobile && <p className="text-xs text-muted-foreground">{band.frequency}</p>}
                    <p className="text-[10px] md:text-xs text-primary font-medium mt-0.5 md:mt-1">
                      {equalizerGains[band.id] > 0 ? '+' : ''}{equalizerGains[band.id].toFixed(1)} dB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs md:text-sm text-muted-foreground mt-6 md:mt-8">
            Ajuste os graves, médios e agudos para personalizar o som.
          </p>
        </div>
      </div>
    </div>
  );
}
