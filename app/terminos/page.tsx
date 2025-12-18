// src/pages/terminos.tsx
import { LegalLayout } from "@/components/layouts/LegalLayout";

export default function TerminosYCondiciones() {
  return (
    <LegalLayout title="Términos y Condiciones de Uso" lastUpdated="Diciembre 2025">
      <section className="space-y-6">
        <h3>1. Aceptación de los Términos</h3>
        <p>
          Bienvenido a <strong>Fratelli</strong>. Al contratar nuestro servicio de suscripción de pastas, aceptás los presentes términos y condiciones. Este contrato rige la relación entre el usuario ("Suscriptor") y Fratelli ("Nosotros").
        </p>

        <h3>2. Modelo de Suscripción y Pagos Recurrentes</h3>
        <p>
          El servicio opera bajo una modalidad de <strong>débito automático mensual</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Autorización:</strong> Al suscribirte, autorizás expresamente a Fratelli a realizar cobros periódicos en el medio de pago proporcionado a través de la plataforma <strong>Mercado Pago</strong>.
          </li>
          <li>
            <strong>Ciclo de Facturación:</strong> El cobro se realizará mensualmente el mismo día calendario en que se inició la suscripción.
          </li>
          <li>
            <strong>Ajustes de Precio:</strong> Nos reservamos el derecho de ajustar los precios de los planes. Cualquier cambio será notificado vía correo electrónico con al menos 15 días de anticipación, permitiendo al usuario cancelar el servicio si no está de acuerdo.
          </li>
        </ul>

        <h3>3. Política de Envíos y Recepción</h3>
        <p>
          Nuestros productos son <strong>alimentos frescos sin conservantes</strong>, por lo que requieren refrigeración inmediata.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Es responsabilidad del usuario asegurar que haya una persona mayor de 18 años para recibir el pedido en el rango horario pactado.</li>
          <li>Si no hay nadie en el domicilio, el pedido regresará a nuestro centro de producción. El costo de un nuevo envío correrá por cuenta del usuario. Por seguridad alimentaria, los productos no entregados no se guardan más de 24 horas.</li>
        </ul>

        <h3>4. Política de Cancelación y Derecho de Arrepentimiento</h3>
        <p>
          <strong>Cancelación del Servicio:</strong> Podés dar de baja tu suscripción en cualquier momento desde tu panel de usuario ("Mi Cuenta"). La cancelación detendrá los cobros futuros, pero no reembolsará el mes ya abonado si el servicio ya fue prestado.
        </p>
        <p>
          <strong>Excepción al Derecho de Retracto (Botón de Arrepentimiento):</strong>
          Conforme al Código Civil y Comercial y la Ley de Defensa del Consumidor, el derecho de arrepentimiento (devolución dentro de los 10 días) <strong>NO APLICA</strong> a la compra de alimentos perecederos o productos que puedan deteriorarse con rapidez una vez rota la cadena de frío, salvo que el producto llegue en mal estado.
        </p>

        <h3>5. Reclamos y Devoluciones</h3>
        <p>
          Si recibís un producto en mal estado, con el empaque dañado o incorrecto:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Contactanos dentro de las <strong>24 horas</strong> de recibido el pedido.</li>
          <li>Envianos fotos del producto a <strong>contacto@fratelli.com.ar</strong>.</li>
          <li>Procederemos a reponer la mercadería en el próximo envío o a realizar el reembolso proporcional.</li>
        </ol>
      </section>
    </LegalLayout>
  );
}