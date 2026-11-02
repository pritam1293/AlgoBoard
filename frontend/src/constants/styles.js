// Common styling constants
export const INPUT_CLASSES = {
  base: "w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20",
  error: "border-red-500/50 focus:border-red-400",
  normal: "border-white/10 focus:border-blue-400/40",
};

export const BUTTON_CLASSES = {
  primary:
    "w-full flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60",
  primaryDisabled:
    "w-full flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white cursor-not-allowed",
  secondary: "text-blue-400 hover:text-blue-300 transition duration-200",
  link: "font-medium text-blue-400 transition duration-200 hover:text-blue-300",
};

export const MESSAGE_CLASSES = {
  error:
    "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300",
  success:
    "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300",
  errorSmall: "text-sm text-red-400",
  successSmall: "text-sm text-emerald-400",
};

export const CONTAINER_CLASSES = {
  page: "min-h-screen bg-neutral-950",
  card: "rounded-2xl border border-white/10 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur-sm",
  form: "space-y-6",
};
