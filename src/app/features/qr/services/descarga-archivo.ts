import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DescargaArchivo {
  descargar(href: string, nombre: string): void {
    const enlace = document.createElement("a");
    enlace.href = href;
    enlace.download = nombre;
    enlace.rel = "noopener";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  }
}
