/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Item {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  nombre: string;
  imagen?: string;
}

const GridLayoutComponent: React.FC = () => {
  const [layout, setLayout] = useState<Item[]>([]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout((prevLayout: any) => {
      const updatedLayout = newLayout.map((newItem) => {
        const existingItem = prevLayout.find(
          (item: Item) => item.i === newItem.i
        );
        return existingItem ? { ...existingItem, ...newItem } : newItem;
      });
      console.log("Nuevo Layout:", updatedLayout);
      return updatedLayout;
    });
  };

  const handleAddItem = () => {
    const newItem: Item = {
      i: String(layout.length + 1),
      x: 0,
      y: 0,
      w: Math.min(12, Math.max(6, 2)),
      h: Math.min(6, Math.max(3, 2)),
      nombre: `Elemento ${layout.length + 1}`,
    };

    setLayout([...layout, newItem]);
  };

  const handleCopyLayout = () => {
    const layoutWithoutImages = layout.map(({ imagen, ...rest }) => rest);
    navigator.clipboard.writeText(JSON.stringify(layoutWithoutImages));
  };

  const handleExportImages = () => {
    const images = layout.filter((item) => item.imagen);
    if (images.length === 0) {
      alert("No hay imágenes para exportar.");
      return;
    }

    const zip = new JSZip();

    images.forEach((item) => {
      const base64Data = item.imagen?.split(",")[1];
      if (base64Data) {
        const binaryData = window.atob(base64Data);
        const uint8Array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "image/png" });
        zip.file(`${uuidv4()}-${item.i}.png`, blob);
      }
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported_images.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const selectedItemIndex = layout.findIndex(
      (item) => item.i === event.currentTarget.id
    );

    if (file && selectedItemIndex !== -1) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLayout((prevLayout) =>
          prevLayout.map((item, index) =>
            index === selectedItemIndex
              ? { ...item, imagen: reader.result as string }
              : item
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleDeleteItem = (item: Item) => {
    setLayout((prevLayout) => prevLayout.filter((i) => i.i !== item.i));
  };

  return (
    <>
      <div className="informacion" style={{ fontSize: 24 }}>
        <h1>DINAMIC LAYOUT</h1>
        <p>
          Esta aplicación demuestra cómo crear un diseño de cuadrícula dinámico
          utilizando React Grid Layout (RGL). Puedes agregar, eliminar,
          arrastrar y redimensionar elementos en la cuadrícula de manera
          interactiva.
        </p>

        <h2>Instrucciones:</h2>
        <ol>
          <li>
            Haz clic en "Agregar Elemento" para agregar un nuevo elemento a la
            cuadrícula. El nuevo elemento cumplirá con tamaños mínimos y máximos
            especificados.
          </li>
          <li>
            Puedes eliminar un elemento haciendo clic en la "X" en la esquina
            superior derecha del elemento.
          </li>
          <li>
            Al hacer clic en un elemento existente, puedes cargar una imagen
            para establecerla como fondo del elemento.
          </li>
          <li>
            El botón "Copiar Layout" copia el diseño actual de la cuadrícula al
            portapapeles en formato JSON.
          </li>
        </ol>

        <h2>Notas:</h2>
        <ul>
          <li>
            Todos los elementos siguen restricciones de tamaño: Ancho mínimo
            (minW), Ancho máximo (maxW), Altura mínima (minH) y Altura máxima
            (maxH).
          </li>
          <li>
            Al agregar un nuevo elemento, su tamaño se ajusta automáticamente
            dentro de los límites especificados.
          </li>
        </ul>
        <button onClick={handleAddItem}>Agregar Elemento</button>
        <button onClick={handleCopyLayout}>Copiar Layout</button>
        <button onClick={handleExportImages}>Exportar Imágenes</button>
      </div>
      <ResponsiveGridLayout
        className="project__grid"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        margin={[30, 30]}
        isResizable={true}
        isDraggable={true}
        onLayoutChange={handleLayoutChange}
        preventCollision={false}
      >
        {layout.map((item) => (
          <div
            key={item.i}
            data-grid={{
              x: item.x,
              y: item.y,
              w: Math.min(12, Math.max(6, item.w)),
              h: Math.min(6, Math.max(3, item.h)),
              minW: 6,
              minH: 3,
              maxW: 12,
              maxH: 6,
            }}
            style={{ position: "relative", overflow: "hidden" }}
          >
            {item.imagen && (
              <img
                key={`${item.i}-image`}
                src={item.imagen}
                alt={`Imagen-${item.i}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}

            <h3 style={{ textAlign: "center" }}>{`${
              "ID:" + item.i + " WIDTH:" + item.w + " HEIGHT:" + item.h
            }`}</h3>
            <button className="delete" onClick={() => handleDeleteItem(item)}>
              X
            </button>
            <label className="img-load" onClick={handleClickUpload}>
              Cargar Imagen
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                style={{ display: "none" }}
                id={item.i}
                onChange={handleImageUpload}
              />
            </label>
          </div>
        ))}
      </ResponsiveGridLayout>
    </>
  );
};

export default GridLayoutComponent;
