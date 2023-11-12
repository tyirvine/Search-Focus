//
//  ViewController.swift
//  Search Focus
//
//  Created by Ty Irvine on 2023-11-11.
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "tyirvine.Search-Focus.Extension"

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

	@IBOutlet var webView: WKWebView!

	override func viewDidLoad() {
		super.viewDidLoad()

		self.webView.navigationDelegate = self

		self.webView.configuration.userContentController.add(self, name: "controller")

		self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
	}

	func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
		SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
			guard let state = state, error == nil else {
				// Insert code to inform the user that something went wrong.
				return
			}

			DispatchQueue.main.async {
				if #available(macOS 13, *) {
					webView.evaluateJavaScript("show(\(state.isEnabled), true)")
				} else {
					webView.evaluateJavaScript("show(\(state.isEnabled), false)")
				}
			}
		}
	}

	func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
		if message.body as! String != "open-preferences" {
			return
		}

		SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in
			DispatchQueue.main.async {
				NSApplication.shared.terminate(nil)
			}
		}
	}
}
