//
//  MainView.swift
//  Search Focus
//
//  Created by Ty Irvine on 2023-11-19.
//

import SwiftUI

struct MainView: View {
	var body: some View {
		VStack {
			Spacer()
			HStack {
				Spacer()
				Text("")
				Spacer()
			}
			Spacer()
		}
		.background(FrostedMaterial().ignoresSafeArea())
		.frame(width: 200, height: 200, alignment: .center)
	}
}

struct FrostedMaterial: NSViewRepresentable {
	func makeNSView(context: Context) -> NSVisualEffectView {
		let effectView = NSVisualEffectView()
		effectView.material = .popover
		effectView.state = .active
		return effectView
	}

	func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}
