"use client";

interface NotificationBannerProps {
  appName: string;
  title: string;
  body: string;
  timeAgo?: string;
  className?: string;
}

export function NotificationBanner({
  appName,
  title,
  body,
  timeAgo = "now",
  className = "",
}: NotificationBannerProps) {
  return (
    <div
      className={`w-full rounded-[18px] p-3 backdrop-blur-2xl bg-white/70 border border-white/30 shadow-lg ${className}`}
    >
      <div className="flex items-start gap-2.5">
        {/* App icon */}
        <div
          className="w-9 h-9 rounded-[10px] bg-[var(--accent)] flex items-center justify-center flex-shrink-0"
          style={{
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {appName}
            </span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {timeAgo}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-gray-900 leading-tight mt-0.5">
            {title}
          </p>
          <p className="text-[12px] text-gray-500 leading-snug mt-0.5">
            {body}
          </p>
        </div>
      </div>

      {/* Swipe hint — iOS home indicator style */}
      <div className="flex justify-center mt-2">
        <div className="w-8 h-[3px] bg-black/10 rounded-full" />
      </div>
    </div>
  );
}
