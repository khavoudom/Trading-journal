import { useMemo } from 'react';

export function PnLHeatmap() {
  const cells = useMemo(() => {
    const levels: string[] = [
      '',
      '',
      '',
      'l1',
      'l3',
      '',
      '',
      'l2',
      'l4',
      'neg1',
      'l3',
      'l2',
      '',
      '',
      'neg2',
      'l1',
      'l4',
      'l3',
      'l4',
      '',
      '',
      'l2',
      'l3',
      'l1',
      'l4',
      '',
      '',
      '',
      '',
      '',
    ];
    const padded = [...levels, ...Array(35 - levels.length).fill('')];
    return padded.slice(0, 35);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <div key={d} className="text-[9px] text-gray-600 text-center font-bold uppercase">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((level: string, i: number) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor:
                level === 'l1'
                  ? 'rgba(0,229,160,0.12)'
                  : level === 'l2'
                    ? 'rgba(0,229,160,0.28)'
                    : level === 'l3'
                      ? 'rgba(0,229,160,0.52)'
                      : level === 'l4'
                        ? 'rgba(0,229,160,0.8)'
                        : level === 'neg1'
                          ? 'rgba(255,107,53,0.15)'
                          : level === 'neg2'
                            ? 'rgba(255,107,53,0.40)'
                            : 'var(--surface2)',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2.5 text-[10px] text-gray-500">
        <span>Loss</span>
        <div className="size-2.5 rounded-xs" style={{ background: 'rgba(255,107,53,0.4)' }} />
        <div className="size-2.5 rounded-xs" style={{ background: 'rgba(0,229,160,0.12)' }} />
        <div className="size-2.5 rounded-xs" style={{ background: 'rgba(0,229,160,0.52)' }} />
        <div className="size-2.5 rounded-xs" style={{ background: 'rgba(0,229,160,0.8)' }} />
        <span>Big win</span>
      </div>
    </div>
  );
}
