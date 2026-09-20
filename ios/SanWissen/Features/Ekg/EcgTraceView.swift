import SwiftUI

/// Zeichnet einen EKG-Streifen auf Millimeterpapier-Raster — Entsprechung zu
/// src/modules/ekg/EkgTrace.tsx, hier mit SwiftUI-`Canvas` statt SVG.
///
/// Maßstab wie üblich: 25 mm/s waagerecht, 10 mm/mV senkrecht. Beim Umschalten
/// auf einen einzelnen Komplex bleibt das Raster quadratisch, der Maßstab gilt
/// also weiter — es wird nur ein kürzerer Ausschnitt gezeigt.
struct EcgTraceView: View {
    let trace: EcgWaveform.Trace
    var height: CGFloat = 170
    /// Blendet P/QRS/T sowie PQ- und QT-Strecke an einem Schlag ein.
    var showAnnotations: Bool = false
    /// Bietet den Wechsel auf einen einzelnen PQRST-Komplex an.
    var allowsZoom: Bool = true

    @Environment(\.theme) private var theme
    @State private var zoomed = false

    /// Millimeter pro Sekunde (Papiervorschub).
    private let mmPerSecond: Double = 25
    /// Millimeter pro Millivolt (Amplitudeneichung).
    private let mmPerMv: Double = 10

    /// Der gezeigte Zeitausschnitt.
    private struct Window {
        let startMs: Double
        let durationMs: Double
    }

    /// Zoom gibt es nur, wo ein Komplex abgrenzbar ist. Bei Kammerflimmern,
    /// Kammerflattern und Asystole fehlt die Beschriftung und damit der Bezug.
    private var canZoom: Bool { allowsZoom && trace.annotation != nil }

    private var isZoomed: Bool { zoomed && canZoom }

    /// Im Zoom deutlich höher. Das Raster bleibt quadratisch, deshalb braucht
    /// die R-Zacke mit wachsender Vergrößerung mehr Platz nach oben — ohne die
    /// zusätzliche Höhe ließe sich kaum heranzoomen.
    private var boxHeight: CGFloat { isZoomed ? height + 120 : height }

    var body: some View {
        Canvas { context, size in
            guard trace.durationMs > 0, !trace.values.isEmpty else { return }
            let window = self.window(for: size)
            let pxPerMm = size.width / (window.durationMs / 1000 * mmPerSecond)
            if isZoomed, abs(shownSeconds - window.durationMs / 1000) > 0.02 {
                DispatchQueue.main.async { shownSeconds = window.durationMs / 1000 }
            }
            let midY = size.height / 2

            drawGrid(&context, size: size, pxPerMm: pxPerMm)

            /// Zeit in Millisekunden ab Streifenbeginn → x im Ausschnitt.
            func x(_ ms: Double) -> Double {
                (ms - window.startMs) / 1000 * mmPerSecond * pxPerMm
            }

            var path = Path()
            var started = false
            for (index, value) in trace.values.enumerated() {
                let ms = Double(index) / trace.sampleRateHz * 1000
                // Einen Abtastwert über den Rand hinaus mitnehmen, damit die
                // Kurve nicht sichtbar am Bildrand abbricht.
                let margin = 1000 / trace.sampleRateHz
                guard ms >= window.startMs - margin,
                      ms <= window.startMs + window.durationMs + margin else { continue }
                let point = CGPoint(x: x(ms), y: midY - value * mmPerMv * pxPerMm)
                if started { path.addLine(to: point) } else { path.move(to: point); started = true }
            }
            context.stroke(path, with: .color(traceColor),
                           style: StrokeStyle(lineWidth: isZoomed ? 2.1 : 1.6,
                                              lineCap: .round, lineJoin: .round))

            if showAnnotations, let annotation = trace.annotation {
                var ctx = context
                drawAnnotations(&ctx, annotation, size: size, x: x, midY: midY)
            }
        }
        .frame(height: boxHeight)
        .background(paperColor, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .strokeBorder(theme.separator, lineWidth: theme.borderWidth > 0 ? theme.borderWidth : 0.5)
        }
        .overlay(alignment: .bottomLeading) { scaleNote }
        .overlay(alignment: .bottomTrailing) { zoomButton }
        .animation(.easeInOut(duration: 0.2), value: zoomed)
        .accessibilityLabel(isZoomed
            ? "EKG, einzelner Komplex vergrößert"
            : "EKG-Streifen, \(Int(trace.durationMs / 1000)) Sekunden")
    }

    // MARK: - Umschalter

    @ViewBuilder
    private var zoomButton: some View {
        if canZoom {
            Button {
                zoomed.toggle()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: isZoomed
                        ? "arrow.down.right.and.arrow.up.left"
                        : "arrow.up.left.and.arrow.down.right")
                        .font(.system(size: 10, weight: .semibold))
                    Text(isZoomed ? "Streifen" : "Zoom")
                        .font(.system(size: 10, weight: .medium))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(.ultraThinMaterial, in: Capsule())
                .overlay(Capsule().strokeBorder(Color.white.opacity(0.18), lineWidth: 0.5))
                .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
            .padding(8)
            .accessibilityLabel(isZoomed
                ? "Ganzen Streifen zeigen"
                : "Einzelnen Komplex vergrößern")
        }
    }

    /// Nennt im Zoom die gezeigte Zeitspanne und die Eichung, damit der
    /// Ausschnitt einzuordnen bleibt.
    @ViewBuilder
    private var scaleNote: some View {
        if isZoomed {
            Text(String(format: "%.1f s · 25 mm/s · 10 mm/mV", shownSeconds)
                .replacingOccurrences(of: ".", with: ","))
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.55))
                .padding(10)
        }
    }

    /// Die im Zoom gezeigte Zeitspanne. Sie hängt von der Feldbreite ab und
    /// steht erst beim Zeichnen fest, deshalb hier die Schätzung über das
    /// bekannte Seitenverhältnis des Feldes.
    @State private var shownSeconds: Double = 0

    // MARK: - Ausschnitt

    /// Legt fest, welcher Zeitabschnitt gezeigt wird.
    ///
    /// Im Zoom wird der beschriftete Schlag mittig gesetzt. Wie weit sich
    /// vergrößern lässt, entscheidet die Höhe: das Raster bleibt quadratisch,
    /// also wächst mit dem Zoom auch der Platzbedarf der R-Zacke. Passt sie
    /// nicht mehr, wird der Ausschnitt entsprechend breiter gewählt.
    private func window(for size: CGSize) -> Window {
        guard isZoomed, let a = trace.annotation else {
            return Window(startMs: 0, durationMs: trace.durationMs)
        }

        let from = (a.pqStart ?? a.qtStart) - 120
        let to = a.qtEnd + 140
        let centre = (from + to) / 2
        let desiredMs = max(to - from, 600)

        let peak = maxAbsAmplitude(fromMs: from, toMs: to)
        let byWidth = size.width / (desiredMs / 1000 * mmPerSecond)
        let byHeight = (size.height / 2 - 14) / (peak * mmPerMv)
        let pxPerMm = max(min(byWidth, byHeight), 0.1)

        let durationMs = min(size.width / (pxPerMm * mmPerSecond) * 1000, trace.durationMs)
        let start = min(max(centre - durationMs / 2, 0), max(0, trace.durationMs - durationMs))
        return Window(startMs: start, durationMs: durationMs)
    }

    /// Größter Ausschlag im gezeigten Schlag, nach oben oder unten.
    private func maxAbsAmplitude(fromMs: Double, toMs: Double) -> Double {
        let first = max(Int(fromMs / 1000 * trace.sampleRateHz), 0)
        let last = min(Int(toMs / 1000 * trace.sampleRateHz), trace.values.count - 1)
        guard first <= last else { return 1 }
        let peak = trace.values[first...last].reduce(0.0) { max($0, abs($1)) }
        // Nach unten begrenzen, sonst wird ein flacher Schlag grotesk vergrößert.
        return max(peak, 0.5)
    }

    // MARK: - Beschriftung

    /// Beschriftet einen Schlag: P, QRS und T sowie die Strecken PQ und QT.
    private func drawAnnotations(_ ctx: inout GraphicsContext, _ a: EcgWaveform.BeatAnnotation,
                                 size: CGSize, x: (Double) -> Double, midY: Double) {
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
            guard step > 0.7 else { return }
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
