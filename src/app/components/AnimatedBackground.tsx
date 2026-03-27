export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      
      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-cyan-300/40 rounded-full animate-spin-slow" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 border border-blue-300/40 rounded-full animate-spin-slower" />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 border border-teal-300/40 rounded-full animate-spin-slow" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(to right, rgb(6, 182, 212) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(6, 182, 212) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem'
        }} />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float" />
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float animation-delay-1000" />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float animation-delay-2000" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-500 rounded-full animate-float animation-delay-3000" />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-float animation-delay-4000" />
      </div>
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
    </div>
  );
}
