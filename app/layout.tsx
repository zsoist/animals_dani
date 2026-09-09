import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Refugio', description: 'Un lugar pequeño para crecer juntos.' };
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#f4e4d0'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
