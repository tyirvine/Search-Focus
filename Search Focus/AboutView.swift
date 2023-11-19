//
//  AboutView.swift
//  Informant
//
//  Created by Ty Irvine on 2022-02-21.
//

import SwiftUI

struct AboutView: View {
	
	var version: String
	
	init() {
		if let version = AppDelegate.version() {
			self.version = version
		} else {
			self.version = "--"
		}
	}
	
	var body: some View {
			
		// Used to apply a global padding
		VStack(spacing: 2) {
			
			// Top header
			VStack(spacing: 0) {
				
				// Image
				Image(nsImage: NSImage(named: "AppIcon") ?? NSImage())
					.resizable()
					.frame(width: 130, height: 130)
					.offset(x: 0, y: 5)
				
				VStack(spacing: 4) {
					
					// Title
					Text("Search Focus")
						.font(.system(size: 26, weight: .medium))
						.padding(.bottom, 2)
						.padding(.top, 4)
						
					// Version & Copyright
					HStack(spacing: 11) {
						Text("Version \(version)")
						Text("© Ty Irvine")
					}
					.opacity(0.5)
				}
			}
				
			Spacer()
				.frame(height: 12)
				
			// Middle stack
			VStack(alignment: .leading, spacing: 2) {
					
				// Support
				ComponentsPanelLabelButton {
					LinkHelper.openLink(link: .linkDonate)
				} content: {
					ComponentsWindowLargeLink(label: "Donate", icon: "heart", iconSize: 19.5)
				}
				
				// Feedback
				ComponentsPanelLabelButton {
					LinkHelper.openLink(link: .linkFeedback)
				} content: {
					ComponentsWindowLargeLink(label: "Feedback", icon: "bubble.left.and.exclamationmark.bubble.right", iconSize: 19)
				}
				
				// Privacy
				ComponentsPanelLabelButton {
					LinkHelper.openLink(link: .linkPrivacyPolicy)
				} content: {
					ComponentsWindowLargeLink(label: "Privacy policy", icon: "rectangle.3.group.bubble.left", iconSize: 19)
				}
						
				// Divider
				Divider()
					.padding([.vertical], 10)

				// Releases
				ComponentsPanelLabelButton {
					LinkHelper.openLink(link: .linkReleases)
				} content: {
					ComponentsWindowLargeLink(label: "Releases", icon: "laptopcomputer.and.arrow.down")
				}
			}
		}
		.padding([.horizontal], 20)
		.frame(width: 280, height: 410, alignment: .center)
	}
}
