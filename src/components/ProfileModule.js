"use client";

import React, { useState, useEffect } from 'react';
import { User, Building2, BadgeCheck, MapPin, Save, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProfileModule() {
    const [profile, setProfile] = useState({
        name: '',
        company: '',
        license: '',
        address: '',
        logo: null,
        subscription_tier: 'free'
    });

    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);

                // 1. Try fetching from Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setProfile(data);
                } else {
                    // 2. Fallback to localStorage if not in DB yet
                    const savedProfile = localStorage.getItem('red_expert_profile');
                    if (savedProfile) {
                        setProfile(JSON.parse(savedProfile));
                    }
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...profile,
                updated_at: new Date().toISOString()
            });

        if (!error) {
            localStorage.setItem('red_expert_profile', JSON.stringify(profile));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setSaving(false);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10">
                        <User size={300} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-2">Perfil Profesional ✨</h3>
                        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">Identidad Institucional y Credenciales RED-EXPERT</p>
                    </div>
                </div>

                <div className="p-12 space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <User size={14} className="text-blue-500" /> Nombre Completo del Ingeniero
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="Ej: Ing. Lisandro Maradiaga"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <Building2 size={14} className="text-emerald-500" /> Empresa / Consultoría
                                </label>
                                <input
                                    type="text"
                                    value={profile.company}
                                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    placeholder="Ej: RED-EXPERT Engineering Group"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <BadgeCheck size={14} className="text-purple-500" /> Número de Colegiado (CIMEQH)
                                </label>
                                <input
                                    type="text"
                                    value={profile.license}
                                    onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                                    placeholder="Ej: 123456"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    <MapPin size={14} className="text-red-500" /> Dirección de Oficina
                                </label>
                                <input
                                    type="text"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="Ej: Olanchito, Yoro, Honduras"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100 flex items-center gap-10">
                        <div className="flex-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                <ImageIcon size={14} className="text-indigo-500" /> Logo Institucional
                            </label>
                            <div className="relative group cursor-pointer w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center overflow-hidden hover:border-blue-400 transition-all">
                                {profile.logo ? (
                                    <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="text-center p-6">
                                        <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dimensiones sugeridas: 512x512</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Nivel: {profile.subscription_tier || 'Free'}
                                </div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                                    <Sparkles size={14} /> Automatización de Branding
                                </h4>
                                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                                    Al guardar estos datos, el sistema inyectará automáticamente tu membrete, nombre y firma digital en todos los Reportes Técnicos, Memorias de Cálculo y Notas de Secretaria IA.
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : (saved ? <BadgeCheck className="text-green-400" /> : <Save size={18} />)}
                                {saving ? 'SINCRONIZANDO...' : (saved ? 'DATOS GUARDADOS CORRECTAMENTE' : 'GUARDAR EN LA NUBE')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
