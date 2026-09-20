import SwiftUI

/// Zeichnet einen EKG-Streifen auf Millimeterpapier-Raster — Entsprechung zu
/// src/modules/ekg/EkgTrace.tsx, hier mit SwiftUI-`Canvas` statt SVG.
///
/// Maßstab wie üblich: 25 mm/s waagerecht, 10 mm/mV senkrecht.
struct EcgTraceView: View {
    let trace: EcgWaveform.Trace
    var height: CGFloat = 170
    /// Blendet P/QRS/T sowie PQ- und QT-Strecke an einem Schlag ein.
    var showAnnotations: Bool = false

    @Environment(\.theme) private var theme

    /// Millimeter pro Sekunde (Papiervorschub).
    private let mmPerSecond: Double = 25
    /// Millimeter pro Millivolt (Amplitudeneichung).
    private let mmPerMv: Double = 10

    var body: some View {
        Canvas { context, size in
            let durationS = trace.durationMs / 1000
            guard durationS > 0, !trace.values.isEmpty else { return }

            // Punkte pro Millimeter so wählen, dass der Streifen exakt passt.
            let pxPerMm = size.width / (durationS * mmPerSecond)
            let midY = size.height / 2

            drawGrid(&context, size: size, pxPerMm: pxPerMm)

            var path = Path()
            for (index, value) in trace.values.enumerated() {
                let t = Double(index) / trace.sampleRateHz
                let x = t * mmPerSecond * pxPerMm
                let y = midY - value * mmPerMv * pxPerMm
                let point = CGPoint(x: x, y: y)
                if index == 0 { path.move(to: point) } else { path.addLine(to: point) }
            }
            context.stroke(path, with: .color(traceColor),
                           style: StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round))

            if showAnnotations, let annotation = trace.annotation {
                var ctx = context
                drawAnnotations(&ctx, annotation, size: size, pxPerMm: pxPerMm, midY: midY)
            }
        }
        .frame(height: height)
        .background(paperColor, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(theme.separator, lineWidth: theme.borderWidth > 0 ? theme.borderWidth : 0.5)
        }
        .accessibilityLabel("EKG-Streifen, \(Int(trace.durationMs / 1000)) Sekunden")
    }

    /// Beschriftet einen Schlag: P, QRS und T sowie die Strecken PQ und QT.
    private func drawAnnotations(_ ctx: inout GraphicsContext, _ a: EcgWaveform.BeatAnnotation,
                                 size: CGSize, pxPerMm: Double, midY: Double) {
        // Zeit (ms) → x im Streifen.
        func x(_ ms: Double) -> Double { ms / 1000 * mmPerSecond * pxPerMm }

        func marker(_ ms: Double, _ label: String, above: Bool) {
            let px = x(ms)
            guard px > 4, px < size.width - 4 else { return }
            var line = Path()
            let yTop = above ? 14.0 : midY + 26
            let yBottom = above ? midY - 26 : size.height - 14
            line.move(to: CGPoint(x: px, y: yTop))
            line.addLine(to: CGPoint(x: px, y: yBottom))
            ctx.stroke(line, with: .color(annotationColor.opacity(0.6)),
                       style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
            let text = ctx.resolve(Text(label).font(.caption2.weight(.bold))
                .foregroundStyle(annotationColor))
            ctx.draw(text, at: CGPoint(x: px, y: above ? 8 : size.height - 8), anchor: .center)
        }

        /// Klammer mit Beschriftung für eine Zeitstrecke.
        func span(_ fromMs: Double, _ toMs: Double, _ label: String, y: Double) {
            let x0 = x(fromMs), x1 = x(toMs)
            guard x1 > x0, x0 > 2, x1 < size.width - 2 else { return }
            var bracket = Path()
            bracket.move(to: CGPoint(x: x0, y: y - 5))
            bracket.addLine(to: CGPoint(x: x0, y: y))
            bracket.addLine(to: CGPoint(x: x1, y: y))
            bracket.addLine(to: CGPoint(x: x1, y: y - 5))
            ctx.stroke(bracket, with: .color(annotationColor), lineWidth: 1.4)
            let text = ctx.resolve(Text(label).font(.caption2.weight(.semibold))
                .foregroundStyle(annotationColor))
            ctx.draw(text, at: CGPoint(x: (x0 + x1) / 2, y: y + 9), anchor: .center)
        }

        if let p = a.pPeak { marker(p, "P", above: true) }
        marker(a.rPeak, "QRS", above: true)
        marker(a.tPeak, "T", above: true)

        if let s = a.pqStart, let e = a.pqEnd {
            span(s, e, "PQ", y: size.height - 34)
        }
        span(a.qtStart, a.qtEnd, "QT", y: size.height - 16)
    }

    private var annotationColor: Color {
        theme.highContrast ? .white : Color(red: 0.55, green: 0.78, blue: 1.0)
    }

    /// 1-mm-Feinraster und 5-mm-Grobraster wie auf EKG-Papier.
    private func drawGrid(_ context: inout GraphicsContext, size: CGSize, pxPerMm: Double) {
        func lines(step: Double, color: Color, width: Double) {
            var path = Path()
            var x = 0.0
            while x <= size.width {
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))
                x += step
            }
            var y = 0.0
            while y <= size.height {
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: size.width, y: y))
                y += step
            }
            context.stroke(path, with: .color(color), lineWidth: width)
        }

        lines(step: pxPerMm, color: fineGrid, width: 0.4)
        lines(step: pxPerMm * 5, color: coarseGrid, width: 0.8)
    }

    private var paperColor: Color {
        theme.highContrast ? .black : Color(red: 0.11, green: 0.12, blue: 0.14)
    }

    private var fineGrid: Color {
        theme.highContrast ? Color(white: 0.30) : Color(red: 0.85, green: 0.33, blue: 0.33).opacity(0.18)
    }

    private var coarseGrid: Color {
        theme.highContrast ? Color(white: 0.45) : Color(red: 0.85, green: 0.33, blue: 0.33).opacity(0.34)
    }

    private var traceColor: Color {
        theme.highContrast ? Color(red: 0.4, green: 1.0, blue: 0.5) : Color(red: 0.35, green: 0.95, blue: 0.55)
    }
}
