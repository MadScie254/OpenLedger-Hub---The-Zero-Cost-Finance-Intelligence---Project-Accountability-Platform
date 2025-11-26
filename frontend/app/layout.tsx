import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "OpenLedger Black - Enterprise Finance Intelligence",
    description: "Zero-cost, SQLite-powered, enterprise-grade finance & project intelligence platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
