import './globals.css'

export const metadata = {
  title: 'Fund Management Dashboard',
  description: 'Premium fund management dashboard for members and admin.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
