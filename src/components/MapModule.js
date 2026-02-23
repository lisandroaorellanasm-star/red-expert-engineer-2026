"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap, MapPin, MousePointer2, PlusCircle, Link, Anchor, Download, Trash2, Cpu } from 'lucide-react';
import { useMapEvents } from 'react-leaflet';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const trafoIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

function MapEventsHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => onMapClick(e.latlng),
    });
    return null;
}

export default function MapModule({ selectedTrafo, trafoResults }) {
    // Coordenadas aproximadas para Olanchito, Yoro (El Mestizal)
    const [center, setCenter] = useState([15.4812, -86.5746]);
    const [draftingMode, setDraftingMode] = useState('pointer'); // pointer, pole, stay, line
    const [mapObjects, setMapObjects] = useState({
        poles: [],
        stays: [],
        lines: []
    });

    // Simulamos coordenadas para los postes basadas en el centro
    const nodes = trafoResults.map((nodo, i) => ({
        ...nodo,
        lat: center[0] + (i * 0.0002) - 0.0004,
        lng: center[1] + (i * 0.0003) - 0.0006
    }));

    const handleMapClick = (latlng) => {
        if (draftingMode === 'pole') {
            setMapObjects(prev => ({
                ...prev,
                poles: [...prev.poles, { id: `P-${prev.poles.length + 1}`, lat: latlng.lat, lng: latlng.lng, type: '35ft/300kg' }]
            }));
        } else if (draftingMode === 'stay') {
            // Lógica simplificada: poner una retenida en el click
            setMapObjects(prev => ({
                ...prev,
                stays: [...prev.stays, { id: `S-${prev.stays.length + 1}`, lat: latlng.lat, lng: latlng.lng }]
            }));
        }
    };

    const exportToAutoCAD = () => {
        let script = `; SCRIPT DE DISEÑO RED-EXPERT\n; Proyecto: El Mestizal\n_LAYER _M POLES _C 2  \n`;
        mapObjects.poles.forEach(p => {
            script += `_CIRCLE ${p.lng},${p.lat} 1.5\n_TEXT ${p.lng},${p.lat} 0.5 0 ${p.id}\n`;
        });

        script += `_LAYER _M STAYS _C 1 \n`;
        mapObjects.stays.forEach(s => {
            script += `_LINE ${s.lng},${s.lat} @2,2\n`; // Representación simple
        });

        const blob = new Blob([script], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Diseno_RedExpert.scr';
        link.click();
    };

    const polylinePositions = nodes.map(n => [n.lat, n.lng]);

    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl relative min-h-[550px]">
            <MapContainer
                center={center}
                zoom={18}
                style={{ height: '100%', width: '100%' }}
                className="z-10"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Usamos Esri Satellite para un look más "Ingeniería" si se desea, 
            pero por ahora OpenStreetMap es más fiable sin API keys. */}

                <MapRecenter center={center} />
                <MapEventsHandler onMapClick={handleMapClick} />

                {nodes.map((nodo, i) => (
                    <Marker
                        key={nodo.id}
                        position={[nodo.lat, nodo.lng]}
                        icon={i === 0 ? trafoIcon : customIcon}
                    >
                        <Popup>
                            <div className="p-2">
                                <p className="font-bold text-slate-800">Poste N-{nodo.id}</p>
                                <p className="text-xs text-slate-500">Voltaje: {nodo.volt.toFixed(2)}V</p>
                                <p className={`text-xs font-bold ${nodo.reg > 4 ? 'text-orange-600' : 'text-green-600'}`}>
                                    Regulación: {nodo.reg.toFixed(2)}%
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Objetos dibujados */}
                {mapObjects.poles.map((p, i) => (
                    <Marker key={i} position={[p.lat, p.lng]} icon={customIcon}>
                        <Popup>Diseño: {p.id}</Popup>
                    </Marker>
                ))}

                {mapObjects.stays.map((s, i) => (
                    <Marker key={i} position={[s.lat, s.lng]} icon={customIcon}>
                        <Popup>Retenida</Popup>
                    </Marker>
                ))}

                <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10, 10' }}
                />
            </MapContainer>

            {/* Herramientas de Dibujo CAD */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-2">
                    <button
                        onClick={() => setDraftingMode('pointer')}
                        className={`p-3 rounded-xl transition-all ${draftingMode === 'pointer' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <MousePointer2 size={20} />
                    </button>
                    <button
                        onClick={() => setDraftingMode('pole')}
                        className={`p-3 rounded-xl transition-all ${draftingMode === 'pole' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <PlusCircle size={20} />
                    </button>
                    <button
                        onClick={() => setDraftingMode('stay')}
                        className={`p-3 rounded-xl transition-all ${draftingMode === 'stay' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Anchor size={20} />
                    </button>
                    <div className="h-px bg-slate-200 mx-2 my-1" />
                    <button
                        onClick={() => setMapObjects({ poles: [], stays: [], lines: [] })}
                        className="p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <button
                    onClick={exportToAutoCAD}
                    className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group"
                >
                    <Download size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">Exportar .SCR</span>
                </button>
            </div>

            {/* Overlay de información premium */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg max-w-[200px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado de Red</p>
                <div className="flex items-center gap-2 mb-1">
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">Calculado bajo Rv-2002 con {trafoResults.length} nodos activos.</p>
            </div>
        </div>
    );
}
