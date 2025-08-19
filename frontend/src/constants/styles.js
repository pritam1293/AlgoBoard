// Common styling constants
export const INPUT_CLASSES = {
  base: "w-full px-3 py-2 bg-neutral-800 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200",
  error: "border-red-500",
  normal: "border-neutral-600",
};

export const BUTTON_CLASSES = {
  primary:
    "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200",
  primaryDisabled:
    "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-600 cursor-not-allowed",
  secondary: "text-blue-400 hover:text-blue-300 transition duration-200",
  link: "text-blue-400 hover:text-blue-300 font-medium transition duration-200",
};

export const MESSAGE_CLASSES = {
  error:
    "bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg",
  success:
    "bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg",
  errorSmall: "text-red-400 text-sm",
  successSmall: "text-green-400 text-sm",
};

export const CONTAINER_CLASSES = {
  page: "min-h-screen bg-neutral-900",
  card: "bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-8",
  form: "space-y-6",
};
