import { Navbar } from '@/components/navbar'

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
