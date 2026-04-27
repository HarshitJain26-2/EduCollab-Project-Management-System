'use client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-[--background] min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background blobs */}
       <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[--primary-fixed-dim]/30 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] bg-[--secondary-fixed-dim]/20 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
          <p className="text-[--on-surface-variant] mb-8">Enter your email address and we'll send you instructions to reset your password.</p>
          
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="label-text text-xs text-[--on-surface-variant] uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                placeholder="student@university.edu" 
                className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
              />
            </div>
            <button className="w-full py-4 bg-[--primary] text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
              Send Reset Link
            </button>
          </form>

          <p className="mt-8 text-sm text-[--on-surface-variant]">
            Remember your password? <Link href="/login" className="text-[--primary] font-semibold hover:underline">Back to Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
