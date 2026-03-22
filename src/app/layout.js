export const metadata = {
  title: 'FlowEnglish',
  description: 'Aprende inglés desde tu vida real',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
