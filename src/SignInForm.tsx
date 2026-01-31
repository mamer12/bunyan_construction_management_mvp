import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus, User, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 50%, #FFFFFF 100%)" }}
    >
      {/* Background Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 rounded-full"
        style={{ background: "rgba(5, 150, 105, 0.08)", filter: "blur(80px)" }}
        initial={{ x: -200, y: -200 }}
        animate={{ 
          x: [-200, -180, -200],
          y: [-200, -180, -200]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-20 right-0 w-80 h-80 rounded-full"
        style={{ background: "rgba(16, 185, 129, 0.1)", filter: "blur(60px)" }}
        initial={{ x: 100 }}
        animate={{ 
          x: [100, 80, 100],
          y: [0, 20, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute -bottom-32 left-20 w-96 h-96 rounded-full"
        style={{ background: "rgba(52, 211, 153, 0.08)", filter: "blur(80px)" }}
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div 
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(5, 150, 105, 0.1)"
          }}
        >
          <div className="p-8">
            {/* Logo Section */}
            <motion.div 
              className="flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 8px 24px rgba(5, 150, 105, 0.35)"
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Building2 className="text-white" size={36} />
              </motion.div>
              <h1 
                className="text-3xl font-bold"
                style={{ color: "var(--brand-primary-dark)" }}
              >
                Bunyan
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles size={14} style={{ color: "var(--brand-primary)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Construction Management
                </p>
              </div>
            </motion.div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitting(true);
                const formData = new FormData(e.target as HTMLFormElement);
                formData.set("flow", flow);
                void signIn("password", formData).catch((error) => {
                  let toastTitle = "";
                  if (error.message.includes("Invalid password")) {
                    toastTitle = "Invalid password. Please try again.";
                  } else {
                    toastTitle =
                      flow === "signIn"
                        ? "Could not sign in, did you mean to sign up?"
                        : "Could not sign up, did you mean to sign in?";
                  }
                  toast.error(toastTitle);
                  setSubmitting(false);
                });
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label 
                  className="block text-sm font-semibold mb-1.5 ml-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Email
                </label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                  type="email"
                  name="email"
                  placeholder="you@bunyan.com"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--brand-primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label 
                  className="block text-sm font-semibold mb-1.5 ml-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Password
                </label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--brand-primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </motion.div>

              <motion.button
                className="w-full py-4 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)"
                }}
                type="submit"
                disabled={submitting}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 6px 20px rgba(5, 150, 105, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? (
                  <motion.div 
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : flow === "signIn" ? (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </motion.button>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}
                <button
                  className="ml-1 font-bold transition-colors"
                  style={{ color: "var(--brand-primary)" }}
                  onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = "var(--brand-primary-dark)"}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = "var(--brand-primary)"}
                >
                  {flow === "signIn" ? "Sign up" : "Sign in"}
                </button>
              </p>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t" style={{ borderColor: "var(--border-light)" }}></div>
                <span 
                  className="flex-shrink-0 mx-4 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Or
                </span>
                <div className="flex-grow border-t" style={{ borderColor: "var(--border-light)" }}></div>
              </div>

              <motion.button
                className="w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)"
                }}
                onClick={() => void signIn("anonymous")}
                whileHover={{ 
                  background: "var(--bg-mint)",
                  borderColor: "var(--border-emerald)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <User size={18} style={{ color: "var(--brand-primary)" }} />
                Continue as Guest
              </motion.button>
            </motion.div>
          </div>

          <div 
            className="p-4 text-center"
            style={{ 
              background: "var(--bg-mint)", 
              borderTop: "1px solid rgba(5, 150, 105, 0.1)" 
            }}
          >
            <p className="text-xs" style={{ color: "var(--brand-primary-dark)" }}>
              <strong>Tip:</strong> Use "lead" in email for Lead Dashboard.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
