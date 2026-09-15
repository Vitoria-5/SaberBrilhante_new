import { useState, useMemo, useEffect } from 'react';

const MONTHS = [
  { v: 1, label: 'Janeiro 🎊' },
  { v: 2, label: 'Fevereiro 💝' },
  { v: 3, label: 'Março 🌸' },
  { v: 4, label: 'Abril 🌧️' },
  { v: 5, label: 'Maio 🌷' },
  { v: 6, label: 'Junho ☀️' },
  { v: 7, label: 'Julho 🎉' },
  { v: 8, label: 'Agosto 🌻' },
  { v: 9, label: 'Setembro 🍂' },
  { v: 10, label: 'Outubro 🎃' },
  { v: 11, label: 'Novembro 🍁' },
  { v: 12, label: 'Dezembro 🎄' },
];

export default function BirthDateInput({ value, onChange, labels = true }) {
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [y, setY] = useState('');

  useEffect(() => {
    if (!value) {
      setD('');
      setM('');
      setY('');
      return;
    }
    const parts = value.split('-');
    setD(parts[2] ? Number(parts[2]) : '');
    setM(parts[1] ? Number(parts[1]) : '');
    setY(parts[0] ? Number(parts[0]) : '');
  }, [value]);

  const nowY = new Date().getFullYear();
  const years = useMemo(() => {
    const arr = [];
    for (let i = nowY - 15; i <= nowY - 2; i++) arr.push(i);
    return arr;
  }, [nowY]);

  const maxDay = m ? new Date(y || nowY, m, 0).getDate() : 31;
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  const emit = (nd, nm, ny) => {
    const yy = ny || '';
    const mm = nm ? String(nm).padStart(2, '0') : '';
    const dd = nd ? String(nd).padStart(2, '0') : '';
    if (yy && mm && dd) onChange(`${yy}-${mm}-${dd}`);
    else onChange('');
  };

  const selectCls =
    'w-full px-3 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none bg-white font-semibold text-slate-700 appearance-none';

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        {labels && <label className="block text-xs font-bold text-violet-700 mb-1">Dia</label>}
        <select
          value={d}
          onChange={(e) => {
            const v = Number(e.target.value) || '';
            setD(v);
            emit(v, m, y);
          }}
          className={selectCls}
        >
          <option value="">Dia</option>
          {days.map((dd) => (
            <option key={dd} value={dd}>
              {dd}
            </option>
          ))}
        </select>
      </div>
      <div>
        {labels && <label className="block text-xs font-bold text-violet-700 mb-1">Mês</label>}
        <select
          value={m}
          onChange={(e) => {
            const v = Number(e.target.value) || '';
            setM(v);
            emit(d, v, y);
          }}
          className={selectCls}
        >
          <option value="">Mês</option>
          {MONTHS.map((mm) => (
            <option key={mm.v} value={mm.v}>
              {mm.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        {labels && <label className="block text-xs font-bold text-violet-700 mb-1">Ano</label>}
        <select
          value={y}
          onChange={(e) => {
            const v = Number(e.target.value) || '';
            setY(v);
            emit(d, m, v);
          }}
          className={selectCls}
        >
          <option value="">Ano</option>
          {years.map((yy) => (
            <option key={yy} value={yy}>
              {yy}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}