"use client";

export function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-125 h-125 -top-25 left-[10%]" viewBox="0 0 500 500" fill="none">
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="250" cy="250" rx="220" ry="200" fill="url(#blob1)" />
      </svg>

      <svg className="absolute w-100 h-100 top-[30%] -right-20" viewBox="0 0 400 400" fill="none">
        <defs>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="200" rx="180" ry="160" fill="url(#blob2)" />
      </svg>

      <svg className="absolute w-150 h-150 -bottom-50 left-[20%]" viewBox="0 0 600 600" fill="none">
        <defs>
          <radialGradient id="blob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC4C4C" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#DC4C4C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="300" rx="260" ry="240" fill="url(#blob3)" />
      </svg>
    </div>
  );
}
