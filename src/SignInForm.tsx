import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus, User, Building2, ArrowRight } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-100 via-purple-50 to-white relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/50 relative z-10 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-200/50">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-pink-600">Bunyan</h1>
            <p className="text-slate-500 mt-2 font-medium">Construction Management</p>
          </div>

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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Email</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
                type="email"
                name="email"
                placeholder="you@bunyan.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Password</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-600/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm mb-4">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}
              <button
                className="ml-1 text-violet-600 font-bold hover:text-violet-700 transition-colors"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              className="mt-4 w-full py-3 px-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
              onClick={() => void signIn("anonymous")}
            >
              <User size={18} className="text-slate-400" />
              Continue as Guest
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            <strong>Tip:</strong> Use "lead" in email for Lead Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
