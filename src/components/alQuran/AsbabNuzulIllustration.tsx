import React from 'react';

interface AsbabNuzulIllustrationProps {
  theme?: string;
  className?: string;
  compact?: boolean;
}

export const AsbabNuzulIllustration: React.FC<AsbabNuzulIllustrationProps> = ({
  theme = 'kaabah_ababil',
  className = '',
  compact = false,
}) => {
  const height = compact ? 120 : 180;

  switch (theme) {
    case 'kaabah_ababil':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Stars */}
            <circle cx="40" cy="30" r="1.5" fill="#FFE066" opacity="0.8" />
            <circle cx="120" cy="25" r="2" fill="#FFE066" opacity="0.9" />
            <circle cx="280" cy="40" r="1.5" fill="#FFF" opacity="0.8" />
            <circle cx="350" cy="30" r="2" fill="#FFE066" opacity="0.9" />
            <circle cx="200" cy="20" r="2.5" fill="#FFF" opacity="0.9" />
            {/* Moon Crescent */}
            <path d="M 50,45 A 18,18 0 0 0 68,27 A 14,14 0 1 1 50,45 Z" fill="#FFD700" />
            {/* Desert Dunes */}
            <path d="M0,170 Q100,140 200,165 T400,160 L400,200 L0,200 Z" fill="#8C531B" />
            <path d="M0,180 Q150,160 300,185 T400,180 L400,200 L0,200 Z" fill="#6B3E14" />
            {/* Ka'bah Sanctuary */}
            <rect x="160" y="105" width="80" height="75" rx="4" fill="#1C1C1E" stroke="#2C2C2E" strokeWidth="2" />
            {/* Golden Kiswah Belt */}
            <rect x="160" y="125" width="80" height="10" fill="#FFD700" />
            <rect x="160" y="128" width="80" height="4" fill="#FFA500" />
            {/* Ka'bah Door */}
            <rect x="205" y="145" width="16" height="35" rx="2" fill="#DAA520" stroke="#FFD700" strokeWidth="1" />
            {/* Flying Ababil Birds */}
            <g transform="translate(90, 50) scale(0.7)">
              <path d="M0,10 Q15,-10 30,5 Q45,-10 60,10 Q35,5 30,15 Q25,5 0,10 Z" fill="#FF9F43" />
              <circle cx="30" cy="18" r="3" fill="#FF5252" />
            </g>
            <g transform="translate(260, 60) scale(0.8)">
              <path d="M0,10 Q15,-10 30,5 Q45,-10 60,10 Q35,5 30,15 Q25,5 0,10 Z" fill="#FF9F43" />
              <circle cx="30" cy="18" r="3.5" fill="#FF5252" />
            </g>
            <g transform="translate(180, 40) scale(0.9)">
              <path d="M0,10 Q15,-10 30,5 Q45,-10 60,10 Q35,5 30,15 Q25,5 0,10 Z" fill="#EE5253" />
              <circle cx="30" cy="18" r="4" fill="#FF7675" />
            </g>
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Ka'bah & Ababil
          </span>
        </div>
      );

    case 'caravan_quraysh':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#FF7E5F] via-[#FEB47B] to-[#FFECCC] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Giant Warm Sun */}
            <circle cx="310" cy="70" r="45" fill="#FFEAA7" opacity="0.8" />
            <circle cx="310" cy="70" r="35" fill="#FDCB6E" />
            {/* Rolling Dunes */}
            <path d="M0,150 Q130,110 260,145 T400,135 L400,200 L0,200 Z" fill="#E17055" />
            <path d="M0,170 Q180,140 320,170 T400,165 L400,200 L0,200 Z" fill="#D63031" />
            {/* Camels Caravan */}
            <g transform="translate(90, 115) scale(0.65)">
              <ellipse cx="40" cy="35" rx="20" ry="14" fill="#6C5CE7" />
              <ellipse cx="30" cy="15" rx="9" ry="16" fill="#6C5CE7" />
              <ellipse cx="50" cy="15" rx="9" ry="16" fill="#6C5CE7" />
              <path d="M22,35 Q10,25 15,8 Q18,3 24,6 Q20,20 28,35 Z" fill="#6C5CE7" />
              <circle cx="16" cy="6" r="6" fill="#6C5CE7" />
              <rect x="25" y="45" width="5" height="30" rx="2" fill="#6C5CE7" />
              <rect x="36" y="45" width="5" height="30" rx="2" fill="#6C5CE7" />
              <rect x="47" y="45" width="5" height="30" rx="2" fill="#6C5CE7" />
              <rect x="58" y="45" width="5" height="30" rx="2" fill="#6C5CE7" />
              {/* Goods Bundle */}
              <circle cx="40" cy="18" r="11" fill="#FEEAA7" />
            </g>
            <g transform="translate(170, 120) scale(0.55)">
              <ellipse cx="40" cy="35" rx="20" ry="14" fill="#2D3436" />
              <ellipse cx="30" cy="15" rx="9" ry="16" fill="#2D3436" />
              <ellipse cx="50" cy="15" rx="9" ry="16" fill="#2D3436" />
              <path d="M22,35 Q10,25 15,8 Q18,3 24,6 Q20,20 28,35 Z" fill="#2D3436" />
              <circle cx="16" cy="6" r="6" fill="#2D3436" />
              <rect x="25" y="45" width="5" height="30" rx="2" fill="#2D3436" />
              <rect x="36" y="45" width="5" height="30" rx="2" fill="#2D3436" />
              <rect x="47" y="45" width="5" height="30" rx="2" fill="#2D3436" />
              <rect x="58" y="45" width="5" height="30" rx="2" fill="#2D3436" />
            </g>
            {/* Caravan Connection Line */}
            <path d="M140,140 Q160,150 180,142" stroke="#FFF" strokeWidth="2" strokeDasharray="3,3" fill="none" />
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-amber-950 bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Kafilah Dagang Quraisy
          </span>
        </div>
      );

    case 'hira_cave':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0B0C10] via-[#1F2833] to-[#45A29E] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Radiant Night Sky */}
            <circle cx="200" cy="80" r="70" fill="#66FCF1" opacity="0.15" />
            <circle cx="200" cy="80" r="45" fill="#45A29E" opacity="0.3" />
            {/* Jabal Nur Mountain Silhouette */}
            <polygon points="40,200 160,70 230,95 340,200" fill="#1A1A24" />
            <polygon points="120,200 190,85 240,110 300,200" fill="#12131A" />
            {/* Cave Entrance Glowing */}
            <ellipse cx="195" cy="115" rx="18" ry="22" fill="#050508" />
            {/* Divine Light Rays coming out of Hira */}
            <polygon points="195,115 130,0 260,0" fill="url(#hiraGlow)" opacity="0.4" />
            <circle cx="195" cy="112" r="8" fill="#FFF" opacity="0.9" />
            {/* Stars */}
            <circle cx="80" cy="40" r="2" fill="#FFF" />
            <circle cx="320" cy="35" r="2.5" fill="#66FCF1" />
            <circle cx="140" cy="30" r="1.5" fill="#FFF" />
            <circle cx="260" cy="25" r="2" fill="#FFF" />
            <defs>
              <linearGradient id="hiraGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#66FCF1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#66FCF1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-cyan-300 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Gua Hira & Wahyu Pertama
          </span>
        </div>
      );

    case 'kautsar_river':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#11998E] via-[#38EF7D] to-[#0575E6] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Heavenly Sky */}
            <rect x="0" y="0" width="400" height="200" fill="url(#heavenSky)" />
            {/* Crystal River Waves */}
            <path d="M0,130 C120,110 160,170 400,120 L400,200 L0,200 Z" fill="#00CEC9" opacity="0.6" />
            <path d="M0,150 C150,130 220,180 400,145 L400,200 L0,200 Z" fill="#74B9FF" opacity="0.7" />
            <path d="M0,170 C100,160 250,190 400,165 L400,200 L0,200 Z" fill="#0984E3" />
            {/* Pearl Banks */}
            <circle cx="60" cy="140" r="7" fill="#FFF" stroke="#DFE6E9" strokeWidth="1" />
            <circle cx="80" cy="145" r="5" fill="#FFF" />
            <circle cx="340" cy="130" r="8" fill="#FFF" stroke="#DFE6E9" strokeWidth="1" />
            <circle cx="320" cy="135" r="6" fill="#FFF" />
            {/* Golden Goblets of Kautsar */}
            <g transform="translate(180, 100) scale(0.8)">
              <ellipse cx="25" cy="10" rx="16" ry="6" fill="#FFD700" />
              <path d="M9,10 Q12,35 25,38 Q38,35 41,10 Z" fill="#FFA500" stroke="#FFD700" strokeWidth="1.5" />
              <rect x="22" y="38" width="6" height="20" fill="#FFD700" />
              <ellipse cx="25" cy="58" rx="14" ry="4" fill="#FFD700" />
            </g>
            <defs>
              <linearGradient id="heavenSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8EDEA" />
                <stop offset="100%" stopColor="#FED6E3" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-teal-950 bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Telaga Suci Al-Kautsar
          </span>
        </div>
      );

    case 'qadr_night':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2B1055] via-[#7597DE] to-[#B3C5E7] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Glowing Full Moon / Crescent */}
            <circle cx="200" cy="65" r="40" fill="#FFFDE4" opacity="0.9" />
            <circle cx="200" cy="65" r="55" fill="#FFFDE4" opacity="0.2" />
            {/* Mosque Minarets Silhouette */}
            <path d="M80,200 L80,120 L95,120 L95,200 Z" fill="#1A0836" />
            <path d="M87,105 L80,120 L95,120 Z" fill="#1A0836" />
            <path d="M310,200 L310,110 L325,110 L325,200 Z" fill="#1A0836" />
            <path d="M317,95 L310,110 L325,110 Z" fill="#1A0836" />
            {/* Dome */}
            <ellipse cx="200" cy="180" rx="70" ry="45" fill="#200C40" />
            {/* Shooting Star Angelic Ray */}
            <line x1="60" y1="20" x2="150" y2="70" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <line x1="280" y1="15" x2="360" y2="55" stroke="#FFEAA7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-purple-200 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Malam Lailatul Qadr
          </span>
        </div>
      );

    case 'muawwidzatain_shield':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#141E30] via-[#243B55] to-[#204969] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Twin Glowing Shields */}
            <g transform="translate(130, 40) scale(0.85)">
              {/* Al-Falaq Dawn Shield */}
              <path d="M30,10 Q60,10 70,30 Q70,80 30,110 Q-10,80 -10,30 Q0,10 30,10 Z" fill="url(#dawnShield)" stroke="#FFD700" strokeWidth="3" />
              <text x="30" y="65" textAnchor="middle" fill="#FFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">FALAQ</text>
              <circle cx="30" cy="35" r="8" fill="#FFD700" />
            </g>
            <g transform="translate(230, 40) scale(0.85)">
              {/* An-Nas Dusk Shield */}
              <path d="M30,10 Q60,10 70,30 Q70,80 30,110 Q-10,80 -10,30 Q0,10 30,10 Z" fill="url(#duskShield)" stroke="#00CEC9" strokeWidth="3" />
              <text x="30" y="65" textAnchor="middle" fill="#FFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">NAAS</text>
              <circle cx="30" cy="35" r="8" fill="#00CEC9" />
            </g>
            {/* Dispersed dark smoke */}
            <circle cx="60" cy="90" r="25" fill="#000" opacity="0.3" filter="blur(4px)" />
            <circle cx="340" cy="110" r="30" fill="#000" opacity="0.3" filter="blur(4px)" />
            <defs>
              <linearGradient id="dawnShield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA07A" />
                <stop offset="100%" stopColor="#C70039" />
              </linearGradient>
              <linearGradient id="duskShield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#17A2B8" />
                <stop offset="100%" stopColor="#0B3C5D" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-cyan-200 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Dua Perisai Pelindung
          </span>
        </div>
      );

    case 'duha_sun':
    case 'insyirah_chest':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#F6D365] via-[#FDA085] to-[#FF8C66] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Radiating Morning Sun */}
            <circle cx="200" cy="110" r="55" fill="#FFEAA7" />
            <circle cx="200" cy="110" r="45" fill="#FFC048" />
            {/* Sun Rays */}
            <g stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.7">
              <line x1="200" y1="40" x2="200" y2="20" />
              <line x1="250" y1="60" x2="265" y2="45" />
              <line x1="270" y1="110" x2="290" y2="110" />
              <line x1="150" y1="60" x2="135" y2="45" />
              <line x1="130" y1="110" x2="110" y2="110" />
            </g>
            {/* Sprouting Green Olive/Fig Leaf */}
            <path d="M170,170 Q190,140 200,120 Q210,140 230,170 Q200,180 170,170 Z" fill="#2ECC71" stroke="#27AE60" strokeWidth="2" />
            <path d="M200,120 L200,180" stroke="#27AE60" strokeWidth="2" />
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-amber-950 bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Terbitnya Fajar Dhuha
          </span>
        </div>
      );

    default:
      // Generic beautiful Islamic Geometric Sky Scene
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1E3C72] via-[#2A5298] to-[#6DD5ED] flex items-center justify-center ${className}`} style={{ height }}>
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            {/* Sun/Moon */}
            <circle cx="200" cy="70" r="40" fill="#FFF9D2" opacity="0.9" />
            <circle cx="200" cy="70" r="55" fill="#FFF9D2" opacity="0.2" />
            {/* Decorative Islamic Dome */}
            <ellipse cx="200" cy="180" rx="80" ry="50" fill="#14213D" />
            <rect x="195" y="105" width="10" height="25" fill="#FFD700" />
            <circle cx="200" cy="100" r="6" fill="#FFD700" />
            {/* Stars */}
            <circle cx="60" cy="50" r="2" fill="#FFF" />
            <circle cx="340" cy="45" r="2" fill="#FFF" />
            <circle cx="100" cy="80" r="1.5" fill="#FFF" />
            <circle cx="300" cy="85" r="1.5" fill="#FFF" />
          </svg>
          <span className="absolute bottom-2 right-3 text-[10px] font-black text-blue-100 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ilustrasi: Kisah Al-Qur'an Mulia
          </span>
        </div>
      );
  }
};
