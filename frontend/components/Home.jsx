import { Link } from 'react-router-dom'
import '../css/Home.css'

export default function Home() {
  return (
    <section className="home">
      <div className="hero">
        <h1>Smart Exchange for Used Gadgets</h1>
        <p>Buy and sell phones, laptops, and accessories with trusted ratings and secure chat.</p>
        <div className="cta">
          <Link to="/signup" className="btn primary">Get Started</Link>
          <Link to="/login" className="btn ghost">I already have an account</Link>
        </div>
      </div>
      <div className="features">
        <div className="card">
          <h3>Role-based Access</h3>
          <p>Admins approve sellers and admins. Buyers browse freely.</p>
        </div>
        <div className="card">
          <h3>Chat Built-in</h3>
          <p>Buyers and sellers can message directly to finalize deals.</p>
        </div>
        <div className="card">
          <h3>Verified Reviews</h3>
          <p>Rate products and sellers to grow community trust.</p>
        </div>
      </div>
    </section>
  )
}
