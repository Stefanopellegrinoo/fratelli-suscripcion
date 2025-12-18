import { LegalLayout } from "@/components/layouts/LegalLayout";

export default function PoliticaPrivacidad() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="Diciembre 2025">
      <section className="space-y-6">
        <p className="text-lg text-muted-foreground">
          En Fratelli, la confianza es nuestro ingrediente principal. Nos comprometemos a proteger tus datos personales y a utilizarlos únicamente para brindarte el mejor servicio.
        </p>

        <h3>1. Información que Recolectamos</h3>
        <p>Solo solicitamos los datos estrictamente necesarios para procesar y entregar tu suscripción:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nombre y Apellido.</li>
          <li>Dirección física de entrega y geolocalización (para el delivery).</li>
          <li>Teléfono de contacto (para notificaciones de entrega).</li>
          <li>Correo electrónico (para facturación y gestión de cuenta).</li>
        </ul>

        <h3>2. Seguridad de los Pagos (Importante)</h3>
        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r my-4">
          <p className="font-medium text-foreground">
            Fratelli NO almacena, NO procesa y NO tiene acceso a los datos de tus tarjetas de crédito o débito.
          </p>
        </div>
        <p>
          Todas las transacciones son procesadas íntegramente a través de la pasarela de pagos segura de <strong>Mercado Pago</strong>, que cumple con los más altos estándares internacionales de seguridad (PCI-DSS). Nosotros solo recibimos una confirmación de pago aprobado o rechazado.
        </p>

        <h3>3. Uso de la Información</h3>
        <p>Utilizamos tus datos para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Gestionar tu suscripción y entregas mensuales.</li>
          <li>Emitir facturas electrónicas (AFIP).</li>
          <li>Contactarte ante incidencias en el envío.</li>
        </ul>
        <p><strong>No vendemos ni cedemos tus datos a terceros con fines publicitarios.</strong></p>

        <h3>4. Derechos del Titular (Habeas Data)</h3>
        <p>
          Conforme a la Ley 25.326 de Protección de Datos Personales, tenés la facultad de ejercer el derecho de acceso a tus datos en forma gratuita en intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto. Podés solicitar la rectificación o supresión de tus datos escribiendo a <strong>contacto@fratelli.com.ar</strong>.
        </p>

        <h3>5. Organismo de Control</h3>
        <p>
          La Agencia de Acceso a la Información Pública tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.
        </p>
      </section>
    </LegalLayout>
  );
}