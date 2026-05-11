import React from 'react';
import { Delete } from 'lucide-react';

interface CalculatorInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const CalculatorInput: React.FC<CalculatorInputProps> = ({ value, onChange }) => {
  const insert = (str: string) => onChange(value + str);
  const backspace = () => onChange(value.slice(0, -1));
  const clear = () => onChange('');

  const keys = [
    ['x^2', 'sin(', 'cos(', 'DEL'],
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '(', '+']
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-serif italic text-lg">f(x) =</div>
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg transition-shadow"
          placeholder="e.g. x^3 - 3x + 2"
          dir="ltr"
        />
      </div>
      <section className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
        {keys.flat().map((key, i) => {
          const isAction = key === 'DEL' || key === 'C';
          const isOperator = ['/', '*', '-', '+'].includes(key);
          
          let btnClass = "h-12 rounded bg-white border border-slate-200 text-sm md:text-base font-mono hover:bg-indigo-50 transition-colors shadow-sm";
          
          if (isAction) {
            btnClass = "h-12 rounded bg-slate-200 text-sm md:text-base font-mono font-bold hover:bg-slate-300 text-slate-700 transition-colors shadow-sm";
          } else if (isOperator) {
            btnClass = "h-12 rounded bg-indigo-100 text-indigo-700 text-sm md:text-base font-mono font-bold hover:bg-indigo-200 transition-colors shadow-sm";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (key === 'DEL' || key === '<-') backspace();
                else if (key === 'C') clear();
                else if (key === 'x^2') insert('^2');
                else insert(key);
              }}
              className={btnClass}
            >
              {key}
            </button>
          );
        })}
        {/* Extra row for x and clear if needed, or integrate better */}
        <button type="button" onClick={() => insert('x')} className="h-12 rounded bg-white border border-slate-200 text-sm md:text-base font-mono hover:bg-indigo-50 transition-colors shadow-sm font-bold text-indigo-600 col-span-2">x</button>
        <button type="button" onClick={() => insert('sqrt(')} className="h-12 rounded bg-white border border-slate-200 text-sm md:text-base font-mono hover:bg-indigo-50 transition-colors shadow-sm">sqrt</button>
        <button type="button" onClick={clear} className="h-12 rounded bg-rose-100 border border-rose-200 text-rose-700 text-sm md:text-base font-mono hover:bg-rose-200 transition-colors shadow-sm font-bold">C</button>
      </section>
    </div>
  );
};
