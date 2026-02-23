"use client";

import React, { useState } from 'react';
import {
    DollarSign, FileSpreadsheet, ListChecks, Calculator, Layers, TrendingUp, Download, HardHat, Package, Truck, Sparkles, Loader2
} from 'lucide-react';

export default function PresioModule({ projectData }) {
    const [activeView, setActiveView] = useState('presupuesto'); // presupuesto, apu, matrices
    const [isCalculating, setIsCalculating] = useState(false);

    // Mock de Unidades Constructivas (UC) estándar ENEE
    const constructibleUnits = [
        { id: 'UC-MT-P1', desc: 'Poste de Concreto 40ft/500kg', cat: 'Estructura MT', suministros: 450.00, montaje: 120.00, transporte: 45.00 },
        { id: 'UC-MT-A1', desc: 'Armado Monofásico Tangente 13.8kV', cat: 'Red MT', suministros: 85.00, montaje: 65.00, transporte: 5.00 },
        { id: 'UC-BT-S1', desc: 'Salida de Alumbrado Público LED 60W', cat: 'Red BT', suministros: 120.00, montaje: 35.00, transporte: 10.00 },
        { id: 'UC-TR-15', desc: 'Transformador 15kVA Monofásico', cat: 'Transformación', suministros: 1450.00, montaje: 250.00, transporte: 85.00 },
    ];

    // Datos simulados de presupuesto (generados desde REDCAD/REDLIN)
    const budgetData = [
        { item: '1.0', desc: 'Línea de Distribución Primaria 13.8kV', total: 12500.50, detail: 'Ruta Troncal El Mestizal - Sector A' },
        { item: '2.0', desc: 'Red de Distribución Secundaria BT', total: 8450.20, detail: 'Localidad El Mestizal - Sector Viviendas' },
        { item: '3.0', desc: 'Transformación y Protecciones', total: 3200.00, detail: 'Subestación Aérea N-01' },
        { item: '4.0', desc: 'Acometidas y Medición', total: 5600.00, detail: '15 Usuarios Nuevos' },
    ];

    const totalBudget = budgetData.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg"><Calculator size={20} className="text-white" /></div>
                        PRESIO 2023: Gestión de Metrados y Costos ✨
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Presupuesto, APU y Fórmula Polinómica (Normas ENEE)</p>
                </div>
                <div className="flex gap-3">
                    <button className="text-[10px] font-black text-slate-600 bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 uppercase tracking-widest">
                        <FileSpreadsheet size={14} /> Cargar Matrices (.XLS)
                    </button>
                    <button className="text-[10px] font-black text-white bg-emerald-600 px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 uppercase tracking-widest">
                        <Download size={14} /> Exportar Reporte ENEE
                    </button>
                </div>
            </div>

            {/* Tabs de Navegación del Módulo */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'presupuesto', label: 'Presupuesto Final', icon: DollarSign },
                    { id: 'apu', label: 'Análisis APU', icon: ListChecks },
                    { id: 'unidades', label: 'Base de Datos UC', icon: Layers },
                ].map((v) => (
                    <button
                        key={v.id}
                        onClick={() => setActiveView(v.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <v.icon size={14} /> {v.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Vista de Presupuesto */}
                {activeView === 'presupuesto' && (
                    <>
                        <div className="col-span-8 space-y-6">
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ítem</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción del Proyecto</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle Localidad</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total (Lps)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {budgetData.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6 text-xs font-black text-slate-400">{item.item}</td>
                                                <td className="px-8 py-6 text-sm font-bold text-slate-800">{item.desc}</td>
                                                <td className="px-8 py-6 text-[11px] font-medium text-slate-500 italic">{item.detail}</td>
                                                <td className="px-8 py-6 text-right text-sm font-black text-emerald-600">L. {item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-900 text-white">
                                            <td colSpan="3" className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total General del Presupuesto</td>
                                            <td className="px-8 py-6 text-right text-lg font-black text-emerald-400">L. {totalBudget.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Módulo de Fórmula Polinómica */}
                            <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 flex items-center justify-between">
                                <div className="flex gap-6 items-center">
                                    <div className="bg-white p-4 rounded-3xl shadow-sm text-emerald-600 border border-slate-100"><TrendingUp size={24} /></div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Fórmula Polinómica de Reajuste</h4>
                                        <p className="text-sm font-bold text-slate-700 font-mono tracking-tighter">
                                            K = 0.35(Jr/Jo) + 0.25(Mr/Mo) + 0.15(Er/Eo) + 0.25(GU)
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Ver Factores BCIE</button>
                            </div>
                        </div>

                        <div className="col-span-4 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6 text-center">
                                <div className="bg-emerald-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                    <Package size={32} />
                                </div>
                                <h4 className="text-lg font-black text-slate-800">Metrados Desagregados</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Sincroniza los metrados generados por REDCAD (Estructuras) y REDLIN (Conductores) para recalcular el presupuesto instantáneamente.
                                </p>
                                <button
                                    onClick={() => { setIsCalculating(true); setTimeout(() => setIsCalculating(false), 1500); }}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {isCalculating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-yellow-400" />}
                                    Sincronizar RED-ESOLUTIONS
                                </button>
                            </div>

                            <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white space-y-6 border border-indigo-400/20 shadow-2xl">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resumen Logístico ENEE</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-indigo-900/40 p-4 rounded-2xl">
                                        <div className="flex gap-3 items-center">
                                            <Package size={16} className="text-indigo-300" />
                                            <span className="text-[10px] font-bold uppercase">Peso Total Suministros</span>
                                        </div>
                                        <span className="text-xs font-black">12.5 Ton</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-indigo-900/40 p-4 rounded-2xl">
                                        <div className="flex gap-3 items-center">
                                            <Truck size={16} className="text-indigo-300" />
                                            <span className="text-[10px] font-bold uppercase">Costo Transporte</span>
                                        </div>
                                        <span className="text-xs font-black text-indigo-400">L. 4,250.00</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-indigo-900/40 p-4 rounded-2xl">
                                        <div className="flex gap-3 items-center">
                                            <HardHat size={16} className="text-indigo-300" />
                                            <span className="text-[10px] font-bold uppercase">Mano de Obra</span>
                                        </div>
                                        <span className="text-xs font-black">L. 15,400.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Vista de Base de Datos de Unidades Constructivas */}
                {activeView === 'unidades' && (
                    <div className="col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Matriz Estandarizada de Unidades Constructivas (UC)</h4>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Buscar UC..." className="text-xs px-6 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none w-64" />
                                <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Agregar Nueva UC</button>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código UC</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción Estructura/Armado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Sum. (L)</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Mont. (L)</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Trans. (L)</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {constructibleUnits.map((uc, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6 text-xs font-black text-slate-600">{uc.id}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-800">{uc.desc}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-slate-100 text-slate-500 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{uc.cat}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-xs font-bold">{uc.suministros.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right text-xs font-bold">{uc.montaje.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right text-xs font-bold">{uc.transporte.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Editar APU</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Vista APU (Placeholder Intuitivo) */}
                {activeView === 'apu' && (
                    <div className="col-span-12 flex flex-col items-center justify-center p-20 bg-emerald-50/20 rounded-[3rem] border border-dashed border-emerald-200 text-center">
                        <div className="bg-emerald-100 p-6 rounded-[2.5rem] mb-6 text-emerald-600 shadow-inner">
                            <ListChecks size={48} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Análisis de Precios Unitarios (APU)</h4>
                        <p className="max-w-md text-sm text-slate-500 font-medium leading-relaxed mt-4">
                            Selecciona una Unidad Constructiva para desglosar sus recursos (Mano de Obra, Materiales y Equipo) y personalizar los rendimientos según la zona de trabajo.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Gestionar Recursos</button>
                            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Importar Rendimientos</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
