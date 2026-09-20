import Foundation

/// Synthetischer EKG-Kurvengenerator — 1:1-Port von src/modules/ekg/waveform.ts.
///
/// Die erzeugten Kurven sind stilisierte, parametrische Annäherungen an reale
/// EKG-Morphologien (Summe von Gauß-Kurven für P/Q/R/S/T). Sie sollen
/// Rhythmus-Muster (Regelmäßigkeit, Frequenz, P-Wellen-Beziehung, QRS-Breite)
/// zuverlässig erkennbar machen — sie sind KEINE kalibrierten, klinisch
/// exakten Reproduktionen einzelner Patienten-EKGs.
enum EcgWaveform {

    struct Trace {
        let values: [Double] // mV
        let sampleRateHz: Double
        let durationMs: Double
        /// Lage der Wellen eines repräsentativen Schlages, für die Beschriftung
        /// im Streifen. Nil bei Rhythmen ohne abgrenzbare Komplexe
        /// (Kammerflimmern, Asystole, Kammerflattern).
        let annotation: BeatAnnotation?
    }

    /// Zeitpunkte in Millisekunden ab Streifenbeginn.
    struct BeatAnnotation {
        let pPeak: Double?
        let rPeak: Double
        let tPeak: Double
        /// PQ-Zeit: Beginn der P-Welle bis Beginn des QRS.
        let pqStart: Double?
        let pqEnd: Double?
        /// QT-Zeit: Beginn des QRS bis Ende der T-Welle.
        let qtStart: Double
        let qtEnd: Double
    }

    private struct BeatMorphology {
        var hasP: Bool
        var pAmp: Double
        var pWidth: Double
        var pOffset: Double // ms relativ zur R-Zacke (negativ = davor)
        var qAmp: Double
        var qWidth: Double
        var qOffset: Double
        var rAmp: Double
        var rWidth: Double
        var sAmp: Double
        var sWidth: Double
        var sOffset: Double
        var tAmp: Double
        var tWidth: Double
        var tOffset: Double
        /// Additive Plateau-Verschiebung zwischen S und T (ST-Hebung/-Senkung).
        var stShiftMv: Double
    }

    private struct Beat {
        let tMs: Double
        let morph: BeatMorphology
    }

    private static let normalNarrow = BeatMorphology(
        hasP: true, pAmp: 0.15, pWidth: 18, pOffset: -160,
        qAmp: -0.12, qWidth: 8, qOffset: -25,
        rAmp: 1.2, rWidth: 9,
        sAmp: -0.28, sWidth: 12, sOffset: 28,
        tAmp: 0.32, tWidth: 45, tOffset: 195,
        stShiftMv: 0)

    private static let wideBizarre = BeatMorphology(
        hasP: false, pAmp: 0, pWidth: 1, pOffset: 0,
        qAmp: -0.05, qWidth: 10, qOffset: -60,
        rAmp: 1.4, rWidth: 45,
        sAmp: -0.9, sWidth: 35, sOffset: 55,
        tAmp: -0.45, tWidth: 90, tOffset: 220,
        stShiftMv: 0)

    // MARK: - Bausteine

    private static func gaussian(_ t: Double, _ amp: Double, _ center: Double, _ width: Double) -> Double {
        amp * exp(-pow(t - center, 2) / (2 * width * width))
    }

    private static func stPlateau(_ tRel: Double, _ shiftMv: Double, _ startMs: Double, _ endMs: Double) -> Double {
        guard shiftMv != 0 else { return 0 }
        let edge = 8.0 // ms Übergangsweichzeichnung
        let rise = 1 / (1 + exp(-(tRel - startMs) / edge))
        let fall = 1 / (1 + exp((tRel - endMs) / edge))
        return shiftMv * rise * fall
    }

    private static func beatValue(_ tRel: Double, _ m: BeatMorphology) -> Double {
        var v = 0.0
        if m.hasP { v += gaussian(tRel, m.pAmp, m.pOffset, m.pWidth) }
        v += gaussian(tRel, m.qAmp, m.qOffset, m.qWidth)
        v += gaussian(tRel, m.rAmp, 0, m.rWidth)
        v += gaussian(tRel, m.sAmp, m.sOffset, m.sWidth)
        v += gaussian(tRel, m.tAmp, m.tOffset, m.tWidth)
        v += stPlateau(tRel, m.stShiftMv, m.sOffset + 15, m.tOffset - 30)
        return v
    }

    /// QT-Dauer skaliert mit der Zykluslänge (kürzerer Zyklus → kürzeres T).
    private static func qtScale(forCycleMs cycleMs: Double) -> Double {
        min(1.3, max(0.65, cycleMs / 800))
    }

    private static func scaled(_ base: BeatMorphology, cycleMs: Double) -> BeatMorphology {
        let s = qtScale(forCycleMs: cycleMs)
        var m = base
        m.tOffset = base.tOffset * s
        m.tWidth = base.tWidth * s
        return m
    }

    private static func rand(_ min: Double, _ max: Double) -> Double {
        Double.random(in: min...Swift.max(min, max))
    }

    /// Box-Muller-Transformation — wie im TypeScript-Original.
    private static func gaussianNoise(_ amp: Double) -> Double {
        let u1 = Swift.max(Double.random(in: 0..<1), 1e-9)
        let u2 = Double.random(in: 0..<1)
        return sqrt(-2 * log(u1)) * cos(2 * .pi * u2) * amp
    }

    /// Rendert eine Liste von (Zeit, Morphologie)-Schlägen in ein Sample-Array.
    /// `pOnlyBeats` legt zusätzlich isolierte P-Wellen darüber — nötig für
    /// AV-Blöcke, bei denen P-Wellen ohne zugehörigen QRS auftreten.
    private static func renderBeats(_ beats: [Beat],
                                    pOnlyBeats: [Beat]?,
                                    durationMs: Double,
                                    sampleRateHz: Double,
                                    baselineNoise: Double = 0.012) -> [Double] {
        let dt = 1000 / sampleRateHz
        let n = Int(durationMs / dt)
        guard n > 0 else { return [] }
        var out = [Double](repeating: 0, count: n)

        for i in 0..<n {
            let t = Double(i) * dt
            var v = 0.0
            if var nearest = beats.first {
                var bestDist = Double.infinity
                for b in beats {
                    let d = abs(t - b.tMs)
                    if d < bestDist {
                        bestDist = d
                        nearest = b
                    }
                }
                v = beatValue(t - nearest.tMs, nearest.morph)
            }
            if let pOnly = pOnlyBeats, var nearestP = pOnly.first {
                var bestPDist = Double.infinity
                for b in pOnly {
                    let d = abs(t - b.tMs)
                    if d < bestPDist {
                        bestPDist = d
                        nearestP = b
                    }
                }
                v += gaussian(t - nearestP.tMs, nearestP.morph.pAmp, nearestP.morph.pOffset, nearestP.morph.pWidth)
            }
            out[i] = v + gaussianNoise(baselineNoise)
        }
        return out
    }

    private static func regularRPeaks(hr: ClosedRange<Double>, durationMs: Double, jitterPct: Double = 0.02) -> [Double] {
        var peaks: [Double] = []
        var t = rand(50, 200)
        let targetHr = rand(hr.lowerBound, hr.upperBound)
        let baseRr = 60000 / targetHr
        while t < durationMs {
            peaks.append(t)
            t += baseRr * (1 + rand(-jitterPct, jitterPct))
        }
        return peaks
    }

    // MARK: - Generatoren je Rhythmustyp
    //
    // Generatoren mit abgrenzbaren Komplexen geben die Schlagliste mit zurück,
    // damit der Streifen später P/QRS/T exakt beschriften kann statt zu raten.

    private static func regularNarrow(hr: ClosedRange<Double>, prMs: Double?, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var prevT: Double?
        let beats = regularRPeaks(hr: hr, durationMs: durationMs).map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? 800
            prevT = tMs
            var morph = scaled(normalNarrow, cycleMs: cycle)
            if let prMs { morph.pOffset = -prMs }
            return Beat(tMs: tMs, morph: morph)
        }
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr), beats)
    }

    private static func sinusArrhythmia(hr: ClosedRange<Double>, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var peaks: [Double] = []
        var t = rand(50, 200)
        let midHr = (hr.lowerBound + hr.upperBound) / 2
        let baseRr = 60000 / midHr
        let swing = ((60000 / hr.lowerBound - 60000 / hr.upperBound) / 2) * 0.7
        var phase = 0.0
        while t < durationMs {
            peaks.append(t)
            phase += 0.9
            t += baseRr + sin(phase) * swing
        }
        var prevT: Double?
        let beats = peaks.map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? baseRr
            prevT = tMs
            return Beat(tMs: tMs, morph: scaled(normalNarrow, cycleMs: cycle))
        }
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr), beats)
    }

    private static func irregularNarrowNoP(hr: ClosedRange<Double>, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var peaks: [Double] = []
        var t = rand(50, 200)
        while t < durationMs {
            peaks.append(t)
            t += 60000 / rand(hr.lowerBound, hr.upperBound)
        }
        var prevT: Double?
        let beats = peaks.map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? 800
            prevT = tMs
            var morph = scaled(normalNarrow, cycleMs: cycle)
            morph.hasP = false
            return Beat(tMs: tMs, morph: morph)
        }
        let base = renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr, baselineNoise: 0.008)
        // Flimmerwellen: Summe schneller, unregelmäßiger Mini-Oszillationen statt P-Welle
        let dt = 1000 / sr
        let values = base.enumerated().map { i, v -> Double in
            let t = Double(i) * dt
            var fib = 0.0
            for h in 0..<4 {
                fib += sin(2 * .pi * (7 + Double(h) * 2.3) * t / 1000 + Double(h)) * 0.03
            }
            return v + fib
        }
        return (values, beats)
    }

    private static func flutter(atrialRate: Double, conduction: Int, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        let dt = 1000 / sr
        let n = Int(durationMs / dt)
        guard n > 0 else { return ([], []) }
        let atrialRr = 60000 / atrialRate
        let qrsInterval = atrialRr * Double(conduction)

        var qrsPeaks: [Double] = []
        var t = qrsInterval
        while t < durationMs {
            qrsPeaks.append(t)
            t += qrsInterval
        }
        var prevT: Double?
        let beats = qrsPeaks.map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? qrsInterval
            prevT = tMs
            var m = scaled(normalNarrow, cycleMs: cycle)
            m.hasP = false
            return Beat(tMs: tMs, morph: m)
        }
        let qrsTrace = renderBeats(beats.isEmpty ? [Beat(tMs: -9999, morph: normalNarrow)] : beats,
                                   pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr, baselineNoise: 0)
        var out = [Double](repeating: 0, count: n)
        for i in 0..<n {
            let t = Double(i) * dt
            // Sägezahn-Flatterwellen
            let phase = (t.truncatingRemainder(dividingBy: atrialRr) / atrialRr) * 2 * .pi
            let saw = 0.18 * (sin(phase) + 0.4 * sin(2 * phase))
            out[i] = saw + (i < qrsTrace.count ? qrsTrace[i] : 0) + gaussianNoise(0.01)
        }
        return (out, beats)
    }

    private static func regularWide(hr: ClosedRange<Double>, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        let beats = regularRPeaks(hr: hr, durationMs: durationMs, jitterPct: 0.015)
            .map { Beat(tMs: $0, morph: wideBizarre) }
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr, baselineNoise: 0.01), beats)
    }

    private static func ventricularFlutter(rate: Double, _ durationMs: Double, _ sr: Double) -> [Double] {
        let dt = 1000 / sr
        let n = Int(durationMs / dt)
        guard n > 0 else { return [] }
        let f = rate / 60 // Hz
        return (0..<n).map { i in
            1.1 * sin(2 * .pi * f * (Double(i) * dt / 1000)) + gaussianNoise(0.03)
        }
    }

    private static func fibrillation(coarse: Bool, _ durationMs: Double, _ sr: Double) -> [Double] {
        let dt = 1000 / sr
        let n = Int(durationMs / dt)
        guard n > 0 else { return [] }
        let amp = coarse ? 0.55 : 0.18
        let freqs = [3.4, 4.7, 5.9, 7.1, 8.3, 9.6].map { $0 + rand(-0.4, 0.4) }
        let phases = freqs.map { _ in rand(0, .pi * 2) }
        var out = [Double](repeating: 0, count: n)
        var drift = 0.0
        for i in 0..<n {
            let t = Double(i) * dt
            var v = 0.0
            for (idx, f) in freqs.enumerated() {
                v += sin(2 * .pi * f * (t / 1000) + phases[idx]) / Double(freqs.count)
            }
            drift += gaussianNoise(0.02)
            drift *= 0.98
            out[i] = v * amp + drift
        }
        return out
    }

    private static func flatline(_ durationMs: Double, _ sr: Double) -> [Double] {
        let dt = 1000 / sr
        let n = Int(durationMs / dt)
        guard n > 0 else { return [] }
        var drift = 0.0
        return (0..<n).map { _ in
            drift += gaussianNoise(0.004)
            drift *= 0.9
            return drift
        }
    }

    private static func avBlock1(hr: ClosedRange<Double>, prMs: Double, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var prevT: Double?
        let beats = regularRPeaks(hr: hr, durationMs: durationMs).map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? 800
            prevT = tMs
            var m = scaled(normalNarrow, cycleMs: cycle)
            m.pOffset = -prMs
            return Beat(tMs: tMs, morph: m)
        }
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr), beats)
    }

    private static func wenckebach(atrialRate: Double, prStartMs: Double, prIncrementMs: Double,
                                   groupSize: Int, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        let atrialRr = 60000 / atrialRate
        var pPeaks: [Double] = []
        var t = rand(50, 150)
        while t < durationMs {
            pPeaks.append(t)
            t += atrialRr
        }

        var qrsBeats: [Beat] = []
        var pOnlyTimes: [Double] = []
        var groupIdx = 0
        for pT in pPeaks {
            let isDropped = groupIdx == groupSize - 1
            let pr = prStartMs + Double(groupIdx) * prIncrementMs
            pOnlyTimes.append(pT)
            if isDropped {
                // Blockierte P-Welle: keine Überleitung, Gruppe beginnt von vorn.
                groupIdx = 0
            } else {
                var m = scaled(normalNarrow, cycleMs: atrialRr)
                m.pOffset = -pr
                qrsBeats.append(Beat(tMs: pT + pr, morph: m))
                groupIdx += 1
            }
        }
        if qrsBeats.isEmpty { qrsBeats.append(Beat(tMs: -9999, morph: normalNarrow)) }

        var pMorph = normalNarrow
        pMorph.pOffset = 0
        let pOnly = pOnlyTimes.map { Beat(tMs: $0, morph: pMorph) }
        return (renderBeats(qrsBeats, pOnlyBeats: pOnly, durationMs: durationMs, sampleRateHz: sr), qrsBeats)
    }

    private static func mobitzII(atrialRate: Double, prMs: Double, conduction: Int,
                                 _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        let atrialRr = 60000 / atrialRate
        var pPeaks: [Double] = []
        var t = rand(50, 150)
        while t < durationMs {
            pPeaks.append(t)
            t += atrialRr
        }
        var pMorph = normalNarrow
        pMorph.pOffset = 0

        var qrsBeats: [Beat] = []
        var pOnly: [Beat] = []
        for (idx, pT) in pPeaks.enumerated() {
            pOnly.append(Beat(tMs: pT, morph: pMorph))
            // Nur jede n-te P-Welle wird übergeleitet — PR bleibt dabei konstant.
            if idx % conduction == conduction - 1 {
                var m = scaled(normalNarrow, cycleMs: atrialRr * Double(conduction))
                m.pOffset = -prMs
                qrsBeats.append(Beat(tMs: pT + prMs, morph: m))
            }
        }
        if qrsBeats.isEmpty { qrsBeats.append(Beat(tMs: -9999, morph: normalNarrow)) }
        return (renderBeats(qrsBeats, pOnlyBeats: pOnly, durationMs: durationMs, sampleRateHz: sr), qrsBeats)
    }

    private static func avBlock3(atrialRate: Double, ventricularRate: Double, wideEscape: Bool,
                                 _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        let atrialRr = 60000 / atrialRate
        let ventRr = 60000 / ventricularRate
        var pPeaks: [Double] = []
        var t = rand(50, 150)
        while t < durationMs {
            pPeaks.append(t)
            t += atrialRr
        }
        var qrsPeaks: [Double] = []
        var tv = rand(150, 350)
        while tv < durationMs {
            qrsPeaks.append(tv)
            tv += ventRr
        }
        var pMorph = normalNarrow
        pMorph.pOffset = 0
        let morph = wideEscape ? wideBizarre : normalNarrow
        let beats = qrsPeaks.map { Beat(tMs: $0, morph: morph) }
        return (renderBeats(beats,
                            pOnlyBeats: pPeaks.map { Beat(tMs: $0, morph: pMorph) },
                            durationMs: durationMs, sampleRateHz: sr), beats)
    }

    private static func ectopicBeat(hr: ClosedRange<Double>, every: Int, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var prevT: Double?
        var beats: [Beat] = []
        var normalBeats: [Beat] = []
        for (idx, tMs) in regularRPeaks(hr: hr, durationMs: durationMs).enumerated() {
            let cycle = prevT.map { tMs - $0 } ?? 800
            prevT = tMs
            if (idx + 1) % every == 0 {
                // Vorzeitiger, bizarrer ventrikulärer Schlag + kompensatorische Pause
                beats.append(Beat(tMs: tMs - 120, morph: wideBizarre))
            } else {
                let beat = Beat(tMs: tMs, morph: scaled(normalNarrow, cycleMs: cycle))
                beats.append(beat)
                normalBeats.append(beat)
            }
        }
        // Beschriftet wird ein normaler Schlag, nicht die Extrasystole.
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr), normalBeats)
    }

    private static func stShift(hr: ClosedRange<Double>, shiftMv: Double, _ durationMs: Double, _ sr: Double) -> ([Double], [Beat]) {
        var prevT: Double?
        let beats = regularRPeaks(hr: hr, durationMs: durationMs).map { tMs -> Beat in
            let cycle = prevT.map { tMs - $0 } ?? 800
            prevT = tMs
            var m = scaled(normalNarrow, cycleMs: cycle)
            m.stShiftMv = shiftMv
            return Beat(tMs: tMs, morph: m)
        }
        return (renderBeats(beats, pOnlyBeats: nil, durationMs: durationMs, sampleRateHz: sr), beats)
    }

    /// Wählt einen gut sichtbaren Schlag (möglichst der zweite, damit der
    /// Streifenanfang nicht hineinragt) und rechnet daraus die Lage der Wellen.
    private static func annotation(from beats: [Beat], durationMs: Double) -> BeatAnnotation? {
        let usable = beats.filter { $0.tMs > 400 && $0.tMs < durationMs - 600 }
        guard let beat = usable.first ?? beats.first(where: { $0.tMs > 0 }) else { return nil }
        let m = beat.morph
        return BeatAnnotation(
            pPeak: m.hasP ? beat.tMs + m.pOffset : nil,
            rPeak: beat.tMs,
            tPeak: beat.tMs + m.tOffset,
            pqStart: m.hasP ? beat.tMs + m.pOffset - m.pWidth * 2 : nil,
            pqEnd: m.hasP ? beat.tMs + m.qOffset - m.qWidth : nil,
            qtStart: beat.tMs + m.qOffset - m.qWidth,
            qtEnd: beat.tMs + m.tOffset + m.tWidth * 2)
    }

    // MARK: - Einstieg

    static func generate(_ spec: RhythmGenSpec, durationMs: Double = 8000, sampleRateHz: Double = 250) -> Trace {
        let values: [Double]
        var beats: [Beat] = []

        switch spec {
        case let .regularNarrow(hr, prMs):
            (values, beats) = regularNarrow(hr: hr, prMs: prMs, durationMs, sampleRateHz)
        case let .sinusArrhythmia(hr):
            (values, beats) = sinusArrhythmia(hr: hr, durationMs, sampleRateHz)
        case let .irregularNarrowNoP(hr):
            (values, beats) = irregularNarrowNoP(hr: hr, durationMs, sampleRateHz)
        case let .flutter(atrialRate, conduction):
            (values, beats) = flutter(atrialRate: atrialRate, conduction: conduction, durationMs, sampleRateHz)
        case let .regularWide(hr):
            (values, beats) = regularWide(hr: hr, durationMs, sampleRateHz)
        case let .ventricularFlutter(rate):
            values = ventricularFlutter(rate: rate, durationMs, sampleRateHz)
        case let .fibrillation(coarse):
            values = fibrillation(coarse: coarse, durationMs, sampleRateHz)
        case .flatline:
            values = flatline(durationMs, sampleRateHz)
        case let .avBlock1(hr, prMs):
            (values, beats) = avBlock1(hr: hr, prMs: prMs, durationMs, sampleRateHz)
        case let .avBlock2Wenckebach(atrialRate, prStartMs, prIncrementMs, groupSize):
            (values, beats) = wenckebach(atrialRate: atrialRate, prStartMs: prStartMs,
                                         prIncrementMs: prIncrementMs, groupSize: groupSize, durationMs, sampleRateHz)
        case let .avBlock2Mobitz2(atrialRate, prMs, conduction):
            (values, beats) = mobitzII(atrialRate: atrialRate, prMs: prMs, conduction: conduction, durationMs, sampleRateHz)
        case let .avBlock3(atrialRate, ventricularRate, wideEscape):
            (values, beats) = avBlock3(atrialRate: atrialRate, ventricularRate: ventricularRate,
                                       wideEscape: wideEscape, durationMs, sampleRateHz)
        case let .ectopicBeat(hr, every):
            (values, beats) = ectopicBeat(hr: hr, every: every, durationMs, sampleRateHz)
        case let .stElevation(hr, elevationMv):
            (values, beats) = stShift(hr: hr, shiftMv: elevationMv, durationMs, sampleRateHz)
        case let .stDepression(hr, depressionMv):
            (values, beats) = stShift(hr: hr, shiftMv: -depressionMv, durationMs, sampleRateHz)
        }

        return Trace(values: values, sampleRateHz: sampleRateHz, durationMs: durationMs,
                     annotation: annotation(from: beats, durationMs: durationMs))
    }
}
