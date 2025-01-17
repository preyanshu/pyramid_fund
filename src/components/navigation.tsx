import React from 'react'
import {
    Abstraxion,
    useAbstraxionAccount,
    useModal
  } from "@burnt-labs/abstraxion"; 
  import { Button } from "@burnt-labs/ui";

const Navigation = () => {

    const { data: account } = useAbstraxionAccount();

    const [showAbstraxion, setShowAbstraxion] = useModal();


  return (
    <nav className=" w-full h-[100px] bg-flex items-center justify-end flex max-w-4xl ">
         <Button
        className='w-[250px] mx-8'
        onClick={() => {
          setShowAbstraxion(true);
        }}
        structure="base"
        theme="secondary"
      >
        {account?.bech32Address ? (
          <div className="flex items-center justify-center"> <p >
          {account?.bech32Address ? `${account.bech32Address.slice(0, 6)}...${account.bech32Address.slice(-4)}` : ""}
        </p></div>
        ) : (
          "Connect"
        )}
      </Button>
      <Abstraxion
        onClose={() => {
          setShowAbstraxion(false);
        }}
      />

    </nav>
  )
}

export default Navigation