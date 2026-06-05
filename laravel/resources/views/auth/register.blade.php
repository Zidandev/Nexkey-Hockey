<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXKEY.OS // CONFIGURE NEW SYNAPSE IDENTITY</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Fira Code', monospace;
            background-color: #050505;
        }
        .neon-shadow-purple {
            box-shadow: 0 0 15px rgba(191, 0, 255, 0.25);
        }
        .neon-text-purple {
            color: #BF00FF;
            text-shadow: 0 0 8px rgba(191, 0, 255, 0.5);
        }
    </style>
</head>
<body class="min-h-screen text-[#00FF41] flex flex-col justify-between overflow-x-hidden relative">
    
    <!-- Cyber Grid Background -->
    <div class="pointer-events-none fixed inset-0 z-0 opacity-15" style="background-image: linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px); background-size: 30px 30px;"></div>

    <!-- Header HUD -->
    <header class="h-16 flex items-center justify-between px-8 border-b border-[#00FF41]/20 bg-black/80 backdrop-blur z-10">
        <div class="flex items-center gap-4">
            <span class="text-xl font-bold tracking-tighter text-white">NEXKEY<span class="text-[#00FF41] opacity-60">.OS</span></span>
            <div class="h-6 w-px bg-[#00FF41]/30"></div>
            <span class="text-xs font-bold tracking-[0.2em] text-[#00FF41]/80 font-bold text-[#BF00FF] neon-text-purple">GATE_ID: REGISTER_SYNAPSE</span>
        </div>
        <div class="text-[10px] text-[#00FF41]/50 uppercase tracking-widest">
            SECURE_SYNC v1.4.2
        </div>
    </header>

    <!-- Main Container Card -->
    <main class="flex-grow flex items-center justify-center p-6 z-10">
        <div class="w-full max-w-md bg-black border border-[#00FF41]/30 rounded-xl p-8 shadow-[0_0_35px_rgba(191,0,255,0.08)] relative overflow-hidden backdrop-blur-md">
            
            <!-- Top branding banner line decoration -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BF00FF] to-[#00FF41]"></div>
            
            <div class="mb-6 text-center">
                <span class="text-[10px] tracking-[0.3em] text-[#00FF41]/50 uppercase block mb-1">Registration Protocol</span>
                <h1 class="font-sans font-extrabold text-2xl text-white tracking-tight uppercase">USER_SIGN_UP</h1>
            </div>

            <!-- Error Feedback -->
            @if ($errors->any())
                <div class="mb-5 p-3.5 bg-red-950/40 border border-red-500/40 text-red-400 text-xs rounded">
                    @foreach ($errors->all() as $error)
                        <div class="flex items-center gap-2">
                            <span>❌ [FATAL_ERR]: {{ $error }}</span>
                        </div>
                    @endforeach
                </div>
            @endif

            <form method="POST" action="{{ route('register') }}" class="space-y-4">
                @csrf

                <!-- Username Input -->
                <div>
                    <label for="username" class="block text-[10px] uppercase text-[#00FF41]/70 mb-1.5 font-bold tracking-wider">Node Name (Username)</label>
                    <input 
                        type="text" 
                        name="username" 
                        id="username" 
                        value="{{ old('username') }}" 
                        required 
                        autofocus
                        placeholder="e.g. CyberReflect"
                        class="w-full bg-black/90 border border-[#00FF41]/30 focus:border-[#BF00FF] px-4 py-2.5 rounded text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#BF00FF]"
                    >
                </div>

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-[10px] uppercase text-[#00FF41]/70 mb-1.5 font-bold tracking-wider">Synapse Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        id="email" 
                        value="{{ old('email') }}" 
                        required 
                        placeholder="e.g. pilot@nexkey.com"
                        class="w-full bg-black/90 border border-[#00FF41]/30 focus:border-[#BF00FF] px-4 py-2.5 rounded text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#BF00FF]"
                    >
                </div>

                <!-- Password Input -->
                <div>
                    <label for="password" class="block text-[10px] uppercase text-[#00FF41]/70 mb-1.5 font-bold tracking-wider">Access Hexcode (Password)</label>
                    <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        required 
                        placeholder="••••••••••••"
                        class="w-full bg-black/90 border border-[#00FF41]/30 focus:border-[#BF00FF] px-4 py-2.5 rounded text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#BF00FF]"
                    >
                </div>

                <!-- Password Confirmation Input -->
                <div>
                    <label for="password_confirmation" class="block text-[10px] uppercase text-[#00FF41]/70 mb-1.5 font-bold tracking-wider">Confirm Access Hexcode</label>
                    <input 
                        type="password" 
                        name="password_confirmation" 
                        id="password_confirmation" 
                        required 
                        placeholder="••••••••••••"
                        class="w-full bg-black/90 border border-[#00FF41]/30 focus:border-[#BF00FF] px-4 py-2.5 rounded text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#BF00FF]"
                    >
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit" 
                    class="w-full py-3 bg-gradient-to-r from-[#BF00FF] to-[#00FF41] hover:from-[#bd00ff] hover:to-[#39ff14] text-black font-sans font-bold uppercase text-xs tracking-wider rounded cursor-pointer transition-all active:scale-98 shadow-[0_0_15px_rgba(191,0,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)]"
                >
                    INITIALIZE NEW NODE SYNAPSE
                </button>
            </form>

            <div class="mt-8 pt-4 border-t border-[#00FF41]/15 text-center text-xs">
                <span class="text-[#00FF41]/50">Already configured?</span>
                <a href="{{ route('login') }}" class="text-[#00FF41] hover:text-white underline font-bold transition-all uppercase ml-1.5">Load Preset Session</a>
            </div>
        </div>
    </main>

    <!-- Footer HUD -->
    <footer class="h-12 bg-black/90 border-t border-[#00FF41]/10 flex items-center justify-between px-8 text-[9px] uppercase tracking-widest text-[#00FF41]/60">
        <div>NET_LOCATION: GATEWAY_NORTH</div>
        <div class="neon-text-green font-bold">credits by Zidandev</div>
        <div>SEC_KEY: VALID</div>
    </footer>
</body>
</html>
