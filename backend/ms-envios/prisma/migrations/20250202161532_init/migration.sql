-- CreateTable
CREATE TABLE "direcciones_envio" (
    "id_direccion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "pais" VARCHAR(100) NOT NULL,
    "canton" VARCHAR(255) NOT NULL,
    "parroquia" VARCHAR(100) NOT NULL,
    "codigo_postal" VARCHAR(20) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,

    CONSTRAINT "direcciones_envio_pkey" PRIMARY KEY ("id_direccion")
);

-- CreateTable
CREATE TABLE "envios" (
    "id_envio" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "fecha_envio" TIMESTAMP(6),
    "fecha_entrega" TIMESTAMP(6),
    "estado" VARCHAR(50) NOT NULL,
    "metodo_envio" VARCHAR(100),

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id_envio")
);
