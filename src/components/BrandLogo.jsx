import Image from 'next/image';

/**
 * GenSolve Academy Brand Logo
 * Displays the full horizontal logo (including brand name inside image) with proper aspect ratio.
 */
export default function BrandLogo({ className = 'h-7 sm:h-8', wrapperClassName = '' }) {
  return (
    <div
      className={`bg-white px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200/40 inline-flex items-center justify-center hover:shadow-lg transition-all ${wrapperClassName}`}
    >
      <img
        src="/logo.png"
        alt="GenSolve Academy"
        className={`${className} w-auto object-contain block`}
        style={{ maxWidth: '200px' }}
      />
    </div>
  );
}
