import React from 'react';
import { motion } from 'framer-motion';
import { CompanionSpecies, CompanionStage, PetMood } from '../../types/companion';

export type LumiPose =
  | 'egg'
  | 'baby'
  | 'explorer'
  | 'guardian'
  | 'happy'
  | 'curious'
  | 'proud_quran'
  | 'calm';

interface CompanionSpriteProps {
  species?: CompanionSpecies;
  stage?: CompanionStage;
  mood?: PetMood | 'curious' | 'proud_quran' | 'calm';
  isFeeding?: boolean;
  size?: number;
  className?: string;
  forcePose?: LumiPose;
}

export const CompanionSprite: React.FC<CompanionSpriteProps> = ({
  species = 'lumi',
  stage = 'explorer',
  mood = 'content',
  isFeeding = false,
  size = 120,
  className = '',
  forcePose,
}) => {
  // Determine pose for Lumi (the signature 3D companion from user attachments 01-08)
  let activePose: LumiPose = 'explorer';

  if (forcePose) {
    activePose = forcePose;
  } else if (stage === 'egg') {
    activePose = 'egg';
  } else if (mood === 'celebrating' || isFeeding) {
    activePose = 'happy';
  } else if (mood === 'thoughtful' || mood === 'curious') {
    activePose = 'curious';
  } else if (mood === 'proud' || mood === 'proud_quran') {
    activePose = 'proud_quran';
  } else if (mood === 'sleeping' || mood === 'calm') {
    activePose = 'calm';
  } else if (stage === 'hatchling') {
    activePose = 'baby';
  } else if (stage === 'guardian' || stage === 'master') {
    activePose = 'guardian';
  } else {
    // Stage little or explorer
    activePose = 'explorer';
  }

  // --- RENDER FOR LUMI & EGG (Faithful 3D reproduction of attachments 01 to 08) ---
  if (species === 'lumi' || stage === 'egg' || forcePose) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center select-none ${className}`}
      >
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full filter drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* 3D Porcelain Clay / White Fur Gradient */}
            <radialGradient id="porcelain3D" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FAF7F2" />
              <stop offset="75%" stopColor="#F1E7DD" />
              <stop offset="92%" stopColor="#E2D1C1" />
              <stop offset="100%" stopColor="#D0B8A3" />
            </radialGradient>

            {/* Specular Highlight for glossy 3D clay look */}
            <radialGradient id="porcelainHighlight" cx="30%" cy="25%" r="45%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* Ambient Occlusion Shadow */}
            <linearGradient id="bodyShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F2E6DA" />
              <stop offset="100%" stopColor="#CDB5A0" />
            </linearGradient>

            {/* Signature Crest Plumes (3D Vibrant Cyan-Teal Gradient) */}
            <linearGradient id="crestCyanGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="25%" stopColor="#22D3EE" />
              <stop offset="65%" stopColor="#08B9EF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Crest Plume Specular Highlight */}
            <linearGradient id="crestSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08B9EF" stopOpacity="0" />
            </linearGradient>

            {/* Inner Ear Golden Ambient Glow */}
            <radialGradient id="earGoldGlow" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FEF08A" />
              <stop offset="75%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>

            {/* 3D Beveled Golden Star */}
            <linearGradient id="goldStar3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="35%" stopColor="#FFD54F" />
              <stop offset="70%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>

            {/* 3D Glossy Anime Eyes */}
            <radialGradient id="eyeIrisGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#3B261D" />
              <stop offset="55%" stopColor="#1E140F" />
              <stop offset="100%" stopColor="#0F0A07" />
            </radialGradient>

            {/* Turquoise Silk Scarf */}
            <linearGradient id="clothTeal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="35%" stopColor="#14B8A6" />
              <stop offset="75%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>

            {/* Adventurer Leather Bag */}
            <linearGradient id="leatherBag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="50%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>

            {/* Holy Quran Emerald Cover */}
            <linearGradient id="quranEmeraldCover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="30%" stopColor="#059669" />
              <stop offset="75%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>

            {/* Floating 3D Purple Question Mark */}
            <linearGradient id="purpleGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="30%" stopColor="#C084FC" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#5B21B6" />
            </linearGradient>

            {/* Soft Rosy Blush Cheeks */}
            <radialGradient id="cheekBlushRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#FDA4AF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
            </radialGradient>

            {/* Grass Turf Base */}
            <linearGradient id="grassTurf" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#84CC16" />
              <stop offset="60%" stopColor="#65A30D" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>

            {/* Clover Fresh Green Leaf */}
            <linearGradient id="leafFresh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BEF264" />
              <stop offset="50%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#4D7C0F" />
            </linearGradient>
          </defs>

          {/* ========================================================================= */}
          {/* POSE 1: 01_egg_companion.png (Telur Cahaya Berbintang & Semanggi)           */}
          {/* ========================================================================= */}
          {activePose === 'egg' && (
            <g>
              {/* Meadow grass base */}
              <ellipse cx="120" cy="204" rx="88" ry="20" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="206" rx="74" ry="14" fill="#365314" opacity="0.4" />

              {/* Little clovers on the ground */}
              <path d="M48 196 C36 180 46 168 60 186 Z" fill="url(#leafFresh)" />
              <path d="M64 200 C52 182 68 170 80 192 Z" fill="#65A30D" />
              <circle cx="78" cy="204" r="10" fill="#84CC16" />
              <circle cx="162" cy="203" r="11" fill="#84CC16" />
              <path d="M176 198 C190 182 180 170 166 188 Z" fill="url(#leafFresh)" />
              <path d="M187 192 C204 178 192 164 178 182 Z" fill="#65A30D" />

              {/* Egg Shadow */}
              <ellipse cx="120" cy="198" rx="58" ry="18" fill="#1C3806" opacity="0.35" />

              {/* Main 3D Porcelain Egg Body */}
              <path
                d="M120 40 C75 40 60 110 60 156 C60 188 86 200 120 200 C154 200 180 188 180 156 C180 110 165 40 120 40 Z"
                fill="url(#porcelain3D)"
                stroke="#E2D1C1"
                strokeWidth="1.5"
                filter="drop-shadow(0px 8px 18px rgba(0,0,0,0.15))"
              />
              {/* Egg Gloss Highlight */}
              <ellipse cx="102" cy="85" rx="28" ry="40" fill="url(#porcelainHighlight)" transform="rotate(-15 102 85)" />

              {/* Fresh Clover Sprout emerging on Egg shoulder */}
              <path d="M64 125 C48 110 44 92 56 90 C66 98 64 116 64 125 Z" fill="url(#leafFresh)" />
              <path d="M68 122 C56 102 62 84 74 90 C78 102 70 118 68 122 Z" fill="#84CC16" />
              <path d="M174 120 C190 105 194 88 182 86 C172 94 174 112 174 120 Z" fill="url(#leafFresh)" />

              {/* Golden Filigree Arabesque Patterns on Egg */}
              <path
                d="M85 145 C95 130 145 130 155 145"
                stroke="url(#goldStar3D)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M92 155 C102 142 138 142 148 155"
                stroke="url(#goldStar3D)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="120" cy="148" r="3.5" fill="#FBBF24" />

              {/* Signature 3D Golden Star on Front of Egg */}
              <g transform="translate(120, 116) scale(1.3)" filter="drop-shadow(0px 3px 6px rgba(180,83,9,0.5))">
                <polygon
                  points="0,-22 6,-7 22,-4 10,7 13,22 0,14 -13,22 -10,7 -22,-4 -6,-7"
                  fill="url(#goldStar3D)"
                  stroke="#B45309"
                  strokeWidth="1.2"
                />
                <circle cx="-3" cy="-6" r="3" fill="#FFFFFF" opacity="0.8" />
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 2: 02_baby_companion.png (Bayi Lumi Duduk Manis di Rumput)            */}
          {/* ========================================================================= */}
          {activePose === 'baby' && (
            <g>
              {/* Meadow grass base */}
              <ellipse cx="120" cy="204" rx="84" ry="18" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="205" rx="68" ry="12" fill="#365314" opacity="0.35" />

              {/* Tail with cyan tip */}
              <path d="M58 168 C40 162 34 182 46 192 C58 196 66 182 70 174 Z" fill="url(#crestCyanGrad)" />

              {/* Chubby Sitting Pear Body */}
              <ellipse cx="120" cy="160" rx="56" ry="46" fill="url(#porcelain3D)" />
              <ellipse cx="120" cy="160" rx="56" ry="46" fill="url(#bodyShadow)" opacity="0.25" />

              {/* Baby Sitting Feet with cyan pads */}
              <ellipse cx="88" cy="192" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="88" cy="193" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="152" cy="192" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="152" cy="193" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />

              {/* Cute little front paws resting on tummy */}
              <ellipse cx="104" cy="162" rx="10" ry="8" fill="url(#porcelain3D)" />
              <ellipse cx="136" cy="162" rx="10" ry="8" fill="url(#porcelain3D)" />

              {/* Chubby Head */}
              <ellipse cx="120" cy="98" rx="55" ry="48" fill="url(#porcelain3D)" />
              <ellipse cx="108" cy="85" rx="25" ry="16" fill="url(#porcelainHighlight)" />

              {/* Rosy Pink Blushing Cheeks */}
              <circle cx="80" cy="112" r="15" fill="url(#cheekBlushRadial)" />
              <circle cx="160" cy="112" r="15" fill="url(#cheekBlushRadial)" />

              {/* Drooping Ears with Golden Inner Glow & Cyan Tips */}
              <g>
                <path d="M72 74 C34 70 18 100 48 122 C66 132 78 102 72 74 Z" fill="url(#porcelain3D)" />
                <path d="M68 80 C44 76 32 100 54 116 C66 122 72 102 68 80 Z" fill="url(#earGoldGlow)" />
                <path d="M48 76 C32 74 20 92 42 106 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M168 74 C206 70 222 100 192 122 C174 132 162 102 168 74 Z" fill="url(#porcelain3D)" />
                <path d="M172 80 C196 76 208 100 186 116 C174 122 168 102 172 80 Z" fill="url(#earGoldGlow)" />
                <path d="M192 76 C208 74 220 92 198 106 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Crest Horns (Upward Cyan Plumes) */}
              <path
                d="M102 55 C96 30 112 16 120 18 C128 16 144 30 138 55 C152 40 164 50 152 65 C142 72 130 62 120 65 C110 62 98 72 88 65 C76 50 88 40 102 55 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Fluffy Forehead Cloud Tuft */}
              <ellipse cx="120" cy="74" rx="14" ry="10" fill="url(#porcelain3D)" />
              <circle cx="120" cy="70" r="6" fill="#FFFFFF" />

              {/* FACIAL FEATURES: Sweet Curved Closed Happy Eyes (^ ^) */}
              <path
                d="M90 98 Q100 88 110 98"
                stroke="#1E140F"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M130 98 Q140 88 150 98"
                stroke="#1E140F"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Tiny Cute Soft Button Nose */}
              <path d="M117 106 Q120 104 123 106 Q120 109 117 106 Z" fill="#FB7185" />

              {/* Sweet Kawaii Smile */}
              <path
                d="M114 111 Q120 116 126 111"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 3: 03_explorer_companion.png (Lumi Penjelajah dengan Tas & Syal)       */}
          {/* ========================================================================= */}
          {activePose === 'explorer' && (
            <g>
              {/* Meadow base */}
              <ellipse cx="120" cy="206" rx="84" ry="18" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="208" rx="68" ry="12" fill="#365314" opacity="0.35" />

              {/* Tail */}
              <path d="M54 158 C38 152 30 174 42 184 C54 190 62 176 68 166 Z" fill="url(#crestCyanGrad)" />

              {/* Standing Pear Body */}
              <path
                d="M86 122 C74 150 72 180 90 194 C104 200 136 200 150 194 C168 180 166 150 154 122 Z"
                fill="url(#porcelain3D)"
              />
              <path
                d="M86 122 C74 150 72 180 90 194 C104 200 136 200 150 194 C168 180 166 150 154 122 Z"
                fill="url(#bodyShadow)"
                opacity="0.2"
              />

              {/* Feet with Cyan Toe Pads */}
              <ellipse cx="94" cy="198" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="94" cy="199" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="146" cy="196" rx="17" ry="12" fill="url(#porcelain3D)" />
              <ellipse cx="146" cy="197" rx="11" ry="7" fill="#08B9EF" opacity="0.9" />

              {/* Crossbody Leather Strap & Satchel Bag */}
              <path
                d="M86 130 L152 176"
                stroke="url(#leatherBag)"
                strokeWidth="7"
                strokeLinecap="round"
                filter="drop-shadow(0px 2px 4px rgba(69,26,3,0.35))"
              />
              {/* Satchel Bag Body */}
              <g transform="translate(68, 142) rotate(-14)">
                <rect x="0" y="0" width="30" height="28" rx="8" fill="url(#leatherBag)" stroke="#451A03" strokeWidth="1.5" />
                <path d="M0 0 L30 0 L24 16 L6 16 Z" fill="#92400E" opacity="0.8" />
                <circle cx="15" cy="16" r="3.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1" />
              </g>

              {/* Paws standing happily */}
              <ellipse cx="80" cy="146" rx="9" ry="11" fill="url(#porcelain3D)" transform="rotate(20 80 146)" />
              <ellipse cx="160" cy="146" rx="9" ry="11" fill="url(#porcelain3D)" transform="rotate(-20 160 146)" />

              {/* Turquoise Scarf around Neck */}
              <path
                d="M82 122 Q120 142 158 122 Q150 146 120 148 Q90 146 82 122 Z"
                fill="url(#clothTeal)"
                stroke="#0F766E"
                strokeWidth="1.5"
                filter="drop-shadow(0px 3px 5px rgba(15,118,110,0.35))"
              />

              {/* Golden 8-Pointed Star Brooch at Scarf Neck */}
              <g transform="translate(120, 136) scale(0.95)" filter="drop-shadow(0px 2px 4px rgba(180,83,9,0.5))">
                <polygon
                  points="0,-16 4,-5 16,-3 7,5 9,16 0,10 -9,16 -7,5 -16,-3 -4,-5"
                  fill="url(#goldStar3D)"
                  stroke="#92400E"
                  strokeWidth="1"
                />
                <circle cx="-2" cy="-4" r="2.5" fill="#FFFFFF" opacity="0.8" />
              </g>

              {/* Head */}
              <ellipse cx="120" cy="92" rx="55" ry="46" fill="url(#porcelain3D)" />
              <ellipse cx="106" cy="80" rx="24" ry="14" fill="url(#porcelainHighlight)" />

              {/* Rosy Cheeks */}
              <circle cx="80" cy="106" r="14" fill="url(#cheekBlushRadial)" />
              <circle cx="160" cy="106" r="14" fill="url(#cheekBlushRadial)" />

              {/* Ears */}
              <g>
                <path d="M72 70 C34 66 18 96 48 118 C66 128 78 98 72 70 Z" fill="url(#porcelain3D)" />
                <path d="M68 76 C44 72 32 96 54 112 C66 118 72 98 68 76 Z" fill="url(#earGoldGlow)" />
                <path d="M48 72 C32 70 20 88 42 102 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M168 70 C206 66 222 96 192 118 C174 128 162 98 168 70 Z" fill="url(#porcelain3D)" />
                <path d="M172 76 C196 72 208 96 186 112 C174 118 168 98 172 76 Z" fill="url(#earGoldGlow)" />
                <path d="M192 72 C208 70 220 88 198 102 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Crest Plumes on head */}
              <path
                d="M102 50 C96 26 112 12 120 14 C128 12 144 26 138 50 C152 36 164 46 152 60 C142 68 130 58 120 62 C110 58 98 68 88 60 C76 46 88 36 102 50 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl Tuft */}
              <ellipse cx="120" cy="68" rx="14" ry="10" fill="url(#porcelain3D)" />
              <circle cx="120" cy="65" r="5" fill="#FFFFFF" />

              {/* FACIAL FEATURES: Large Glossy 3D Anime Eyes (Explorer Look) */}
              {/* Left Eye */}
              <ellipse cx="98" cy="94" rx="11" ry="13" fill="url(#eyeIrisGrad)" />
              <circle cx="94" cy="90" r="4.5" fill="#FFFFFF" />
              <circle cx="102" cy="98" r="2" fill="#FFFFFF" />
              <path d="M88 84 Q98 81 108 86" stroke="#1E140F" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Right Eye */}
              <ellipse cx="142" cy="94" rx="11" ry="13" fill="url(#eyeIrisGrad)" />
              <circle cx="138" cy="90" r="4.5" fill="#FFFFFF" />
              <circle cx="146" cy="98" r="2" fill="#FFFFFF" />
              <path d="M132 86 Q142 81 152 84" stroke="#1E140F" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Soft Pink Nose */}
              <path d="M117 101 Q120 99 123 101 Q120 104 117 101 Z" fill="#FB7185" />

              {/* Cheerful Open Smile with Tongue */}
              <path
                d="M112 106 Q120 118 128 106 Z"
                fill="#DC2626"
                stroke="#78350F"
                strokeWidth="1.5"
              />
              <path d="M116 111 Q120 108 124 111 Z" fill="#FDA4AF" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 4: 04_guardian_companion.png (Lumi Penjaga Berjubah Toska Mewah)      */}
          {/* ========================================================================= */}
          {activePose === 'guardian' && (
            <g>
              {/* Flowing Emerald/Teal Guardian Cape */}
              <path
                d="M58 116 C28 148 24 186 42 204 C74 214 166 214 198 204 C216 186 212 148 182 116 Z"
                fill="url(#clothTeal)"
                filter="drop-shadow(0px 8px 16px rgba(13,148,136,0.4))"
              />
              <path d="M42 204 C74 214 166 214 198 204 C176 190 64 190 42 204 Z" fill="#042F2E" opacity="0.4" />
              {/* Golden embroidered hem on cape */}
              <path
                d="M42 204 C74 214 166 214 198 204"
                stroke="url(#goldStar3D)"
                strokeWidth="3.5"
                fill="none"
              />

              {/* Meadow base */}
              <ellipse cx="120" cy="208" rx="84" ry="16" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="210" rx="66" ry="10" fill="#365314" opacity="0.35" />

              {/* Heroic Standing Body */}
              <path
                d="M84 122 C72 150 70 182 88 196 C102 202 138 202 152 196 C170 182 168 150 156 122 Z"
                fill="url(#porcelain3D)"
              />

              {/* Paws */}
              <ellipse cx="94" cy="198" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="94" cy="199" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="146" cy="198" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="146" cy="199" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />

              {/* Leather Satchel peek under cape */}
              <g transform="translate(142, 148) rotate(15)">
                <rect x="0" y="0" width="28" height="26" rx="7" fill="url(#leatherBag)" stroke="#451A03" strokeWidth="1.5" />
                <circle cx="14" cy="15" r="3" fill="#FBBF24" />
              </g>

              {/* Grand Cloak Collar & Cape Clasps */}
              <path
                d="M74 114 Q120 138 166 114 Q156 142 120 144 Q84 142 74 114 Z"
                fill="url(#clothTeal)"
                stroke="#0F766E"
                strokeWidth="2"
              />

              {/* Grand Golden Star Medallion Brooch */}
              <g transform="translate(120, 132) scale(1.2)" filter="drop-shadow(0px 3px 6px rgba(180,83,9,0.5))">
                <polygon
                  points="0,-18 5,-6 18,-3 8,7 11,18 0,12 -11,18 -8,7 -18,-3 -5,-6"
                  fill="url(#goldStar3D)"
                  stroke="#92400E"
                  strokeWidth="1.2"
                />
                <circle cx="-3" cy="-5" r="2.5" fill="#FFFFFF" opacity="0.8" />
              </g>

              {/* Dignified Head */}
              <ellipse cx="120" cy="92" rx="55" ry="46" fill="url(#porcelain3D)" />
              <circle cx="82" cy="106" r="14" fill="url(#cheekBlushRadial)" />
              <circle cx="158" cy="106" r="14" fill="url(#cheekBlushRadial)" />

              {/* Ears */}
              <g>
                <path d="M72 68 C34 64 18 94 48 116 C66 126 78 96 72 68 Z" fill="url(#porcelain3D)" />
                <path d="M68 74 C44 70 32 94 54 110 C66 116 72 96 68 74 Z" fill="url(#earGoldGlow)" />
                <path d="M48 70 C32 68 20 86 42 100 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M168 68 C206 64 222 94 192 116 C174 126 162 96 168 68 Z" fill="url(#porcelain3D)" />
                <path d="M172 74 C196 70 208 94 186 110 C174 116 168 96 172 74 Z" fill="url(#earGoldGlow)" />
                <path d="M192 70 C208 68 220 86 198 100 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Horns */}
              <path
                d="M102 48 C96 24 112 10 120 12 C128 10 144 24 138 48 C152 34 164 44 152 58 C142 66 130 56 120 60 C110 56 98 66 88 58 C76 44 88 34 102 48 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl */}
              <ellipse cx="120" cy="66" rx="14" ry="10" fill="url(#porcelain3D)" />

              {/* Confident Hero Eyes with Gold Sparkles */}
              <ellipse cx="98" cy="94" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="95" cy="90" r="4" fill="#FFFFFF" />
              <polygon points="101,96 102,98 104,98 102,100 103,102 101,101 99,102 100,100 98,98 100,98" fill="#FBBF24" />

              <ellipse cx="142" cy="94" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="139" cy="90" r="4" fill="#FFFFFF" />
              <polygon points="145,96 146,98 148,98 146,100 147,102 145,101 143,102 144,100 142,98 144,98" fill="#FBBF24" />

              {/* Nose & Dignified Smile */}
              <path d="M117 101 Q120 99 123 101 Q120 104 117 101 Z" fill="#FB7185" />
              <path d="M114 107 Q120 113 126 107" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 5: 05_happy_companion.png (Lumi Melompat Riang Gembira \o/)           */}
          {/* ========================================================================= */}
          {activePose === 'happy' && (
            <g>
              {/* Fluttering Cape */}
              <path
                d="M65 105 C38 120 30 160 52 178 C80 185 160 185 188 178 C210 160 202 120 175 105 Z"
                fill="url(#clothTeal)"
                filter="drop-shadow(0px 6px 12px rgba(13,148,136,0.35))"
              />

              {/* Floating Golden Stars */}
              <g transform="translate(164, 38) scale(0.9)" filter="drop-shadow(0px 2px 4px rgba(251,191,36,0.5))">
                <polygon points="0,-18 5,-5 18,-3 8,6 10,18 0,11 -10,18 -8,6 -18,-3 -5,-5" fill="url(#goldStar3D)" />
              </g>
              <g transform="translate(74, 34) scale(0.75)" filter="drop-shadow(0px 2px 4px rgba(251,191,36,0.5))">
                <polygon points="0,-18 5,-5 18,-3 8,6 10,18 0,11 -10,18 -8,6 -18,-3 -5,-5" fill="url(#goldStar3D)" />
              </g>
              <polygon points="175,25 182,32 172,35" fill="#FBBF24" />
              <polygon points="62,22 55,30 65,32" fill="#FBBF24" />
              <polygon points="120,8 124,16 116,16" fill="#FDE047" />

              {/* Dynamic Leaping Chubby Body */}
              <ellipse cx="120" cy="138" rx="52" ry="44" fill="url(#porcelain3D)" />

              {/* Arms Thrown High in the Air (\o/) */}
              <ellipse cx="64" cy="116" rx="16" ry="11" fill="url(#porcelain3D)" transform="rotate(-28 64 116)" />
              <circle cx="56" cy="112" r="5" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="176" cy="116" rx="16" ry="11" fill="url(#porcelain3D)" transform="rotate(28 176 116)" />
              <circle cx="184" cy="112" r="5" fill="#08B9EF" opacity="0.9" />

              {/* Kicking Back Legs showing cute paw pads */}
              <ellipse cx="90" cy="180" rx="16" ry="13" fill="url(#porcelain3D)" transform="rotate(18 90 180)" />
              <circle cx="89" cy="181" r="6" fill="#F472B6" />
              <circle cx="84" cy="176" r="2.5" fill="#08B9EF" />
              <circle cx="94" cy="176" r="2.5" fill="#08B9EF" />

              <ellipse cx="150" cy="180" rx="16" ry="13" fill="url(#porcelain3D)" transform="rotate(-18 150 180)" />
              <circle cx="151" cy="181" r="6" fill="#F472B6" />
              <circle cx="146" cy="176" r="2.5" fill="#08B9EF" />
              <circle cx="156" cy="176" r="2.5" fill="#08B9EF" />

              {/* Scarf with Star */}
              <path d="M86 116 Q120 134 154 116 Q146 136 120 138 Q94 136 86 116 Z" fill="url(#clothTeal)" />
              <g transform="translate(120, 128) scale(0.9)">
                <polygon points="0,-14 4,-4 14,-2 6,5 8,14 0,9 -8,14 -6,5 -14,-2 -4,-4" fill="url(#goldStar3D)" />
              </g>

              {/* Joyful Head tilted up */}
              <ellipse cx="120" cy="85" rx="54" ry="46" fill="url(#porcelain3D)" />
              <circle cx="80" cy="98" r="16" fill="url(#cheekBlushRadial)" />
              <circle cx="160" cy="98" r="16" fill="url(#cheekBlushRadial)" />

              {/* Joyful Upward Curved Ears */}
              <g transform="rotate(-8 72 65)">
                <path d="M72 65 C34 58 18 88 48 110 C66 120 78 90 72 65 Z" fill="url(#porcelain3D)" />
                <path d="M68 70 C44 64 32 88 54 104 C66 110 72 90 68 70 Z" fill="url(#earGoldGlow)" />
                <path d="M48 66 C32 62 20 80 42 94 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g transform="rotate(8 168 65)">
                <path d="M168 65 C206 58 222 88 192 110 C174 120 162 90 168 65 Z" fill="url(#porcelain3D)" />
                <path d="M172 70 C196 64 208 88 186 104 C174 110 168 90 172 70 Z" fill="url(#earGoldGlow)" />
                <path d="M192 66 C208 62 220 80 198 94 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Horns */}
              <path
                d="M102 42 C96 18 112 6 120 8 C128 6 144 18 138 42 C152 28 164 38 152 52 C142 60 130 50 120 54 C110 50 98 60 88 52 C76 38 88 28 102 42 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl */}
              <ellipse cx="120" cy="60" rx="14" ry="10" fill="url(#porcelain3D)" />

              {/* Joyful Arched Smiling Eyes with Eyelashes (^ ^) */}
              <path
                d="M88 88 Q98 78 108 88"
                stroke="#1E140F"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M108 88 L111 85" stroke="#1E140F" strokeWidth="2.5" strokeLinecap="round" />

              <path
                d="M132 88 Q142 78 152 88"
                stroke="#1E140F"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M132 88 L129 85" stroke="#1E140F" strokeWidth="2.5" strokeLinecap="round" />

              {/* Cute Nose */}
              <path d="M117 92 Q120 90 123 92 Q120 95 117 92 Z" fill="#FB7185" />

              {/* Wide Open Laughing Mouth with Tongue */}
              <path
                d="M110 97 Q120 114 130 97 Z"
                fill="#DC2626"
                stroke="#78350F"
                strokeWidth="2"
              />
              <path d="M114 105 Q120 100 126 105 Z" fill="#FDA4AF" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 6: 06_curious_companion.png (Lumi Tadabbur & Tanda Tanya ? Ungu)      */}
          {/* ========================================================================= */}
          {activePose === 'curious' && (
            <g>
              {/* Meadow base */}
              <ellipse cx="120" cy="206" rx="82" ry="18" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="208" rx="66" ry="12" fill="#365314" opacity="0.35" />

              {/* Sitting Body */}
              <ellipse cx="120" cy="164" rx="54" ry="44" fill="url(#porcelain3D)" />

              {/* Feet */}
              <ellipse cx="88" cy="196" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="88" cy="197" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="152" cy="196" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="152" cy="197" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />

              {/* Crossbody Satchel */}
              <g transform="translate(68, 148) rotate(-14)">
                <rect x="0" y="0" width="28" height="26" rx="7" fill="url(#leatherBag)" stroke="#451A03" strokeWidth="1.5" />
                <circle cx="14" cy="15" r="3" fill="#FBBF24" />
              </g>

              {/* Teal Scarf */}
              <path d="M84 128 Q120 148 156 128 Q148 148 120 150 Q92 148 84 128 Z" fill="url(#clothTeal)" />

              {/* Head Tilted in Contemplation */}
              <ellipse cx="124" cy="94" rx="55" ry="46" fill="url(#porcelain3D)" transform="rotate(-6 124 94)" />
              <circle cx="86" cy="108" r="14" fill="url(#cheekBlushRadial)" />
              <circle cx="162" cy="108" r="14" fill="url(#cheekBlushRadial)" />

              {/* One Paw Raised Touching Chin in Thought */}
              <g transform="translate(138, 118) rotate(-24)">
                <ellipse cx="0" cy="0" rx="14" ry="10" fill="url(#porcelain3D)" stroke="#D9C2AD" strokeWidth="1.5" />
                <circle cx="3" cy="-1" r="4.5" fill="#08B9EF" opacity="0.9" />
              </g>

              {/* Ears */}
              <g>
                <path d="M76 72 C38 68 22 98 52 120 C70 130 82 100 76 72 Z" fill="url(#porcelain3D)" />
                <path d="M72 78 C48 74 36 98 58 114 C70 120 76 100 72 78 Z" fill="url(#earGoldGlow)" />
                <path d="M52 74 C36 72 24 90 46 104 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M172 72 C210 68 226 98 196 120 C178 130 166 100 172 72 Z" fill="url(#porcelain3D)" />
                <path d="M176 78 C200 74 212 98 190 114 C178 120 172 100 176 78 Z" fill="url(#earGoldGlow)" />
                <path d="M196 74 C212 72 224 90 202 104 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Horns */}
              <path
                d="M106 50 C100 26 116 12 124 14 C132 12 148 26 142 50 C156 36 168 46 156 60 C146 68 134 58 124 62 C114 58 102 68 92 60 C80 46 92 36 106 50 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl */}
              <ellipse cx="124" cy="68" rx="14" ry="10" fill="url(#porcelain3D)" />

              {/* Large Glossy Eyes Looking Upwards in Thought */}
              <ellipse cx="102" cy="94" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="104" cy="88" r="4.5" fill="#FFFFFF" />
              <circle cx="98" cy="96" r="2" fill="#FFFFFF" />

              <ellipse cx="146" cy="94" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="148" cy="88" r="4.5" fill="#FFFFFF" />
              <circle cx="142" cy="96" r="2" fill="#FFFFFF" />

              {/* Nose & Thoughtful Small Mouth */}
              <path d="M121 102 Q124 100 127 102 Q124 105 121 102 Z" fill="#FB7185" />
              <circle cx="124" cy="110" r="3.5" fill="#78350F" />

              {/* Floating 3D Glossy Purple Question Mark */}
              <g transform="translate(166, 18) scale(1.15)">
                <motion.g
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                >
                  <path
                    d="M14 0 C24 0 32 8 28 20 C24 28 16 32 16 42 M16 52 L16 56"
                    stroke="url(#purpleGloss)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    filter="drop-shadow(0px 4px 8px rgba(139,92,246,0.5))"
                  />
                  <circle cx="20" cy="8" r="2.5" fill="#FFFFFF" opacity="0.8" />
                </motion.g>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 7: 07_proud_companion_quran.png (Lumi Memeluk Mushaf Al-Qur'an Emas)   */}
          {/* ========================================================================= */}
          {activePose === 'proud_quran' && (
            <g>
              {/* Meadow base */}
              <ellipse cx="120" cy="206" rx="82" ry="18" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="208" rx="66" ry="12" fill="#365314" opacity="0.35" />

              {/* Sitting Body */}
              <ellipse cx="120" cy="162" rx="54" ry="44" fill="url(#porcelain3D)" />

              {/* Feet */}
              <ellipse cx="88" cy="196" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="88" cy="197" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="152" cy="196" rx="16" ry="11" fill="url(#porcelain3D)" />
              <ellipse cx="152" cy="197" rx="10" ry="6" fill="#08B9EF" opacity="0.9" />

              {/* Head peeking lovingly over the Mushaf */}
              <ellipse cx="120" cy="92" rx="55" ry="46" fill="url(#porcelain3D)" />
              <circle cx="82" cy="106" r="14" fill="url(#cheekBlushRadial)" />
              <circle cx="158" cy="106" r="14" fill="url(#cheekBlushRadial)" />

              {/* Ears */}
              <g>
                <path d="M72 68 C34 64 18 94 48 116 C66 126 78 96 72 68 Z" fill="url(#porcelain3D)" />
                <path d="M68 74 C44 70 32 94 54 110 C66 116 72 96 68 74 Z" fill="url(#earGoldGlow)" />
                <path d="M48 70 C32 68 20 86 42 100 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M168 68 C206 64 222 94 192 116 C174 126 162 96 168 68 Z" fill="url(#porcelain3D)" />
                <path d="M172 74 C196 70 208 94 186 110 C174 116 168 96 172 74 Z" fill="url(#earGoldGlow)" />
                <path d="M192 70 C208 68 220 86 198 100 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Horns */}
              <path
                d="M102 48 C96 24 112 10 120 12 C128 10 144 24 138 48 C152 34 164 44 152 58 C142 66 130 56 120 60 C110 56 98 66 88 58 C76 44 88 34 102 48 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl */}
              <ellipse cx="120" cy="66" rx="14" ry="10" fill="url(#porcelain3D)" />

              {/* Proud Loving Eyes */}
              <ellipse cx="98" cy="92" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="95" cy="88" r="4.5" fill="#FFFFFF" />
              <circle cx="102" cy="96" r="2" fill="#FFFFFF" />

              <ellipse cx="142" cy="92" rx="10" ry="12" fill="url(#eyeIrisGrad)" />
              <circle cx="139" cy="88" r="4.5" fill="#FFFFFF" />
              <circle cx="146" cy="96" r="2" fill="#FFFFFF" />

              {/* Nose & Sweet Proud Smile */}
              <path d="M117 99 Q120 97 123 99 Q120 102 117 99 Z" fill="#FB7185" />
              <path d="M113 105 Q120 112 127 105" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* 3D EMERALD HOLY QURAN MUSHAF HUGGED TIGHTLY */}
              <g transform="translate(80, 108)" filter="drop-shadow(0px 8px 18px rgba(0,0,0,0.3))">
                {/* Book Cover */}
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="64"
                  rx="8"
                  fill="url(#quranEmeraldCover)"
                  stroke="#042F2E"
                  strokeWidth="2"
                />
                {/* Gold Outer Border */}
                <rect x="5" y="5" width="70" height="54" rx="5" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="2" fill="#FBBF24" />
                <circle cx="72" cy="8" r="2" fill="#FBBF24" />
                <circle cx="8" cy="56" r="2" fill="#FBBF24" />
                <circle cx="72" cy="56" r="2" fill="#FBBF24" />

                {/* 8-pointed Islamic Star Medallion */}
                <g transform="translate(40, 32)">
                  <rect x="-14" y="-14" width="28" height="28" fill="#FBBF24" />
                  <rect x="-14" y="-14" width="28" height="28" fill="#F59E0B" transform="rotate(45)" />
                  <circle cx="0" cy="0" r="8" fill="#047857" stroke="#FFF7A1" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3" fill="#FBBF24" />
                </g>

                {/* Golden Bookmark Ribbon */}
                <path d="M36 64 L36 76 L40 72 L44 76 L44 64 Z" fill="#F59E0B" />

                {/* Both Paws gripping edges of the Mushaf lovingly */}
                <ellipse cx="-4" cy="32" rx="10" ry="14" fill="url(#porcelain3D)" stroke="#D9C2AD" strokeWidth="1.5" />
                <circle cx="-3" cy="32" r="4.5" fill="#08B9EF" opacity="0.9" />
                <ellipse cx="84" cy="32" rx="10" ry="14" fill="url(#porcelain3D)" stroke="#D9C2AD" strokeWidth="1.5" />
                <circle cx="83" cy="32" r="4.5" fill="#08B9EF" opacity="0.9" />
              </g>

              {/* Sparkles of light around the Quran */}
              <circle cx="56" cy="116" r="3" fill="#FDE047" opacity="0.8" />
              <polygon points="184,115 187,121 193,123 188,127 189,133 184,130 179,133 180,127 175,123 181,121" fill="#FBBF24" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* POSE 8: 08_calm_companion.png (Lumi Tenang Bersila Khusyuk / Berdzikir)     */}
          {/* ========================================================================= */}
          {activePose === 'calm' && (
            <g>
              {/* Teal Cloak draped gracefully */}
              <path
                d="M60 125 C36 150 32 186 50 202 C76 210 164 210 190 202 C208 186 204 150 180 125 Z"
                fill="url(#clothTeal)"
                filter="drop-shadow(0px 6px 14px rgba(13,148,136,0.3))"
              />

              {/* Meadow base */}
              <ellipse cx="120" cy="206" rx="82" ry="18" fill="url(#grassTurf)" opacity="0.95" />
              <ellipse cx="120" cy="208" rx="66" ry="12" fill="#365314" opacity="0.35" />

              {/* Serene Cross-legged Body */}
              <ellipse cx="120" cy="166" rx="55" ry="42" fill="url(#porcelain3D)" />

              {/* Folded legs in peaceful cross-legged prayer meditation */}
              <ellipse cx="78" cy="194" rx="20" ry="12" fill="url(#porcelain3D)" transform="rotate(-10 78 194)" />
              <ellipse cx="78" cy="195" rx="12" ry="7" fill="#08B9EF" opacity="0.9" />
              <ellipse cx="162" cy="194" rx="20" ry="12" fill="url(#porcelain3D)" transform="rotate(10 162 194)" />
              <ellipse cx="162" cy="195" rx="12" ry="7" fill="#08B9EF" opacity="0.9" />

              {/* Paws folded peacefully on lap */}
              <ellipse cx="106" cy="176" rx="12" ry="8" fill="url(#porcelain3D)" />
              <ellipse cx="134" cy="176" rx="12" ry="8" fill="url(#porcelain3D)" />

              {/* Cloak Collar & Golden Star Pin */}
              <path d="M84 125 Q120 144 156 125 Q148 144 120 146 Q92 144 84 125 Z" fill="url(#clothTeal)" />
              <g transform="translate(120, 138) scale(0.9)">
                <polygon points="0,-15 4,-5 15,-3 7,5 9,15 0,10 -9,15 -7,5 -15,-3 -4,-5" fill="url(#goldStar3D)" />
              </g>

              {/* Serene Peaceful Head */}
              <ellipse cx="120" cy="96" rx="55" ry="46" fill="url(#porcelain3D)" />
              <circle cx="82" cy="110" r="14" fill="url(#cheekBlushRadial)" />
              <circle cx="158" cy="110" r="14" fill="url(#cheekBlushRadial)" />

              {/* Ears */}
              <g>
                <path d="M72 72 C34 68 18 98 48 120 C66 130 78 100 72 72 Z" fill="url(#porcelain3D)" />
                <path d="M68 78 C44 74 32 98 54 114 C66 120 72 100 68 78 Z" fill="url(#earGoldGlow)" />
                <path d="M48 74 C32 72 20 90 42 104 Z" fill="url(#crestCyanGrad)" />
              </g>
              <g>
                <path d="M168 72 C206 68 222 98 192 120 C174 130 162 100 168 72 Z" fill="url(#porcelain3D)" />
                <path d="M172 78 C196 74 208 98 186 114 C174 120 168 100 172 78 Z" fill="url(#earGoldGlow)" />
                <path d="M192 74 C208 72 220 90 198 104 Z" fill="url(#crestCyanGrad)" />
              </g>

              {/* Horns */}
              <path
                d="M102 52 C96 28 112 14 120 16 C128 14 144 28 138 52 C152 38 164 48 152 62 C142 70 130 60 120 64 C110 60 98 70 88 62 C76 48 88 38 102 52 Z"
                fill="url(#crestCyanGrad)"
                filter="drop-shadow(0px 3px 6px rgba(8,185,239,0.35))"
              />

              {/* Forehead Curl */}
              <ellipse cx="120" cy="70" rx="14" ry="10" fill="url(#porcelain3D)" />

              {/* Gentle Closed Eyes in Prayer / Meditation (08_calm) */}
              <path
                d="M92 98 Q100 106 108 98"
                stroke="#475569"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M132 98 Q140 106 148 98"
                stroke="#475569"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Nose & Serene Gentle Smile */}
              <path d="M117 104 Q120 102 123 104 Q120 107 117 104 Z" fill="#FB7185" />
              <path d="M115 111 Q120 115 125 111" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Gentle floating sparkles / peaceful aura */}
              <circle cx="68" cy="80" r="2.5" fill="#FEF08A" opacity="0.8" />
              <circle cx="172" cy="75" r="2.5" fill="#FEF08A" opacity="0.8" />
              <circle cx="120" cy="30" r="2" fill="#FEF08A" opacity="0.7" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  // --- RENDER FOR BURAQ BINTANG ---
  if (species === 'buraq') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-lg">
          <defs>
            <linearGradient id="buraqBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient id="buraqMane" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="178" rx="65" ry="14" fill="#0284C7" opacity="0.3" />
          <path d="M60 120 C20 90 40 40 85 80 Z" fill="url(#wingGrad)" />
          <path d="M140 120 C180 90 160 40 115 80 Z" fill="url(#wingGrad)" />
          <ellipse cx="100" cy="135" rx="42" ry="34" fill="url(#buraqBody)" stroke="#FDE68A" strokeWidth="2" />
          <circle cx="100" cy="85" r="38" fill="url(#buraqBody)" />
          <path d="M85 50 C75 30 110 20 115 50 Z" fill="url(#buraqMane)" />
          <path d="M98 30 L102 30 L100 12 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="85" cy="85" r="5.5" fill="#1E140F" />
          <circle cx="83" cy="83" r="2" fill="#FFFFFF" />
          <circle cx="115" cy="85" r="5.5" fill="#1E140F" />
          <circle cx="113" cy="83" r="2" fill="#FFFFFF" />
          <polygon points="100,125 103,132 110,133 105,138 106,145 100,141 94,145 95,138 90,133 97,132" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // --- RENDER FOR FAJR (BURUNG MERPATI) ---
  if (species === 'fajr') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-lg">
          <defs>
            <linearGradient id="fajrBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>
            <linearGradient id="fajrWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="175" rx="55" ry="12" fill="#0284C7" opacity="0.3" />
          <ellipse cx="100" cy="120" rx="46" ry="38" fill="url(#fajrBody)" />
          <path d="M60 120 C40 85 50 50 85 90 Z" fill="url(#fajrWing)" />
          <path d="M140 120 C160 85 150 50 115 90 Z" fill="url(#fajrWing)" />
          <circle cx="100" cy="78" r="32" fill="url(#fajrBody)" />
          <polygon points="95,84 105,84 100,94" fill="#F59E0B" />
          <circle cx="88" cy="74" r="4.5" fill="#1E140F" />
          <circle cx="86" cy="72" r="1.8" fill="#FFFFFF" />
          <circle cx="112" cy="74" r="4.5" fill="#1E140F" />
          <circle cx="110" cy="72" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // --- RENDER FOR KIBO (PANDA AL-HIKMAH) ---
  if (species === 'kibo') {
    return (
      <div style={{ width: size, height: size }} className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-lg">
          <ellipse cx="100" cy="175" rx="60" ry="12" fill="#15803D" opacity="0.3" />
          <circle cx="70" cy="60" r="16" fill="#1E293B" />
          <circle cx="130" cy="60" r="16" fill="#1E293B" />
          <ellipse cx="100" cy="130" rx="50" ry="40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="100" cy="85" r="40" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="84" cy="84" rx="10" ry="13" fill="#1E293B" transform="rotate(-15 84 84)" />
          <circle cx="85" cy="82" r="3.5" fill="#FFFFFF" />
          <ellipse cx="116" cy="84" rx="10" ry="13" fill="#1E293B" transform="rotate(15 116 84)" />
          <circle cx="115" cy="82" r="3.5" fill="#FFFFFF" />
          <ellipse cx="100" cy="96" rx="6" ry="4" fill="#1E293B" />
          <rect x="75" y="125" width="50" height="12" rx="4" fill="#15803D" />
        </svg>
      </div>
    );
  }

  // Default fallback to Lumi Explorer
  return (
    <div style={{ width: size, height: size }} className={`relative flex items-center justify-center select-none ${className}`}>
      <span className="text-4xl">🌟</span>
    </div>
  );
};
