import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Assessment, Patient } from "../types"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { fontSize: 20, marginBottom: 20, textAlign: "center" },
  subheader: { fontSize: 12, marginBottom: 20, textAlign: "center", color: "#666" },
  section: { marginBottom: 12 },
  label: { fontSize: 10, color: "#666", marginBottom: 2 },
  value: { fontSize: 12, marginBottom: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginBottom: 16 },
  result: {
    fontSize: 24,
    textAlign: "center",
    padding: 16,
    marginTop: 20,
    fontFamily: "Helvetica-Bold",
  },
  resultPasa: { color: "#065f46" },
  resultNoPasa: { color: "#991b1b" },
  itemsTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 16 },
  item: { fontSize: 10, marginBottom: 4, paddingLeft: 8 },
  itemFailed: { color: "#dc2626" },
  itemPassed: { color: "#059669" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 9, color: "#9ca3af", textAlign: "center" },
})

interface Props {
  patient: Patient
  assessment: Assessment
}

export function AssessmentPDF({ patient, assessment }: Props) {
  const passed = assessment.result === "PASA"
  const failedItems = assessment.items.filter((i) => !i.passed)

  const formattedDate = (() => {
    try {
      return new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("es-AR")
    } catch {
      return assessment.assessment_date
    }
  })()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>PRUNAPE — Pesquisa Garrahan</Text>
        <Text style={styles.subheader}>
          Prueba Nacional de Pesquisa del Desarrollo Infantil
        </Text>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Paciente</Text>
          <Text style={styles.value}>{patient.name}</Text>

          <Text style={styles.label}>Fecha de evaluación</Text>
          <Text style={styles.value}>{formattedDate}</Text>

          <Text style={styles.label}>Edad cronológica</Text>
          <Text style={styles.value}>
            {assessment.chronological_age.toFixed(2)} años
          </Text>

          {assessment.corrected_age != null && (
            <>
              <Text style={styles.label}>Edad corregida</Text>
              <Text style={styles.value}>
                {assessment.corrected_age.toFixed(2)} años
              </Text>
            </>
          )}
        </View>

        <View style={styles.divider} />

        <Text
          style={[
            styles.result,
            passed ? styles.resultPasa : styles.resultNoPasa,
          ]}
        >
          {passed ? "PASA" : "NO PASA"}
        </Text>

        {!passed && failedItems.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.itemsTitle}>Pautas no cumplidas:</Text>
            {failedItems.map((item) => (
              <Text key={item.id} style={[styles.item, styles.itemFailed]}>
                • {item.pauta_name} ({item.area}) — Tipo {item.pauta_type}
              </Text>
            ))}
          </View>
        )}

        {passed && (
          <Text style={{ fontSize: 11, textAlign: "center", marginTop: 16, color: "#065f46" }}>
            El niño aprueba la pesquisa. Se recomienda control en la próxima visita pediátrica.
          </Text>
        )}

        {!passed && (
          <Text style={{ fontSize: 11, textAlign: "center", marginTop: 16, color: "#991b1b", fontFamily: "Helvetica-Oblique" }}>
            Se recomienda derivar para evaluación diagnóstica completa del desarrollo.
          </Text>
        )}

        <Text style={styles.footer}>
          Hospital Garrahan — Documento generado el{" "}
          {new Date().toLocaleDateString("es-AR")}
        </Text>
      </Page>
    </Document>
  )
}
