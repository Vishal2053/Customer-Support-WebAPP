import { useState } from 'react'
import { Navbar } from '../components/Layout'
import { Card, Input, Button } from '../components/UI'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API request
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      <div>
        <Navbar />
        {/* Glowing background blobs */}
        <div className="glow-blob glow-indigo top-20 left-1/4"></div>
        <div className="glow-blob glow-cyan bottom-20 right-1/4"></div>

        <div className="container mx-auto px-6 py-20 relative z-10 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Contact Supportly Support
            </h1>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Have questions about our RAG-powered chatbot integration? Reach out and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Contact Information Side */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-8 border border-slate-800 shadow-xl bg-slate-900/40 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <a href="tel:7218724950" className="flex items-center gap-4 group p-3 -m-3 rounded-lg hover:bg-slate-900/30 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.993.84H9.75a1 1 0 00-.75-.356l-1.92-1.92a2 2 0 00-2.83 0L3.58 6.58a2 2 0 000 2.83l6.58 6.58a2 2 0 002.83 0l1.92-1.92a1 1 0 00.356-.75v-.56a1 1 0 00-.84-.993l-2.2-.548a1 1 0 00-.725.94V19a2 2 0 01-2 2h-3C7.113 21 2 15.887 2 9.75V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Phone Number</p>
                      <p className="text-slate-200 font-semibold mt-0.5 group-hover:text-indigo-400 transition">7218724950</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a href="mailto:vishalbhagwanmore12@gmail.com" className="flex items-center gap-4 group p-3 -m-3 rounded-lg hover:bg-slate-900/30 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Email Address</p>
                      <p className="text-slate-200 font-semibold mt-0.5 group-hover:text-indigo-400 transition break-all">vishalbhagwanmore12@gmail.com</p>
                    </div>
                  </a>

                  {/* LinkedIn */}
                  <a href="https://www.linkedin.com/in/vishal-more-4b9236228/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 -m-3 rounded-lg hover:bg-slate-900/30 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">LinkedIn Profile</p>
                      <p className="text-slate-200 font-semibold mt-0.5 group-hover:text-indigo-400 transition">vishal-more-4b9236228</p>
                    </div>
                  </a>

                  {/* GitHub */}
                  <a href="https://github.com/Vishal2053" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 -m-3 rounded-lg hover:bg-slate-900/30 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500">GitHub Profile</p>
                      <p className="text-slate-200 font-semibold mt-0.5 group-hover:text-indigo-400 transition">Vishal2053</p>
                    </div>
                  </a>
                </div>
              </Card>
            </div>

            {/* Contact Form Side */}
            <div className="lg:col-span-7">
              <Card className="p-8 border border-slate-800 shadow-xl bg-slate-900/40 backdrop-blur-md">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                      ✓
                    </div>
                    <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">
                      Thank you for contacting us. We've received your request and will get back to you shortly.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="secondary" className="mt-4">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          name="name"
                          label="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                        <Input
                          type="email"
                          name="email"
                          label="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <Input
                        name="subject"
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                      />
                      <div className="flex flex-col">
                        <label className="text-slate-300 text-sm font-semibold mb-2">Message</label>
                        <textarea
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us details about your project or question..."
                          required
                          className="glass-input p-3.5 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition w-full resize-none min-h-[120px]"
                        ></textarea>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full justify-center">
                        {loading ? 'Sending message...' : 'Send Message'}
                      </Button>
                    </form>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center">
        <p className="text-sm text-slate-500 font-mono">Supportly — Build custom RAG assistants instantly</p>
      </footer>
    </div>
  )
}
