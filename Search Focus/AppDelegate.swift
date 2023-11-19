//
//  ApplicationDelegate.swift
//  Search Focus
//
//  Created by Ty Irvine on 2023-11-19.
//

import Cocoa
import SwiftUI

@main
class AppDelegate: NSObject, NSApplicationDelegate {

	func applicationDidFinishLaunching(_ aNotification: Notification) {

		// Create main window.
		let window = NSWindow(
			contentRect: NSRect(x: 0, y: 0, width: 500, height: 500),
			styleMask: [.closable, .unifiedTitleAndToolbar, .fullSizeContentView, .titled],
			backing: .buffered,
			defer: false
		)

		// Apply styles to window.
		window.titlebarAppearsTransparent = true

		// Hide title buttons
		window.standardWindowButton(.miniaturizeButton)?.isHidden = true
		window.standardWindowButton(.zoomButton)?.isHidden = true

		// Behaviours
		window.isMovableByWindowBackground = true

		// Assign main view to window.
		window.contentViewController = NSHostingController(rootView: MainView())

		// Open the window.
		window.center()
		window.makeKeyAndOrderFront(nil)
	}
}
