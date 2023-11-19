//
//  Components.swift
//  Informant
//
//  Created by Ty Irvine on 2022-03-02.
//

import Foundation
import SwiftUI

/// Settings window button
struct ComponentsWindowLargeLink: View {

	let label: String
	let icon: String
	let iconSize: CGFloat
	let color: Color
	let usesSFSymbols: Bool

	internal init(label: String, icon: String, iconSize: CGFloat = 18, color: Color = .blue, usesSFSymbols: Bool = true) {
		self.label = label
		self.icon = icon
		self.iconSize = iconSize
		self.color = color
		self.usesSFSymbols = usesSFSymbols
	}

	var body: some View {
		HStack(alignment: .center) {

			if usesSFSymbols {
				Image(systemName: icon)
					.font(.system(size: iconSize, weight: .semibold))
					.frame(width: 24, height: 20)
			} else {
				Image(icon)
					.resizable()
					.frame(width: 24, height: 24)
			}

			Text(label)
				.font(.system(size: 20, weight: .medium))
		}
		.foregroundColor(color)
	}
}

/// Shows a label on hover behind the content. When clicked an action is performed. Typically this is used with text objects.
struct ComponentsPanelLabelButton<Content: View>: View {

	let content: Content
	var action: () -> Void

	internal init(action: @escaping () -> Void, @ViewBuilder content: @escaping () -> Content) {
		self.content = content()
		self.action = action
	}

	@State private var isHovering = false

	var body: some View {
		Button {
			action()
		} label: {
			ZStack(alignment: .leading) {

				// Backing
				Color.blue
					.cornerRadius(8.0)
					.opacity(isHovering ? 0.1 : 0)
					.animation(.easeInOut, value: 0.2)

				// Label
				content
					.padding([.horizontal], 8)
					.padding([.vertical], 6)
			}
		}
		.fixedSize()
		.buttonStyle(PlainButtonStyle())
		.onHover { hovering in
			isHovering = hovering
		}
	}
}
