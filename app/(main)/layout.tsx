import { Navbar } from '@/components/Navbar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main>{children}</main>
    </>
  )
}
