export const Navbar = ({ user, onLogout }) => (
  <nav className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary-500">AI Support</h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  </nav>
)

export const Sidebar = ({ items, active, onSelect }) => (
  <aside className="w-64 bg-gray-50 border-r min-h-screen p-6">
    <h2 className="font-bold text-lg mb-6">Menu</h2>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onSelect(item.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              active === item.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  </aside>
)

export const Hero = () => (
  <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-5xl font-bold mb-4">AI-Powered Customer Support</h1>
      <p className="text-xl mb-8 opacity-90">
        Train your AI assistant with your knowledge and automate customer support
      </p>
      <div className="flex gap-4 justify-center">
        <a href="/signup" className="px-6 py-3 bg-white text-primary-500 rounded-lg font-semibold hover:bg-gray-50">
          Get Started
        </a>
        <a href="/login" className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10">
          Login
        </a>
      </div>
    </div>
  </div>
)

export const Features = () => (
  <div className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: 'Easy Training',
            desc: 'Submit URLs and documents to train your AI assistant',
            icon: '📚',
          },
          {
            title: 'Embeddable Widget',
            desc: 'Add a chatbot widget to your website in minutes',
            icon: '🔧',
          },
          {
            title: 'Analytics Dashboard',
            desc: 'Track conversations and leads from your dashboard',
            icon: '📊',
          },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)
