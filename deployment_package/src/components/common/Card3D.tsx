import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card as CardType, Customer } from '../../types';
import { RefreshCw, QrCode, Shield, Sparkles, Check, Copy } from 'lucide-react';

interface Card3DProps {
  card?: CardType | null;
  customer?: Customer | null;
  pointsBalance?: number;
  customerLevel?: string;
  allowFlip?: boolean;
  className?: string;
}

export const Card3D: React.FC<Card3DProps> = ({
  card,
  customer,
  pointsBalance = 350,
  customerLevel = 'فضي (Silver)',
  allowFlip = true,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const cardNumber = card?.cardNumber || 'SUGAR-0000-0000';
  const qrId = card?.qrId || 'SUGAR-PREVIEW-CARD';
  const customerName = customer?.fullName || 'عضو مميز';
  const expiryDate = card?.expiryDate
    ? new Date(card.expiryDate).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit' })
    : '2027/12';

  useEffect(() => {
    // Generate QR code data URL
    QRCode.toDataURL(qrId, {
      margin: 1,
      width: 180,
      color: {
        dark: '#07090e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [qrId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const copyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Card Container */}
      <div
        className="w-full max-w-[400px] h-[245px] sm:h-[255px] cursor-pointer perspective-[1200px]"
        onClick={() => allowFlip && setIsFlipped(!isFlipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={cardRef}
        title={allowFlip ? 'انقر لقلب الكارت بين الوجهين' : undefined}
      >
        <div
          className="relative w-full h-full duration-700 transition-transform transform-style-preserve-3d rounded-2xl shadow-2xl shadow-sky-500/10 border border-sky-400/20"
          style={{
            transform: `rotateY(${isFlipped ? 180 : 0 + rotation.y}deg) rotateX(${rotation.x}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c121e] via-[#090d16] to-[#04060a] text-slate-100 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Holographic light reflection sheen */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Subtle luxury geometric line texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #38bdf8 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Header: Brand and Smart Chip */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <div className="w-full h-full bg-[#0a0f19] rounded-[6px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                    Sugar Business
                  </h3>
                  <span className="text-[10px] text-sky-400/80 font-mono tracking-widest block -mt-1">
                    SMART LOYALTY CARD
                  </span>
                </div>
              </div>

              {/* Contactless symbol & chip icon */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200/80 via-amber-400/60 to-yellow-600/70 border border-amber-300/40 p-1 flex flex-col justify-between shadow-inner">
                  <div className="w-full h-[1px] bg-amber-900/40" />
                  <div className="w-2/3 h-[1px] bg-amber-900/40" />
                  <div className="w-full h-[1px] bg-amber-900/40" />
                </div>
                <div className="w-6 h-6 flex items-center justify-center text-sky-400/70">
                  <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 6a6 6 0 0 1 6 6" />
                    <path d="M12 10a2 2 0 0 1 2 2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Center: Card Number */}
            <div className="relative z-10 my-auto">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-[0.2em] text-sky-100 drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]">
                  {cardNumber}
                </p>
                <button
                  type="button"
                  onClick={copyNumber}
                  className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-400/20 text-sky-300 hover:text-white transition-colors"
                  title="نسخ رقم الكارت"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Footer: Member Details & Expiry */}
            <div className="relative z-10 flex items-end justify-between border-t border-sky-500/15 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 block">عضو برنامج الولاء</span>
                <p className="font-semibold text-sm text-white tracking-wide truncate max-w-[190px]">
                  {customerName}
                </p>
              </div>

              <div className="text-center">
                <span className="text-[9px] text-slate-400 block">المستوى</span>
                <span className="text-xs font-bold text-sky-300">{customerLevel}</span>
              </div>

              <div className="text-left font-mono">
                <span className="text-[9px] text-slate-400 block">صالح حتى</span>
                <span className="text-xs text-slate-200">{expiryDate}</span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#070b13] via-[#090e18] to-[#04070c] text-slate-100"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Magnetic Black Stripe */}
            <div className="absolute top-5 left-0 w-full h-10 bg-[#020306] border-y border-slate-800" />

            {/* Security Hologram & QR Code Area */}
            <div className="relative z-10 mt-12 flex items-center justify-between gap-4">
              <div className="flex-1 text-right">
                <span className="text-[10px] text-sky-400 font-mono tracking-wider block mb-1">
                  OFFICIAL QR CODE
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  امسح الرمز لدى الكاشير أو التاجر المعتمد لتأكيد عملية الشراء وإضافة نقاطك فورياً.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>محمي بتقنية التشفير المزدوج</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 text-slate-900 animate-pulse" />
                )}
              </div>
            </div>

            {/* Back Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-400">
              <span className="font-mono">ID: {card?.cardId || 'CRD-884901'}</span>
              <span>www.sugarbusiness.com</span>
              <span className="text-sky-400 font-bold">Sugar Business</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Helper */}
      {allowFlip && (
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors py-1 px-3 rounded-full bg-sky-950/40 border border-sky-500/20"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isFlipped ? 'عرض واجهة الكارت (Front)' : 'عرض ظهر الكارت ورمز الـ QR (Back)'}</span>
        </button>
      )}
    </div>
  );
};
