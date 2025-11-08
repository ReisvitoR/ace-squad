export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-background rounded-full" />
          <div className="absolute inset-4 bg-gradient-to-br from-primary to-accent rounded-full animate-spin" 
               style={{ animationDuration: '3s' }} />
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
