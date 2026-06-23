import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#eae6df] flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Top WhatsApp-green Banner */}
      <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0"></div>

      {/* Main container */}
      <div className="w-full max-w-[1000px] mt-[64px] z-10 px-4 flex flex-col items-center">
        
        {/* Logo and Brand Title above the card */}
        <div className="flex items-center gap-3 self-start mb-6 text-white pl-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white text-xl border border-white/20">
            RT
          </div>
          <span className="text-xl font-bold tracking-wider uppercase text-white">
            Real-Time Chat App
          </span>
        </div>

        {/* WhatsApp-style landing card */}
        <div className="w-full bg-white rounded-md shadow-[0_17px_50px_0_rgba(0,0,0,0.19)] border border-[#e1e9eb] p-12 flex flex-col md:flex-row gap-12 items-center md:items-start min-h-[500px]">
          
          {/* Left Side: Setup Instructions */}
          <div className="w-full md:w-1/2 space-y-8 text-left">
            <h2 className="text-[28px] font-light text-[#41525d] leading-snug">
              To use Real-Time Chat App on your computer:
            </h2>
            
            <ol className="space-y-6 text-[#667781] text-[15px] list-decimal pl-5 leading-relaxed">
              <li className="pl-2">
                <span className="text-[#3b4a54] font-medium">Verify your email address</span> using the secure sign-in portal on the right.
              </li>
              <li className="pl-2">
                <span className="text-[#3b4a54] font-medium">Configure your chat profile</span> (username, display name, and avatar picture).
              </li>
              <li className="pl-2">
                <span className="text-[#3b4a54] font-medium">Start messaging</span> with your contacts in real-time.
              </li>
            </ol>


          </div>

          {/* Right Side: Clerk Auth Widget custom-styled in WhatsApp Green */}
          <div className="w-full md:w-1/2 flex justify-center">
            <SignIn
              appearance={{
                layout: {
                  socialButtonsVariant: 'iconButton',
                  socialButtonsPlacement: 'bottom'
                },
                variables: {
                  colorPrimary: '#00a884', // WhatsApp Green
                  colorBackground: '#ffffff',
                  colorInputBackground: '#ffffff',
                  colorInputText: '#3b4a54',
                  colorText: '#3b4a54',
                  colorTextSecondary: '#667781',
                  borderRadius: '0.375rem', // WhatsApp-style subtle rounding
                },
                elements: {
                  rootBox: 'w-full max-w-[360px] mx-auto',
                  cardBox: 'shadow-none bg-transparent w-full',
                  card: 'bg-white p-0 shadow-none border-0 w-full',
                  headerTitle: 'text-2xl font-bold tracking-tight text-[#41525d] text-center',
                  headerSubtitle: 'text-[#667781] text-center text-sm mb-4',
                  socialButtonsIconButton: 'border border-[#e1e9eb] bg-white text-[#3b4a54] hover:bg-[#f8f9fa] transition-all rounded-md w-full flex justify-center py-2.5 shadow-sm',
                  formButtonPrimary: 'w-full bg-[#00a884] hover:bg-[#008f72] active:bg-[#007b61] text-white font-medium py-3 rounded-md shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center uppercase tracking-wider text-xs',
                  formFieldInput: 'w-full bg-white border border-[#e1e9eb] text-[#3b4a54] placeholder-[#a3a3a3] rounded-md px-4 py-2.5 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/40 transition-all text-sm',
                  footerActionLink: 'text-[#00a884] hover:text-[#008f72] font-semibold transition-colors',
                  dividerLine: 'bg-[#f0f2f5]',
                  dividerText: 'text-[#667781] bg-white px-3 text-xs uppercase',
                  formFieldLabel: 'block text-xs font-semibold uppercase tracking-wider text-[#667781] mb-1.5',
                  footer: 'bg-transparent text-[#667781] text-xs',
                  identityPreviewText: 'text-[#3b4a54]',
                  identityPreviewEditButtonIcon: 'text-[#00a884]',
                }
              }}
            />
          </div>

        </div>

        {/* Small Footer */}
        <p className="text-[#8696a0] text-xs mt-12 mb-8">
          Real-Time Chat App for Web &copy; 2026. Configured via Mongoose & Socket.io.
        </p>

      </div>
    </div>
  );
}