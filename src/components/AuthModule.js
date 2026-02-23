"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Zap, Mail, Lock, LogIn, UserPlus, Github, Chrome, AlertCircle, Loader2, CheckCircle2, Link as LinkIcon
} from 'lucide-react';

export default function AuthModule({ onAuthSuccess }) {
    const [mode, setMode] = useState('login'); // login, signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLoading, setMagicLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [msg, setMsg] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg('');

        const { data, error: authError } = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (authError) {
            setError(authError.message);
        } else {
            if (mode === 'signup') {
                setSuccess(true);
                setMsg('Verifica tu correo electrónico para confirmar tu cuenta y poder iniciar sesión.');
            } else {
                onAuthSuccess && onAuthSuccess(data.user);
            }
        }
        setLoading(false);
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError('Ingresa tu correo para recibir el enlace mágico.');
            return;
        }
        setMagicLoading(true);
        setError(null);
        setMsg('');

        const { error: magicError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (magicError) {
            setError(magicError.message);
        } else {
            setMsg('¡Enlace enviado! Revisa tu bandeja de entrada para entrar sin contraseña.');
        }
        setMagicLoading(false);
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-sans">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">

                    <div className="text-center mb-8">
                        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                            <Zap className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">RED-EXPERT 2026</h1>
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Ingeniería eSolutions Honduras</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-xs font-bold items-center animate-shake">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-4 py-8">
                            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-white font-black text-lg">¡Registro Exitoso!</h3>
                            <p className="text-slate-400 text-sm">Verifica tu correo electrónico para confirmar tu cuenta y poder iniciar sesión.</p>
                            <button
                                onClick={() => { setSuccess(false); setMode('login'); }}
                                className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                            >
                                Volver al Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Correo Institucional</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ingeniero@red-expert.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Contraseña de Seguridad</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />)}
                                {mode === 'login' ? 'Iniciar Sesión Premium' : 'Crear Cuenta de Ingeniero'}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                                    <span className="bg-[#0f172a] px-4 text-slate-600">Otras formas de acceso</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={signInWithGoogle}
                                    className="bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Chrome size={16} className="text-red-500" />
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    disabled={magicLoading}
                                    className="bg-blue-600/20 text-blue-400 border border-blue-500/20 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {magicLoading ? <Loader2 className="animate-spin" size={16} /> : <LinkIcon size={16} />}
                                    Magic Link
                                </button>
                            </div>

                            {msg && (
                                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3 text-emerald-400 text-xs font-bold items-center">
                                    <CheckCircle2 size={16} />
                                    {msg}
                                </div>
                            )}

                            <div className="text-center mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg(''); setError(null); }}
                                    className="text-xs text-slate-500 font-bold hover:text-white transition-colors"
                                >
                                    {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
                        © 2026 E-SOLUTIONS DISTRIBUCIÓN
                    </div>
                </div>
            </div>
        </div>
    );
}
