import React from "react";
import Image from "next/image";
import logo from "../assets/images/Logo_vertical.png"; // Adjust the path as necessary

const Navbar = () => {
  return (
    <div>
      <nav>
        <div className="grid grid-cols-12 bg-gris p-4 w-7xl align-middle justify-self-center rounded-2xl pl-20 mt-5">
          <div className="col-span-3">
            <Image 
              src={logo} 
              alt="Logo" 
              width={200} // specify appropriate width
              height={60}  // specify appropriate height
              priority // if this image is above the fold
            />
          </div>


          <div className="col-span-5 align-middle flex items-center">
            <ul className="flex space-x-10 text-crema ">
              <li>Inicio</li>
              <li>Que es</li>
              <li>FAQ</li>
              <li>Precios</li>
            </ul>
          </div>


          <div className="col-span-4 gap-10 flex justify-center items-center">
            <button className="Btn-crema bg-crema p-3 px-10 rounded-full font-extrabold">Ingresar</button>
            <button className="Btn-verde bg-verde p-3 px-10 rounded-full font-extrabold">Crear cuenta</button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
