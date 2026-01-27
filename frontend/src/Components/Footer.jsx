import React from "react";

const Footer = () => {
  return (
    <footer className="mt-12 bg-[#4B0000] text-white">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center space-y-1">
        <p className="text-sm">
          © {new Date().getFullYear()} LibriCore. All rights reserved.
        </p>

        <p className="text-xs opacity-80">
          Author: Toothless@gmail.com
        </p>
      </div>
    </footer>
  );
};

export default Footer;
