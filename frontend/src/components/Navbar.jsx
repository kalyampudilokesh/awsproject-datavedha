import { Link, NavLink } from 'react-router-dom'
import { useCart } from './CartContext'

export default function Navbar() {
  const { itemCount } = useCart()
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Datavedha <span>Store</span>
      </Link>
      <ul className="navbar-links">
        <li><NavLink to="/" end>Products</NavLink></li>
        <li><NavLink to="/orders">Orders</NavLink></li>
        <li>
          <NavLink to="/cart">
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
