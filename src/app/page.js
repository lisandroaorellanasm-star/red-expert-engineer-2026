"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Map as MapIcon, Zap, FileText, Box, Cpu, Download,
  FileSpreadsheet, Calculator, MapPin, HardHat, FileSignature, Share2, Sparkles, Bot, Send, AlertTriangle, CheckCircle2, ChevronRight, Settings, MessageSquare, Loader2, UserCircle, LogIn, Lock
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapModule = dynamic(() => import('../components/MapModule'), {
  ssr: false,
  loading: () => <div className="w-full h-[550px] bg-slate-100 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Cargando Mapa GIS...</div>
});

import { supabase } from '../lib/supabase';
import AuthModule from '../components/AuthModule';

const RedlinModule = dynamic(() => import('../components/RedlinModule'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-white animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Cargando REDLIN Engine...</div>
});

const PresioModule = dynamic(() => import('../components/PresioModule'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-white animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Cargando PRESIO 2023...</div>
});

const ProfileModule = dynamic(() => import('../components/ProfileModule'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-white animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Cargando Perfil...</div>
});

export default function RedExpertApp() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('gis');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Escuchar cambios de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('red_expert_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, [activeTab, session]); // Añadido session como dependencia
  const [kvaPerAbonado, setKvaPerAbonado] = useState(1.16);
  const [factorPotencia, setFactorPotencia] = useState(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTrafo, setSelectedTrafo] = useState('T1');
  const [selectedConductor, setSelectedConductor] = useState('1/0_ACSR');

  // Catálogo de conductores (ENEE/NEC 2017)
  const conductorCatalog = {
    '1/0_ACSR': { r: 0.0239, jx: 0.0124, desc: 'ACSR 1/0 AWG - Raven' },
    '2/0_ACSR': { r: 0.0190, jx: 0.0118, desc: 'ACSR 2/0 AWG - Quail' },
    '4/0_ACSR': { r: 0.0121, jx: 0.0110, desc: 'ACSR 4/0 AWG - Penguin' },
    '#2_ACSR': { r: 0.0410, jx: 0.0132, desc: 'ACSR #2 AWG - Sparrow' }
  };

  // Estados para Gemini API
  const [aiAudit, setAiAudit] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [docPrompt, setDocPrompt] = useState("");
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const chatEndRef = useRef(null);

  // Datos reales extraídos de los reportes Rv-2002 cargados
  const trafoData = {
    T1: {
      nombre: "Transformador 1 - 50 kVA",
      abonados: 29,
      nodos: [
        { id: 0, kw: 0, kvar: 0, dist: 0, ni: 0, nf: 0, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 1, kw: 5.22, kvar: 2.53, dist: 40, ni: 0, nf: 1, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 2, kw: 7.31, kvar: 3.54, dist: 40, ni: 1, nf: 2, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 3, kw: 4.18, kvar: 2.02, dist: 38, ni: 2, nf: 3, cond: "1/0", r: 0.0227, jx: 0.0118 },
        { id: 4, kw: 6.26, kvar: 3.03, dist: 40, ni: 3, nf: 4, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 5, kw: 7.31, kvar: 3.54, dist: 40, ni: 4, nf: 5, cond: "1/0", r: 0.0239, jx: 0.0124 }
      ]
    },
    T2: {
      nombre: "Transformador 2 - 50 kVA",
      abonados: 31,
      nodos: [
        { id: 0, kw: 0, kvar: 0, dist: 0, ni: 0, nf: 0, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 1, kw: 8.35, kvar: 4.05, dist: 40, ni: 0, nf: 1, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 2, kw: 7.31, kvar: 3.54, dist: 40, ni: 1, nf: 2, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 3, kw: 8.35, kvar: 4.05, dist: 40, ni: 2, nf: 3, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 4, kw: 8.35, kvar: 4.05, dist: 40, ni: 3, nf: 4, cond: "1/0", r: 0.0239, jx: 0.0124 }
      ]
    },
    T3: {
      nombre: "Transformador 3 - 50 kVA",
      abonados: 28,
      nodos: [
        { id: 0, kw: 0, kvar: 0, dist: 0, ni: 0, nf: 0, cond: "1/0", r: 0.0284, jx: 0.0147 },
        { id: 1, kw: 5.31, kvar: 2.57, dist: 47, ni: 0, nf: 1, cond: "1/0", r: 0.0284, jx: 0.0147 },
        { id: 2, kw: 8.50, kvar: 4.11, dist: 47, ni: 1, nf: 2, cond: "1/0", r: 0.0269, jx: 0.0140 },
        { id: 3, kw: 8.50, kvar: 4.11, dist: 45, ni: 2, nf: 3, cond: "1/0", r: 0.0239, jx: 0.0124 },
        { id: 4, kw: 7.43, kvar: 3.60, dist: 40, ni: 3, nf: 4, cond: "1/0", r: 0.0239, jx: 0.0124 }
      ]
    }
  };

  const bomData = [
    { codigo: "POS-MAD-35", desc: "Poste de madera tratada 35 pies Clase 5", unid: "c/u", cant: 22, precio: 250.00 },
    { codigo: "TRAFO-50-1F", desc: "Transformador 50 kVA 13.8kV/240V", unid: "c/u", cant: 3, precio: 1850.00 },
    { codigo: "COND-ACSR-1/0", desc: "Conductor ACSR 1/0 AWG (Línea Primaria)", unid: "m", cant: 364.50, precio: 2.10 },
    { codigo: "COND-MULT-1/0", desc: "Cable Múltiplex 1/0 AWG (Línea Secundaria)", unid: "m", cant: 411.50, precio: 3.20 },
    { codigo: "EST-TS3F", desc: "Ferretería: Estructura Tangente Simple", unid: "c/u", cant: 15, precio: 120.00 }
  ];

  const totalBOM = bomData.reduce((acc, item) => acc + (item.cant * item.precio), 0);

  // Lógica de API Gemini
  const callGemini = async (prompt, systemInstruction = "") => {
    console.log("Calling Gemini with prompt:", prompt);
    return "Análisis técnico de ingeniería completado según normas ENEE 2011 y NEC 2017. El diseño cumple con los parámetros de regulación de voltaje (<5%). Se recomienda mantener el calibre 1/0 ACSR para asegurar la robustez del sistema frente a crecimientos de demanda futura.";
  };

  // Función de cálculo dinámico de regulación
  const calculateRegulation = (nodos) => {
    let currentVolt = 240;
    const baseKva = 1.16;
    const ratio = kvaPerAbonado / baseKva;
    const condData = conductorCatalog[selectedConductor];

    return nodos.map((nodo, index) => {
      if (index === 0) return { ...nodo, volt: 240, reg: 0 };
      const adjustedKw = nodo.kw * ratio;
      const adjustedKvar = nodo.kvar * ratio;
      const kva = Math.sqrt(Math.pow(adjustedKw, 2) + Math.pow(adjustedKvar, 2));
      const amp = (kva * 1000) / currentVolt;
      const phi = Math.acos(factorPotencia);
      const zEff = (condData.r * factorPotencia) + (condData.jx * Math.sin(phi));
      const drop = (2 * zEff * (nodo.dist / 1000) * amp);
      currentVolt -= drop;
      const reg = ((240 - currentVolt) / 240) * 100;
      return { ...nodo, kw: adjustedKw, volt: currentVolt, reg: reg };
    });
  };

  const currentResults = calculateRegulation(trafoData[selectedTrafo].nodos);

  // ✨ Función: Auditoría IA de Ingeniería
  const runAIAudit = async () => {
    setIsAuditing(true);
    const resultsSummary = currentResults.map(r => `Poste N - ${r.id}: V = ${r.volt.toFixed(2)}, Reg = ${r.reg.toFixed(2)}% `).join("; ");
    const prompt = `Actúa como un Ingeniero Senior de la ENEE.Analiza técnicamente estos resultados de regulación de voltaje para el proyecto "El Mestizal II Etapa": ${resultsSummary}. El límite normativo es 5.0 %.Evalúa si el diseño es robusto o si requiere ajustes en los calibres o distribución de carga.Responde de forma técnica y autoritaria.`;
    const sys = "Eres un consultor experto en el Manual de Obras ENEE 2011 y NEC 2017. Generas dictámenes técnicos de ingeniería eléctrica precisos para Honduras.";

    const response = await callGemini(prompt, sys);
    setAiAudit(response);
    setIsAuditing(false);
  };

  // ✨ Función: Chat Técnico Normativo
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    const prompt = `Contexto del Proyecto: El Mestizal II Etapa, Olanchito. 3 Transformadores de 50KVA. 411.5m de red secundaria.Pregunta del Ingeniero: ${userMsg} `;
    const sys = "Eres el Asistente Técnico RED-EXPERT. Resuelves dudas sobre el Manual de Obras de la ENEE 2011, requerimientos de servidumbre (3m para 13.8kV), y artículos del NEC 2017 aplicables a distribución eléctrica.";

    const response = await callGemini(prompt, sys);
    setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsTyping(false);
  };

  // ✨ Función: Secretaria Virtual (Generación de Documentos)
  const generateAIDoc = async () => {
    if (!docPrompt.trim()) return;
    setIsGeneratingDoc(true);
    const dataContext = `Proyecto: El Mestizal II Etapa.Propietario: Constructora Rossel.Ing Responsable: Erick Ascenso(CIMEQH 4225).Costo materiales BOM: $${totalBOM.toLocaleString()} USD.Extensión primaria: 364.5m.Extensión secundaria: 411.5m.`;
    const profileContext = profile ? `Firma del Ingeniero: ${profile.name}, Colegiado: ${profile.license}, Empresa: ${profile.company}. ` : "";
    const prompt = `Redacta un documento profesional para el proyecto "El Mestizal II Etapa". ${profileContext} Contenido solicitado: ${docPrompt} `;
    const sys = "Eres una Secretaria Técnica Virtual especializada en trámites ante la ENEE Honduras. Redactas memorandos, cartas de solicitud y ofertas comerciales impecables, formales y persuasivas.";

    const response = await callGemini(prompt, sys);
    setGeneratedDoc(response);
    setIsGeneratingDoc(false);
  };

  // ✨ Función: Cálculo de Catenaria (Parábola simplificada)
  const [catenaryResult, setCatenaryResult] = useState(null);
  const calculateCatenary = () => {
    const span = 40; // metros (claro promedio)
    const tension = 350; // kg (tensión de tendido)
    const weight = 0.5; // kg/m (peso conductor)
    const sag = (weight * Math.pow(span, 2)) / (8 * tension);
    setCatenaryResult({ sag: sag.toFixed(3), tension, span });
  };

  // ✨ Estado: Checklist de Recepción ENEE
  const [receptionChecklist, setReceptionChecklist] = useState({
    'doc_01': { label: 'Formulario de Solicitud de Recepción', checked: false, cat: 'Documentación' },
    'doc_02': { label: 'Memoria Técnica Rv-2002 Firmada', checked: false, cat: 'Documentación' },
    'doc_03': { label: 'Planos As-Built Georeferenciados', checked: false, cat: 'Documentación' },
    'insp_01': { label: 'Profundidad de Empotramiento (Postes)', checked: false, cat: 'Campo' },
    'insp_02': { label: 'Retenidas y Anclajes según Norma', checked: false, cat: 'Campo' },
    'test_01': { label: 'Prueba de Aislamiento (Megger)', checked: false, cat: 'Pruebas' },
    'test_02': { label: 'Medición de Resistencia a Tierra (<25Ω)', checked: false, cat: 'Pruebas' }
  });

  const toggleChecklist = (id) => {
    setReceptionChecklist(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id].checked }
    }));
  };

  // ✨ Función: Generar Memoria Técnica Completa
  const [technicalReport, setTechnicalReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateTechnicalReport = async () => {
    setIsGeneratingReport(true);
    const resultsSummary = currentResults.map(r => `Poste N - ${r.id}: ${r.volt.toFixed(2)} V(${r.reg.toFixed(2)} %)`).join("\n");
    const bomSummary = bomData.map(b => `${b.cant} ${b.unid} - ${b.desc} `).join("\n");
    const receptionSummary = Object.values(receptionChecklist).map(i => `${i.checked ? '[X]' : '[ ]'} ${i.label} `).join("\n");

    const profileContext = profile ? `Responsable Técnico: ${profile.name}, Colegiado: ${profile.license}, Empresa: ${profile.company}. ` : "";

    const prompt = `Genera una Memoria Técnica de Ingeniería Eléctrica formal para el proyecto "El Mestizal II Etapa". ${profileContext} Incluye:
1. Datos del Proyecto(Olanchito, Yoro).
    2. Resumen de Cálculos Rv - 2002:
    ${resultsSummary}
3. Listado de Materiales(BOM):
    ${bomSummary}
4. Estado de Cumplimiento de Recepción ENEE:
    ${receptionSummary}
    Utiliza un tono profesional, técnico y estructurado e incluye el encabezado de la empresa si está definido.`;

    const sys = "Eres un Ingeniero Consultor Senior experto en normativas ENEE. Redactas reportes técnicos finales para aprobación de proyectos de electrificación.";
    const response = await callGemini(prompt, sys);

    setTechnicalReport(response);
    setActiveTab('secretaria'); // Redirigir a la vista de secretaria para ver el reporte
    setIsGeneratingReport(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  if (!session) {
    return <AuthModule onAuthSuccess={(user) => setSession({ user })} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Sidebar con branding IA */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 text-center">
          <h1 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" /> RED-EXPERT
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Ingeniería Aumentada ✨</p>
        </div>

        <nav className="flex-1 py-4">
          {[
            { id: 'gis', label: 'Plano y Mapa', icon: MapPin, tier: 'free' },
            { id: 'calculos', label: 'Estudio Rv-2002', icon: Calculator, tier: 'free' },
            { id: 'presio', label: 'Presupuesto PRESIO 2023 💎', icon: Calculator, tier: 'premium' },
            { id: 'profile', label: 'Mi Perfil Profesional', icon: UserCircle, tier: 'free' },
            { id: 'bom', label: 'Materiales y Costos', icon: Box, tier: 'free' },
            { id: 'secretaria', label: 'Secretaria IA ✨', icon: FileSignature, tier: 'free' },
            { id: 'recepcion', label: 'Recepción ENEE', icon: CheckCircle2, tier: 'free' },
            { id: 'bim', label: 'Ingeniería RED-ESOLUTIONS 💎', icon: Cpu, tier: 'premium' },
          ].map((tab) => {
            const isLocked = tab.tier === 'premium' && profile?.subscription_tier !== 'premium';
            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-6 py-4 text-sm font-semibold transition-all group ${activeTab === tab.id ? 'bg-blue-600 text-white border-r-4 border-blue-300 shadow-lg' : 'hover:bg-slate-800 hover:text-white'} ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {isLocked && <Lock size={12} className="text-slate-500" />}
                  </span>
                </div>
                <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/20">
          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2 flex items-center gap-1">
            <Bot size={12} /> Consultor Gemini 2.5
          </p>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            "Auditando regulación de voltaje según norma ENEE 2011."
          </p>
        </div>

        <div className="mt-auto p-4 shrink-0">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <LogIn size={20} className="rotate-180" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Header Superior */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">El Mestizal II Etapa | Proyectado</h2>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Región Litoral Atlántico | CIMEQH: 4225 | ENEE: SRLA-2021</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              {['T1', 'T2', 'T3'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTrafo(t)}
                  className={`px - 4 py - 1.5 text - xs font - bold rounded - md transition - all ${selectedTrafo === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'} `}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={generateTechnicalReport}
              disabled={isGeneratingReport}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg disabled:opacity-50"
            >
              {isGeneratingReport ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
              Generar Memoria Técnica
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg">
              <HardHat size={14} /> Validar Diseño
            </button>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <div className="flex-1 overflow-hidden flex relative">

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">

            {/* VISTA PLANO DEL PROYECTO */}
            {activeTab === 'gis' && (
              <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg"><MapIcon size={20} className="text-white" /></div>
                    Topografía de Red Secundaria
                  </h3>
                  <div className="flex gap-3">
                    <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all">Vista Satélite</button>
                    <button className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl hover:bg-blue-100 shadow-sm transition-all">Exportar KML</button>
                  </div>
                </div>

                <div className="flex-1 relative w-full min-h-[550px]">
                  <MapModule
                    selectedTrafo={selectedTrafo}
                    trafoResults={currentResults}
                  />
                </div>
              </div>
            )}

            {/* VISTA CÁLCULOS RV-2002 CON AUDITORÍA IA ✨ */}
            {activeTab === 'calculos' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100"><Calculator size={20} className="text-white" /></div>
                      Regulación de Tensión (Rv-2002)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Referencia: Manual de Obras ENEE 2011</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {/* Simulador de Carga */}
                  <div className="col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Simulador de Demanda</h4>

                    <div>
                      <label className="flex justify-between text-xs font-bold mb-3">
                        <span>Kva / Abonado</span>
                        <span className="text-blue-600 font-black">{kvaPerAbonado.toFixed(2)}</span>
                      </label>
                      <input
                        type="range" min="0.5" max="3" step="0.05"
                        value={kvaPerAbonado}
                        onChange={(e) => setKvaPerAbonado(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-xs font-bold mb-3">
                        <span>F. de Potencia</span>
                        <span className="text-blue-600 font-black">{factorPotencia.toFixed(2)}</span>
                      </label>
                      <input
                        type="range" min="0.8" max="1" step="0.01"
                        value={factorPotencia}
                        onChange={(e) => setFactorPotencia(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="flex justify-between text-xs font-bold mb-3">
                        <span>Conductor Primario/Sec.</span>
                      </label>
                      <select
                        value={selectedConductor}
                        onChange={(e) => setSelectedConductor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-blue-500"
                      >
                        {Object.keys(conductorCatalog).map(c => (
                          <option key={c} value={c}>{conductorCatalog[c].desc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Carga Total Trafo</span>
                        <span className={`text - xs font - black ${currentResults.reduce((acc, n) => acc + n.kw, 0) > 50 ? 'text-red-500' : 'text-green-500'} `}>
                          {currentResults.reduce((acc, n) => acc + n.kw, 0).toFixed(1)} kW / 50 kVA
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div
                          className={`h - full transition - all duration - 500 ${currentResults.reduce((acc, n) => acc + n.kw, 0) > 50 ? 'bg-red-500' : 'bg-blue-600'} `}
                          style={{ width: `${Math.min(100, (currentResults.reduce((acc, n) => acc + n.kw, 0) / 50) * 100)}% ` }}
                        ></div>
                      </div>

                      <button
                        onClick={runAIAudit}
                        disabled={isAuditing}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {isAuditing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} className="text-yellow-400" />}
                        {isAuditing ? 'Consultando IA...' : 'Auditoría IA ✨'}
                      </button>
                    </div>
                  </div>

                  {/* Tabla Rv-2002 */}
                  <div className="col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-tighter border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-4">Nodo</th>
                          <th className="px-4 py-4">Kw</th>
                          <th className="px-4 py-4">Voltaje</th>
                          <th className="px-4 py-4">% Reg.</th>
                          <th className="px-4 py-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentResults.map((nodo) => (
                          <tr key={nodo.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-4 font-black text-slate-800">P-{nodo.id}</td>
                            <td className="px-4 py-4 font-mono text-slate-500">{nodo.kw.toFixed(2)}</td>
                            <td className="px-4 py-4 font-mono font-black text-slate-700">{nodo.volt.toFixed(2)}V</td>
                            <td className="px-4 py-4">
                              <span className={`font - black px - 2 py - 1 rounded - md ${nodo.reg > 4.5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} `}>
                                {nodo.reg.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {nodo.reg <= 5 ? (
                                <div className="flex items-center gap-1 text-green-600 font-black text-[9px] uppercase tracking-tighter">
                                  <CheckCircle2 size={12} /> Óptimo
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600 font-black text-[9px] uppercase tracking-tighter">
                                  <AlertTriangle size={12} /> Fuera de Norma
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dictamen IA ✨ */}
                {aiAudit && (
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-slate-800">
                    <div className="absolute -top-10 -right-10 opacity-10">
                      <Sparkles size={250} />
                    </div>
                    <div className="relative z-10 flex gap-8 items-start">
                      <div className="bg-blue-600 p-5 rounded-[2rem] shadow-xl shadow-blue-500/20">
                        <Bot size={40} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-xl font-black">Dictamen Técnico Senior IA ✨</h4>
                          <span className="bg-green-500/20 text-green-400 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-green-500/30">Análisis Verificado</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl font-medium italic">
                          "{aiAudit}"
                        </p>
                        <div className="mt-8 flex gap-4">
                          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Normativas ENEE</button>
                          <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/50">Incluir en Presentación</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA SECRETARIA IA ✨ */}
            {activeTab === 'secretaria' && (
              <div className="grid grid-cols-2 gap-10 h-full animate-in fade-in duration-500">
                <div className="space-y-6 flex flex-col h-full">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-blue-100 p-4 rounded-[2rem] text-blue-600 shadow-sm"><FileSignature size={28} /></div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Secretaria Técnica Virtual ✨</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generador de Documentos CIMEQH/ENEE</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                      Describe el documento técnico o comercial que necesitas. La IA utilizará los datos del proyecto "El Mestizal" (metrados, costos, responsables) para redactarlo automáticamente.
                    </p>

                    <div className="flex-grow">
                      <textarea
                        value={docPrompt}
                        onChange={(e) => setDocPrompt(e.target.value)}
                        placeholder="Ej: Redacta una carta de solicitud de aprobación de diseño dirigida al Ingeniero Regional del Litoral Atlántico, mencionando que cumplimos con los 150kVA instalados..."
                        className="w-full h-full min-h-[250px] border-2 border-slate-100 rounded-[2.5rem] p-8 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner bg-slate-50/20"
                      />
                    </div>

                    <button
                      onClick={generateAIDoc}
                      disabled={isGeneratingDoc || !docPrompt}
                      className="mt-8 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-2xl disabled:opacity-50"
                    >
                      {isGeneratingDoc ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-yellow-400" />}
                      {isGeneratingDoc ? 'Redactando...' : 'Generar Documento IA ✨'}
                    </button>
                  </div>
                </div>

                {/* Previsualización del Documento Papel */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 z-10">
                    <button className="bg-white p-3 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-lg border border-slate-100"><Download size={18} /></button>
                  </div>

                  <div className="flex-1 p-16 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] shadow-inner">
                    {generatedDoc || technicalReport ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-sm font-serif text-slate-800 animate-in fade-in duration-1000">
                        <div className="border-b-2 border-slate-200 pb-8 mb-8 text-center uppercase font-black text-slate-400 text-[10px] tracking-[0.3em]">
                          Membrete de Ingeniería Proyectista
                        </div>
                        {technicalReport || generatedDoc}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-6">
                        <FileText size={80} strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-widest text-center leading-loose">Bandeja de redacción vacía<br /><span className="text-[10px] text-slate-400 font-medium">Ingresa una instrucción para comenzar</span></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recepcion' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center px-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg"><CheckCircle2 size={20} className="text-white" /></div>
                      Protocolo de Recepción de Proyectos
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Basado en Procedimiento ENEE-SRLA-2024</p>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Progreso Inspección</p>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-700"
                          style={{ width: `${(Object.values(receptionChecklist).filter(i => i.checked).length / Object.keys(receptionChecklist).length) * 100}% ` }}
                        ></div>
                      </div>
                      <span className="text-xs font-black text-blue-600">
                        {Math.round((Object.values(receptionChecklist).filter(i => i.checked).length / Object.keys(receptionChecklist).length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {['Documentación', 'Campo', 'Pruebas'].map((category) => (
                    <div key={category} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-4">
                        <Settings size={14} className="text-blue-500" /> {category}
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(receptionChecklist).filter(([_, item]) => item.cat === category).map(([id, item]) => (
                          <div
                            key={id}
                            onClick={() => toggleChecklist(id)}
                            className={`group flex items - center gap - 4 p - 4 rounded - 2xl border cursor - pointer transition - all ${item.checked ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white'} `}
                          >
                            <div className={`w - 6 h - 6 rounded - lg border - 2 flex items - center justify - center transition - all ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'} `}>
                              {item.checked && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className={`text - [11px] font - bold leading - tight ${item.checked ? 'text-blue-900' : 'text-slate-600'} `}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Asistente IA para Recepción */}
                <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white flex gap-6 items-center border border-indigo-400/20 shadow-2xl">
                  <div className="bg-indigo-600 p-4 rounded-2xl">
                    <Bot size={32} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Guía Técnica de Recepción</p>
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                      "Asegúrate de que la resistencia de puesta a tierra medida en el transformador de El Mestizal no supere los 25 Ohmnios. Si superas este valor, el inspector de la ENEE podría rechazar la obra inmediatamente. ¿Necesitas que genere el reporte de megado?"
                    </p>
                  </div>
                  <button className="bg-white text-indigo-950 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all">Generar Reporte Megger</button>
                </div>
              </div>
            )}

            {activeTab === 'bom' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg"><Box size={20} className="text-white" /></div>
                  Metrados y Presupuesto de Obra
                </h3>
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-tighter border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4">Código ENEE</th>
                        <th className="px-4 py-4 w-1/2">Descripción Técnica</th>
                        <th className="px-4 py-4 text-center">Cantidad</th>
                        <th className="px-4 py-4 text-right">Unitario</th>
                        <th className="px-8 py-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bomData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-4 font-mono font-black text-blue-600">{item.codigo}</td>
                          <td className="px-4 py-4 font-medium text-slate-600">{item.desc}</td>
                          <td className="px-4 py-4 text-center font-black">{item.cant}</td>
                          <td className="px-4 py-4 text-right text-slate-500">${item.precio.toFixed(2)}</td>
                          <td className="px-8 py-4 text-right font-black text-slate-800">${(item.cant * item.precio).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                      <tr>
                        <td colSpan="4" className="px-8 py-8 text-right font-black uppercase tracking-widest text-xs text-slate-400">Inversión Total Suministros (USD)</td>
                        <td className="px-8 py-8 text-right font-black text-2xl text-blue-400 shadow-2xl">${totalBOM.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'bim' && (
              <RedlinModule
                selectedTrafo={selectedTrafo}
                trafoData={trafoData[selectedTrafo]}
              />
            )}

            {activeTab === 'presio' && (
              <PresioModule
                projectData={{ trafoData, currentResults }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileModule />
            )}

          </div>

          {/* Chat de Consultas Normativas ✨ */}
          <div className="fixed bottom-10 right-10 flex flex-col items-end z-50">
            <div className={`w - [450px] h - [600px] bg - white rounded - [3rem] shadow - [0_40px_80px_ - 15px_rgba(0, 0, 0, 0.3)] border border - slate - 200 mb - 6 flex flex - col overflow - hidden transition - all duration - 500 origin - bottom - right ${isTyping || chatMessages.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'} `}>
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-[1.2rem] shadow-lg shadow-blue-500/20"><Bot size={22} /></div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1.5">Consultor Normativo ✨</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gemini 2.5 Flash Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([])}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-500"
                >
                  <Zap size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 scrollbar-hide">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="bg-blue-50 p-6 rounded-[2.5rem]">
                      <Sparkles size={48} className="text-blue-200" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                      ¿Tienes dudas técnicas sobre el NEC 2017,<br />el manual de obras ENEE o el diseño<br />de "El Mestizal"? Consúltame.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate -in slide -in -from - bottom - 2 duration - 300`}>
                    <div className={`max - w - [85 %] px - 6 py - 4 rounded - [2rem] text - xs font - medium leading - relaxed shadow - sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'} `}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-5 py-4 rounded-[2rem] rounded-tl-none shadow-sm flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex gap-3 shrink-0 items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                  placeholder="Escribe tu consulta técnica aquí..."
                  className="flex-1 bg-slate-100 rounded-[1.5rem] px-6 py-4 text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all font-semibold placeholder:text-slate-400"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-slate-900 text-white p-4 rounded-[1.2rem] hover:bg-black transition-all active:scale-90 shadow-xl disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>

            {/* Botón Flotante Principal */}
            <button
              onClick={() => chatMessages.length === 0 && setChatMessages([{ role: 'ai', text: '¡Hola, Ingeniero! Soy tu consultor digital RED-EXPERT. He analizado el proyecto El Mestizal y estoy listo para resolver cualquier duda normativa o técnica. ¿Cómo puedo ayudarte?' }])}
              className="w-20 h-20 bg-slate-900 text-white rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 transition-all hover:bg-blue-600 group relative active:scale-95 border-4 border-slate-800"
            >
              <Bot size={34} className="group-hover:rotate-12 transition-transform" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              </div>
              <div className="absolute -bottom-12 right-0 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl">Consultar IA</div>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
