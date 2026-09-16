import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "पंचायत समिती चामोर्शी | जिल्हा गडचिरोली",
  description: "पंचायत समिती चामोर्शी, जिल्हा गडचिरोली यांची अधिकृत माहिती व डिजिटल सेवा पोर्टल."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mr">
      <body>{children}</body>
    </html>
  );
}
