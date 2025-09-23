import React from "react";

const Navbar = () => {
  return (
    <div>
      <nav>
        <div className="grid grid-cols-12 bg-gris p-4 w-7xl align-middle justify-self-center">
          <div className="col-span-3">
            <img src="/logo.png" alt="Logo" />
          </div>


          <div className="col-span-5">
            <ul className="flex space-x-10 text-crema">
              <li>Inicio</li>
              <li>Que es</li>
              <li>FAQ</li>
              <li>Precios</li>
            </ul>
          </div>


          <div className="col-span-4">
            <button>Ingresar</button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
