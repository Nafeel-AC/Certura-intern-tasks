import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useLocalStorage('cart', {})
  const [isCartOpen, setIsCartOpen] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/products`).then(r => r.json()).then(setProducts).catch(() => setProducts([]))
  }, [])

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, quantity]) => {
      const product = products.find(p => p.id === id)
      if (!product) return sum
      return sum + product.price * quantity
    }, 0)
  }, [cart, products])

  function addToCart(product) {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
  }

  function decrement(product) {
    setCart(prev => {
      const next = { ...prev }
      const current = next[product.id] || 0
      if (current <= 1) delete next[product.id]
      else next[product.id] = current - 1
      return next
    })
  }

  function clearCart() {
    setCart({})
  }

  return (
    <div className="page">
      <header className="header">
        <div className="title">
          <span className="task">TASK 3:</span> Shopping Cart System
        </div>
        <button className="cart-toggle" onClick={() => setIsCartOpen(s => !s)}>
          {isCartOpen ? 'Hide Cart' : 'Show Cart'} ({Object.keys(cart).length})
        </button>
      </header>

      <main className="content">
        <section className="products">
          {products.map(p => (
            <article key={p.id} className="card">
              <div className="image-wrap">
                <img src={p.image} alt={p.title} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x600?text=Image'; }} />
              </div>
              <div className="info">
                <h3 className="name">{p.title}</h3>
                <div className="price-row">
                  <span className="price">Rs.{p.price}</span>
                  <span className="discount">-{p.discountPercent}%</span>
                </div>
                <div className="rating">{'★'.repeat(Math.round(p.rating))}<span className="muted"> ({p.reviews})</span></div>
              </div>
              <button className="add" onClick={() => addToCart(p)}>Add to Cart</button>
            </article>
          ))}
        </section>

        {isCartOpen && (
          <aside className="cart">
            <h2>Cart</h2>
            <div className="cart-items">
              {Object.keys(cart).length === 0 && <div className="empty">Your cart is empty.</div>}
              {Object.entries(cart).map(([id, quantity]) => {
                const product = products.find(p => p.id === id)
                if (!product) return null
                return (
                  <div key={id} className="cart-row">
                    <div className="cart-title">{product.title}</div>
                    <div className="cart-qty">
                      <button onClick={() => decrement(product)}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => addToCart(product)}>+</button>
                    </div>
                    <div className="cart-subtotal">Rs.{product.price * quantity}</div>
                  </div>
                )
              })}
            </div>
            <div className="cart-footer">
              <div className="total">Total: <strong>Rs.{total}</strong></div>
              <button className="clear" onClick={clearCart}>Clear</button>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
