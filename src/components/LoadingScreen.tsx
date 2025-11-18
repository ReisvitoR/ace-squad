export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo da bola de vôlei com animação de rotação */}
        <div className="relative w-32 h-32 mx-auto">
          <img 
            src="/volleyball.png" 
            alt="Volleyball" 
            className="w-full h-full object-contain animate-spin"
            style={{ animationDuration: '2s' }}
          />
        </div>
        
        {/* Texto */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Galera do Vôlei
          </h2>
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    </div>
  );
}
