"use client";

import React, { useState } from 'react';
import {
    BarChart3, MoveRight, Ruler, Trash2, ShieldAlert, Cpu, Download, Sparkles, HardHat
} from 'lucide-react';

export default function RedlinModule({ selectedTrafo, trafoData }) {
    const [claro, setClaro] = useState(40);
    const [tension, setTension] = useState(350);
    const [conductorWeight, setConductorWeight] = useState(0.5);
    const [catenaryResult, setCatenaryResult] = useState(null);

    const calculateCatenary = () => {
        // F = (w * l^2) / (8 * T)
        const sag = (conductorWeight * Math.pow(claro, 2)) / (8 * tension);
        setCatenaryResult({
            sag: sag.toFixed(3),
            tension,
            claro,
            clearance: (9 - sag).toFixed(2) // 9m es la altura estándar de montaje
        });
    };

    // Datos simulados de perfil topográfico (GPS)
    const topographicPoints = [
        { x: 0, y: 100 },
        { x: 40, y: 102 },
        { x: 80, y: 101 },
        { x: 120, y: 98 },
        { x: 160, y: 99 },
        { x: 200, y: 103 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg"><Cpu size={20} className="text-white" /></div>
                        REDLIN Engineering Engine ✨
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Diseño Mecánico y Topográfico (Estilo eSolutions)</p>
                </div>
                <div className="flex gap-3">
                    <button className="text-xs font-black text-slate-600 bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                        <Trash2 size={14} /> Reset Perfil
                    </button>
                    <button className="text-xs font-black text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                        <Download size={14} /> Exportar AutoCAD .SCR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Panel de Control Mecánico */}
                <div className="col-span-1 space-y-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <HardHat size={14} className="text-blue-500" /> Parámetros REDLIN
                    </h4>

                    <div className="space-y-6">
                        <div>
                            <label className="flex justify-between text-[11px] font-black mb-3 text-slate-700">
                                <span>Vano / Claro (m)</span>
                                <span className="text-blue-600">{claro} m</span>
                            </label>
                            <input
                                type="range" min="10" max="100" step="5"
                                value={claro}
                                onChange={(e) => setClaro(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-[11px] font-black mb-3 text-slate-700">
                                <span>Tensión Tendido (kgf)</span>
                                <span className="text-blue-600">{tension} kg</span>
                            </label>
                            <input
                                type="range" min="100" max="1000" step="10"
                                value={tension}
                                onChange={(e) => setTension(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={calculateCatenary}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                                <Sparkles size={14} className="text-yellow-400" /> Resolver Catenaria
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visualización de Perfil Longitudinal */}
                <div className="col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={14} className="text-emerald-500" /> Perfil de Terreno (GPS + DEM)
                        </h4>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <MoveRight size={10} /> Escala 1:200
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] relative bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                        {/* SVG simplificado para simular el perfil y la catenaria */}
                        <svg viewBox="0 0 240 120" className="w-full h-full drop-shadow-sm">
                            {/* Terreno */}
                            <polyline
                                fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round"
                                points={topographicPoints.map(p => `${p.x},${120 - (p.y - 90) * 3}`).join(' ')}
                            />
                            {/* Área del terreno */}
                            <polygon
                                fill="#cbd5e1" fillOpacity="0.2"
                                points={`0,120 ${topographicPoints.map(p => `${p.x},${120 - (p.y - 90) * 3}`).join(' ')} 240,120`}
                            />

                            {/* Postes simulados */}
                            {topographicPoints.map((p, i) => (
                                <rect
                                    key={i}
                                    x={p.x - 1} y={120 - (p.y - 90) * 3 - 20}
                                    width="2" height="20"
                                    fill="#1e293b"
                                />
                            ))}

                            {/* Catenaria (Parábola simulada si hay resultado) */}
                            {catenaryResult && (
                                <path
                                    d={`M 0,${120 - (100 - 90) * 3 - 20} Q 20,${120 - (100 - 90) * 3 - 20 + catenaryResult.sag * 3} 40,${120 - (102 - 90) * 3 - 20}`}
                                    fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,2"
                                />
                            )}
                        </svg>

                        {/* Overlay de Resultados REDLIN */}
                        {catenaryResult && (
                            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 shadow-2xl max-w-[220px] animate-in zoom-in-95 duration-500">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flecha Calculada</span>
                                        <span className="text-xl font-black text-blue-600">{catenaryResult.sag} m</span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distancia al Suelo</span>
                                        <span className={`text-xl font-black ${parseFloat(catenaryResult.clearance) < 5.5 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {catenaryResult.clearance} m
                                        </span>
                                    </div>
                                    {parseFloat(catenaryResult.clearance) < 5.5 && (
                                        <div className="bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100">
                                            <ShieldAlert size={14} className="text-red-600" />
                                            <span className="text-[9px] font-black text-red-700 uppercase leading-tight">VIOLACIÓN DE DISTANCIA MÍNIMA (NEC)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-4 left-6 flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                <span className="text-[9px] font-bold text-slate-500">Catenaria (Redlin)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                                <span className="text-[9px] font-bold text-slate-500">Perfil Natural</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Validación REDLIN */}
            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex gap-6 items-center">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                            <Ruler size={24} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">Módulo de Cruzamientos ✨</h4>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                Analizador automático de distancias de seguridad en cruces de líneas primarias y secundarias según Manual de Obras ENEE.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Cruzamientos detectados: 0</span>
                        <button className="text-blue-400 hover:text-blue-300">Ejecutar Análisis</button>
                    </div>
                </div>

                <div className="col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                        <Download size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Exportar Reporte REDLIN</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Genera el reporte mecánico completo en formato XLSX para integración con hojas de cálculo eSolutions.
                        </p>
                    </div>
                    <button className="ml-auto bg-slate-50 hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Exportar</button>
                </div>
            </div>
        </div>
    );
}
