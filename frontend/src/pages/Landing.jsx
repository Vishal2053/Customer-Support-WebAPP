import { Navbar, Hero, Features } from '../components/Layout'
import { Button } from '../components/UI'
import { useAuth } from '../hooks'

export const Landing = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <Navbar user={null} />
      <Hero />
      <Features />
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to automate your support?</h2>
          {isAuthenticated ? (
            <Button href="/dashboard" size="lg">
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button href="/signup" size="lg">
                Sign Up Now
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
