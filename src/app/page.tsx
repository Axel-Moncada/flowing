import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-negro">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start bg-negro">
          <Image 
        src="/isologo.png" 
        alt="Minimalist isologo featuring a stylized flowing design with smooth curves, set against a neutral background" 
        width={300} 
        height={300} 
        
          />
      </main>
      
    </div>
  );
}
