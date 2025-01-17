"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import Navigation from "@/components/navigation";
import { ToastContainer, toast } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });



const treasuryConfig = {
  treasury: "xion1qt2s536y5t3ftpt6z4d4ym0pug0lmcaaetcwjs74z6kvzfy9tekq7yqqhg", // Example XION treasury instance for executing seat contract
  gasPrice: "0uxion",

  // rpcUrl: "https://rpc.xion-mainnet-1.burnt.com:443",
  // restUrl: "https://api.xion-mainnet-1.burnt.com:443",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className + ' flex justify-center items-center flex-col'}>
        <AbstraxionProvider config={treasuryConfig}>
          <Navigation></Navigation>
          {children}
          {/* <ToastContainer /> */}
        </AbstraxionProvider>
      </body>
    </html>
  );
}