//
//  LinkHelper.swift
//  Informant
//
//  Created by Ty Irvine on 2021-08-08.
//

import Foundation
import SwiftUI

class LinkHelper {

	/// Opens a link in the default browser.
	static func openLink(link: String) {
		if let url = URL(string: link) {
			NSWorkspace.shared.open(url)
		}
	}

	/// Opens a file in preview.
	static func openPDF(link: String) {
		if let url = Bundle.main.url(forResource: link, withExtension: "pdf") {
			NSWorkspace.shared.open(url)
		}
	}
}

extension String {

	static let linkDonate = "https://github.com/sponsors/tyirvine"

	static let linkPrivacyPolicy = "https://github.com/tyirvine/Search-Focus#privacy-policy"

	static let linkFeedback = "https://github.com/tyirvine/Search-Focus/issues/new/choose"

	static let linkReleases = "https://github.com/tyirvine/Search-Focus/releases"
}
