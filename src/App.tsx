/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CalculatorInput } from './components/CalculatorInput';
import { MVTPlot } from './components/Plot';
import { checkTheoremConditions, validateFunctionSyntax } from './lib/mathUtils';
import { CheckCircle2, XCircle, Info, Calculator, AlertCircle } from 'lucide-react';

export default function App() {
  const [fStr, setFStr] = useState('x^3 - 3x + 2');
  const [a, setA] = useState<number>(-1.5);
  const [b, setB] = useState<number>(2.0);
  const [mode, setMode] = useState<'mvt' | 'rolle'>('mvt');
  const [syntaxError, setSyntaxError] = useState("");
  
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const check = validateFunctionSyntax(fStr);
    setSyntaxError(check.error);
  }, [fStr]);

  const handleCheck = () => {
    if (syntaxError) return;
    if (a >= b) {
      setResult({
        isValid: false,
        reason: "Invalid interval: 'a' must be strictly less than 'b'.",
        checkedFStr: fStr,
        checkedA: a,
        checkedB: b,
        checkedMode: mode
      });
      return;
    }
    const res = checkTheoremConditions(fStr, a, b, mode);
    setResult({ ...res, checkedFStr: fStr, checkedA: a, checkedB: b, checkedMode: mode });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">Σ</div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">MVT Visualizer</h1>
        </div>
        <div className="flex gap-4">
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            {mode === 'mvt' ? 'Calculus I: Mean Value Theorem' : "Calculus I: Rolle's Theorem"}
          </span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <aside className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col p-6 space-y-6 overflow-y-auto shrink-0 z-10 md:z-0 shadow-lg md:shadow-none">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'mvt' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('mvt'); setResult(null); }}
            >
              Mean Value
            </button>
            <button 
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'rolle' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('rolle'); setResult(null); }}
            >
              Rolle's
            </button>
          </div>

          <section>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Function Input</label>
            <CalculatorInput value={fStr} onChange={setFStr} />
            {syntaxError && (
              <div className="mt-2 text-xs text-rose-600 flex items-start gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{syntaxError}</span>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Interval [a, b]</label>
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between font-mono focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="text-xs text-slate-400 italic">a =</span>
                  <input type="number" value={a} onChange={e => setA(parseFloat(e.target.value) || 0)} className="w-16 bg-transparent text-right outline-none" />
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between font-mono focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="text-xs text-slate-400 italic">b =</span>
                  <input type="number" value={b} onChange={e => setB(parseFloat(e.target.value) || 0)} className="w-16 bg-transparent text-right outline-none" />
                </div>
              </div>
            </div>
            <button 
              onClick={handleCheck} 
              disabled={!!syntaxError}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all ${syntaxError ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 active:scale-95'}`}>
              Check Conditions
            </button>
          </section>

          {result && (
            <section className="pt-4 mt-auto border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${result.isValid ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Conditions Status</span>
              </div>
              {!result.isValid ? (
                  <div className="text-sm text-rose-700 bg-rose-50 p-3 rounded-md">
                    {result.reason}
                  </div>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-emerald-700">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Continuous on [{result.checkedA}, {result.checkedB}]
                  </li>
                  <li className="flex items-center gap-2 text-sm text-emerald-700">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Differentiable on ({result.checkedA}, {result.checkedB})
                  </li>
                </ul>
              )}
            </section>
          )}
        </aside>

        <section className="flex-1 flex flex-col p-6 md:p-8 gap-8 overflow-y-auto">
          {result && result.isValid ? (
            <>
              <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between p-4 border-b border-slate-50 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Coordinate Viewport</span>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-slate-500">f(x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1 bg-rose-500 rounded-full"></div>
                      <span className="text-xs text-slate-500 uppercase">Period [a, b]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-1 bg-emerald-500 rounded-full border border-dashed border-emerald-500 bg-transparent"></div>
                      <span className="text-xs text-slate-500">Secant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                      <span className="text-xs text-slate-500">c / Tangent</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                  <MVTPlot 
                    fStr={result.checkedFStr} 
                    a={result.checkedA} 
                    b={result.checkedB} 
                    cPoints={result.cPoints} 
                    m={result.m} 
                    f_a={result.f_a} 
                    f_b={result.f_b} 
                  />
                  <div className="absolute top-10 left-10 text-xs font-mono text-slate-400">y = {result.checkedFStr}</div>
                  {result.cPoints.length > 0 && (
                    <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur border border-slate-200 p-3 rounded-lg text-xs font-mono shadow-sm flex flex-col gap-1 text-slate-700">
                      {result.cPoints.map((c: number, idx: number) => (
                        <div key={idx}>c{result.cPoints.length > 1 ? idx + 1 : ""} ≈ {c.toFixed(4)}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-auto md:h-48 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Extraction Steps (c)</h3>
                  {result.cPoints.length > 0 ? (
                      <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">SOLVED</div>
                  ) : (
                      <div className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">NO VALID C</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">1. {result.checkedMode === 'mvt' ? `Find average rate of change on [${result.checkedA}, ${result.checkedB}]` : 'Verify f(a) = f(b) and set m = 0'}</p>
                    <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs md:text-sm text-slate-800 border border-slate-100">
                      {result.checkedMode === 'mvt' ? `m = (f(${result.checkedB}) - f(${result.checkedA})) / (${result.checkedB} - (${result.checkedA})) = ${result.m?.toFixed(4)}` : `f(${result.checkedA}) = f(${result.checkedB}) = ${result.f_a?.toFixed(4)}\nm = 0`}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">2. Set f'(c) = m and solve numerically</p>
                    <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs md:text-sm text-slate-800 border border-slate-100">
                      {result.cPoints.length > 0 
                        ? `f'(c) = ${result.m.toFixed(4)} → c ≈ ${result.cPoints.map((c:number) => c.toFixed(4)).join(', ')}`
                        : "Numerical solver could not find valid c within precision."}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-transparent mt-20">
              <div className="w-16 h-16 mb-4 text-slate-300 rounded-full border-2 border-slate-200 border-dashed flex items-center justify-center">
                <Calculator className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Enter a function and evaluate to visualize</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

