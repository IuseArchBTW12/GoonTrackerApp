import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to continue your performance journey
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass-panel border border-white/10 rounded-3xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "glass-panel-hover border border-white/20 hover:border-electric-indigo/50 text-white",
              formButtonPrimary:
                "bg-electric-indigo hover:bg-electric-indigo/90 rounded-xl",
              footerActionLink: "text-electric-indigo hover:text-electric-purple",
            },
          }}
        />
      </div>
    </div>
  );
}
