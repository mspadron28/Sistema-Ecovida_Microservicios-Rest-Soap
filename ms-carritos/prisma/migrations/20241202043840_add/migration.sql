-- CreateTable
CREATE TABLE "carrito" (
    "id_carrito" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "precioTotal" DOUBLE PRECISION NOT NULL,
    "cantidadTotal" INTEGER NOT NULL,

    CONSTRAINT "carrito_pkey" PRIMARY KEY ("id_carrito")
);

-- CreateTable
CREATE TABLE "carrito_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_carrito" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "carrito_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- AddForeignKey
ALTER TABLE "carrito_detalle" ADD CONSTRAINT "carrito_detalle_id_carrito_fkey" FOREIGN KEY ("id_carrito") REFERENCES "carrito"("id_carrito") ON DELETE NO ACTION ON UPDATE NO ACTION;
