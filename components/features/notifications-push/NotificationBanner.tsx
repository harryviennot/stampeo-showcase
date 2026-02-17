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
      className={`w-full rounded-2xl p-3 backdrop-blur-xl bg-white/90 border border-white/50 shadow-lg ${className}`}
    >
      <div className="flex items-start gap-2.5">
        {/* App icon */}
        <div className="w-9 h-9 rounded-[8px] bg-[var(--accent)] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {appName}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo}</span>
          </div>
          <p className="text-[13px] font-semibold text-gray-900 leading-tight mt-0.5">
            {title}
          </p>
          <p className="text-[12px] text-gray-600 leading-snug mt-0.5 line-clamp-2">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
