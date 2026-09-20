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

    private var isCompact: Bool { sizeClass == .compact }

    var body: some View {
        ZStack {
            theme.pageBackground.ignoresSafeArea()

            AtlasSceneView(model: model)
                .ignoresSafeArea(edges: .bottom)
                .onAppear {
                    // Auf dem iPhone liegen Kopfzeile, Systemtaste und Regler
                    // über der Szene; dort bleibt nur gut die Hälfte frei.
                    model.controller.fit(usableHeightFraction: isCompact ? 0.62 : 0.84,
                                         verticalShift: isCompact ? 0.11 : 0.02)
                }

            VStack(spacing: 0) {
                header
                Spacer(minLength: 0)
            }

            HStack(alignment: .top, spacing: 0) {
                if !isCompact {
                    systemsPanel
                        .frame(width: 232)
                        .padding(.leading, 16)
                        .padding(.top, 96)
                }
                Spacer(minLength: 0)
                viewpointBar
                    .padding(.trailing, 14)
                    .padding(.top, isCompact ? 96 : 150)
            }

            VStack(spacing: 10) {
                Spacer(minLength: 0)
                caption
                if isCompact { compactSystemsButton }
                explodePanel
                    .padding(.horizontal, 16)
                hints
            }
            .padding(.bottom, 8)

            if model.selectedPart != nil {
                inspector
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.18), value: model.selectedPart)
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

    // MARK: - Kopfbereich

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                Text("INTERAKTIVE ANATOMIE")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(1.1)
                    .foregroundStyle(theme.secondaryText)
                Text("\(AtlasStore.shared.parts.count) Modellteile · BodyParts3D")
                    .font(.caption2)
                    .foregroundStyle(theme.secondaryText)
            }
            Spacer()
            searchField
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
                Text("\(AtlasSystem.all.count)")
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
                    ForEach(AtlasSystem.all.filter { model.filter.matches($0) }) { system in
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
            Label("Systeme (\(model.visibleSystems.count)/\(AtlasSystem.all.count))",
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

                if let system = model.selectedSystem {
                    Text(system.description)
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
                    Text("Erwachsene männliche Referenzanatomie aus BodyParts3D.")
                        .font(.subheadline)

                    Text("\(AtlasStore.shared.parts.count) einzelne Netze und \(AtlasStore.shared.concepts.count) benannte Strukturen.")
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                    Text("Die Referenz enthält nicht jede Struktur und nicht jede anatomische Variante. Eine benannte Struktur kann aus mehreren Teilen bestehen. Die Geometrie ist für die Darstellung vereinfacht. Das ist eine anatomische Referenz, kein diagnostisches Werkzeug.")
                        .font(.footnote)
                        .foregroundStyle(theme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Divider()

                    Text("Quelle")
                        .font(.subheadline.weight(.semibold))
                    Text("BodyParts3D, © The Database Center for Life Science, lizenziert unter CC Attribution 4.0 International.")
                        .font(.footnote)
                        .fixedSize(horizontal: false, vertical: true)
                    Link("Lizenz des Datensatzes",
                         destination: URL(string: "https://creativecommons.org/licenses/by/4.0/")!)
                        .font(.footnote)
                    Link("Originalgeometrie und Metadaten",
                         destination: URL(string: "https://lifesciencedb.jp/bp3d/")!)
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
