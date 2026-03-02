export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-sm py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <p>© {new Date().getFullYear()} Municipio Digital. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
