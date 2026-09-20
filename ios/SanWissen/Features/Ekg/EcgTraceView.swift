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
                drawAnnotations(&ctx, annotation, size: size, x: x, midY: midY,
                                pxPerMm: pxPerMm, detailed: isZoomed)
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

        let from = (a.pStart ?? a.qrsStart) - 130
        let to = a.tEnd + 150
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

    /// Beschriftet einen Schlag wie in der Lehrbuchdarstellung: die Zacken
    /// P, Q, R, S und T einzeln, darüber der QRS-Komplex, dazwischen PQ- und
    /// ST-Strecke, darunter PQ- und QT-Intervall.
    ///
    /// Im Streifen ist pro Schlag nur wenig Platz, dort bleibt es bei P, QRS
    /// und T. Die vollständige Beschriftung erscheint im Zoom.
    private func drawAnnotations(_ ctx: inout GraphicsContext, _ a: EcgWaveform.BeatAnnotation,
                                 size: CGSize, x: (Double) -> Double, midY: Double,
                                 pxPerMm: Double, detailed: Bool) {
        /// Bildhöhe der Kurve zu einem Zeitpunkt. Damit sitzen die Buchstaben
        /// an der Zacke statt auf einer festen Linie.
        func traceY(_ ms: Double) -> Double {
            let index = Int((ms / 1000 * trace.sampleRateHz).rounded())
            guard index >= 0, index < trace.values.count else { return midY }
            return midY - trace.values[index] * mmPerMv * pxPerMm
        }

        /// Buchstabe dicht an der Zacke, oberhalb oder unterhalb.
        func letter(_ ms: Double, _ label: String, above: Bool) {
            let px = x(ms)
            guard px > 8, px < size.width - 8 else { return }
            let y = traceY(ms) + (above ? -16 : 16)
            let text = ctx.resolve(Text(label).font(.system(size: detailed ? 15 : 11, weight: .bold))
                .foregroundStyle(waveColor))
            // Oben bleibt Platz für die QRS-Klammer, unten für die Intervalle.
            let top = detailed ? 46.0 : 12.0
            let bottom = detailed ? size.height - 54 : size.height - 12
            ctx.draw(text, at: CGPoint(x: px, y: max(top, min(bottom, y))), anchor: .center)
        }

        /// Klammer über oder unter einer Zeitstrecke, mit Beschriftung.
        func span(_ fromMs: Double, _ toMs: Double, _ label: String,
                  y: Double, color: Color, above: Bool) {
            let x0 = x(fromMs), x1 = x(toMs)
            guard x1 > x0 + 1, x0 > 2, x1 < size.width - 2 else { return }
            let tick = above ? 5.0 : -5.0
            var bracket = Path()
            bracket.move(to: CGPoint(x: x0, y: y + tick))
            bracket.addLine(to: CGPoint(x: x0, y: y))
            bracket.addLine(to: CGPoint(x: x1, y: y))
            bracket.addLine(to: CGPoint(x: x1, y: y + tick))
            ctx.stroke(bracket, with: .color(color), lineWidth: 1.6)
            let text = ctx.resolve(Text(label).font(.system(size: detailed ? 10 : 9, weight: .semibold))
                .foregroundStyle(color))
            ctx.draw(text, at: CGPoint(x: (x0 + x1) / 2, y: above ? y - 8 : y + 9), anchor: .center)
        }

        guard detailed else {
            // Kompakte Fassung für den Streifen.
            func marker(_ ms: Double, _ label: String) {
                let px = x(ms)
                guard px > 4, px < size.width - 4 else { return }
                var line = Path()
                line.move(to: CGPoint(x: px, y: 14))
                line.addLine(to: CGPoint(x: px, y: midY - 26))
                ctx.stroke(line, with: .color(waveColor.opacity(0.6)),
                           style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
                let text = ctx.resolve(Text(label).font(.caption2.weight(.bold))
                    .foregroundStyle(waveColor))
                ctx.draw(text, at: CGPoint(x: px, y: 8), anchor: .center)
            }
            if let p = a.pPeak { marker(p, "P") }
            marker(a.rPeak, "QRS")
            marker(a.tPeak, "T")
            if let from = a.pqIntervalStart {
                span(from, a.qrsStart, "PQ", y: size.height - 34, color: pqIntervalColor, above: false)
            }
            span(a.qtStart, a.qtEnd, "QT", y: size.height - 16, color: qtIntervalColor, above: false)
            return
        }

        // Zacken einzeln benennen. Q und S zeigen nach unten, deshalb darunter.
        if let p = a.pPeak { letter(p, "P", above: true) }
        letter(a.qPeak, "Q", above: false)
        letter(a.rPeak, "R", above: true)
        letter(a.sPeak, "S", above: false)
        letter(a.tPeak, "T", above: true)

        // QRS-Komplex über der R-Zacke.
        span(a.qrsStart, a.qrsEnd, "QRS-Komplex", y: 26, color: qrsColor, above: true)

        // Strecken auf halber Höhe zwischen Grundlinie und Zacken.
        // Versetzt übereinander: bei schneller Herzfrequenz liegen die beiden
        // Strecken so dicht beieinander, dass sich die Beschriftungen sonst
        // überlagern.
        if let from = a.pqSegmentStart {
            span(from, a.qrsStart, "PQ-Strecke", y: midY - 78, color: pqSegmentColor, above: true)
        }
        span(a.stSegmentStart, a.tStart, "ST-Strecke", y: midY - 44, color: stSegmentColor, above: true)

        // Intervalle unten, wie in der Lehrbuchdarstellung.
        if let from = a.pqIntervalStart {
            span(from, a.qrsStart, "PQ-Intervall", y: size.height - 40, color: pqIntervalColor, above: false)
        }
        span(a.qtStart, a.qtEnd, "QT-Intervall", y: size.height - 16, color: qtIntervalColor, above: false)
    }

    // Farben der Beschriftung. Im Hoher-Kontrast-Modus alles weiß, sonst je
    // Element eine eigene Farbe wie in der Lehrbuchdarstellung.
    private var waveColor: Color { theme.highContrast ? .white : Color(white: 0.96) }
    private var qrsColor: Color { theme.highContrast ? .white : Color(red: 1.0, green: 0.42, blue: 0.48) }
    private var pqSegmentColor: Color { theme.highContrast ? .white : Color(red: 0.42, green: 0.88, blue: 0.52) }
    private var stSegmentColor: Color { theme.highContrast ? .white : Color(red: 0.76, green: 0.58, blue: 1.0) }
    private var pqIntervalColor: Color { theme.highContrast ? .white : Color(red: 1.0, green: 0.66, blue: 0.32) }
    private var qtIntervalColor: Color { theme.highContrast ? .white : Color(red: 0.45, green: 0.68, blue: 1.0) }

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
