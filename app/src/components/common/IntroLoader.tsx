import { motion } from "framer-motion";

export default function IntroLoader() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex size-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-zinc-800" />
          <motion.div
            className="size-24 rounded-full border-4 border-zinc-900 border-t-emerald-400 border-r-sky-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute size-3 rounded-full bg-orange-400"
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-sm tracking-wide text-zinc-400">Loading Hiring Agent...</p>
      </div>
    </motion.div>
  );
}
