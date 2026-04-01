module.exports = [
"[project]/components/MapPicker.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
// Croatian cities with coordinates
const CROATIAN_CITIES = [
    {
        name: 'Zagreb',
        lat: 45.8150,
        lng: 15.9819
    },
    {
        name: 'Split',
        lat: 43.5081,
        lng: 16.4402
    },
    {
        name: 'Rijeka',
        lat: 45.3271,
        lng: 14.4422
    },
    {
        name: 'Osijek',
        lat: 45.5550,
        lng: 18.6955
    },
    {
        name: 'Zadar',
        lat: 44.1194,
        lng: 15.2314
    },
    {
        name: 'Pula',
        lat: 44.8666,
        lng: 13.8496
    },
    {
        name: 'Slavonski Brod',
        lat: 45.1603,
        lng: 18.0156
    },
    {
        name: 'Karlovac',
        lat: 45.4929,
        lng: 15.5553
    },
    {
        name: 'Varazdin',
        lat: 46.3057,
        lng: 16.3366
    },
    {
        name: 'Sibenik',
        lat: 43.7350,
        lng: 15.8952
    },
    {
        name: 'Dubrovnik',
        lat: 42.6507,
        lng: 18.0944
    },
    {
        name: 'Bjelovar',
        lat: 45.8986,
        lng: 16.8425
    },
    {
        name: 'Koprivnica',
        lat: 46.1628,
        lng: 16.8272
    },
    {
        name: 'Vukovar',
        lat: 45.3519,
        lng: 19.0025
    },
    {
        name: 'Vinkovci',
        lat: 45.2880,
        lng: 18.8050
    },
    {
        name: 'Sisak',
        lat: 45.4658,
        lng: 16.3781
    },
    {
        name: 'Pozega',
        lat: 45.3403,
        lng: 17.6850
    },
    {
        name: 'Cakovec',
        lat: 46.3842,
        lng: 16.4339
    },
    {
        name: 'Virovitica',
        lat: 45.8319,
        lng: 17.3839
    },
    {
        name: 'Makarska',
        lat: 43.2969,
        lng: 17.0175
    }
];
function MapPicker({ onLocationSelect, theme }) {
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [selectedCity, setSelectedCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [leafletLoaded, setLeafletLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const LRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load Leaflet dynamically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, []);
    // Initialize map after Leaflet loads
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
        const L = LRef.current;
        // Create map centered on Croatia
        const map = L.map(mapRef.current).setView([
            44.5,
            16.5
        ], 7);
        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);
        // Custom marker icon
        const customIcon = L.divIcon({
            html: `<div style="background: ${theme.accent}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
            className: 'custom-marker',
            iconSize: [
                24,
                24
            ],
            iconAnchor: [
                12,
                12
            ]
        });
        // Click handler for map
        map.on('click', async (e)=>{
            const { lat, lng } = e.latlng;
            // Remove existing marker
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
            }
            // Add new marker
            markerRef.current = L.marker([
                lat,
                lng
            ], {
                icon: customIcon
            }).addTo(map);
            // Reverse geocode
            setIsLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await res.json();
                let address = '';
                if (data.address) {
                    const parts = [];
                    if (data.address.road) parts.push(data.address.road);
                    if (data.address.house_number) parts.push(data.address.house_number);
                    if (data.address.city || data.address.town || data.address.village) {
                        parts.push(data.address.city || data.address.town || data.address.village);
                    }
                    address = parts.join(', ') || data.display_name;
                } else {
                    address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                }
                onLocationSelect(address, lat, lng);
            } catch  {
                onLocationSelect(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng);
            }
            setIsLoading(false);
        });
        mapInstanceRef.current = map;
        return ()=>{
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [
        leafletLoaded,
        theme.accent,
        onLocationSelect
    ]);
    // Fly to city when selected
    const handleCityChange = (cityName)=>{
        setSelectedCity(cityName);
        if (!cityName || !mapInstanceRef.current) return;
        const city = CROATIAN_CITIES.find((c)=>c.name === cityName);
        if (city) {
            mapInstanceRef.current.flyTo([
                city.lat,
                city.lng
            ], 13, {
                duration: 1.5
            });
        }
    };
    // Get current location
    const handleMyLocation = ()=>{
        if (!navigator.geolocation) {
            alert('Geolokacija nije podrzana u vasem pregledniku');
            return;
        }
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(async (position)=>{
            const { latitude: lat, longitude: lng } = position.coords;
            if (mapInstanceRef.current) {
                const L = LRef.current;
                // Fly to location
                mapInstanceRef.current.flyTo([
                    lat,
                    lng
                ], 16, {
                    duration: 1.5
                });
                // Remove existing marker
                if (markerRef.current) {
                    mapInstanceRef.current.removeLayer(markerRef.current);
                }
                // Add marker
                const customIcon = L.divIcon({
                    html: `<div style="background: ${theme.accent}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                    className: 'custom-marker',
                    iconSize: [
                        24,
                        24
                    ],
                    iconAnchor: [
                        12,
                        12
                    ]
                });
                markerRef.current = L.marker([
                    lat,
                    lng
                ], {
                    icon: customIcon
                }).addTo(mapInstanceRef.current);
                // Reverse geocode
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    let address = '';
                    if (data.address) {
                        const parts = [];
                        if (data.address.road) parts.push(data.address.road);
                        if (data.address.house_number) parts.push(data.address.house_number);
                        if (data.address.city || data.address.town || data.address.village) {
                            parts.push(data.address.city || data.address.town || data.address.village);
                        }
                        address = parts.join(', ') || data.display_name;
                    } else {
                        address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    }
                    onLocationSelect(address, lat, lng);
                } catch  {
                    onLocationSelect(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng);
                }
            }
            setIsLoading(false);
        }, ()=>{
            alert('Nije moguce dohvatiti vasu lokaciju');
            setIsLoading(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    };
    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        color: theme.text,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'relative',
            zIndex: 1,
            isolation: 'isolate'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 10
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedCity,
                        onChange: (e)=>handleCityChange(e.target.value),
                        style: {
                            ...inputStyle,
                            flex: 1,
                            cursor: 'pointer'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Odaberi grad..."
                            }, void 0, false, {
                                fileName: "[project]/components/MapPicker.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this),
                            CROATIAN_CITIES.map((city)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: city.name,
                                    children: city.name
                                }, city.name, false, {
                                    fileName: "[project]/components/MapPicker.tsx",
                                    lineNumber: 252,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapPicker.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleMyLocation,
                        disabled: isLoading,
                        style: {
                            padding: '12px 16px',
                            background: theme.accent,
                            border: 'none',
                            borderRadius: 10,
                            color: '#000',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            whiteSpace: 'nowrap',
                            opacity: isLoading ? 0.7 : 1
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "10"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "3"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 45
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "12",
                                        y1: "2",
                                        x2: "12",
                                        y2: "4"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 76
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "12",
                                        y1: "20",
                                        x2: "12",
                                        y2: "22"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 113
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "2",
                                        y1: "12",
                                        x2: "4",
                                        y2: "12"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 152
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "20",
                                        y1: "12",
                                        x2: "22",
                                        y2: "12"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapPicker.tsx",
                                        lineNumber: 277,
                                        columnNumber: 189
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapPicker.tsx",
                                lineNumber: 276,
                                columnNumber: 11
                            }, this),
                            "GPS"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapPicker.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapPicker.tsx",
                lineNumber: 244,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'relative',
                    width: '100%',
                    height: 220,
                    maxHeight: 220,
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    background: theme.bgCard,
                    overflow: 'hidden',
                    zIndex: 1
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: mapRef,
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }
                }, void 0, false, {
                    fileName: "[project]/components/MapPicker.tsx",
                    lineNumber: 295,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/MapPicker.tsx",
                lineNumber: 284,
                columnNumber: 7
            }, this),
            isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: 'center',
                    color: theme.textMuted,
                    fontSize: 13,
                    padding: '8px 0'
                },
                children: "Dohvacam adresu..."
            }, void 0, false, {
                fileName: "[project]/components/MapPicker.tsx",
                lineNumber: 309,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: 0,
                    fontSize: 12,
                    color: theme.textMuted,
                    textAlign: 'center'
                },
                children: "Klikni na mapu za postavljanje lokacije"
            }, void 0, false, {
                fileName: "[project]/components/MapPicker.tsx",
                lineNumber: 320,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-tile-pane { z-index: 1 !important; }
        .leaflet-overlay-pane { z-index: 2 !important; }
        .leaflet-shadow-pane { z-index: 3 !important; }
        .leaflet-marker-pane { z-index: 4 !important; }
        .leaflet-tooltip-pane { z-index: 5 !important; }
        .leaflet-popup-pane { z-index: 6 !important; }
        .leaflet-control { z-index: 7 !important; }
        .custom-marker { z-index: 4 !important; }
      `
            }, void 0, false, {
                fileName: "[project]/components/MapPicker.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MapPicker.tsx",
        lineNumber: 235,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_MapPicker_tsx_0-ogrft._.js.map