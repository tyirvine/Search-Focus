//
//  MainView.swift
//  Search Focus
//
//  Created by Ty Irvine on 2023-11-19.
//

import SwiftUI

struct MainView: View {
	var body: some View {
		AboutView()
			.background(Material(material: .sidebar).ignoresSafeArea())
	}
}

struct Material: NSViewRepresentable {

	let material: NSVisualEffectView.Material

	func makeNSView(context: Context) -> NSVisualEffectView {
		let effectView = NSVisualEffectView()
		effectView.material = material
		effectView.state = .active
		return effectView
	}

	func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}
