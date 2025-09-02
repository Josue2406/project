'use client';


export default function TestErrorButton() {
  const triggerError = () => {
    try {
      // Aquí lanzamos un error intencional
      throw new Error('💥 Error de prueba para Faro');
    } catch (err) {
      // Enviar error manualmente a Faro
      if (typeof window !== 'undefined' && (window as any).faro) {
        (window as any).faro.captureException(err);
      }
      console.error('Error capturado y enviado a Faro:', err);
      alert('Error de prueba disparado ✅'); // Solo para feedback visual
    }
  };

  return (
    <button
      onClick={triggerError}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        backgroundColor: '#e53e3e',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        zIndex: 9999,
      }}
    >
      Probar Error Faro
    </button>
  );
}
