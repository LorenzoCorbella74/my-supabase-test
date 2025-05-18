import './App.css'
import Container from './Container'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="app-title">TEST</h1>
          <p className="app-subtitle">CRUD operations with Supabase</p>
        </div>
      </header>
      <Container />
    </div>
  )
}

export default App
