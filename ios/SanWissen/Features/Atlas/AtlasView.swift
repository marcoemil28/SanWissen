import SwiftUI

/// Der interaktive 3D-Anatomieatlas.
///
/// Aufbau und Bedienung folgen der Vorlage: Systemliste links, Suche oben,
/// Blickrichtungen rechts, Explosionsregler unten, Inspektor bei Auswahl.
/// Auf dem iPhone liegen die Bedienfelder als Karten über der Szene, weil
/// nebeneinander kein Platz ist.
struct AtlasView: View {
    @Environment(\.theme) private var theme
    @Environment(\.horizontalSizeClass) private var sizeClass
    @State private var model = AtlasModel()
    @State private var showsSystems = false

    /// Kopfzeile und untere Bedienfelder, auf zwei Arten vermessen: als
    /// Kante im gemeinsamen Koordinatenraum und als reine Höhe.
    ///
    /// Beides ist nötig, weil je nach Gerät die eine oder andere Messung zu
    /// klein ausfällt. Auf dem iPhone läuft die Szene unter der Tab-Leiste
    /// hindurch, dort stimmt die Kante. Im iPad-Split-View liegt das
    /// Rechteck der Szene gegenüber den Bedienfeldern versetzt, dort stimmt
    /// die Höhe. `applyLayout` nimmt jeweils den größeren Wert; zu viel
    /// Rand kostet nur etwas Modellgröße, zu wenig schneidet die Füße ab.
    @State private var topChromeMaxY: CGFloat = 0
    @State private var bottomChromeMinY: CGFloat = 0
    @State private var topChromeHeight: CGFloat = 0
    @State private var bottomChromeHeight: CGFloat = 0
    /// Anteil der Szene, der unter den Bedienfeldern hindurchläuft.
    @State private var bottomInset: CGFloat = 0
    /// Waagerecht dasselbe: rechte Kante der Systemliste (nur iPad) und
    /// linke Kante der Blickrichtungen.
    @State private var leftChromeMaxX: CGFloat = 0
    @State private var rightChromeMinX: CGFloat = 0
    @State private var sceneFrame: CGRect = .zero

    private static let space = "atlas"

    private var isCompact: Bool { sizeClass == .compact }

    /// Ob die Systemliste neben der Szene steht oder über eine Taste als
    /// Blatt aufgeht.
    ///
    /// Die Größenklasse allein genügt dafür nicht: im iPad-Split-View ist
    /// die Detailspalte zwar „regular", aber oft nur gut 500 Punkt breit.
    /// Die 232 Punkt breite Liste nähme davon fast die Hälfte und läge über
    /// dem Körper. Deshalb entscheidet die gemessene Breite.
    private var usesSidePanel: Bool { !isCompact && sceneFrame.width >= 700 }

    var body: some View {
        ZStack {
            theme.pageBackground.ignoresSafeArea()

            // Über GeometryReader, weil die eingebettete Ansicht beim ersten
            // Aufbau noch keine Größe hat. Ohne die tatsächliche Größe rechnet
            // das Raster mit dem falschen Seitenverhältnis und wird zu breit.
            GeometryReader { geo in
                let frame = geo.frame(in: .named(Self.space))
                let inset = geo.safeAreaInsets.bottom
                AtlasSceneView(model: model)
                    .onAppear { sceneFrame = frame; bottomInset = inset; applyLayout() }
                    .onChange(of: frame) { _, new in sceneFrame = new; applyLayout() }
                    .onChange(of: inset) { _, new in bottomInset = new; applyLayout() }
            }
            .ignoresSafeArea(edges: .bottom)

            VStack(spacing: 0) {
                Group {
                    if model.quizActive { quizBanner } else { header }
                }
                .measureHeight(TopChromeHeightKey.self)
                .measureEdge(TopChromeKey.self, in: Self.space) { $0.maxY }
                Spacer(minLength: 0)
            }

            HStack(alignment: .top, spacing: 0) {
                if usesSidePanel, !model.quizActive {
                    systemsPanel
                        .frame(width: 232)
                        .padding(.leading, 16)
                        .padding(.top, 96)
                        .measureEdge(LeftChromeKey.self, in: Self.space) { $0.maxX }
                }
                Spacer(minLength: 0)
                viewpointBar
                    .padding(.trailing, 14)
                    .padding(.top, isCompact ? 96 : 150)
                    .measureEdge(RightChromeKey.self, in: Self.space) { $0.minX }
            }

            VStack(spacing: 10) {
                Spacer(minLength: 0)
                Group {
                    if model.quizActive {
                        quizFooter
                    } else {
                        VStack(spacing: 10) {
                            caption
                            if !usesSidePanel { compactSystemsButton }
                            explodePanel
                                .padding(.horizontal, 16)
                            hints
                        }
                    }
                }
                .measureHeight(BottomChromeHeightKey.self)
                .measureEdge(BottomChromeKey.self, in: Self.space) { $0.minY }
            }
            .padding(.bottom, 8)

            if model.selectedPart != nil, !model.quizActive {
                inspector
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        }
        .coordinateSpace(name: Self.space)
        .animation(.easeInOut(duration: 0.18), value: model.selectedPart)
        .onPreferenceChange(TopChromeKey.self) { kante in
            topChromeMaxY = kante
            applyLayout()
        }
        .onPreferenceChange(BottomChromeKey.self) { kante in
            bottomChromeMinY = kante
            applyLayout()
        }
        .onPreferenceChange(TopChromeHeightKey.self) { hoehe in
            topChromeHeight = hoehe
            applyLayout()
        }
        .onPreferenceChange(BottomChromeHeightKey.self) { hoehe in
            bottomChromeHeight = hoehe
            applyLayout()
        }
        .onPreferenceChange(LeftChromeKey.self) { edge in
            leftChromeMaxX = edge
            applyLayout()
        }
        .onPreferenceChange(RightChromeKey.self) { edge in
            rightChromeMinX = edge
            applyLayout()
        }
        .navigationTitle("Human Atlas")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showsSystems) {
            NavigationStack {
                systemsPanel
                    .padding()
                    .navigationTitle("Systeme")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $model.showsCredits) { creditsSheet }
    }

    /// Meldet der Szene die tatsächliche Größe: Seitenverhältnis für das
    /// Raster, freie Höhe und Versatz für die Kameraeinpassung.
    ///
    /// Kopfzeile und Bedienfelder liegen über der Szene. Ihre Höhe wird
    /// gemessen statt geschätzt, weil sie sich mit Gerät, Schriftgröße und
    /// Zustand ändert: auf dem iPhone kommt die Systemtaste dazu, im Quiz
    /// stehen andere Felder da, und bei großer Schrift wachsen alle mit.
    /// Vorher standen hier feste Anteile, bei denen die Beschriftung unter
    /// dem Modell auf den Unterschenkeln lag und die Füße abgeschnitten waren.
    private func applyLayout() {
        let height = sceneFrame.height
        guard sceneFrame.width > 1, height > 1 else { return }
        model.controller.setAspect(Float(sceneFrame.width / height))

        // Wie viel der Szene die Bedienfelder verdecken, aus beiden
        // Messungen der jeweils größere Wert (siehe oben). Die 8 Punkt sind
        // der Innenabstand unter den Bedienfeldern.
        let top = max(topChromeMaxY - sceneFrame.minY, topChromeHeight)
        let bottom = max(sceneFrame.maxY - bottomChromeMinY,
                         bottomChromeHeight + bottomInset + 8)
        let free = height - top - bottom

        // Solange noch nichts gemessen ist, bleibt es bei einer groben
        // Annahme, sonst füllt das Modell für einen Moment die ganze Fläche.
        guard top > 0, bottom > 0, free > height * 0.25 else {
            model.controller.fit(usableHeightFraction: isCompact ? 0.62 : 0.84,
                                 verticalShift: isCompact ? 0.11 : 0.02)
            return
        }

        // Luft zu den Feldern, damit Kopf und Füße sie nicht berühren. Der
        // Wert ist am Gerät eingestellt: die Höhe des Modells stammt aus den
        // Rohdaten und fällt etwas größer aus als das, was man sieht.
        let fraction = Float(free / height) * 0.90
        // Der freie Streifen liegt nicht mittig; um diesen Anteil der
        // Ansichtshöhe muss das Modell nach oben.
        let bandCenter = top + free / 2
        let shift = Float((height / 2 - bandCenter) / height)

        // Waagerecht: auf dem iPad nimmt die Systemliste die linke Hälfte der
        // Szene ein, der Körper stand deshalb zur Hälfte darunter. Er rückt
        // jetzt in den freien Streifen rechts davon. Ohne Systemliste
        // (iPhone, Quiz) bleibt links alles frei und es verschiebt sich
        // praktisch nichts.
        let width = sceneFrame.width
        let left = max(0, leftChromeMaxX - sceneFrame.minX)
        let right = max(0, sceneFrame.maxX - rightChromeMinX)
        let freeWidth = width - left - right
        var sideShift: Float = 0
        if freeWidth > width * 0.3 {
            let bandCenterX = left + freeWidth / 2
            sideShift = Float((bandCenterX - width / 2) / width)
        }

        model.controller.fit(usableHeightFraction: fraction,
                             verticalShift: shift,
                             horizontalShift: sideShift)
    }

    // MARK: - Kopfbereich

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                Text("INTERAKTIVE ANATOMIE")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(1.1)
                    .foregroundStyle(theme.secondaryText)
                Text("\(model.partCount) Modellteile · \(model.sourceName)")
                    .font(.caption2)
                    .foregroundStyle(theme.secondaryText)
            }
            Spacer()
            sexPicker
            searchField
            Button {
                if let view = model.sceneView { model.startQuiz(in: view) }
            } label: {
                Image(systemName: "questionmark.circle")
                    .font(.system(size: 18))
            }
            .buttonStyle(.plain)
            .foregroundStyle(theme.secondaryText)
            Button {
                model.showsCredits = true
            } label: {
                Image(systemName: "info.circle")
                    .font(.system(size: 18))
            }
            .buttonStyle(.plain)
            .foregroundStyle(theme.secondaryText)
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    /// Wechsel zwischen den beiden Referenzmodellen.
    private var sexPicker: some View {
        HStack(spacing: 0) {
            ForEach(AtlasSex.allCases) { option in
                Button {
                    model.switchSex(to: option)
                } label: {
                    Text(option == .male ? "♂" : "♀")
                        .font(.system(size: 15, weight: .semibold))
                        .frame(width: 30, height: 28)
                        .background(model.sex == option ? theme.accent : .clear,
                                    in: RoundedRectangle(cornerRadius: 7, style: .continuous))
                        .foregroundStyle(model.sex == option ? Color.white : theme.primaryText)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(option.label)
            }
        }
        .padding(2)
        .cardBackground()
    }

    private var searchField: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .font(.caption)
                    .foregroundStyle(theme.secondaryText)
                TextField("Struktur suchen", text: $model.searchText)
                    .textFieldStyle(.plain)
                    .font(.footnote)
                    .autocorrectionDisabled()
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .frame(width: isCompact ? 150 : 230)
            .cardBackground()

            let hits = AtlasStore.shared.search(model.searchText)
            if !hits.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(hits) { concept in
                            Button {
                                model.select(concept: concept)
                            } label: {
                                Text(concept.name)
                                    .font(.caption)
                                    .foregroundStyle(theme.primaryText)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 7)
                            }
                            .buttonStyle(.plain)
                            Divider().opacity(0.25)
                        }
                    }
                }
                .frame(width: isCompact ? 150 : 230)
                .frame(maxHeight: 260)
                .cardBackground()
                .padding(.top, 4)
            }
        }
    }

    // MARK: - Systeme

    private var systemsPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Systeme").font(.subheadline.weight(.semibold))
                Spacer()
                Text("\(model.availableSystems.count)")
                    .font(.caption2)
                    .foregroundStyle(theme.secondaryText)
            }

            Picker("Filter", selection: $model.filter) {
                ForEach(AtlasSystem.Filter.allCases) { filter in
                    Text(filter.rawValue).tag(filter)
                }
            }
            .pickerStyle(.segmented)

            ScrollView {
                VStack(spacing: 4) {
                    ForEach(model.availableSystems.filter { model.filter.matches($0) }) { system in
                        Toggle(isOn: Binding(
                            get: { model.visibleSystems.contains(system.id) },
                            set: { _ in model.toggle(system) })
                        ) {
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(system.color)
                                    .frame(width: 8, height: 8)
                                Text(system.name)
                                    .font(.caption)
                                    .lineLimit(1)
                            }
                        }
                        .toggleStyle(.switch)
                        .controlSize(.mini)
                    }
                }
            }
            .frame(maxHeight: isCompact ? .infinity : 330)

            Divider().opacity(0.3)
            HStack {
                Text("\(model.visiblePieceCount) Teile sichtbar")
                    .font(.caption2)
                    .foregroundStyle(theme.secondaryText)
                Spacer()
                Button("Alle aus") { model.hideAll() }
                    .font(.caption2)
                    .buttonStyle(.plain)
                    .foregroundStyle(theme.accent)
            }
        }
        .padding(14)
        .cardBackground()
    }

    private var compactSystemsButton: some View {
        Button {
            showsSystems = true
        } label: {
            Label("Systeme (\(model.visibleSystems.count)/\(model.availableSystems.count))",
                  systemImage: "slider.horizontal.3")
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .cardBackground()
        }
        .buttonStyle(.plain)
        .foregroundStyle(theme.primaryText)
    }

    // MARK: - Blickrichtung

    private var viewpointBar: some View {
        VStack(spacing: 2) {
            ForEach(AtlasViewpoint.allCases) { viewpoint in
                // Liegen die Teile flach im Raster, bleibt nur die Frontalansicht.
                let locked = model.isFlattened && viewpoint != .front
                Button {
                    model.apply(viewpoint: viewpoint)
                } label: {
                    Text(viewpoint.rawValue)
                        .font(.system(size: 13, weight: .medium))
                        .frame(width: 34, height: 32)
                        .background(model.viewpoint == viewpoint ? theme.accent : .clear,
                                    in: RoundedRectangle(cornerRadius: 7, style: .continuous))
                        .foregroundStyle(model.viewpoint == viewpoint ? Color.white : theme.primaryText)
                }
                .buttonStyle(.plain)
                .disabled(locked)
                .opacity(locked ? 0.35 : 1)
            }

            Divider().frame(width: 22).opacity(0.3).padding(.vertical, 3)

            Button {
                model.setRotating(!model.isRotating)
            } label: {
                Image(systemName: model.isRotating ? "pause.fill" : "arrow.clockwise")
                    .font(.system(size: 12))
                    .frame(width: 34, height: 30)
            }
            .buttonStyle(.plain)
            .foregroundStyle(model.isRotating ? theme.accent : theme.secondaryText)
            .disabled(!model.canRotate)
            .opacity(model.canRotate ? 1 : 0.35)

            Button {
                model.resetAll()
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .font(.system(size: 12))
                    .frame(width: 34, height: 30)
            }
            .buttonStyle(.plain)
            .foregroundStyle(theme.secondaryText)
        }
        .padding(.vertical, 5)
        .cardBackground()
    }

    // MARK: - Explosionsansicht

    private var explodePanel: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Anatomie auseinanderziehen")
                    .font(.caption.weight(.medium))
                Spacer()
                Text("\(Int(model.explode * 100)) %")
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(theme.secondaryText)
                Button {
                    model.setExplode(0)
                } label: {
                    Image(systemName: "arrow.counterclockwise").font(.caption2)
                }
                .buttonStyle(.plain)
                .foregroundStyle(theme.secondaryText)
            }

            Slider(value: Binding(get: { model.explode },
                                  set: { model.setExplode($0) }), in: 0...1)

            HStack {
                Text("Zusammengesetzt")
                Spacer()
                Text("Jedes Teil")
            }
            .font(.system(size: 9))
            .foregroundStyle(theme.secondaryText)
        }
        .padding(12)
        .cardBackground()
    }

    /// Die Zeile unter dem Modell, die den Zustand benennt.
    private var caption: some View {
        HStack(spacing: 8) {
            Rectangle().fill(theme.secondaryText.opacity(0.3)).frame(width: 22, height: 1)
            Text(model.caption)
                .font(.system(size: 9, weight: .medium))
                .tracking(0.9)
                .foregroundStyle(theme.secondaryText)
                .lineLimit(1)
            Rectangle().fill(theme.secondaryText.opacity(0.3)).frame(width: 22, height: 1)
        }
    }

    private var hints: some View {
        // Sobald die Teile flach liegen, verschiebt Ziehen den Ausschnitt.
        Text("\(model.isFlattened ? "Ziehen zum Verschieben" : "Ziehen zum Drehen") · Zwei Finger zum Zoomen · Tippen zum Untersuchen")
            .font(.system(size: 9))
            .foregroundStyle(theme.secondaryText)
    }

    // MARK: - Inspektor

    private var inspector: some View {
        HStack {
            Spacer(minLength: 0)
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        if let system = model.selectedSystem {
                            Rectangle()
                                .fill(system.color)
                                .frame(width: 26, height: 3)
                            Text(system.name)
                                .font(.system(size: 9, weight: .semibold))
                                .tracking(0.8)
                                .foregroundStyle(theme.secondaryText)
                        }
                    }
                    Spacer()
                    Button {
                        model.clearSelection()
                    } label: {
                        Image(systemName: "xmark").font(.caption)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(theme.secondaryText)
                }

                Text((model.selectedConcept?.name ?? model.selectedPart?.name ?? "").capitalizedStructureName)
                    .font(.title3.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)

                if let explanation = structureExplanation {
                    Text(explanation)
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Erklärung zur Struktur")
                        .font(.system(size: 9))
                        .foregroundStyle(theme.secondaryText.opacity(0.75))
                } else if let system = model.selectedSystem {
                    Text(system.description(for: model.sex))
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Systemüberblick · Struktur aus der Quellanatomie")
                        .font(.system(size: 9))
                        .foregroundStyle(theme.secondaryText.opacity(0.75))
                }

                Divider().opacity(0.3)

                HStack(alignment: .top, spacing: 22) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Atlas-Referenz")
                            .font(.system(size: 9))
                            .foregroundStyle(theme.secondaryText)
                        Text(model.selectedPart?.conceptId ?? "—")
                            .font(.caption.monospaced())
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Ausgewählte Teile")
                            .font(.system(size: 9))
                            .foregroundStyle(theme.secondaryText)
                        Text("\(model.selectedPartIds.count)")
                            .font(.caption.monospacedDigit())
                    }
                }

                Button {
                    model.toggleIsolation()
                } label: {
                    HStack {
                        Image(systemName: model.isolated ? "eye" : "viewfinder")
                        Text(model.isolated ? "Umgebende Anatomie zeigen" : "Struktur isolieren")
                        Spacer()
                        Image(systemName: "chevron.right").font(.caption2)
                    }
                    .font(.footnote.weight(.medium))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity)
                    .background(theme.accent, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                    .foregroundStyle(.white)
                }
                .buttonStyle(.plain)

                Button("Auswahl aufheben") { model.clearSelection() }
                    .font(.caption)
                    .buttonStyle(.plain)
                    .foregroundStyle(theme.secondaryText)
                    .frame(maxWidth: .infinity)
            }
            .padding(16)
            .frame(width: 268)
            .cardBackground()
            .padding(.trailing, isCompact ? 12 : 56)
        }
        .padding(.top, isCompact ? 150 : 96)
        .frame(maxHeight: .infinity, alignment: .top)
    }

    // MARK: - Quiz

    private var quizBanner: some View {
        VStack(spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("FINDE DIE STRUKTUR")
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(1.1)
                        .foregroundStyle(theme.secondaryText)
                    Text(model.quizPrompt.capitalizedStructureName)
                        .font(.headline)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(model.quizCorrect)/\(model.quizAsked)")
                        .font(.subheadline.weight(.semibold).monospacedDigit())
                    Text("richtig")
                        .font(.system(size: 9))
                        .foregroundStyle(theme.secondaryText)
                }
                Button {
                    model.endQuiz()
                } label: {
                    Image(systemName: "xmark").font(.caption)
                }
                .buttonStyle(.plain)
                .foregroundStyle(theme.secondaryText)
            }

            if let result = model.quizResult {
                HStack(spacing: 6) {
                    switch result {
                    case .correct:
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                        Text("Richtig")
                    case let .wrong(name):
                        Image(systemName: "xmark.circle.fill").foregroundStyle(.orange)
                        Text("Das war \(name.capitalizedStructureName). Die gesuchte Struktur ist hervorgehoben.")
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                .font(.caption)
            }
        }
        .padding(12)
        .cardBackground()
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    private var quizFooter: some View {
        VStack(spacing: 8) {
            if model.quizResult != nil {
                Button {
                    if let view = model.sceneView { model.nextQuestion(in: view) }
                } label: {
                    Text("Nächste Frage")
                        .font(.subheadline.weight(.medium))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 11)
                        .frame(maxWidth: .infinity)
                        .background(theme.accent, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 16)
            } else {
                Button("Überspringen") {
                    if let view = model.sceneView { model.nextQuestion(in: view) }
                }
                .font(.caption)
                .buttonStyle(.plain)
                .foregroundStyle(theme.secondaryText)
            }

            Text("Gefragt wird nur nach Strukturen, die von hier aus zu sehen sind. Drehen ändert die Auswahl.")
                .font(.system(size: 9))
                .foregroundStyle(theme.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
        }
    }

    /// Erklärung zur ausgewählten Struktur, falls es eine gibt.
    private var structureExplanation: String? {
        guard let name = model.selectedConcept?.name ?? model.selectedPart?.name else { return nil }
        return AtlasExplanations.forStructure(named: name)
    }

    // MARK: - Quellenangabe

    private var creditsSheet: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text("QUELLE & UMFANG")
                        .font(.system(size: 9, weight: .semibold))
                        .tracking(1)
                        .foregroundStyle(theme.secondaryText)
                    Text("Ein Körper, aufgeschlüsselt")
                        .font(.title2.weight(.semibold))
                    Text(model.scopeText)
                        .font(.subheadline)
                        .fixedSize(horizontal: false, vertical: true)

                    Text("\(model.partCount) einzelne Netze und \(model.conceptCount) benannte Strukturen.")
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                    Text("Die Referenz enthält nicht jede Struktur und nicht jede anatomische Variante. Eine benannte Struktur kann aus mehreren Teilen bestehen. Die Geometrie ist für die Darstellung vereinfacht. Das ist eine anatomische Referenz, kein diagnostisches Werkzeug.")
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Divider()

                    Text("Quelle")
                        .font(.subheadline.weight(.semibold))
                    Text("Männliches Modell: BodyParts3D, © The Database Center for Life Science. Die Herausgeber geben CC Attribution-ShareAlike 2.1 Japan an.")
                        .font(.footnote)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Weibliches Modell: Human Reference Atlas united-female v1.5 sowie die Referenzorgane Becken, Brustbein und Manubrium, lizenziert unter CC Attribution 4.0 International.")
                        .font(.footnote)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("Geladen: \(model.versionText)")
                        .font(.caption2)
                        .foregroundStyle(theme.secondaryText)
                    Link("Originalgeometrie BodyParts3D",
                         destination: URL(string: "https://lifesciencedb.jp/bp3d/")!)
                        .font(.footnote)
                    Link("Human Reference Atlas",
                         destination: URL(string: "https://humanatlas.io/")!)
                        .font(.footnote)
                }
                .padding()
            }
            .background(theme.pageBackground)
            .navigationTitle("Quelle & Umfang")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fertig") { model.showsCredits = false }
                }
            }
        }
    }
}

extension String {
    /// Strukturnamen erscheinen in der Vorlage mit großen Anfangsbuchstaben.
    var capitalizedStructureName: String {
        split(separator: " ")
            .map { word -> String in
                guard let first = word.first else { return String(word) }
                return first.uppercased() + word.dropFirst()
            }
            .joined(separator: " ")
    }
}

// MARK: - Höhe der Bedienfelder messen

/// Kopfzeile und Bedienfelder liegen über der Szene. Damit die Kamera weiß,
/// wie viel Fläche dem Modell wirklich bleibt, melden sie ihre gemessene Höhe
/// nach oben, statt dass `applyLayout` sie schätzt.
private struct TopChromeKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

private struct BottomChromeKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

private extension View {
    /// Meldet die Höhe dieser Ansicht nach oben, damit `applyLayout` sie von
    /// der Höhe der Szene abziehen kann.
    func measureHeight<K: PreferenceKey>(_ key: K.Type) -> some View where K.Value == CGFloat {
        background {
            GeometryReader { geo in
                Color.clear.preference(key: key, value: geo.size.height)
            }
        }
    }

    /// Meldet eine Kante dieser Ansicht im angegebenen Koordinatenraum nach
    /// oben. Wird für die waagerechte Einpassung gebraucht, wo Szene und
    /// Bedienfelder denselben Ursprung haben.
    func measureEdge<K: PreferenceKey>(_ key: K.Type,
                                       in space: String,
                                       _ edge: @escaping (CGRect) -> CGFloat) -> some View where K.Value == CGFloat {
        background {
            GeometryReader { geo in
                Color.clear.preference(key: key, value: edge(geo.frame(in: .named(space))))
            }
        }
    }
}

private struct LeftChromeKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

private struct RightChromeKey: PreferenceKey {
    /// Kein Wert heißt: rechts steht nichts im Weg.
    static let defaultValue: CGFloat = .greatestFiniteMagnitude
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = min(value, nextValue())
    }
}

private struct TopChromeHeightKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}

private struct BottomChromeHeightKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = max(value, nextValue())
    }
}
