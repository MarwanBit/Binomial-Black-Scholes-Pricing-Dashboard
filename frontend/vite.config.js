import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import prettier from "vite-plugin-prettier";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    prettier({
      //Prettier options
      singleQuote: true,
      semi: false,
      tabWidth: 2,
    })
  ],
});
