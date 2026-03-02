export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido al Portal Municipal
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Realiza tus trámites municipales en línea de forma rápida y sencilla.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '📋', title: 'Trámites', description: 'Gestiona tus solicitudes y expedientes municipales.' },
          { icon: '💬', title: 'Asistente Virtual', description: 'Resuelve tus dudas con nuestro chatbot municipal.' },
          { icon: '📢', title: 'Notificaciones', description: 'Recibe alertas sobre el estado de tus gestiones.' },
        ].map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{card.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h2>
            <p className="text-gray-600 text-sm">{card.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
